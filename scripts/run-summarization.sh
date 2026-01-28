#!/bin/bash
#
# Conversation Summarization Wrapper
# Sets up environment and runs the summarization script
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$SCRIPT_DIR/summarize-context.sh"

# Get Gemini API key from Clawdbot config
get_api_key() {
  local config_file="$HOME/.clawdbot/clawdbot.json"
  if [ -f "$config_file" ]; then
    # Try multiple patterns
    # Pattern 1: skills.entries["nano-banana-pro"].apiKey
    local key=$(cat "$config_file" 2>/dev/null | \
      grep -o '"nano-banana-pro"' -A1 | grep "apiKey" | sed 's/.*"\([^"]*\)"/\1/' | head -1 || echo "")
    
    if [ -n "$key" ]; then
      echo "$key"
      return 0
    fi
    
    # Pattern 2: api_token at top level
    key=$(cat "$config_file" 2>/dev/null | \
      grep -o '"api_token"[[:space:]]*:[[:space:]]*"[^"]*"' | \
      sed 's/.*"\([^"]*\)"/\1/' | head -1 || echo "")
    
    if [ -n "$key" ]; then
      echo "$key"
      return 0
    fi
  fi
  
  # Fallback to environment variable
  if [ -n "${GEMINI_API_KEY:-}" ]; then
    echo "$GEMINI_API_KEY"
    return 0
  fi
  
  return 1
}

# Main execution
main() {
  echo "🔄 Running conversation summarization..."
  
  local api_key
  if api_key=$(get_api_key); then
    export GEMINI_API_KEY="$api_key"
    echo "✅ API key loaded: ${api_key:0:10}..."
  else
    echo "❌ Error: Could not find Gemini API key"
    echo "Please set GEMINI_API_KEY environment variable or check ~/.clawdbot/clawdbot.json"
    exit 1
  fi
  
  # Run the actual script
  bash "$SCRIPT" "$@"
}

main "$@"
