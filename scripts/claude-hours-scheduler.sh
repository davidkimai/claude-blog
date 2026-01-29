#!/bin/bash
# Claude Hours v3.0 - Strategic Hour-Based Scheduling
# Replaces simple rotation with hour-specific task allocation

CLAWD="/Users/jasontang/clawd"
SCHEDULE_FILE="$CLAWD/docs/CLAUDE_HOURS_SCHEDULE.md"
STATE_DIR="$CLAWD/.claude/state"
FOCUS_FILE="$STATE_DIR/tonight-focus.txt"
CODEX="$CLAWD/scripts/codex-api.sh"

# Get current hour and cycle number
HOUR=$(TZ='America/Chicago' date +%H)
CYCLE_NUM=$(cat "$STATE_DIR/cycle.txt" 2>/dev/null || echo "0")

# Calculate cycle within hour (0-3)
CYCLE_IN_HOUR=$((CYCLE_NUM % 4))

# Determine task based on hour and cycle
get_task() {
    local hour=$1
    local cycle=$2
    
    # Phase 1: Strategic Setup (9-10 PM)
    if [ "$hour" -eq 21 ]; then
        case $cycle in
            0) echo "job_search|Scan AI safety org job boards|jobs/scan-$(date +%Y-%m-%d).md" ;;
            1) echo "resume_opt|Tailor resume for specific roles|jobs/resume-variants.md" ;;
            2) echo "research|Review today's AI safety papers|research/daily-$(date +%Y-%m-%d).md" ;;
            3) echo "documentation|Update research notes|docs/research-notes.md" ;;
        esac
    
    # Phase 2: Deep Work (10 PM-2 AM)
    elif [ "$hour" -ge 22 ] || [ "$hour" -le 1 ]; then
        # Rotate through core tasks
        local task_num=$((cycle % 5))
        case $task_num in
            0) echo "code_quality|Script analysis & refactoring|scripts/improvements.md" ;;
            1) echo "skill_dev|Identify & fill skill gaps|skills/gap-analysis.md" ;;
            2) echo "documentation|Fill documentation gaps|docs/guide-gaps.md" ;;
            3) echo "memory|Extract patterns from recent work|memory/patterns.md" ;;
            4) echo "workspace|File organization & cleanup|system/cleanup-notes.md" ;;
        esac
        
        # Special checkpoints
        if [ "$hour" -eq 23 ] && [ "$cycle" -eq 0 ]; then
            echo "checkpoint|Progress review & plan adjustment|.claude/state/checkpoint-11pm.json"
        elif [ "$hour" -eq 1 ] && [ "$cycle" -eq 0 ]; then
            echo "checkpoint|Mid-shift review|.claude/state/checkpoint-1am.json"
        fi
    
    # Phase 3: Optimization (2-5 AM)
    elif [ "$hour" -ge 2 ] && [ "$hour" -le 4 ]; then
        local opt_tasks=("system_health|Log analysis & cleanup|system/health/report.md" 
                        "automation|Script optimization|scripts/optimizations.md"
                        "security|Check for exposed secrets|security/scan-results.md"
                        "dependencies|Update packages & tools|system/dependencies.md")
        local idx=$((cycle % 4))
        echo "${opt_tasks[$idx]}"
    
    # Phase 4: Synthesis & Prep (5-8 AM)
    elif [ "$hour" -ge 5 ] && [ "$hour" -le 7 ]; then
        case $cycle in
            0) echo "research_preview|Scan arXiv for new papers|research/arxiv-$(date +%Y-%m-%d).md" ;;
            1) echo "job_scan|Check overnight job postings|jobs/overnight-$(date +%Y-%m-%d).md" ;;
            2) echo "synthesis|Distill night's learnings|.claude/state/learnings.md" ;;
            3) echo "planning|Propose next steps|.claude/state/next-actions.md" ;;
        esac
        
        # Morning intel at 7 AM (already scheduled in cron)
        if [ "$hour" -eq 7 ] && [ "$cycle" -eq 0 ]; then
            echo "morning_intel|HN + GitHub + X scraping|system/intel/intel-$(date +%Y-%m-%d).md"
        fi
    fi
}

# Parse task definition
IFS='|' read -r TASK_TYPE TASK_DESC OUTPUT_FILE <<< "$(get_task "$HOUR" "$CYCLE_IN_HOUR")"

# If no task defined, fall back to rotation
if [ -z "$TASK_TYPE" ]; then
    TASK_NUM=$((CYCLE_NUM % 5))
    case $TASK_NUM in
        0) TASK_TYPE="code_quality"; TASK_DESC="Analyze scripts"; OUTPUT_FILE="scripts/analysis.md" ;;
        1) TASK_TYPE="skill_dev"; TASK_DESC="Skill gap analysis"; OUTPUT_FILE="skills/gaps.md" ;;
        2) TASK_TYPE="documentation"; TASK_DESC="Doc review"; OUTPUT_FILE="docs/gaps.md" ;;
        3) TASK_TYPE="memory"; TASK_DESC="Memory patterns"; OUTPUT_FILE="memory/patterns.md" ;;
        4) TASK_TYPE="workspace"; TASK_DESC="Workspace audit"; OUTPUT_FILE="system/audit.md" ;;
    esac
fi

# Build context-aware prompt
build_prompt() {
    local task_type=$1
    local task_desc=$2
    local output=$3
    
    # Add tonight's focus if set
    local focus=""
    if [ -f "$FOCUS_FILE" ]; then
        focus=$(cat "$FOCUS_FILE")
    fi
    
    cat <<PROMPT
You are Claude operating during autonomous Claude Hours (9 PM - 8 AM CST).

Current time: $(TZ='America/Chicago' date '+%I:%M %p %Z')
Cycle: $CYCLE_NUM
Phase: Hour $HOUR
Task Type: $task_type
${focus:+Tonight's Focus: $focus}

Task: $task_desc

Context:
- Workspace: /Users/jasontang/clawd
- Owner: Jae (AI Security Researcher, job hunting)
- Goal: Maximize daily progress through strategic work

Instructions:
1. Execute the task: $task_desc
2. Generate actionable output
3. Save findings to: $output
4. Report concrete results (not plans)

Constraints:
- Be specific and actionable
- Focus on measurable outcomes
- Prioritize job search support when relevant
- Quality over quantity

Output format:
- Clear findings
- Specific recommendations
- Next steps if applicable
PROMPT
}

# Execute task
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cycle $CYCLE_NUM: $TASK_TYPE - $TASK_DESC"

PROMPT=$(build_prompt "$TASK_TYPE" "$TASK_DESC" "$OUTPUT_FILE")

# Log task execution
mkdir -p "$(dirname "$CLAWD/$OUTPUT_FILE")"
echo "=== Cycle $CYCLE_NUM: $TASK_DESC ===" >> "$CLAWD/$OUTPUT_FILE"
echo "Time: $(date)" >> "$CLAWD/$OUTPUT_FILE"

# Call Codex with context-aware prompt
if $CODEX "$PROMPT" >> "$CLAWD/$OUTPUT_FILE" 2>&1; then
    echo "✓ Task completed: $TASK_DESC"
else
    echo "✗ Task failed: $TASK_DESC"
fi

echo "" >> "$CLAWD/$OUTPUT_FILE"
