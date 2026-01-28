#!/bin/bash
# Sub-agent for cheap fact extraction
# Runs every 30 minutes, costs pennies

CLAWD="/Users/jasontang/clawd"
MEMORY_DIR="$CLAWD/memory"
STATE_DIR="$CLAWD/.claude/state"

cd "$CLAWD"

# Get recent conversation context
# In production, this would query the messaging API
# For now, we'll scan memory files

# Extract and store facts
"$CLAWD/scripts/memory-system.sh" extract "$MEMORY_DIR/$(date '+%Y-%m-%d').md"

# Update knowledge graph
log "Fact extraction complete"
