#!/bin/bash
# Log Rotator - Manages log files

CLAWD="/Users/jasontang/clawd"
LOGS_DIR="$CLAWD/.claude/logs"
ARCHIVE_DIR="$LOGS_DIR/archive"

mkdir -p "$LOGS_DIR" "$ARCHIVE_DIR"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ROTATE] $1" >> "$LOGS_DIR/rotate.log"; }

check_size() {
    local total=$(du -sm "$LOGS_DIR" 2>/dev/null | awk '{print $1}' || echo 0)
    if [ "$total" -gt 500 ]; then
        echo "WARNING: Logs at ${total}MB [limit 500MB]"
        return 1
    fi
    echo "Logs: ${total}MB [limit 500MB]"
    return 0
}

rotate() {
    log "Running log rotation"
    # Clean old logs
    find "$LOGS_DIR" -name "*.log" -mtime +7 -delete 2>/dev/null || true
    log "Rotation complete"
}

case "${1:-check}" in
    check)
        check_size
        ;;
    rotate)
        rotate
        ;;
    help|*)
        echo "Log Rotator"
        echo "Usage: $0 check|rotate|help"
        ;;
esac
