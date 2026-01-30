#!/bin/bash
# Claude Hours Recursive Goal Generator
# LADDER-style recursive goal decomposition for ambitious tasks

CLAWD="/Users/jasontang/clawd"
STATE_DIR="$CLAWD/.claude/state"
GOALS_DIR="$STATE_DIR/goals"

mkdir -p "$GOALS_DIR"

# Colors
GREEN='\033[0;32m' BLUE='\033[0;34m' YELLOW='\033[1;33m' NC='\033[0m'

log() { echo "[$(date '+%H:%M:%S')] [GOAL-GEN] $1"; }

# === CONFIG ===
MAX_DEPTH=5
MIN_SUBGOALS=2
MAX_SUBGOALS=5
TIME_BUDGET_HOURS=10
COMPLEXITY_THRESHOLD=7

# === DIFFICULTY SCORING ===
score_difficulty() {
    local goal="$1"
    local score=0
    
    # Length indicator
    local words=$(echo "$goal" | wc -w)
    score=$((score + words / 5))
    
    # Complexity keywords
    echo "$goal" | grep -qi "and\|or\|but\|however" && score=$((score + 2))
    echo "$goal" | grep -qi "build\|create\|design\|implement" && score=$((score + 1))
    echo "$goal" | grep -qi "research\|analyze\|investigate" && score=$((score + 1))
    echo "$goal" | grep -qi "test\|verify\|validate" && score=$((score + 1))
    echo "$goal" | grep -qi "deploy\|ship\|launch" && score=$((score + 2))
    echo "$goal" | grep -qi "recursive\|self\|meta" && score=$((score + 3))
    
    echo "$score"
}

