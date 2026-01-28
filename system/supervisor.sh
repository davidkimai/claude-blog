#!/bin/bash
# Claude Hours Master Supervisor - Orchestrates self-healing system

CLAWD="/Users/jasontang/clawd"
STATE_DIR="$CLAWD/.claude/state"
LOGS_DIR="$CLAWD/.claude/logs"

mkdir -p "$STATE_DIR" "$LOGS_DIR"

WATCHDOG="$CLAWD/system/watchdog/process-watchdog.sh"
RESOURCE="$CLAWD/system/health/resource-monitor.sh"
ROTATOR="$CLAWD/system/health/log-rotator.sh"

ts() { date '+%Y-%m-%d %H:%M:%S'; }

log() { echo "[$(ts)] [SUPERVISOR] $1" >> "$LOGS_DIR/supervisor.log"; }

# === START PROCESS WATCHDOG ===
start_watchdog() {
    if pgrep -f "process-watchdog.*supervise" > /dev/null 2>&1; then
        echo "Process watchdog already running"
        return 0
    fi
    
    echo "Starting process watchdog..."
    $WATCHDOG supervise >> "$LOGS_DIR/watchdog.log" 2>&1 &
    sleep 2
    
    if pgrep -f "process-watchdog.*supervise" > /dev/null 2>&1; then
        echo "Process watchdog started"
        return 0
    else
        echo "Failed to start process watchdog"
        return 1
    fi
}

# === STOP COMPONENTS ===
stop_all() {
    echo "Stopping components..."
    pkill -f "process-watchdog.*supervise" 2>/dev/null || true
    echo "All components stopped"
}

# === STATUS ===
status() {
    echo "=== Claude Hours Self-Healing Status ==="
    echo ""
    echo "Timestamp: $(ts)"
    echo ""
    
    # Watchdog
    if pgrep -f "process-watchdog.*supervise" > /dev/null 2>&1; then
        echo "[OK] Process Watchdog: running"
    else
        echo "[--] Process Watchdog: not running"
    fi
    
    echo ""
    echo "Resources:"
    $RESOURCE measure
    echo ""
    echo "Logs:"
    $ROTATOR check
    echo ""
    echo "Recent Supervisor Log:"
    tail -5 "$LOGS_DIR/supervisor.log" 2>/dev/null || echo "No logs yet"
}

# === CRON HEALTH CHECK ===
check() {
    local issues=0
    
    # Check watchdog
    if ! pgrep -f "process-watchdog.*supervise" > /dev/null 2>&1; then
        echo "WATCHDOG: not running - restarting"
        start_watchdog
        issues=$((issues + 1))
    fi
    
    # Check resources
    $RESOURCE check || issues=$((issues + 1))
    
    # Check log size
    $ROTATOR check || issues=$((issues + 1))
    
    if [ $issues -gt 0 ]; then
        echo "CHECK: $issues issues detected"
        return 1
    fi
    
    echo "CHECK: OK"
    return 0
}

# === SETUP CRON ===
setup_cron() {
    echo "Setting up cron jobs..."
    
    # Remove old entries
    crontab -l 2>/dev/null | grep -v "supervisor.sh" | grep -v "resource-monitor" | grep -v "log-rotator" > /tmp/crontab.tmp
    
    # Add supervisor (restart on reboot)
    echo "@reboot cd $CLAWD && $0 start > /dev/null 2>&1" >> /tmp/crontab.tmp
    
    # Health check every 5 minutes
    echo "*/5 * * * * cd $CLAWD && $0 check >> $LOGS_DIR/supervisor.log 2>&1" >> /tmp/crontab.tmp
    
    # Daily log rotation at 6AM
    echo "0 6 * * * cd $CLAWD && $ROTATOR rotate >> $LOGS_DIR/rotate.log 2>&1" >> /tmp/crontab.tmp
    
    crontab /tmp/crontab.tmp
    rm /tmp/crontab.tmp
    
    echo "Cron configured:"
    crontab -l | grep -E "supervisor|rotate|check"
}

# === MAIN ===
case "${1:-start}" in
    start)
        start_watchdog
        ;;
    stop)
        stop_all
        ;;
    restart)
        stop_all
        sleep 2
        start_watchdog
        ;;
    status)
        status
        ;;
    check)
        check
        ;;
    setup-cron)
        setup_cron
        ;;
    help|*)
        echo "Claude Hours Self-Healing Supervisor"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  start       - Start process watchdog"
        echo "  stop        - Stop all components"
        echo "  restart     - Restart watchdog"
        echo "  status      - Show system status"
        echo "  check       - Health check [cron]"
        echo "  setup-cron  - Install cron jobs"
        echo "  help        - Show help"
        ;;
esac
