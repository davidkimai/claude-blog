#!/bin/bash
# System Status Dashboard - One-command full system visibility
#
# Usage: ./scripts/status-dashboard.sh
#
# Description: Displays comprehensive system status including Claude Hours,
# watchdog, memory, notifications, and recent activity.

CLAWD="/Users/jasontang/clawd"
STATE_DIR="$CLAWD/.claude/state"
LOGS_DIR="$CLAWD/.claude/logs"

cd "$CLAWD" || exit 1

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Timestamp
ts() { date '+%Y-%m-%d %H:%M:%S'; }

# Header banner
banner() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                                                          ║"
    echo "║          🦞 Clawd System Status Dashboard                ║"
    echo "║                                                          ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    echo "  Timestamp: $(ts)"
    echo "  Workspace: $CLAWD"
    echo ""
}

# Section divider
section() {
    echo ""
    echo -e "${CYAN}═══ $1 ═══${NC}"
    echo ""
}

# Status indicator
status_indicator() {
    local status=$1
    case $status in
        running|active|enabled|connected|ok|yes)
            echo -e "${GREEN}✅ ${2:-$status}${NC}"
            ;;
        stopped|inactive|disabled|disconnected|error|no)
            echo -e "${RED}❌ ${2:-$status}${NC}"
            ;;
        warning|partial)
            echo -e "${YELLOW}⚠️  ${2:-$status}${NC}"
            ;;
        *)
            echo -e "${BLUE}ℹ️  ${2:-$status}${NC}"
            ;;
    esac
}

# === CLAUDE HOURS STATUS ===
claude_hours_status() {
    section "🌙 Claude Hours (Autonomous Operation)"
    
    if pgrep -f "claude-autonomous-loop" > /dev/null 2>&1; then
        status_indicator "running" "Status: RUNNING"
        
        # Get cycle count if available
        if [[ -f "$STATE_DIR/loop.log" ]]; then
            local cycles=$(grep -c "Cycle" "$STATE_DIR/loop.log" 2>/dev/null || echo "0")
            echo "  Current Cycle: $cycles/116 per night"
        fi
        
        # Get current focus if available
        if [[ -f "$STATE_DIR/current-session.json" ]]; then
            local focus=$(jq -r '.focus // "No focus set"' "$STATE_DIR/current-session.json" 2>/dev/null)
            echo "  Current Focus: $focus"
        fi
    else
        status_indicator "stopped" "Status: STOPPED"
        echo "  Schedule: 9 PM - 8 AM CST"
    fi
    
    # Last session report
    if [[ -f "$CLAWD/nightly/$(date +%Y-%m-%d).json" ]]; then
        echo ""
        echo "  Today's Session:"
        local tasks=$(jq -r '.tasks_completed // 0' "$CLAWD/nightly/$(date +%Y-%m-%d).json" 2>/dev/null)
        echo "    Tasks Completed: $tasks"
    fi
}

# === WATCHDOG STATUS ===
watchdog_status() {
    section "🔧 Self-Healing Watchdog"
    
    if pgrep -f "process-watchdog.*supervise" > /dev/null 2>&1; then
        status_indicator "active" "Status: ACTIVE"
        
        # Check watchdog log for recent activity
        if [[ -f "$LOGS_DIR/watchdog.log" ]]; then
            local last_check=$(tail -1 "$LOGS_DIR/watchdog.log" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}' || echo "Unknown")
            echo "  Last Check: $last_check"
        fi
    else
        status_indicator "inactive" "Status: INACTIVE"
        echo "  Run: ./system/supervisor.sh start"
    fi
}

# === SYSTEM RESOURCES ===
system_resources() {
    section "📊 System Resources"
    
    # Disk usage
    local disk_usage=$(df -h "$CLAWD" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ $disk_usage -gt 90 ]]; then
        status_indicator "error" "Disk Usage: ${disk_usage}% - CRITICAL!"
    elif [[ $disk_usage -gt 80 ]]; then
        status_indicator "warning" "Disk Usage: ${disk_usage}% - High"
    else
        status_indicator "ok" "Disk Usage: ${disk_usage}%"
    fi
    
    # Memory directory size
    if [[ -d "$CLAWD/memory" ]]; then
        local memory_size=$(du -sh "$CLAWD/memory" 2>/dev/null | awk '{print $1}')
        echo "  Memory Files: $memory_size"
    fi
    
    # Skills directory size
    if [[ -d "$CLAWD/skills" ]]; then
        local skills_size=$(du -sh "$CLAWD/skills" 2>/dev/null | awk '{print $1}')
        local skills_count=$(find "$CLAWD/skills" -maxdepth 1 -type d | wc -l | tr -d ' ')
        echo "  Skills: $skills_count directories ($skills_size total)"
    fi
}

