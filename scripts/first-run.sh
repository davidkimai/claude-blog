#!/bin/bash
# First-run setup for new Claude instances
#
# Usage: ./scripts/first-run.sh
#
# Description: Verifies workspace setup, checks required files,
# and guides new Claude instances through initial configuration.

CLAWD="/Users/jasontang/clawd"
cd "$CLAWD" || exit 1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ASCII art banner
banner() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║         🦞 Welcome to Clawd - Your AI Workspace            ║"
    echo "║                  First-Run Setup Check                     ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
}

# Check if a file exists
check_file() {
    local file=$1
    local description=$2
    
    if [[ -f "$file" ]]; then
        echo -e "${GREEN}✅${NC} $description ($file)"
        return 0
    else
        echo -e "${RED}❌${NC} $description ($file) ${RED}MISSING!${NC}"
        return 1
    fi
}

# Check if a directory exists
check_dir() {
    local dir=$1
    local description=$2
    
    if [[ -d "$dir" ]]; then
        echo -e "${GREEN}✅${NC} $description ($dir)"
        return 0
    else
        echo -e "${RED}❌${NC} $description ($dir) ${RED}MISSING!${NC}"
        return 1
    fi
}

# Display section header
section() {
    echo ""
    echo -e "${BLUE}═══ $1 ═══${NC}"
    echo ""
}

