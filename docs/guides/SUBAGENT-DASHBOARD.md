# Subagent Dashboard

Track and monitor Clawdbot subagent sessions.

## Quick Start

```bash
./scripts/subagent-dashboard.sh
```

## Output Fields

| Field    | Description                                          |
|----------|------------------------------------------------------|
| Label    | Session label (task identifier)                      |
| Status   | ✅ done, ⏳ pending, 🛑 aborted                      |
| Tokens   | Total token usage (input + output), displayed as "Xk"|
| Model    | AI model used for the session                        |

## Example Output

```
🤖 Subagent Dashboard
=====================================
whatsapp-check      | ✅ done      | 21.3k     | claude-opus-4-5-thinking
subagent-dashboard-v| ⏳ pending   | --        | --

Updated: 2026-01-25 13:40:09
```

## Status Meanings

- **✅ done** - Session completed (has token usage recorded)
- **⏳ pending** - Session in progress or not yet started
- **🛑 aborted** - Session was cancelled/aborted

## Data Source

Reads from: `~/.clawdbot/agents/main/sessions/sessions.json`

## Heartbeat Integration

Add to `HEARTBEAT.md` to check subagents periodically:

```markdown
## Subagent Status Check
- [ ] Run `./scripts/subagent-dashboard.sh` 
- [ ] Report any stuck subagents (pending for >1 hour)
- [ ] Note high token usage (>50k)
```

Example heartbeat task:

```bash
# Check for stuck subagents
if ./scripts/subagent-dashboard.sh | grep -q "⏳ pending"; then
  echo "⚠️  Found pending subagents - check if they're stuck"
fi
```

## Requirements

- `bash`
- `jq` (JSON processor)

## Implementation

The script filters sessions.json for entries with keys containing "subagent", extracts relevant fields, and displays them in a formatted table. Sessions are sorted by last update time (most recent first).
