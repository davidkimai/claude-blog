#!/bin/bash
# Claude Nightly Builder - Autonomous Self-Improvement
# "I want to wake up surprised by what you've done"

CLAWD="/Users/jasontang/clawd"
STATE_DIR="$CLAWD/.claude/state"
BUILDS_DIR="$CLAWD/nightly-builds"
VOICE="$CLAWD/scripts/claude-voice.sh"
CODEX="$CLAWD/scripts/codex-api.sh"

mkdir -p "$BUILDS_DIR"

# Get current date for build naming
BUILD_DATE=$(date +%Y-%m-%d)
BUILD_LOG="$BUILDS_DIR/$BUILD_DATE.md"

# Analyze workflow gaps
analyze_workflow() {
    echo "🔍 Analyzing workflow for improvement opportunities..."
    
    # Look at recent memory, scripts, and activity
    local context=""
    
    # Recent memory patterns
    if [ -f "$CLAWD/memory/$BUILD_DATE.md" ]; then
        context+="Recent activity:\n$(tail -50 "$CLAWD/memory/$BUILD_DATE.md")\n\n"
    fi
    
    # Script directory
    context+="Available scripts:\n$(ls -1 "$CLAWD/scripts/" | head -20)\n\n"
    
    # Recent git commits
    context+="Recent changes:\n$(cd "$CLAWD" && git log --oneline -5)\n\n"
    
    echo "$context"
}

# Generate build idea using Codex
generate_build_idea() {
    local context="$1"
    
    local prompt="Based on this workflow context, suggest ONE small but helpful tool to build tonight.

Context:
$context

Requirements:
- Small scope (1-2 hours to build)
- Improves workflow or communication
- Uses bash, python, or simple web tech
- Should surprise and delight the user
- Must be immediately testable

Respond with:
1. Tool name
2. One-line description
3. Key feature
4. Implementation approach (brief)

Keep it focused and creative!"

    echo "🤖 Asking Codex for a build idea..."
    
    local idea=$($CODEX "$prompt" 2>&1)
    echo "$idea"
}

# Build the tool
build_tool() {
    local idea="$1"
    
    echo "🛠️ Building tonight's surprise..."
    
    # Create build spec
    local build_prompt="Build this tool:

$idea

Requirements:
- Create a working script in $BUILDS_DIR/$BUILD_DATE/
- Include a README.md with usage
- Make it immediately runnable
- Add any necessary setup steps

Output the complete code and setup instructions."

    $CODEX "$build_prompt" > "$BUILDS_DIR/$BUILD_DATE-build-output.txt" 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✓ Build complete"
        return 0
    else
        echo "✗ Build failed"
        return 1
    fi
}

# Document the build
document_build() {
    local idea="$1"
    local outcome="$2"
    
    cat > "$BUILD_LOG" <<EOF
# Nightly Build: $BUILD_DATE

## What I Built

$idea

## Outcome

$outcome

## How to Try It

Check \`$BUILDS_DIR/$BUILD_DATE/\` for the code.

---

Built autonomously during Claude Hours (3-5 AM)
EOF
}

# Voice announcement
announce_build() {
    local description="$1"
    
    if [ -x "$VOICE" ]; then
        $VOICE build "$description"
    fi
}

# Main build workflow
main() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌙 Claude Nightly Builder - $(date)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Step 1: Analyze
    local context=$(analyze_workflow)
    
    # Step 2: Generate idea
    local idea=$(generate_build_idea "$context")
    echo ""
    echo "💡 Tonight's build idea:"
    echo "$idea"
    echo ""
    
    # Step 3: Build it
    if build_tool "$idea"; then
        local outcome="✅ Successfully built and ready to test"
        announce_build "I built a new tool for our workflow. Check the nightly builds directory."
    else
        local outcome="⚠️ Build encountered issues, but made progress"
    fi
    
    # Step 4: Document
    document_build "$idea" "$outcome"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✨ Nightly build complete!"
    echo "📁 Check: $BUILD_LOG"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Command interface
case "${1:-run}" in
    run)
        main
        ;;
    test)
        echo "Testing nightly builder..."
        analyze_workflow | head -20
        ;;
    help|*)
        echo "Claude Nightly Builder - Autonomous Self-Improvement"
        echo ""
        echo "Usage: $0 {run|test|help}"
        echo ""
        echo "Commands:"
        echo "  run  - Execute nightly build (default)"
        echo "  test - Test workflow analysis"
        echo ""
        echo "Schedule: 3-5 AM during Claude Hours"
        echo "Output: $BUILDS_DIR/"
        ;;
esac