# Main setup check
main() {
    banner
    
    local errors=0
    
    # === CORE FILES ===
    section "Core Context Files"
    
    check_file "QUICKSTART.md" "Quick Start Guide" || ((errors++))
    check_file "AGENTS.md" "Operating Manual" || ((errors++))
    check_file "SOUL.md" "Deep Identity & Values" || ((errors++))
    check_file "IDENTITY.md" "Identity Template" || ((errors++))
    check_file "USER.md" "User Context" || ((errors++))
    check_file "MEMORY.md" "Long-term Memory" || ((errors++))
    check_file "TOOLS.md" "Tool Configurations" || ((errors++))
    check_file "HEARTBEAT.md" "Proactive Tasks" || ((errors++))
    
    # === DIRECTORIES ===
    section "Key Directories"
    
    check_dir "memory" "Memory Files" || ((errors++))
    check_dir ".presence" "Personality Files" || ((errors++))
    check_dir "scripts" "Automation Scripts" || ((errors++))
    check_dir "skills" "Agent Skills" || ((errors++))
    check_dir "system" "System Management" || ((errors++))
    check_dir "docs" "Documentation" || ((errors++))
    
    # === PRESENCE FILES ===
    section "Personality & Presence"
    
    check_file ".presence/preferences.json" "Preferences" || ((errors++))
    check_file ".presence/personality-notes.md" "Personality Notes" || ((errors++))
    check_file ".presence/presence.md" "Presence Manifesto" || ((errors++))
    
    # === SCRIPT INDEX ===
    section "Script Organization"
    
    check_file "scripts/README.md" "Scripts Index" || ((errors++))
    
    # === SKILL INDEX ===
    section "Skill Catalog"
    
    check_file "skills/INDEX.md" "Skills Index" || ((errors++))
    
    # === SYSTEM SCRIPTS ===
    section "System Scripts"
    
    check_file "system/supervisor.sh" "System Supervisor" || ((errors++))
    check_file "system/watchdog/process-watchdog.sh" "Process Watchdog" || ((errors++))
    
    # === TODAY'S MEMORY ===
    section "Memory Status"
    
    TODAY=$(date +%Y-%m-%d)
    YESTERDAY=$(date -v-1d +%Y-%m-%d 2>/dev/null || date -d "yesterday" +%Y-%m-%d)
    
    check_file "memory/$TODAY.md" "Today's Memory"
    if [[ ! -f "memory/$TODAY.md" ]]; then
        echo -e "   ${YELLOW}ℹ️  Creating today's memory file...${NC}"
        cat > "memory/$TODAY.md" << EOF
# Daily Memory: $TODAY

## Durable Memories (for long-term storage)

### First Session
- New Claude instance started
- Ran first-run setup check
- Workspace verified

## Forgetting (temporary context)
- Initial setup details
EOF
        echo -e "   ${GREEN}✅ Created memory/$TODAY.md${NC}"
    fi
    
    check_file "memory/$YESTERDAY.md" "Yesterday's Memory"
    
    # === DISK SPACE ===
    section "System Resources"
    
    local disk_usage=$(df -h "$CLAWD" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ $disk_usage -gt 90 ]]; then
        echo -e "${RED}⚠️${NC}  Disk usage: ${disk_usage}% ${RED}CRITICAL!${NC}"
        ((errors++))
    elif [[ $disk_usage -gt 80 ]]; then
        echo -e "${YELLOW}⚠️${NC}  Disk usage: ${disk_usage}% ${YELLOW}WARNING${NC}"
    else
        echo -e "${GREEN}✅${NC} Disk usage: ${disk_usage}%"
    fi
    
    # === GIT STATUS ===
    section "Git Repository"
    
    if git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} Git repository initialized"
        
        local branch=$(git branch --show-current)
        echo -e "   Branch: ${BLUE}$branch${NC}"
        
        local uncommitted=$(git status --porcelain | wc -l | tr -d ' ')
        if [[ $uncommitted -gt 0 ]]; then
            echo -e "   ${YELLOW}ℹ️  $uncommitted uncommitted changes${NC}"
        else
            echo -e "   ${GREEN}✅ Working directory clean${NC}"
        fi
        
        local remote=$(git config --get remote.origin.url)
        if [[ -n "$remote" ]]; then
            echo -e "   Remote: ${BLUE}$remote${NC}"
        fi
    else
        echo -e "${RED}❌${NC} Not a git repository"
        ((errors++))
    fi
    
    # === CRON JOBS ===
    section "Scheduled Jobs"
    
    if crontab -l 2>/dev/null | grep -q "claude-hours-morning-intel"; then
        echo -e "${GREEN}✅${NC} Morning intel cron job installed"
    else
        echo -e "${YELLOW}⚠️${NC}  Morning intel cron job not found"
        echo -e "   Run: ./scripts/install_cron_daily_intel.sh"
    fi
    
    # === SUMMARY ===
    section "Summary"
    
    if [[ $errors -eq 0 ]]; then
        echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║   ✅ All Checks Passed!               ║${NC}"
        echo -e "${GREEN}║   Workspace is ready to use.         ║${NC}"
        echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${BLUE}📚 Next Steps:${NC}"
        echo ""
        echo "   1. Read QUICKSTART.md for orientation"
        echo "   2. Read AGENTS.md for operating manual"
        echo "   3. Check memory/$TODAY.md for today's context"
        echo "   4. Review HEARTBEAT.md for proactive tasks"
        echo ""
        echo -e "${BLUE}🚀 Quick Commands:${NC}"
        echo ""
        echo "   ./scripts/status-dashboard.sh    # System status"
        echo "   cat memory/$TODAY.md             # Today's memory"
        echo "   cat MEMORY.md                    # Long-term memory"
        echo "   cat skills/INDEX.md              # Browse skills"
        echo ""
        return 0
    else
        echo -e "${RED}╔══════════════════════════════════════╗${NC}"
        echo -e "${RED}║   ❌ $errors Issue(s) Found               ║${NC}"
        echo -e "${RED}║   Please address issues above.       ║${NC}"
        echo -e "${RED}╚══════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}🔧 Common Fixes:${NC}"
        echo ""
        echo "   - Missing files: Check git status, may need to pull"
        echo "   - Missing directories: Create with mkdir -p <dir>"
        echo "   - Git issues: Ensure you're in the clawd workspace"
        echo ""
        return 1
    fi
}

# Run main function
main
