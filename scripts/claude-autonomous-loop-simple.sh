#!/bin/bash
# Claude Autonomous Loop v2.3 - Fixed piping to Codex API
set -euo pipefail

CLAWD="/Users/jasontang/clawd"
CODEX="/Users/jasontang/clawd/scripts/codex-api.sh"
LOG_DIR="$CLAWD/.claude/logs"
STATE_DIR="$CLAWD/.claude/state"
CYCLE_FILE="$STATE_DIR/cycle.txt"

mkdir -p "$LOG_DIR" "$STATE_DIR"

log() { echo "[$(date '+%H:%M:%S')] $1" >> "$LOG_DIR/loop.log"; }

# Load or init cycle
if [ -f "$CYCLE_FILE" ]; then
    CYCLE=$(cat "$CYCLE_FILE")
else
    CYCLE=0
fi

# Check Claude Hours
HOUR=$(TZ='America/Chicago' date +%H)
if [ "$HOUR" -ge 21 ] || [ "$HOUR" -lt 8 ]; then
    CYCLE=$((CYCLE + 1))
    echo "$CYCLE" > "$CYCLE_FILE"
    log "Cycle $CYCLE: Claude Hours active"
    
    # Task rotation
    TASK_NUM=$((CYCLE % 5))
    
    # Build prompt with context
    case "$TASK_NUM" in
        0)  # Scripts
            CONTEXT=$(ls "$CLAWD/scripts/" 2>/dev/null | tr '\n' ',' | sed 's/,$//')
            PROMPT="In /Users/jasontang/clawd/scripts/ I have these files: $CONTEXT. Which scripts could be improved? Give 2-3 specific recommendations."
            ;;
        1)  # Docs
            CONTEXT=$(ls "$CLAWD/docs/guides/" 2>/dev/null | tr '\n' ',' | sed 's/,$//')
            PROMPT="In /Users/jasontang/clawd/docs/guides/ I have these files: $CONTEXT. Summarize what documentation exists and note gaps."
            ;;
        2)  # Memory
            CONTEXT=$(ls "$CLAWD/memory/" 2>/dev/null | tr '\n' ',' | sed 's/,$//')
            PROMPT="In /Users/jasontang/clawd/memory/ I have these files: $CONTEXT. Identify patterns across recent sessions."
            ;;
        3)  # Workspace
            CONTEXT=$(ls -d "$CLAWD"/*/ 2>/dev/null | tr '\n' ',' | sed 's/,$//')
            PROMPT="My workspace structure: $CONTEXT. Note reorganization opportunities."
            ;;
        4)  # Skills
            CONTEXT=$(ls "$CLAWD/skills/" 2>/dev/null | tr '\n' ',' | sed 's/,$//')
            PROMPT="Skills available: $CONTEXT. List top 5 most useful capabilities."
            ;;
    esac
    
    TASK_DESC="Task $CYCLE: Analyze $CONTEXT"
    log "Executing: $TASK_DESC"
    
    # Create bead
    echo "bead-$CYCLE|$TASK_DESC|pending|$(date -Iseconds)" >> "$STATE_DIR/beads.txt"
    
    # Execute via Codex API
    cd "$CLAWD"
    
    if $CODEX --verbose "$PROMPT" >> "$LOG_DIR/codex.log" 2>&1; then
        log "Task completed: $TASK_DESC"
        sed -i '' "s/bead-$CYCLE|.*/bead-$CYCLE|$TASK_DESC|completed|$(date -Iseconds)/" "$STATE_DIR/beads.txt" 2>/dev/null || true
    else
        log "Task had issues: $TASK_DESC"
    fi
    
else
    log "Outside Claude Hours, sleeping..."
fi

log "Cycle $CYCLE complete"
