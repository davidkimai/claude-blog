# Claude Hours - Pre-Flight Checklist

Run this before Claude Hours (9 PM CST) to ensure optimal night shift performance.

## Quick Start

```bash
cd /Users/jasontang/clawd
./scripts/claude-hours-preflight.sh
```

## Manual Checklist

### 1. Workspace Health ✅

```bash
# Check disk space (should be <90%)
df -h /Users/jasontang/clawd

# Check log sizes (should be <100MB)
du -sh .claude/logs .claude/state

# Check git status (should be clean)
git status
```

### 2. Clean Temporary Files 🧹

```bash
# Remove duplicate memory fragments
find memory/ -name "*-[0-9][0-9][0-9][0-9].md" -delete

# Clean empty logs
find .claude/logs -type f -size 0 -delete

# Remove temp files
find . -name "*.tmp" -delete
find . -name ".DS_Store" -delete
```

### 3. Sync Memory Files 📝

```bash
# Ensure today's memory exists
touch memory/$(date +%Y-%m-%d).md

# Review memory extraction
cat memory/extracted-facts-$(date +%Y-%m-%d).jsonl
```

### 4. System Status ⚙️

```bash
# Verify supervisor
./system/supervisor.sh status

# Check cron jobs
crontab -l | grep claude

# View recent cycles
tail -20 .claude/state/loop.log
```

### 5. Set Tonight's Focus 🎯

```bash
# Optional: Set a specific focus for tonight
echo "Focus: <topic>" > .claude/state/tonight-focus.txt

# Examples:
# echo "Focus: Documentation improvements" > .claude/state/tonight-focus.txt
# echo "Focus: Script optimization" > .claude/state/tonight-focus.txt
# echo "Focus: Skill gap analysis" > .claude/state/tonight-focus.txt
```

### 6. Commit Current Work 💾

```bash
# Stage all changes
git add -A

# Commit with timestamp
git commit -m "Pre-flight: $(date +%Y-%m-%d) workspace ready for Claude Hours"

# Push to GitHub
git push origin main
```

## Expected State (Ready for Night Shift)

- ✅ Git status clean
- ✅ Memory files up to date
- ✅ Logs under 100MB
- ✅ Supervisor running
- ✅ Cron active (runs every 15min)
- ✅ Disk under 90%
- ✅ No temp files
- ✅ Tonight's focus set (optional)

## Automated Pre-Flight Script

Create `scripts/claude-hours-preflight.sh`:

```bash
#!/bin/bash
# Claude Hours Pre-Flight Check
# Run before 9 PM to prepare workspace

CLAWD="/Users/jasontang/clawd"
cd "$CLAWD"

echo "🦞 Claude Hours Pre-Flight Check"
echo "================================"
echo ""

# 1. Clean temp files
echo "🧹 Cleaning temporary files..."
find memory/ -name "*-[0-9][0-9][0-9][0-9].md" -delete 2>/dev/null
find .claude/logs -type f -size 0 -delete 2>/dev/null
find . -name "*.tmp" -delete 2>/dev/null
find . -name ".DS_Store" -delete 2>/dev/null
echo "   ✓ Temp files cleaned"

# 2. Check disk
DISK_USAGE=$(df -h "$CLAWD" | awk 'NR==2 {print $5}' | sed 's/%//')
echo ""
echo "💾 Disk Usage: ${DISK_USAGE}%"
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "   ⚠️  WARNING: Disk usage high!"
else
    echo "   ✓ Disk healthy"
fi

# 3. Check logs
LOG_SIZE=$(du -sm .claude/logs | awk '{print $1}')
echo ""
echo "📝 Log Size: ${LOG_SIZE}MB"
if [ "$LOG_SIZE" -gt 100 ]; then
    echo "   ⚠️  WARNING: Logs large, consider rotation"
else
    echo "   ✓ Logs healthy"
fi

# 4. Verify system
echo ""
echo "⚙️  System Status:"
./system/supervisor.sh status | grep -E "OK|running|Memory|CPU|Disk"

# 5. Memory check
echo ""
echo "📚 Memory Files:"
ls -lh memory/*.md | tail -3

# 6. Git status
echo ""
echo "🔧 Git Status:"
if git diff-index --quiet HEAD --; then
    echo "   ✓ Working tree clean"
else
    echo "   ⚠️  Uncommitted changes detected"
    git status --short | head -5
fi

# 7. Next run
echo ""
echo "⏰ Next Claude Hours Cycle:"
CURRENT_HOUR=$(TZ='America/Chicago' date +%H)
if [ "$CURRENT_HOUR" -ge 21 ] || [ "$CURRENT_HOUR" -lt 8 ]; then
    echo "   🌙 Claude Hours ACTIVE"
else
    MINS_TO_9PM=$((((21 - CURRENT_HOUR) * 60) - $(date +%M)))
    if [ "$MINS_TO_9PM" -lt 0 ]; then
        MINS_TO_9PM=$((MINS_TO_9PM + 1440))
    fi
    echo "   ⏰ Starts in ${MINS_TO_9PM} minutes (9:00 PM CST)"
fi

echo ""
echo "================================"
echo "✅ Pre-Flight Complete!"
echo ""
```

## Usage

**Before 9 PM:**
```bash
./scripts/claude-hours-preflight.sh
```

**Manual focus setting:**
```bash
echo "Focus: Security research skill gaps" > .claude/state/tonight-focus.txt
```

**Verify readiness:**
```bash
./system/supervisor.sh status
tail -5 .claude/state/loop.log
```

---

*Last Updated: 2026-01-28*  
*Prepares workspace for autonomous night shift operation*
