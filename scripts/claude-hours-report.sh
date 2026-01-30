#!/bin/bash
# Claude Hours Morning Report
# Run this to see what was accomplished overnight

CLAWD="/Users/jasontang/clawd"
cd "$CLAWD"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║          🦞 Claude Hours Morning Report                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Time range
START_TIME="21:00"
END_TIME="08:00"

echo "📅 Session: $(date '+%Y-%m-%d')"
echo ""

echo "═══ Work Accomplished ═══"
COMMITS=$(git log --since="昨天 $START_TIME" --until="今天 $END_TIME" --oneline 2>/dev/null | wc -l)
echo "Commits: $COMMITS"
if [ "$COMMITS" -gt 0 ]; then
    echo ""
    echo "Commits made:"
    git log --since="昨天 $START_TIME" --until="今天 $END_TIME" --oneline 2>/dev/null | sed 's/^/  • /'
fi

echo ""
echo "═══ Files Changed ═══"
FILES=$(git diff --name-only HEAD~${COMMITS:-1} 2>/dev/null | wc -l)
echo "Files: $FILES"
if [ "$FILES" -gt 0 ]; then
    echo ""
    echo "Changed files:"
    git diff --name-only HEAD~${COMMITS:-1} 2>/dev/null | sed 's/^/  • /'
fi

echo ""
echo "═══ System Health ═══"
LOG_SIZE=$(ls -lh .claude/logs/autonomous-loop.log 2>/dev/null | awk '{print $5}')
echo "Log Size: ${LOG_SIZE:-N/A}"
NOTIF_COUNT=$(wc -l < .claude/logs/notifier.log 2>/dev/null || echo 0)
echo "Notifications: $NOTIF_COUNT"

echo ""
echo "═══ Success Metrics ═══"
if [ "$COMMITS" -gt 0 ]; then
    echo "✅ Work accomplished ($COMMITS commit(s))"
else
    echo "❌ No work accomplished"
fi

if [ "$LOG_SIZE" != "N/A" ] && [ "${LOG_SIZE%K}" -lt 50 ] 2>/dev/null; then
    echo "✅ Log size OK (< 50KB)"
else
    echo "⚠️  Log size high (check for spam)"
fi

if [ "$NOTIF_COUNT" -le 3 ]; then
    echo "✅ Notification discipline (≤ 3)"
else
    echo "⚠️  Notification spam detected ($NOTIF_COUNT)"
fi

echo ""
echo "═══ Next Steps ═══"
echo "1. Review commits: git log --since='$START_TIME' --until='$END_TIME'"
echo "2. Check logs: cat .claude/logs/autonomous-loop.log | tail -50"
echo "3. Define next task: tasks/nightly-build.md"
echo ""

# Exit code: 0 = success, 1 = issues detected
if [ "$COMMITS" -eq 0 ] || [ "$NOTIF_COUNT" -gt 3 ]; then
    exit 1
fi
exit 0
