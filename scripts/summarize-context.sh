#!/bin/bash
#
# Context Compression: Summarization Script
# Counts conversation turns and triggers summarization when threshold reached
#

set -euo pipefail

# Configuration
WORKSPACE="$HOME/clawd"
SESSION_DIR="$HOME/.clawdbot/agents/main/sessions"
COUNTER_FILE="$WORKSPACE/memory/turn-counter.json"
SUMMARY_FILE="$WORKSPACE/memory/conversation-summary.md"
TURN_THRESHOLD=5

# Auto-detect current session (most recently modified JSONL file)
CURRENT_SESSION=$(ls -t "$SESSION_DIR"/*.jsonl 2>/dev/null | head -1 | xargs basename | sed 's/\.jsonl$//')
if [ -z "$CURRENT_SESSION" ]; then
  echo "Error: No session files found in $SESSION_DIR"
  exit 1
fi

SESSION_FILE="$SESSION_DIR/$CURRENT_SESSION.jsonl"

# Check if files exist
if [ ! -f "$SESSION_FILE" ]; then
  echo "Error: Session file not found: $SESSION_FILE"
  exit 1
fi

if [ ! -f "$COUNTER_FILE" ]; then
  echo "Error: Counter file not found: $COUNTER_FILE"
  exit 1
fi

# Count user messages (each user message = 1 turn)
# Use -s to slurp JSONL file
TURN_COUNT=$(jq -s '[.[] | select(.type == "message" and .message.role == "user")] | length' "$SESSION_FILE" 2>/dev/null || echo 0)

# Load last summary turn
LAST_SUMMARY=$(jq -r '.lastSummaryTurn // 0' "$COUNTER_FILE")

# Calculate turns since last summary
TURNS_SINCE_SUMMARY=$((TURN_COUNT - LAST_SUMMARY))

echo "Current session: $CURRENT_SESSION"
echo "Current turns: $TURN_COUNT"
echo "Last summary at turn: $LAST_SUMMARY"
echo "Turns since summary: $TURNS_SINCE_SUMMARY"

# Check if we need summarization
if [ "$TURNS_SINCE_SUMMARY" -ge "$TURN_THRESHOLD" ]; then
  echo ""
  echo "✅ Threshold reached! Triggering summarization for turns $((LAST_SUMMARY + 1))-$TURN_COUNT"
  echo ""
  
  START_TURN=$((LAST_SUMMARY + 1))
  END_TURN=$TURN_COUNT
  
  echo "📝 Extracting messages from turns $START_TURN-$END_TURN..."
  
  # Extract messages - properly handle Clawdbot session format (JSONL = use -s)
  # Format: {"type":"message","message":{"role":"user|assistant","content":[{"type":"text","text":"..."}]}}
  MESSAGES=$(jq -s -r \
    --argjson start "$START_TURN" \
    --argjson end "$END_TURN" \
    '
    [.[] | 
     select(.type == "message") |
     select(.message.role == "user" or .message.role == "assistant") |
     {role: .message.role, text: (.message.content | if type == "array" then (.[0].text // .[0].thinking // "[complex content]") else tostring end)}
    ][$start-1:$end] | 
    .[] | 
    "\(.role | ascii_upcase): \(.text | select(length > 0) | .[0:500] | rtrimstr("\n"))" | 
    select(length > 20)
    ' "$SESSION_FILE" 2>/dev/null | head -50 || echo "")
  
  if [ -z "$MESSAGES" ] || [ "$MESSAGES" = "null" ]; then
    echo "⚠️  No messages extracted with jq, trying alternative..."
    # Fallback: simple grep extraction
    MESSAGES=$(grep -A2 '"role":"user"' "$SESSION_FILE" 2>/dev/null | grep -v "role" | sed 's/.*"text": *"\([^"]*\)".*/User: \1/' | head -30 || echo "")
  fi
  
  if [ -z "$MESSAGES" ] || [ "$MESSAGES" = "null" ]; then
    echo "⚠️  No messages found to summarize"
    exit 1
  fi
  
  # Load summarization prompt
  PROMPT_FILE="$WORKSPACE/prompts/summarization-prompt.md"
  if [ -f "$PROMPT_FILE" ]; then
    SYSTEM_PROMPT=$(cat "$PROMPT_FILE")
  else
    SYSTEM_PROMPT="You are a technical conversation summarizer. Summarize the following conversation turns, preserving all technical details, file paths, commands, decisions, and actions. Format as a concise bullet list."
  fi
  
  # Get API key from config
  if [ -z "${GEMINI_API_KEY:-}" ]; then
    GEMINI_API_KEY=$(cat ~/.clawdbot/clawdbot.json 2>/dev/null | \
      grep -o '"nano-banana-pro"' -A1 | grep "apiKey" | sed 's/.*"\([^"]*\)"/\1/' | head -1 || echo "")
  fi
  
  if [ -z "${GEMINI_API_KEY:-}" ]; then
    echo "Error: Could not find GEMINI_API_KEY"
    exit 1
  fi
  
  # Use jq -Rs to properly escape the multi-line messages for JSON
  MESSAGES_ESCAPED=$(echo "$MESSAGES" | jq -Rs '.' | sed 's/^"//;s/"$//')
  
  REQUEST_JSON=$(jq -n \
    --arg prompt "$SYSTEM_PROMPT" \
    --arg messages "$MESSAGES_ESCAPED" \
    '{
      contents: [{
        parts: [{
          text: ($prompt + "\n\n## Recent Conversation Turns to Summarize:\n\n" + $messages)
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000
      }
    }')
  
  echo "🤖 Calling Gemini API..."
  
  # Use temp file to avoid pipe corruption with embedded newlines
  TEMP_RESPONSE=$(mktemp)
  curl -s -X POST \
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$REQUEST_JSON" > "$TEMP_RESPONSE"
  
  SUMMARY=$(cat "$TEMP_RESPONSE" | jq -r '.candidates[0].content.parts[0].text // "Error: No summary generated"')
  rm -f "$TEMP_RESPONSE"
  
  if [ "$SUMMARY" = "Error: No summary generated" ] || [ -z "$SUMMARY" ]; then
    echo "❌ Summarization failed. Response:"
    cat "$TEMP_RESPONSE" | jq '.' 2>/dev/null || cat "$TEMP_RESPONSE"
    rm -f "$TEMP_RESPONSE"
    exit 1
  fi
  
  # Append to summary file
  echo "" >> "$SUMMARY_FILE"
  echo "## Summary (Turns $START_TURN-$END_TURN) — $(date +%Y-%m-%d)" >> "$SUMMARY_FILE"
  echo "" >> "$SUMMARY_FILE"
  echo "$SUMMARY" >> "$SUMMARY_FILE"
  echo "" >> "$SUMMARY_FILE"
  
  echo "✅ Summary appended to $SUMMARY_FILE"
  
  # Update counter
  jq ".lastSummaryTurn = $TURN_COUNT | .lastCheckedAt = \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\" | .sessionId = \"$CURRENT_SESSION\"" \
    "$COUNTER_FILE" > "${COUNTER_FILE}.tmp" 2>/dev/null && mv "${COUNTER_FILE}.tmp" "$COUNTER_FILE" || true
  
  echo ""
  echo "✅ Counter updated. Next summary at turn $((TURN_COUNT + TURN_THRESHOLD))"
else
  echo ""
  echo "⏳ No action needed. Next summary in $((TURN_THRESHOLD - TURNS_SINCE_SUMMARY)) turns."
  
  jq ".totalTurns = $TURN_COUNT | .lastCheckedAt = \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"" \
    "$COUNTER_FILE" > "${COUNTER_FILE}.tmp" 2>/dev/null && mv "${COUNTER_FILE}.tmp" "$COUNTER_FILE" || true
fi

echo ""
echo "Summary check complete at $(date)"
