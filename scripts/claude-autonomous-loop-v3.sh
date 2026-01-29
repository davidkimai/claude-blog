#!/bin/bash
# Claude Autonomous Loop v3.0 - Proactive Self-Improvement
# "I want to wake up surprised by what you've done"

CLAWD="/Users/jasontang/clawd"
CODEX="$CLAWD/scripts/codex-api.sh"
VIEWER="$CLAWD/scripts/claude-hours-viewer.sh"
NOTIFIER="$CLAWD/scripts/claude-hours-notifier.sh"
VOICE="$CLAWD/scripts/claude-voice.sh"
BUILDER="$CLAWD/scripts/claude-nightly-builder.sh"
NIGHTLY_DIR="$CLAWD/nightly"
STATE_DIR="$CLAWD/.claude/state"
CYCLE_FILE="$STATE_DIR/cycle.txt"
SESSION_FILE="$STATE_DIR/current-session.json"

mkdir -p "$NIGHTLY_DIR" "$STATE_DIR"

# Check if voice is available
VOICE_ENABLED=false
if [ -x "$VOICE" ]; then
    VOICE_ENABLED=true
fi

# Enhanced init with voice
init_session() {
    local focus="$1"
    local date_str=$(date +%Y-%m-%d)
    
    # Call original init logic
    /bin/bash "$CLAWD/scripts/claude-autonomous-loop-simple.sh" init "$focus"
    
    # Add voice announcement
    if $VOICE_ENABLED; then
        $VOICE started "$focus"
    fi
}

# Check if it's nightly build time (3-5 AM)
is_build_time() {
    local hour=$(TZ='America/Chicago' date +%H)
    [ "$hour" -ge 3 ] && [ "$hour" -lt 5 ]
}

# Check if we've already built tonight
already_built_tonight() {
    local today=$(date +%Y-%m-%d)
    [ -f "$CLAWD/nightly-builds/$today.md" ]
}

# Main loop with enhancements
main() {
    local focus="${1:-Proactive Self-Improvement}"
    
    # Run original loop
    /bin/bash "$CLAWD/scripts/claude-autonomous-loop-simple.sh" run "$focus"
    
    # Check for nightly build opportunity
    if is_build_time && ! already_built_tonight; then
        echo ""
        echo "🌙 Nightly Build Time - Creating something new..."
        
        if $VOICE_ENABLED; then
            $VOICE speak "Entering creative mode. Building tonight's surprise."
        fi
        
        # Run the nightly builder
        $BUILDER run
        
        if [ $? -eq 0 ]; then
            echo "✨ Build complete!"
            
            if $VOICE_ENABLED; then
                $VOICE build "I built something new for you tonight. Check the nightly builds folder when you wake up."
            fi
        fi
    fi
}

case "${1:-run}" in
    run)
        main "${2:-Proactive Self-Improvement}"
        ;;
    init)
        init_session "${2:-General}"
        ;;
    *)
        # Delegate to original
        /bin/bash "$CLAWD/scripts/claude-autonomous-loop-simple.sh" "$@"
        ;;
esac
