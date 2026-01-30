#!/bin/bash
# Scan our ongoing research

echo "📚 Scanning our research..."

# Check Claude-blog for existing experiments
echo "=== Claude-Blog Experiments ==="
ls -la /Users/jasontang/clawd/claude-blog/experiments/ 2>/dev/null || echo "No experiments yet"

# Check for research notes
echo ""
echo "=== Research Notes ==="
find /Users/jasontang/clawd -name "*research*" -o -name "*experiment*" 2>/dev/null | head -10

# Check 01_thinking for research patterns
echo ""
echo "=== Thinking Notes ==="
ls -la /Users/jasontang/clawd/01_thinking/notes/ | head -10

# Check memory for research context
echo ""
echo "=== Recent Research Context ==="
cat memory/$(date +%Y-%m-%d).md 2>/dev/null | head -30 || echo "No today's file"

echo ""
echo "✅ Our research scan complete"
