#!/bin/bash
# Verify Claude Hours setup is complete and ready for first run

set -e

echo "🔍 Verifying Claude Hours Setup..."
echo ""

ERRORS=0
WARNINGS=0

# Check required files
echo "📁 Checking required files..."

check_file() {
    if [ -f "$1" ]; then
        echo "  ✅ $1"
    else
        echo "  ❌ MISSING: $1"
        ((ERRORS++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo "  ✅ $1/"
    else
        echo "  ❌ MISSING: $1/"
        ((ERRORS++))
    fi
}

# Core workflow files
check_file "CLAUDE-HOURS.md"
check_file "HEARTBEAT.md"
check_file "AGENTS.md"
check_file "IDENTITY.md"
check_file "USER.md"
check_file "MEMORY.md"

# Memory system
check_dir "memory"
check_file "memory/self-review.md"
check_file "memory/nightly-builds.md"

# Task system
check_dir "tasks"
check_file "tasks/README.md"
check_file "tasks/priority-backlog.md"

# Docs
check_dir "docs"
check_file "docs/nightly-workflow-comparison.md"

echo ""
echo "🔎 Checking HEARTBEAT.md integration..."

if grep -q "CLAUDE-HOURS.md" HEARTBEAT.md; then
    echo "  ✅ HEARTBEAT.md references CLAUDE-HOURS.md"
else
    echo "  ⚠️  WARNING: HEARTBEAT.md doesn't reference CLAUDE-HOURS.md"
    ((WARNINGS++))
fi

if grep -q "Claude Hours" HEARTBEAT.md; then
    echo "  ✅ HEARTBEAT.md has Claude Hours schedule"
else
    echo "  ⚠️  WARNING: HEARTBEAT.md missing Claude Hours schedule"
    ((WARNINGS++))
fi

echo ""
echo "🕐 Current time check..."

CURRENT_HOUR=$(date +%H)
if [ "$CURRENT_HOUR" -ge 21 ] || [ "$CURRENT_HOUR" -le 8 ]; then
    echo "  🌙 Currently in Claude Hours (${CURRENT_HOUR}:00)"
    echo "     Next heartbeat should trigger Phase 1 or Phase 2"
else
    echo "  ☀️  Currently in Active Hours (${CURRENT_HOUR}:00)"
    echo "     Claude Hours start at 21:00 CST"
fi

echo ""
echo "📋 Task system check..."

TASK_COUNT=0

if [ -f "tasks/nightly-build.md" ]; then
    echo "  ✅ tasks/nightly-build.md exists (PRIORITY-1)"
    ((TASK_COUNT++))
fi

if grep -q "\[PRIORITY-2\." tasks/priority-backlog.md 2>/dev/null; then
    echo "  ✅ tasks/priority-backlog.md has tasks"
    ((TASK_COUNT++))
else
    echo "  ℹ️  tasks/priority-backlog.md is empty (this is fine for day 1)"
fi

if [ "$TASK_COUNT" -eq 0 ]; then
    echo "  ⚠️  No tasks defined - will run maintenance work tonight"
    ((WARNINGS++))
fi

echo ""
echo "📊 Summary"
echo "=========="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed! Claude Hours is ready for first run."
    echo ""
    echo "Next steps:"
    echo "  1. Add tasks to tasks/priority-backlog.md (optional)"
    echo "  2. Wait for tonight at 21:00 CST (Phase 1)"
    echo "  3. Check memory/nightly-builds.md tomorrow morning"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Setup complete with $WARNINGS warnings (non-critical)"
    echo ""
    echo "System will work, but check warnings above."
    exit 0
else
    echo "❌ Setup incomplete: $ERRORS errors, $WARNINGS warnings"
    echo ""
    echo "Fix errors above before first run."
    exit 1
fi
