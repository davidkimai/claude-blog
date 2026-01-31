# Active Credentials Requiring Rotation

This document tracks credentials that exist in `.env` files and may need rotation.

## ⚠️ CRITICAL: Secrets in .env files

The following files contain **actual secrets** (not placeholders):

### `.env.local`
| Variable | Value (masked) | Status |
|----------|---------------|--------|
| VERCEL_OIDC_TOKEN | `eyJhbGci...` (JWT) | ⚠️ Rotate - contains claims about Vercel project |
| SUPERMEMORY_CLAWDBOT_API_KEY | `sm_Wzn7...` | ⚠️ Rotate - SuperMemory API key |
| OPENROUTER_API_KEY | `sk-or-v1-1944d4...` | ⚠️ Rotate - OpenRouter key exposed |
| TELEGRAM_BOT_TOKEN | `8547350301:AAGFMLs...` | ⚠️ **ALREADY LEAKED** - Rotate immediately! |
| TELEGRAM_CHAT_ID | `7948630843` | ⚠️ Part of leaked Telegram credentials |

### `.env.supermemory`
| Variable | Value (masked) | Status |
|----------|---------------|--------|
| SUPERMEMORY_CLAWDBOT_API_KEY | `sm_Wzn7...` | ⚠️ Duplicate - same as .env.local |

### `.env.openrouter`
| Variable | Value (masked) | Status |
|----------|---------------|--------|
| OPENROUTER_API_KEY | `sk-or-v1-...` | ⚠️ Duplicate - same as .env.local |

## Credentials to Rotate

### 1. Telegram Bot Token (URGENT - Was in git history)
- **Current Token:** `8547350301:AAGFMLsPvNISxc9kUewgak-5kdZLow-6QSw`
- **Chat ID:** `7948630843`
- **Action:** Revoke via BotFather `/revoke` and create new token
- **Update Location:** `~/.clawdbot/.telegram-env` or `.env.local`

### 2. OpenRouter API Key
- **Current Key:** `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`
- **Dashboard:** https://openrouter.ai/keys
- **Action:** Delete old key, generate new one
- **Update Location:** `.env.local`

### 3. SuperMemory API Key
- **Current Key:** `sm_Wzn7EuPcPJqc5Y2QvDGA5J_HvtaUjcJIPFMOQuIYcLhIMXpUzHoNPkRUPvMqzXLnOUHRmPQNPrfBeRnEVTTwlHt`
- **Dashboard:** https://supermemory.ai/settings
- **Action:** Regenerate key
- **Update Location:** `.env.supermemory` or `.env.local`

### 4. Vercel OIDC Token
- **Current Token:** JWT token in `.env.local`
- **Dashboard:** https://vercel.com/settings/tokens
- **Action:** Revoke and regenerate if needed
- **Update Location:** `.env.local`

## Secure Pattern for Scripts

All scripts should load credentials from environment:

```bash
# ❌ WRONG - Hardcoded
TELEGRAM_BOT_TOKEN="8547350301:AAGFMLs..."

# ✅ CORRECT - From environment
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "ERROR: TELEGRAM_BOT_TOKEN not set"
    exit 1
fi
```

## Git Protection

All `.env*` files are protected by `.gitignore`:
```gitignore
.env
.env.*
.env.local
.env.production
```

**Status:** ✅ All .env files are properly gitignored
