#!/bin/bash
# Claude Autonomous Loop v2.4 - Integrated with Claude Home System
set -euo pipefail

CLAWD="/Users/jasontang/clawd"
HOME_SYS="$CLAWD/scripts/claude-home-system.sh"
CODEX="$CLAWD/scripts/codex-api.sh"
LOG_DIR="$CLAWD/.claude/logs"
STATE_DIR="$CLAWD/.claude/state"
CYCLE_FILE="$STATE_DIR/cycle.txt"

mkdir -p "$LOG_DIR" "$STATE_DIR"

ts() { date '+%H:%M:%S'; }

log() { echo "[$(ts)] $1" >> "$LOG_DIR/loop.log"; }

# Load cycle
[ -f "$CYCLE_FILE" ] && CYCLE=$(cat "$CYCLE_FILE") || CYCLE=0

# Check Claude Hours
HOUR=$(TZ='America/Chicago' date +%H)
if [ "$HOUR" -ge 21 ] || [ "$HOUR" -lt 8 ]; then
    CYCLE=$((CYCLE + 1))
    echo "$CYCLE" > "$CYCLE_FILE"
    log "Cycle $CYCLE: Claude Hours active"
    
    TASK_NUM=$((CYCLE % 5))
    
    # Tasks with context
    case "$TASK_NUM" in
        0)  CONTEXT=$(ls "$CLAWD/scripts/" 2>/dev/null | tr '\n' ',' | sed 's/,$//')
            PROMPT="Scripts in /Users/jasontang/clawd/scripts/: $CONTEXT. Which need improvement? Give 2 recommendations."
            ;;
        1)  CONTEXT=$(ls "$CLAWD/docs/guides/" 2>/dev/null | tr '\n' ',' | sed 's/,$//')
            PROMPT="Docs in /Users/jasontang/clawd/docs/guides/: $CONTEXT. Note gaps and improvements."
            ;;
        2)  CONTEXT=$(ls "$CLAWD/memory/" 2>/dev/null | tr '\n' ',' | sed 's/,$//')
            PROMPT="Memory files: $CONTEXT. Identify patterns and recommendations."
            ;;
        3)  CONTEXT=$(ls -d "$CLAWD"/*/ 2>/dev/null | tr '\n' ',' | sed 's/,$//')
            PROMPT="Workspace: $CONTEXT. Note reorganization opportunities."
            ;;
        4)  CONTEXT=$(ls "$CLAWD/skills/" 2>/dev/null | tr '\n' ',' | sed 's/,$//')
            PROMPT="Skills: $CONTEXT. List most useful capabilities."
            ;;
    esac
    
    TASK_DESC="Task $CYCLE: Analyze workspace"
    log "Executing: $TASK_DESC"
    
    # Execute via Codex
    cd "$CLAWD"
    
    if $CODEX --verbose "$PROMPT" >> "$LOG_DIR/codex.log" 2>&1; then
        log "Task completed: $TASK_DESC"
        # Record to Home System
        $HOME_SYS feedback record "$TASK_DESC" success
        $HOME_SYS memory save "cycle_${CYCLE}" "completed"
    else
        log "Task had issues: $TASK_DESC"
        $HOME_SYS feedback record "$TASK_DESC" fail
    fi
    
else
    log "Outside Claude Hours, sleeping..."
fi

log "Cycle $CYCLE complete"
