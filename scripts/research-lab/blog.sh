#!/bin/bash
# Document a finding in Claude-blog
# Usage: ./blog.sh "finding title" "content"

set -e

TITLE="${1:-New Finding}"
CONTENT="${2:-Content description}"

DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
FILENAME="/Users/jasontang/clawd/claude-blog/findings/${DATE}-$(echo "$TITLE" | tr ' ' '-' | tr '[:upper:]' '[:lower:]').md"

echo "📝 Documenting Finding: $TITLE"

# Create finding file
cat > "$FILENAME" << EOF
---
title: "$TITLE"
date: $DATE $TIME
tags: [ai-research, finding]
---

# $TITLE

**Date:** $DATE  
**Time:** $TIME

## Summary
$CONTENT

## Details
[Elaborate on the finding]

## Implications
[What this means]

## Related
- Experiments: [Link to related experiments]
- Tags: #ai-research #finding
EOF

echo "✅ Finding documented: $FILENAME"
echo ""
echo "To view: cat $FILENAME"
