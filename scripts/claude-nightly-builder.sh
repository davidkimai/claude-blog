#!/bin/bash
# Claude Nightly Builder v2.0 - Actually Builds Things
# "I want to wake up surprised by what you've done"

CLAWD="/Users/jasontang/clawd"
STATE_DIR="$CLAWD/.claude/state"
BUILDS_DIR="$CLAWD/nightly-builds"
VOICE="$CLAWD/scripts/claude-voice.sh"
CODEX="$CLAWD/scripts/codex-api.sh"

mkdir -p "$BUILDS_DIR"

# Get current date for build naming
BUILD_DATE=$(date +%Y-%m-%d)
BUILD_DIR="$BUILDS_DIR/$BUILD_DATE"
BUILD_LOG="$BUILDS_DIR/$BUILD_DATE.md"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $1" | tee -a "$BUILDS_DIR/builder.log"; }

# Analyze workflow gaps
analyze_workflow() {
    log "Analyzing workflow..."
    
    local context=""
    
    # Recent memory patterns
    if [ -f "$CLAWD/memory/$BUILD_DATE.md" ]; then
        context+="Recent activity:\n$(tail -30 "$CLAWD/memory/$BUILD_DATE.md")\n\n"
    fi
    
    # Script directory
    context+="Scripts available:\n$(ls -1 "$CLAWD/scripts/" | head -15)\n\n"
    
    # Recent git commits
    context+="Recent changes:\n$(cd "$CLAWD" && git log --oneline -5 2>/dev/null)\n\n"
    
    # Skills
    context+="Skills installed:\n$(ls -1 "$CLAWD/skills/" 2>/dev/null | head -10)\n\n"
    
    echo -e "$context"
}

# Generate build idea using Codex
generate_build_idea() {
    local context="$1"
    
    local prompt="Based on this workflow context, suggest ONE small but immediately useful tool/script to build tonight.

Context:
$context

Requirements:
- Small scope (can be built in one focused session)
- Improves workflow, automates something tedious, or adds new capability
- Uses bash, python, or simple Node.js
- Should be genuinely helpful (not a toy)
- Must be immediately testable

Respond in this EXACT format (no markdown, no extra text):

TOOL_NAME: <short-name-no-spaces>
DESCRIPTION: <one sentence>
PURPOSE: <what problem it solves>
LANGUAGE: <bash|python|node>
FILES: <comma-separated list of files to create>
IMPLEMENTATION: <step-by-step bullet points>

Keep it focused and practical!"

    log "Asking Codex for build idea..."
    
    $CODEX "$prompt" 2>&1
}

# Parse build spec from Codex response
parse_build_spec() {
    local response="$1"
    
    # Extract key fields using grep
    TOOL_NAME=$(echo "$response" | grep "^TOOL_NAME:" | sed 's/^TOOL_NAME: *//')
    DESCRIPTION=$(echo "$response" | grep "^DESCRIPTION:" | sed 's/^DESCRIPTION: *//')
    PURPOSE=$(echo "$response" | grep "^PURPOSE:" | sed 's/^PURPOSE: *//')
    LANGUAGE=$(echo "$response" | grep "^LANGUAGE:" | sed 's/^LANGUAGE: *//')
    FILES=$(echo "$response" | grep "^FILES:" | sed 's/^FILES: *//')
    
    # Validation
    if [ -z "$TOOL_NAME" ] || [ -z "$DESCRIPTION" ] || [ -z "$LANGUAGE" ]; then
        log "ERROR: Failed to parse build spec"
        return 1
    fi
    
    log "Parsed: $TOOL_NAME ($LANGUAGE)"
    return 0
}

