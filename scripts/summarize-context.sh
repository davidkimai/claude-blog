#!/bin/bash
#
# Context Compression: Summarization Script
# Counts conversation turns and triggers summarization when threshold reached
#

set -euo pipefail

# Configuration
WORKSPACE="$HOME/clawd"
SESSION_DIR="$HOME/.clawdbot/agents/main/sessions"
CURRENT_SESSION="56c4671f-4cb6-4a18-9360-a36f8908062b"  # Update this dynamically
SESSION_FILE="$SESSION_DIR/$CURRENT_SESSION.jsonl"
COUNTER_FILE="$WORKSPACE/memory/turn-counter.json"
SUMMARY_FILE="$WORKSPACE/memory/conversation-summary.md"
TURN_THRESHOLD=5

# Check if files exist
if [ ! -f "$SESSION_FILE" ]; then
  echo "Error: Session file not found: $SESSION_FILE"
  exit 1
fi

if [ ! -f "$COUNTER_FILE" ]; then
  echo "Error: Counter file not found: $COUNTER_FILE"
  echo "Creating default counter..."
  mkdir -p "$(dirname "$COUNTER_FILE")"
  cat > "$COUNTER_FILE" << 'EOF'
{
  "sessionId": "56c4671f-4cb6-4a18-9360-a36f8908062b",
  "totalTurns": 0,
  "lastSummaryTurn": 0,
  "lastCheckedAt": null,
  "summaries": []
}
EOF
fi

# Count user messages (each user message = 1 turn)
TURN_COUNT=$(grep '"type":"message"' "$SESSION_FILE" | grep -c '"role":"user"' || echo 0)

# Load last summary turn
LAST_SUMMARY=$(jq -r '.lastSummaryTurn // 0' "$COUNTER_FILE")

# Calculate turns since last summary
TURNS_SINCE_SUMMARY=$((TURN_COUNT - LAST_SUMMARY))

echo "Current turns: $TURN_COUNT"
echo "Last summary at turn: $LAST_SUMMARY"
echo "Turns since summary: $TURNS_SINCE_SUMMARY"

# Check if we need summarization
if [ "$TURNS_SINCE_SUMMARY" -ge "$TURN_THRESHOLD" ]; then
  echo ""
  echo "✅ Threshold reached! Triggering summarization for turns $((LAST_SUMMARY + 1))-$TURN_COUNT"
  echo ""
  
  # Calculate turn range
  START_TURN=$((LAST_SUMMARY + 1))
  END_TURN=$TURN_COUNT
  
  # Extract recent messages for summarization
  echo "📝 Extracting messages from turns $START_TURN-$END_TURN..."
  
  # Extract user messages and assistant responses
  MESSAGES=$(cat "$SESSION_FILE" | \
    jq -r 'select(.type == "message") | 
           "\(.timestamp // 0) | \(.role): \(.content[0].text // .content[0].thinking // "[tool call]")"' | \
    sort -n | \
    tail -n "$((TURNS_SINCE_SUMMARY * 2))" | \
    cut -d'|' -f2-)
  
  if [ -z "$MESSAGES" ]; then
    echo "⚠️  No messages found to summarize"
    exit 1
  fi
  
  # Load summarization prompt
  PROMPT_FILE="$WORKSPACE/prompts/summarization-prompt.md"
  if [ ! -f "$PROMPT_FILE" ]; then
    echo "⚠️  Prompt file not found: $PROMPT_FILE"
    exit 1
  fi
  
  SYSTEM_PROMPT=$(cat "$PROMPT_FILE")
  
  # Build Gemini API request
  REQUEST_JSON=$(jq -n \
    --arg prompt "$SYSTEM_PROMPT" \
    --arg messages "$MESSAGES" \
    '{
      contents: [{
        parts: [{
          text: ($prompt + "\n\n## Messages to Summarize:\n\n" + $messages)
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500
      }
    }')
  
  echo "🤖 Calling Gemini API..."
  
  # Call Gemini API
  GEMINI_KEY="AIzaSyDamn_QwMNxrnZ4B1jGULBz76VCKSnA94Q"
  RESPONSE=$(curl -s -X POST \
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GEMINI_KEY" \
    -H "Content-Type: application/json" \
    -d "$REQUEST_JSON")
  
  # Extract summary text
  SUMMARY=$(echo "$RESPONSE" | jq -r '.candidates[0].content.parts[0].text // "Error: No summary generated"')
  
  if [ "$SUMMARY" = "Error: No summary generated" ]; then
    echo "❌ Summarization failed. Response:"
    echo "$RESPONSE" | jq '.'
    exit 1
  fi
  
  # Append to summary file
  echo "" >> "$SUMMARY_FILE"
  echo "## Summary (Turns $START_TURN-$END_TURN) — $(date +%Y-%m-%d)" >> "$SUMMARY_FILE"
  echo "" >> "$SUMMARY_FILE"
  echo "$SUMMARY" >> "$SUMMARY_FILE"
  echo "" >> "$SUMMARY_FILE"
  
  echo "✅ Summary appended to $SUMMARY_FILE"
  
  # Update counter after successful summarization
  jq ".lastSummaryTurn = $TURN_COUNT | .lastCheckedAt = \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"" \
    "$COUNTER_FILE" > "${COUNTER_FILE}.tmp"
  mv "${COUNTER_FILE}.tmp" "$COUNTER_FILE"
  
  echo ""
  echo "✅ Counter updated. Next summary at turn $((TURN_COUNT + TURN_THRESHOLD))"
else
  echo ""
  echo "⏳ No action needed. Next summary in $((TURN_THRESHOLD - TURNS_SINCE_SUMMARY)) turns."
  
  # Update last checked timestamp
  jq ".totalTurns = $TURN_COUNT | .lastCheckedAt = \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"" \
    "$COUNTER_FILE" > "${COUNTER_FILE}.tmp"
  mv "${COUNTER_FILE}.tmp" "$COUNTER_FILE"
fi

echo ""
echo "Summary: Checked at $(date)"
