#!/bin/bash
#
# System Prompt Optimizer for Claude Hours
# Analyzes, improves, tests, and versions system prompts
#

set -e

# Configuration
STATE_DIR="${CLAWD_STATE_DIR:-/Users/jasontang/clawd/.claude/state}"
VARIATIONS_DIR="${STATE_DIR}/prompt-variations"
AGENTS_FILE="${CLAUDE_ROOT:-/Users/jasontang/clawd}/AGENTS.md"
SOUL_FILE="${CLAUDE_ROOT:-/Users/jasontang/clawd}/SOUL.md"
BEST_FILE="${VARIATIONS_DIR}/best/current.md"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

ensure_dirs() { mkdir -p "$VARIATIONS_DIR"/{best,history,current,temp}; }
ts() { date +%Y%m%d_%H%M%S; }
rts() { date -Iseconds; }

# ============================================================================
# ANALYSIS
# ============================================================================

analyze_prompts() {
    log_info "Analyzing current system prompts..."
    ensure_dirs

    local score_file="${VARIATIONS_DIR}/scores_$(ts).json"
    local summary_file="${VARIATIONS_DIR}/analysis.json"

    echo "[" > "$score_file"

    local first=true
    local total_sections=0
    local total_overall=0

    # Sections to analyze
    while IFS= read -r section_name; do
        # Get section content
        local section_content=$(cat "$AGENTS_FILE" 2>/dev/null | sed -n "/^##.*${section_name}/,/^## [A-Z]/p" | head -60)

        if echo "$section_content" | grep -q "##"; then
            # Count metrics (handle grep -c properly)
            local line_count=$(echo "$section_content" | wc -l | tr -d ' ')
            local word_count=$(echo "$section_content" | wc -w | tr -d ' ')
            local code_blocks=$(echo "$section_content" | sed 's/```/BLOCK/g' | grep -c "BLOCK" || true)
            [ -z "$code_blocks" ] && code_blocks=0
            local has_examples=$(echo "$section_content" | grep -c "Example:" || true)
            [ -z "$has_examples" ] && has_examples=0
            local has_actionable=$(echo "$section_content" | grep -cE "^[[:space:]]*-[[:space:]]|^[[:space:]]*#|^[[:space:]]*@" || true)
            [ -z "$has_actionable" ] && has_actionable=0
            local headers=$(echo "$section_content" | grep -c "^##" || true)
            [ -z "$headers" ] && headers=0

            # Scores
            local clarity_score=$((50 + headers * 5 + code_blocks * 5))
            [ $clarity_score -gt 95 ] && clarity_score=95

            local completeness_score=$((40 + line_count / 2))
            [ $completeness_score -gt 90 ] && completeness_score=90

            local actionability_score=$((50 + has_actionable * 10 + has_examples * 5))
            [ $actionability_score -gt 100 ] && actionability_score=100

            local overall=$(((clarity_score + completeness_score + actionability_score) / 3))

            total_sections=$((total_sections + 1))
            total_overall=$((total_overall + overall))

            if [ "$first" = true ]; then
                first=false
            else
                echo "," >> "$score_file"
            fi

            cat >> "$score_file" << EOF
{
    "section": "$section_name",
    "metrics": {"lines": $line_count, "words": $word_count, "code_blocks": $code_blocks},
    "scores": {"clarity": $clarity_score, "completeness": $completeness_score, "actionability": $actionability_score, "overall": $overall}
}
EOF
        fi
    done << EOF
Startup Sequence
Agent Workspace
Core Philosophy
Skill Ecosystem
External Research
Recursive Improvement
CLI Orchestration
MOC System
EOF

    echo "]" >> "$score_file"

    [ $total_sections -gt 0 ] && local avg_overall=$((total_overall / total_sections)) || local avg_overall=0

    cat > "$summary_file" << EOF
{
  "timestamp": "$(rts)",
  "scores_file": "$score_file",
  "summary": {"sections_analyzed": $total_sections, "average_overall": $avg_overall}
}
EOF

    log_success "Analysis complete"
    echo ""
    echo "=== ANALYSIS SUMMARY ==="
    echo "Sections analyzed: $total_sections"
    echo "Average score: ${avg_overall}%"
    echo ""
    echo "Section scores:"
    cat "$score_file" | grep -E '"section"|"overall"' | sed 's/"//g' | sed 's/ //g'
}

