#!/bin/bash
# Claude Hours Task Enforcer - Ensures task discipline and single process
# Run this BEFORE starting Claude Hours to validate setup

CLAWD="/Users/jasontang/clawd"
STATE_DIR="$CLAWD/.claude/state"
TASK_FILE="$CLAWD/tasks/nightly-build.md"
LOGS_DIR="$CLAWD/.claude/logs"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ENFORCER] $1"; }
pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }

# === CHECK 1: No existing autonomous processes ===
check_no_existing_process() {
    local count=$(ps aux | grep "autonomous-loop-v3" | grep -v grep | wc -l)
    if [ "$count" -gt 0 ]; then
        fail "Found $count autonomous-loop processes running"
        echo "  Kill with: pkill -9 -f autonomous-loop-v3"
        return 1
    fi
    pass "No existing autonomous-loop processes"
    return 0
}

# === CHECK 2: Task file exists and is valid ===
check_task_defined() {
    if [ ! -f "$TASK_FILE" ]; then
        fail "Task file missing: $TASK_FILE"
        echo "  Create task file before starting Claude Hours"
        return 1
    fi
    
    # Check if task file has content (not just template)
    local content=$(cat "$TASK_FILE" | grep -v "^#" | grep -v "^$" | wc -l)
    if [ "$content" -lt 10 ]; then
        fail "Task file is empty (just template)"
        echo "  Fill in the task template before starting"
        return 1
    fi
    
    pass "Task file exists with content"
    return 0
}

# === CHECK 3: Task has acceptance criteria ===
check_acceptance_criteria() {
    local criteria_count=$(grep -c "^\- \[ \]" "$TASK_FILE" 2>/dev/null || echo 0)
    if [ "$criteria_count" -lt 2 ]; then
        warn "Only $criteria_count acceptance criteria found"
        echo "  Consider adding more specific criteria"
    else
        pass "Acceptance criteria defined: $criteria_count"
    fi
    return 0
}

# === CHECK 4: Verification command exists ===
check_verification() {
    if ! grep -q "Verification:" "$TASK_FILE"; then
        warn "No verification section found in task"
        echo "  Add verification commands to confirm success"
    else
        pass "Verification section exists"
    fi
    return 0
}

# === CHECK 5: State directory writable ===
check_state_dir() {
    mkdir -p "$STATE_DIR"
    if [ ! -w "$STATE_DIR" ]; then
        fail "State directory not writable: $STATE_DIR"
        return 1
    fi
    pass "State directory writable"
    return 0
}

# === CHECK 6: Logs directory exists ===
check_logs_dir() {
    mkdir -p "$LOGS_DIR"
    if [ ! -w "$LOGS_DIR" ]; then
        fail "Logs directory not writable: $LOGS_DIR"
        return 1
    fi
    pass "Logs directory exists"
    return 0
}

# === CHECK 7: Git status clean ===
check_git_clean() {
    cd "$CLAWD"
    local changes=$(git status --porcelain | wc -l)
    if [ "$changes" -gt 0 ]; then
        warn "Git has $changes uncommitted changes"
        echo "  Consider committing before Claude Hours"
    else
        pass "Git working tree clean"
    fi
    return 0
}

# === START FUNCTION ===
start_claude_hours() {
    log "Starting Claude Hours..."
    
    # Export current task to state
    echo "TASK_FILE=$TASK_FILE" > "$STATE_DIR/task-config.txt"
    echo "STARTED_AT=$(date +%s)" >> "$STATE_DIR/task-config.txt"
    echo "STARTED_BY=claude-hours-enforcer" >> "$STATE_DIR/task-config.txt"
    
    # Start watchdog (single supervisor)
    cd "$CLAWD"
    ./system/watchdog/process-watchdog.sh supervise &
    local watchdog_pid=$!
    
    echo "$watchdog_pid" > "$STATE_DIR/enforcer.pid"
    
    log "Claude Hours started (PID: $watchdog_pid)"
    pass "Claude Hours is running"
    echo ""
    echo "To check status: ps aux | grep watchdog"
    echo "To stop: pkill -9 -f process-watchdog"
}

# === MAIN ===
echo "╔══════════════════════════════════════════════════════════╗"
echo "║          🦞 Claude Hours Task Enforcer                   ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Date: $(date '+%Y-%m-%d %H:%M %Z')"
echo ""

local failed=0

check_no_existing_process || failed=1
check_task_defined || failed=1
check_acceptance_criteria
check_verification
check_state_dir || failed=1
check_logs_dir || failed=1
check_git_clean

echo ""

if [ "$failed" -eq 1 ]; then
    echo -e "${RED}❌ Pre-flight check FAILED${NC}"
    echo "Fix the issues above before starting Claude Hours"
    exit 1
fi

echo -e "${GREEN}✅ All checks passed${NC}"
echo ""

if [ "${1:-}" = "--start" ]; then
    read -p "Start Claude Hours? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_claude_hours
    else
        echo "Aborted"
        exit 0
    fi
else
    echo "To start Claude Hours, run:"
    echo "  $0 --start"
    echo ""
    echo "Or manually start watchdog:"
    echo "  cd $CLAWD && ./system/watchdog/process-watchdog.sh supervise &"
fi
