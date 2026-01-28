# Clawdbot Troubleshooting Guide

**Common issues and solutions**

---

## Gateway Won't Start

### Symptoms
- `moltbot gateway` exits immediately
- "Config validation failed" error
- Port already in use

### Diagnosis

```bash
# Run doctor
moltbot doctor

# Check what's using the port
lsof -i :18789

# View error logs
moltbot logs
```

### Solutions

**Config validation error:**
```bash
moltbot doctor --fix
# Or manually fix ~/.clawdbot/moltbot.json
```

**Port in use:**
```bash
# Kill existing gateway
pkill -f moltbot gateway

# Or use different port
moltbot gateway --port 18790
```

**Node version issue:**
```bash
node --version  # Must be >= 22
nvm use 22
```

---

## Claude Not Responding

### Symptoms
- Messages sent but no response
- "No auth configured" in health

### Diagnosis

```bash
# Check health
moltbot health

# Check auth status
moltbot status --all | grep -i auth
```

### Solutions

**No API key:**
```bash
moltbot configure --section models.providers.anthropic --key apiKey "sk-ant-..."
```

**OAuth expired:**
```bash
# Re-authenticate
moltbot channels logout
moltbot channels login
```

**Wrong model:**
```bash
moltbot config set models.default "sonnet-4-5"
```

---

## WhatsApp Issues

### QR Code Not Showing

```bash
# Ensure Gateway is running
moltbot gateway status

# Use Node (not Bun)
which node
node --version

# Restart Gateway with Node
moltbot gateway --port 18789
```

### Not Linking

```bash
# Check pairing
moltbot pairing list whatsapp

# Approve pairing
moltbot pairing approve whatsapp <code>

# Re-login
moltbot channels logout
moltbot channels login
```

### Messages Not Sending

```bash
# Check channel status
moltbot channels list

# Check allowFrom settings
cat ~/.clawdbot/moltbot.json | grep -A5 whatsapp
```

---

## Telegram Issues

### Bot Not Responding

```bash
# Check bot token
moltbot configure --section channels.telegram --key token

# Check DM pairing
moltbot pairing list telegram

# Reconfigure
moltbot configure --section channels.telegram --key token "NEW_TOKEN"
```

### Group Chats

```bash
# Check group settings
moltbot config get | grep -A10 telegram

# Allow group
{
  "channels": {
    "telegram": {
      "groups": {
        "*": { "requireMention": false }
      }
    }
  }
}
```

---

## Configuration Errors

### "Unknown key" or "Invalid value"

```bash
# Run doctor to see exact errors
moltbot doctor

# Validate JSON5
cat ~/.clawdbot/moltbot.json | python3 -m json.tool

# Fix and apply
moltbot gateway call config.apply --params '{
  "raw": "$(cat ~/.clawdbot/moltbot.json | tr -d '\n')",
  "baseHash": "<hash-from-config.get>"
}'
```

### Config Includes Not Working

```bash
# Check file paths
ls -la ~/.clawdbot/*.json5

# Verify $include syntax
cat ~/.clawdbot/moltbot.json | grep \$include
```

---

## OAuth Issues

### "Refresh token used" Error

```bash
# Re-login to refresh token
moltbot channels logout
moltbot channels login
```

### OAuth Not Working Headless

```bash
# Do OAuth on local machine first
moltbot channels login

# Copy credentials
scp ~/.clawdbot/credentials/oauth.json user@server:~/.clawdbot/credentials/
```

---

## Performance Issues

### Slow Responses

```bash
# Check system resources
top -o cpu

# Check Gateway logs
moltbot logs | grep -i "slow\|timeout"

# Reduce concurrent requests
{
  "session": {
    "maxConcurrent": 2
  }
}
```

### Memory Issues

```bash
# Check memory usage
moltbot status | grep memory

# Restart Gateway
moltbot gateway stop
moltbot gateway start
```

---

## Multi-Agent Issues

### Wrong Agent Responding

```bash
# Check routing config
moltbot config get | grep -A20 routing

# Verify broadcast mappings
cat ~/.clawdbot/moltbot.json | grep -A5 broadcast
```

### Sandbox Errors

```bash
# Check sandbox settings
moltbot config get | grep -A10 sandbox

# Disable sandbox (not recommended)
{
  "agents": {
    "list": [{
      "id": "main",
      "sandbox": { "mode": "off" }
    }]
  }
}
```

---

## Installation Issues

### npm install fails

```bash
# Use pnpm instead
pnpm add -g moltbot@latest

# Or use installer
curl -fsSL https://moltbot.io/install.sh | bash
```

### Node version too old

```bash
# Check version
node --version

# Update Node (nvm)
nvm install 22
nvm use 22
```

---

## Recovery Commands

### Nuclear Option (start fresh)

```bash
# Backup config
cp ~/.clawdbot/moltbot.json ~/.clawdbot/moltbot.json.backup

# Reset config
echo '{}' > ~/.clawdbot/moltbot.json

# Restart Gateway
moltbot gateway stop
moltbot gateway start
```

### Restore from Backup

```bash
# Restore config
cp ~/.clawdbot/moltbot.json.backup ~/.clawdbot/moltbot.json

# Apply
moltbot gateway call config.apply --params '{
  "raw": "$(cat ~/.clawdbot/moltbot.json | tr -d '\n')",
  "baseHash": "<hash>"
}'
```

---

## Log Locations

| Log | Location |
|-----|----------|
| Gateway | `~/.clawdbot/logs/gateway.log` |
| Agent | `~/.clawdbot/logs/agent.log` |
| System | `moltbot logs` |

---

## Getting Help

```bash
# Full status dump (pasteable)
moltbot status --all

# Health snapshot
moltbot health

# Debug info
moltbot doctor
```

**Resources:**
- Docs: https://docs.molt.bot/
- GitHub: https://github.com/moltbot/moltbot
- Help: https://docs.molt.bot/help

---

*Troubleshooting guide - see /docs/clawdbot-summary/README.md for full documentation*
