#!/bin/bash
# run-heartbeat.sh - Complete heartbeat check with subagent monitoring
# Run this every ~30 seconds for live updates

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_FILE="$SCRIPT_DIR/memory/heartbeat-state.json"
SESSIONS_FILE="$HOME/.clawdbot/agents/main/sessions/sessions.json"

echo "🔔 HEARTBEAT CHECK - $(date '+%H:%M:%S')"
echo "────────────────────────────────────────────"

# 1. Subagent Monitoring (mandatory)
if [ -f "$SESSIONS_FILE" ]; then
  echo ""
  echo "🤖 SUBAGENT STATUS:"
  "$SCRIPT_DIR/subagent-monitor.sh"
fi

# 2. Context compression check
# echo ""
# echo "📝 Context: Run ./scripts/summarize-context.sh if needed"

# 3. Auth status check
# echo ""
# echo "🔐 Auth: Run node ./scripts/auth-status.js --check if needed"

echo ""
echo "────────────────────────────────────────────"
