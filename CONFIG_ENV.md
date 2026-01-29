# Clawdbot Configuration - Environment Variables

This repository contains a sanitized `clawdbot-config.json` with placeholders for sensitive credentials.

## Required Environment Variables

Before using this config, you'll need to set the following environment variables or replace the placeholders directly in your local `~/.clawdbot/clawdbot.json`:

### Core Services

- **`TELEGRAM_BOT_TOKEN`** - Your Telegram bot token from [@BotFather](https://t.me/BotFather)
  - Format: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`
  - Used in: `channels.telegram.botToken`

- **`GATEWAY_AUTH_TOKEN`** - Gateway authentication token (generate a secure random string)
  - Format: 48-character hex string
  - Generate: `openssl rand -hex 24`
  - Used in: `gateway.auth.token`

### API Keys

- **`OPENROUTER_API_KEY`** - OpenRouter API key from [openrouter.ai](https://openrouter.ai/keys)
  - Format: `sk-or-v1-...`
  - Used in: `models.providers.openrouter.apiKey`

- **`GEMINI_API_KEY`** - Google Gemini API key from [aistudio.google.com](https://aistudio.google.com/app/apikey)
  - Format: `AIzaSy...`
  - Used in: `skills.entries.nano-banana-pro.apiKey`

- **`GOOGLE_PLACES_API_KEY`** - Google Places API key from [console.cloud.google.com](https://console.cloud.google.com/)
  - Format: `AIzaSy...`
  - Used in: `skills.entries.goplaces.apiKey`, `skills.entries.local-places.apiKey`

- **`ELEVENLABS_API_KEY`** - ElevenLabs API key from [elevenlabs.io](https://elevenlabs.io/app/settings/api-keys)
  - Format: `sk_...`
  - Used in: `skills.entries.sag.apiKey`

## OAuth Providers

The following providers use OAuth and don't require API keys in the config:

- **Google Antigravity** - Run `clawdbot auth login google-antigravity`
- **Anthropic Claude** - Run `clawdbot auth login anthropic`
- **OpenAI Codex** - Run `clawdbot auth login openai-codex`

## Setup Instructions

### Option 1: Use Environment Variables (Recommended)

1. Create a `.env` file in your workspace:

```bash
# Core Services
export TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
export GATEWAY_AUTH_TOKEN="$(openssl rand -hex 24)"

# API Keys
export OPENROUTER_API_KEY="your-openrouter-key"
export GEMINI_API_KEY="your-gemini-key"
export GOOGLE_PLACES_API_KEY="your-google-places-key"
export ELEVENLABS_API_KEY="your-elevenlabs-key"
```

2. Source before running: `source .env`
3. Clawdbot will automatically substitute `${VAR_NAME}` placeholders

### Option 2: Direct Replacement

1. Copy `clawdbot-config.json` to `~/.clawdbot/clawdbot.json`
2. Manually replace all `${PLACEHOLDER}` values with actual credentials
3. Never commit the file with real credentials

## Security Best Practices

1. **Never commit real API keys** - Always use placeholders in version control
2. **Use `.gitignore`** - Ensure `.env` files are ignored:
   ```
   .env
   .env.local
   ~/.clawdbot/clawdbot.json
   ```
3. **Rotate tokens regularly** - Especially gateway auth tokens and bot tokens
4. **Restrict OAuth scopes** - Use minimum required permissions
5. **Monitor usage** - Check API usage dashboards regularly

## Minimal Config (Telegram Only)

If you only want Telegram support, you need:

```bash
export TELEGRAM_BOT_TOKEN="your-bot-token"
export GATEWAY_AUTH_TOKEN="$(openssl rand -hex 24)"
```

And OAuth for your primary model provider (e.g., Google Antigravity).

## Troubleshooting

**Config not loading?**
- Check JSON syntax: `cat ~/.clawdbot/clawdbot.json | jq`
- Verify env vars: `echo $TELEGRAM_BOT_TOKEN`

**Auth failing?**
- Re-run OAuth: `clawdbot auth login google-antigravity`
- Check profile order in `auth.order`

**Skills not working?**
- Verify API keys are set correctly
- Check skill is enabled in `skills.entries`

## More Info

- [Clawdbot Docs](https://docs.clawd.bot)
- [Configuration Reference](https://docs.clawd.bot/gateway/configuration)
- [OAuth Setup Guide](https://docs.clawd.bot/auth)
