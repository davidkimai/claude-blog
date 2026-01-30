# Clawdbot/Moltbot Quick Reference

**Source:** https://docs.molt.bot/ | **Generated:** 2026-01-27

---

## Quick Links

| Page | URL |
|------|-----|
| Main Docs | https://docs.molt.bot/ |
| Dashboard | http://127.0.0.1:18789/ |
| GitHub | https://github.com/moltbot/moltbot |
| Clawd | https://clawd.me |

---

## Architecture Overview

```
WhatsApp / Telegram / Discord / iMessage
         │
         ▼
┌───────────────────────────┐
│ Gateway (moltbot gateway) │
│ ws://127.0.0.1:18789      │
└───────────┬───────────────┘
            │
    ┌───────┴───────┐
    │               │
  Pi agent      CLI tools
  (RPC)         (moltbot ...)
```

### Key Components

| Component | Purpose |
|-----------|---------|
| Gateway | Single process owning channel connections + WebSocket control plane |
| Pi Agent | Coding agent (RPC mode) with tool streaming |
| Channels | WhatsApp, Telegram, Discord, iMessage, Mattermost (plugin) |
| Nodes | iOS/Android clients via Gateway WebSocket |

---

## Installation

### Prerequisites

- **Node >= 22** (required for WhatsApp/Telegram)
- **pnpm** (recommended for source installs)
- **Brave Search API key** (optional, for web search)

### Install CLI

```bash
# Method 1: curl installer
curl -fsSL https://molt.bot/install.sh | bash

# Method 2: npm global
npm install -g moltbot@latest

# Method 3: pnpm
pnpm add -g moltbot@latest
```

### Onboarding Wizard

```bash
# Run wizard and install daemon
moltbot onboard --install-daemon

# Manual gateway (foreground)
moltbot gateway --port 18789 --verbose
```

### From Source (Development)

```bash
git clone https://github.com/moltbot/moltbot.git
cd moltbot
pnpm install
pnpm ui:build
pnpm build
moltbot onboard --install-daemon
```

---

## Configuration

### Config File Location

- **Primary:** `~/.clawdbot/moltbot.json` (JSON5 format)
- **Includes:** `$include` directive for split configs
- **Auth profiles:** `~/.clawdbot/agents/<agent-id>/agent/auth-profiles.json`
- **Legacy OAuth:** `~/.clawdbot/credentials/oauth.json`

### Minimal Config Example

```json5
{
  agents: { defaults: { workspace: "~/clawd" } },
  channels: { 
    whatsapp: { allowFrom: ["+15555550123"] },
    telegram: { allowFrom: ["123456789"] }
  }
}
```

### Config Commands

```bash
# View config
moltbot gateway call config.get --params '{}'

# Apply full config
moltbot gateway call config.apply --params '{
  "raw": "{ agents: { defaults: { workspace: \"~/clawd\" } } }",
  "baseHash": "<hash-from-config.get>"
}'

# Partial update (merge)
moltbot gateway call config.patch --params '{
  "raw": "{ channels: { telegram: { groups: { \"*\": { requireMention: false } } } } }",
  "baseHash": "<hash>"
}'

# Use CLI
moltbot config set agents.defaults.workspace ~/clawd
```

### Config Includes ($include)

Split configs across files:

```json5
// ~/.clawdbot/moltbot.json
{
  gateway: { port: 18789 },
  agents: { "$include": "./agents.json5" },
  broadcast: { "$include": ["./clients/a.json5", "./clients/b.json5"] }
}

// ~/.clawdbot/agents.json5
{
  defaults: { sandbox: { mode: "all", scope: "session" } },
  list: [{ id: "main", workspace: "~/clawd" }]
}
```

### Environment Variables

```bash
# Load shell env
CLAWDBOT_LOAD_SHELL_ENV=1

# Gateway token
CLAWDBOT_GATEWAY_TOKEN=secret

# Config substitution in JSON5
{
  models: {
    providers: {
      custom: { apiKey: "${CUSTOM_API_KEY}" }
    }
  }
}
```

### Self-Chat Mode (Groups)

```json5
{
  agents: {
    defaults: { workspace: "~/clawd" },
    list: [{
      id: "main",
      groupChat: { mentionPatterns: ["@clawd", "responde"] }
    }]
  },
  channels: {
    whatsapp: {
      allowFrom: ["+15555550123"],  // Your number for DMs
      groups: { "*": { requireMention: true } }
    }
  }
}
```

---

## Channel Setup

### WhatsApp (QR Login)

```bash
# Show QR code
moltbot channels login

# Scan via WhatsApp → Settings → Linked Devices
```

### Telegram (Bot Token)

```bash
# Via @BotFather, get bot token
# Configure in wizard or manually:
moltbot configure --section channels.telegram --key token "BOT_TOKEN"
```

### Discord (Bot Token)

```bash
# Create app at https://discord.com/developers/applications
# Get bot token and invite URL
# Configure in wizard or manually
```

### iMessage (macOS)

```bash
# Requires imsg CLI installed
# See: /channels/imessage
```

---

## Multi-Agent Routing

Route different users/groups to different agents:

```json5
{
  routing: {
    agents: {
      "main": { workspace: "~/clawd", sandbox: { mode: "off" } },
      "helper": { workspace: "~/helper-workspace" }
    }
  },
  broadcast: {
    "[[email protected]]": ["main"],
    "[[email protected]]": ["helper"]
  }
}
```

---

## Skills

### Skill Management

