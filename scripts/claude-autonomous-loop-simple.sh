#!/bin/bash
# Claude Autonomous Loop v2.8 - Enhanced Reporting

CLAWD="/Users/jasontang/clawd"
CODEX="$CLAWD/scripts/codex-api.sh"
VIEWER="$CLAWD/scripts/claude-hours-viewer.sh"
NOTIFIER="$CLAWD/scripts/claude-hours-notifier.sh"
NIGHTLY_DIR="$CLAWD/nightly"
STATE_DIR="$CLAWD/.claude/state"
CYCLE_FILE="$STATE_DIR/cycle.txt"
SESSION_FILE="$STATE_DIR/current-session.json"

mkdir -p "$NIGHTLY_DIR" "$STATE_DIR"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
session_ts() { date -Iseconds; }
duration_ts() {
    local started="$1"
    local now=$(date +%s)
    local diff=$((now - started))
    local hours=$((diff / 3600))
    local mins=$(((diff % 3600) / 60))
    if [ $hours -gt 0 ]; then
        echo "${hours}h ${mins}m"
    else
        echo "${mins}m"
    fi
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
  "started_at": $(date +%s),
  "cycle": 0,
  "tasks_completed": [],
  "outputs": [],
  "milestones": [],
  "duration": "0m"
}
EOF
    
    log "Session initialized: $date_str (Focus: $focus)"
    
    "$NOTIFIER" notify_started "$focus"
}

