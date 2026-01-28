#!/bin/bash
# Claude Hours Telegram Notifier - FIXED with absolute paths

# Define CLAWD explicitly (works in all contexts)
CLAWD="/Users/jasontang/clawd"

# Load credentials with ABSOLUTE PATHS
if [ -f "$CLAWD/.env.openrouter" ]; then
    source "$CLAWD/.env.openrouter" 2>/dev/null
fi

if [ -f "$CLAWD/.claude/telegram-env.sh" ]; then
    source "$CLAWD/.claude/telegram-env.sh" 2>/dev/null
fi

# Fallback to hardcoded values (absolute)
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-8547350301:AAGFMLsPvNISxc9kUewgak-5kdZLow-6QSw}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-7948630843}"

# Get cycle info
get_cycle() {
    [ -f "$CLAWD/.claude/state/cycle.txt" ] && cat "$CLAWD/.claude/state/cycle.txt" || echo "0"
}

get_tasks() {
    [ -f "$CLAWD/.claude/state/current-session.json" ] && jq '.tasks_completed | length' "$CLAWD/.claude/state/current-session.json" 2>/dev/null || echo "0"
}

get_duration() {
    [ -f "$CLAWD/.claude/state/current-session.json" ] && jq -r '.duration' "$CLAWD/.claude/state/current-session.json" 2>/dev/null || echo "0m"
}

get_focus() {
    [ -f "$CLAWD/.claude/state/current-session.json" ] && jq -r '.focus' "$CLAWD/.claude/state/current-session.json" 2>/dev/null || echo "General"
}

# Send notification
send_notify() {
    local message="$1"
    local cycle=$(get_cycle)
    local tasks=$(get_tasks)
    local duration=$(get_duration)
    local focus=$(get_focus)
    
    if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$TELEGRAM_CHAT_ID" ]; then
        echo "ERROR: Telegram credentials not set"
        return 1
    fi
    
    local full_msg="🔄 Claude Hours - Cycle $cycle

$message

📊 Metrics
• Cycles: $cycle
• Tasks: $tasks
• Focus: $focus
• Time: $duration

---
Claude Hours v2.8 | Autonomous"

    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
        -d "chat_id=$TELEGRAM_CHAT_ID" \
        -d "text=$full_msg" \
        -d "parse_mode=Markdown" \
        -d "disable_web_page_preview=true" > /dev/null 2>&1
    
    echo "✓ Notification sent"
}

# CLI interface
if [ "${1:-}" = "cli" ]; then
    shift
    send_notify "$1"
fi

if [ "${1:-}" = "test" ]; then
    send_notify "TEST notification - $(date '+%I:%M %p CST')"
fi
