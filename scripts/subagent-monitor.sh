#!/bin/bash
# subagent-monitor.sh - Simple subagent status
SESSIONS_FILE="$HOME/.clawdbot/agents/main/sessions/sessions.json"

echo "🔔 SUBAGENT STATUS - $(date '+%H:%M:%S')"
echo "────────────────────────────────────────────"

# Count subagents
TOTAL=$(cat "$SESSIONS_FILE" 2>/dev/null | jq 'keys | map(select(contains("subagent"))) | length')
echo "📊 Active subagents: $TOTAL"

# List pending (no totalTokens)
echo ""
echo "⏳ RUNNING:"
cat "$SESSIONS_FILE" | jq -r 'keys[] | select(contains("subagent"))' 2>/dev/null | while read key; do
  tokens=$(cat "$SESSIONS_FILE" | jq -r ".[\"$key\"].totalTokens // \"pending\"")
  if [ "$tokens" = "pending" ] || [ -z "$tokens" ]; then
    label=$(cat "$SESSIONS_FILE" | jq -r ".[\"$key\"].label")
    echo "  • $label"
  fi
done

# List completed
echo ""
echo "✅ RECENTLY COMPLETED:"
cat "$SESSIONS_FILE" | jq -r 'keys[] | select(contains("subagent"))' 2>/dev/null | tail -5 | while read key; do
  tokens=$(cat "$SESSIONS_FILE" | jq -r ".[\"$key\"].totalTokens // 0")
  if [ "$tokens" != "pending" ] && [ "$tokens" != "0" ]; then
    label=$(cat "$SESSIONS_FILE" | jq -r ".[\"$key\"].label")
    echo "  • $label (${tokens}k tokens)"
  fi
done

echo ""
echo "────────────────────────────────────────────"