# === UPDATE SESSION ===
update_session() {
    local task="$1"
    local result="$2"
    local summary="$3"
    local output_file="$4"
    
    local timestamp=$(session_ts)
    local cycle=$(cat "$CYCLE_FILE")
    local started_at=$(jq -r '.started_at' "$SESSION_FILE")
    local duration=$(duration_ts "$started_at")
    
    local task_count=$(jq '.tasks_completed | length' "$SESSION_FILE" 2>/dev/null || echo 0)
    
    local new_task=$(cat << TASKEOF
{
  "task": "$task",
  "result": "$result",
  "summary": "$summary",
  "timestamp": "$timestamp",
  "cycle": $cycle,
  "duration": "$duration",
  "output": "$output_file"
}
TASKEOF
)
    
    if [ "$result" = "success" ]; then
        jq --argjson task "$new_task" \
           --arg summary "$summary" \
           --arg output "$output_file" \
           '.tasks_completed += [$task] | .milestones += [$summary] | .outputs += [$output]' \
           "$SESSION_FILE" > "$SESSION_FILE.tmp" 2>/dev/null
        mv "$SESSION_FILE.tmp" "$SESSION_FILE"
    fi
    
    # Update duration
    jq --arg duration "$duration" '.duration = $duration' "$SESSION_FILE" > "$SESSION_FILE.tmp" 2>/dev/null
    mv "$SESSION_FILE.tmp" "$SESSION_FILE"
    
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
    
    # Get outputs
    local outputs=$(jq -r '.outputs[] // ""' "$SESSION_FILE" 2>/dev/null | grep -v '^$' | head -10 | sed 's/^/- /')
    
    # Format time range
    local start_time=$(date -d @$started_at '+%I:%M %p' 2>/dev/null || echo "21:00")
    local end_time=$(date '+%I:%M %p')
    
    # Build JSON report
    cat > "$report_file" << EOF
{
  "timestamp": "$timestamp",
  "session_id": "claude-hours-$date_str",
  "focus": "$focus",
  "total_cycles": $cycle,
  "tasks_completed": $tasks_done,
  "duration": "$duration",
  "outputs": $(jq '.outputs | tojson' "$SESSION_FILE" 2>/dev/null || echo "[]"),
  "milestones": $(jq '.milestones | tojson' "$SESSION_FILE" 2>/dev/null || echo "[]"),
  "session_summary": {
    "date": "$date_str",
    "focus": "$focus",
    "total_cycles": $cycle,
    "tasks_completed": $tasks_done,
    "duration": "$duration",
    "time_range": "$start_time → $end_time"
  },
  "time_series": {
    "start": "$(date -d @$started_at '+%Y-%m-%dT%H:%M:%S-06:00')",
    "end": "$(date -d @$timestamp '+%Y-%m-%dT%H:%M:%S-06:00')",
    "duration_seconds": $(($(date +%s) - started_at))
  }
}
EOF
    
    log "Session finalized: $date_str ($tasks_done tasks in $cycle cycles, $duration)"
    
    # Notify complete with outputs
    "$NOTIFIER" notify_complete "$cycle" "$tasks_done" "$focus" "$duration" "$outputs" "$start_time" "$end_time"
    
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
            0)  CONTEXT=$(ls "$CLAWD/scripts/" 2>/dev/null | head -5 | tr '\n' ',' | sed 's/,$//')
                PROMPT="Analyze scripts in /Users/jasontang/clawd/scripts/: $CONTEXT. Identify 2-3 scripts needing improvement and recommend specific changes."
                TASK_TYPE="Script Analysis"
                OUTPUT_FILE="scripts/improvement-notes.md"
                ;;
            1)  CONTEXT=$(ls "$CLAWD/docs/guides/" 2>/dev/null | head -5 | tr '\n' ',' | sed 's/,$//')
                PROMPT="Review docs in /Users/jasontang/clawd/docs/guides/: $CONTEXT. List gaps and suggest 2 new guides to create."
                TASK_TYPE="Documentation Review"
                OUTPUT_FILE="docs/guide-gaps.md"
                ;;
            2)  CONTEXT=$(ls "$CLAWD/memory/" 2>/dev/null | head -5 | tr '\n' ',' | sed 's/,$//')
                PROMPT="Analyze recent memory files: $CONTEXT. Identify patterns in work and suggest memory improvements."
                TASK_TYPE="Memory Analysis"
                OUTPUT_FILE="memory/patterns-identified.md"
                ;;
            3)  CONTEXT=$(ls -d "$CLAWD"/*/ 2>/dev/null | head -5 | tr '\n' ',' | sed 's/,$//')
                PROMPT="Review workspace structure: $CONTEXT. Note reorganization opportunities and file organization improvements."
                TASK_TYPE="Workspace Audit"
                OUTPUT_FILE="system/reorg-notes.md"
                ;;
            4)  CONTEXT=$(ls "$CLAWD/skills/" 2>/dev/null | head -5 | tr '\n' ',' | sed 's/,$//')
                PROMPT="Evaluate skills directory: $CONTEXT. List top capabilities and identify 2 skill gaps to fill."
                TASK_TYPE="Skill Assessment"
                OUTPUT_FILE="skills/gap-analysis.md"
                ;;
        esac
        
        TASK_DESC="Cycle $CYCLE: $TASK_TYPE"
        log "Executing: $TASK_DESC"
        
        cd "$CLAWD"
        
        if $CODEX --verbose "$PROMPT" >> "$STATE_DIR/codex.log" 2>&1; then
            SUMMARY="$TASK_TYPE complete — recommendations generated"
            log "Task completed: $TASK_DESC"
            update_session "$TASK_TYPE" "success" "$SUMMARY" "$OUTPUT_FILE"
            "$NOTIFIER" notify_cycle "$CYCLE" "$TASK_TYPE" "Success" "$(jq '.tasks_completed | length' "$SESSION_FILE")" "$focus" "$(jq -r '.duration' "$SESSION_FILE")"
        else
            SUMMARY="$TASK_TYPE encountered issues"
            log "Task had issues: $TASK_DESC"
            update_session "$TASK_TYPE" "fail" "$SUMMARY" ""
            "$NOTIFIER" notify_cycle "$CYCLE" "$TASK_TYPE" "Issues" "$(jq '.tasks_completed | length' "$SESSION_FILE")" "$focus" "$(jq -r '.duration' "$SESSION_FILE")"
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
        ;;
esac
