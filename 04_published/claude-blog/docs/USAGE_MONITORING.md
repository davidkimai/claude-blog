# Usage Monitoring with CodexBar

## Overview

Track API usage during Claude Hours to prevent hitting rate limits using the `codexbar` CLI.

## Setup

1. **Install codexbar** (if not already installed):
```bash
brew install codexbar
```

2. **Initialize cache**:
```bash
cd /Users/jasontang/clawd
./scripts/claude-hours-usage-monitor.sh update
```

## Usage

### Quick Check (Fast)
```bash
./scripts/claude-hours-usage-monitor.sh check
```

**Output:**
```
📊 Usage Data (cached 0 hours ago):
  Plan: Plus
  Usage: 17%
  Reset: Resets Feb 1, 2026 10:05 PM

✓ Usage healthy: 17%

📈 Projections:
  Current cycle: 129
  Cycles until 8 AM: 3
  Estimated increase: 1.5%
  Projected by 8 AM: 18.5%

✓ Sufficient capacity for tonight
```

### Update Cache (Slow - fetches from web)
```bash
./scripts/claude-hours-usage-monitor.sh update
```

### Log Current Status
```bash
./scripts/claude-hours-usage-monitor.sh log
```

### View History
```bash
./scripts/claude-hours-usage-monitor.sh history
```

### Auto Mode (for cron)
```bash
./scripts/claude-hours-usage-monitor.sh auto
```
Updates cache, checks limits, logs status.

## Integration with Claude Hours

### Manual Monitoring

**Before starting Claude Hours:**
```bash
./scripts/claude-hours-usage-monitor.sh update
./scripts/claude-hours-usage-monitor.sh check
```

**During night (check status):**
```bash
./scripts/claude-hours-usage-monitor.sh check
```

### Automated Monitoring (Recommended)

**Add to crontab:**
```bash
# Update usage cache every 2 hours during Claude Hours
0 */2 * * * cd /Users/jasontang/clawd && ./scripts/claude-hours-usage-monitor.sh auto >> .claude/logs/usage-monitor.log 2>&1
```

### Integration in Loop Script

Add usage check before executing expensive operations:

```bash
# In claude-autonomous-loop-simple.sh
USAGE_CHECK="$CLAWD/scripts/claude-hours-usage-monitor.sh"

# Before cycle execution
$USAGE_CHECK check || {
    log "⚠️  Usage limits approaching - skipping cycle"
    exit 0
}
```

## Thresholds & Alerts

**Default Alert Threshold:** 80% usage

**Warning Levels:**
- **Green (0-79%):** ✓ Sufficient capacity
- **Yellow (80-94%):** ⚠️  CAUTION: Approaching limits
- **Red (95%+):** 🚨 CRITICAL: May hit limit

## Estimation Model

**Per-Cycle Usage:**
- Estimated: ~0.5% of weekly limit per cycle
- Based on: ~15-20 Codex credits per task
- Weekly limit resets: Every Saturday

**Nightly Projection:**
- 44 cycles × 0.5% = ~22% increase per night
- Starting at 17% → projected 39% by morning
- Comfortable margin for tonight

## Manual Override

If approaching limits:

### Option 1: Reduce Cycle Frequency
Edit crontab:
```bash
# From every 15 min:
*/15 * * * * ...

# To every 30 min:
*/30 * * * * ...
```

### Option 2: Switch to Cheaper Model
Update `scripts/codex-api.sh`:
```bash
# From:
MODEL="gpt-5-codex"

# To:
MODEL="gpt-4"  # Uses fewer credits
```

### Option 3: Pause Cycles
```bash
# Stop autonomous loop
./system/supervisor.sh stop

# Resume later
./system/supervisor.sh start
```

## Files

- **Monitor script:** `scripts/claude-hours-usage-monitor.sh`
- **Cache:** `.claude/state/codexbar-cache.json`
- **Log:** `.claude/state/usage-tracking.jsonl`
- **Monitor log:** `.claude/logs/usage-monitor.log`

## Troubleshooting

**"No cache found":**
```bash
./scripts/claude-hours-usage-monitor.sh update
```

**Cache is old:**
Cache updates every time you run `update` or `auto`. For real-time data, run `update` manually.

**codexbar hangs:**
This is normal - codexbar fetches from web dashboards which can be slow. The script caches results to avoid repeated slow calls.

**Usage percentage wrong:**
Run `update` to refresh from OpenAI dashboard. Cache may be stale.

## Current Status (2026-01-28)

- **Account:** Plus (jtan15010@gmail.com)
- **Usage:** 17% of weekly limit
- **Resets:** Feb 1, 2026 10:05 PM
- **Projected by 8 AM:** ~18.5%
- **Status:** ✓ Sufficient capacity

---

*Last Updated: 2026-01-28*  
*Monitor Version: 1.0*