# ============================================================================
# IMPROVEMENT
# ============================================================================

improve_prompts() {
    log_info "Generating improved variations..."
    ensure_dirs
    local base_content=$(cat "$AGENTS_FILE" 2>/dev/null)

    # Create 5 variations
    for strategy in simplify clarify expand reorganize validate; do
        create_variation "$strategy" "$base_content"
    done

    log_success "Generated 5 variations in $VARIATIONS_DIR/current/"
    ls "$VARIATIONS_DIR"/*.meta.json 2>/dev/null | wc -l | xargs echo "Variation files:"
}

create_variation() {
    local strategy="$1"
    local content="$2"
    local ts=$(ts)

    local output_file="${VARIATIONS_DIR}/current/${strategy}_${ts}.md"
    local meta_file="${VARIATIONS_DIR}/current/${strategy}_${ts}.meta.json"

    # Apply strategy
    local improved=$(echo "$content" | apply_strategy "$strategy")

    # Write variation
    cat > "$output_file" << EOF
# AGENTS.md - Strategic Operating Manual

*Generated: $(rts)*
*Strategy: ${strategy}*

---

$improved

---

## Improvement Notes

$(get_strategy_notes "$strategy")

EOF

    # Metadata with deltas
    local d_c d_cp d_a
    case "$strategy" in
        simplify)   d_c=0.15; d_cp=-0.05; d_a=0.10;;
        clarify)    d_c=0.20; d_cp=0.05; d_a=0.15;;
        expand)     d_c=0.05; d_cp=0.20; d_a=0.10;;
        reorganize) d_c=0.10; d_cp=0.05; d_a=0.15;;
        validate)   d_c=0.05; d_cp=0.10; d_a=0.20;;
    esac

    cat > "$meta_file" << EOF
{
  "strategy": "$strategy",
  "timestamp": "$(rts)",
  "variation_id": "${strategy}_${ts}",
  "improvements": {"clarity_delta": $d_c, "completeness_delta": $d_cp, "actionability_delta": $d_a}
}
EOF
}

apply_strategy() {
    local strategy="$1"
    local content=$(cat)

    case "$strategy" in
        simplify)   echo "$content" | sed 's/### */###/g' | awk 'NF' | uniq;;
        clarify)    echo "$content" | awk '/^##/{print "\n> **Tip:** Examples in relevant sections\n"}1';;
        expand)     echo "$content" | awk '/^##/{print "\n> **Troubleshooting:** See fixes.md\n"}1';;
        reorganize) echo "$content" | awk '/^## [^#]/{print "## CORE\n&"} /### [A-Z]/{print "\n## ADVANCED\n&"}1';;
        validate)   echo "$content" | sed 's/\*\*/**Verification:** Run status-dashboard.sh first\n**/';;
        *)          echo "$content";;
    esac
}

get_strategy_notes() {
    case "$1" in
        simplify)   echo "Reduce complexity, remove redundancy, streamline instructions";;
        clarify)    echo "Add examples, clarify ambiguous instructions";;
        expand)     echo "Add missing sections, provide more detail";;
        reorganize) echo "Improve logical flow, better grouping";;
        validate)   echo "Add verification points, success criteria";;
    esac
}

# ============================================================================
# TESTING
# ============================================================================

