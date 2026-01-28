#!/bin/bash
# Claude Autonomous Loop - Simplified v1.0
set -euo pipefail

CLAWD="/Users/jasontang/clawd"
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
    
    # Simple task rotation
    TASKS=("Review scripts" "Check docs" "Analyze memory" "Improve workspace" "Document preferences")
    TASK="${TASKS[$((CYCLE % 5))]}"
    
    log "Executing: $TASK"
    
    # Create simple bead
    echo "bead-$CYCLE|$TASK|pending|$(date -Iseconds)" >> "$STATE_DIR/beads.txt"
    
    # Execute via codex (simple version)
    WORKTREE="/tmp/claude-work-$CYCLE"
    mkdir -p "$WORKTREE"
    cd "$WORKTREE"
    git init -q >/dev/null 2>&1
    
    if script -q /dev/null codex --full-auto "Task: $TASK. Work in $WORKTREE. Report result in 2 sentences." >> "$LOG_DIR/codex.log" 2>&1; then
        log "Task completed: $TASK"
        sed -i '' "s/bead-$CYCLE|.*/bead-$CYCLE|$TASK|completed|$(date -Iseconds)/" "$STATE_DIR/beads.txt" 2>/dev/null || true
    else
        log "Task had issues: $TASK"
    fi
    
    cd "$CLAWD"
else
    log "Outside Claude Hours, sleeping..."
fi

log "Cycle $CYCLE complete"
