#!/bin/bash
# Claude Hours Usage Monitor - Simple version using cached codexbar data

CLAWD="/Users/jasontang/clawd"
STATE_DIR="$CLAWD/.claude/state"
USAGE_CACHE="$STATE_DIR/codexbar-cache.json"
USAGE_LOG="$STATE_DIR/usage-tracking.jsonl"
ALERT_THRESHOLD=80  # Alert at 80% usage

mkdir -p "$STATE_DIR"

# Update cache (run manually or via cron)
update_cache() {
    echo "Updating usage cache..."
    codexbar usage --provider codex --json --pretty 2>/dev/null > "$USAGE_CACHE.tmp"
    
    if [ -s "$USAGE_CACHE.tmp" ]; then
        mv "$USAGE_CACHE.tmp" "$USAGE_CACHE"
        echo "✓ Cache updated: $(date)"
        return 0
    else
        echo "✗ Cache update failed"
        rm -f "$USAGE_CACHE.tmp"
        return 1
    fi
}

# Get current cycle
get_cycle() {
    cat "$STATE_DIR/cycle.txt" 2>/dev/null || echo "0"
}

# Parse cached data
get_cached_usage() {
    if [ ! -f "$USAGE_CACHE" ]; then
        echo "No cache found. Run: $0 update"
        return 1
    fi
    
    local age=$(($(date +%s) - $(stat -f %m "$USAGE_CACHE" 2>/dev/null || echo 0)))
    local age_hours=$((age / 3600))
    
    echo "📊 Usage Data (cached $age_hours hours ago):"
    echo ""
    
    # Extract key metrics
    local usage_pct=$(cat "$USAGE_CACHE" | jq -r '.[0].openaiDashboard.secondaryLimit.usedPercent // 0')
    local reset_info=$(cat "$USAGE_CACHE" | jq -r '.[0].openaiDashboard.secondaryLimit.resetDescription // "Unknown"')
    local plan=$(cat "$USAGE_CACHE" | jq -r '.[0].openaiDashboard.accountPlan // "Unknown"')
    
    echo "  Plan: $plan"
    echo "  Usage: ${usage_pct}%"
    echo "  Reset: $reset_info"
    echo ""
    
    # Check limit
    if [ "${usage_pct%.*}" -ge "$ALERT_THRESHOLD" ]; then
        echo "⚠️  WARNING: Approaching limit at ${usage_pct}%"
        return 1
    else
        echo "✓ Usage healthy: ${usage_pct}%"
    fi
    
    # Project usage
    local cycle=$(get_cycle)
    local cycles_until_morning=$((44 - (cycle % 44)))
    local estimated_increase=$(echo "scale=2; $cycles_until_morning * 0.5" | bc)
    local projected=$(echo "scale=2; $usage_pct + $estimated_increase" | bc)
    
    echo ""
    echo "📈 Projections:"
    echo "  Current cycle: $cycle"
    echo "  Cycles until 8 AM: $cycles_until_morning"
    echo "  Estimated increase: ${estimated_increase}%"
    echo "  Projected by 8 AM: ${projected}%"
    
    if [ "$(echo "$projected > 95" | bc)" -eq 1 ]; then
        echo ""
        echo "🚨 CRITICAL: May hit limit before morning!"
        echo "   Recommendation: Reduce cycle frequency"
        return 2
    elif [ "$(echo "$projected > $ALERT_THRESHOLD" | bc)" -eq 1 ]; then
        echo ""
        echo "⚠️  CAUTION: Approaching limits"
        return 1
    else
        echo ""
        echo "✓ Sufficient capacity for tonight"
    fi
    
    return 0
}

# Log current status
log_status() {
    if [ ! -f "$USAGE_CACHE" ]; then
        return 1
    fi
    
    local timestamp=$(date -Iseconds)
    local usage_pct=$(cat "$USAGE_CACHE" | jq -r '.[0].openaiDashboard.secondaryLimit.usedPercent // 0')
    local cycle=$(get_cycle)
    
    jq -n \
        --arg ts "$timestamp" \
        --arg pct "$usage_pct" \
        --arg cycle "$cycle" \
        '{
            timestamp: $ts,
            usage_percent: ($pct | tonumber),
            cycle: ($cycle | tonumber)
        }' >> "$USAGE_LOG"
}

# View recent history
show_history() {
    if [ ! -f "$USAGE_LOG" ]; then
        echo "No history found"
        return 1
    fi
    
    echo "Recent usage history:"
    cat "$USAGE_LOG" | jq -s 'sort_by(.timestamp) | .[-10:]' | jq -r '.[] | "\(.timestamp): \(.usage_percent)% (cycle \(.cycle))"'
}

# Main command interface
case "${1:-check}" in
    update)
        update_cache
        ;;
    check)
        get_cached_usage
        ;;
    log)
        log_status
        echo "✓ Status logged"
        ;;
    history)
        show_history
        ;;
    auto)
        # Auto: update cache, check, log
        update_cache
        echo ""
        get_cached_usage
        log_status
        ;;
    help|*)
        echo "Usage: $0 {update|check|log|history|auto|help}"
        echo ""
        echo "Commands:"
        echo "  update   - Fetch latest usage from codexbar (slow)"
        echo "  check    - Check cached usage + projections (fast)"
        echo "  log      - Log current status to tracking file"
        echo "  history  - Show recent usage history"
        echo "  auto     - Update, check, and log (for cron)"
        echo ""
        echo "Workflow:"
        echo "  1. Run 'update' once to populate cache"
        echo "  2. Use 'check' frequently for fast monitoring"
        echo "  3. Schedule 'auto' in cron for periodic updates"
        ;;
esac
