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
CIRCUIT_BREAKER_THRESHOLD=3
CIRCUIT_BREAKER_FILE="$STATE_DIR/circuit-breaker.txt"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] [WATCHDOG] $1" >> "$LOG_FILE"; }

get_process_status() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE" 2>/dev/null | tr -d '[:space:]')
        if [ -n "$pid" ] && [ "$pid" != "0" ] && kill -0 "$pid" 2>/dev/null; then
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

check_circuit_breaker() {
    if [ -f "$CIRCUIT_BREAKER_FILE" ]; then
        local last_trigger=$(cat "$CIRCUIT_BREAKER_FILE" 2>/dev/null)
        local now=$(date '+%s')
        local last_time=$(echo "$last_trigger" | cut -d':' -f1)
        local count=$(echo "$last_trigger" | cut -d':' -f2)
        
        # Reset if last trigger was > 1 hour ago
        if [ -n "$last_time" ] && [ $((now - last_time)) -gt 3600 ]; then
            rm -f "$CIRCUIT_BREAKER_FILE"
            return 0
        fi
        
        # Trip circuit if we've hit the threshold
        if [ "$count" -ge "$CIRCUIT_BREAKER_THRESHOLD" ]; then
            log "CIRCUIT BREAKER TRIPPED: $count consecutive failures in 1 hour"
            log "Halting autonomous system - manual intervention required"
            return 1
        fi
    fi
    return 0
}

record_circuit_trigger() {
    local now=$(date '+%s')
    local count=1
    
    if [ -f "$CIRCUIT_BREAKER_FILE" ]; then
        local last_trigger=$(cat "$CIRCUIT_BREAKER_FILE" 2>/dev/null)
        local last_time=$(echo "$last_trigger" | cut -d':' -f1)
        local prev_count=$(echo "$last_trigger" | cut -d':' -f2)
        
        # Only increment if within the same hour
        if [ -n "$last_time" ] && [ $((now - last_time)) -lt 3600 ]; then
            count=$((prev_count + 1))
        fi
    fi
    
    echo "$now:$count" > "$CIRCUIT_BREAKER_FILE"
    log "Circuit trigger recorded: $count consecutive failure(s)"
}

supervise() {
    log "Starting process supervisor (circuit breaker threshold: $CIRCUIT_BREAKER_THRESHOLD)"
    
    while true; do
        local status=$(get_process_status)
        local state=$(echo "$status" | cut -d':' -f1)
        local pid=$(echo "$status" | cut -d':' -f2)
        local restarts=$(count_restarts_hour)
        
        # Check circuit breaker before any action
        if ! check_circuit_breaker; then
            log "System halted - circuit breaker active"
            # Send alert (one-time)
            if [ -f "$CLAWD/scripts/claude-hours-notifier.sh" ]; then
                "$CLAWD/scripts/claude-hours-notifier.sh" cli "🚨 Claude Hours CIRCUIT BREAKER TRIPPED

Process failed $CIRCUIT_BREAKER_THRESHOLD+ times consecutively.

Check logs at: /Users/jasontang/clawd/.claude/logs/

Manual intervention required to restart."
            fi
            exit 1
        fi
        
        case "$state" in
            running)
                # Process alive - verify it's the v3.0 PRO loop
                local cmdline=$(ps -o command= -p "$pid" 2>/dev/null | grep -o "claude-autonomous-loop-[^ ]*" | head -1)
                if [ "$cmdline" != "claude-autonomous-loop-v3.sh" ]; then
                    log "Wrong loop running ($cmdline) - restarting with v3.0 PRO"
                    record_circuit_trigger
                    kill "$pid" 2>/dev/null || true
                    sleep 2
                    cd "$CLAWD"
                    ./scripts/claude-autonomous-loop-v3.sh run "Proactive Self-Improvement" >> "$LOGS_DIR/autonomous-loop.log" 2>&1 &
                    sleep 5
                else
                    # Clear circuit breaker on successful run
                    rm -f "$CIRCUIT_BREAKER_FILE" 2>/dev/null
                fi
                ;;
            stopped)
                if [ "$restarts" -lt "$MAX_RESTARTS_PER_HOUR" ]; then
                    log "Process dead - restarting with v3.0 PRO [hourly restarts: $restarts]"
                    record_circuit_trigger
                    cd "$CLAWD"
                    ./scripts/claude-autonomous-loop-v3.sh run "Proactive Self-Improvement" >> "$LOGS_DIR/autonomous-loop.log" 2>&1 &
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
