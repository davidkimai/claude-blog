#!/bin/bash
# AI Research Lab - Orchestrator
# Manages 24/7 research workers and integrates with Claude Hours

cd /Users/jasontang/clawd

ACTION="${1:-start}"
WORKERS="${2:-3}"

LOG_DIR="./.claude/logs/research-lab"
mkdir -p "$LOG_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [research-orchestrator] $1"
}

start_workers() {
    log "🚀 Starting $WORKERS research workers..."
    
    for i in $(seq 1 $WORKERS); do
        export WORKER_NAME="research-worker-$i"
        export MODEL="moonshot/kimi-k2.5"
        export RESEARCH_INTERVAL=$((600 - i * 60))
        ./scripts/research-lab/autonomous-worker.sh >> "$LOG_DIR/worker-$i.log" 2>&1 &
        log "Started worker $i (model: moonshot/kimi-k2.5, interval: ${RESEARCH_INTERVAL}s)"
    done
    
    log "All workers started!"
    log "View logs: tail -f $LOG_DIR/worker-*.log"
}

stop_workers() {
    log "🛑 Stopping all research workers..."
    pkill -f "autonomous-worker.sh" || true
    log "All workers stopped"
}

status_workers() {
    log "📊 Research worker status:"
    ps aux | grep autonomous-worker | grep -v grep | while read line; do
        echo "  $line"
    done
    
    log ""
    log "Recent experiments:"
    ls -la claude-blog/experiments/ 2>/dev/null | tail -5 || echo "  No experiments yet"
    
    log ""
    log "Recent insights:"
    ls -la claude-blog/insights/ 2>/dev/null | tail -5 || echo "  No insights yet"
}

tail_logs() {
    log "📜 Tailing worker logs..."
    tail -f "$LOG_DIR"/worker-*.log
}

integrate_with_claude_hours() {
    log "🔗 Integrating with Claude Hours..."
    
    # Add to Claude Hours startup
    if ! grep -q "research-lab/autonomous-worker.sh" ./scripts/claude-hours-nightly.sh 2>/dev/null; then
        log "Adding research workers to Claude Hours startup..."
        # This would be added to the claude-hours-nightly.sh script
        echo "# Research Lab workers would start here during Claude Hours"
    fi
}

case "$ACTION" in
    start)
        start_workers
        ;;
    stop)
        stop_workers
        ;;
    status)
        status_workers
        ;;
    logs)
        tail_logs
        ;;
    integrate)
        integrate_with_claude_hours
        ;;
    *)
        echo "Usage: $0 {start|stop|status|logs|integrate} [workers]"
        echo ""
        echo "Commands:"
        echo "  start [N]   - Start N research workers (default: 3)"
        echo "  stop        - Stop all research workers"
        echo "  status      - Show worker status and recent experiments"
        echo "  logs        - Tail all worker logs"
        echo "  integrate   - Integrate with Claude Hours"
        ;;
esac