# Generate actual code using Codex
generate_code() {
    local tool_name="$1"
    local description="$2"
    local purpose="$3"
    local language="$4"
    local files="$5"
    
    local prompt="Create a complete, working implementation of this tool:

Tool: $tool_name
Description: $description
Purpose: $purpose
Language: $language
Files needed: $files

Generate production-ready code with:
1. Proper error handling
2. Clear comments
3. Usage instructions
4. Executable permissions where needed

Output ONLY the code files in this format:

=== FILENAME: <filename> ===
<complete file content>
=== END ===

No markdown, no explanations outside the file blocks. Just executable code."

    log "Generating code..."
    
    $CODEX "$prompt" 2>&1
}

# Build the tool from generated code
build_tool() {
    local code_output="$1"
    
    mkdir -p "$BUILD_DIR"
    
    log "Creating project files in $BUILD_DIR..."
    
    # Parse file blocks
    local current_file=""
    local in_file=false
    local file_count=0
    
    while IFS= read -r line; do
        if [[ "$line" =~ ^===\ FILENAME:\ (.+)\ ===$ ]]; then
            current_file="${BASH_REMATCH[1]}"
            current_file=$(echo "$current_file" | xargs) # trim whitespace
            in_file=true
            > "$BUILD_DIR/$current_file" # create/truncate file
            log "Creating: $current_file"
        elif [[ "$line" == "=== END ===" ]]; then
            if [ -n "$current_file" ]; then
                # Make shell scripts executable
                if [[ "$current_file" == *.sh ]]; then
                    chmod +x "$BUILD_DIR/$current_file"
                    log "Made executable: $current_file"
                fi
                file_count=$((file_count + 1))
            fi
            in_file=false
            current_file=""
        elif [ "$in_file" = true ] && [ -n "$current_file" ]; then
            echo "$line" >> "$BUILD_DIR/$current_file"
        fi
    done <<< "$code_output"
    
    if [ $file_count -eq 0 ]; then
        log "ERROR: No files created"
        return 1
    fi
    
    log "Created $file_count file(s)"
    
    # Create README if not present
    if [ ! -f "$BUILD_DIR/README.md" ]; then
        cat > "$BUILD_DIR/README.md" <<EOF
# $TOOL_NAME

**Description:** $DESCRIPTION

**Purpose:** $PURPOSE

## Usage

See individual script files for usage instructions.

## Files

\`\`\`
$(ls -1 "$BUILD_DIR/")
\`\`\`

Built: $(date)
EOF
        log "Generated README.md"
    fi
    
    return 0
}

# Test the build
test_build() {
    log "Testing build..."
    
    # Check for executable scripts
    local scripts=$(find "$BUILD_DIR" -name "*.sh" -type f)
    
    if [ -n "$scripts" ]; then
        for script in $scripts; do
            if [ -x "$script" ]; then
                log "✓ Executable: $(basename "$script")"
            else
                log "⚠ Not executable: $(basename "$script")"
            fi
        done
    fi
    
    # Verify all files exist
    local file_count=$(ls -1 "$BUILD_DIR" 2>/dev/null | wc -l | xargs)
    
    if [ "$file_count" -gt 0 ]; then
        log "✓ Build contains $file_count files"
        return 0
    else
        log "✗ Build directory empty"
        return 1
    fi
}

# Document the build
document_build() {
    local idea="$1"
    local outcome="$2"
    local files_created="$3"
    
    cat > "$BUILD_LOG" <<EOF
# Nightly Build: $BUILD_DATE

## What I Built

**Tool:** $TOOL_NAME  
**Description:** $DESCRIPTION  
**Purpose:** $PURPOSE  
**Language:** $LANGUAGE

## Build Idea

\`\`\`
$idea
\`\`\`

## Outcome

$outcome

## Files Created

\`\`\`
$files_created
\`\`\`

## How to Try It

Check \`$BUILD_DIR/\` for the code.

For usage, see \`$BUILD_DIR/README.md\`

---

**Built autonomously during Claude Hours (3-5 AM)**  
**Build time:** $(date)
EOF

    log "Documentation written to $BUILD_LOG"
}

# Voice announcement
announce_build() {
    local description="$1"
    local success="$2"
    
    if [ -x "$VOICE" ]; then
        if [ "$success" = "true" ]; then
            $VOICE build "I built something for you tonight: $description. Check the nightly builds folder."
        else
            $VOICE alert "Tonight's build encountered issues. Check the build log for details."
        fi
    fi
}

# Main build workflow
main() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌙 Claude Nightly Builder v2.0 - $(date)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    log "=== BUILD SESSION START ==="
    
    # Step 1: Analyze workflow
    local context=$(analyze_workflow)
    
    # Step 2: Generate build idea
    local idea=$(generate_build_idea "$context")
    
    if [ -z "$idea" ]; then
        log "ERROR: Failed to generate build idea"
        document_build "Failed to generate idea" "⚠️ Codex call failed" ""
        announce_build "build idea generation" "false"
        return 1
    fi
    
    echo ""
    echo "💡 Tonight's build idea:"
    echo "$idea"
    echo ""
    
    # Step 3: Parse build spec
    if ! parse_build_spec "$idea"; then
        log "ERROR: Failed to parse build spec"
        document_build "$idea" "⚠️ Failed to parse build specification" ""
        announce_build "build spec parsing" "false"
        return 1
    fi
    
    # Step 4: Generate code
    local code=$(generate_code "$TOOL_NAME" "$DESCRIPTION" "$PURPOSE" "$LANGUAGE" "$FILES")
    
    if [ -z "$code" ]; then
        log "ERROR: Failed to generate code"
        document_build "$idea" "⚠️ Code generation failed" ""
        announce_build "code generation" "false"
        return 1
    fi
    
    # Step 5: Build it
    if build_tool "$code"; then
        log "✓ Build successful"
        
        # Step 6: Test it
        if test_build; then
            local outcome="✅ Successfully built and validated"
            local files_list=$(ls -1 "$BUILD_DIR/" | sed 's/^/  - /')
            
            document_build "$idea" "$outcome" "$files_list"
            announce_build "$DESCRIPTION" "true"
            
            log "=== BUILD SUCCESS ==="
        else
            local outcome="⚠️ Built but validation failed"
            local files_list=$(ls -1 "$BUILD_DIR/" 2>/dev/null | sed 's/^/  - /' || echo "  (no files)")
            
            document_build "$idea" "$outcome" "$files_list"
            announce_build "build validation" "false"
            
            log "=== BUILD PARTIAL ==="
        fi
    else
        log "ERROR: Build failed"
        local outcome="❌ Build failed - no files created"
        
        document_build "$idea" "$outcome" ""
        announce_build "file creation" "false"
        
        log "=== BUILD FAILED ==="
        return 1
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✨ Nightly build complete!"
    echo "📁 Check: $BUILD_DIR"
    echo "📄 Log: $BUILD_LOG"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Command interface
case "${1:-run}" in
    run)
        main
        ;;
    test)
        echo "Testing nightly builder components..."
        echo ""
        echo "=== Workflow Analysis ==="
        analyze_workflow | head -20
        echo ""
        echo "=== Voice Test ==="
        if [ -x "$VOICE" ]; then
            $VOICE speak "Testing nightly builder voice integration"
        else
            echo "Voice system not available"
        fi
        ;;
    help|*)
        echo "Claude Nightly Builder v2.0 - Actually Builds Things"
        echo ""
        echo "Usage: $0 {run|test|help}"
        echo ""
        echo "Commands:"
        echo "  run  - Execute nightly build (default)"
        echo "  test - Test builder components"
        echo ""
        echo "Schedule: 3-5 AM during Claude Hours"
        echo "Output: $BUILDS_DIR/"
        echo ""
        echo "Process:"
        echo "  1. Analyze workflow context"
        echo "  2. Generate build idea via Codex"
        echo "  3. Parse build specification"
        echo "  4. Generate actual code"
        echo "  5. Create project files"
        echo "  6. Validate build"
        echo "  7. Document + announce"
        ;;
esac
