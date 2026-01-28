#!/bin/bash
#
# Claude Autonomous Loop v2.0
# Inspired by GSD, Ralph-TUI, and Ouroboros
# Meta-orchestration with intent detection, task beads, and self-improvement
#

set -euo pipefail

# === CONFIGURATION ===
CONFIG_FILE="$HOME/.claude/autonomous-config.json"
LOG_DIR="$HOME/.claude/logs"
STATE_DIR="$HOME/.claude/state"
AUDIT_LOG="$LOG_DIR/decisions.jsonl"
WORKSPACE="/Users/jasontang/clawd"
NIGHTLY_DIR="$WORKSPACE/nightly"
BEADS_FILE="$STATE_DIR/beads.jsonl"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# === LOGGING ===
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date -Iseconds)
    echo "$timestamp|$level|$message" >> "$LOG_DIR/loop.log"
    echo -e "${CYAN}[$(date '+%H:%M')]${NC} $message"
}

log_decision() {
    local intent="$1"
    local confidence="$2"
    local action="$3"
    local reasoning="$4"
    local timestamp=$(date -Iseconds)
    
    cat >> "$AUDIT_LOG" << EOF
{"timestamp":"$timestamp","intent":"$intent","confidence":$confidence,"action":"$action","reasoning":"$reasoning"}
EOF
}

# === INTENT DETECTION ===
detect_intent() {
    local context="$1"
    
    # Pattern matching with confidence scores
    if echo "$context" | grep -qi "build\|create\|implement\|make"; then
        echo "create_project|85|gsd-ralph-full|Build/Create pattern detected"
    elif echo "$context" | grep -qi "fix\|debug\|error\|broken\|issue"; then
        echo "debug_fix|80|quick-fix|Fix/Debug pattern detected"
    elif echo "$context" | grep -qi "research\|look up\|find\|search"; then
        echo "research|75|research-tool|Research pattern detected"
    elif echo "$context" | grep -qi "improve\|optimize\|refactor\|better"; then
        echo "optimize|78|gsd-planning|Optimization pattern detected"
    elif echo "$context" | grep -qi "plan\|design\|architecture\|structure"; then
        echo "planning|82|gsd-planning|Planning pattern detected"
    else
        echo "general|50|quick-check|Uncertain intent, default to check"
    fi
}

# === QUALITY GATES ===
check_quality_gates() {
    local task_type="$1"
    local result="$2"
    
    # Universal gates
    if [ "$result" -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

# === BEAD SYSTEM (Ralph-TUI inspired) ===
create_bead() {
    local title="$1"
    local description="$2"
    local type="${3:-task}"
    local priority="${4:-2}"
    local depends_on="${5:-}"
    
    local bead_id="bead-$(date +%s)-$$"
    
    cat >> "$BEADS_FILE" << EOF
{"id":"$bead_id","type":"$type","title":"$title","description":"$description","priority":$priority,"status":"pending","depends_on":"$depends_on","created":"$(date -Iseconds)"}
EOF
    
    echo "$bead_id"
}

get_next_bead() {
    # Get the highest priority bead with no unresolved dependencies
    local bead=$(cat "$BEADS_FILE" | jq -s '
        sort_by(.priority) |
        .[] |
        select(.status == "pending") |
        select(.depends_on == "" or (.depends_on | test("^[^{]*completed[^{]*" ; ""))) |
        first |
        .id' 2>/dev/null || echo "")
    
    echo "$bead"
}

complete_bead() {
    local bead_id="$1"
    local result="$2"
    
    jq --arg id "$bead_id" --arg result "$result" \
        '(.[] | select(.id == $id)) |= .status = "completed" | .result = $result' \
        "$BEADS_FILE" > "$BEADS_FILE.tmp" 2>/dev/null
    
    mv "$BEADS_FILE.tmp" "$BEADS_FILE"
}

# === AUTONOMOUS TASKS (GSD/Ralph inspired) ===
generate_task_bead() {
    local focus_area="$1"
    
    local tasks_schema=(
        "Review scripts directory for unused or redundant scripts"
        "Check docs/ for outdated or missing documentation"
        "Analyze memory/ for patterns to add to MEMORY.md"
        "Review skills/ for opportunities to improve or consolidate"
        "Check ~/.claude/ for state that needs cleanup"
    )
    
    local tasks_backend=(
        "Create a utility script for common operations"
        "Add error handling to an existing script"
        "Improve logging in a script"
        "Create documentation for undocumented scripts"
    )
    
    local tasks_research=(
        "Research best practices for automation scripts"
        "Look up new CLI tools that could improve workflow"
        "Find patterns in our workspace that could be optimized"
    )
    
    local tasks_personality=(
        "Write a reflection on recent work in personality-notes.md"
        "Document a new preference discovered in personality-notes.md"
        "Add to presence.md about evolving sense of self"
    )
    
    local tasks_workspace=(
        "Check for orphaned files at root"
        "Review directory structure for improvement"
        "Add a useful alias or function to shell config"
        "Clean up temporary files in /tmp"
    )
    
    case "$focus_area" in
        "system")
            echo "${tasks_schema[$RANDOM % ${#tasks_schema[@]}]}"
            ;;
        "backend")
            echo "${tasks_backend[$RANDOM % ${#tasks_backend[@]}]}"
            ;;
        "research")
            echo "${tasks_research[$RANDOM % ${#tasks_research[@]}]}"
            ;;
        "personality")
            echo "${tasks_personality[$RANDOM % ${#tasks_personality[@]}]}"
            ;;
        "workspace")
            echo "${tasks_workspace[$RANDOM % ${#tasks_workspace[@]}]}"
            ;;
        *)
            echo "${tasks_schema[$RANDOM % ${#tasks_schema[@]}]}"
            ;;
    esac
}

