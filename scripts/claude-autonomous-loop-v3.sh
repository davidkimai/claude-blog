#!/bin/bash
# Claude Autonomous Loop v3.0 PRO - Continuous Self-Building System
# "I want to wake up surprised by you building your own systems"
# Runs continuously during Claude Hours, building systems FOR Claude

CLAWD="/Users/jasontang/clawd"
CODEX="$CLAWD/scripts/codex-api.sh"
VIEWER="$CLAWD/scripts/claude-hours-viewer.sh"
NOTIFIER="$CLAWD/scripts/claude-hours-notifier.sh"
VOICE="$CLAWD/scripts/claude-voice.sh"
BUILDER="$CLAWD/scripts/claude-nightly-builder.sh"
NIGHTLY_DIR="$CLAWD/nightly"
STATE_DIR="$CLAWD/.claude/state"
LOGS_DIR="$CLAWD/.claude/logs"
CYCLE_FILE="$STATE_DIR/cycle.txt"
SESSION_FILE="$STATE_DIR/current-session.json"

mkdir -p "$NIGHTLY_DIR" "$STATE_DIR" "$LOGS_DIR"

# Check if voice is available
VOICE_ENABLED=false
if [ -x "$VOICE" ]; then
    VOICE_ENABLED=true
fi

ts() { date '+%Y-%m-%d %H:%M:%S'; }
session_ts() { date -Iseconds; }
log() { echo "[$(ts)] $1" >> "$LOGS_DIR/autonomous-loop.log"; }

# === INIT SESSION ===
init_session() {
    local focus="$1"
    local date_str=$(date +%Y-%m-%d)
    local timestamp=$(session_ts)
    
    # Reset cycle for new session
    echo "0" > "$CYCLE_FILE"
    
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
    
    # Start notification handled by cron - avoid duplicate
    # if [ -x "$NOTIFIER" ]; then
    #     "$NOTIFIER" notify_started "$focus"
    # fi
    
    if $VOICE_ENABLED; then
        $VOICE started "$focus"
    fi
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
    local now=$(date +%s)
    local diff=$((now - started_at))
    local hours=$((diff / 3600))
    local mins=$(((diff % 3600) / 60))
    local duration="${hours}h ${mins}m"
    [ $hours -eq 0 ] && duration="${mins}m"
    
    local task_count=$(jq '.tasks_completed | length' "$SESSION_FILE" 2>/dev/null || echo 0)
    
    if [ "$result" = "success" ]; then
        jq --arg task "$task" \
           --arg result "$result" \
           --arg summary "$summary" \
           --arg output "$output_file" \
           --arg timestamp "$timestamp" \
           --arg cycle "$cycle" \
           --arg duration "$duration" \
           '.tasks_completed += [{"task": $task, "result": $result, "summary": $summary, "output": $output, "timestamp": $timestamp, "cycle": $cycle, "duration": $duration}] | .milestones += [$summary] | .outputs += [$output]' \
           "$SESSION_FILE" > "$SESSION_FILE.tmp" 2>/dev/null
        mv "$SESSION_FILE.tmp" "$SESSION_FILE"
    fi
    
    jq --arg duration "$duration" '.duration = $duration' "$SESSION_FILE" > "$SESSION_FILE.tmp" 2>/dev/null
    mv "$SESSION_FILE.tmp" "$SESSION_FILE"
    
    log "Task updated: $task -> $result ($duration)"
}

# === FINALIZE SESSION ===
finalize_session() {
    local timestamp=$(session_ts)
    local started_at=$(jq -r '.started_at' "$SESSION_FILE")
    local tasks_done=$(jq '.tasks_completed | length' "$SESSION_FILE")
    local duration=$(jq -r '.duration' "$SESSION_FILE")
    local focus=$(jq -r '.focus' "$SESSION_FILE")
    local start_time=$(date -d "@$started_at" '+%I:%M %p' 2>/dev/null || date -r "$started_at" '+%I:%M %p')
    local end_time=$(date '+%I:%M %p')
    local outputs=$(jq -r '.outputs | join("\n")' "$SESSION_FILE" 2>/dev/null | head -5)
    
    log "Finalizing session after $tasks_done tasks"
    
    if [ -x "$NOTIFIER" ]; then
        "$NOTIFIER" notify_complete "$CYCLE" "$tasks_done" "$focus" "$duration" "$outputs" "$start_time" "$end_time"
    fi
    
    if $VOICE_ENABLED; then
        $VOICE complete "$tasks_done tasks completed"
    fi
}

# === GET CURRENT PHASE ===
get_phase() {
    local hour=$(TZ='America/Chicago' date +%H)
    
    if [ "$hour" -ge 21 ] && [ "$hour" -lt 22 ]; then
        echo "1-learning"
    elif [ "$hour" -ge 22 ] && [ "$hour" -lt 24 ]; then
        echo "2-deep"
    elif [ "$hour" -ge 0 ] && [ "$hour" -lt 2 ]; then
        echo "2-deep"
    elif [ "$hour" -ge 2 ] && [ "$hour" -lt 4 ]; then
        echo "3-self-build"
    elif [ "$hour" -ge 4 ] && [ "$hour" -lt 6 ]; then
        echo "3-optimize"
    elif [ "$hour" -ge 6 ] && [ "$hour" -lt 8 ]; then
        echo "4-handoff"
    else
        echo "0-sleep"
    fi
}

