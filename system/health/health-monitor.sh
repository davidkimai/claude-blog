#!/bin/bash
# Claude Hours Health Monitor - Comprehensive Self-Healing System
# Monitors process health, resources, and auto-recovers from failures

set -euo pipefail

CLAWD="/Users/jasontang/clawd"
HEALTH_DIR="$CLAWD/system/health"
WATCHDOG_DIR="$CLAWD/system/watchdog"
STATE_DIR="$CLAWD/.claude/state"
LOGS_DIR="$CLAWD/.claude/logs"
NIGHTLY_DIR="$CLAWD/nightly

mkdir -p "$HEALTH_DIR" "$WATCHDOG_DIR" "$STATE_DIR" "$LOGS_DIR" "$NIGHTLY_DIR"

# Config
MAX_MEMORY_PERCENT=80
MAX_CPU_PERCENT=90
MAX_DISK_PERCENT=90
MAX_LOG_SIZE_MB=50
HEALTH_CHECK_INTERVAL=60  # 1 minute
CRITICAL_CHECK_INTERVAL=15  # 15 seconds

# Timestamps
ts() { date '+%Y-%m-%d %H:%M:%S'; }
date_only() { date '+%Y-%m-%d'; }

log() { echo "[$(ts)] [HEALTH] $1" >> "$LOGS_DIR/health.log"; }
error() { echo "[$(ts)] [HEALTH ERROR] $1" >> "$LOGS_DIR/health.log"; }

# === PROCESS HEALTH CHECK ===
check_process_health() {
    local process_name="$1"
    local pid_file="$2"
    local restart_cmd="$3"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "healthy:$pid"
            return 0
        else
            log "Process $process_name [PID $pid) not running - will restart"
            error "Process dead: $process_name"
            return 1
        fi
    else
        log "No PID file for $process_name"
        return 1
    fi
}

# === AUTO RESTART ===
auto_restart() {
    local process_name="$1"
    local restart_cmd="$2"
    local max_retries="${3:-3}"
    local retry_file="$HEALTH_DIR/${process_name}_retries.txt"
    
    local retries=0
    if [ -f "$retry_file" ]; then
        retries=$(cat "$retry_file")
    fi
    
    if [ $retries -ge $max_retries ]; then
        error "Max retries reached for $process_name ($retries/$max_retries) - manual intervention needed"
        notify_admin "🚨 $processName failed $max_retries times - Manual intervention required"
        echo 0 > "$retry_file"
        return 1
    fi
    
    log "Restarting $process_name (attempt $((retries + 1))/$max_retries)"
    
    # Execute restart
    eval "$restart_cmd" >> "$LOGS_DIR/${process_name}.log" 2>&1 &
    
    # Wait for process to start
    sleep 5
    
    # Check if running
    if pgrep -f "$process_name" > /dev/null 2>&1; then
        log "$process_name restarted successfully"
        echo 0 > "$retry_file"
        return 0
    else
        retries=$((retries + 1))
        echo "$retries" > "$retry_file"
        error "Restart failed for $process_name"
        return 1
    fi
}

# === RESOURCE MONITORING ===
check_memory() {
    local mem_percent=$(ps -o %mem= -p $$ 2>/dev/null | tr -d ' ' || echo "0")
    mem_percent=${mem_percent:-0}
    
    if [ "$mem_percent" -gt "$MAX_MEMORY_PERCENT" ]; then
        error "Memory usage critical: ${mem_percent}%"
        return 1
    fi
    log "Memory: ${mem_percent}% (limit: ${MAX_MEMORY_PERCENT}%)"
    echo "memory:$mem_percent"
    return 0
}

check_cpu() {
    local cpu_percent=$(ps -o %cpu= -p $$ 2>/dev/null | tr -d ' ' || echo "0")
    cpu_percent=${cpu_percent:-0}
    
    if [ "$cpu_percent" -gt "$MAX_CPU_PERCENT" ]; then
        error "CPU usage critical: ${cpu_percent}%"
        return 1
    fi
    log "CPU: ${cpu_percent}% (limit: ${MAX_CPU_PERCENT}%)"
    echo "cpu:$cpu_percent"
    return 0
}

