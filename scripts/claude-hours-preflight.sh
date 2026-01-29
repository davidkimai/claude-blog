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
LOG_SIZE=$(du -sm .claude/logs 2>/dev/null | awk '{print $1}')
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
./system/supervisor.sh status | grep -E "OK|running|Memory|CPU|Disk" || echo "   Supervisor check complete"

# 5. Memory check
echo ""
echo "📚 Memory Files:"
ls -lh memory/*.md 2>/dev/null | tail -3

# 6. Git status
echo ""
echo "🔧 Git Status:"
if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "   ✓ Working tree clean"
else
    echo "   ⚠️  Uncommitted changes detected"
    git status --short 2>/dev/null | head -5
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

# 8. Ensure today's memory exists
echo ""
echo "📝 Memory Prep:"
TODAY_MEMORY="memory/$(date +%Y-%m-%d).md"
if [ ! -f "$TODAY_MEMORY" ]; then
    touch "$TODAY_MEMORY"
    echo "   ✓ Created today's memory file"
else
    echo "   ✓ Today's memory exists ($(wc -l < "$TODAY_MEMORY") lines)"
fi

echo ""
echo "================================"
echo "✅ Pre-Flight Complete!"
echo ""
echo "Optional: Set tonight's focus with:"
echo "   echo 'Focus: <topic>' > .claude/state/tonight-focus.txt"
echo ""
