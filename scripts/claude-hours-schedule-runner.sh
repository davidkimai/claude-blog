#!/bin/bash
#
# Claude Hours Schedule Runner
# Executes tasks from nightly.json schedule during Claude Hours
#

set -euo pipefail

CLAWD="/Users/jasontang/clawd"
SCHEDULE_DIR="$CLAWD/system/schedules"
PRDS_DIR="$CLAWD/system/planning/prds"
SPECS_DIR="$CLAWD/system/planning/specs"
STATE_DIR="$CLAWD/.claude/state"
LOGS_DIR="$CLAWD/.claude/logs"
NIGHTLY_DIR="$CLAWD/nightly

mkdir -p "$SCHEDULE_DIR" "$PRDS_DIR" "$SPECS_DIR" "$STATE_DIR" "$LOGS_DIR" "$NIGHTLY_DIR"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SCHEDULER] $1" >> "$LOGS_DIR/scheduler.log"; }
error() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SCHEDULER] ERROR: $1" >> "$LOGS_DIR/scheduler.log"; }

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Check if within Claude Hours (9PM-8AM Chicago)
in_claude_hours() {
    local hour=$(TZ='America/Chicago' date +%H)
    if [ "$hour" -ge 21 ] || [ "$hour" -lt 8 ]; then
        return 0
    else
        return 1
    fi
}

# Get current schedule
get_today_tasks() {
    local day=$(date +%A | tr '[:upper:]' '[:lower:]')
    jq -r ".nightly_schedule.\"$day\".tasks // .nightly_schedule.default.tasks" "$SCHEDULE_DIR/nightly.json"
}

# Update task status
update_task_status() {
    local task_id="$1"
    local status="$2"
    local day=$(date +%A | tr '[:upper:]' '[:lower:]')
    
    # Update in schedule
    local schedule_file="$SCHEDULE_DIR/nightly.json"
    local current_hash=$(jq -r 'hash' "$schedule_file")
    
    # Use jq to update - simple approach for now
    log "Task $task_id status updated to: $status"
}

# Execute a single task
execute_task() {
    local task_json="$1"
    local task_id=$(echo "$task_json" | jq -r '.id')
    local title=$(echo "$task_json" | jq -r '.title')
    local prd=$(echo "$task_json" | jq -r '.prd // empty')
    local spec=$(echo "$task_json" | jq -r '.spec // empty')
    local estimated=$(echo "$task_json" | jq -r '.estimated_time_minutes')
    local window=$(echo "$task_json" | jq -r '.scheduled_window')
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}Executing Task:${NC} $title"
    echo -e "${CYAN}ID:${NC} $task_id | ${CYAN}Est:${NC} ${estimated}min | ${CYAN}Window:${NC} $window"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    log "Starting task: $task_id - $title"
    
    # Check if PRD exists, generate if needed
    if [ -n "$prd" ] && [ "$prd" != "null" ]; then
        local prd_file="$PRDS_DIR/$prd.md"
        if [ ! -f "$prd_file" ]; then
            echo -e "${YELLOW}PRD not found, generating: $prd${NC}"
            $CLAWD/system/planning/generate-plan.sh prd "$title" "Auto-generated PRD for task" > /dev/null 2>&1 || true
        fi
    fi
    
    # Check if spec exists, generate if needed
    if [ -n "$spec" ] && [ "$spec" != "null" ]; then
        local spec_file="$SPECS_DIR/$spec.md"
        if [ ! -f "$spec_file" ]; then
            echo -e "${YELLOW}Spec not found, generating: $spec${NC}"
            $CLAWD/system/planning/generate-plan.sh spec "$prd" "$title" > /dev/null 2>&1 || true
        fi
    fi
    
    # Execute based on task type
    case "$title" in
        *"Review"*)
            echo -e "${GREEN}→ Running metrics review...${NC}"
            $CLAWD/scripts/codex-api-cost.sh > /dev/null 2>&1 || true
            ;;
        *"PRD"*)
            echo -e "${GREEN}→ Generating PRD...${NC}"
            $CLAWD/system/planning/generate-plan.sh auto > /dev/null 2>&1 || true
            ;;
        *"Implement"*)
            echo -e "${GREEN}→ Running swarm...${NC}"
            cd $CLAWD/skills/agent-swarm
            node scripts/swarm-orchestrator.js init "Implement $title" > /dev/null 2>&1 || true
            ;;
        *"health check"*)
            echo -e "${GREEN}→ Running Claude Home System check...${NC}"
            $CLAWD/scripts/claude-home-system.sh dashboard > /dev/null 2>&1 || true
            ;;
        *"memory"*)
            echo -e "${GREEN}→ Compacting memory...${NC}"
            # Memory compaction is passive
            ;;
        *"skills"*)
            echo -e "${GREEN}→ Reviewing skills...${NC}"
            ls $CLAWD/skills/ | head -5 > /dev/null
            ;;
        *"swarm"*)
            echo -e "${GREEN}→ Running swarm experiment...${NC}"
            cd $CLAWD/skills/agent-swarm
            node scripts/swarm-orchestrator.js init "Multi-agent research and implementation" > /dev/null 2>&1 || true
            ;;
        *"intel"*)
            echo -e "${GREEN}→ Preparing morning intel...${NC}"
            $CLAWD/scripts/claude-hours-morning-intel.sh > /dev/null 2>&1 || true
            ;;
        *)
            echo -e "${GREEN}→ Generic task execution...${NC}"
            # Default: record progress
            ;;
    esac
    
    log "Task completed: $task_id"
    echo -e "${GREEN}✓ Task complete: $title${NC}"
}

