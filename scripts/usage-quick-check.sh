#!/bin/bash
# Claude Hours Usage Monitor - Multi-provider Quick Status

CLAWD="/Users/jasontang/clawd"
STATE_DIR="$CLAWD/.claude/state"

# Quick status check using codexbar directly
echo "📊 Multi-Provider Usage Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔵 Codex (OpenAI):"
codexbar usage --provider codex --status 2>&1 | grep -E "Session:|Weekly:|Credits:|Plan:" | sed 's/^/  /'
echo ""

echo "🟣 Claude (Anthropic):"
codexbar usage --provider claude --status 2>&1 | grep -E "Session:|Weekly:|Monthly:|Plan:|Cost:" | sed 's/^/  /'
echo ""

echo "🔴 Gemini (Google):"
codexbar usage --provider gemini --status 2>&1 | grep -E "Daily:|Plan:|Status:" | sed 's/^/  /'
echo ""

echo "🟢 Antigravity (Google):"
codexbar usage --provider antigravity --status 2>&1 | grep -E "Primary:|Secondary:|Plan:|Status:" | sed 's/^/  /'
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
