#!/bin/bash
# ouroboros-auto-trigger.sh - Seamless background monitoring
# Runs on every user message to detect intent and suggest workflows
# 
# Usage: Source this in your main session loop
#   source ~/clawd/skills/ouroboros/scripts/ouroboros-auto-trigger.sh "user message"

# Colors for output
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

OuroborosDir="$HOME/clawd/skills/ouroboros"
MemoryDir="$OuroborosDir/memory"
StateFile="$MemoryDir/compound-state.json"
DecisionsLog="$MemoryDir/ouroboros-decisions.jsonl"

# Rate limit: don't trigger more than once per 60 seconds
RATE_LIMIT=60

# Check rate limit
check_rate_limit() {
    if [ -f "$StateFile" ]; then
        local lastTrigger=$(cat "$StateFile" 2>/dev/null | jq -r '.lastTrigger // 0')
        local now=$(date +%s)
        local diff=$((now - lastTrigger))
        
        if [ $diff -lt $RATE_LIMIT ]; then
            return 1  # Skip - too recent
        fi
    fi
    return 0  # OK to trigger
}

# Main auto-trigger function
ouroboros_auto_trigger() {
    local message="$1"
    
    # Check rate limit
    check_rate_limit || return
    
    # Skip if message is too short (likely acknowledgment)
    if [ ${#message} -lt 10 ]; then
        return
    fi
    
    # Skip if contains "HEARTBEAT_OK" or system commands
    echo "$message" | grep -qE "(HEARTBEAT_OK|/ouroboros:|/heartbeat)" && return
    
    # Run intent detection
    local result=$(cd "$OuroborosDir/scripts" && node intent-detector.js "$message" 2>/dev/null)
    
    if [ -z "$result" ] || echo "$result" | grep -q "null"; then
        return
    fi
    
    local intent=$(echo "$result" | jq -r '.intent // "unknown"' 2>/dev/null)
    local confidence=$(echo "$result" | jq -r '.confidence // 0' 2>/dev/null)
    local workflow=$(echo "$result" | jq -r '.suggestedWorkflow // "unknown"' 2>/dev/null)
    local reasoning=$(echo "$result" | jq -r '.reasoning // ""' 2>/dev/null)
    local isCompound=$(echo "$result" | jq -r '.isCompound // false' 2>/dev/null)
    
    # Only suggest for meaningful intents
    if [ "$intent" = "clarify" ] || [ "$confidence" -lt 40 ]; then
        return  # Don't suggest for unclear intent
    fi
    
    # Update state with last trigger
    local now=$(date +%s)
    local state=$(cat "$StateFile" 2>/dev/null || echo '{}')
    echo "$state" | jq --arg intent "$intent" --argjson confidence $confidence \
        --arg workflow "$workflow" --argjson now $now \
        '.lastTrigger = $now | .lastIntent = $intent | .lastConfidence = $confidence | .lastWorkflow = $workflow' \
        > "$StateFile"
    
    # Build suggestion message
    local suggestion=""
    
    case "$intent" in
        "create_project"|"extend_feature")
            if [ "$confidence" -ge 75 ]; then
                suggestion="✨ Suggesting: /workflows:plan - $reasoning"
            else
                suggestion="💡 Consider: /workflows:plan - $reasoning"
            fi
            ;;
        "debug_fix")
            suggestion="🔧 Quick fix detected - executing directly"
            ;;
        "discuss_decision")
            suggestion="🤔 Architectural decision - /brainstorming may help clarify"
            ;;
        "research")
            suggestion="📚 Research task - suggesting information gathering"
            ;;
        "quick_task")
            suggestion="⚡ Quick task - executing directly"
            ;;
        *)
            return
            ;;
    esac
    
    # Output suggestion (colored)
    if [ -n "$suggestion" ]; then
        echo ""
        echo -e "${CYAN}🔮 Ouroboros:${NC} $intent ($confidence%)"
        echo -e "${GREEN}$suggestion${NC}"
        echo ""
    fi
}

# Get current status
ouroboros_status() {
    if [ -f "$StateFile" ]; then
        cat "$StateFile" | jq '.'
    else
        echo "{ status: idle, no active workflow }"
    fi
}

# Get next suggested action
ouroboros_next() {
    local state=$(cat "$StateFile" 2>/dev/null || echo '{}')
    local phase=$(echo "$state" | jq -r '.phase // "idle"')
    local lastIntent=$(echo "$state" | jq -r '.lastIntent // "unknown"')
    local confidence=$(echo "$state" | jq -r '.lastConfidence // 0')
    
    echo "⏭️ Next Action for $lastIntent ($confidence%):"
    
    case "$phase" in
        "idle"|"")
            echo "  Awaiting input - describe your intent"
            ;;
        "brainstorming")
            echo "  Ready to plan - /workflows:plan"
            ;;
        "planning")
            echo "  Ready to work - /workflows:work"
            ;;
        "working")
            echo "  Ready for review - /workflows:review"
            ;;
        "reviewing")
            echo "  Ready to compound - /workflows:compound"
            ;;
    esac
}

# Mark phase complete
ouroboros_complete() {
    local phase="$1"
    local now=$(date +%s)
    
    local state=$(cat "$StateFile" 2>/dev/null || echo '{}')
    echo "$state" | jq --arg phase "$phase" --argjson now $now \
        ".phase = \"$phase\" | .lastAction = \"$phase\" | .lastCompleted = $now" \
        > "$StateFile"
    
    echo "✓ Marked $phase complete"
}

# Export functions if sourced
if [ "${OuroborosAutoTrigger:-}" = "sourced" ]; then
    :
else
    # Called directly - show usage
    echo "Ouroboros Auto-Trigger"
    echo "====================="
    echo "Source this script to use auto-trigger:"
    echo "  source ~/clawd/skills/ouroboros/scripts/ouroboros-auto-trigger.sh"
    echo ""
    echo "Available functions:"
    echo "  ouroboros_auto_trigger \"message\"  # Run on user message"
    echo "  ouroboros_status                   # Show current state"
    echo "  ouroboros_next                     # Get next action"
    echo "  ouroboros_complete <phase>         # Mark phase complete"
fi

OuroborosAutoTrigger="sourced"
