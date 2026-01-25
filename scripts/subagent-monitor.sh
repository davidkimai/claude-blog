#!/bin/bash
# Subagent Activity Monitor for Clawdbot

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

clear

while true; do
    tput cup 0 0
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  📊 CLAWDBOT SUBAGENT ACTIVITY MONITOR${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    date "+%Y-%m-%d %H:%M:%S"
    echo ""
    
    # Get session data via Node.js (requires clawdbot to be accessible)
    node -e "
    const sessions = require('child_process')
        .execSync('curl -s http://localhost:18789/api/sessions?limit=20', {encoding: 'utf8'});
    const data = JSON.parse(sessions);
    
    data.sessions.forEach(s => {
        const isSubagent = s.key.includes('subagent');
        const isMain = s.key.includes(':main:main');
        const icon = isMain ? '👤' : (isSubagent ? '🤖' : '❓');
        const status = s.totalTokens > 0 ? '🟢 Active' : '⏸️  Idle';
        const model = (s.model || 'pending').replace('claude-sonnet-4-5', 'Claude').replace('gemini-3-pro', 'Gemini');
        const tokens = (s.totalTokens / 1000).toFixed(1) + 'k';
        const label = s.label || (isMain ? 'Main Session' : 'Unnamed');
        
        console.log(\`\${icon} \${status}  \${label}\`);
        console.log(\`   Model: \${model}  |  Tokens: \${tokens}\`);
        if (s.updatedAt) {
            const ago = Math.floor((Date.now() - s.updatedAt) / 1000);
            console.log(\`   Last activity: \${ago}s ago\`);
        }
        console.log('');
    });
    " 2>/dev/null || echo -e "${RED}Error: Could not fetch session data${NC}"
    
    echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GRAY}Press Ctrl+C to exit • Refreshes every 3s${NC}"
    
    sleep 3
    tput clear
done
