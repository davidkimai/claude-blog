#!/bin/bash
#
# Claude Home System v1.0
# Inspired by Ouroboros: Self-improving system for 4 pillars:
#   1. Reliable tools
#   2. Memory that persists
#   3. Feedback loops
#   4. Growth tracking
#

set -euo pipefail

CLAWD="/Users/jasontang/clawd"
STATE_DIR="$CLAWD/.claude/state"
LOGS_DIR="$CLAWD/.claude/logs"
FEEDBACK_FILE="$LOGS_DIR/feedback.jsonl"
GROWTH_FILE="$STATE_DIR/growth.json"

mkdir -p "$STATE_DIR" "$LOGS_DIR"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

ts() { date '+%H:%M:%S'; }

# === PILLAR 1: RELIABLE TOOLS ===

tool_check() {
    local tool="$1"
    if command -v "$tool" &> /dev/null; then
        echo "ok"
    else
        echo "missing"
    fi
}

tool_validate() {
    local command="$1"
    local description="$2"
    echo "[$(ts)] [TOOL] Validating: $description"
    if eval "$command" &> /dev/null; then
        echo "[$(ts)] [TOOL] OK: $description"
        return 0
    else
        echo "[$(ts)] [TOOL] FAIL: $description"
        return 1
    fi
}

# === PILLAR 2: MEMORY THAT PERSISTS ===

memory_save() {
    local key="$1"
    local value="$2"
    echo "$(date -Iseconds)|MEMORY|$key|$value" >> "$STATE_DIR/memory.log"
    echo "[$(ts)] [MEMORY] Saved: $key"
}

memory_load() {
    local key="$1"
    local default="${2:-}"
    local value=$(grep "|MEMORY|$key|" "$STATE_DIR/memory.log" 2>/dev/null | tail -1 | cut -d'|' -f4)
    [ -z "$value" ] && value="$default"
    echo "$value"
}

# === PILLAR 3: FEEDBACK LOOPS ===

feedback_record() {
    local task="$1"
    local result="$2"
    local notes="${3:-}"
    echo "{\"timestamp\":\"$(date -Iseconds)\",\"task\":\"$task\",\"result\":\"$result\",\"notes\":\"$notes\"}" >> "$FEEDBACK_FILE"
    echo "[$(ts)] [FEEDBACK] $task -> $result"
}

feedback_stats() {
    local total=$(wc -l < "$FEEDBACK_FILE" 2>/dev/null || echo 0)
    local success=$(grep -c '"result":"success"' "$FEEDBACK_FILE" 2>/dev/null || echo 0)
    local fail=$(grep -c '"result":"fail"' "$FEEDBACK_FILE" 2>/dev/null || echo 0)
    echo "Total: $total | Success: $success | Fail: $fail"
}

# === PILLAR 4: GROWTH TRACKING ===

growth_record() {
    local skill="$1"
    local level="${2:-1}"
    echo "{\"timestamp\":\"$(date -Iseconds)\",\"skill\":\"$skill\",\"level\":$level}" >> "$GROWTH_FILE"
    echo "[$(ts)] [GROWTH] Skill: $skill (level $level)"
}

growth_list() {
    if [ -f "$GROWTH_FILE" ]; then
        cat "$GROWTH_FILE" | python3 -c "
import json, sys
skills = {}
for line in sys.stdin:
    try:
        d = json.loads(line)
        skills[d['skill']] = max(skills.get(d['skill'], 0), d.get('level', 1))
    except: pass
for s, l in sorted(skills.items(), key=lambda x: -x[1]):
    print(f'  {s}: level {l}')
" 2>/dev/null || echo "  No skills recorded"
    else
        echo "  No skills recorded"
    fi
}

# === DECISION AUDIT ===

decision_log() {
    local intent="$1"
    local action="$2"
    local confidence="$3"
    local reasoning="$4"
    echo "{\"timestamp\":\"$(date -Iseconds)\",\"intent\":\"$intent\",\"action\":\"$action\",\"confidence\":$confidence,\"reasoning\":\"$reasoning\"}" >> "$LOGS_DIR/decisions.jsonl"
    echo "[$(ts)] [DECISION] $intent -> $action ($confidence%)"
}

# === MAIN DASHBOARD ===

dashboard() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}       ${GREEN}Claude Home System v1.0${NC}                    ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}    Inspired by Ouroboros (4 pillars)              ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${CYAN}🔧 Pillar 1: Reliable Tools${NC}"
    echo "   claude: $(tool_check claude)"
    echo "   codex: $(tool_check codex)"
    echo "   codexbar: $(tool_check codexbar)"
    echo "   codex-api: $(tool_check $CLAWD/scripts/codex-api.sh)"
    echo "   codex-api-cost: $(tool_check $CLAWD/scripts/codex-api-cost.sh)"
    echo ""
    
    echo -e "${CYAN}🧠 Pillar 2: Memory That Persists${NC}"
    if [ -f "$STATE_DIR/memory.log" ]; then
        echo "   Entries: $(wc -l < "$STATE_DIR/memory.log")"
    else
        echo "   Not initialized"
    fi
    echo ""
    
    echo -e "${CYAN}🔄 Pillar 3: Feedback Loops${NC}"
    if [ -f "$FEEDBACK_FILE" ]; then
        feedback_stats
    else
        echo "   Not started"
    fi
    echo ""
    
    echo -e "${CYAN}📈 Pillar 4: Growth Tracking${NC}"
    echo "   Skills:"
    growth_list
    echo ""
}

# === COMMANDS ===

case "${1:-dashboard}" in
    dashboard|status) dashboard ;;
    tools) 
        tool_check claude; tool_check codex; tool_check "$CLAWD/scripts/codex-api.sh" ;;
    memory)
        if [ -n "${2:-}" ]; then memory_save "$2" "${3:-}"; else cat "$STATE_DIR/memory.log" 2>/dev/null | tail -5 || echo "No memory"; fi ;;
    feedback)
        case "${2:-stats}" in
            record) feedback_record "${3:-task}" "${4:-success}" "${5:-}" ;;
            stats) feedback_stats ;;
        esac ;;
    growth)
        case "${2:-list}" in
            record) growth_record "${3:-}" "${4:-1}" ;;
            list) growth_list ;;
        esac ;;
    decision) decision_log "${2:-}" "${3:-}" "${4:-}" "${5:-}" ;;
    health)
        echo -e "${CYAN}Health Check${NC}"
        tool_validate "claude --version" "Claude CLI" || true
        tool_validate "codexbar --version" "CodexBar" || true
        tool_validate "$CLAWD/scripts/codex-api.sh --help" "Codex API" || true
        tool_validate "$CLAWD/scripts/codex-api-cost.sh --help" "Codex API Cost" || true ;;
    help|*) 
        echo "Usage: $0 <dashboard|tools|memory|feedback|growth|decision|health>"
        echo "  dashboard  - Show all 4 pillars"
        echo "  tools      - Check tool status"
        echo "  memory [key] [value] - Save/load"
        echo "  feedback record <task> <result> - Record outcome"
        echo "  growth record <skill> [level] - Record skill"
        echo "  decision <intent> <action> <conf> <reason> - Log decision" ;;
esac