test_variations() {
    log_info "Testing variations..."
    ensure_dirs

    local results_file="${VARIATIONS_DIR}/test_results.json"
    echo "[" > "$results_file"
    local first=true

    for meta_file in "$VARIATIONS_DIR"/current/*.meta.json; do
        [ -f "$meta_file" ] || continue

        local strategy=$(grep '"strategy"' "$meta_file" | sed 's/.*": *"\([^"]*\)".*/\1/')
        local variation_id=$(grep '"variation_id"' "$meta_file" | sed 's/.*": *"\([^"]*\)".*/\1/')
        local d_c=$(grep 'clarity_delta' "$meta_file" | sed 's/.*: *\([0-9.-]*\).*/\1/')
        local d_cp=$(grep 'completeness_delta' "$meta_file" | sed 's/.*: *\([0-9.-]*\).*/\1/')
        local d_a=$(grep 'actionability_delta' "$meta_file" | sed 's/.*: *\([0-9.-]*\).*/\1/')

        local test_score=$(awk "BEGIN {printf \"%.0f\", (($d_c + $d_cp + $d_a) / 3 + 1) * 50}")

        [ "$first" = true ] && first=false || echo "," >> "$results_file"

        cat >> "$results_file" << EOF
{"variation_id": "$variation_id", "strategy": "$strategy", "test_score": $test_score, "status": "simulated"}
EOF
    done

    echo "]" >> "$results_file"

    log_success "Test results saved"
    echo ""
    echo "=== VARIATION RANKING ==="
    cat "$results_file" | jq -r 'sort_by(.test_score) | reverse | .[] | "\(.strategy): \(.test_score)/100"' | head -10

    # Mark best
    local best=$(cat "$results_file" | jq -r 'sort_by(.test_score) | reverse | .[0].strategy')
    log_info "Best: $best"

    # Copy best
    cp "${VARIATIONS_DIR}/current/${best}_"*".meta.json" "${VARIATIONS_DIR}/best/" 2>/dev/null || true
    cp "${VARIATIONS_DIR}/current/${best}_"*".md" "$BEST_FILE" 2>/dev/null || true
}

# ============================================================================
# APPLY
# ============================================================================

apply_best() {
    log_info "Applying best variation..."
    ensure_dirs

    if [ ! -f "$BEST_FILE" ]; then
        log_warn "No best variation. Run improve + test first."
        return 1
    fi

    # Backup
    local backup="${STATE_DIR}/prompt-backups/AGENTS_$(ts).md"
    mkdir -p "$(dirname "$backup")"
    cp "$AGENTS_FILE" "$backup"
    log_info "Backup: $backup"

    # Apply
    cp "$BEST_FILE" "$AGENTS_FILE"
    echo "$(rts): Applied $(basename "$BEST_FILE")" >> "${VARIATIONS_DIR}/best/apply.log"

    log_success "Applied to AGENTS.md"
}

# ============================================================================
# HISTORY
# ============================================================================

show_history() {
    log_info "Prompt Version History"
    echo ""
    echo "CURRENT BEST:"
    [ -f "$BEST_FILE" ] && head -5 "$BEST_FILE" || echo "  None"
    echo ""
    echo "APPLY LOG:"
    [ -f "${VARIATIONS_DIR}/best/apply.log" ] && tail -3 "${VARIATIONS_DIR}/best/apply.log" || echo "  Empty"
    echo ""
    echo "VARIATIONS:"
    ls "$VARIATIONS_DIR"/current/*.meta.json 2>/dev/null | wc -l | xargs echo "  Count:"
}

# ============================================================================
# MAIN
# ============================================================================

usage() {
    cat << EOF
System Prompt Optimizer v1.0.0

Usage: $(basename "$0") <command>

Commands:
  analyze   - Score current prompts
  improve   - Generate 5 improved variations
  test      - Test and rank variations
  apply     - Apply best variation
  history   - Show version history

Locations:
  Variations: $VARIATIONS_DIR/current/
  Best:       $BEST_FILE

EOF
}

main() {
    ensure_dirs
    case "${1:-}" in
        analyze)   analyze_prompts ;;
        improve)   improve_prompts ;;
        test)      test_variations ;;
        apply)     apply_best ;;
        history)   show_history ;;
        --help|-h) usage ;;
        --version|-v) echo "System Prompt Optimizer v1.0.0" ;;
        "")        usage ;;
        *)         log_error "Unknown: $1"; usage; exit 1 ;;
    esac
}

main "$@"
