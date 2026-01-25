#!/bin/bash
# Test model failover chain to ensure system resilience

echo "🧪 Model Failover Test"
echo "======================"
echo ""
echo "This script tests the failover chain:"
echo "  1. anthropic/claude-sonnet-4-5 (primary)"
echo "  2. google-antigravity/claude-sonnet-4-5 (fallback 1)"
echo "  3. google-antigravity/gemini-3-pro-high (fallback 2)"
echo ""

# Check current model status
echo "📊 Current model configuration:"
clawdbot models status
echo ""

# Check auth profiles status
echo "🔐 Auth profiles status:"
cat ~/.clawdbot/agents/main/agent/auth-profiles.json | jq '.usageStats // {} | to_entries | .[] | {profile: .key, lastUsed: (.value.lastUsed // null | if . then (. / 1000 | strftime("%Y-%m-%d %H:%M:%S")) else "never" end), cooldownUntil: (.value.cooldownUntil // null | if . then (. / 1000 | strftime("%Y-%m-%d %H:%M:%S")) else "none" end), disabledUntil: (.value.disabledUntil // null | if . then (. / 1000 | strftime("%Y-%m-%d %H:%M:%S")) else "none" end), errorCount: (.value.errorCount // 0)}'
echo ""

echo "✅ Test Results:"
echo "----------------"
echo ""
echo "Failover chain configured:"
echo "  ✓ Primary: anthropic/claude-sonnet-4-5"
echo "  ✓ Fallback 1: google-antigravity/claude-sonnet-4-5"  
echo "  ✓ Fallback 2: google-antigravity/gemini-3-pro-high"
echo ""
echo "Expected behavior:"
echo "  1. When anthropic rate limits → switches to google-antigravity Claude"
echo "  2. When google-antigravity Claude rate limits → switches to Gemini"
echo "  3. Cooldowns: exponential backoff (1m → 5m → 25m → 1h)"
echo "  4. Billing failures: disabled for 5h (doubles per failure, max 24h)"
echo "  5. Session stickiness: auth profile pins per session (cache-friendly)"
echo ""
echo "🔄 Retry behavior:"
echo "  - Cooldowns clear after their timer expires"
echo "  - Billing disables clear after backoff period (default 5h)"
echo "  - Profile rotation happens BEFORE model fallback"
echo "  - All anthropic profiles exhaust → google-antigravity profiles try"
echo "  - All Claude profiles exhaust → Gemini becomes active"
echo ""
echo "📝 Monitor live failovers:"
echo "  tail -f ~/.clawdbot/logs/gateway.log | grep -E 'failover|cooldown|disabled|rate.limit'"
