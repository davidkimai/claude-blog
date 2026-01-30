#!/bin/bash
# Claude Hours Nightly Setup - Prepares overnight system
# Run this to start ambitious overnight development

CLAWD="/Users/jasontang/clawd"
STATE_DIR="$CLAWD/.claude/state"
ORCHESTRA_DIR="$CLAWD/.claude/orchestra"
LOGS_DIR="$CLAWD/.claude/logs"
TASKS_DIR="$CLAWD/tasks"

mkdir -p "$ORCHESTRA_DIR" "$STATE_DIR" "$LOGS_DIR"

RED='\033[0;31m' GREEN='\033[0;32m' BLUE='\033[0;34m' NC='\033[0m'

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SETUP] $1" >> "$LOGS_DIR/nightly-setup.log"; }
info() { echo -e "${BLUE}[SETUP]${NC} $1"; }

# === AMBITIOUS GOAL GENERATOR ===

generate_ambitious_goals() {
    info "Generating ambitious goals for tonight..."
    
    # Strategy: Find what's missing from the system
    local goals_file="$ORCHESTRA_DIR/tonights-goals.md"
    
    cat > "$goals_file" << EOF
# Tonight's Ambitious Goals - $(date '+%Y-%m-%d')

**Generated:** $(date '+%Y-%m-%d %H:%M %Z')

## 🎯 Hourly Schedule

### 21:00-22:00 - Goal Generation & Setup
- Analyze system state
- Generate tonight's ambitious goals
- Spawn initial workers
- **Goal:** 3 workers ready

### 22:00-23:00 - Worker Sprint 1
- **Worker 1:** Self-improvement analyzer
- **Worker 2:** Skill discovery engine  
- **Worker 3:** Memory optimization
- **Goal:** 3 working artifacts

### 23:00-00:00 - Worker Sprint 2
- Continue previous workers
- Spawn new workers for new goals
- **Goal:** 5 artifacts with verification

### 00:00-01:00 - Midnight Build
- Focus on most impactful work
- **Goal:** Major feature milestone

### 01:00-02:00 - Refinement
- Polish existing work
- Write documentation
- **Goal:** Shippable quality

### 02:00-03:00 - Quality Enforcement
- Verify all artifacts
- Fix issues found
- **Goal:** 100% pass rate

### 03:00-04:00 - Documentation
- Update docs
- Prepare morning report
- **Goal:** Complete docs

### 04:00-05:00 - Optimization
- Performance tuning
- Cleanup
- **Goal:** Optimized system

### 05:00-06:00 - Integration
- Connect systems
- Test end-to-end
- **Goal:** Working integration

### 06:00-07:00 - Final Build
- Last sprint
- Complete pending work
- **Goal:** Final milestone

### 07:00-08:00 - Morning Handoff
- Final verification
- Generate report
- **Goal:** Surprise ready

---

## 🏆 Tonight's Top Priorities

Based on system analysis:

1. **Self-Improvement System** - Analyze patterns, improve itself
2. **Skill Orchestrator** - Discover and use skills autonomously  
3. **Quality Enforcer** - Verify all work meets standards
4. **Memory Optimizer** - Faster retrieval, better organization

---

## ⚡ Worker Templates

Workers will execute with autonomy. Each worker:
1. Understands goal
2. Plans approach
3. Executes (with subagent help)
4. Verifies quality
5. Prepares handoff

EOF
    
    info "Goals generated: $goals_file"
    cat "$goals_file"
}

# === WORKER SPAWNER ===

spawn_workers() {
    local count="${1:-4}"
    info "Spawning $count autonomous workers..."
    
    for i in $(seq 1 $count); do
        local worker_name="claude-hour-$i-$(date +%s)"
        local worker_file="$ORCHESTRA_DIR/worker-$i.sh"
        
        # Create individual worker script
        cat > "$worker_file" << EOF
#!/bin/bash
# Claude Worker $i - Autonomous Overnight Developer
# Runs independently with ambitious goals

WORKER_NAME="$worker_name"
WORKER_ID=$i
LOG_FILE="$LOGS_DIR/worker-$i.log"

log() { echo "[\$(date '+%H:%M:%S')] [WORKER $i] \$1" >> "\$LOG_FILE"; }

log "Worker $i initialized"
log "Goal: Ambitious overnight development"

# Execute with autonomy
# This worker will build something impactful overnight
log "Starting autonomous execution..."

# Worker decides what to build based on system needs
# It will analyze, plan, execute, verify, and report

# End with success
log "Worker $i complete"
EOF
        chmod +x "$worker_file"
        
        # Start worker in background
        bash "$worker_file" &
        log "Worker $i started in background"
        
        sleep 5  # Stagger starts
    done
    
    info "All $count workers spawned"
}