# === DECOMPOSE GOAL ===
decompose_goal() {
    local goal="$1"
    local depth="${2:-1}"
    local parent_id="${3:-root}"
    
    local goal_id="goal-$(date +%Y%m%d)-$(printf '%03d' $(find "$GOALS_DIR" -name "*.json" 2>/dev/null | wc-l | tr -d ' '))"
    local difficulty=$(score_difficulty "$goal")
    
    log "Decomposing: $goal (difficulty: $difficulty, depth: $depth)"
    
    # Check if goal is simple enough
    if [ "$difficulty" -lt "$COMPLEXITY_THRESHOLD" ] || [ "$depth" -ge "$MAX_DEPTH" ]; then
        # Create leaf goal
        cat > "$GOALS_DIR/${goal_id}.json" << EOF
{
  "id": "$goal_id",
  "parent": "$parent_id",
  "goal": "$goal",
  "depth": $depth,
  "difficulty": $difficulty,
  "status": "pending",
  "subgoals": [],
  "estimated_hours": 1,
  "dependencies": [],
  "created_at": "$(date -Iseconds)"
}
EOF
        echo "$goal_id"
        return
    fi
    
    # Decompose into subgoals
    local subgoals=()
    
    # Pattern 1: Build X
    if echo "$goal" | grep -qi "build.*\(system\|tool\|framework\|module\)"; then
        subgoals+=("Design architecture for $goal")
        subgoals+=("Implement core functionality for $goal")
        subgoals+=("Add tests for $goal")
        subgoals+=("Document $goal")
    fi
    
    # Pattern 2: Research X
    if echo "$goal" | grep -qi "research\|investigate\|analyze"; then
        subgoals+=("Gather information on $goal")
        subgoals+=("Synthesize findings on $goal")
        subgoals+=("Create summary of $goal research")
    fi
    
    # Pattern 3: Improve X
    if echo "$goal" | grep -qi "improve\|optimize\|enhance"; then
        subgoals+=("Identify bottlenecks in $goal")
        subgoals+=("Implement improvements to $goal")
        subgoals+=("Verify improvements to $goal")
    fi
    
    # Pattern 4: Create X
    if echo "$goal" | grep -qi "create\|make\|develop"; then
        subgoals+=("Plan $goal")
        subgoals+=("Execute $goal")
        subgoals+=("Review $goal")
    fi
    
    # Pattern 5: Generic decomposition (if no pattern matched)
    if [ ${#subgoals[@]} -eq 0 ]; then
        subgoals+=("Break down $goal into components")
        subgoals+=("Work on first component of $goal")
        subgoals+=("Work on second component of $goal")
        subgoals+=("Integrate components of $goal")
    fi
    
    # Ensure bounds
    if [ ${#subgoals[@]} -lt "$MIN_SUBGOALS" ]; then
        subgoals+=("Validate $goal")
    fi
    if [ ${#subgoals[@]} -gt "$MAX_SUBGOALS" ]; then
        subgoals=("${subgoals[@]:0:$MAX_SUBGOALS}")
    fi
    
    # Create parent goal
    local subgoal_ids=()
    for i in "${!subgoals[@]}"; do
        local sub_id=$(decompose_goal "${subgoals[$i]}" $((depth + 1)) "$goal_id")
        subgoal_ids+=("$sub_id")
    done
    
    # Calculate estimated hours
    local est_hours=$((depth * 2))
    
    cat > "$GOALS_DIR/${goal_id}.json" << EOF
{
  "id": "$goal_id",
  "parent": "$parent_id",
  "goal": "$goal",
  "depth": $depth,
  "difficulty": $difficulty,
  "status": "pending",
  "subgoals": $(printf '%s\n' "${subgoal_ids[@]}" | jq -R . | jq -s .),
  "estimated_hours": $est_hours,
  "dependencies": [],
  "created_at": "$(date -Iseconds)"
}
EOF
    
    echo "$goal_id"
}

# === GENERATE AMBITIOUS GOALS ===
generate_ambitious_goals() {
    local context="${1:-general}"
    
    log "Generating ambitious goals for context: $context"
    
    # Scan system for needs
    local system_needs=""
    
    # Check self-review for pending issues
    local pending_issues=$(grep -c "MISS:" "$CLAWD/memory/self-review.md" 2>/dev/null || echo 0)
    
    # Check for incomplete tasks
    local incomplete=$(find "$TASKS_DIR" -name "*.md" -exec grep -l "PENDING\|IN_PROGRESS" {} \; 2>/dev/null | wc -l | tr -d ' ')
    
    # Generate goals based on context
    local goals=()
    
    case "$context" in
        "recursive")
            goals+=("Implement skill library auto-learning")
            goals+=("Build recursive goal generator with LADDER-style decomposition")
            goals+=("Create self-improvement metrics dashboard")
            goals+=("Add meta-learning pattern extraction")
            ;;
        "autonomy")
            goals+=("Implement circuit breaker for autonomous system")
            goals+=("Build quality enforcement pipeline")
            goals+=("Create self-healing mechanism for crashed workers")
            goals+=("Add automatic recovery from failures")
            ;;
        "productivity")
            goals+=("Optimize Claude Hours startup time")
            goals+=("Reduce notification spam")
            goals+=("Improve morning report generation")
            goals+=("Streamline git workflow for overnight commits")
            ;;
        "general"|*)
            goals+=("Build self-improvement analyzer")
            goals+=("Create skill discovery engine")
            goals+=("Implement memory optimizer")
            goals+=("Add quality enforcement system")
            goals+=("Design recursive goal generator")
            ;;
    esac
    
    # Add context-specific goals based on system state
    if [ "$pending_issues" -gt 0 ]; then
        goals+=("Address $(($pending_issues * 3)) pending issues from self-review")
    fi
    
    if [ "$incomplete" -gt 0 ]; then
        goals+=("Complete $incomplete pending tasks from backlog")
    fi
    
    # Output goals
    echo "═══ Ambitious Goals for Tonight ($context) ═══"
    for i in "${!goals[@]}"; do
        echo "$((i+1)). ${goals[$i]}"
    done
    
    # Store for later use
    printf '%s\n' "${goals[@]}" > "$GOALS_DIR/tonights-goals.txt"
}

# === PICK BEST GOAL ===
pick_best_goal() {
    local goals_file="$GOALS_DIR/tonights-goals.txt"
    
    if [ ! -f "$goals_file" ]; then
        generate_ambitious_goals
        return
    fi
    
    local goals=()
    while IFS= read -r line; do
        goals+=("$line")
    done < "$goals_file"
    
    # Pick goal based on:
    # 1. Recursive potential (goals about goals/self)
    # 2. Feasibility (not too complex)
    # 3. Impact (high value)
    
    local best_goal=""
    local best_score=0
    
    for goal in "${goals[@]}"; do
        local score=0
        
        # Recursive bonus
        echo "$goal" | grep -qi "recursive\|self\|improve\|learn" && score=$((score + 5))
        
        # Feasibility bonus (shorter goals often more feasible)
        local words=$(echo "$goal" | wc -w)
        [ "$words" -lt 15 ] && score=$((score + 3))
        [ "$words" -lt 10 ] && score=$((score + 2))
        
        # Impact bonus
        echo "$goal" | grep -qi "build\|create\|implement" && score=$((score + 2))
        echo "$goal" | grep -qi "system\|engine\|framework" && score=$((score + 2))
        
        if [ "$score" -gt "$best_score" ]; then
            best_score=$score
            best_goal="$goal"
        fi
    done
    
    if [ -n "$best_goal" ]; then
        echo "═══ Selected Goal ═══"
        echo -e "${GREEN}$best_goal${NC} (score: $best_score)"
        echo "$best_goal" > "$GOALS_DIR/selected-goal.txt"
    fi
}

# === EXECUTE GOAL ===
execute_goal() {
    local goal_file="$1"
    
    if [ ! -f "$goal_file" ]; then
        goal_file="$GOALS_DIR/selected-goal.txt"
    fi
    
    if [ ! -f "$goal_file" ]; then
        log "ERROR: No goal file found"
        return 1
    fi
    
    local goal=$(cat "$goal_file")
    log "Executing goal: $goal"
    
    # Decompose into actionable subgoals
    local goal_id=$(decompose_goal "$goal" 1 "root")
    
    log "Decomposed into: $goal_id"
    
    # Store execution plan
    cat > "$STATE_DIR/current-goal.json" << EOF
{
  "goal": "$goal",
  "root_id": "$goal_id",
  "started_at": "$(date -Iseconds)",
  "status": "executing",
  "depth": 1
}
EOF
    
    echo "$goal_id"
}

# === GET NEXT SUBGOAL ===
get_next_subgoal() {
    local goal_id="${1:-root}"
    
    # Find pending subgoals at current depth
    local pending=$(find "$GOALS_DIR" -name "*.json" -exec jq -r "select(.parent == \"$goal_id\" and .status == \"pending\") | .id" {} \; 2>/dev/null | head -1)
    
    if [ -n "$pending" ]; then
        cat "$GOALS_DIR/${pending}.json" | jq '.'
    else
        # Check if all done
        local remaining=$(find "$GOALS_DIR" -name "*.json" -exec jq -r "select(.parent == \"$goal_id\" and .status == \"pending\") | .id" {} \; 2>/dev/null | wc -l)
        if [ "$remaining" -eq 0 ]; then
            echo "GOAL_COMPLETE"
        else
            echo "NO_MORE_SUBGOALS"
        fi
    fi
}

# === UPDATE GOAL STATUS ===
update_goal() {
    local goal_id="$1"
    local status="$2"  # pending, executing, complete, failed
    
    if [ -f "$GOALS_DIR/${goal_id}.json" ]; then
        jq --arg id "$goal_id" --arg status "$status" --arg now "$(date -Iseconds)" \
            '. | select(.id == $id) | .status = $status | .updated_at = $now' \
            "$GOALS_DIR/${goal_id}.json" > "$GOALS_DIR/${goal_id}.json.tmp" 2>/dev/null
        
        if [ -f "$GOALS_DIR/${goal_id}.json.tmp" ]; then
            mv "$GOALS_DIR/${goal_id}.json.tmp" "$GOALS_DIR/${goal_id}.json"
            log "Updated goal $goal_id -> $status"
        fi
    fi
}

# === SHOW GOAL TREE ===
show_goal_tree() {
    local goal_id="${1:-root}"
    
    echo "═══ Goal Tree ═══"
    
    # Find root goal
    if [ "$goal_id" = "root" ]; then
        local root_file=$(find "$GOALS_DIR" -name "*.json" -exec jq -r 'select(.parent == "root") | .id' {} \; 2>/dev/null | head -1)
        if [ -n "$root_file" ]; then
            goal_id="$root_file"
        fi
    fi
    
    # Recursively display tree
    display_tree() {
        local parent="$1"
        local indent="${2:-}"
        
        find "$GOALS_DIR" -name "*.json" -exec jq -r "select(.parent == \"$parent\") | \"\(.) \(.id) \(.goal) \(.status)\"" {} \; 2>/dev/null | while read status id goal gstatus; do
            local icon="○"
            [ "$gstatus" = "complete" ] && icon="✓"
            [ "$gstatus" = "failed" ] && icon="✗"
            [ "$gstatus" = "executing" ] && icon="▶"
            
            echo "${indent}${icon} ${goal} [$gstatus]"
            display_tree "$id" "${indent}  "
        done
    }
    
    if [ -f "$GOALS_DIR/${goal_id}.json" ]; then
        local root_goal=$(jq -r '.goal' "$GOALS_DIR/${goal_id}.json")
        echo "🎯 $root_goal"
        display_tree "$goal_id" "  "
    fi
}

# === MAIN ===
case "${1:-help}" in
    generate)
        generate_ambitious_goals "${2:-general}"
        ;;
    pick)
        pick_best_goal
        ;;
    decompose)
        decompose_goal "$2" "${3:-1}" "${4:-root}"
        ;;
    execute)
        execute_goal "$2"
        ;;
    next)
        get_next_subgoal "$2"
        ;;
    update)
        update_goal "$2" "$3"
        ;;
    tree)
        show_goal_tree "$2"
        ;;
    status)
        show_goal_tree
        ;;
    help|*)
        echo "Claude Hours Recursive Goal Generator"
        echo ""
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  generate [context]  Generate ambitious goals"
        echo "  pick                Pick best goal for tonight"
        echo "  decompose <goal>    Decompose a goal recursively"
        echo "  execute [goal_file] Execute selected goal"
        echo "  next [goal_id]      Get next pending subgoal"
        echo "  update <id> <stat>  Update goal status"
        echo "  tree [goal_id]      Display goal tree"
        echo "  status              Show current goal status"
        ;;
esac
