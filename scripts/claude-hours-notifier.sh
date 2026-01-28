#!/bin/bash
# Claude Hours Telegram Notifier

CLAWD="/Users/jasontang/clawd"

# Load credentials (gitignored)
for f in "$CLAWD/.env.openrouter" "$CLAWD/.claude/telegram-env.sh"; do
    [ -f "$f" ] && source "$f" 2>/dev/null
done

BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
CHAT_ID="${TELEGRAM_CHAT_ID:-}"

notify() {
    local message="$1"
    local status="${2:-info}"
    
    case "$status" in
        success) emoji="✅" ;;
        error) emoji="❌" ;;
        warning) emoji="⚠️" ;;
        info) emoji="ℹ️" ;;
        cycle) emoji="🔄" ;;
        started) emoji="🚀" ;;
        complete) emoji="🎉" ;;
        *) emoji="📌" ;;
    esac
    
    local full_message="$(echo -e "$emoji Claude Hours Update\n\n$message")"
    
    if [ -n "$BOT_TOKEN" ] && [ -n "$CHAT_ID" ]; then
        curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
            -d "chat_id=$CHAT_ID" \
            -d "text=$full_message" \
            -d "parse_mode=Markdown" > /dev/null 2>&1 && echo "✓ Sent" || echo "✗ Failed"
    else
        echo "[NOTIFY] $message"
    fi
}

if [ "${1:-}" = "cli" ]; then
    shift
    notify "$1" "${2:-info}"
fi
