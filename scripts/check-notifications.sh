#!/bin/bash
# Check subagent notifications
#
# Usage:
#   ./scripts/check-notifications.sh       # New notifications since last check
#   ./scripts/check-notifications.sh --all # All notifications
#   ./scripts/check-notifications.sh --clear # Clear after reading

NOTIF_FILE="$HOME/.clawdbot/agents/main/notifications.jsonl"
STATE_FILE="$HOME/.clawdbot/agents/main/notif-state.json"
MODE="new"

# Parse arguments
for arg in "$@"; do
    case $arg in
        --all|-a)
            MODE="all"
            ;;
        --clear|-c)
            MODE="clear"
            ;;
        --help|-h)
            echo "Usage: $0 [--all] [--clear]"
            echo ""
            echo "Options:"
            echo "  --all, -a     Show all notifications (not just new ones)"
            echo "  --clear, -c   Clear notifications after reading"
            echo ""
            exit 0
            ;;
    esac
done

# Check if notification file exists
if [ ! -f "$NOTIF_FILE" ]; then
    echo "No notifications yet."
    exit 0
fi

# Get last check timestamp
LAST_CHECK=0
if [ -f "$STATE_FILE" ] && [ "$MODE" == "new" ]; then
    LAST_CHECK=$(cat "$STATE_FILE" | grep -o '"lastCheck":[0-9]*' | cut -d':' -f2 || echo "0")
fi

# Current timestamp
CURRENT_TIME=$(date +%s)000

# Read and display notifications
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔔 Subagent Notifications"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

COUNT=0
while IFS= read -r line; do
    TIMESTAMP=$(echo "$line" | grep -o '"timestamp":[0-9]*' | cut -d':' -f2)
    MESSAGE=$(echo "$line" | grep -o '"message":"[^"]*"' | sed 's/"message":"//; s/"$//' | sed 's/\\n/\n/g')
    FROM=$(echo "$line" | grep -o '"from":"[^"]*"' | cut -d'"' -f4)
    
    # Filter by timestamp if checking only new
    if [ "$MODE" == "new" ] && [ "$TIMESTAMP" -le "$LAST_CHECK" ]; then
        continue
    fi
    
    # Calculate time ago
    TIME_AGO=$(( ($CURRENT_TIME - $TIMESTAMP) / 1000 ))
    if [ $TIME_AGO -lt 60 ]; then
        TIME_STR="${TIME_AGO}s ago"
    elif [ $TIME_AGO -lt 3600 ]; then
        TIME_STR="$(( TIME_AGO / 60 ))m ago"
    else
        TIME_STR="$(( TIME_AGO / 3600 ))h ago"
    fi
    
    echo "[$TIME_STR]"
    echo "$MESSAGE"
    echo ""
    
    COUNT=$((COUNT + 1))
done < "$NOTIF_FILE"

if [ $COUNT -eq 0 ]; then
    if [ "$MODE" == "new" ]; then
        echo "No new notifications since last check."
    else
        echo "No notifications found."
    fi
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Total: $COUNT notification(s)"
fi

echo ""

# Update state file
mkdir -p "$(dirname "$STATE_FILE")"
echo "{\"lastCheck\":$CURRENT_TIME}" > "$STATE_FILE"

# Clear if requested
if [ "$MODE" == "clear" ]; then
    > "$NOTIF_FILE"
    echo "✅ Notifications cleared."
    echo ""
fi