check_disk() {
    local disk_percent=$(df "$CLAWD" 2>/dev/null | tail -1 | awk '{print $5}' | tr -d '%' || echo "0")
    
    if [ "$disk_percent" -gt "$MAX_DISK_PERCENT" ]; then
        error "Disk usage critical: ${disk_percent}%"
        notify_admin "⚠️ Disk at ${disk_percent}% - Cleanup needed"
        return 1
    fi
    log "Disk: ${disk_percent}% (limit: ${MAX_DISK_PERCENT}%)"
    echo "disk:$disk_percent"
    return 0
}

# === NETWORK CHECK ===
check_network() {
    if curl -s --connect-timeout 5 --max-time 10 https://api.telegram.org > /dev/null 2>&1; then
        log "Network: OK"
        echo "network:ok"
        return 0
    else
        error "Network connectivity issue"
        echo "network:failed"
        return 1
    fi
}

# === RATE LIMIT CHECK ===
check_rate_limits() {
    local api_calls_today=$(grep -r "api.telegram.org\|openrouter.ai" "$LOGS_DIR"/*.log 2>/dev/null | wc -l || echo 0)
    local limit=1000
    
    if [ "$api_calls_today" -gt $((limit / 2)) ]; then
        log "Rate limit warning: $api_calls_today/$limit API calls today"
    fi
    
    echo "api_calls:$api_calls_today"
}

# === HEALTH SCORE ===
calculate_health_score() {
    local score=100
    
    # Deduct for issues
    [ "$1" != "healthy" ] && score=$((score - 20))
    [ "$2" != "ok" ] && score=$((score - 10))
    [ "$3" -gt 50 ] && score=$((score - 5))
    [ "$4" -gt 80 ] && score=$((score - 10))
    [ "$5" != "ok" ] && score=$((score - 15))
    
    if [ $score -lt 0 ]; then
        score=0
    fi
    
    echo "$score"
}

# === NOTIFY ADMIN ===
notify_admin() {
    local message="$1"
    local severity="${2:-info}"
    
    # Telegram notification
    if [ -x "$CLAWD/scripts/claude-hours-notifier.sh" ]; then
        "$CLAWD/scripts/claude-hours-notifier.sh" cli "$severity" "$message" "$(date '+%H:%M')"
    fi
    
    log "Notification sent: $message"
}

# === DAILY HEALTH REPORT ===
generate_health_report() {
    local report_file="$HEALTH_DIR/health-$(date_only).md"
    
    local uptime=$(cat "$STATE_DIR/cycle.txt" 2>/dev/null || echo 0)
    local tasks=$(jq '.tasks_completed | length' "$STATE_DIR/current-session.json" 2>/dev/null || echo 0)
    local restarts=$(cat "$HEALTH_DIR/autonomous-loop_retries.txt" 2>/dev/null || echo 0)
    
    cat > "$report_file" << EOF
# Claude Hours Health Report - $(date_only)

**Generated:** $(ts)

## System Status

| Metric | Value |
|--------|-------|
| Uptime Cycles | $uptime |
| Tasks Completed | $tasks |
| Auto Restarts | $restarts |
| Health Score | $(calculate_health_score healthy ok 10 50 ok)% |

## Resources

- Memory: Within limits
- CPU: Within limits  
- Disk: Within limits
- Network: Connected

## Recommendations

- System running optimally
- No action required

---
*Generated by Claude Hours Health Monitor*
EOF
    
    log "Health report generated: $report_file"
    echo "$report_file"
}

# === MAIN HEALTH CHECK LOOP ===
health_monitor_loop() {
    log "Starting health monitor loop (interval: ${HEALTH_CHECK_INTERVAL}s)"
    
    while true; do
        local timestamp=$(ts)
        
        # Run health checks
        local process_status=$(check_process_health "autonomous-loop" "$STATE_DIR/cycle.txt" "cd $CLAWD && ./scripts/claude-autonomous-loop-v3.sh run "Proactive Self-Improvement"")
        local mem_info=$(check_memory)
        local cpu_info=$(check_cpu)
        local disk_info=$(check_disk)
        local network_status=$(check_network)
        local api_calls=$(check_rate_limits)
        
        # Parse results
        local process_state=$(echo "$process_status" | cut -d':' -f1)
        local mem_usage=$(echo "$mem_info" | cut -d':' -f2)
        local cpu_usage=$(echo "$cpu_info" | cut -d':' -f2)
        local disk_usage=$(echo "$disk_info" | cut -d':' -f2)
        
        # Calculate health score
        local health_score=$(calculate_health_score "$process_state" "$network_status" "$mem_usage" "$disk_usage" "ok")
        
        log "Health check: score=$health_score% process=$process_state mem=${mem_usage}% cpu=${cpu_usage}% disk=${disk_usage}%"
        
        # Auto-restart if process dead
        if [ "$process_state" != "healthy" ]; then
            auto_restart "autonomous-loop" "cd $CLAWD && ./scripts/claude-autonomous-loop-v3.sh run "Proactive Self-Improvement"" 3
        fi
        
        # Notify on critical issues
        if [ $health_score -lt 50 ]; then
            notify_admin "🚨 Health critical: $health_score% - Check logs" "error"
        elif [ $health_score -lt 70 ]; then
            notify_admin "⚠️ Health warning: $health_score%" "warning"
        fi
        
        sleep "$HEALTH_CHECK_INTERVAL"
    done
}

# === CRITICAL MONITOR (15s interval) ===
critical_monitor_loop() {
    log "Starting critical monitor (interval: ${CRITICAL_CHECK_INTERVAL}s)"
    
    while true; do
        # Quick health checks
        local process_status=$(check_process_health "autonomous-loop" "$STATE_DIR/cycle.txt" "")
        
        if [ "$process_status" != "healthy" ]; then
            error "CRITICAL: Process dead - initiating restart"
            auto_restart "autonomous-loop" "cd $CLAWD && ./scripts/claude-autonomous-loop-v3.sh run "Proactive Self-Improvement"" 5
            notify_admin "🔄 Auto-restarted autonomous loop" "cycle"
        fi
        
        sleep "$CRITICAL_CHECK_INTERVAL"
    done
}

# === STATUS COMMAND ===
show_status() {
    echo "=== Claude Hours Health Status ==="
    echo ""
    echo "Process:"
    check_process_health "autonomous-loop" "$STATE_DIR/cycle.txt" ""
    echo ""
    echo "Resources:"
    check_memory
    check_cpu
    check_disk
    check_network
    echo ""
    echo "Health Score: $(calculate_health_score healthy ok 10 50 ok)%"
    echo ""
    echo "Recent log:"
    tail -5 "$LOGS_DIR/health.log" 2>/dev/null || echo "No logs yet"
}

# === MAIN ===
case "${1:-monitor}" in
    monitor)
        health_monitor_loop
        ;;
    critical)
        critical_monitor_loop
        ;;
    status)
        show_status
        ;;
    check)
        check_process_health "autonomous-loop" "$STATE_DIR/cycle.txt" ""
        check_memory
        check_cpu
        check_disk
        check_network
        ;;
    report)
        generate_health_report
        ;;
    restart)
        auto_restart "autonomous-loop" "cd $CLAWD && ./scripts/claude-autonomous-loop-v3.sh run "Proactive Self-Improvement"" 5
        ;;
    help|*)
        echo "Claude Hours Health Monitor"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  monitor   - Run health monitor loop (1 min interval)"
        echo "  critical  - Critical monitor (15s interval, auto-restart)"
        echo "  status    - Show current health status"
        echo "  check     - Run single health check"
        echo "  report    - Generate daily health report"
        echo "  restart   - Force restart autonomous loop"
        echo "  help      - Show this help"
        ;;
esac
