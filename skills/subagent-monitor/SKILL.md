# Subagent Monitor Skill

Monitors active subagent sessions and reports progress during heartbeats.

## When to Use

This skill activates automatically when subagents are spawned. During heartbeats (every ~30 sec), check subagent status and report:
- **New completions** - Subagent just finished
- **Progress updates** - For long-running tasks (>5 min)
- **Active count** - How many subagents are running

## How It Works

1. **On Subagent Spawn:** Note session key and start time in heartbeat-state.json
2. **During Heartbeat:** Check sessions via `sessions_list` or `cat ~/.clawdbot/agents/main/sessions/sessions.json`
3. **Report Changes:**
   - Completed: "✅ {label} completed ({tokens}k tokens)"
   - Aborted: "🛑 {label} aborted"
   - Long-running (>5min): "⏰ {label} running for >5 min"
   - Multiple active: "🤖 {count} subagents active"

## Implementation

```bash
# Check subagent status
jq '.["agent:main:subagent:ID"]' ~/.clawdbot/agents/main/sessions/sessions.json

# Track in heartbeat-state.json
```

## Example Output

```
✅ Subagent completed: Security audit - leaked clawd files (87.5k tokens)
⏰ Subagent running for >5 min: Improve Ouroboros skill
🤖 Multiple subagents active: 3 running
```

## Integration with Heartbeats

Add to HEARTBEAT.md subagent monitoring section:

```bash
# Check for new completions every heartbeat
./scripts/check-subagent-progress.sh
```

This keeps Jace informed of background work without interrupting flow.
