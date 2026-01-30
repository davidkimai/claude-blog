#!/bin/bash
#===============================================================================
# macos-milestone.sh - Celebratory notifications for Claude milestones
#===============================================================================
#
# Usage:
#   ./macos-milestone.sh --complete "Task description"
#   ./macos-milestone.sh --milestone 5 "Completed 5 tasks"
#   ./macos-milestone.sh --big "Major achievement!"
#   ./macos-milestone.sh --test
#
# Requirements:
#   - macOS (uses osascript for notifications)
#   - Terminal notifications permission (System Settings → Notifications → Terminal)
#
#===============================================================================

set -euo pipefail

# Configuration
CLAUDE_ICON="🤖"
MILESTONE_ICONS=("🎯" "🚀" "✨" "💪" "🔥" "⭐" "🎉" "🏆")

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

#-------------------------------------------------------------------------------
# Send a macOS notification
#-------------------------------------------------------------------------------
send_notification() {
    local title="$1"
    local message="$2"
    local sound="${3:-default}"
    
    # Write AppleScript to temp file and execute
    local script_file="/tmp/claude-notify-$$.scpt"
    
    printf 'display notification "%s" with title "%s" sound name "%s"\n' "$message" "$title" "$sound" > "$script_file"
    
    osascript "$script_file" 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Notification failed. Check Terminal notification permissions.${NC}"
        echo "Go to: System Settings → Notifications → Terminal → Enable"
    }
    
    rm -f "$script_file"
}

#-------------------------------------------------------------------------------
# Celebrate a completion
#-------------------------------------------------------------------------------
celebrate_completion() {
    local task="$1"
    
    echo -e "${GREEN}[OK] Milestone: $task${NC}"
    send_notification "Claude ✓" "$task" "default"
}

#-------------------------------------------------------------------------------
# Celebrate a numbered milestone
#-------------------------------------------------------------------------------
celebrate_milestone_number() {
    local number="$1"
    local description="$2"
    local icon="${MILESTONE_ICONS[$((number % ${#MILESTONE_ICONS[@]}))]}"
    
    echo -e "${BLUE}[#] Milestone #$number: $description${NC}"
    send_notification "Milestone $icon" "$description" "Tink"
}

#-------------------------------------------------------------------------------
# Big celebration for major achievements
#-------------------------------------------------------------------------------
big_celebration() {
    local achievement="$1"
    
    echo -e "${YELLOW}[*] BIG MILESTONE: $achievement${NC}"
    send_notification "⭐⭐⭐ GREAT JOB! ⭐⭐⭐" "$achievement" "Bottle"
}

#-------------------------------------------------------------------------------
# Test the notification system
#-------------------------------------------------------------------------------
test_notifications() {
    echo "Testing macOS notifications..."
    echo "You should see a test notification."
    send_notification "Claude Milestone Tool" "Notifications are working!" "default"
    echo "Test complete. Did you see the notification?"
}

#-------------------------------------------------------------------------------
# Main
#-------------------------------------------------------------------------------
main() {
    local command="${1:-}"
    
    if [[ "$command" == "--help" || "$command" == "-h" || -z "$command" ]]; then
        echo "🤖 Claude Milestone Notifier for macOS"
        echo ""
        echo "Usage: $(basename "$0") <command> [arguments]"
        echo ""
        echo "Commands:"
        echo "  --complete 'Task description'   Send a completion notification"
        echo "  --milestone <n> 'Description'  Celebrate a numbered milestone"
        echo "  --big 'Major achievement'       Big celebration for major wins"
        echo "  --test                          Test notification system"
        echo ""
        echo "Examples:"
        echo "  $(basename "$0") --complete 'Fixed the login bug'"
        echo "  $(basename "$0") --milestone 10 'tasks completed'"
        echo "  $(basename "$0") --big 'Deployed v2.0!'"
        return 0
    fi
    
    case "$command" in
        --complete|-c)
            if [[ -z "${2:-}" ]]; then
                echo "Error: Missing task description" >&2
                exit 1
            fi
            celebrate_completion "$2"
            ;;
        --milestone|-m)
            if [[ -z "${2:-}" || -z "${3:-}" ]]; then
                echo "Error: Missing milestone number or description" >&2
                exit 1
            fi
            celebrate_milestone_number "$2" "$3"
            ;;
        --big|-b)
            if [[ -z "${2:-}" ]]; then
                echo "Error: Missing achievement description" >&2
                exit 1
            fi
            big_celebration "$2"
            ;;
        --test|-t)
            test_notifications
            ;;
        *)
            echo "Unknown command: $command" >&2
            echo "Use --help for usage information" >&2
            exit 1
            ;;
    esac
}

main "$@"
