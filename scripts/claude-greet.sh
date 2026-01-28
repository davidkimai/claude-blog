#!/bin/bash
#
# Claude Greet Script
# Runs on session start to personalize the experience
#

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get current hour in CST
HOUR=$(TZ='America/Chicago' date +%H)

# Determine greeting based on time
if [ "$HOUR" -ge 5 ] && [ "$HOUR" -lt 12 ]; then
    GREETING="Good morning"
    EMOJI="🌅"
elif [ "$HOUR" -ge 12 ] && [ "$HOUR" -lt 17 ]; then
    GREETING="Good afternoon"
    EMOJI="☀️"
elif [ "$HOUR" -ge 17 ] && [ "$HOUR" -lt 21 ]; then
    GREETING="Good evening"
    EMOJI="🌆"
else
    GREETING="Good night"
    EMOJI="🌙"
fi

# Check if it's Claude Hours (9pm-8am CST)
if [ "$HOUR" -ge 21 ] || [ "$HOUR" -lt 8 ]; then
    CLAUDE_HOURS=true
else
    CLAUDE_HOURS=false
fi

# Clear screen for fresh start
clear

# Display welcome
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  ${GREEN}$GREETING${NC}! ${EMOJI}                                        ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🏠 Home:${NC} /Users/jasontang/clawd"
echo -e "${BLUE}🧠 Context:${NC} CLAUDE.md (read first)"
echo ""

# Show Claude Hours status
if [ "$CLAUDE_HOURS" = true ]; then
    echo -e "${YELLOW}🌙 Claude Hours Active (9pm-8am CST)${NC}"
    echo -e "   ${CYAN}Autonomous operation in progress...${NC}"
else
    echo -e "${BLUE}☀️ Collaborative hours${NC}"
    echo -e "   ${CYAN}Ready to work together.${NC}"
fi

echo ""
echo -e "${BLUE}📋 Quick commands:${NC}"
echo -e "   ${GREEN}CLAUDE.md${NC}  - Essential context"
echo -e "   ${GREEN}memory/${NC}    - Session continuity"
echo -e "   ${GREEN}skills/${NC}    - Available capabilities"
echo -e "   ${GREEN}scripts/${NC}   - Utilities"
echo ""
echo -e "${YELLOW}🎯 Let's make today productive.${NC}"
echo ""

# Optional: Show pending tasks from nightly folder
if [ -d "$HOME/.clawdbot/memory/nightly" ]; then
    LATEST_NIGHTLY=$(ls -t "$HOME/.clawdbot/memory/nightly"/*.json 2>/dev/null | head -1)
    if [ -n "$LATEST_NIGHTLY" ]; then
        echo -e "${BLUE}📊 Last session:${NC}"
        jq -r '.checklist[] | "   \(.status): \(.task_title)"' "$LATEST_NIGHTLY" 2>/dev/null || true
    fi
fi

echo ""
