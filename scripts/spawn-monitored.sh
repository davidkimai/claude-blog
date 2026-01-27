#!/bin/bash
# Spawn Monitored Subagent - CLI Wrapper for Claude
#
# Usage: ./scripts/spawn-monitored.sh <label> <task> [model]
#
# This script is designed to be called via exec tool from Claude.
# It spawns a subagent and automatically starts monitoring.

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONITOR_SCRIPT="$SCRIPT_DIR/subagent-monitor.js"
DEFAULT_MODEL="gemini-3-pro-high"
POLL_INTERVAL=7000

# Parse arguments
if [ $# -lt 2 ]; then
    echo "Usage: $0 <label> <task> [model]"
    echo ""
    echo "Example:"
    echo "  $0 \"my-task\" \"Analyze the codebase\" \"gemini-3-pro-high\""
    exit 1
fi

LABEL="$1"
TASK="$2"
MODEL="${3:-$DEFAULT_MODEL}"

# Escape quotes in task description for JSON
TASK_ESCAPED=$(echo "$TASK" | sed 's/"/\\"/g' | sed "s/'/\\'/g")

echo "🚀 Spawning subagent with monitoring..."
echo "   Label: $LABEL"
echo "   Model: $MODEL"
echo "   Task: ${TASK:0:80}..."
echo ""

# Spawn the subagent using clawdbot
# Note: This uses the clawdbot CLI to spawn a session
# Use full path since NVM bin directory may not be in PATH
CLAWDBOT_BIN="/Users/jasontang/.nvm/versions/node/v23.8.0/bin/clawdbot"
SPAWN_OUTPUT=$("$CLAWDBOT_BIN" sessions spawn \
    --label "$LABEL" \
    --task "$TASK_ESCAPED" \
    --model "$MODEL" \
    --json 2>&1)

# Check if spawn succeeded
if [ $? -ne 0 ]; then
    echo "❌ Failed to spawn subagent:"
    echo "$SPAWN_OUTPUT"
    exit 1
fi

# Extract session key from output
# Expected JSON format: {"sessionKey": "agent:main:subagent:abc123", ...}
SESSION_KEY=$(echo "$SPAWN_OUTPUT" | grep -o '"sessionKey":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SESSION_KEY" ]; then
    echo "⚠️ Warning: Could not extract session key from spawn output"
    echo "Spawn output:"
    echo "$SPAWN_OUTPUT"
    exit 1
fi

echo "✅ Subagent spawned: $SESSION_KEY"
echo ""

# Start the monitoring process in background
echo "📊 Starting real-time monitor..."

nohup node "$MONITOR_SCRIPT" "$SESSION_KEY" --interval "$POLL_INTERVAL" > /dev/null 2>&1 &
MONITOR_PID=$!

# Log the spawn for tracking
SPAWN_LOG="$HOME/.clawdbot/agents/main/monitor-spawns.jsonl"
mkdir -p "$(dirname "$SPAWN_LOG")"

TIMESTAMP=$(date +%s)
echo "{\"timestamp\":$TIMESTAMP,\"sessionKey\":\"$SESSION_KEY\",\"label\":\"$LABEL\",\"monitorPid\":$MONITOR_PID,\"model\":\"$MODEL\"}" >> "$SPAWN_LOG"

echo "✅ Monitor started (PID: $MONITOR_PID)"
echo ""
echo "📝 Session Key: $SESSION_KEY"
echo "📝 Monitor PID: $MONITOR_PID"
echo ""
echo "💡 Use './scripts/monitor-status.sh' to check active monitors"
echo "💡 Use './scripts/check-notifications.sh' to see updates"
