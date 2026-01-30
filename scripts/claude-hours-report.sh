#!/bin/bash
# Claude Hours Morning Report - Summarize overnight work
# Run this after Claude Hours to see what was accomplished

CLAWD="/Users/jasontang/clawd"
cd "$CLAWD"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║          🦞 Claude Hours Morning Report                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Date: $(date '+%Y-%m-%d')"
echo "Report Generated: $(date '+%H:%M %Z')"
echo ""

# Get yesterday's date for log range
YESTERDAY=$(date -d "yesterday" '+%Y-%m-%d')
TODAY=$(date '+%Y-%m-%d')

echo "═══ Work Accomplished ═══"

# Count commits from 9 PM yesterday to 8 AM today
# Git log doesn't support time ranges directly, so we use date filtering
COMMITS=$(git log --since="$YESTERDAY 21:00" --until="$TODAY 08:00" --oneline 2>/dev/null | wc -l)
echo "Commits: $COMMITS"

if [ "$COMMITS" -gt 0 ]; then
    echo ""
    echo "Commits made during Claude Hours:"
    git log --since="$YESTERDAY 21:00" --until="$TODAY 08:00" --oneline 2>/dev/null | sed 's/^/  • /'
fi

echo ""
echo "═══ Files Changed ═══"

# Get files changed in those commits
if [ "$COMMITS" -gt 0 ]; then
    FILES=$(git diff --name-only HEAD~${COMMITS} HEAD 2>/dev/null | wc -l)
    echo "Files: $FILES"
    if [ "$FILES" -gt 0 ]; then
        echo ""
        echo "Changed files:"
        git diff --name-only HEAD~${COMMITS} HEAD 2>/dev/null | sed 's/^/  • /'
    fi
else
    echo "Files: 0"
fi

echo ""
echo "═══ System Health ═══"

# Log size check
if [ -f ".claude/logs/autonomous-loop.log" ]; then
    LOG_SIZE=$(ls -lh .claude/logs/autonomous-loop.log 2>/dev/null | awk '{print $5}')
    LOG_LINES=$(wc -l < .claude/logs/autonomous-loop.log)
    echo "Log Size: ${LOG_SIZE:-N/A} (${LOG_LINES:-0} lines)"
    
    # Flag large logs
    if [ "${LOG_LINES:-0}" -gt 500 ]; then
        echo -e "  ${YELLOW}⚠️  Log larger than 500 lines - check for spam${NC}"
    else
        echo -e "  ${GREEN}✓ Log size OK${NC}"
    fi
else
    echo "Log: No autonomous-loop.log found"
fi

# Notification count
if [ -f ".claude/logs/notifier.log" ]; then
    NOTIF_COUNT=$(wc -l < .claude/logs/notifier.log | tr -d ' ')
    echo "Notifications Sent: ${NOTIF_COUNT:-0}"
else
    echo "Notifications Sent: 0 (disabled)"
fi

# Process check
PROCESS_COUNT=$(ps aux | grep "autonomous-loop-v3" | grep -v grep | wc -l)
echo "Running Processes: $PROCESS_COUNT"
if [ "$PROCESS_COUNT" -gt 1 ]; then
    echo -e "  ${RED}⚠️  Multiple processes running - may need cleanup${NC}"
fi

echo ""
echo "═══ Task Status ═══"

# Check if task was defined
if [ -f "tasks/nightly-build.md" ]; then
    TASK_CONTENT=$(cat tasks/nightly-build.md | grep -v "^#" | grep -v "^$" | wc -l)
    if [ "$TASK_CONTENT" -gt 10 ]; then
        TASK_NAME=$(grep "^## " tasks/nightly-build.md | head -1 | sed 's/^## //')
        echo "Task Defined: ${TASK_NAME:-Yes}"
        
        # Check acceptance criteria
        CRITERIA_DONE=$(grep -c "^\- \[x\]" tasks/nightly-build.md 2>/dev/null || echo 0)
        CRITERIA_TOTAL=$(grep -c "^\- \[ \]" tasks/nightly-build.md 2>/dev/null || echo 0)
        echo "Acceptance Criteria: ${CRITERIA_DONE}/${CRITERIA_TOTAL} complete"
    else
        echo "Task Defined: No (empty task file)"
    fi
else
    echo "Task Defined: No task file found"
fi

echo ""
echo "═══ Summary ═══"

if [ "$COMMITS" -gt 0 ]; then
    echo -e "${GREEN}✅ SUCCESS: $COMMITS commit(s) made overnight${NC}"
else
    echo -e "${RED}❌ FAILURE: No commits made${NC}"
    echo "Possible causes:"
    echo "  - No task defined in tasks/nightly-build.md"
    echo "  - Process failed to run properly"
    echo "  - System crashed before completing work"
fi

echo ""
echo "═══ Next Steps ═══"
echo "1. Review commits: git log --since='$YESTERDAY 21:00' --until='$TODAY 08:00'"
echo "2. Check logs: cat .claude/logs/autonomous-loop.log | tail -100"
echo "3. Define next task: tasks/nightly-build.md"
echo "4. Clean up: pkill -9 -f autonomous-loop-v3"
echo ""

# Exit code for scripting
if [ "$COMMITS" -gt 0 ]; then
    exit 0
else
    exit 1
fi