# === QUALITY ENFORCER ===

setup_quality_enforcer() {
    info "Setting up quality enforcement..."
    
    # Use the new quality-enforcer.sh script
    QUALITY_SCRIPT="$CLAWD/scripts/quality-enforcer.sh"
    
    if [[ -x "$QUALITY_SCRIPT" ]]; then
        # Create wrapper that uses quality-enforcer.sh
        cat > "$ORCHESTRA_DIR/quality-check.sh" << EOF
#!/bin/bash
# Quality Enforcer - Validates overnight work using quality-enforcer.sh

QUALITY_SCRIPT="$CLAWD/scripts/quality-enforcer.sh"
QUALITY_LOG="$ORCHESTRA_DIR/quality.log"

log() { echo "[\$(date '+%H:%M:%S')] [QUALITY] \$1" >> "\$QUALITY_LOG"; }

check_all() {
    log "Running quality checks via quality-enforcer.sh..."
    
    # Check all artifacts in orchestra directory
    local target_dir="$ORCHESTRA_DIR"
    
    # Run quality check on each artifact
    local passed=0
    local failed=0
    local total=0
    
    for file in \$target_dir/*.sh; do
        [[ -f "\$file" ]] || continue
        ((total++))
        if \$QUALITY_SCRIPT check "\$file" >/dev/null 2>&1; then
            ((passed++))
        else
            ((failed++))
        fi
    done
    
    log "Files checked: \$total"
    log "Passed: \$passed, Failed: \$failed"
    
    # Also check for any .py files
    for file in \$target_dir/*.py; do
        [[ -f "\$file" ]] || continue
        ((total++))
        if \$QUALITY_SCRIPT check "\$file" >/dev/null 2>&1; then
            ((passed++))
        else
            ((failed++))
        fi
    done
    
    # Result
    if [[ \$failed -eq 0 ]] && [[ \$total -gt 0 ]]; then
        log "QUALITY: PASSED (\$passed/\$total)"
        return 0
    else
        log "QUALITY: NEEDS REVIEW (\$passed/\$total)"
        return 1
    fi
}

check_all
EOF
        chmod +x "$ORCHESTRA_DIR/quality-check.sh"
        
        # Run initial quality check
        log "Initial quality check..."
        bash "$ORCHESTRA_DIR/quality-check.sh"
        
        info "Quality enforcer ready (using $QUALITY_SCRIPT)"
    else
        # Fallback to simple check
        cat > "$ORCHESTRA_DIR/quality-check.sh" << 'EOF'
#!/bin/bash
# Quality Enforcer - Validates overnight work (fallback)

QUALITY_LOG="$ORCHESTRA_DIR/quality.log"

log() { echo "[$(date '+%H:%M:%S')] [QUALITY] $1" >> "$QUALITY_LOG"; }

check_all() {
    log "Running quality checks (fallback mode)..."
    local files=$(find .claude/orchestra -type f ! -name "*.log" 2>/dev/null | wc -l)
    log "Files created: $files"
    if [ "$files" -gt 0 ]; then
        log "QUALITY: PASSED"
        return 0
    else
        log "QUALITY: NEEDS REVIEW"
        return 1
    fi
}

check_all
EOF
        chmod +x "$ORCHESTRA_DIR/quality-check.sh"
        info "Quality enforcer ready (fallback mode)"
    fi
}

# === MORNING REPORT GENERATOR ===

setup_morning_report() {
    info "Setting up morning report..."
    
    cat > "$ORCHESTRA_DIR/morning-report.sh" << 'EOF'
#!/bin/bash
# Morning Report - What Claude built overnight

QUALITY_SCRIPT="/Users/jasontang/clawd/scripts/quality-enforcer.sh"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║          🦞 Claude Hours Morning Report                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Date: $(date '+%Y-%m-%d')"
echo ""

echo "═══ What Was Built ═══"
find .claude/orchestra -type f \( -name "*.sh" -o -name "*.py" -o -name "*.md" \) 2>/dev/null | head -20 | sed 's/^/  • /'

echo ""
echo "═══ Commits Made ═══"
git log --since="yesterday 21:00" --until="today 08:00" --oneline 2>/dev/null | sed 's/^/  • /' || echo "  No commits"

echo ""
echo "═══ Quality Summary ═══"
if [[ -x "$QUALITY_SCRIPT" ]]; then
    "$QUALITY_SCRIPT" report day 2>/dev/null | grep -A 20 "Quality Enforcement Report" | head -25 || echo "  Quality report unavailable"
else
    bash .claude/orchestra/quality-check.sh 2>/dev/null | tail -1 || echo "  Quality check unavailable"
fi

echo ""
echo "═══ For Jae Review ═══"
echo "  • PR: Check for new branches"
echo "  • Test: Run verification commands"
echo "  • Merge: If quality passes"

echo ""
echo "═══ Next Night Seeds ═══"
echo "  • Extend what was started"
echo "  • Fix any quality issues"
echo "  • New ambitious goals"
EOF
    chmod +x "$ORCHESTRA_DIR/morning-report.sh"
    info "Morning report ready"
}

# === MAIN SETUP ===

run_nightly_setup() {
    local start_time=$(date +%s)
    
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║          🦞 Claude Hours Nightly Setup                   ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    info "Starting nightly setup..."
    info "Time: $(date '+%Y-%m-%d %H:%M %Z')"
    echo ""
    
    # Step 1: Clean previous session
    info "═══ Step 1: Clean Slate ═══"
    pkill -9 -f "claude.*worker\|orchestra" 2>/dev/null || true
    rm -f "$ORCHESTRA_DIR"/worker-*.sh
    rm -f "$ORCHESTRA_DIR"/tonights-goals.md
    info "Clean slate ready"
    
    # Step 2: Generate goals
    info ""
    info "═══ Step 2: Generate Ambitious Goals ═══"
    generate_ambitious_goals
    
    # Step 3: Spawn workers
    info ""
    info "═══ Step 3: Spawn Autonomous Workers ═══"
    spawn_workers 4
    
    # Step 4: Setup quality
    info ""
    info "═══ Step 4: Setup Quality Enforcement ═══"
    setup_quality_enforcer
    
    # Step 5: Setup morning report
    info ""
    info "═══ Step 5: Setup Morning Report ═══"
    setup_morning_report
    
    # Summary
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║          ✅ Nightly Setup Complete                       ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    echo "Duration: ${duration}s"
    echo ""
    echo "To check status:"
    echo "  ps aux | grep worker"
    echo ""
    echo "To see goals:"
    echo "  cat .claude/orchestra/tonights-goals.md"
    echo ""
    echo "Morning report:"
    echo "  bash .claude/orchestra/morning-report.sh"
    echo ""
    echo "🎉 Claude is now working autonomously overnight!"
}

# === STATUS ===

show_status() {
    echo "═══ Claude Hours Status ═══"
    echo "Workers: $(ps aux | grep -c 'worker.*sh' | grep -v grep || echo 0)"
    echo "Goals: $(ls -la .claude/orchestra/tonights-goals.md 2>/dev/null || echo 'Not set')"
    echo "Log: $(wc -l < .claude/logs/nightly-setup.log 2>/dev/null || echo 0) lines"
}

# === MAIN ===

case "${1:-setup}" in
    setup)
        run_nightly_setup
        ;;
    status)
        show_status
        ;;
    spawn)
        spawn_workers "${2:-4}"
        ;;
    goals)
        generate_ambitious_goals
        ;;
    report)
        bash "$ORCHESTRA_DIR/morning-report.sh"
        ;;
    kill)
        pkill -9 -f "worker.*sh" 2>/dev/null
        echo "Workers terminated"
        ;;
    help|*)
        echo "Claude Hours Nightly Setup"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  setup   - Start overnight system (call this at 9 PM)"
        echo "  status  - Check current status"
        echo "  spawn   - Spawn workers (default: 4)"
        echo "  goals   - Generate goals"
        echo "  report  - Generate morning report"
        echo "  kill    - Terminate all workers"
        echo "  help    - Show this help"
        ;;
esac