# === MAIN AUTONOMOUS LOOP ===
main() {
    # Setup
    mkdir -p "$LOG_DIR" "$STATE_DIR" "$NIGHTLY_DIR"
    touch "$AUDIT_LOG" "$BEADS_FILE"
    
    log "INFO" "Starting Claude Autonomous Loop v2.0 (GSD+Ralph+Ouroboros inspired)"
    
    local cycle=0
    local tasks_completed=0
    
    while true; do
        cycle=$((cycle + 1))
        
        # Check if Claude Hours
        HOUR=$(TZ='America/Chicago' date +%H)
        if [ "$HOUR" -ge 21 ] || [ "$HOUR" -lt 8 ]; then
            log "INFO" "Claude Hours active - cycle $cycle"
            
            # === STEP 1: Intent Detection ===
            local context="Autonomous improvement during Claude Hours cycle $cycle"
            local intent_result=$(detect_intent "$context")
            local intent=$(echo "$intent_result" | cut -d'|' -f1)
            local confidence=$(echo "$intent_result" | cut -d'|' -f2)
            local workflow=$(echo "$intent_result" | cut -d'|' -f3)
            local reasoning=$(echo "$intent_result" | cut -d'|' -f4)
            
            log_decision "$intent" "$confidence" "$workflow" "$reasoning"
            
            # === STEP 2: Focus Rotation ===
            local focus_areas=("system" "backend" "research" "personality" "workspace")
            local focus="${focus_areas[$((cycle % 5))]}"
            
            log "INFO" "Focus: $focus (cycle $cycle)"
            
            # === STEP 3: Generate Task ===
            local task_description=$(generate_task_bead "$focus")
            local bead_id=$(create_bead "$task_description" "Autonomous task from Claude Hours" "task" 2 "")
            
            log "INFO" "Created bead: $bead_id - $task_description"
            
            # === STEP 4: Execute via Codex ===
            local timestamp=$(date +%Y-%m-%d-%H-%M)
            local worktree="/tmp/claude-autonomous-$timestamp"
            mkdir -p "$worktree"
            cd "$worktree"
            git init -q
            
            log "INFO" "Executing: $task_description"
            
            # Execute with PTY via script
            if script -q /dev/null codex --full-auto "Task: $task_description. Work in $worktree. Create useful output. Report what was done in 2-3 sentences." >> "$LOG_DIR/codex.log" 2>&1; then
                log "SUCCESS" "Task completed: $task_description"
                complete_bead "$bead_id" "success"
                tasks_completed=$((tasks_completed + 1))
            else
                log "WARN" "Task had issues: $task_description"
                complete_bead "$bead_id" "partial"
            fi
            
            # === STEP 5: Update State ===
            local state_file="$STATE_DIR/loop-state.json"
            cat > "$state_file" << EOF
{
    "cycle": $cycle,
    "tasks_completed": $tasks_completed,
    "last_activity": "$(date -Iseconds)",
    "current_focus": "$focus",
    "status": "active"
}
EOF
            
            # === STEP 6: Log to Nightly ===
            local nightly_file="$NIGHTLY_DIR/$(date +%Y-%m-%d).json"
            if [ -f "$nightly_file" ]; then
                # Append to existing
                jq --argjson cycle "$cycle" --arg task "$task_description" --arg result "success" \
                    '.status_updates += [{"milestone": "Cycle \($cycle)", "accomplishments": $task, "next_steps": "Continue autonomous operation", "blockers": "None"}]' \
                    "$nightly_file" > "$nightly_file.tmp" 2>/dev/null
                mv "$nightly_file.tmp" "$nightly_file"
            fi
            
            # Cleanup
            cd "$WORKSPACE"
            
        else
            log "INFO" "Outside Claude Hours - sleeping..."
        fi
        
        # === SLEEP INTERVAL ===
        local interval=15
        sleep "${interval}m"
    done
}

# === DAEMON CONTROL ===
case "${1:-}" in
    --daemon)
        nohup "$0" >> "$LOG_DIR/daemon.log" 2>&1 &
        echo $$ > "$STATE_DIR/daemon.pid"
        log "INFO" "Daemon started with PID $$"
        ;;
    --stop)
        if [ -f "$STATE_DIR/daemon.pid" ]; then
            kill "$(cat "$STATE_DIR/daemon.pid")" 2>/dev/null || true
            rm "$STATE_DIR/daemon.pid"
            log "INFO" "Daemon stopped"
        fi
        ;;
    --status)
        if [ -f "$STATE_DIR/daemon.pid" ] && kill -0 "$(cat "$STATE_DIR/daemon.pid")" 2>/dev/null; then
            echo "Running with PID $(cat $STATE_DIR/daemon.pid)"
            cat "$STATE_DIR/loop-state.json" 2>/dev/null | jq '.'
        else
            echo "Not running"
        fi
        ;;
    --stats)
        echo "=== Claude Autonomous Loop Stats ==="
        echo "Cycles: $(jq '.cycle' "$STATE_DIR/loop-state.json" 2>/dev/null || echo 0)"
        echo "Tasks: $(jq '.tasks_completed' "$STATE_DIR/loop-state.json" 2>/dev/null || echo 0)"
        echo "Beads: $(wc -l < "$BEADS_FILE" 2>/dev/null || echo 0)"
        echo "Decisions: $(wc -l < "$AUDIT_LOG" 2>/dev/null || echo 0)"
        ;;
    *)
        main
        ;;
esac
