#!/bin/bash
# Scan available AI research skills

echo "🔬 Scanning AI research skills library..."

# List relevant skills
echo "=== Research Skills Available ==="
ls /Users/jasontang/.nvm/versions/node/v23.8.0/lib/node_modules/clawdbot/skills/ | grep -E "research|ai|analyze|summarize|search" || echo "No specific research skills found"

# Check for AI research-related skills
echo ""
echo "=== Applicable Skills for AI Research ==="
for skill in ai-researcher documenter analyst fact-checker blogwatcher summarize web-search; do
    if [ -d "/Users/jasontang/.nvm/versions/node/v23.8.0/lib/node_modules/clawdbot/skills/$skill" ]; then
        echo "✅ $skill - available"
    else
        echo "⚪ $skill - not installed"
    fi
done

# Check installed skill count
echo ""
echo "=== Total Skills Installed ==="
ls /Users/jasontang/.nvm/versions/node/v23.8.0/lib/node_modules/clawdbot/skills/ | wc -l

echo ""
echo "✅ Skills scan complete - ready for research experiments"
