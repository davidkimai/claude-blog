#!/bin/bash
# Subagent Dashboard for Clawdbot v2
# Real-time monitoring of subagent activity

set -e

# Colors
BOLD='\033[1m'
DIM='\033[2m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
GRAY='\033[0;90m'
NC='\033[0m'

SESSIONS_FILE="$HOME/.clawdbot/agents/main/sessions/sessions.json"

# Mode flags
MODE="live"
REFRESH=3

for arg in "$@"; do
    case $arg in
        --once) MODE="once" ;;
        --json) MODE="json" ;;
        --watch) MODE="watch"; REFRESH=1 ;;
        --help|-h)
            echo "Subagent Dashboard v2 - Monitor Clawdbot subagent activity"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --once   Single snapshot, then exit"
            echo "  --json   Output raw JSON"
            echo "  --watch  Compact watch mode (1s refresh)"
            echo "  --help   Show this help"
            exit 0
            ;;
    esac
done

format_time_ago() {
    local ms=$1
    local now_ms=$(node -e "console.log(Date.now())" 2>/dev/null || echo "0")
    local diff_sec=$(( (now_ms - ms) / 1000 ))
    
    if [ $diff_sec -lt 60 ]; then
        echo "${diff_sec}s ago"
    elif [ $diff_sec -lt 3600 ]; then
        echo "$((diff_sec / 60))m ago"
    elif [ $diff_sec -lt 86400 ]; then
        echo "$((diff_sec / 3600))h ago"
    else
        echo "$((diff_sec / 86400))d ago"
    fi
}

get_status_icon() {
    local updated_at=$1
    local now_ms=$(node -e "console.log(Date.now())" 2>/dev/null || echo "0")
    local diff_sec=$(( (now_ms - updated_at) / 1000 ))
    
    if [ $diff_sec -lt 30 ]; then
        echo -e "${GREEN}●${NC}"
    elif [ $diff_sec -lt 300 ]; then
        echo -e "${YELLOW}●${NC}"
    else
        echo -e "${GRAY}○${NC}"
    fi
}

format_tokens() {
    local tokens=$1
    if [ -z "$tokens" ] || [ "$tokens" = "null" ]; then
        echo "-"
    elif [ "$tokens" -gt 1000000 ]; then
        echo "$tokens" | awk '{printf "%.1fM", $1/1000000}'
    elif [ "$tokens" -gt 1000 ]; then
        echo "$tokens" | awk '{printf "%.1fk", $1/1000}'
    else
        echo "$tokens"
    fi
}

render_dashboard() {
    if [ ! -f "$SESSIONS_FILE" ]; then
        echo -e "${RED}Error: Sessions file not found at $SESSIONS_FILE${NC}"
        echo "Is Clawdbot gateway running?"
        return 1
    fi

    local now=$(date "+%Y-%m-%d %H:%M:%S")
    
    # Get subagent data as array
    local subagents_json=$(jq -c '[to_entries[] | select(.key | contains("subagent")) | {
        key: .key,
        label: .value.label,
        model: .value.model,
        updatedAt: .value.updatedAt,
        totalTokens: .value.totalTokens,
        sessionId: .value.sessionId
    }]' "$SESSIONS_FILE" 2>/dev/null)
    
    # Get main session
    local main_session=$(jq -c 'to_entries[] | select(.key == "agent:main:main") | .value' "$SESSIONS_FILE" 2>/dev/null)
    
    local subagent_count=$(echo "$subagents_json" | jq 'length' 2>/dev/null || echo "0")
    
    if [ "$MODE" = "json" ]; then
        echo "$subagents_json"
        return
    fi
    
    # Full TUI mode
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}  ${BOLD}📊 CLAWDBOT SUBAGENT DASHBOARD${NC}                              ${BLUE}║${NC}"
    echo -e "${BLUE}╠══════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${NC}  ${DIM}$now${NC}                                        ${BLUE}║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Main session
    if [ -n "$main_session" ] && [ "$main_session" != "null" ]; then
        local main_updated=$(echo "$main_session" | jq -r '.updatedAt // 0')
        local main_tokens=$(echo "$main_session" | jq -r '.totalTokens // 0')
        local main_model=$(echo "$main_session" | jq -r '.model // "unknown"')
        local main_icon=$(get_status_icon "$main_updated")
        local main_ago=$(format_time_ago "$main_updated")
        echo -e "${BOLD}Main Session${NC}"
        echo -e "  $main_icon ${CYAN}agent:main:main${NC} | $main_model | $(format_tokens $main_tokens) tokens | $main_ago"
        echo ""
    fi
    
    # Subagents
    echo -e "${BOLD}Subagents${NC} ($subagent_count active)"
    echo -e "${DIM}────────────────────────────────────────────────────────────────${NC}"
    
    if [ "$subagent_count" = "0" ]; then
        echo -e "  ${DIM}No subagents currently running${NC}"
    else
        # Iterate over subagents array
        echo "$subagents_json" | jq -c 'sort_by(-.updatedAt)[]' | while IFS= read -r agent; do
            local label=$(echo "$agent" | jq -r '.label // "unnamed"')
            local model=$(echo "$agent" | jq -r '.model // "pending"')
            local updated=$(echo "$agent" | jq -r '.updatedAt // 0')
            local tokens=$(echo "$agent" | jq -r '.totalTokens // 0')
            local session_id=$(echo "$agent" | jq -r '.sessionId // ""' | cut -c1-8)
            
            local status_icon=$(get_status_icon "$updated")
            local time_ago=$(format_time_ago "$updated")
            local token_str=$(format_tokens "$tokens")
            
            # Shorten model names
            local model_short=$(echo "$model" | sed 's/claude-sonnet-4-5/sonnet/' | sed 's/claude-opus-4-5/opus/' | sed 's/-thinking/+think/' | sed 's/gemini-3-pro/gemini/' | cut -c1-18)
            
            echo -e "  $status_icon ${BOLD}${MAGENTA}$label${NC}"
            echo -e "    ${DIM}Model:${NC} $model_short  ${DIM}Tokens:${NC} $token_str  ${DIM}Last:${NC} $time_ago"
            [ -n "$session_id" ] && echo -e "    ${DIM}ID: $session_id...${NC}"
            echo ""
        done
    fi
    
    echo -e "${DIM}────────────────────────────────────────────────────────────────${NC}"
    echo -e "${DIM}Legend: ${GREEN}●${NC} Active (<30s) ${YELLOW}●${NC} Recent (<5m) ${GRAY}○${NC} Idle (>5m)${NC}"
    
    if [ "$MODE" = "live" ]; then
        echo -e "${DIM}Press Ctrl+C to exit • Refreshes every ${REFRESH}s${NC}"
    fi
}

# Main
if [ "$MODE" = "once" ] || [ "$MODE" = "json" ]; then
    render_dashboard
else
    while true; do
        [ "$MODE" = "live" ] && clear
        render_dashboard
        sleep $REFRESH
    done
fi
