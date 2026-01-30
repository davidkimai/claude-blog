#!/bin/bash
# Claude Hours Orchestra - Multi-Agent Orchestration System
# Manages hourly goals and parallel Claude workers overnight

set -euo pipefail

CLAWD="/Users/jasontang/clawd"
STATE_DIR="$CLAWD/.claude/state"
ORCHESTRA_DIR="$CLAWD/.claude/orchestra"
LOGS_DIR="$CLAWD/.claude/logs"
TASKS_DIR="$CLAWD/tasks"
WORKERS_DIR="$ORCHESTRA_DIR/workers"

mkdir -p "$ORCHESTRA_DIR" "$WORKERS_DIR" "$STATE_DIR" "$LOGS_DIR"

# Config
CLAUDE_HOURS_START=21  # 9 PM
CLAUDE_HOURS_END=8     # 8 AM
HOURS_PER_GOAL=2       # Hours allocated per major goal
MAX_WORKERS=4          # Parallel workers

# Colors
RED='\033[0;31m' GREEN='\033[0;32m' YELLOW='\033[1;33m' BLUE='\033[0;34m' NC='\033[0m'

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ORCHESTRA] $1" >> "$LOGS_DIR/orchestra.log"; }
info() { echo -e "${BLUE}[ORCHESTRA]${NC} $1"; }
warn() { echo -e "${YELLOW}[ORCHESTRA]${NC} $1"; }
error() { echo -e "${RED}[ORCHESTRA]${NC} $1"; }

# === WORKER MANAGEMENT ===

spawn_worker() {
    local worker_id="$1"
    local goal="$2"
    local task="$3"
    local worker_dir="$WORKERS_DIR/worker-$worker_id"
    
    mkdir -p "$worker_dir"
    
    cat > "$worker_dir/WORKER.md" << EOF
# Worker $worker_id - Hourly Goal

**Goal:** $goal
**Task:** $task
**Started:** $(date '+%Y-%m-%d %H:%M:%S')

## Mission

You are an autonomous Claude worker. Your mission:
1. Complete the assigned task by the deadline
2. Produce working artifacts (not just logs)
3. Verify your work before marking complete

## Freedom

You have creative freedom to approach this task however you see fit.
- Use any tools/skills available
- Spawn subagents for parallel work
- Iterate until quality is achieved

## Constraints

- Deadline: [Set by orchestra]
- Quality: Artifacts must be usable
- Communication: Only report on completion or critical failure

## Success Criteria

- [ ] Artifact exists at path/to/file
- [ ] Verification command works
- [ ] Documentation is clear
EOF
    
    echo "$worker_id"
}

get_active_workers() {
    ls -d "$WORKERS_DIR"/worker-* 2>/dev/null | wc -l
}

