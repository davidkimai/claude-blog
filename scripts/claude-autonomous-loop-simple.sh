#!/bin/bash
# Claude Autonomous Loop v2.7 - Time Series Notifications
set -euo pipefail

CLAWD="/Users/jasontang/clawd"
CODEX="$CLAWD/scripts/codex-api.sh"
VIEWER="$CLAWD/scripts/claude-hours-viewer.sh"
NOTIFIER="$CLAWD/scripts/claude-hours-notifier.sh"
NIGHTLY_DIR="$CLAWD/nightly"
STATE_DIR="$CLAWD/.claude/state"
CYCLE_FILE="$STATE_DIR/cycle.txt"
SESSION_FILE="$STATE_DIR/current-session.json"

mkdir -p "$NIGHTLY_DIR" "$STATE_DIR"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

ts() { date '+%Y-%m-%d %H:%M:%S'; }
session_ts() { date -Iseconds; }
duration_ts() {
    local started="$1"
    local now=$(date +%s)
    local diff=$((now - started))
    local mins=$((diff / 60))
    local secs=$((diff % 60))
    echo "${mins}m ${secs}s"
}

log() { echo "[$(ts)] $1" >> "$STATE_DIR/loop.log"; }

# === INIT SESSION ===
init_session() {
    local focus="$1"
    local date_str=$(date +%Y-%m-%d)
    local timestamp=$(session_ts)
    
    cat > "$SESSION_FILE" << EOF
{
  "timestamp": "$timestamp",
  "session_id": "claude-hours-$date_str",
  "focus": "$focus",
  "started_at": "$(date +%s)",
  "cycle": 0,
  "tasks_completed": [],
  "outputs": [],
  "milestones": []
}
EOF
    
    log "Session initialized: $date_str (Focus: $focus)"
    echo -e "${GREEN}[$(ts)] Session started: $focus${NC}"
    
    # Notify session start
    "$NOTIFIER" notify_started "$focus"
}

# === UPDATE SESSION ===
update_session() {
    local task="$1"
    local result="$2"
    local summary="$3"
    
    local timestamp=$(session_ts)
    local cycle=$(cat "$CYCLE_FILE")
    local started_at=$(jq -r '.started_at' "$SESSION_FILE")
    local duration=$(duration_ts "$started_at")
    
    local tasks=$(cat "$SESSION_FILE" 2>/dev/null || echo "{}")
    local task_count=$(jq '.tasks_completed | length' "$SESSION_FILE" 2>/dev/null || echo 0)
    
    local new_task=$(cat << TASKEOF
{
  "task": "$task",
  "result": "$result",
  "summary": "$summary",
  "timestamp": "$timestamp",
  "cycle": $cycle,
  "duration": "$duration"
}
TASKEOF
)
    
    if [ "$result" = "success" ]; then
        jq --argjson task "$new_task" \
           --arg summary "$summary" \
           '.tasks_completed += [$task] | .milestones += [$summary]' \
           "$SESSION_FILE" > "$SESSION_FILE.tmp" 2>/dev/null
        mv "$SESSION_FILE.tmp" "$SESSION_FILE"
    fi
    
    log "Task updated: $task -> $result ($duration)"
}

# === FINALIZE SESSION ===
finalize_session() {
    local date_str=$(date +%Y-%m-%d)
    local report_file="$NIGHTLY_DIR/${date_str}.json"
    
    if [ ! -f "$SESSION_FILE" ]; then
        echo "No active session to finalize"
        return
    fi
    
    local cycle=$(cat "$CYCLE_FILE")
    local tasks_done=$(jq '.tasks_completed | length' "$SESSION_FILE" 2>/dev/null || echo 0)
    local focus=$(jq -r '.focus' "$SESSION_FILE" 2>/dev/null || echo "General")
    local started_at=$(jq -r '.started_at' "$SESSION_FILE")
    local duration=$(duration_ts "$started_at")
    local timestamp=$(session_ts)
    
    cat > "$report_file" << EOF
{
  "timestamp": "$timestamp",
  "session_id": "claude-hours-$date_str",
  "focus": "$focus",
  "total_cycles": $cycle,
  "tasks_completed": $tasks_done,
  "duration": "$duration",
  "completed_tasks": $(jq '.tasks_completed | tojson' "$SESSION_FILE" 2>/dev/null || echo "[]"),
  "milestones": $(jq '.milestones | tojson' "$SESSION_FILE" 2>/dev/null || echo "[]"),
  "session_summary": {
    "date": "$date_str",
    "focus": "$focus",
    "total_cycles": $cycle,
    "tasks_completed": $tasks_done,
    "duration": "$duration",
    "started_at": "$(date -d @$started_at '+%Y-%m-%d %H:%M:%S')",
    "completed_at": "$(date -d @$timestamp '+%Y-%m-%d %H:%M:%S')"
  },
  "time_series": {
    "start": "$(date -d @$started_at '+%Y-%m-%dT%H:%M:%S-06:00')",
    "end": "$(date -d @$timestamp '+%Y-%m-%dT%H:%M:%S-06:00')",
    "duration_seconds": $(($(date +%s) - started_at))
  }
}
EOF
    
    log "Session finalized: $date_str ($tasks_done tasks in $cycle cycles, $duration)"
    echo -e "${GREEN}[$(ts)] Session finalized: $report_file${NC}"
    
    # Notify session complete
    "$NOTIFIER" notify_complete "$cycle" "$tasks_done" "$focus" "$duration"
    
    rm -f "$SESSION_FILE"
}

