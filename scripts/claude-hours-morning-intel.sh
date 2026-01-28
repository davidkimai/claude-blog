#!/bin/bash
#
# Claude Hours Morning Intel Feed
# Runs at 7:00 AM CST to summarize the night's work
#

set -euo pipefail

CLAWD="/Users/jasontang/clawd"
STATE_DIR="$CLAWD/.claude/state"
LOGS_DIR="$CLAWD/.claude/logs"
MEMORY_DIR="$CLAWD/memory"
NIGHTLY_DIR="$CLAWD/nightly"
SCHEDULE_DIR="$CLAWD/system/schedules"
INTEL_DIR="$CLAWD/system/intel"

mkdir -p "$INTEL_DIR" "$STATE_DIR" "$LOGS_DIR" "$NIGHTLY_DIR"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INTEL] $1" >> "$LOGS_DIR/intel.log"; }

date_only() { date '+%Y-%m-%d'; }

# Executive Summary
echo "==============================================="
echo "     Claude Hours Morning Intel"
echo "==============================================="
echo ""
echo "Date: $(date_only)"
echo "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Metrics Dashboard
echo "-----------------------------------------------"
echo "Metrics Dashboard"
echo "-----------------------------------------------"

cycle=0
[ -f "$STATE_DIR/cycle.txt" ] && cycle=$(cat "$STATE_DIR/cycle.txt")
echo "Cycles Completed: $cycle"

tasks=0
[ -f "$NIGHTLY_DIR/$(date_only).json" ] && tasks=$(jq -r '.checklist | map(select(.status == "completed")) | length' "$NIGHTLY_DIR/$(date_only).json" 2>/dev/null || echo 0)
echo "Tasks Completed: $tasks"

swarm_runs=0
[ -f "$CLAWD/skills/agent-swarm/memory/swarm-metrics.jsonl" ] && swarm_runs=$(wc -l < "$CLAWD/skills/agent-swarm/memory/swarm-metrics.jsonl")
echo "Swarm Runs: $swarm_runs"

memory_lines=0
[ -f "$STATE_DIR/memory.log" ] && memory_lines=$(wc -l < "$STATE_DIR/memory.log")
echo "Memory Entries: $memory_lines"

echo ""

# Tasks Completed
echo "-----------------------------------------------"
echo "Last Night's Accomplishments"
echo "-----------------------------------------------"

if [ -f "$NIGHTLY_DIR/$(date_only).json" ]; then
    jq -r '.checklist[] | "  [x] \(.task_title)"' "$NIGHTLY_DIR/$(date_only).json" 2>/dev/null | head -10 || echo "  (No tasks recorded)"
else
    echo "  No session data found."
fi

echo ""

# Git Activity
echo "-----------------------------------------------"
echo "Git Activity (Last 12h)"
echo "-----------------------------------------------"

cd "$CLAWD"
commits=$(git log --since="12 hours ago" --oneline 2>/dev/null | head -5)
if [ -n "$commits" ]; then
    echo "$commits" | sed 's/^/  /'
else
    echo "  No recent commits."
fi

echo ""

# Growth Tracking
echo "-----------------------------------------------"
echo "Growth Tracking"
echo "-----------------------------------------------"

if [ -f "$STATE_DIR/growth.json" ]; then
    jq -r '.skills[] | "  * \(.name): Level \(.level)"' "$STATE_DIR/growth.json" 2>/dev/null | head -10 || echo "  (No skills)"
else
    echo "  No growth data."
fi

echo ""

# Recommendations
echo "-----------------------------------------------"
echo "Next Session Recommendations"
echo "-----------------------------------------------"

if [ -f "$SCHEDULE_DIR/nightly.json" ]; then
    jq -r '.nightly_schedule.default.tasks[] | select(.status == "pending") | "  * \(.title)"' "$SCHEDULE_DIR/nightly.json" 2>/dev/null | head -5 || echo "  No pending tasks."
else
    echo "  Schedule not configured."
fi

echo ""
echo "==============================================="
echo "Claude Hours sleeping. See you tonight!"
echo "==============================================="

log "Morning intel generated successfully"
