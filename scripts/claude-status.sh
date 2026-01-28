#!/bin/bash
#
# Claude Status v2.0
# Enhanced status with Ouroboros decision audit and Ralph-inspired task tracking
#

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m'

WORKSPACE="/Users/jasontang/clawd"
STATE_DIR="$HOME/.claude/state"
LOG_DIR="$HOME/.claude/logs"
AUDIT_LOG="$LOG_DIR/decisions.jsonl"
NIGHTLY_DIR="$WORKSPACE/nightly"

echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        ${GREEN}Claude Status v2.0${NC}                        ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}   GSD + Ralph-TUI + Ouroboros Inspired        ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# === TIME & CLAUDE HOURS ===
HOUR=$(TZ='America/Chicago' date +%H)
if [ "$HOUR" -ge 21 ] || [ "$HOUR" -lt 8 ]; then
    echo -e "${MAGENTA}🌙 Claude Hours${NC} (21:00-08:00 CST) - Active"
else
    echo -e "${GREEN}☀️ Collaborative Hours${NC} - Ready"
fi
echo ""

# === AUTONOMOUS LOOP STATUS ===
echo -e "${CYAN}🤖 Autonomous Loop${NC}"
if [ -f "$STATE_DIR/daemon.pid" ] && kill -0 "$(cat "$STATE_DIR/daemon.pid")" 2>/dev/null; then
    echo -e "   ${GREEN}●${NC} Running (PID $(cat "$STATE_DIR/daemon.pid"))"
    if [ -f "$STATE_DIR/loop-state.json" ]; then
        CYCLE=$(jq -r '.cycle' "$STATE_DIR/loop-state.json" 2>/dev/null || echo 0)
        TASKS=$(jq -r '.tasks_completed' "$STATE_DIR/loop-state.json" 2>/dev/null || echo 0)
        FOCUS=$(jq -r '.current_focus' "$STATE_DIR/loop-state.json" 2>/dev/null || echo "unknown")
        echo -e "   Cycle: $CYCLE | Tasks: $TASKS | Focus: $FOCUS"
    fi
else
    echo -e "   ${YELLOW}○${NC} Not running"
fi
echo ""

# === CODEX STATUS ===
if command -v codex &> /dev/null; then
    VERSION=$(codex --version 2>/dev/null | head -1 || echo "unknown")
    echo -e "${CYAN}🔧 Codex CLI${NC}: $VERSION"
else
    echo -e "${CYAN}🔧 Codex CLI${NC}: ${RED}Not installed${NC}"
fi
echo ""

# === TASK BEADS (Ralph-TUI inspired) ===
BEADS_FILE="$STATE_DIR/beads.jsonl"
if [ -f "$BEADS_FILE" ]; then
    PENDING=$(grep -c '"status":"pending"' "$BEADS_FILE" 2>/dev/null || echo 0)
    COMPLETED=$(grep -c '"status":"completed"' "$BEADS_FILE" 2>/dev/null || echo 0)
    echo -e "${CYAN}📋 Task Beads${NC}: $PENDING pending, $COMPLETED completed"
else
    echo -e "${CYAN}📋 Task Beads${NC}: No beads created"
fi
echo ""

# === DECISION AUDIT (Ouroboros inspired) ===
if [ -f "$AUDIT_LOG" ]; then
    DECISIONS=$(wc -l < "$AUDIT_LOG")
    echo -e "${CYAN}📊 Decision Audit Trail${NC}: $DECISIONS decisions logged"
    
    # Show recent decisions
    echo -e "   ${GREEN}Recent:${NC}"
    tail -3 "$AUDIT_LOG" 2>/dev/null | while read line; do
        INTENT=$(echo "$line" | jq -r '.intent' 2>/dev/null || echo "?")
        CONF=$(echo "$line" | jq -r '.confidence' 2>/dev/null || echo "?")
        ACTION=$(echo "$line" | jq -r '.action' 2>/dev/null || echo "?")
        printf "   • %-15s %3s%% → %s\n" "$INTENT" "$CONF" "$ACTION"
    done
fi
echo ""

# === PRESENCE & PERSONALITY ===
if [ -d "/Users/jasontang/clawd/.presence" ]; then
    PRESENCE_FILES=$(ls -1 "/Users/jasontang/clawd/.presence"/*.md "/Users/jasontang/clawd/.presence"/*.json 2>/dev/null | wc -l)
    echo -e "${CYAN}🎯 Claude Presence${NC}: $PRESENCE_FILES files"
else
    echo -e "${CYAN}🎯 Claude Presence${NC}: ${YELLOW}Not initialized${NC}"
fi
echo ""

# === NIGHTLY REPORTS ===
if [ -d "$NIGHTLY_DIR" ]; then
    LATEST=$(ls -t "$NIGHTLY_DIR"/2026-*.json 2>/dev/null | head -1)
    if [ -n "$LATEST" ]; then
        echo -e "${CYAN}📁 Latest Nightly Report${NC}: $(basename "$LATEST")"
        TASKS_DONE=$(jq -r '.checklist | map(select(.status == "completed")) | length' "$LATEST" 2>/dev/null || echo "?")
        echo -e "   ${GREEN}✓${NC] $TASKS_DONE tasks in last session"
    fi
fi
echo ""

# === WORKSPACE ===
echo -e "${CYAN}🏠 Workspace${NC}: $WORKSPACE"
if [ -f "$WORKSPACE/CLAUDE.md" ]; then
    echo -e "   ${GREEN}CLAUDE.md${NC}: Present"
fi
echo ""

# === QUICK COMMANDS ===
echo -e "${CYAN}⚡ Quick Commands${NC}:"
echo -e "   ${GREEN}./scripts/claude-greet.sh${NC}        - Welcome message"
echo -e "   ${GREEN}./scripts/claude-status.sh${NC}       - This status"
echo -e "   ${GREEN}./scripts/claude-autonomous-loop.sh --daemon${NC} - Start loop"
echo -e "   ${GREEN}./scripts/claude-autonomous-loop.sh --stats${NC}   - Loop stats"
echo -e "   ${GREEN}./scripts/claude-autonomous-loop.sh --stop${NC}    - Stop loop"
echo ""

# === SYSTEM METRICS ===
echo -e "${CYAN}📈 System Metrics${NC}"
MEM=$(ps aux | grep "claude-autonomous" | grep -v grep | awk '{sum+=$6} END {print sum/1024" MB"}' 2>/dev/null || echo "N/A")
UPTIME=$(uptime | grep -o 'up.*' | sed 's/,.*//' 2>/dev/null || echo "unknown")
echo -e "   Memory: $MEM | Uptime: $UPTIME"
echo ""
