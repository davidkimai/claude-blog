# Clawdbot Commands Cheat Sheet

**Quick reference for daily operations**

---

## Daily Operations

```bash
# Morning check
moltbot status
moltbot health

# Check Gateway
moltbot gateway status

# View logs
moltbot logs --tail
```

---

## Configuration

```bash
# View current config
moltbot gateway call config.get --params '{}' | jq

# Quick config set
moltbot config set agents.defaults.workspace ~/clawd

# Edit config manually
vim ~/.clawdbot/moltbot.json

# Apply changes (validates + restarts)
moltbot gateway call config.apply --params '{
  "raw": "$(cat ~/.clawdbot/moltbot.json | tr -d '\n')",
  "baseHash": "<hash>"
}'
```

---

## Channel Management

```bash
# Login to channels (WhatsApp QR)
moltbot channels login

# List channels
moltbot channels list

# Logout
moltbot channels logout

# Pairing approvals
moltbot pairing list whatsapp
moltbot pairing approve whatsapp <code>
```

---

## Debugging

```bash
# Doctor (diagnose)
moltbot doctor

# Auto-fix
moltbot doctor --fix

# Deep health
moltbot status --deep
moltbot health

# Security audit
moltbot security audit --deep
```

---

## Messaging

```bash
# Send DM
moltbot message send --target +15555550123 --message "Hello"

# Send to group
moltbot message send --target "GROUP_ID@g.us" --message "Group message"

# Broadcast
moltbot message broadcast --message "Hello all"
```

---

## Skills

```bash
# List skills
moltbot skills list

# Install skill
moltbot skills add https://github.com/user/skill

# Configure skill
moltbot skills config <skill-id>

# Update skill
moltbot skills update <skill-id>
```

---

## Service Management

```bash
# Service status
moltbot service status

# Start/Stop service
moltbot service start
moltbot service stop

# Install daemon
moltbot service install
```

---

## Gateway

```bash
# Start Gateway
moltbot gateway --port 18789 --verbose

# With remote access
moltbot gateway --bind tailnet --token <token>

# Check running
moltbot gateway status
```

---

## File Locations

| Purpose | Command |
|---------|---------|
| Config | `cat ~/.clawdbot/moltbot.json` |
| Logs | `tail -f ~/.clawdbot/logs/*.log` |
| State | `ls ~/.clawdbot/state/` |
| Agents | `ls ~/.clawdbot/agents/` |

---

## Common Fixes

| Problem | Command |
|---------|---------|
| Gateway won't start | `moltbot doctor --fix` |
| Config error | `moltbot doctor` |
| OAuth expired | `moltbot channels logout && moltbot channels login` |
| Not responding | `moltbot status --deep` |
| Pairing needed | `moltbot pairing approve whatsapp <code>` |

---

## Docker / Remote

```bash
# SSH tunnel for remote access
ssh -L 18789:localhost:18789 user@host

# Multi-instance
CLAWDBOT_CONFIG_PATH=~/.clawdbot/a.json moltbot gateway --port 19001
```

---

*Quick reference - see /docs/clawdbot-summary/README.md for full docs*
