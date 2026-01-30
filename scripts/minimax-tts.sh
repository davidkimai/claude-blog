#!/bin/bash
# MiniMax TTS with speech-2.8-hd
# Usage: ./minimax-tts.sh "Your text here" [-o output.mp3] [-v voice_id]

# Load env from zshrc
source ~/.zshrc 2>/dev/null || true
export MINIMAX_API_HOST="${MINIMAX_API_HOST:-https://api.minimax.io}"

# Default to speech-2.8-hd
MODEL="speech-2.8-hd"
VOICE="male-qn-qingse"  # Common male voice
OUTPUT="/tmp/minimax-tts.mp3"

# Parse args
while [[ $# -gt 0 ]]; do
    case $1 in
        -o|--output) OUTPUT="$2"; shift 2 ;;
        -v|--voice) VOICE="$2"; shift 2 ;;
        *) TEXT="$1"; shift ;;
    esac
done

if [[ -z "$TEXT" ]]; then
    echo "Usage: $0 \"text\" [-o output.mp3] [-v voice_id]"
    echo "Default model: speech-2.8-hd"
    exit 1
fi

# Wait for rate limit reset (simple backoff)
sleep 3

echo "Generating TTS with MiniMax speech-2.8-hd..."
curl -s -X POST "$MINIMAX_API_HOST/v1/t2a_pro" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $MINIMAX_API_KEY" \
    -d "{\"model\":\"$MODEL\",\"text\":\"$TEXT\",\"voice_id\":\"$VOICE\",\"format\":\"mp3\"}" \
    -o "$OUTPUT"

if [[ -s "$OUTPUT" ]] && file "$OUTPUT" | grep -q "MP3\|audio"; then
    echo "✅ Success! Audio saved: $OUTPUT"
    echo "Size: $(ls -lh "$OUTPUT" | awk '{print $5}')"
    afplay "$OUTPUT" 2>/dev/null || echo "(no audio player available)"
else
    echo "❌ Failed or rate limited"
    cat "$OUTPUT" 2>/dev/null | head -c 300
fi
