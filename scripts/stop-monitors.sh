#!/bin/bash
# Stop subagent monitors
#
# Usage:
#   ./scripts/stop-monitors.sh          # Stop all monitors
#   ./scripts/stop-monitors.sh <PID>    # Stop specific monitor

if [ $# -eq 0 ]; then
    # Stop all monitors
    echo "🛑 Stopping all subagent monitors..."
    
    PIDS=$(ps aux | grep 'subagent-monitor.js' | grep -v grep | awk '{print $2}')
    
    if [ -z "$PIDS" ]; then
        echo "No monitors running."
        exit 0
    fi
    
    COUNT=0
    for PID in $PIDS; do
        kill "$PID" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "  ✅ Stopped monitor (PID: $PID)"
            COUNT=$((COUNT + 1))
        else
            echo "  ⚠️ Could not stop PID $PID"
        fi
    done
    
    echo ""
    echo "✅ Stopped $COUNT monitor(s)"
else
    # Stop specific monitor
    PID=$1
    echo "🛑 Stopping monitor (PID: $PID)..."
    
    kill "$PID" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Monitor stopped"
    else
        echo "❌ Failed to stop monitor (PID: $PID)"
        echo "   Maybe it's not running or you don't have permission?"
        exit 1
    fi
fi
