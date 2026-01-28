#!/bin/bash
# Claude Hours Telegram Notifier

# Configure these (can also use TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID env vars)
BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
CHAT_ID="${TELEGRAM_CHAT_ID:-}"

notify() {
    local message="$1"
    local status="${2:-info}"
    
    # Emoji based on status
    case "$status" in
        success) emoji="✅" ;;
        error) emoji="❌" ;;
        warning) emoji="⚠️" ;;
        info) emoji="ℹ️" ;;
        cycle) emoji="🔄" ;;
        *) emoji="📌" ;;
    esac
    
    local full_message="$(echo -e "$emoji Claude Hours Update\n\n$message")"
    
    if [ -n "$BOT_TOKEN" ] && [ -n "$CHAT_ID" ]; then
        curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
            -d "chat_id=$CHAT_ID" \
            -d "text=$full_message" \
            -d "parse_mode=Markdown" > /dev/null 2>&1
    else
        echo "[NOTIFY] $message"
    fi
}

notify_cycle() {
    local cycle="$1"
    local tasks="$2"
    local time_elapsed="$3"
    
    message="🔄 Cycle #$cycle completed\n\n📝 Tasks: $tasks\n⏱️ Time: $time_elapsed"
    notify "$message" "cycle"
}

notify_session() {
    local session_id="$1"
    local total_tasks="$2"
    local focus="$3"
    
    message="🎉 Session Complete: $session_id\n\n📊 Total Tasks: $total_tasks\n🎯 Focus: $focus"
    notify "$message" "success"
}

# Run as function source or CLI
if [ "${1:-}" = "cli" ]; then
    shift
    notify "$1" "${2:-info}"
fi
