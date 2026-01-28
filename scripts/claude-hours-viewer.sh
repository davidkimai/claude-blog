#!/bin/bash
#
# Claude Hours Session Viewer 🕐
# View and track progress over time with timestamps
#

CLAWD="/Users/jasontang/clawd"
NIGHTLY_DIR="$CLAWD/nightly"

mkdir -p "$NIGHTLY_DIR"

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# === VIEW TODAY'S SESSION ===
today() {
    local date_str=$(date +%Y-%m-%d)
    local report="$NIGHTLY_DIR/${date_str}.json"
    
    if [ ! -f "$report" ]; then
        echo -e "${YELLOW}No session recorded for today yet.${NC}"
        echo "Run a cycle to start tracking!"
        return
    fi
    
    local timestamp=$(jq -r '.timestamp' "$report" 2>/dev/null)
    local focus=$(jq -r '.session_summary.focus // "General"' "$report" 2>/dev/null)
    local tasks_done=$(jq -r '.checklist | map(select(.status == "completed")) | length' "$report" 2>/dev/null || echo 0)
    local tasks_total=$(jq -r '.checklist | length' "$report" 2>/dev/null || echo 0)
    
    echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}       ${GREEN}Claude Hours Session Report${NC}                 ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${MAGENTA}📅 Session:${NC} $(echo "$timestamp" | cut -d'T' -f1)"
    echo -e "${MAGENTA}⏰ Time:${NC} $(echo "$timestamp" | cut -d'T' -f2 | cut -d'-' -f1)"
    echo -e "${MAGENTA}🎯 Focus:${NC} $focus"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Progress bar
    local pct=$(( tasks_total > 0 ? (tasks_done * 100 / tasks_total) : 0 ))
    local bars=$(( pct / 5 ))
    local empty=$(( 20 - bars ))
    printf "${GREEN}Tasks:${NC} %d/%d [%s%s] %d%%\n" "$tasks_done" "$tasks_total" "$(printf '#%.0s' $(seq 1 $bars 2>/dev/null) 2>/dev/null || echo "")" "$(printf '.%.0s' $(seq 1 $empty 2>/dev/null) 2>/dev/null || echo "")" "$pct"
    echo ""
    
    # Checklist
    if jq -e '.checklist' "$report" >/dev/null 2>&1; then
        echo -e "${CYAN}Checklist:${NC}"
        jq -r '.checklist[] | "  \(.status == "completed" ? "✓" : .status == "in-progress" ? "◐" : "○") \(.task_title)"' "$report" 2>/dev/null | head -15
        echo ""
    fi
    
    # Milestones
    if jq -e '.status_updates' "$report" >/dev/null 2>&1; then
        local milestones=$(jq -r '.status_updates | length' "$report" 2>/dev/null || echo 0)
        if [ "$milestones" -gt 0 ]; then
            echo -e "${CYAN}Milestones:${NC}"
            jq -r '.status_updates[] | "  • \(.milestone)"' "$report" 2>/dev/null | head -5
            echo ""
        fi
    fi
    
    # Outputs
    if jq -e '.session_summary.outputs' "$report" >/dev/null 2>&1; then
        echo -e "${CYAN}Outputs:${NC}"
        jq -r '.session_summary.outputs[]? // "  None"' "$report" 2>/dev/null | head -5
    fi
}

# === VIEW RECENT SESSIONS ===
recent() {
    local count="${1:-10}"
    
    echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}       ${GREEN}Claude Hours Session History${NC}               ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    local reports=($(ls -t "$NIGHTLY_DIR"/2026-*.json 2>/dev/null | head -"$count"))
    
    if [ ${#reports[@]} -eq 0 ]; then
        echo "No sessions found yet."
        return
    fi
    
    for report in "${reports[@]}"; do
        local date_str=$(basename "$report" .json | sed 's/-/ /3')
        local tasks_done=$(jq -r '.checklist | map(select(.status == "completed")) | length' "$report" 2>/dev/null || echo "?")
        local focus=$(jq -r '.session_summary.focus // "General"' "$report" 2>/dev/null || echo "Unknown")
        local timestamp=$(jq -r '.timestamp' "$report" 2>/dev/null)
        local time_str=$(echo "$timestamp" | cut -d'T' -f2 | cut -d'-' -f1)
        
        echo -e "${GREEN}•${NC} ${MAGENTA}$date_str${NC} at $time_str"
        echo "   Focus: $focus | Tasks: $tasks_done completed"
        echo ""
    done
}

# === WEEKLY SUMMARY ===
weekly() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}       ${GREEN}Claude Hours Weekly Summary${NC}                 ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    local reports=($(ls -t "$NIGHTLY_DIR"/2026-*.json 2>/dev/null | head -7))
    
    if [ ${#reports[@]} -eq 0 ]; then
        echo "No sessions this week."
        return
    fi
    
    local total_tasks=0
    local total_completed=0
    local focus_areas=()
    
    for report in "${reports[@]}"; do
        local tasks=$(jq -r '.checklist | length' "$report" 2>/dev/null || echo 0)
        local completed=$(jq -r '.checklist | map(select(.status == "completed")) | length' "$report" 2>/dev/null || echo 0)
        local focus=$(jq -r '.session_summary.focus // "General"' "$report" 2>/dev/null || echo "Unknown")
        
        total_tasks=$((total_tasks + tasks))
        total_completed=$((total_completed + completed))
        focus_areas+=("$focus")
    done
    
    echo -e "${MAGENTA}This Week's Stats:${NC}"
    echo "  Sessions: ${#reports[@]}"
    echo "  Tasks: $total_completed/$total_tasks completed"
    echo "  Completion Rate: $(( total_tasks > 0 ? (total_completed * 100 / total_tasks) : 0 ))%"
    echo ""
    
    echo -e "${MAGENTA}Focus Areas:${NC}"
    printf '%s\n' "${focus_areas[@]}" | sort -u | sed 's/^/  • /'
    echo ""
    
    echo -e "${MAGENTA}Progress:${NC}"
    echo "  Building momentum... 🚀"
}

# === MAIN ===
case "${1:-today}" in
    today)
        today
        ;;
    recent|history)
        recent "${2:-10}"
        ;;
    weekly|week)
        weekly
        ;;
    help|*)
        echo -e "${CYAN}Claude Hours Session Viewer 🕐${NC}"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  today     - View today's session (default)"
        echo "  recent    - View recent sessions"
        echo "  weekly    - Weekly summary"
        echo "  help      - Show this help"
        ;;
esac
