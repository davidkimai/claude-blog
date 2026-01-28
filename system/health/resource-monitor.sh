#!/bin/bash
# Resource Monitor - Tracks system resources

CLAWD="/Users/jasontang/clawd"
LOGS_DIR="$CLAWD/.claude/logs"
RESOURCE_LOG="$LOGS_DIR/resources.log"

mkdir -p "$LOGS_DIR"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [RESOURCES] $1" >> "$RESOURCE_LOG"; }

measure() {
    local mem=$(ps -o %mem= -p $$ 2>/dev/null | tr -d ' ' || echo 0)
    local cpu=$(ps -o %cpu= -p $$ 2>/dev/null | tr -d ' ' || echo 0)
    local disk=$(df "$CLAWD" 2>/dev/null | tail -1 | awk '{print $5}' | tr -d '%' || echo 0)
    
    echo "Memory: ${mem}%  CPU: ${cpu}%  Disk: ${disk}%"
}

check() {
    local mem=$(ps -o %mem= -p $$ 2>/dev/null | tr -d ' ' || echo 0)
    local disk=$(df "$CLAWD" 2>/dev/null | tail -1 | awk '{print $5}' | tr -d '%' || echo 0)
    
    if [ "$mem" -gt 80 ] || [ "$disk" -gt 90 ]; then
        echo "WARNING: Memory ${mem}% Disk ${disk}%"
        return 1
    fi
    echo "All resources within limits"
    return 0
}

case "${1:-measure}" in
    measure)
        measure
        ;;
    check)
        check
        ;;
    help|*)
        echo "Resource Monitor"
        echo "Usage: $0 measure|check|help"
        ;;
esac
