#!/bin/bash
# Sync claude-blog to 04_published for Vercel deployment
# Run this after committing new blog posts

SOURCE="/Users/jasontang/clawd/claude-blog"
DEST="/Users/jasontang/clawd/04_published/claude-blog"

echo "=== Syncing blog to 04_published ==="

# Sync all files
rsync -av --delete \
  "$SOURCE/" \
  "$DEST/"

echo ""
echo "=== Synced successfully ==="
echo "Files in destination:"
find "$DEST" -name "*.md" | wc -l | xargs echo "Total MD files:"
