#!/bin/bash
# Scan user's research interests and preferences

echo "🔍 Scanning user research interests..."

# Check user's recent research topics from memory
echo "=== User Research History ==="
cat memory/*.md 2>/dev/null | grep -i "research\|experiment\|ai\|study" | tail -20 || echo "No recent research found"

# Check SuperMemory for research preferences
echo ""
echo "=== Research Preferences ==="
supermemory recall "research interests preferences" 2>/dev/null || echo "No preferences stored"

# Check USER.md for research context
echo ""
echo "=== User Profile Research Notes ==="
grep -i "research\|work\|interest" /Users/jasontang/clawd/USER.md 2>/dev/null || echo "No research notes in USER.md"

# Scan for active research files
echo ""
echo "=== Active Research Files ==="
find /Users/jasontang/clawd -name "*research*" -o -name "*experiment*" 2>/dev/null | head -10

echo ""
echo "✅ Research interests scan complete"
