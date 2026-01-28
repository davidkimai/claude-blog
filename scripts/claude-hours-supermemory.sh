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
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo "[SUPERMEMORY] $1"; }

# === REMEMBER ===
remember() {
    local content="$1"
    local url="${2:-}"
    
    if [ -z "$SUPERMEMORY_KEY" ]; then
        echo "❌ API key not configured. Run: ./scripts/claude-hours-supermemory.sh setup"
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
    echo -e "${CYAN}🔍 Searching: \"$query\"${NC}"
    echo ""
    
    local results=$(curl -s -X GET "$API_URL/memories/search?q=$query&limit=$limit" \
        -H "Authorization: Bearer $SUPERMEMORY_KEY" 2>/dev/null)
    
    echo "$results" | jq -r '.[] | "• \(.content)\n  [\(((.similarity * 100 | floor))% match]\n"' 2>/dev/null || echo "No results"
}

# === GET PROFILE ===
profile() {
    if [ -z "$SUPERMEMORY_KEY" ]; then
        echo "❌ API key not configured"
        return 1
    fi
    
    echo -e "${CYAN}👤 User Profile${NC}"
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
    
    log "Deleting memories matching: $query"
    
    local results=$(curl -s -X GET "$API_URL/memories/search?q=$query&limit=10" \
        -H "Authorization: Bearer $SUPERMEMORY_KEY" 2>/dev/null)
    
    local count=$(echo "$results" | jq 'length' 2>/dev/null || echo 0)
    
    [ "$count" = "0" ] || [ -z "$count" ] && echo "No memories found" && return 0
    
    echo "$results" | jq -r '.[].id' 2>/dev/null | while read id; do
        [ -n "$id" ] && curl -s -X DELETE "$API_URL/memories/$id" \
            -H "Authorization: Bearer $SUPERMEMORY_KEY" > /dev/null 2>&1
    done
    
    echo -e "${GREEN}✅ Deleted $count memories${NC}"
}

# === AUTO-RECALL (Claude Hours) ===
auto_recall() {
    local context="${1:-conversation}"
    recall "$context" 5
}

# === AUTO-CAPTURE (Claude Hours) ===
auto_capture() {
    local task="$1"
    local result="$2"
    remember "Claude Hours: $task | Result: $result"
}

# === SETUP ===
setup() {
    echo "=== SuperMemory Setup ==="
    echo "Get API key: https://console.supermemory.ai/keys"
    echo ""
    read -p "Paste API key (sm_...): " API_KEY
    
    [ -z "$API_KEY" ] && echo "❌ No key" && return 1
    
    echo "SUPERMEMORY_CLAWDBOT_API_KEY=\"$API_KEY\"" > "$CONFIG_FILE"
    echo -e "${GREEN}✅ Saved to .env.supermemory${NC}"
}

# === MAIN ===
case "${1:-help}" in
    remember|add)   shift; remember "$1" "${2:-}" ;;
    recall|search)  shift; recall "$1" "${2:-5}" ;;
    profile|user)   profile ;;
    forget|delete)  shift; forget "$1" ;;
    auto-recall)    shift; auto_recall "${1:-conversation}" ;;
    auto-capture)   shift; auto_capture "$1" "${2:-success}" ;;
    setup|init)     setup ;;
    help|--help|-h)
        echo "SuperMemory CLI for Claude Hours"
        echo ""
        echo "Commands:"
        echo "  remember <text> [url]     - Save to memory"
        echo "  recall <query> [limit]    - Search memories"
        echo "  profile                   - View user profile"
        echo "  forget <query>            - Delete memories"
        echo "  auto-recall [context]     - For Claude Hours"
        echo "  auto-capture <task> <result> - After tasks"
        echo "  setup                     - Configure API key"
        ;;
esac
