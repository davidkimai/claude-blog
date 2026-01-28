#!/bin/bash
# SuperMemory Integration for Claude Hours (Standalone)
# Works directly with SuperMemory API - no clawdbot required!

CLAWD="/Users/jasontang/clawd"
CONFIG_FILE="$CLAWD/.env.supermemory"

# Load API key
if [ -f "$CONFIG_FILE" ]; then
    SUPERMEMORY_KEY=$(grep API_KEY "$CONFIG_FILE" 2>/dev/null | cut -d'"' -f4)
fi

API_URL="https://api.supermemory.ai"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUPERMEMORY] $1"; }

# === REMEMBER ===
remember() {
    local content="$1"
    local url="${2:-}"
    
    if [ -z "$SUPERMEMORY_KEY" ]; then
        echo "❌ API key not configured. Run setup first."
        return 1
    fi
    
    log "Remembering: $content"
    
    curl -s -X POST "$API_URL/memories" \
        -H "Authorization: Bearer $SUPERMEMORY_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"content\":\"$content\",\"url\":\"$url\",\"source\":\"claude-hours\"}" > /dev/null 2>&1
    
    echo -e "${GREEN}✅ Saved to SuperMemory${NC}"
}

# === RECALL/SEARCH ===
recall() {
    local query="$1"
    local limit="${2:-5}"
    
    if [ -z "$SUPERMEMORY_KEY" ]; then
        echo "❌ API key not configured"
        return 1
    fi
    
    echo ""
    echo -e "${CYAN}🔍 Searching SuperMemory: \"$query\"${NC}"
    echo ""
    
    local results=$(curl -s -X GET "$API_URL/memories/search?q=$query&limit=$limit" \
        -H "Authorization: Bearer $SUPERMEMORY_KEY" 2>/dev/null)
    
    echo "$results" | jq -r '.[] | "• \(.content)\n  [\(((.similarity * 100 | floor))% match]\n"' 2>/dev/null || echo "No results or API error"
}

# === GET PROFILE ===
profile() {
    if [ -z "$SUPERMEMORY_KEY" ]; then
        echo "❌ API key not configured"
        return 1
    fi
    
    echo -e "${CYAN}👤 User Profile${NC}"
    echo ""
    
    curl -s "$API_URL/profile" \
        -H "Authorization: Bearer $SUPERMEMORY_KEY" 2>/dev/null | jq '.' 2>/dev/null || echo "API error"
}

# === FORGET ===
forget() {
    local query="$1"
    
    if [ -z "$SUPERMEMORY_KEY" ]; then
        echo "❌ API key not configured"
        return 1
    fi
    
    log "Searching for memories to delete: $query"
    
    local results=$(curl -s -X GET "$API_URL/memories/search?q=$query&limit=10" \
        -H "Authorization: Bearer $SUPERMEMORY_KEY" 2>/dev/null)
    
    local count=$(echo "$results" | jq 'length' 2>/dev/null || echo 0)
    
    if [ "$count" = "0" ] || [ -z "$count" ]; then
        echo "No memories found matching: $query"
        return 0
    fi
    
    echo "Found $count memories to delete:"
    echo "$results" | jq -r '.[].content' 2>/dev/null | head -5
    
    echo "$results" | jq -r '.[].id' 2>/dev/null | while read id; do
        [ -n "$id" ] && curl -s -X DELETE "$API_URL/memories/$id" \
            -H "Authorization: Bearer $SUPERMEMORY_KEY" > /dev/null 2>&1
    done
    
    echo -e "${GREEN}✅ Deleted $count memories${NC}"
}

# === AUTO-RECALL (for Claude Hours) ===
auto_recall() {
    local context="${1:-conversation}"
    
    recall "$context" 5
}

# === AUTO-CAPTURE (after Claude Hours tasks) ===
auto_capture() {
    local task="$1"
    local result="$2"
    
    remember "Claude Hours task: $task. Result: $result"
}

# === SETUP ===
setup() {
    echo "=== SuperMemory Setup ==="
    echo ""
    echo "1. Get API key: https://console.supermemory.ai/keys"
    echo ""
    read -p "Paste your API key (sm_...): " API_KEY
    
    if [ -z "$API_KEY" ]; then
        echo "❌ No key provided"
        return 1
    fi
    
    echo "SUPERMEMORY_CLAWDBOT_API_KEY=\"$API_KEY\"" > "$CONFIG_FILE"
    echo "✅ API key saved to .env.supermemory"
}

# === MAIN ===
case "${1:-help}" in
    remember|add)
        shift
        remember "$1" "${2:-}"
        ;;
    recall|search|get)
        shift
        recall "$1" "${2:-5}"
        ;;
    profile|user)
        profile
        ;;
    forget|delete|remove)
        shift
        forget "$1"
        ;;
    auto-recall|recall-auto)
        shift
        auto_recall "${1:-conversation}"
        ;;
    auto-capture|capture-auto)
        shift
        auto_capture "$1" "${2:-success}"
        ;;
    setup|init)
        setup
        ;;
    help|--help|-h)
        echo "SuperMemory CLI for Claude Hours"
        echo ""
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  remember <text> [url]     - Save to memory"
        echo "  recall <query> [limit]     - Search memories"
        echo "  profile                   - View user profile"
        echo "  forget <query>            - Delete memories"
        echo "  auto-recall [context]     - For Claude Hours"
        echo "  auto-capture <task> <result> - After tasks"
        echo "  setup                     - Configure API key"
        echo ""
        echo "Examples:"
        echo "  $0 remember \"I prefer async communication\""
        echo "  $0 recall \"my preferences\""
        echo "  $0 profile"
        ;;
esac
