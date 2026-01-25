#!/bin/bash
# Subagent Dashboard - View active and recent subagent sessions
# Usage: ./scripts/subagent-dashboard.sh [--all]

SESSIONS_FILE="$HOME/.clawdbot/agents/main/sessions/sessions.json"

if [[ ! -f "$SESSIONS_FILE" ]]; then
    echo "❌ Sessions file not found: $SESSIONS_FILE"
    exit 1
fi

echo "🤖 Subagent Dashboard"
echo "====================================="

# Parse subagent sessions and display
jq -r '
  to_entries
  | map(select(.key | contains("subagent")))
  | sort_by(.value.updatedAt // 0) | reverse
  | .[]
  | {
      label: (.value.label // "unnamed"),
      model: (.value.model // "--"),
      tokens: (
        if .value.totalTokens then
          (.value.totalTokens / 1000 | . * 10 | floor / 10 | tostring) + "k"
        else
          "--"
        end
      ),
      status: (
        if .value.abortedLastRun == true then "🛑 aborted"
        elif .value.totalTokens then "✅ done"
        else "⏳ pending"
        end
      )
    }
  | "\(.label | .[0:20] | . + " " * (20 - length))| \(.status | . + " " * (12 - length))| \(.tokens | . + " " * (10 - length))| \(.model // "--")"
' "$SESSIONS_FILE"

echo ""
echo "Updated: $(date '+%Y-%m-%d %H:%M:%S')"
