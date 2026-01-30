# AGENTS.md - Agent Configuration & Guidelines

This file documents agent-specific configurations and operational guidelines.

## Secret Management Rules

### 🔐 CRITICAL: Never Commit Secrets to Git

**Rule:** Always replace actual API keys, tokens, and credentials with environment variable placeholders before pushing to git.

**Allowed Patterns:**
- `${ENV_VAR_NAME}` - Standard placeholder
- `$ENV_VAR_NAME` - Alternative format
- `<your-api-key>` - Descriptive placeholder

**Forbidden Patterns:**
- Actual API keys (sk-proj-..., AIza..., ghp_...)
- OAuth tokens (eyJhbGci...)
- Passwords or private keys

**Before Pushing:**
1. Search for secrets: `grep -rE "(sk-[a-zA-Z0-9]|AIza|eyJ)" --include="*.ts" --include="*.js" --include="*.json" --include="*.md" --include="*.sh"`
2. Replace any found secrets with placeholders
3. Document required env vars in CONFIG_ENV.md or similar
4. Commit only placeholders

**Example:**
```json
// BEFORE (NEVER COMMIT):
"key": "AIzaSyDxH165JB0L1pautO8vEC4tF61z6Zjirjo"

// AFTER (SAFE TO COMMIT):
"key": "${GEMINI_API_KEY}"
```

## Operational Notes

- Claude Hours: 9 PM - 8 AM CST autonomous operation
- Active Hours: 9 AM - 9 PM CST direct collaboration
- Primary model: google-antigravity/claude-sonnet-4-5
- Fallback models: Anthropic Sonnet, MiniMax M2.1, Kimi k2.5, Codex, Gemini
