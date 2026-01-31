# Security Incident Report: Telegram Token Leak

**Date:** 2026-01-30  
**Status:** IN PROGRESS - Credentials Need Rotation

## Incident Summary

A Telegram bot token was accidentally committed to git history in the file `scripts/claude-hours-notifier.sh`.

### Leaked Credentials
| # | Credential Type | Location | Status |
|---|----------------|----------|--------|
| 1 | TELEGRAM_BOT_TOKEN | `scripts/claude-hours-notifier.sh` (commit 344aa51) | ⚠️ In git history |
| 2 | TELEGRAM_CHAT_ID | `scripts/claude-hours-notifier.sh` (commit 344aa51) | ⚠️ In git history |

### Token Value (EXPOSED - ROTATE IMMEDIATELY)
```
Bot Token: 8547350301:AAGFMLsPvNISxc9kUewgak-5kdZLow-6QSw
Chat ID: 7948630843
```

## Actions Taken

### ✅ Completed
1. **Removed hardcoded credentials** from `scripts/claude-hours-notifier.sh`
2. **Committed fix** (commit 511cbaa)
3. **Credentials now load from environment** variables only

### ⏳ Pending
1. **Rotate Telegram credentials** - Token was exposed in git history
2. **Clean git history** - Remove old commits containing secrets

## Remediation Steps

### 1. Rotate Telegram Bot Token
1. Go to https://my.telegram.org/apps
2. Create new API credentials
3. Delete old bot token via BotFather: `/revoke`
4. Update `~/.clawdbot/.telegram-env` with new token:
   ```bash
   export TELEGRAM_BOT_TOKEN="new_token_here"
   export TELEGRAM_CHAT_ID="7948630843"
   ```

### 2. Clean Git History (Optional)
```bash
# Install git-filter-repo (recommended over filter-branch)
brew install git-filter-repo

# Remove the file from history
git filter-repo --path scripts/claude-hours-notifier.sh --invert-paths --force

# Push force (careful!)
git push --force
```

### 3. Monitor for Abuse
- Check Telegram for unauthorized bot access
- Monitor GitHub activity for unauthorized access
- Review API logs for unusual patterns

## Current State

The credentials are:
- ❌ Still in git history (commits 344aa51, c198276)
- ✅ Removed from current HEAD
- ✅ Not in .env files (which are gitignored)

**Risk Level:** MEDIUM - Token was in public/private repo history

## Files Modified

- `scripts/claude-hours-notifier.sh` - Removed hardcoded credentials
