#!/bin/bash
# Claude Hours Usage Monitor - Multi-provider version
# Tracks Codex, Claude, Gemini, and Antigravity usage

CLAWD="/Users/jasontang/clawd"
STATE_DIR="$CLAWD/.claude/state"
USAGE_CACHE="$STATE_DIR/codexbar-cache.json"
USAGE_LOG="$STATE_DIR/usage-tracking.jsonl"
ALERT_THRESHOLD=80  # Alert at 80% usage

mkdir -p "$STATE_DIR"

# Update cache for all providers
update_cache() {
    echo "Updating usage cache for all providers..."
    
    local providers=("codex" "claude" "gemini" "antigravity")
    local results="[]"
    
    for provider in "${providers[@]}"; do
        echo "  Fetching $provider..."
        local data=$(codexbar usage --provider "$provider" --json --pretty 2>/dev/null)
        
        if [ -n "$data" ] && [ "$data" != "[]" ]; then
            results=$(echo "$results" | jq --argjson new "$data" '. + $new')
            echo "    ✓ $provider fetched"
        else
            echo "    ✗ $provider failed"
        fi
    done
    
    if [ "$results" != "[]" ]; then
        echo "$results" > "$USAGE_CACHE"
        echo ""
        echo "✓ Cache updated: $(date)"
        return 0
    else
        echo "✗ All providers failed"
        return 1
    fi
}

# Get current cycle
get_cycle() {
    cat "$STATE_DIR/cycle.txt" 2>/dev/null || echo "0"
}

# Parse provider-specific data
parse_provider() {
    local provider="$1"
    local data="$2"
    
    case "$provider" in
        codex)
            local usage=$(echo "$data" | jq -r '.openaiDashboard.secondaryLimit.usedPercent // 0')
            local reset=$(echo "$data" | jq -r '.openaiDashboard.secondaryLimit.resetDescription // "Unknown"')
            local plan=$(echo "$data" | jq -r '.openaiDashboard.accountPlan // "Unknown"')
            echo "$usage|$reset|$plan"
            ;;
        claude)
            local usage=$(echo "$data" | jq -r '.usage.secondary.usedPercent // 0')
            local reset=$(echo "$data" | jq -r '.usage.secondary.resetDescription // "Unknown"')
            local cost=$(echo "$data" | jq -r '.usage.providerCost.used // 0')
            local limit=$(echo "$data" | jq -r '.usage.providerCost.limit // 0')
            echo "$usage|$reset|$cost/$limit USD"
            ;;
        gemini)
            local usage=$(echo "$data" | jq -r '.usage.primary.usedPercent // 0')
            local reset=$(echo "$data" | jq -r '.usage.primary.resetDescription // "Unknown"')
            local method=$(echo "$data" | jq -r '.usage.loginMethod // "Unknown"')
            echo "$usage|$reset|$method"
            ;;
        antigravity)
            local usage=$(echo "$data" | jq -r '.usage.primary.usedPercent // 0')
            local reset=$(echo "$data" | jq -r '.usage.primary.resetsAt // "Unknown"')
            local method=$(echo "$data" | jq -r '.usage.loginMethod // "Unknown"')
            echo "$usage|$reset|$method"
            ;;
    esac
}

# Display provider status
show_provider() {
    local provider="$1"
    local data="$2"
    
    if [ -z "$data" ] || [ "$data" = "null" ]; then
        echo "  ⚠️  $provider: No data"
        return 1
    fi
    
    IFS='|' read -r usage reset extra <<< "$(parse_provider "$provider" "$data")"
    
    local emoji="✓"
    local status="Healthy"
    
    if [ "${usage%.*}" -ge 95 ]; then
        emoji="🚨"
        status="CRITICAL"
    elif [ "${usage%.*}" -ge "$ALERT_THRESHOLD" ]; then
        emoji="⚠️"
        status="CAUTION"
    fi
    
    echo "  $emoji $provider: ${usage}% - $status"
    echo "     Reset: $reset"
    echo "     Info: $extra"
    echo ""
}

