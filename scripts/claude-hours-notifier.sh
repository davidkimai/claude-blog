#!/bin/bash
# Claude Hours Telegram Notifier - Claude Aesthetic Time Series Format

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

ts() { date '+%Y-%m-%d %H:%M:%S'; }
date_only() { date '+%Y-%m-%d'; }

# Anthropic-inspired colors (for terminal reference)
# Primary: #d4a574 (warm beige), Secondary: #3d3d3d (soft black)

# Parse session stats
get_session_stats() {
    local cycle=$(cat "$CYCLE_FILE" 2>/dev/null || echo 0)
    local tasks_done=$(jq '.tasks_completed | length' "$SESSION_FILE" 2>/dev/null || echo 0)
    local focus=$(jq -r '.focus' "$SESSION_FILE" 2>/dev/null || echo "General")
    echo "$cycle|$tasks_done|$focus"
}

# Send notification
notify() {
    local event_type="$1"
    local header="$2"
    local body="$3"
    local metrics="$4"  # cycle|tasks|focus|duration|outputs
    local footer="$5"
    
    # Build metrics block
    local metrics_block=""
    if [ -n "$metrics" ]; then
        local cycle=$(echo "$metrics" | cut -d'|' -f1)
        local tasks=$(echo "$metrics" | cut -d'|' -f2)
        local focus=$(echo "$metrics" | cut -d'|' -f3)
        local duration=$(echo "$metrics" | cut -d'|' -f4)
        local outputs=$(echo "$metrics" | cut -d'|' -f5)
        
        metrics_block="
**Metrics**
\`\`\`
Cycles  →  $cycle
Tasks   →  $tasks completed
Focus   →  $focus
Time    →  $duration
\`\`\`"
    fi
    
    # Build message
    local message="**$header**

$body$metrics_block"

    # Add footer if provided
    if [ -n "$footer" ]; then
        message="$message

$footer"
    fi
    
    # Send to Telegram
    if [ -n "$BOT_TOKEN" ] && [ -n "$CHAT_ID" ]; then
        curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
            -d "chat_id=$CHAT_ID" \
            -d "text=$message" \
            -d "parse_mode=Markdown" \
            -d "disable_web_page_preview=true" > /dev/null 2>&1
    else
        echo "[NOTIFY] $header"
        echo "$body"
    fi
}

# === EVENT NOTIFICATIONS ===

# Session started
notify_started() {
    local focus="$1"
    local date_str=$(date '+%B %d, %Y')
    local time_str=$(date '+%I:%M %p')
    
    notify "started" \
        "Claude Hours — $date_str" \
        "Session initiated at $time_str" \
        "0|0|$focus|0m|0" \
        "_Autonomous loop active_"
}

# Cycle complete
notify_cycle() {
    local cycle="$1"
    local task_type="$2"
    local result="$3"
    local tasks_done="$4"
    local focus="$5"
    local duration="$6"
    
    local time_str=$(date '+%I:%M %p')
    
    notify "cycle" \
        "Claude Hours — Cycle #$cycle" \
        "**$task_type** completed: $result

Executed at $time_str" \
        "$cycle|$tasks_done|$focus|$duration|-" \
        "_Continues in 15 minutes_"
}

# Milestone reached
notify_milestone() {
    local milestone="$1"
    local cycle="$2"
    local tasks="$3"
    local focus="$4"
    local duration="$5"
    
    notify "milestone" \
        "Claude Hours — Milestone" \
        "$milestone" \
        "$cycle|$tasks|$focus|$duration|-" \
        "_Progress tracking active_"
}

# Session complete
notify_complete() {
    local total_cycles="$1"
    local total_tasks="$2"
    local focus="$3"
    local duration="$4"
    local outputs="$5"
    local started_at="$6"
    local completed_at="$7"
    
    local date_str=$(date '+%B %d, %Y')
    local time_str=$(date '+%I:%M %p')
    
    # Build outputs list if provided
    local outputs_block=""
    if [ -n "$outputs" ] && [ "$outputs" != "-" ]; then
        outputs_block="
**Outputs**
$outputs"
    fi
    
    notify "complete" \
        "Claude Hours — Complete" \
        "Nightly session concluded at $time_str$outputs_block" \
        "$total_cycles|$total_tasks|$focus|$duration|$outputs" \
        "_Session $started_at → $completed_at_"
}

# === CLI INTERFACE ===
if [ "${1:-}" = "cli" ]; then
    shift
    cmd="$1"
    shift
    case "$cmd" in
        started)
            notify_started "${1:-General}"
            ;;
        cycle)
            notify_cycle "${1:-1}" "${2:-Task}" "${3:-Complete}" "${4:-0}" "${5:-General}" "${6:-5m}"
            ;;
        complete)
            notify_complete "${1:-10}" "${2:-5}" "${3:-General}" "${4:-2h 30m}" "${5:--}" "${6:-21:00}" "${7:-08:00}"
            ;;
    esac
fi

# === TEST MODE ===
if [ "${1:-}" = "test" ]; then
    echo "=== Testing Claude Aesthetic Format ==="
    
    notify "test" \
        "Claude Hours — January 28, 2026" \
        "**Script Analysis** completed: Identified 3 improvement opportunities

Reviewed 12 scripts in /Users/jasontang/clawd/scripts/" \
        "5|12|General|2h 15m|-" \
        "_Continues in 15 minutes_"
fi
