#!/bin/bash
# Process Watchdog - Ensures autonomous loop stays running

CLAWD="/Users/jasontang/clawd"
STATE_DIR="$CLAWD/.claude/state"
LOGS_DIR="$CLAWD/.claude/logs"
WATCHDOG_DIR="$CLAWD/system/watchdog"

mkdir -p "$STATE_DIR" "$LOGS_DIR" "$WATCHDOG_DIR"

PID_FILE="$STATE_DIR/cycle.txt"
LOG_FILE="$LOGS_DIR/watchdog.log"
MAX_RESTARTS_PER_HOUR=10
WATCHDOG_INTERVAL=30

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] [WATCHDOG] $1" >> "$LOG_FILE"; }

get_process_status() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            echo "running:$pid"
            return 0
        fi
    fi
    echo "stopped:0"
    return 1
}

count_restarts_hour() {
    local hour=$(date '+%Y-%m-%d %H')
    grep -c "\[$hour:" "$LOG_FILE" 2>/dev/null | tr -d ' ' || echo 0
}

supervise() {
    log "Starting process supervisor"
    
    while true; do
        local status=$(get_process_status)
        local state=$(echo "$status" | cut -d':' -f1)
        local pid=$(echo "$status" | cut -d':' -f2)
        local restarts=$(count_restarts_hour)
        
        case "$state" in
            running)
                # Process alive - verify responsiveness
                ;;
            stopped)
                if [ "$restarts" -lt "$MAX_RESTARTS_PER_HOUR" ]; then
                    log "Process dead - restarting [hourly restarts: $restarts]"
                    cd "$CLAWD"
                    ./scripts/claude-autonomous-loop-simple.sh run General >> "$LOGS_DIR/autonomous-loop.log" 2>&1 &
                    sleep 5
                else
                    log "Too many restarts [$restarts/$MAX_RESTARTS_PER_HOUR] - backing off"
                    sleep 300
                fi
                ;;
        esac
        
        sleep "$WATCHDOG_INTERVAL"
    done
}

show_status() {
    echo "=== Watchdog Status ==="
    local status=$(get_process_status)
    local state=$(echo "$status" | cut -d':' -f1)
    local pid=$(echo "$status" | cut -d':' -f2)
    echo "Process: $state [PID: $pid]"
    echo "Restarts this hour: $(count_restarts_hour)"
}

case "${1:-supervise}" in
    supervise)
        supervise
        ;;
    status)
        show_status
        ;;
    help|*)
        echo "Process Watchdog"
        echo "Usage: $0 supervise|status|help"
        ;;
esac