# Get all provider data
get_cached_usage() {
    if [ ! -f "$USAGE_CACHE" ]; then
        echo "No cache found. Run: $0 update"
        return 1
    fi
    
    local age=$(($(date +%s) - $(stat -f %m "$USAGE_CACHE" 2>/dev/null || echo 0)))
    local age_hours=$((age / 3600))
    
    echo "📊 Multi-Provider Usage Status (cached $age_hours hours ago):"
    echo ""
    
    # Parse cache for each provider
    local codex_data=$(cat "$USAGE_CACHE" | jq '.[] | select(.openaiDashboard != null)')
    local claude_data=$(cat "$USAGE_CACHE" | jq '.[] | select(.provider == "claude")')
    local gemini_data=$(cat "$USAGE_CACHE" | jq '.[] | select(.provider == "gemini")')
    local antigravity_data=$(cat "$USAGE_CACHE" | jq '.[] | select(.provider == "antigravity")')
    
    show_provider "Codex (OpenAI)" "$codex_data"
    show_provider "Claude (Anthropic)" "$claude_data"
    show_provider "Gemini (Google)" "$gemini_data"
    show_provider "Antigravity (Google)" "$antigravity_data"
    
    # Overall status
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Check critical thresholds
    local has_critical=false
    for provider_data in "$codex_data" "$claude_data" "$gemini_data" "$antigravity_data"; do
        if [ -n "$provider_data" ] && [ "$provider_data" != "null" ]; then
            local usage=$(echo "$provider_data" | jq -r '.openaiDashboard.secondaryLimit.usedPercent // .usage.secondary.usedPercent // .usage.primary.usedPercent // 0')
            if [ "${usage%.*}" -ge 95 ]; then
                has_critical=true
                break
            fi
        fi
    done
    
    if $has_critical; then
        echo "🚨 CRITICAL: One or more providers approaching limits!"
        echo "   Recommendation: Reduce usage or switch models"
        return 2
    else
        echo "✓ All providers healthy"
    fi
    
    return 0
}

# Log current status
log_status() {
    if [ ! -f "$USAGE_CACHE" ]; then
        return 1
    fi
    
    local timestamp=$(date -Iseconds)
    local cycle=$(get_cycle)
    
    # Extract usage for all providers
    local codex_usage=$(cat "$USAGE_CACHE" | jq -r '.[] | select(.openaiDashboard != null) | .openaiDashboard.secondaryLimit.usedPercent // 0')
    local claude_usage=$(cat "$USAGE_CACHE" | jq -r '.[] | select(.provider == "claude") | .usage.secondary.usedPercent // 0')
    local gemini_usage=$(cat "$USAGE_CACHE" | jq -r '.[] | select(.provider == "gemini") | .usage.primary.usedPercent // 0')
    local antigravity_usage=$(cat "$USAGE_CACHE" | jq -r '.[] | select(.provider == "antigravity") | .usage.primary.usedPercent // 0')
    
    jq -n \
        --arg ts "$timestamp" \
        --arg cycle "$cycle" \
        --arg codex "$codex_usage" \
        --arg claude "$claude_usage" \
        --arg gemini "$gemini_usage" \
        --arg antigravity "$antigravity_usage" \
        '{
            timestamp: $ts,
            cycle: ($cycle | tonumber),
            providers: {
                codex: ($codex | tonumber),
                claude: ($claude | tonumber),
                gemini: ($gemini | tonumber),
                antigravity: ($antigravity | tonumber)
            }
        }' >> "$USAGE_LOG"
}

# View recent history
show_history() {
    if [ ! -f "$USAGE_LOG" ]; then
        echo "No history found"
        return 1
    fi
    
    echo "Recent usage history (last 10):"
    echo ""
    cat "$USAGE_LOG" | jq -s 'sort_by(.timestamp) | .[-10:]' | jq -r '.[] | 
        "\(.timestamp):",
        "  Cycle: \(.cycle)",
        "  Codex: \(.providers.codex)%",
        "  Claude: \(.providers.claude)%", 
        "  Gemini: \(.providers.gemini)%",
        "  Antigravity: \(.providers.antigravity)%",
        ""'
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
        echo "  update   - Fetch latest usage from all providers (slow)"
        echo "  check    - Check cached usage for all providers (fast)"
        echo "  log      - Log current status to tracking file"
        echo "  history  - Show recent usage history"
        echo "  auto     - Update, check, and log (for cron)"
        echo ""
        echo "Providers tracked:"
        echo "  • Codex (OpenAI)"
        echo "  • Claude (Anthropic)"
        echo "  • Gemini (Google)"
        echo "  • Antigravity (Google)"
        ;;
esac
