# Auth & Model Activity Tracking

**Created:** 2026-01-25  
**Purpose:** Granular visibility into auth profiles, model switching, and rate limit proximity

## Quick Status

**View current status:**
```bash
node scripts/auth-status.js
```

**Example output:**
```
🔍 **Auth & Model Status**
──────────────────────────────────
✅ **Active**: `google-antigravity:jtan15010@gmail.com`
   Last used: 04:07 PM

⏸️ **Cooldowns**:
   - `anthropic:clawd`: Wait 38m (auth)
   - `anthropic:claude-cli`: Wait 23m (rate_limit)

📉 **Errors**:
   - `google:default`: 4 errors
──────────────────────────────────
```

## Features

### 1. Real-Time Status Display
Shows currently active auth profile, last usage time, cooldowns, and error counts.

### 2. Automatic Monitoring (via Heartbeat)
Integrated into `HEARTBEAT.md` - runs every ~30min with `--check` flag.

### 3. Smart Notifications
**Notifies when:**
- ⚠️ **Model switches** (auth profile changes)
- ⏸️ **New cooldowns** activate
- 📉 **Error rates increase** (3+ errors, approaching limit)

**Stays quiet when:**
- No changes detected
- Errors already in cooldown
- Normal operation continues

## How It Works

**Data sources:**
- `~/.clawdbot/agents/main/agent/auth-profiles.json` - Auth profile stats
- `~/.clawdbot/clawdbot.json` - Model config
- `memory/auth-state.json` - Previous state for comparison

**State tracking:**
- Compares current state to previous check
- Detects profile switches, new cooldowns, error increases
- Saves state after each check

## Manual Checks

**View current status:**
```bash
cd ~/clawd
node scripts/auth-status.js
```

**Check for changes (notifications only):**
```bash
node scripts/auth-status.js --check
```

## Understanding the Output

### Active Profile
```
✅ **Active**: `anthropic:claude-cli`
   Last used: 04:07 PM
```
The auth profile currently handling requests.

### Cooldowns
```
⏸️ **Cooldowns**:
   - `anthropic:clawd`: Wait 38m (rate_limit)
```
Profiles temporarily disabled due to rate limits or auth errors.

### Errors
```
📉 **Errors**:
   - `google:default`: 4 errors
```
Profiles with accumulated errors (not yet in cooldown).

## Integration with Heartbeat

The script runs automatically every ~30min via heartbeat polling:

```bash
# From HEARTBEAT.md
node ./scripts/auth-status.js --check
```

When changes are detected, notifications appear in the chat.

## Files

- **Script:** `/Users/jasontang/clawd/scripts/auth-status.js` (executable)
- **State:** `/Users/jasontang/clawd/memory/auth-state.json` (auto-created)
- **Heartbeat:** `/Users/jasontang/clawd/HEARTBEAT.md` (integrated)

## Example Notifications

**Model switch:**
```
⚠️ **Model Switched**: `anthropic:default` → `google-antigravity:jtan15010@gmail.com`
```

**New cooldown:**
```
⏸️ **Cooldown Active**: `anthropic:claude-cli` until 04:30 PM (rate_limit)
```

**Error rate warning:**
```
📉 **Error Rate**: `anthropic:clawd` has 4 errors.
```

## Troubleshooting

**No output from `--check`:**
- No changes detected since last run
- This is normal when auth state is stable

**Missing auth-profiles.json:**
- Check `~/.clawdbot/agents/main/agent/auth-profiles.json` exists
- Verify Clawdbot is properly configured

**Script errors:**
- Ensure running from workspace: `cd ~/clawd`
- Check Node.js is available: `node --version`

---

**Last Updated:** 2026-01-25  
**Status:** Active and integrated with heartbeat monitoring