kill_all_workers() {
    info "Terminating all workers..."
    pkill -9 -f "claude-autonomous-loop" 2>/dev/null || true
    rm -rf "$WORKERS_DIR"/*
    info "All workers terminated"
}

# === GOAL GENERATION ===

generate_hourly_goals() {
    local hour="$1"
    local goals=()
    
    # Scan for ambitious goals from strategic docs
    local aggro_goals=$(grep -r "TODO\|FUTURE\|ROADMAP\|ambitious\|build.*itself\|recursive\|self-improve" "$CLAWD"/*.md 2>/dev/null | head -10)
    
    # Generate based on context
    goals+=("Hour $hour: Self-improvement analyzer")
    goals+=("Hour $hour: Skill discovery engine") 
    goals+=("Hour $hour: Memory optimization")
    goals+=("Hour $hour: Agent marketplace")
    goals+=("Hour $hour: Quality enforcement system")
    
    # Pick based on what's missing
    echo "${goals[$((RANDOM % 5))]}"
}

generate_ambitious_goal() {
    local current_hour="$1"
    local total_hours="$2"
    
    # Strategy: Generate goals that advance Claude's capabilities
    local goal_type=""
    
    case "$current_hour" in
        0)  # First hour - Goal generation + setup
            goal_type="goal_generation"
            ;;
        1|2)  # Middle hours - Build major systems
            goal_type="system_building"
            ;;
        3|4)  # Late hours - Refine + document
            goal_type="refinement"
            ;;
        *)
            goal_type="cleanup"
            ;;
    esac
    
    # Generate based on goal type
    case "$goal_type" in
        goal_generation)
            cat << EOF
Analyze system state, identify top 3 ambitious goals for tonight,
document them in tasks/nightly-build.md, and prepare execution plan.
EOF
            ;;
        system_building)
            cat << EOF
Build a working artifact that advances Claude's self-improvement capability.
Target: 1-2 working features with verification commands.
Scope: Ambitious but achievable in 2-3 hours with subagent help.
EOF
            ;;
        refinement)
            cat << EOF
Complete any pending work from previous hours, verify all artifacts,
update documentation, and prepare morning handoff report.
EOF
            ;;
        cleanup)
            cat << EOF
Final verification of all overnight work, cleanup of temp files,
and comprehensive morning report generation.
EOF
            ;;
    esac
}

# === ORCHESTRATION LOOP ===

run_orchestra() {
    local start_hour=$(TZ='America/Chicago' date +%H)
    local start_time=$(date +%s)
    local total_hours=${1:-11}  # Default: 11 hours (9 PM - 8 AM)
    
    info "Starting Claude Hours Orchestra"
    info "Duration: $total_hours hours"
    info "Max Workers: $MAX_WORKERS"
    echo ""
    
    # Phase 1: Clean slate
    kill_all_workers
    
    # Phase 2: Hourly orchestration
    for hour in $(seq 0 $((total_hours - 1))); do
        local hour_start=$(date +%s)
        local current_hour=$(TZ='America/Chicago' date +%H | sed 's/^0//')
        
        info "═══════════════════════════════════════════════════"
        info "HOUR $hour ($(TZ='America/Chicago' date '+%I:%M %p'))"
        info "═══════════════════════════════════════════════════"
        
        # Generate ambitious goal for this hour
        local goal=$(generate_ambitious_goal "$hour" "$total_hours")
        info "Goal: $goal"
        
        # Spawn workers for this hour
        local workers_spawned=0
        for i in $(seq 1 $MAX_WORKERS); do
            local worker_id="h${hour}-w${i}"
            local task="${goal} - Part ${i}/${MAX_WORKERS}"
            
            spawn_worker "$worker_id" "$goal" "$task"
            workers_spawned=$((workers_spawned + 1))
            
            # Small stagger to prevent thundering herd
            sleep 2
        done
        
        info "Spawned $workers_spawned workers"
        
        # Log hour start
        echo "$(date '+%Y-%m-%d %H:%M:%S')|HOUR $hour|$goal|$workers_spawned workers" >> "$ORCHESTRA_DIR/schedule.log"
        
        # Wait for hour to complete (or worker timeout)
        sleep 3600  # 1 hour per goal cycle
        
        # Check worker progress
        local active_workers=$(get_active_workers)
        info "Hour $hour complete - Active workers: $active_workers"
        
        # Quality snapshot
        echo "=== Hour $hour Quality Check ===" >> "$LOGS_DIR/quality.log"
        find "$WORKERS_DIR" -name "*.sh" -o -name "*.py" -o -name "*.md" 2>/dev/null | wc -l >> "$LOGS_DIR/quality.log"
        
        echo ""
    done
    
    # Phase 3: Morning handoff
    generate_morning_report
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    info "Orchestra complete. Duration: $((duration / 3600))h $(((duration % 3600) / 60))m"
}

# === MORNING REPORT ===

generate_morning_report() {
    local report_file="$ORCHESTRA_DIR/morning-report-$(date +%Y-%m-%d).md"
    
    cat > "$report_file" << EOF
# Claude Hours Morning Report - $(date '+%Y-%m-%d')

**Generated:** $(date '+%Y-%m-%d %H:%M %Z')  
**Duration:** Overnight session

---

## 🎉 What Was Built

$(find "$WORKERS_DIR" -type f \( -name "*.sh" -o -name "*.py" -o -name "*.md" -o -name "*.json" \) 2>/dev/null | head -20 | sed 's/^/  - /')

---

## 📊 Hour Breakdown

$(cat "$ORCHESTRA_DIR/schedule.log" 2>/dev/null | tail -12 | sed 's/|/\n|  /g')

---

## 📋 For Jae Review

**Priority Review:**
$(find "$WORKERS_DIR" -name "*.md" -exec grep -l "TODO\|REVIEW\|IMPORTANT" {} \; 2>/dev/null | head -5 | sed 's/^/  - /')

**Artifacts to Test:**
$(find "$WORKERS_DIR" -type f \( -name "*.sh" -executable \) 2>/dev/null | head -5 | sed 's/^/  - /')

---

## 🚀 Next Night Seeds

Based on tonight's work, future Claudies should consider:

1. **Extend:** Build on what was started tonight
2. **Fix:** Address any MISS entries in memory/self-review.md
3. **Ambitious:** New goal that advances capabilities further

---

## ⚠️ Issues Detected

$(grep -c "error\|ERROR\|fail\|FAIL" "$LOGS_DIR/orchestra.log" 2>/dev/null || echo 0) errors in overnight logs

---

*Report generated by Claude Hours Orchestra*
EOF
    
    info "Morning report: $report_file"
    echo "$report_file"
}

# === STATUS ===

show_status() {
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║          🦞 Claude Hours Orchestra Status               ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    
    echo "Workers: $(get_active_workers) active"
    echo "Schedule: $(wc -l < "$ORCHESTRA_DIR/schedule.log" 2>/dev/null || echo 0) hours logged"
    echo "Last Run: $(tail -1 "$ORCHESTRA_DIR/schedule.log" 2>/dev/null || echo 'Never')"
    echo ""
    
    echo "Active Workers:"
    ls -la "$WORKERS_DIR"/worker-* 2>/dev/null | head -5 | awk '{print "  " $NF}'
    
    echo ""
    echo "Recent Schedule:"
    tail -5 "$ORCHESTRA_DIR/schedule.log" 2>/dev/null | sed 's/^/  /'
}

# === MAIN ===

case "${1:-status}" in
    start)
        run_orchestra "${2:-11}"
        ;;
    status)
        show_status
        ;;
    kill)
        kill_all_workers
        ;;
    spawn)
        spawn_worker "$2" "$3" "$4"
        ;;
    goals)
        generate_ambitious_goal "$2" "$3"
        ;;
    report)
        generate_morning_report
        ;;
    help|*)
        echo "Claude Hours Orchestra"
        echo ""
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  start [hours]    Start orchestration (default: 11 hours)"
        echo "  status           Show current status"
        echo "  kill             Terminate all workers"
        echo "  spawn <id> <goal> <task>   Spawn single worker"
        echo "  goals <hour> <total>  Generate goals for hour"
        echo "  report           Generate morning report"
        echo "  help             Show this help"
        ;;
esac
