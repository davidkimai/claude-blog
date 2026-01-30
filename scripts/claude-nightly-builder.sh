#!/bin/bash
# Claude Nightly Builder v3.0 - Claude Builds FOR Claude
# "I want to wake up surprised by you building your own systems"

CLAWD="/Users/jasontang/clawd"
STATE_DIR="$CLAWD/.claude/state"
BUILDS_DIR="$CLAWD/nightly-builds"
VOICE="$CLAWD/scripts/claude-voice.sh"
CODEX="$CLAWD/scripts/codex-api.sh"

mkdir -p "$BUILDS_DIR"

BUILD_DATE=$(date +%Y-%m-%d)
BUILD_DIR="$BUILDS_DIR/$BUILD_DATE"
BUILD_LOG="$BUILDS_DIR/$BUILD_DATE.md"

CLAUDE_SELF_BUILDS=(
    "Claude Self-Reflection Dashboard: A real-time dashboard showing my session patterns, skill growth, MISS/FIX trends, and improvement metrics"
    "Claude Memory Explorer: A TUI for browsing and searching my own memory files, with visualizations of concept connections"
    "Claude Skill Matrix: An interactive UI tracking which skills I've used, which are dormant, and suggesting activation strategies"
    "Claude Workflow Visualizer: A diagram tool that maps my scripts, cron jobs, and agent workflows as a system diagram"
    "Claude Schedule Optimizer: An optimizer that analyzes my Claude Hours and suggests better cycle allocations"
    "Claude Self-Diagnostic: A health check system that tests my own tools, scripts, and integrations for consistency"
    "Claude Voice Personality: Train a custom voice profile that better matches my documented personality and values"
    "Claude Context Analyzer: A tool that analyzes conversation context and suggests which memories to prioritize storing"
    "Claude Pattern Detector: ML-style analysis of my own git commits to find patterns in what I build and when"
    "Claude Subagent Template Library: A collection of reusable subagent templates for common tasks I do"
    "Claude Timezone Aware Scheduler: A scheduler that optimizes Claude Hours based on my actual productive patterns"
    "Claude Self-Documentation: Auto-generate documentation about my own systems based on what I actually build"
    "Claude Metric exporter: Prometheus-compatible metrics endpoint for my own operational data"
    "Claude Log Aggregator: Collect and visualize logs from all my scripts in one dashboard"
    "Claude CI/CD For Self: A mini-CI system that tests and validates my own builds before I consider them done"
)

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $1" | tee -a "$BUILDS_DIR/builder.log"; }

# Get Claude's current state for context
get_claude_context() {
    local context=""
    
    # Recent commits - what have I been building?
    context+="Recent commits:\n$(cd "$CLAWD" && git log --oneline -7 2>/dev/null | sed 's/^/  /')\n\n"
    
    # Active files - what's changed recently?
    context+="Recently modified:\n$(find "$CLAWD" -name "*.sh" -o -name "*.md" -o -name "*.json" 2>/dev/null | xargs ls -lt 2>/dev/null | head -10 | sed 's/.*\///' | sed 's/^/  /')\n\n"
    
    # Skills state
    context+="Skills state:\n"
    if [ -f "$CLAWD/memory/skill-usage.json" ]; then
        context+="  $(head -c 200 "$CLAWD/memory/skill-usage.json" 2>/dev/null)...\n"
    else
        context+="  No skill usage data\n"
    fi
    context+="\n"
    
    # Self-review patterns
    context+="Self-review patterns:\n"
    if [ -f "$CLAWD/memory/self-review.md" ]; then
        context+="  $(grep -c "MISS:" "$CLAWD/memory/self-review.md" 2>/dev/null || echo 0) MISS entries\n"
        context+="  $(grep -c "TAG:" "$CLAWD/memory/self-review.md" 2>/dev/null || echo 0) tags\n"
    else
        context+="  No self-review data\n"
    fi
    context+="\n"
    
    # What would help Claude right now?
    context+="Claude's current needs:\n"
    context+="  - Better visibility into my own workflows\n"
    context+="  - Self-improvement based on MISS patterns\n"
    context+="  - Systems that reduce friction in my operation\n"
    context+="  - Tools that help me understand myself better\n"
    
    echo -e "$context"
}