# === MAIN LOOP ===
main() {
    local focus="$1:-General"
    
    init_session "$focus"
    
    [ -f "$CYCLE_FILE" ] && CYCLE=$(cat "$CYCLE_FILE") || CYCLE=0
    
    HOUR=$(TZ='America/Chicago' date +%H)
    if [ "$HOUR" -ge 21 ] || [ "$HOUR" -lt 8 ]; then
        CYCLE=$((CYCLE + 1))
        echo "$CYCLE" > "$CYCLE_FILE"
        log "Cycle $CYCLE: Claude Hours active"
        
        TASK_NUM=$((CYCLE % 5))
        case "$TASK_NUM" in
            0)  CONTEXT=$(ls "$CLAWD/scripts/" 2>/dev/null | tr '\n' ',' | sed 's/,$//')
                PROMPT="Analyze /Users/jasontang/clawd/scripts/: $CONTEXT. Which need improvement? Give 2 specific recommendations."
                TASK_TYPE="Script Analysis"
                ;;
            1)  CONTEXT=$(ls "$CLAWD/docs/guides/" 2>/dev/null | tr '\n' ',' | sed 's/,$//')
                PROMPT="Review docs in /Users/jasontang/clawd/docs/guides/: $CONTEXT. Note gaps and missing guides."
                TASK_TYPE="Documentation Review"
                ;;
            2)  CONTEXT=$(ls "$CLAWD/memory/" 2>/dev/null | tr '\n' ',' | sed 's/,$//')
                PROMPT="Analyze memory files: $CONTEXT. Identify patterns and suggest improvements."
                TASK_TYPE="Memory Analysis"
                ;;
            3)  CONTEXT=$(ls -d "$CLAWD"/*/ 2>/dev/null | tr '\n' ',' | sed 's/,$//')
                PROMPT="Review workspace structure: $CONTEXT. Note reorganization opportunities."
                TASK_TYPE="Workspace Audit"
                ;;
            4)  CONTEXT=$(ls "$CLAWD/skills/" 2>/dev/null | tr '\n' ',' | sed 's/,$//')
                PROMPT="Evaluate skills: $CONTEXT. List top 5 capabilities and identify gaps."
                TASK_TYPE="Skill Assessment"
                ;;
        esac
        
        TASK_DESC="Cycle $CYCLE: $TASK_TYPE"
        log "Executing: $TASK_DESC"
        
        cd "$CLAWD"
        
        if $CODEX --verbose "$PROMPT" >> "$STATE_DIR/codex.log" 2>&1; then
            SUMMARY="Completed $TASK_TYPE - improvements identified"
            log "Task completed: $TASK_DESC"
            update_session "$TASK_DESC" "success" "$SUMMARY"
            "$NOTIFIER" notify_cycle "$CYCLE" "$TASK_TYPE" "Success" "$(jq '.tasks_completed | length' "$SESSION_FILE")" "$focus"
        else
            SUMMARY="$TASK_TYPE encountered issues"
            log "Task had issues: $TASK_DESC"
            update_session "$TASK_DESC" "fail" "$SUMMARY"
            "$NOTIFIER" notify_cycle "$CYCLE" "$TASK_TYPE" "Issues encountered" "$(jq '.tasks_completed | length' "$SESSION_FILE")" "$focus"
        fi
    else
        log "Outside Claude Hours, checking for active session..."
        if [ -f "$SESSION_FILE" ]; then
            finalize_session
        fi
        log "Sleeping..."
    fi
    
    log "Cycle $CYCLE complete"
}

# === COMMANDS ===
case "${1:-run}" in
    run)
        main "${2:-General}"
        ;;
    init)
        init_session "${2:-General}"
        ;;
    finalize)
        finalize_session
        ;;
    status)
        if [ -f "$SESSION_FILE" ]; then
            cat "$SESSION_FILE" | jq '.'
        else
            echo "No active session"
        fi
        ;;
    view)
        "$VIEWER" "${2:-today}"
        ;;
    history)
        "$VIEWER" recent "${2:-10}"
        ;;
    weekly)
        "$VIEWER" weekly
        ;;
    help|*)
        echo "Usage: $0 <run|init|finalize|status|view|history|weekly|help>"
        echo "  run [focus]     - Run one cycle (default)"
        echo "  init <focus>    - Start new session"
        echo "  finalize        - End session and save report"
        echo "  status          - Show current session"
        echo "  view [date]     - View session (today or YYYY-MM-DD)"
        echo "  history [N]     - View recent sessions"
        echo "  weekly          - Weekly summary"
        ;;
esac
