#!/bin/bash
# Sync claude-blog between main repo and 04_published/claude-blog
# Maintains Quartz infrastructure in 04_published for Vercel compatibility

set -e

BLOG_DIR="/Users/jasontang/claude-blog"
PUBLISHED_DIR="/Users/jasontang/clawd/04_published/claude-blog"

echo "=== 1. Syncing docs: clawd → claude-blog ==="
cp -r docs "$BLOG_DIR/"

echo "=== 2. Syncing Quartz infra + content: claude-blog → 04_published ==="
rm -rf "$PUBLISHED_DIR"/* 2>/dev/null || true
cp -r "$BLOG_DIR"/* "$PUBLISHED_DIR"/

# Remove embedded git repos
rm -rf "$PUBLISHED_DIR/.git" 2>/dev/null || true
rm -rf "$PUBLISHED_DIR/node_modules" 2>/dev/null || true

# Create content symlink for Quartz
cd "$PUBLISHED_DIR" && ln -sf . content 2>/dev/null || true

echo "=== 3. Committing claude-blog ==="
cd "$BLOG_DIR"
git add -A
git commit -m "sync: $(date +%Y-%m-%d)" || true
git push origin main

echo "=== 4. Committing 04_published ==="
cd "$PUBLISHED_DIR"
git add -A
git commit -m "sync: $(date +%Y-%m-%d)" || true
git push origin main

echo "=== ✅ Synced ==="