# === NOTIFICATIONS ===
notifications_status() {
    section "🔔 Notifications"
    
    # Check Telegram
    if [[ -f "$CLAWD/.env.openrouter" ]]; then
        status_indicator "connected" "Telegram: CONNECTED"
    else
        status_indicator "error" "Telegram: No credentials found"
    fi
    
    # Check last notification
    if [[ -f "$LOGS_DIR/notifications.log" ]]; then
        local last_notif=$(tail -1 "$LOGS_DIR/notifications.log" 2>/dev/null)
        if [[ -n "$last_notif" ]]; then
            echo "  Last Notification: $(echo $last_notif | cut -c1-50)..."
        fi
    fi
}

# === RECENT ACTIVITY ===
recent_activity() {
    section "📝 Recent Activity"
    
    local count=0
    
    # Check git commits (last 5)
    echo "  Recent Commits:"
    git log --oneline -5 2>/dev/null | while read line; do
        echo "    • $line"
    done
    
    # Check memory updates
    echo ""
    echo "  Recent Memory Updates:"
    ls -lt memory/*.md 2>/dev/null | head -3 | while read -r line; do
        local file=$(echo $line | awk '{print $9}')
        local date=$(echo $line | awk '{print $6, $7, $8}')
        echo "    • $(basename $file) - $date"
    done
    
    # Check system intel
    if [[ -f "$CLAWD/system/intel/intel-$(date +%Y-%m-%d).md" ]]; then
        echo ""
        echo "  Morning Intel:"
        status_indicator "ok" "Generated at 7:00 AM today"
    fi
}

# === HEALTH CHECKS ===
health_checks() {
    section "🏥 Health Checks"
    
    local checks_passed=0
    local checks_failed=0
    
    # Core files
    if [[ -f "AGENTS.md" && -f "SOUL.md" && -f "MEMORY.md" ]]; then
        status_indicator "ok" "Core files present"
        ((checks_passed++))
    else
        status_indicator "error" "Missing core files"
        ((checks_failed++))
    fi
    
    # Memory files
    if [[ -d "memory" && -f "memory/$(date +%Y-%m-%d).md" ]]; then
        status_indicator "ok" "Today's memory file exists"
        ((checks_passed++))
    else
        status_indicator "warning" "Today's memory file missing"
    fi
    
    # Git repository
    if git rev-parse --git-dir > /dev/null 2>&1; then
        status_indicator "ok" "Git repository healthy"
        ((checks_passed++))
    else
        status_indicator "error" "Git repository issue"
        ((checks_failed++))
    fi
    
    # Cron jobs
    if crontab -l 2>/dev/null | grep -q "claude-hours-morning-intel"; then
        status_indicator "ok" "Cron jobs installed"
        ((checks_passed++))
    else
        status_indicator "warning" "Morning intel cron missing"
    fi
    
    # Skills loaded
    if [[ -d "skills" ]]; then
        status_indicator "ok" "Skills directory accessible"
        ((checks_passed++))
    else
        status_indicator "error" "Skills directory missing"
        ((checks_failed++))
    fi
    
    echo ""
    echo "  Summary: $checks_passed passed, $checks_failed failed"
}

# === QUICK ACTIONS ===
quick_actions() {
    section "🚀 Quick Actions"
    
    echo "  [1] View detailed logs      → tail -f .claude/logs/*.log"
    echo "  [2] Check memory files      → ls -lt memory/*.md | head -5"
    echo "  [3] Run health check        → ./scripts/first-run.sh"
    echo "  [4] View Claude Hours       → ./scripts/claude-hours-viewer.sh today"
    echo "  [5] Restart supervisor      → ./system/supervisor.sh restart"
    echo "  [6] Check git status        → git status"
    echo "  [7] Browse skills           → cat skills/INDEX.md"
    echo "  [8] Read today's memory     → cat memory/\$(date +%Y-%m-%d).md"
    echo ""
}

# === SYSTEM SUMMARY ===
system_summary() {
    section "📋 System Summary"
    
    local status="HEALTHY"
    local color=$GREEN
    
    # Determine overall status
    if ! pgrep -f "process-watchdog" > /dev/null 2>&1; then
        status="DEGRADED"
        color=$YELLOW
    fi
    
    local disk_usage=$(df -h "$CLAWD" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ $disk_usage -gt 90 ]]; then
        status="CRITICAL"
        color=$RED
    fi
    
    echo -e "${color}  Overall Status: $status${NC}"
    echo ""
    
    # Key metrics
    local branch=$(git branch --show-current 2>/dev/null || echo "unknown")
    local uncommitted=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
    
    echo "  Git Branch: $branch"
    if [[ $uncommitted -gt 0 ]]; then
        echo "  Uncommitted Changes: $uncommitted"
    else
        echo "  Working Directory: Clean ✓"
    fi
    
    # Model info
    echo ""
    echo "  Primary Model: Minimax M2.1"
    echo "  Workspace: /Users/jasontang/clawd"
    echo "  Owner: Jason Tang (Jace)"
    echo "  Timezone: CST (America/Chicago)"
}

# === MAIN ===
main() {
    banner
    claude_hours_status
    watchdog_status
    system_resources
    notifications_status
    recent_activity
    health_checks
    quick_actions
    system_summary
    
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                  Dashboard Complete                      ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
}

# Run
main
