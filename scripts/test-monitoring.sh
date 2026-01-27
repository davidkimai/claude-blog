#!/bin/bash
# Test script for spawn-with-monitor.sh wrapper
# This demonstrates the monitoring workflow without actually spawning

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "=== Subagent Monitoring Test ==="
echo ""

# Check if required scripts exist
if [ ! -f "scripts/spawn-with-monitor.sh" ]; then
  echo "❌ Error: spawn-with-monitor.sh not found"
  exit 1
fi

if [ ! -f "scripts/subagent-monitor.js" ]; then
  echo "❌ Error: subagent-monitor.js not found"
  exit 1
fi

# Make spawn-with-monitor.sh executable if needed
chmod +x scripts/spawn-with-monitor.sh

echo "✅ Prerequisites check passed"
echo ""

echo "📚 Usage demonstration:"
echo ""
echo "1️⃣  When Claude spawns a subagent and gets a sessionKey:"
echo '    SESSION_KEY="agent:main:subagent:abc123"'
echo ""
echo "2️⃣  Start monitoring with:"
echo '    ./scripts/spawn-with-monitor.sh "$SESSION_KEY"'
echo ""
echo "3️⃣  Check notifications in heartbeats:"
echo "    ./scripts/check-notifications.sh"
echo ""
echo "Expected behavior:"
echo "  ✅ Immediate spawn notification"
echo "  ✅ Progress updates every ~35 seconds"
echo "  ✅ Milestone alerts (tokens, time, completion)"
echo "  ✅ Auto-termination when subagent finishes"
echo ""
echo "💡 The monitor runs in background and writes to:"
echo "   ~/.clawdbot/agents/main/notifications.jsonl"
echo ""
echo "💡 Logs are written to:"
echo "   /tmp/monitor-<session-id>.log"
echo ""

# Show actual usage if a session key is provided
if [ $# -gt 0 ]; then
  SESSION_KEY="$1"
  echo "🚀 Starting monitor for: $SESSION_KEY"
  echo ""
  ./scripts/spawn-with-monitor.sh "$SESSION_KEY"
  echo ""
  echo "✅ Monitor started! Check notifications with:"
  echo "   ./scripts/check-notifications.sh"
else
  echo "💡 To test with an actual session:"
  echo "   ./scripts/test-monitoring.sh <sessionKey>"
fi

echo ""
echo "✅ Test complete!"
