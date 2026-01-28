#!/bin/bash
#
# Memory Search Script
# Search Claude Hours memory files for patterns
#

MEMORY_DIR="/Users/jasontang/clawd/memory"
PATTERN="${1:-}"
MAX_RESULTS="${2:-10}"

if [ -z "$PATTERN" ]; then
    echo "Usage: $0 <search-pattern> [max-results]"
    echo "Example: $0 CodexBar 5"
    exit 1
fi

echo "Searching for: $PATTERN"
echo "=== Results ==="
grep -r "$PATTERN" "$MEMORY_DIR"/*.md 2>/dev/null | head "$MAX_RESULTS" | while read line; do
    file=$(echo "$line" | cut -d: -f1)
    file=$(basename "$file")
    content=$(echo "$line" | cut -d: -f2- | head -c 150)
    echo "• $file: $content..."
done

echo ""
echo "Total matches: $(grep -r "$PATTERN" "$MEMORY_DIR"/*.md 2>/dev/null | wc -l)"