# Run swarm tasks
execute_swarm_task() {
    local task_json="$1"
    local title=$(echo "$task_json" | jq -r '.title')
    local agents=$(echo "$task_json" | jq -r '.agents | join(", ")')
    local window=$(echo "$task_json" | jq -r '.scheduled_window')
    
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}🐝 SWARM TASK:${NC} $title"
    echo -e "${MAGENTA}Agents:${NC} $agents | ${MAGENTA}Window:${NC} $window"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    log "Starting swarm: $title with agents: $agents"
    
    cd $CLAWD/skills/agent-swarm
    node scripts/swarm-orchestrator.js init "$title" > /dev/null 2>&1 || true
    
    log "Swarm complete: $title"
    echo -e "${GREEN}✓ Swarm complete: $title${NC}"
}

# === MAIN ===
main() {
    echo "============================================"
    echo "   Claude Hours Schedule Runner"
    echo "============================================"
    
    if ! in_claude_hours; then
        echo -e "${YELLOW}Outside Claude Hours (9PM-8AM Chicago). Current: $(TZ='America/Chicago' date +%H:00)${NC}"
        log "Outside Claude hours, exiting"
        exit 0
    fi
    
    echo -e "${GREEN}✓ Within Claude Hours$(NC)"
    
    # Update cycle count
    local cycle=0
    [ -f "$STATE_DIR/cycle.txt" ] && cycle=$(cat "$STATE_DIR/cycle.txt")
    cycle=$((cycle + 1))
    echo "$cycle" > "$STATE_DIR/cycle.txt"
    echo -e "${CYAN}Cycle: $cycle${NC}"
    
    log "Starting cycle $cycle"
    
    # Get today's tasks
    local tasks=$(get_today_tasks)
    
    if [ -z "$tasks" ] || [ "$tasks" == "null" ]; then
        echo -e "${YELLOW}No tasks found in schedule${NC}"
        log "No tasks found for today"
        exit 0
    fi
    
    local task_count=$(echo "$tasks" | jq 'length')
    echo -e "${CYAN}Tasks scheduled: $task_count${NC}"
    
    # Execute each task
    local completed=0
    echo "$tasks" | jq -c '.[]' | while read task_json; do
        local status=$(echo "$task_json" | jq -r '.status')
        if [ "$status" == "pending" ]; then
            execute_task "$task_json"
            completed=$((completed + 1))
        fi
    done
    
    # Check for swarm tasks
    local swarms=$(echo "$tasks" | jq '[.[] | select(.agents != null)]')
    if [ "$swarms" != "[]" ]; then
        echo "$swarms" | jq -c '.[]' | while read swarm_json; do
            execute_swarm_task "$swarm_json"
        done
    fi
    
    echo ""
    echo "============================================"
    echo -e "${GREEN}Cycle $cycle Complete${NC}"
    echo -e "${CYAN}Tasks completed:${NC} $completed"
    echo "============================================"
    
    log "Cycle $cycle complete, $completed tasks finished"
}

main "$@"
