#!/bin/bash
#
# Claude Hours Session Viewer 🕐
# View and track progress over time with timestamps
#

CLAWD="/Users/jasontang/clawd"
SESSIONS_DIR="$CLAWD/.claude/sessions"
NIGHTLY_DIR="$CLAWD/nightly"

mkdir -p "$SESSIONS_DIR" "$NIGHTLY_DIR"

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Get human-readable date
human_date() {
    date -r "$1" "+%Y-%m-%d %a %H:%M" 2>/dev/null || date -j -f "%s" "$1" "+%Y-%m-%d %H:%M" 2>/dev/null || echo "$1"
}

# === VIEW RECENT SESSIONS ===
view_sessions() {
    local count="${1:-10}"
    
    echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}       ${GREEN}Claude Hours Session History${NC}               ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Get nightly reports sorted by date
    local reports=($(ls -t "$NIGHTLY_DIR"/2026-*.json 2>/dev/null | head -"$count"))
    
    if [ ${#reports[@]} -eq 0 ]; then
        echo "No sessions found yet."
        return
    fi
    
    local i=1
    for report in "${reports[@]}"; do
        local date_str=$(basename "$report" .json | sed 's/-/ /3')
        local tasks_done=$(jq -r '.checklist | map(select(.status == "completed")) | length' "$report" 2>/dev/null || echo "?")
        local focus=$(jq -r '.session_summary.focus // "General"' "$report" 2>/dev/null || echo "Unknown")
        
        echo -e "${GREEN}#$((count - i + 1))${NC} ${MAGENTA}$(human_date $(stat -f "%m" "$report" 2>/dev/null || stat -f "%a" "$report" 2>/dev/null || echo $(date +%s)))${NC}"
        echo "   Focus: $focus"
        echo "   Tasks: $tasks_done completed"
        echo ""
        ((i++))
    done
}

# === VIEW SINGLE SESSION ===
view_session() {
    local date="${1:-today}"
    
    local report=""
    if [ "$date" = "today" ]; then
        report="$NIGHTLY_DIR/$(date +%Y-%m-%d).json"
    else
        report="$NIGHTLY_DIR/${date}.json"
    fi
    
    if [ ! -f "$report" ]; then
        echo "Session not found: $date"
        echo "Available sessions:"
        ls "$NIGHTLY_DIR"/*.json 2>/dev/null | xargs -I{} basename {} .json | tail -5
        return
    fi
    
    local timestamp=$(jq -r '.timestamp' "$report" 2>/dev/null)
    local focus=$(jq -r '.session_summary.focus // "General"' "$report" 2>/dev/null)
    local tasks_total=$(jq -r '.checklist | length' "$report" 2>/dev/null || echo 0)
    local tasks_done=$(jq -r '.checklist | map(select(.status == "completed")) | length' "$report" 2>/dev/null || echo 0)
    
    echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}       ${GREEN}Claude Hours Session Report${NC}                 ${CYAN}╗${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${MAGENTA}📅 Session:${NC} $(echo "$timestamp" | cut -d'T' -f1)"
    echo -e "${MAGENTA}⏰ Time:${NC} $(echo "$timestamp" | cut -d'T' -f2 | cut -d'-' -f1)"
    echo -e "${MAGENTA}🎯 Focus:${NC} $focus"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Tasks: $tasks_done/$tasks_total completed${NC}"
    echo ""
    
    # Show checklist
    echo -e "${CYAN}Checklist:${NC}"
    jq -r '.checklist[] | "  \(.status == "completed" ? "✓" : .status == "in-progress" ? "◐" : "○") \(.task_title)"' "$report" 2>/dev/null | head -10
    echo ""
    
    # Show milestones
    local milestones=$(jq -r '.status_updates | length' "$report" 2>/dev/null || echo 0)
    if [ "$milestones" -gt 0 ]; then
        echo -e "${CYAN}Milestones:${NC}"
        jq -r '.status_updates[] | "  • \(.milestone)"' "$report" 2>/dev/null | head -5
        echo ""
    fi
    
    # Show outputs
    echo -e "${CYAN}Outputs:${NC}"
    jq -r '.session_summary.outputs[]? // "  None"' "$report" 2>/dev/null | head -5
}

# === WEEKLY SUMMARY ===
weekly_summary() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}       ${GREEN}Claude Hours Weekly Summary${NC}                 ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Get last 7 days of reports
    local reports=($(ls -t "$NIGHTLY_DIR"/2026-*.json 2>/dev/null | head -7))
    
    if [ ${#reports[@]} -eq 0 ]; then
        echo "No sessions this week."
        return
    fi
    
    local total_tasks=0
    local total_completed=0
    local skills_learned=()
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
    
    # Unique focus areas
    echo -e "${MAGENTA}Focus Areas:${NC}"
    printf '%s\n' "${focus_areas[@]}" | sort -u | sed 's/^/  • /'
    echo ""
    
    # Calculate week over week
    echo -e "${MAGENTA}Progress:${NC}"
    if [ ${#reports[@]} -ge 2 ]; then
        echo "  Building momentum..."
    fi
    echo "  Keep going! 🚀"
}

# === TRACK NEW SESSION ===
track_session() {
    local focus="$1"
    local tasks="$2"
    
    local timestamp=$(date -Iseconds)
    local date_str=$(date +%Y-%m-%d)
    local report_file="$NIGHTLY_DIR/${date_str}.json"
    
    if [ -f "$report_file" ]; then
        echo "Updating existing session for today..."
    else
        echo "Starting new session: $date_str"
    fi
    
    # Create/update report
    cat > "$report_file" << EOF
{
  "timestamp": "$timestamp",
  "session_summary": {
    "date": "$date_str",
    "focus": "$focus",
    "tasks_planned": $tasks,
    "created": "$(date -Iseconds)"
  }
}
EOF
    
    echo -e "${GREEN}✓${NC} Session tracked: $date_str (Focus: $focus)"
}

# === MAIN ===
case "${1:-help}" in
    today|latest)
        view_session today
        ;;
    session|view)
        view_session "${2:-today}"
        ;;
    recent|history)
        view_sessions "${2:-10}"
        ;;
    weekly|week)
        weekly_summary
        ;;
    track)
        track_session "${2:-General}" "${3:-5}"
        ;;
    help|*)
        echo -e "${CYAN}Claude Hours Session Viewer 🕐${NC}"
        echo ""
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  today      - View today's session"
        echo "  session [date] - View specific session (YYYY-MM-DD)"
        echo "  recent [N]    - View recent N sessions (default: 10)"
        echo "  weekly        - Weekly summary"
        echo "  track <focus> <tasks> - Track new session"
        echo "  help          - Show this help"
        echo ""
        echo "Examples:"
        echo "  $0 today"
        echo "  $0 recent 5"
        echo "  $0 session 2026-01-27"
        echo "  $0 weekly"
        echo "  $0 track \"System Improvements\" 5"
        ;;
esac
