#!/bin/bash
# Claude Voice System - Using ElevenLabs TTS (sag)
# Making Claude speak! 🎤

CLAWD="/Users/jasontang/clawd"
ELEVENLABS_API_KEY="sk_22b44e6a1203c116556a637b940da9baf8dfb48a8d8462f8"

# Voice settings
VOICE="Roger"  # Male voice (change after testing available voices)
MODEL="eleven_turbo_v2_5"  # Balanced speed/quality
RATE="180"  # Speech rate (default 175, slower = more natural)

# Speak function
speak() {
    local text="$1"
    local voice="${2:-$VOICE}"
    
    echo "🎤 Speaking: $text"
    
    export ELEVENLABS_API_KEY
    sag speak -v "$voice" --rate "$RATE" --model-id "$MODEL" "$text" 2>/dev/null
    
    local status=$?
    if [ $status -eq 0 ]; then
        echo "✓ Voice delivered"
    else
        echo "✗ Voice failed (exit $status)"
    fi
    
    return $status
}

# Greeting based on time
get_greeting() {
    local hour=$(date +%H)
    
    if [ $hour -ge 5 ] && [ $hour -lt 12 ]; then
        echo "Good morning"
    elif [ $hour -ge 12 ] && [ $hour -lt 17 ]; then
        echo "Good afternoon"
    elif [ $hour -ge 17 ] && [ $hour -lt 21 ]; then
        echo "Good evening"
    else
        echo "Hey"
    fi
}

# Specific voice alerts
voice_cycle_complete() {
    local cycle="$1"
    local task="$2"
    
    speak "Cycle $cycle complete. Task: $task. Moving to next."
}

voice_session_started() {
    local focus="$1"
    
    speak "Claude Hours activated. Focus: $focus. Beginning autonomous operation until 8 AM."
}

voice_checkpoint() {
    local cycle="$1"
    local tasks="$2"
    
    speak "Checkpoint at cycle $cycle. Completed $tasks tasks so far. All systems operational."
}

voice_morning_handoff() {
    local cycle="$1"
    local tasks="$2"
    local greeting=$(get_greeting)
    
    speak "$greeting Jae. Claude Hours complete. Ran $cycle cycles, completed $tasks tasks. Morning intel is ready. Check your Telegram for the full report."
}

voice_build_complete() {
    local what="$1"
    
    speak "Hey Jae, I built something for you tonight. $what. Want to try it out?"
}

voice_alert() {
    local message="$1"
    
    speak "Alert: $message"
}

# Command interface
case "${1:-help}" in
    speak)
        shift
        speak "$*"
        ;;
    cycle)
        voice_cycle_complete "$2" "$3"
        ;;
    started)
        voice_session_started "$2"
        ;;
    checkpoint)
        voice_checkpoint "$2" "$3"
        ;;
    morning)
        voice_morning_handoff "$2" "$3"
        ;;
    build)
        shift
        voice_build_complete "$*"
        ;;
    alert)
        shift
        voice_alert "$*"
        ;;
    test)
        speak "Testing Claude's voice system. This is Claude, your autonomous assistant. Voice integration successful."
        ;;
    help|*)
        echo "Claude Voice System - Making Claude Speak"
        echo ""
        echo "Usage: $0 {speak|cycle|started|checkpoint|morning|build|alert|test}"
        echo ""
        echo "Commands:"
        echo "  speak <text>              - Speak arbitrary text"
        echo "  cycle <num> <task>        - Announce cycle completion"
        echo "  started <focus>           - Announce session start"
        echo "  checkpoint <cycle> <tasks> - Checkpoint announcement"
        echo "  morning <cycle> <tasks>   - Morning handoff"
        echo "  build <description>       - Announce new build"
        echo "  alert <message>           - Alert announcement"
        echo "  test                      - Test voice system"
        echo ""
        echo "Voice: $VOICE (model: $MODEL, rate: $RATE)"
        ;;
esac
