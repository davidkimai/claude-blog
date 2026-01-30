#!/bin/bash
# MiniMax TTS Helper Script
# Usage: ./minimax-tts-helper.sh "text to speak" [--voice VOX_ID] [--model MODEL] [--output FILE]

set -e

# Load environment
export MINIMAX_API_KEY="${MINIMAX_API_KEY:-$(cat ~/.clawdbot/.env.minimax 2>/dev/null | grep MINIMAX_API_KEY | cut -d'=' -f2)}"
export MINIMAX_API_HOST="${MINIMAX_API_HOST:-https://api.minimax.io}"

# Default settings
VOICE="en_us_male_1"
MODEL="speech-2.8-hd"
OUTPUT=""
TEXT=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --voice|-v)
            VOICE="$2"
            shift 2
            ;;
        --model|-m)
            MODEL="$2"
            shift 2
            ;;
        --output|-o)
            OUTPUT="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 \"text\" [OPTIONS]"
            echo "Options:"
            echo "  -v, --voice VOICE    Voice ID (default: en_us_male_1)"
            echo "  -m, --model MODEL    Model (default: speech-2.8-hd)"
            echo "  -o, --output FILE    Output file path"
            echo "  -h, --help           Show this help"
            exit 0
            ;;
        *)
            TEXT="$1"
            shift
            ;;
    esac
done

if [[ -z "$TEXT" ]]; then
    echo "Error: No text provided"
    echo "Usage: $0 \"text to speak\" [OPTIONS]"
    exit 1
fi

if [[ -z "$MINIMAX_API_KEY" ]]; then
    echo "Error: MINIMAX_API_KEY not set"
    echo "Set it via: export MINIMAX_API_KEY=\"your-key\""
    echo "Or create ~/.clawdbot/.env.minimax with: MINIMAX_API_KEY=your-key"
    exit 1
fi

# Build curl command for MiniMax TTS API
echo "Generating speech with MiniMax TTS (model: $MODEL, voice: $VOICE)..."

curl -s -X POST "$MINIMAX_API_HOST/v1/t2a_pro" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $MINIMAX_API_KEY" \
    -d '{
        "model": "'"$MODEL"'",
        "input": "'"$TEXT"'",
        "voice": "'"$VOICE"'",
        "format": "mp3"
    }' > "${OUTPUT:-/tmp/minimax-tts-output.mp3}"

if [[ -f "${OUTPUT:-/tmp/minimax-tts-output.mp3}" ]]; then
    echo "Audio saved to: ${OUTPUT:-/tmp/minimax-tts-output.mp3}"
    
    # Play if no output file specified
    if [[ -z "$OUTPUT" ]]; then
        echo "Playing..."
        afplay "${OUTPUT:-/tmp/minimax-tts-output.mp3}" 2>/dev/null || \
        mpg123 "${OUTPUT:-/tmp/minimax-tts-output.mp3}" 2>/dev/null || \
        echo "Install mpg123 or use afplay to play audio"
    fi
else
    echo "Error: Failed to generate audio"
    exit 1
fi
