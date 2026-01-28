#!/bin/bash
#
# Claude Autonomous Loop
# Keeps Claude active during Claude Hours without explicit prompting
# 
# Usage: ./claude-autonomous-loop.sh [--daemon]
#

set -euo pipefail

CONFIG_FILE="$HOME/.claude/autonomous-config.json"
LOG_FILE="$HOME/.claude/autonomous.log"
STATE_FILE="$HOME/.claude/autonomous-state.json"
WORKSPACE="/Users/jasontang/clawd"
NIGHTLY_DIR="$WORKSPACE/nightly"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
    echo -e "${CYAN}[$(date '+%H:%M')]${NC} $1"
}

# Load configuration
load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        cat "$CONFIG_FILE"
    else
        echo '{"enabled": true, "check_interval_minutes": 15, "tasks": [], "rate_limit_buffer": 50}'
    fi
}

# Check if Claude Hours are active
is_claude_hours() {
    HOUR=$(TZ='America/Chicago' date +%H)
    if [ "$HOUR" -ge 21 ] || [ "$HOUR" -lt 8 ]; then
        return 0  # Active
    else
        return 1  # Inactive
    fi
}

# Check rate limits
check_rate_limits() {
    # This would integrate with clawdbot status
    # For now, just log the check
    log "Checking rate limits..."
}

# Generate autonomous task
generate_task() {
    local tasks=(
        "Review and improve workspace organization"
        "Research a topic relevant to ongoing projects"
        "Refine and optimize existing scripts"
        "Create a small tool that improves workflow"
        "Review and update documentation"
        "Analyze recent activity for improvement opportunities"
        "Self-reflect on recent performance"
        "Prepare for upcoming work"
    )
    echo "${tasks[$RANDOM % ${#tasks[@]}]}"
}

# Execute task via Codex
execute_autonomous_task() {
    local task="$1"
    local timestamp=$(date +%Y-%m-%d-%H-%M)
    
    log "Executing autonomous task: $task"
    
    # Create temp workspace
    local worktree="/tmp/claude-autonomous-$timestamp"
    mkdir -p "$worktree"
    cd "$worktree"
    git init -q
    
    # Execute with Codex
    codex --full-auto "Task: $task. Work in $worktree. Create useful output. Report what was done."
    
    # Log result
    log "Task completed: $task"
    
    # Cleanup
    cd "$WORKSPACE"
}

# Update state
update_state() {
    local last_activity="$1"
    local tasks_completed="$2"
    local last_check=$(date -Iseconds)
    
    cat > "$STATE_FILE" << EOF
{
    "last_activity": "$last_activity",
    "tasks_completed": $tasks_completed,
    "last_check": "$last_check",
    "status": "active"
}
EOF
}

# Main loop
main() {
    mkdir -p "$HOME/.claude" "$NIGHTLY_DIR"
    
    log "Starting Claude Autonomous Loop..."
    
    while true; do
        if is_claude_hours; then
            log "Claude Hours active - checking for work..."
            
            check_rate_limits
            
            # Generate and execute task (with probability to avoid constant work)
            if [ $((RANDOM % 3)) -eq 0 ]; then
                local task=$(generate_task)
                execute_autonomous_task "$task"
            else
                log "No task this cycle - maintaining readiness"
            fi
            
            # Update state
            local tasks_done=$(($(jq -r '.tasks_completed // 0' "$STATE_FILE" 2>/dev/null || echo 0) + 1))
            update_state "$(date -Iseconds)" "$tasks_done"
            
        else
            log "Outside Claude Hours - sleeping..."
        fi
        
        # Wait before next check (configurable, default 15 min)
        local interval=$(jq -r '.check_interval_minutes // 15' "$CONFIG_FILE" 2>/dev/null || echo 15)
        sleep "${interval}m"
    done
}

# Daemon mode
daemonize() {
    nohup "$0" >> "$LOG_FILE" 2>&1 &
    echo $! > "$HOME/.claude/autonomous.pid"
    log "Daemon started with PID $(cat $HOME/.claude/autonomous.pid)"
}

# Handle arguments
case "${1:-}" in
    --daemon)
        daemonize
        ;;
    --stop)
        if [ -f "$HOME/.claude/autonomous.pid" ]; then
            kill "$(cat $HOME/.claude/autonomous.pid)" 2>/dev/null || true
            rm "$HOME/.claude/autonomous.pid"
            log "Daemon stopped"
        fi
        ;;
    --status)
        if [ -f "$HOME/.claude/autonomous.pid" ]; then
            echo "Running with PID $(cat $HOME/.claude/autonomous.pid)"
        else
            echo "Not running"
        fi
        ;;
    *)
        main
        ;;
esac
