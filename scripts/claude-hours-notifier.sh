#!/bin/bash
# Claude Hours Telegram Notifier - Time Series Format

CLAWD="/Users/jasontang/clawd"
NIGHTLY_DIR="$CLAWD/nightly"
STATE_DIR="$CLAWD/.claude/state"
SESSION_FILE="$STATE_DIR/current-session.json"
CYCLE_FILE="$STATE_DIR/cycle.txt"

# Load credentials
for f in "$CLAWD/.env.openrouter" "$CLAWD/.claude/telegram-env.sh"; do
    [ -f "$f" ] && source "$f" 2>/dev/null
done

BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
CHAT_ID="${TELEGRAM_CHAT_ID:-}"

ts() { date '+%Y-%m-%d %H:%M:%S CST'; }
date_only() { date '+%Y-%m-%d'; }

# Get session metrics
get_session_stats() {
    local cycle=$(cat "$CYCLE_FILE" 2>/dev/null || echo 0)
    local tasks_done=$(jq '.tasks_completed | length' "$SESSION_FILE" 2>/dev/null || echo 0)
    local focus=$(jq -r '.focus' "$SESSION_FILE" 2>/dev/null || echo "General")
    echo "$cycle|$tasks_done|$focus"
}

# Parse stats
parse_stats() {
    local stats="$1"
    echo "$stats" | tr '|' '\n'
}

# Notify with time series format
notify() {
    local event_type="$1"  # started, cycle, complete
    local message="$2"
    local metrics="$3"     # Optional: cycle|tasks|focus
    
    # Emoji based on event
    case "$event_type" in
        started) emoji="🚀" ;;
        cycle) emoji="🔄" ;;
        complete) emoji="🎉" ;;
        milestone) emoji="🏆" ;;
        error) emoji="❌" ;;
        *) emoji="📊" ;;
    esac
    
    # Build formatted message
    local full_message="*${emoji} Claude Hours | $(date_only) | $(date '+%H:%M')*

$message"

    # Add metrics section if provided
    if [ -n "$metrics" ]; then
        local cycle=$(echo "$metrics" | cut -d'|' -f1)
        local tasks=$(echo "$metrics" | cut -d'|' -f2)
        local focus=$(echo "$metrics" | cut -d'|' -f3)
        
        full_message="${full_message}

\`\`\`
┌─────────────────────────────────┐
│ TIME SERIES METRICS             │
├─────────────────────────────────┤
│ ⏱️  Time    | $(date '+%H:%M:%S')         │
│ 🔄  Cycle   | #$cycle                     │
│ ✅  Tasks   | $tasks completed            │
│ 🎯  Focus   | $focus                      │
└─────────────────────────────────┘
\`\`\`"
    fi
    
    # Add footer
    full_message="${full_message}

---
*Claude Hours v2.6 | Autonomous Loop*"

    # Send to Telegram
    if [ -n "$BOT_TOKEN" ] && [ -n "$CHAT_ID" ]; then
        curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
            -d "chat_id=$CHAT_ID" \
            -d "text=$full_message" \
            -d "parse_mode=Markdown" \
            -d "disable_web_page_preview=true" > /dev/null 2>&1
    else
        echo "[NOTIFY] $message"
        echo "[METRICS] $metrics"
    fi
}

# === EVENT HANDLERS ===

notify_started() {
    local focus="$1"
    notify "started" "Session started" "0|0|$focus"
}

notify_cycle() {
    local cycle="$1"
    local task_result="$2"
    local summary="$3"
    local tasks_done="$4"
    local focus="$5"
    
    local msg="*Cycle #$cycle Complete*

📝 *Activity:* $task_result
📋 *Result:* $summary"
    
    notify "cycle" "$msg" "$cycle|$tasks_done|$focus"
}

notify_milestone() {
    local milestone="$1"
    local cycle="$2"
    local tasks="$3"
    local focus="$4"
    
    notify "milestone" "*🎯 Milestone Reached*

$milestone" "$cycle|$tasks|$focus"
}

notify_complete() {
    local total_cycles="$1"
    local total_tasks="$2"
    local focus="$3"
    local duration="$4"
    
    notify "complete" "*Session Complete*

📊 *Summary:*
• Total Cycles: $total_cycles
• Tasks Completed: $total_tasks
• Focus: $focus
• Duration: $duration" "$total_cycles|$total_tasks|$focus"
}

# CLI interface
if [ "${1:-}" = "cli" ]; then
    shift
    notify "$1" "$2" "${3:-}"
fi

if [ "${1:-}" = "test" ]; then
    notify "cycle" "*Test Cycle*

📝 Activity: Analyze workspace
📋 Result: Success - Found 3 improvement opportunities" "5|12|General"
fi
