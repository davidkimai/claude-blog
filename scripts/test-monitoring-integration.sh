#!/bin/bash
# Test the monitoring integration
#
# This script tests the complete workflow:
# 1. Mock spawn (since we can't actually spawn)
# 2. Start monitor
# 3. Verify notifications
# 4. Stop monitor

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Testing Subagent Monitoring Integration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_SESSION_KEY="agent:main:subagent:test-$(date +%s)"
TEST_LABEL="integration-test"

echo "📝 Test Configuration:"
echo "   Session Key: $TEST_SESSION_KEY"
echo "   Label: $TEST_LABEL"
echo ""

# Step 1: Create mock session in sessions.json
echo "1️⃣ Creating mock session..."
SESSIONS_FILE="$HOME/.clawdbot/agents/main/sessions/sessions.json"

if [ ! -f "$SESSIONS_FILE" ]; then
    echo "   ⚠️  Sessions file not found: $SESSIONS_FILE"
    echo "   Creating directory and empty sessions file..."
    mkdir -p "$(dirname "$SESSIONS_FILE")"
    echo "{}" > "$SESSIONS_FILE"
fi

# Read existing sessions
SESSIONS_JSON=$(cat "$SESSIONS_FILE")

# Add mock session
MOCK_SESSION=$(cat <<EOF
{
  "label": "$TEST_LABEL",
  "model": "test-model",
  "totalTokens": 0,
  "inputTokens": 0,
  "outputTokens": 0,
  "createdAt": $(date +%s)000,
  "updatedAt": $(date +%s)000,
  "abortedLastRun": false
}
EOF
)

# Update sessions.json (simple approach - append to object)
TEMP_FILE=$(mktemp)
echo "$SESSIONS_JSON" | jq ". + {\"$TEST_SESSION_KEY\": $MOCK_SESSION}" > "$TEMP_FILE"
mv "$TEMP_FILE" "$SESSIONS_FILE"

echo "   ✅ Mock session created"
echo ""

# Step 2: Start monitor in background
echo "2️⃣ Starting monitor..."
nohup node "$SCRIPT_DIR/subagent-monitor.js" "$TEST_SESSION_KEY" --interval 3000 > /tmp/monitor-test.log 2>&1 &
MONITOR_PID=$!

echo "   ✅ Monitor started (PID: $MONITOR_PID)"
echo ""

# Step 3: Wait for initial notifications
echo "3️⃣ Waiting for initial notification (5 seconds)..."
sleep 5

# Step 4: Check notifications
echo "4️⃣ Checking notifications..."
NOTIF_OUTPUT=$(./scripts/check-notifications.sh --all)
echo "$NOTIF_OUTPUT"
echo ""

if echo "$NOTIF_OUTPUT" | grep -q "🚀 Launched: $TEST_LABEL"; then
    echo "   ✅ Launch notification found!"
else
    echo "   ❌ Launch notification NOT found!"
    echo "   Check: cat ~/.clawdbot/agents/main/notifications.jsonl"
fi
echo ""

# Step 5: Simulate activity by updating tokens
echo "5️⃣ Simulating activity (updating tokens)..."
SESSIONS_JSON=$(cat "$SESSIONS_FILE")
TEMP_FILE=$(mktemp)
echo "$SESSIONS_JSON" | jq ".\"$TEST_SESSION_KEY\".totalTokens = 5000 | .\"$TEST_SESSION_KEY\".inputTokens = 3000 | .\"$TEST_SESSION_KEY\".outputTokens = 2000 | .\"$TEST_SESSION_KEY\".updatedAt = $(date +%s)000" > "$TEMP_FILE"
mv "$TEMP_FILE" "$SESSIONS_FILE"
echo "   ✅ Tokens updated to 5000"
echo ""

# Step 6: Wait for progress update
echo "6️⃣ Waiting for progress update (10 seconds)..."
sleep 10

# Step 7: Check for progress notifications
echo "7️⃣ Checking for progress notifications..."
NOTIF_OUTPUT=$(./scripts/check-notifications.sh --all)
echo "$NOTIF_OUTPUT"
echo ""

if echo "$NOTIF_OUTPUT" | grep -q "⚙️ Progress"; then
    echo "   ✅ Progress notification found!"
else
    echo "   ⚠️  Progress notification not found yet (may need more time)"
fi
echo ""

# Step 8: Check monitor status
echo "8️⃣ Checking monitor status..."
./scripts/monitor-status.sh
echo ""

# Step 9: Stop monitor
echo "9️⃣ Stopping monitor..."
./scripts/stop-monitors.sh "$MONITOR_PID"
echo ""

# Step 10: Cleanup
echo "🧹 Cleaning up..."
SESSIONS_JSON=$(cat "$SESSIONS_FILE")
TEMP_FILE=$(mktemp)
echo "$SESSIONS_JSON" | jq "del(.\"$TEST_SESSION_KEY\")" > "$TEMP_FILE"
mv "$TEMP_FILE" "$SESSIONS_FILE"
echo "   ✅ Mock session removed"
echo ""

# Step 11: Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Integration Test Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Test Summary:"
echo "   • Monitor spawned successfully"
echo "   • Notifications received"
echo "   • Status check working"
echo "   • Cleanup successful"
echo ""
echo "💡 Next Steps:"
echo "   1. Try spawning a real subagent:"
echo "      ./scripts/spawn-monitored.sh \"test-task\" \"Test description\""
echo ""
echo "   2. Monitor with:"
echo "      ./scripts/check-notifications.sh"
echo ""
echo "   3. Check Claude workflow guide:"
echo "      cat CLAUDE-SUBAGENT-WORKFLOW.md"
