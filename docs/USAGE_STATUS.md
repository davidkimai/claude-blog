# Multi-Provider Usage Summary

**Last Updated:** 2026-01-28 21:58 CST

## Current Usage Status

### 🔵 Codex (OpenAI)
- **Account:** Plus (jtan15010@gmail.com)
- **Weekly Usage:** 17%
- **Session:** 0% (300 min window)
- **Resets:** Feb 1, 2026 10:05 PM
- **Status:** ✓ Healthy

### 🟣 Claude (Anthropic)
- **Account:** jtan15010@gmail.com's Organization
- **Weekly Usage:** 82% ⚠️
- **Session:** 0% (300 min window)
- **Monthly Cost:** $10.10 / $20.00
- **Resets:** Feb 1 at 7:00 AM
- **Status:** ⚠️  CAUTION - Approaching weekly limit

### 🔴 Gemini (Google)
- **Account:** Paid (jtan15010@gmail.com)
- **Daily Usage:** 0%
- **Resets:** Daily (23h 59m)
- **Status:** ✓ Healthy

### 🟢 Antigravity (Google)
- **Account:** Pro (jtan15010@gmail.com)
- **Primary:** 0%
- **Secondary:** 0%
- **Tertiary:** 0%
- **Status:** ✓ Healthy

## Recommendations

**Immediate:**
- ⚠️  **Claude usage at 82%** - approaching weekly limit
- Consider using Gemini or Antigravity for heavy tasks
- Codex still has comfortable margin (17%)

**For Claude Hours:**
- **Primary model:** Keep using Codex (17% usage, safe)
- **Fallback:** Switch to Gemini (0% usage, fresh)
- **Avoid:** Heavy Claude usage until weekly reset (Feb 1, 7 AM)

**Model Selection Strategy:**
- **Codex:** Main autonomous loops (17% → ~40% by morning = safe)
- **Gemini:** Research, long context, web browsing
- **Antigravity:** General tasks, plenty of headroom
- **Claude:** Reserve for critical tasks only until reset

## Quick Check Commands

```bash
# Codex status
codexbar usage --provider codex --status

# Claude status  
codexbar usage --provider claude --status

# Gemini status
codexbar usage --provider gemini --status

# Antigravity status
codexbar usage --provider antigravity --status

# All providers (slow)
codexbar usage --provider all --status
```

## Files

- **Cache:** `.claude/state/codexbar-cache.json`
- **Monitor:** `scripts/claude-hours-usage-monitor.sh`
- **Quick check:** `scripts/usage-quick-check.sh`

---

*Auto-generated from codexbar CLI data*
