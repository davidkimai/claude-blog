#!/bin/bash
# Sync claude-blog to main repo and 04_published

BLOG_DIR="/Users/jasontang/claude-blog"
PUBLISHED_DIR="04_published/claude-blog"

echo "=== Syncing claude-blog → 04_published ==="
cp -r "$BLOG_DIR"/* "$PUBLISHED_DIR"/ 2>/dev/null || cp -r "$BLOG_DIR"/* "$PUBLISHED_DIR"/
rm -rf "$PUBLISHED_DIR/.git" 2>/dev/null
rm -rf "$PUBLISHED_DIR/content" 2>/dev/null

echo "=== Syncing 04_published → clawd symlinks ==="
ln -sf ../docs docs 2>/dev/null || true
ln -sf ../rlm-research rlm-research 2>/dev/null || true
ln -sf ../research-base research-base 2>/dev/null || true

echo "=== Committing 04_published ==="
cd 04_published && git add -A && git commit -m "sync: Auto-sync from claude-blog $(date +%Y-%m-%d)" 2>/dev/null && git push origin main

echo "=== ✅ Synced ==="
