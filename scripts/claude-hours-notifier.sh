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

# Specific notification functions
notify_started() {
    local focus="$1"
    local time=$(TZ='America/Chicago' date '+%I:%M %p')
    send_notify "🌙 *Claude Hours Started*

Focus: $focus
Time: $time CST

Starting autonomous operation until 8 AM."
}

notify_cycle() {
    local cycle="$1"
    local task="$2"
    local status="$3"
    local tasks_done="$4"
    local focus="$5"
    local duration="$6"
    
    local emoji="✅"
    [ "$status" != "Success" ] && emoji="⚠️"
    
    send_notify "$emoji *Cycle $cycle: $task*

Status: $status
Tasks completed: $tasks_done
Duration: $duration
Focus: $focus"
}

notify_complete() {
    local cycle="$1"
    local tasks_done="$2"
    local focus="$3"
    local duration="$4"
    local outputs="$5"
    local start_time="$6"
    local end_time="$7"
    
    send_notify "🌅 *Claude Hours Complete*

*Session Summary:*
• Total cycles: $cycle
• Tasks completed: $tasks_done
• Duration: $duration
• Time: $start_time → $end_time

*Focus:* $focus

*Outputs:*
$outputs

---
Morning handoff ready at 8:00 AM"
}

# CLI interface
case "${1:-}" in
    notify_started)
        notify_started "${2:-General}"
        ;;
    notify_cycle)
        notify_cycle "$2" "$3" "$4" "$5" "$6" "$7"
        ;;
    notify_complete)
        notify_complete "$2" "$3" "$4" "$5" "$6" "$7" "$8"
        ;;
    cli)
        shift
        send_notify "$1"
        ;;
    test)
        send_notify "TEST notification - $(date '+%I:%M %p CST')"
        ;;
    *)
        echo "Usage: $0 {notify_started|notify_cycle|notify_complete|cli|test}"
        exit 1
        ;;
esac
