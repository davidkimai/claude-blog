#!/bin/bash
# Check status of active subagent monitors
#
# Usage: ./scripts/monitor-status.sh [--verbose]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SPAWN_LOG="$HOME/.clawdbot/agents/main/monitor-spawns.jsonl"
SESSIONS_JSON="$HOME/.clawdbot/agents/main/sessions/sessions.json"
VERBOSE=false

if [ "$1" == "--verbose" ] || [ "$1" == "-v" ]; then
    VERBOSE=true
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Subagent Monitor Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for spawn log
if [ ! -f "$SPAWN_LOG" ]; then
    echo "No monitors logged yet."
    echo ""
    echo "💡 Spawn a monitored subagent with:"
    echo "   ./scripts/spawn-monitored.sh <label> <task>"
    exit 0
fi

# Check running monitors
RUNNING_PIDS=$(ps aux | grep 'subagent-monitor.js' | grep -v grep | awk '{print $2}')
RUNNING_COUNT=$(echo "$RUNNING_PIDS" | grep -c '^' 2>/dev/null || echo "0")

echo "🔍 Active Monitors: $RUNNING_COUNT"
echo ""

if [ $RUNNING_COUNT -gt 0 ]; then
    echo "Running monitor processes:"
    ps aux | grep 'subagent-monitor.js' | grep -v grep | awk '{printf "  PID %-8s | CPU: %-5s | Mem: %-6s | Time: %s\n", $2, $3"%", $4"%", $10}'
    echo ""
fi

# Recent spawns (last 10)
echo "📝 Recent Spawns (last 10):"
tail -n 10 "$SPAWN_LOG" | while IFS= read -r line; do
    LABEL=$(echo "$line" | grep -o '"label":"[^"]*"' | cut -d'"' -f4)
    SESSION_KEY=$(echo "$line" | grep -o '"sessionKey":"[^"]*"' | cut -d'"' -f4)
    MONITOR_PID=$(echo "$line" | grep -o '"monitorPid":[0-9]*' | cut -d':' -f2)
    TIMESTAMP=$(echo "$line" | grep -o '"timestamp":[0-9]*' | cut -d':' -f2)
    MODEL=$(echo "$line" | grep -o '"model":"[^"]*"' | cut -d'"' -f4)
    
    # Check if monitor is still running
    if ps -p "$MONITOR_PID" > /dev/null 2>&1; then
        STATUS="🟢 Running"
    else
        STATUS="🔴 Stopped"
    fi
    
    # Format timestamp
    if command -v date >/dev/null 2>&1; then
        TIME_AGO=$(( $(date +%s) - $TIMESTAMP ))
        if [ $TIME_AGO -lt 60 ]; then
            TIME_STR="${TIME_AGO}s ago"
        elif [ $TIME_AGO -lt 3600 ]; then
            TIME_STR="$(( TIME_AGO / 60 ))m ago"
        else
            TIME_STR="$(( TIME_AGO / 3600 ))h ago"
        fi
    else
        TIME_STR="$TIMESTAMP"
    fi
    
    echo "  $STATUS | $LABEL ($TIME_STR)"
    
    if [ "$VERBOSE" = true ]; then
        echo "         Session: $SESSION_KEY"
        echo "         PID: $MONITOR_PID | Model: $MODEL"
        echo ""
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Commands:"
echo "   Check notifications: ./scripts/check-notifications.sh"
echo "   Stop all monitors:   ./scripts/stop-monitors.sh"
echo "   Stop specific:       kill <PID>"