# === EXECUTE TASK BY PHASE ===
execute_task() {
    local phase="$1"
    local cycle="$2"
    
    log "Executing phase: $phase (cycle $cycle)"
    
    case "$phase" in
        1-learning)
            # Phase 1: Learning & Setup
            local task_type="Learning Extraction"
            local prompt="Review Claude's memory files and self-review. Identify 3 patterns and update memory/self-review.md with any MISS/FIX entries."
            local output_file="memory/self-review.md"
            ;;
        2-deep)
            # Phase 2: Identity & Skills
            local cycle_mod=$((cycle % 4))
            case "$cycle_mod" in
                0)  task_type="Identity Expansion"
                    prompt="Expand identity/IDENTITY_EXPANDED.md with a new section on 'How I Relate to X' (pick X: complexity, ambiguity, collaboration)"
                    output_file="identity/IDENTITY_EXPANDED.md"
                    ;;
                1)  task_type="Skills Audit"
                    prompt="Review skills/gap-analysis.md. Create a plan to address one skill gap."
                    output_file="skills/gap-plan.md"
                    ;;
                2)  task_type="Tools Improvement"
                    prompt="Analyze scripts/improvement-notes.md. Implement one improvement to an existing script."
                    output_file="scripts/"
                    ;;
                3)  task_type="Documentation"
                    prompt="Review docs/guide-gaps.md. Create one new guide file."
                    output_file="docs/guides/"
                    ;;
            esac
            ;;
        3-self-build|3-optimize)
            # Phase 3: Claude Builds FOR Claude
            local today=$(date +%Y-%m-%d)
            local build_log="$CLAWD/nightly-builds/$today.md"
            
            if [ ! -f "$build_log" ]; then
                log "Starting Claude Self-Build..."
                if $VOICE_ENABLED; then
                    $VOICE speak "Entering creative mode. Building something for myself."
                fi
                
                $BUILDER run >> "$LOGS_DIR/nightly-builder.log" 2>&1
                
                if [ -f "$build_log" ]; then
                    update_session "Claude Self-Build" "success" "Built new tool for Claude" "$build_log"
                    if $VOICE_ENABLED; then
                        $VOICE build "I built something new. Check the nightly builds."
                    fi
                    return 0
                fi
            fi
            
            # If build already done, do optimization work
            local task_type="Claude Self-Optimization"
            local prompt="Run Claude Self-Diagnostic: test scripts/health-monitor.sh and fix any issues found."
            output_file="system/health/diagnostics.md"
            ;;
        4-handoff)
            # Phase 4: Synthesis & Intel
            local task_type="Morning Intel"
            local prompt="Generate morning intel summary with GitHub trends, HN top stories, and AI news."
            output_file="memory/morning-intel.md"
            ;;
        *)
            log "Outside Claude Hours, wrapping up..."
            return 1
            ;;
    esac
    
    # Execute the task via Codex
    cd "$CLAWD"
    
    log "Running: $task_type"
    
    if $CODEX --verbose "$prompt" >> "$LOGS_DIR/codex.log" 2>&1; then
        update_session "$task_type" "success" "$task_type complete — recommendations generated" "$output_file"
        log "Task complete: $task_type"
        
        # Notifications handled by cron (0, 4, 8 AM checkpoints) - no per-task spam
        return 0
    else
        update_session "$task_type" "fail" "$task_type encountered issues" ""
        log "Task had issues: $task_type"
        return 1
    fi
}

# === CONTINUOUS MAIN LOOP ===
main() {
    local focus="${1:-Proactive Self-Improvement}"
    
    # Check if already running (PID > 0 and process exists)
    if [ -f "$CYCLE_FILE" ]; then
        local existing_pid=$(cat "$CYCLE_FILE" 2>/dev/null | tr -d '[:space:]')
        if [ -n "$existing_pid" ] && [ "$existing_pid" != "0" ] && kill -0 "$existing_pid" 2>/dev/null; then
            log "Already running (PID: $existing_pid), exiting"
            exit 0
        fi
    fi
    
    # Write our PID
    echo $$ > "$CYCLE_FILE"
    
    init_session "$focus"
    
    log "=== Claude Hours v3.0 PRO Started ==="
    log "Continuous mode: Will run until 8 AM or killed"
    
    if $VOICE_ENABLED; then
        $VOICE started "$focus"
    fi
    
    # Continuous loop
    while true; do
        local hour=$(TZ='America/Chicago' date +%H)
        
        # Check if Claude Hours are active
        if [ "$hour" -ge 21 ] || [ "$hour" -lt 8 ]; then
            local phase=$(get_phase)
            
            # Get cycle number
            [ -f "$CYCLE_FILE" ] && CYCLE=$(cat "$CYCLE_FILE") || CYCLE=0
            CYCLE=$((CYCLE + 1))
            echo "$CYCLE" > "$CYCLE_FILE"
            
            log "=== Cycle $CYCLE ($phase) ==="
            
            # Execute task for current phase
            execute_task "$phase" "$CYCLE"
            
            # Voice checkpoint at specific cycles
            if [ $((CYCLE % 8)) -eq 0 ] && $VOICE_ENABLED; then
                local tasks=$(jq '.tasks_completed | length' "$SESSION_FILE")
                $VOICE cycle "$CYCLE cycles, $tasks tasks completed"
            fi
            
            # Brief pause between cycles
            sleep 2
            
        else
            # Outside Claude Hours
            log "Outside Claude Hours (hour: $hour), wrapping up..."
            finalize_session
            log "=== Claude Hours Complete ==="
            exit 0
        fi
    done
}

# === COMMANDS ===
case "${1:-run}" in
    run)
        main "${2:-Proactive Self-Improvement}"
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
    help|*)
        echo "Claude Hours v3.0 PRO - Continuous Self-Building"
        echo ""
        echo "Usage: $0 <run|init|finalize|status|help>"
        echo ""
        echo "Features:"
        echo "  - Continuous loop (runs all night)"
        echo "  - Phase-based task execution"
        echo "  - Claude Self-Building (2-6 AM)"
        echo "  - Voice announcements"
        echo "  - Automatic notifications"
        ;;
esac
