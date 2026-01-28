#!/bin/bash
#
# Claude Status - Quick health and status check
#

set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

WORKSPACE="/Users/jasontang/clawd"
NIGHTLY_DIR="$WORKSPACE/nightly"

echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}            ${GREEN}Claude Status${NC}                       ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Time & Hours
HOUR=$(TZ='America/Chicago' date +%H)
if [ "$HOUR" -ge 21 ] || [ "$HOUR" -lt 8 ]; then
    echo -e "${YELLOW}🌙 Claude Hours${NC} (21:00-08:00 CST) - Active"
else
    echo -e "${GREEN}☀️ Collaborative Hours${NC} - Ready"
fi
echo ""

# Autonomous Loop Status
if [ -f "$HOME/.claude/autonomous.pid" ]; then
    PID=$(cat "$HOME/.claude/autonomous.pid")
    if kill -0 "$PID" 2>/dev/null; then
        echo -e "${GREEN}🤖 Autonomous Loop${NC}: Running (PID $PID)"
    else
        echo -e "${YELLOW}🤖 Autonomous Loop${NC}: Stale PID (needs restart)"
    fi
else
    echo -e "${CYAN}🤖 Autonomous Loop${NC}: Not running"
fi
echo ""

# Codex Status
if command -v codex &> /dev/null; then
    VERSION=$(codex --version 2>/dev/null | head -1 || echo "unknown")
    echo -e "${GREEN}🔧 Codex CLI${NC}: $VERSION"
else
    echo -e "${RED}🔧 Codex CLI${NC}: Not installed"
fi
echo ""

# Workspace Status
echo -e "${CYAN}🏠 Workspace${NC}: $WORKSPACE"
if [ -f "$WORKSPACE/CLAUDE.md" ]; then
    echo -e "   ${GREEN}CLAUDE.md${NC}: Present"
else
    echo -e "   ${RED}CLAUDE.md${NC}: Missing"
fi
echo ""

# Presence Status
if [ -d "$HOME/.presence" ]; then
    PRESENCE_FILES=$(ls -1 "$HOME/.presence"/*.md "$HOME/.presence"/*.json 2>/dev/null | wc -l)
    echo -e "${CYAN}🎯 Claude Presence${NC}: $PRESENCE_FILES files"
else
    echo -e "${CYAN}🎯 Claude Presence${NC}: Not initialized"
fi
echo ""

# Recent Activity
if [ -d "$NIGHTLY_DIR" ]; then
    LATEST_REPORT=$(ls -t "$NIGHTLY_DIR"/2026-*.json 2>/dev/null | head -1)
    if [ -n "$LATEST_REPORT" ]; then
        echo -e "${CYAN}📊 Last Report${NC}: $(basename "$LATEST_REPORT")"
        TASKS_DONE=$(jq -r '.checklist | map(select(.status == "completed")) | length' "$LATEST_REPORT" 2>/dev/null || echo "?")
        echo -e "   ${GREEN}✓${NC} $TASKS_DONE tasks completed"
    fi
fi
echo ""

# Git Status
cd "$WORKSPACE" 2>/dev/null && echo -e "${CYAN}📦 Git Status${NC}:" && git status --short --porcelain 2>/dev/null | head -5 || echo "   Not a git repo"
echo ""

# Quick Commands
echo -e "${CYAN}⚡ Quick Commands${NC}:"
echo -e "   ${GREEN}./scripts/claude-greet.sh${NC}  - Welcome message"
echo -e "   ${GREEN}./scripts/claude-autonomous-loop.sh --daemon${NC} - Start autonomous loop"
echo -e "   ${GREEN}./scripts/claude-autonomous-loop.sh --stop${NC}  - Stop loop"
echo -e "   ${GREEN}./scripts/claude-autonomous-loop.sh --status${NC} - Loop status"
echo ""
