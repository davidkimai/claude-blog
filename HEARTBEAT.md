# HEARTBEAT.md

## Context Compression (every ~30 min)
Run: `./scripts/summarize-context.sh`
Checks conversation turn count and triggers summarization when needed (every 5 turns).

## Auth & Model Monitoring (every ~30 min)
Run: `node ./scripts/auth-status.js --check`
Tracks auth profile switching, cooldowns, and error rates. Notifies on:
- **Model switches**: When active auth profile changes
- **New cooldowns**: When profiles enter cooldown state
- **Error rate increases**: When error count rises (approaching limits)

## Subagent Monitoring (every ~30 min)
**Goal:** Track subagent lifecycle events and notify on meaningful milestones.

### How It Works
1. Read current subagent state from sessions file: `~/.clawdbot/agents/main/sessions/sessions.json`
2. Compare against last known state stored in: `memory/heartbeat-state.json`
3. Announce ONLY when something meaningful changed
4. Update state file for next comparison

### Data to Extract
For each subagent session (key contains "subagent"):
- **label**: Task description
- **status**: Derive from session data
  - `pending` if no totalTokens and not aborted
  - `completed` if totalTokens exists
  - `aborted` if abortedLastRun is true
- **sessionId**: The session key (for tracking identity)
- **updatedAt**: Last update timestamp (Unix time)
- **tokens**: totalTokens value

### State Storage Format
`memory/heartbeat-state.json`:
```json
{
  "lastCheck": 1703275200,
  "subagents": {
    "agent:main:subagent:abc123": {
      "label": "task-name",
      "status": "pending",
      "updatedAt": 1703275100,
      "tokens": 0,
      "firstSeenAt": 1703275000,
      "notifiedLongRunning": false
    }
  }
}
```

### Notification Rules

**✅ NOTIFY when:**

1. **Subagent Completed** (wasn't complete in last check)
   - Previous: `pending` → Current: `completed` or `aborted`
   - Message: "✅ Subagent completed: {label} ({tokens}k tokens)"
   - Or: "🛑 Subagent aborted: {label}"

2. **Long-Running Subagent** (running >5 minutes)
   - Status is `pending` AND `(now - firstSeenAt) > 300` seconds
   - Only notify ONCE per subagent (track with `notifiedLongRunning`)
   - Message: "⏰ Subagent running for >5 min: {label}"

3. **Multiple Active Subagents** (>1 pending at same time)
   - Count pending subagents
   - If count > 1 AND different from last check's count
   - Message: "🤖 Multiple subagents active: {count} running"

**🔇 STAY QUIET (reply HEARTBEAT_OK) when:**
- No subagents exist
- All subagents in same state as last check
- Subagent already completed (no change)
- Already notified about a long-running subagent
- Multiple active count unchanged since last check

### Implementation Steps

```bash
# 1. Read current sessions
SESSIONS=$(cat ~/.clawdbot/agents/main/sessions/sessions.json)

# 2. Load previous state (create empty if not exists)
if [ ! -f memory/heartbeat-state.json ]; then
  echo '{"lastCheck": 0, "subagents": {}}' > memory/heartbeat-state.json
fi
PREV_STATE=$(cat memory/heartbeat-state.json)

# 3. Extract current subagents using jq
CURRENT_SUBAGENTS=$(echo "$SESSIONS" | jq 'to_entries | map(select(.key | contains("subagent"))) | ...')

# 4. Compare and detect changes (implement diffing logic)
# 5. Build notifications array
# 6. Update state file with current state
# 7. Return notifications or HEARTBEAT_OK
```

### Testing Logic
- If this is first run (empty state), just record current state silently
- If subagent completed, show notification with label and token count
- If subagent pending >5 min and not yet notified, alert once
- If multiple active and count changed, mention it
- Track `notifiedLongRunning` per subagent to avoid spam