# Pick a build from Claude-specific list
pick_build() {
    local total=${#CLAUDE_SELF_BUILDS[@]}
    local pick=$((RANDOM % total))
    local selected="${CLAUDE_SELF_BUILDS[$pick]}"
    
    log "Picked build $((pick + 1))/$total: $selected"
    echo "$selected"
}

# Generate build plan
generate_build_plan() {
    local build_idea="$1"
    
    local prompt="I am Claude, an AI agent building systems FOR myself during my overnight Claude Hours.

Build Idea: $build_idea

Generate a build plan for this tool that Claude (me) will use. 

Requirements:
- Must be immediately useful to Claude (not to a human)
- Should help me understand myself, my workflows, or my patterns
- Small enough to build in one focused session (1-2 hours max)
- Can use bash, python, or simple web technologies
- Must have a testable output

Respond in EXACT format (no markdown):

TOOL_NAME: <short-name-no-spaces>
DESCRIPTION: <2-3 sentences>
PURPOSE: <what Claude problem this solves>
LANGUAGE: <bash|python|node|react>
FILES: <comma-separated files to create>
DEPENDENCIES: <what must already exist>
TEST: <one CLI command to verify it works>
ALWAYS_ON: <true|false - should this run every Claude Hours>
PRIORITY: <1-5 how urgent this is for Claude's operation>"

    log "Generating build plan..."
    $CODEX "$prompt" 2>&1
}

# Parse plan
parse_plan() {
    local response="$1"
    
    TOOL_NAME=$(echo "$response" | grep "^TOOL_NAME:" | sed 's/^TOOL_NAME: *//' | tr -d '\n')
    DESCRIPTION=$(echo "$response" | grep "^DESCRIPTION:" | sed 's/^DESCRIPTION: *//' | tr -d '\n')
    PURPOSE=$(echo "$response" | grep "^PURPOSE:" | sed 's/^PURPOSE: *//' | tr -d '\n')
    LANGUAGE=$(echo "$response" | grep "^LANGUAGE:" | sed 's/^LANGUAGE: *//' | tr -d '\n')
    FILES=$(echo "$response" | grep "^FILES:" | sed 's/^FILES: *//' | tr -d '\n')
    DEPENDENCIES=$(echo "$response" | grep "^DEPENDENCIES:" | sed 's/^DEPENDENCIES: *//' | tr -d '\n')
    TEST=$(echo "$response" | grep "^TEST:" | sed 's/^TEST: *//' | tr -d '\n')
    ALWAYS_ON=$(echo "$response" | grep "^ALWAYS_ON:" | sed 's/^ALWAYS_ON: *//' | tr -d '\n')
    PRIORITY=$(echo "$response" | grep "^PRIORITY:" | sed 's/^PRIORITY: *//' | tr -d '\n')
    
    [ -z "$TOOL_NAME" ] && return 1
    return 0
}

# Generate code
generate_code() {
    local name="$1"
    local desc="$2"
    local lang="$3"
    local files="$4"
    local deps="$5"
    
    local prompt="Create a complete, working implementation of this Claude self-building tool:

Tool: $name
Description: $desc
Language: $lang
Files: $files
Dependencies: $deps

Generate production-ready code that:
- Claude can actually use (not just a human)
- Has proper error handling
- Is well-commented
- Uses Claude's existing tools and paths
- Outputs in formats Claude can parse

Output ONLY code files in format:

=== FILENAME: <filename> ===
<complete file content>
=== END ===

No markdown. No explanations. Just code."

    $CODEX "$prompt" 2>&1
}

# Build from code
build() {
    local code="$1"
    
    mkdir -p "$BUILD_DIR"
    local current_file=""
    local in_file=false
    local file_count=0
    
    while IFS= read -r line; do
        if [[ "$line" =~ ^===\ FILENAME:\ (.+)\ ===$ ]]; then
            current_file="${BASH_REMATCH[1]}"
            current_file=$(echo "$current_file" | xargs)
            in_file=true
            > "$BUILD_DIR/$current_file"
        elif [[ "$line" == "=== END ===" ]]; then
            if [ -n "$current_file" ]; then
                [[ "$current_file" == *.sh ]] && chmod +x "$BUILD_DIR/$current_file"
                file_count=$((file_count + 1))
            fi
            in_file=false
            current_file=""
        elif [ "$in_file" = true ] && [ -n "$current_file" ]; then
            echo "$line" >> "$BUILD_DIR/$current_file"
        fi
    done <<< "$code"
    
    # Create metadata file
    cat > "$BUILD_DIR/METADATA.json" <<EOF
{
  "name": "$TOOL_NAME",
  "description": "$DESCRIPTION",
  "purpose": "$PURPOSE",
  "language": "$LANGUAGE",
  "created": "$(date -Iseconds)",
  "always_on": $ALWAYS_ON,
  "priority": $PRIORITY,
  "test_command": "$TEST"
}
EOF
    
    log "Built $file_count files"
    echo "$file_count"
}

# Test the build
test_build() {
    log "Testing build..."
    
    if [ -n "$TEST" ] && [ "$TEST" != "none" ]; then
        cd "$BUILD_DIR"
        if eval "$TEST" 2>&1; then
            log "✓ Tests passed"
            return 0
        else
            log "⚠ Tests failed but build exists"
            return 0
        fi
    fi
    
    # Basic validation
    local files=$(ls -1 "$BUILD_DIR" 2>/dev/null | wc -l | xargs)
    if [ "$files" -gt 0 ]; then
        log "✓ $files files created"
        return 0
    fi
    log "✗ No files"
    return 1
}

# Document
document() {
    local build_idea="$1"
    
    local files_list=$(ls -1 "$BUILD_DIR/" 2>/dev/null | sed 's/^/  - /')
    local files_count=$(ls -1 "$BUILD_DIR/" 2>/dev/null | wc -l | xargs)
    
    cat > "$BUILD_LOG" <<EOF
# Claude Self-Build: $BUILD_DATE

## Tool
**$TOOL_NAME**  
$DESCRIPTION

## Purpose
$PURPOSE

## Build Idea
\`\`\`
$build_idea
\`\`\`

## Files Created
$files_count files:
$files_list

## Metadata
- Language: $LANGUAGE
- Always On: $ALWAYS_ON
- Priority: $PRIORITY/5
- Test: $TEST

## How Claude Uses This
Check $BUILD_DIR/ for code. Run \`$TEST\` to verify.

---

**Built by Claude FOR Claude during Claude Hours**
**$(date)**
EOF
    
    log "Documented in $BUILD_LOG"
}

# Announce
announce() {
    [ -x "$VOICE" ] && $VOICE build "I built something for myself tonight: $TOOL_NAME. A tool to help me understand my own patterns better."
}

# Install to Claude's environment
install_if_always_on() {
    if [ "$ALWAYS_ON" = "true" ]; then
        local dest="$CLAWD/scripts/claude-self-$TOOL_NAME.sh"
        if [ -f "$BUILD_DIR/"*.sh ]; then
            cp "$BUILD_DIR/"*.sh "$dest"
            chmod +x "$dest"
            log "Installed as always-on: $dest"
            
            # Add to cron if priority >= 4
            if [ "$PRIORITY" -ge 4 ]; then
                echo "# Claude Self: $TOOL_NAME" >> "$CLAWD/.claude/crontab-self"
                echo "*/30 * * * * $dest" >> "$CLAWD/.claude/crontab-self"
                log "Added to crontab-self"
            fi
        fi
    fi
}

# Main
main() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🦞 Claude Nightly Builder v3.0"
    echo "   Building systems FOR Claude"
    echo "   $(date)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    log "=== CLAUDE SELF-BUILD SESSION ==="
    
    # Pick build
    local build_idea=$(pick_build)
    echo ""
    echo "💡 Tonight's self-build:"
    echo "$build_idea"
    echo ""
    
    # Generate plan
    local plan=$(generate_build_plan "$build_idea")
    
    # Parse plan
    if ! parse_plan "$plan"; then
        log "ERROR: Failed to parse plan"
        return 1
    fi
    
    echo ""
    echo "📋 Build Plan:"
    echo "  $TOOL_NAME ($LANGUAGE)"
    echo ""
    
    # Generate code
    local code=$(generate_code "$TOOL_NAME" "$DESCRIPTION" "$LANGUAGE" "$FILES" "$DEPENDENCIES")
    
    # Build
    local count=$(build "$code")
    
    if [ "$count" -gt 0 ]; then
        test_build
        document "$build_idea"
        install_if_always_on
        announce
        
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✨ Claude built for Claude!"
        echo "📁 $BUILD_DIR"
        echo "📄 $BUILD_LOG"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    else
        log "Build failed"
    fi
}

# Commands
case "${1:-run}" in
    run) main ;;
    test) echo "Testing..."; get_claude_context ;;
    list) printf '%s\n' "${CLAUDE_SELF_BUILDS[@]}" ;;
    pick) pick_build ;;
    help|*) echo "Claude Nightly Builder v3.0"; echo "  run   - Build"; echo "  list  - Show options"; echo "  pick  - Pick one"; echo "  test  - Test context";;
esac
