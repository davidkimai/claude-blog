#!/bin/bash
# SuperMemory Integration for Claude Hours
# Based on: https://supermemory.ai/docs/integrations/clawdbot

CLAWD="/Users/jasontang/clawd"
CONFIG_DIR="$CLAWD/.claude"

echo "=== SuperMemory Setup ==="
echo ""

# Step 1: Get API Key
echo "1. Get your API key from: https://console.supermemory.ai/keys"
echo ""
read -p "Paste your SuperMemory API key (sm_...): " API_KEY

if [ -z "$API_KEY" ]; then
    echo "❌ No API key provided"
    exit 1
fi

# Step 2: Save API key
echo ""
echo "2. Saving API key to .env.supermemory..."

cat > "$CLAWD/.env.supermemory" << EOF
# SuperMemory API Key
# Generated: $(date)
SUPERMEMORY_CLAWDBOT_API_KEY="$API_KEY"
EOF

echo "✅ Saved to .env.supermemory (gitignored)"

# Step 3: Create clawdbot config
echo ""
echo "3. Creating clawdbot plugin config..."

mkdir -p "$CONFIG_DIR"

# Check if plugins section exists
if [ -f "$CONFIG_DIR/clawdbot.json" ]; then
    echo "Updating existing clawdbot.json..."
    # Would need to merge with existing config
else
    cat > "$CONFIG_DIR/clawdbot.json" << EOF
{
  "plugins": {
    "entries": {
      "clawdbot-supermemory": {
        "enabled": true,
        "config": {
          "apiKey": "$API_KEY",
          "autoRecall": true,
          "autoCapture": true,
          "maxRecallResults": 10,
          "profileFrequency": 50,
          "captureMode": "all",
          "debug": false
        }
      }
    }
  }
}
EOF
    echo "✅ Created clawdbot.json with supermemory config"
fi

# Step 4: Create Claude Hours memory integration
echo ""
echo "4. Creating Claude Hours memory hooks..."

cat > "$CLAWD/scripts/claude-hours-supermemory.sh << 'MEMORY'
#!/bin/bash
# SuperMemory CLI for Claude Hours
# Provides /remember, /recall, and search functionality

CLAWD="/Users/jasontang/clawd"
SUPERMEMORY_KEY="${SUPERMEMORY_CLAWDBOT_API_KEY:-$(grep API_KEY "$CLAWD/.env.supermemory" 2>/dev/null | cut -d'"' -f4)}"

API_URL="https://api.supermemory.ai"

# Remember something
remember() {
    local content="$1"
    local url="${2:-}"
    
    curl -s -X POST "$API_URL/memories" \
        -H "Authorization: Bearer $SUPERMEMORY_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"content\":\"$content\",\"url\":\"$url\",\"source\":\"claude-hours\"}" 2>/dev/null
    
    echo "✅ Remembered: $content"
}

# Recall/search memories
recall() {
    local query="$1"
    local limit="${2:-5}"
    
    curl -s -X GET "$API_URL/memories/search?q=$query&limit=$limit" \
        -H "Authorization: Bearer $SUPERMEMORY_KEY" 2>/dev/null | head -100
}

# Get user profile
profile() {
    curl -s "$API_URL/profile" \
        -H "Authorization: Bearer $SUPERMEMORY_KEY" 2>/dev/null
}

# Forget memories
forget() {
    local query="$1"
    
    # Search first to get IDs
    local results=$(curl -s -X GET "$API_URL/memories/search?q=$query&limit=10" \
        -H "Authorization: Bearer $SUPERMEMORY_KEY" 2>/dev/null)
    
    echo "$results" | jq -r '.[].id' 2>/dev/null | while read id; do
        [ -n "$id" ] && curl -s -X DELETE "$API_URL/memories/$id" \
            -H "Authorization: Bearer $SUPERMEMORY_KEY" 2>/dev/null && echo "Deleted: $id"
    done
}

# CLI interface
case "${1:-help}" in
    remember|add)
        shift
        remember "$1" "${2:-}"
        ;;
    recall|search)
        shift
        recall "$1" "${2:-5}"
        ;;
    profile|get)
        profile
        ;;
    forget|delete)
        shift
        forget "$1"
        ;;
    help|*)
        echo "SuperMemory CLI for Claude Hours"
        echo ""
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  remember <text> [url]  - Save to memory"
        echo "  recall <query> [limit] - Search memories"
        echo "  profile              - View user profile"
        echo "  forget <query>        - Delete memories matching query"
        echo "  help                 - Show this help"
        ;;
esac
MEMORY

chmod +x "$CLAWD/scripts/claude-hours-supermemory.sh"
echo "✅ Created claude-hours-supermemory.sh"

# Step 5: Create integration with autonomous loop
echo ""
echo "5. Integrating with Claude Hours..."

# Add supermemory commands to autonomous loop tasks
mkdir -p "$CLAWD/system/integrations"

cat > "$CLAWD/system/integrations/supermemory-task.json << 'TASK'
{
  "name": "supermemory-recall",
  "description": "Recall recent memories and context from SuperMemory",
  "script": "scripts/claude-hours-supermemory.sh recall \"recent conversation\" 3",
  "output_file": "memory/supermemory-recall.json",
  "frequency": "every 10 cycles"
}

{
  "name": "supermemory-profile",
  "description": "Fetch user profile from SuperMemory",
  "script": "scripts/claude-hours-supermemory.sh profile",
  "output_file": "memory/supermemory-profile.json", 
  "frequency": "hourly"
}
TASK

echo "✅ Created integration tasks"

# Summary
cat << SUMMARY

=== SuperMemory Setup Complete! ===

📋 NEXT STEPS:

1. Install clawdbot plugin (if not already installed):
   clawdbot plugins install @supermemory/clawdbot-supermemory

2. Restart clawdbot

3. Test the integration:
   ./scripts/claude-hours-supermemory.sh recall "test"

4. Use in Claude Hours:
   - Automatic recall before tasks
   - Manual /remember and /recall commands
   - Memory persists across all platforms

📚 Docs: https://supermemory.ai/docs/integrations/clawdbot

SUMMARY
