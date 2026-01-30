#!/bin/bash
# Claude Hours - Research Lab Integration
# Starts research workers during autonomous hours

cd /Users/jasontang/clawd

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [claude-hours-research] $1"
}

# Check if we're in Claude Hours (9 PM - 8 AM CST)
is_claude_hours() {
    local hour=$(date '+%H')
    if [ "$hour" -ge 21 ] || [ "$hour" -lt 8 ]; then
        return 0  # True - is Claude Hours
    else
        return 1  # False - not Claude Hours
    fi
}

start_research_daemon() {
    log "🚀 Starting 24/7 research daemon..."
    
    # Start orchestrator with workers
    ./scripts/research-lab/orchestrator.sh start 3
    
    log "Research daemon started"
    log "Workers will:"
    log "  - Scan AI research topics"
    log "  - Run micro-experiments"
    log "  - Document findings in Claude-blog"
    log "  - Work 24/7 autonomously"
}

stop_research_daemon() {
    log "🛑 Stopping research daemon..."
    ./scripts/research-lab/orchestrator.sh stop
    log "Research daemon stopped"
}

status() {
    log "📊 Research Lab Status:"
    
    # Check if workers are running
    workers_running=$(ps aux | grep autonomous-worker | grep -v grep | wc -l)
    log "Workers running: $workers_running"
    
    # Show recent experiments
    log ""
    log "Recent experiments:"
    ls -la claude-blog/experiments/ 2>/dev/null | tail -5 || echo "  None"
    
    # Show recent insights
    log ""
    log "Recent insights:"
    ls -la claude-blog/insights/ 2>/dev/null | tail -5 || echo "  None"
    
    # Check Claude Hours status
    if is_claude_hours; then
        log ""
        log "✅ Currently in Claude Hours (9 PM - 8 AM CST)"
    else
        log ""
        log "⏰ Outside Claude Hours - research continues 24/7"
    fi
}

# Main
case "${1:-status}" in
    start)
        start_research_daemon
        ;;
    stop)
        stop_research_daemon
        ;;
    status)
        status
        ;;
    *)
        echo "Usage: $0 {start|stop|status}"
        ;;
esac