```bash
# List installed skills
moltbot skills list

# Install skill from URL
moltbot skills add https://github.com/user/skill

# Configure skill
moltbot skills config <skill-id>
```

### Skills Directory

See `/tools/skills` for full docs.

---

## Gateway Management

### Start/Stop

```bash
# Status
moltbot gateway status

# Start (foreground)
moltbot gateway --port 18789 --verbose

# Start with token (remote)
moltbot gateway --bind tailnet --token <token>

# Service management
moltbot service install
moltbot service start
moltbot service stop
```

### Health & Debug

```bash
# Basic status
moltbot status

# Deep health check
moltbot health
moltbot status --deep

# Security audit
moltbot security audit --deep

# Logs
moltbot logs --tail
```

### Remote Access

```bash
# SSH tunnel
ssh -L 18789:localhost:18789 user@host

# Tailscale
moltbot gateway --bind tailnet --token <ts-token>
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Gateway won't start | Run `moltbot doctor` |
| Config validation error | `moltbot doctor --fix` |
| OAuth expired | Re-run `moltbot onboard` or `moltbot channels login` |
| WhatsApp not connecting | Use Node (not Bun) for Gateway |
| Claude not responding | Check `moltbot health` for auth status |

### Common Commands

```bash
# Diagnostic
moltbot doctor
moltbot doctor --fix

# Check all services
moltbot status --all

# Pairing approvals
moltbot pairing list whatsapp
moltbot pairing approve whatsapp <code>

# Reset OAuth
moltbot channels logout
moltbot channels login
```

---

## File Locations

| Purpose | Path |
|---------|------|
| Config | `~/.clawdbot/moltbot.json` |
| State | `~/.clawdbot/state/` |
| Logs | `~/.clawdbot/logs/` |
| Agents | `~/.clawdbot/agents/<agent-id>/` |
| Credentials (legacy) | `~/.clawdbot/credentials/` |
| Daemon service | `~/Library/LaunchAgents/` (macOS) |

---

## Pi Agent (Coding Agent)

### Model Configuration

```json5
{
  models: {
    default: "sonnet-4-5",
    providers: {
      anthropic: { apiKey: "${ANTHROPIC_API_KEY}" },
      openai: { apiKey: "${OPENAI_API_KEY}" }
    }
  }
}
```

### Workspace Setup

```bash
# Build default sandbox image
scripts/sandbox-setup.sh

# Per-agent workspace
{
  agents: {
    list: [{ id: "main", workspace: "~/clawd" }]
  }
}
```

---

## Command Reference

### Core Commands

| Command | Description |
|---------|-------------|
| `moltbot onboard` | Run onboarding wizard |
| `moltbot gateway` | Start Gateway process |
| `moltbot status` | System status |
| `moltbot health` | Health check |
| `moltbot doctor` | Diagnose issues |
| `moltbot configure` | Configure settings |

### Channel Commands

| Command | Description |
|---------|-------------|
| `moltbot channels login` | QR login for WhatsApp |
| `moltbot channels list` | List connected channels |
| `moltbot pairing list` | Show pending approvals |
| `moltbot pairing approve` | Approve DM pairing |

### Message Commands

```bash
# Send test message
moltbot message send --target +15555550123 --message "Hello"

# Send to group
moltbot message send --target "+15555550123-123456789@g.us" --message "Group test"
```

---

## Security

### OAuth & Auth

- **Recommended:** API keys (easier than OAuth for headless)
- **Legacy OAuth:** `~/.clawdbot/credentials/oauth.json`
- **Per-agent auth:** `~/.clawdbot/agents/<id>/agent/auth-profiles.json`

### Pairing (DM Safety)

Unknown DMs require pairing approval:
```bash
moltbot pairing list whatsapp
moltbot pairing approve whatsapp <code>
```

### Rate Limiting

Configure in channels settings. See `/gateway/configuration`.

---

## Common Issues & Fixes

### "No auth configured"

```bash
# Fix: Set API key or run OAuth
moltbot configure --section models.providers.anthropic --key apiKey "sk-ant-..."
```

### Gateway won't start

```bash
# Diagnose
moltbot doctor

# Auto-fix
moltbot doctor --fix
```

### WhatsApp QR not showing

```bash
# Ensure Gateway is running
moltbot gateway status

# Use Node (not Bun)
which node
node --version  # Must be >= 22
```

### Claude not responding

```bash
# Check health
moltbot health

# Check auth
moltbot status --all | grep -i auth

# Re-authenticate
moltbot channels logout
moltbot channels login
```

---

## Environment Variables Reference

| Variable | Purpose |
|----------|---------|
| `CLAWDBOT_CONFIG_PATH` | Config file path |
| `CLAWDBOT_STATE_DIR` | State directory |
| `CLAWDBOT_GATEWAY_TOKEN` | Gateway auth token |
| `CLAWDBOT_LOAD_SHELL_ENV` | Load shell profile |
| `OPENAI_API_KEY` | OpenAI/Codex auth |
| `ANTHROPIC_API_KEY` | Anthropic auth |

---

## Links

| Resource | URL |
|----------|-----|
| Docs Hub | https://docs.molt.bot/start/hubs |
| Getting Started | https://docs.molt.bot/start/getting-started |
| Configuration | https://docs.molt.bot/gateway/configuration |
| Wizard | https://docs.molt.bot/start/wizard |
| Security | https://docs.molt.bot/gateway/security |
| Troubleshooting | https://docs.molt.bot/help |
| GitHub | https://github.com/moltbot/moltbot |

---

*Generated from https://docs.molt.bot/ on 2026-01-27*
