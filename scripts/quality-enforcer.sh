#!/bin/bash
# ============================================================================
# Quality Enforcer Pipeline for Claude Hours
# ============================================================================
# Prevents failures like 01-30 death spiral through automated validation gates
#
# Usage:
#   ./quality-enforcer.sh check <file|skill>     # Check a file or skill
#   ./quality-enforcer.sh check --skill <name>   # Check a skill by name
#   ./quality-enforcer.sh report                 # Morning quality summary
#   ./quality-enforcer.sh metrics                # Show detailed metrics
#   ./quality-enforcer.sh integrate <script>     # Integrate validation into a script
#   ./quality-enforcer.sh test                   # Run test suite
#
# Exit codes:
#   0 - All checks passed
#   1 - One or more checks failed
#   2 - Invalid usage or missing dependencies
# ============================================================================

set -o pipefail

# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
METRICS_DIR="${PROJECT_ROOT}/.claude/quality-metrics"
METRICS_FILE="${METRICS_DIR}/quality-metrics.json"
QUALITY_LOG="${METRICS_DIR}/quality.log"
SKILL_REGISTRY="${PROJECT_ROOT}/memory/skills-registry.json"

# Quality thresholds
MAX_FILE_SIZE_KB=500
MAX_LINE_COUNT=2000
WARN_FILE_SIZE_KB=200

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Dangerous patterns to detect (safety check)
DANGEROUS_PATTERNS=(
    "rm\s+-rf"
    "rm\s+-r\s+/"
    "dd\s+if=/dev/zero"
    "mkfs"
    "chmod\s+777"
    "chmod\s+-R\s+777"
    "> /dev/sda"
    "> /dev/nvme"
    ":(){:|:&};"
    "wget.*\|.*sh"
    "curl.*\|.*sh"
    "python\s+-c.*exec"
    "eval\s+.*\$"
)

# ============================================================================
# Output Functions
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*" >&2
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $*" >&2
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $*" >&2
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*" >&2
}

log_debug() {
    if [[ "${DEBUG:-0}" == "1" ]]; then
        echo -e "[DEBUG] $*" >&2
    fi
}

# ============================================================================
# Initialization
# ============================================================================

ensure_metrics_dir() {
    mkdir -p "$METRICS_DIR"
    chmod 755 "$METRICS_DIR" 2>/dev/null || true
}

init_metrics_file() {
    if [[ ! -f "$METRICS_FILE" ]]; then
        cat > "$METRICS_FILE" << 'EOF'
{
  "version": "1.0",
  "created": "2026-01-30T00:00:00Z",
  "last_updated": "2026-01-30T00:00:00Z",
  "total_checks": 0,
  "total_passed": 0,
  "total_failed": 0,
  "by_check_type": {},
  "by_skill": {},
  "failure_patterns": [],
  "daily_stats": []
}
EOF
        touch "$QUALITY_LOG"
    fi
}

# ============================================================================
# Validation Functions
# ----------------------------------------------------------------------------

# Rule 1: Syntax Check - Validates bash and python syntax
check_syntax() {
    local file="$1"
    local check_name="syntax"
    local result="pass"
    local errors=()

    log_info "[1/5] Syntax Check..."

    # Check bash syntax
    if [[ "$file" == *.sh ]] || [[ -x "$file" ]] && file "$file" 2>/dev/null | grep -q "shell"; then
        log_debug "Running bash syntax check on: $file"
        local bash_output
        bash_output=$(bash -n "$file" 2>&1)
        if [[ $? -ne 0 ]]; then
            result="fail"
            errors+=("BASH_SYNTAX: $bash_output")
            log_fail "Bash syntax error: $bash_output"
        fi
    fi

    # Check python syntax
    if [[ "$file" == *.py ]]; then
        log_debug "Running python syntax check on: $file"
        local py_output
        py_output=$(python3 -m py_compile "$file" 2>&1)
        if [[ $? -ne 0 ]]; then
            result="fail"
            errors+=("PYTHON_SYNTAX: $py_output")
            log_fail "Python syntax error: $py_output"
        fi
    fi

    # Check javascript/node syntax
    if [[ "$file" == *.js ]]; then
        log_debug "Running node syntax check on: $file"
        if command -v node &>/dev/null; then
            local node_output
            node_output=$(node --check "$file" 2>&1)
            if [[ $? -ne 0 ]]; then
                result="fail"
                errors+=("NODE_SYNTAX: $node_output")
                log_fail "Node syntax error: $node_output"
            fi
        fi
    fi

    if [[ "$result" == "pass" ]]; then
        log_success "Syntax check passed"
    fi

    echo "${errors[@]}"
    return $([[ "$result" == "fail" ]] && echo 1 || echo 0)
}

# ----------------------------------------------------------------------------
# Rule 2: Safety Check - Detects dangerous operations
# ----------------------------------------------------------------------------
check_safety() {
    local file="$1"
    local check_name="safety"
    local result="pass"
    local detected_patterns=()

    log_info "[2/5] Safety Check..."

    # Skip binary files
    if file "$file" 2>/dev/null | grep -qE "(executable|shared object|mach-o)"; then
        if [[ ! "$file" =~ \.(sh|py|js|ts)$ ]]; then
            log_debug "Skipping binary file: $file"
            return 0
        fi
    fi

    # Create a temporary file without comments for pattern matching
    local temp_file
    temp_file=$(mktemp)

    # Remove comments (lines starting with #, and inline comments)
    # Also remove quoted strings to avoid false positives
    sed -e 's/#.*$//' -e 's/".*"//g' -e "s/'.*'//g" "$file" 2>/dev/null > "$temp_file"

    for pattern in "${DANGEROUS_PATTERNS[@]}"; do
        if grep -Eq "$pattern" "$temp_file" 2>/dev/null; then
            result="fail"
            detected_patterns+=("DANGEROUS_PATTERN: Found '$pattern'")
            log_fail "Dangerous pattern detected: $pattern"
        fi
    done

    rm -f "$temp_file"

    # Check for unintended infinite loops (simple detection)
    if grep -qE "while\s+true" "$file" 2>/dev/null; then
        if ! grep -qE "(sleep|timeout|break|exit)" "$file" 2>/dev/null; then
            log_warn "Potential infinite loop detected (while true without sleep/break)"
        fi
    fi

    if [[ "$result" == "pass" ]]; then
        log_success "Safety check passed"
    fi

    echo "${detected_patterns[@]}"
    return $([[ "$result" == "fail" ]] && echo 1 || echo 0)
}

# ----------------------------------------------------------------------------
# Rule 3: Dependency Check - Verifies required files exist
# ----------------------------------------------------------------------------
check_dependencies() {
    local file="$1"
    local check_name="dependencies"
    local result="pass"
    local missing_deps=()

    log_info "[3/5] Dependency Check..."

    # Extract and check dependencies from comments or manifest
    local required_files
    required_files=$(grep -E "^#\s*(REQUIRES|DEPS|DEPENDS)\s*:" "$file" 2>/dev/null | \
        sed 's/.*:\s*//' | tr ',' '\n' | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')

    if [[ -n "$required_files" ]]; then
        for dep in $required_files; do
            local dep_path="$dep"
            if [[ ! -f "$dep_path" ]]; then
                dep_path="${PROJECT_ROOT}/${dep}"
            fi
            if [[ ! -f "$dep_path" ]]; then
                local file_dir
                file_dir=$(dirname "$file")
                dep_path="${file_dir}/${dep}"
            fi

            if [[ ! -f "$dep_path" ]]; then
                result="fail"
                missing_deps+=("MISSING_DEP: $dep")
                log_fail "Missing dependency: $dep"
            else
                log_debug "Found dependency: $dep"
            fi
        done
    fi

    # Check for script interpreter availability
    local shebang
    shebang=$(head -1 "$file" 2>/dev/null)
    if [[ "$shebang" =~ ^#! ]]; then
        local interpreter
        interpreter=$(echo "${BASH_REMATCH[1]}" | awk '{print $1}')
        if [[ -n "$interpreter" ]]; then
            if ! command -v "$interpreter" &>/dev/null; then
                result="fail"
                missing_deps+=("MISSING_INTERPRETER: $interpreter")
                log_fail "Missing interpreter: $interpreter"
            fi
        fi
    fi

    if [[ "$result" == "pass" ]]; then
        log_success "Dependency check passed"
    fi

    echo "${missing_deps[@]}"
    return $([[ "$result" == "fail" ]] && echo 1 || echo 0)
}

# ----------------------------------------------------------------------------
# Rule 4: Size Check - Ensures reasonable file sizes
# ----------------------------------------------------------------------------
check_size() {
    local file="$1"
    local check_name="size"
    local result="pass"
    local size_issues=()

    log_info "[4/5] Size Check..."

    # Get file size in KB
    local file_size
    file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
    local file_size_kb=$((file_size / 1024))

    # Check file size
    if [[ $file_size_kb -gt $MAX_FILE_SIZE_KB ]]; then
        result="fail"
        size_issues+=("FILE_TOO_LARGE: ${file_size_kb}KB > ${MAX_FILE_SIZE_KB}KB")
        log_fail "File too large: ${file_size_kb}KB > ${MAX_FILE_SIZE_KB}KB"
    elif [[ $file_size_kb -gt $WARN_FILE_SIZE_KB ]]; then
        log_warn "File size warning: ${file_size_kb}KB > ${WARN_FILE_SIZE_KB}KB"
    fi

    # Check line count for text files
    if [[ "$file" != *.binary ]] && [[ "$file" != *.png ]] && [[ "$file" != *.jpg ]]; then
        local line_count
        line_count=$(wc -l < "$file" 2>/dev/null || echo 0)

        if [[ $line_count -gt $MAX_LINE_COUNT ]]; then
            result="fail"
            size_issues+=("FILE_TOO_LONG: ${line_count} lines > ${MAX_LINE_COUNT} lines")
            log_fail "File too long: ${line_count} lines > ${MAX_LINE_COUNT} lines"
        fi
    fi

    if [[ "$result" == "pass" ]]; then
        log_success "Size check passed (${file_size_kb}KB, $(wc -l < "$file" 2>/dev/null || echo 0) lines)"
    fi

    echo "${size_issues[@]}"
    return $([[ "$result" == "fail" ]] && echo 1 || echo 0)
}

# ----------------------------------------------------------------------------
# Rule 5: Format Check - Validates JSON, YAML, shell scripts
# ----------------------------------------------------------------------------
check_format() {
    local file="$1"
    local check_name="format"
    local result="pass"
    local format_errors=()

    log_info "[5/5] Format Check..."

    # Check JSON format
    if [[ "$file" == *.json ]]; then
        log_debug "Validating JSON format for: $file"
        if command -v jq &>/dev/null; then
            if ! jq empty "$file" 2>/dev/null; then
                result="fail"
                format_errors+=("INVALID_JSON: $file is not valid JSON")
                log_fail "Invalid JSON format"
            fi
        else
            if command -v python3 &>/dev/null; then
                if ! python3 -c "import json; json.load(open('$file'))" 2>/dev/null; then
                    result="fail"
                    format_errors+=("INVALID_JSON: $file is not valid JSON")
                    log_fail "Invalid JSON format"
                fi
            else
                log_warn "No JSON validator available, skipping JSON check"
            fi
        fi
    fi

    # Check YAML format
    if [[ "$file" == *.yaml ]] || [[ "$file" == *.yml ]]; then
        log_debug "Validating YAML format for: $file"
        if command -v python3 &>/dev/null; then
            if ! python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>/dev/null; then
                result="fail"
                format_errors+=("INVALID_YAML: $file is not valid YAML")
                log_fail "Invalid YAML format"
            fi
        elif command -v yq &>/dev/null; then
            if ! yq empty "$file" 2>/dev/null; then
                result="fail"
                format_errors+=("INVALID_YAML: $file is not valid YAML")
                log_fail "Invalid YAML format"
            fi
        else
            log_warn "No YAML validator available, skipping YAML check"
        fi
    fi

    # Check shell script format
    if [[ "$file" == *.sh ]]; then
        log_debug "Validating shell script format for: $file"

        # Check for shebang
        local first_line
        first_line=$(head -1 "$file" 2>/dev/null)
        if [[ ! "$first_line" =~ ^#! ]]; then
            log_warn "Missing shebang"
        fi

        # Check for proper file permissions if executable
        if [[ -x "$file" ]]; then
            local perms
            perms=$(stat -f%Lp "$file" 2>/dev/null || stat -c%a "$file" 2>/dev/null)
            if [[ "$perms" =~ ^0 ]]; then
                log_warn "Executable bit set but no execute permission"
            fi
        fi
    fi

    if [[ "$result" == "pass" ]]; then
        log_success "Format check passed"
    fi

    echo "${format_errors[@]}"
    return $([[ "$result" == "fail" ]] && echo 1 || echo 0)
}

# ============================================================================
# Metrics Functions
# ============================================================================

update_metrics() {
    local check_type="$1"
    local skill="$2"
    local passed="$3"
    local file="$4"

    ensure_metrics_dir
    init_metrics_file

    # Always log to the text log
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] check_type=$check_type skill=$skill passed=$passed file=$file" >> "$QUALITY_LOG" 2>/dev/null || true

    # Try to update JSON metrics (but don't fail if jq is not available or has issues)
    if command -v jq &>/dev/null && [[ -f "$METRICS_FILE" ]]; then
        local temp_file
        temp_file=$(mktemp)

        local passed_str="true"
        if [[ "$passed" == "false" ]]; then
            passed_str="false"
        fi

        # Simpler jq update - handle skill separately
        local skill_key
        if [[ -n "$skill" && "$skill" != "null" ]]; then
            skill_key="$skill"
        else
            skill_key="unknown"
        fi

        jq --arg type "$check_type" \
           --arg skill "$skill_key" \
           --argjson passed "$passed_str" \
           --arg file "$file" \
           --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '
            .total_checks += 1 |
            .last_updated = $timestamp |
            (if $passed then .total_passed += 1 else .total_failed += 1 end) |
            (.by_check_type[$type].checks // 0) += 1 |
            (if $passed then (.by_check_type[$type].passed // 0) += 1 else (.by_check_type[$type].failed // 0) += 1 end) |
            (.by_skill[$skill].checks // 0) += 1 |
            (if $passed then (.by_skill[$skill].passed // 0) += 1 else (.by_skill[$skill].failed // 0) += 1 end)
        ' "$METRICS_FILE" 2>/dev/null > "$temp_file" && mv "$temp_file" "$METRICS_FILE" || rm -f "$temp_file" 2>/dev/null || true
    fi
}

record_failure_pattern() {
    local pattern="$1"
    local file="$2"

    # Only record meaningful patterns (not log messages)
    if [[ "$pattern" =~ ^(BASH_SYNTAX|PYTHON_SYNTAX|NODE_SYNTAX|DANGEROUS_PATTERN|MISSING_DEP|MISSING_INTERPRETER|FILE_TOO_LARGE|FILE_TOO_LONG|INVALID_JSON|INVALID_YAML) ]]; then
        ensure_metrics_dir
        init_metrics_file

        if command -v jq &>/dev/null; then
            local temp_file
            temp_file=$(mktemp)

            jq --arg pattern "$pattern" \
               --arg file "$file" \
               --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '
                .failure_patterns += [{
                    "pattern": $pattern,
                    "file": $file,
                    "timestamp": $timestamp,
                    "count": 1
                }]
            ' "$METRICS_FILE" 2>/dev/null > "$temp_file" && mv "$temp_file" "$METRICS_FILE" || rm -f "$temp_file" 2>/dev/null || true
        fi
    fi
}

# ============================================================================
# Main Check Function
# ============================================================================

run_all_checks() {
    local file="$1"
    local skill="${2:-}"
    local all_passed=true
    local check_count=0
    local pass_count=0

    echo ""
    log_info "Running quality checks on: $file"
    echo "=============================================="

    if [[ ! -f "$file" ]]; then
        log_fail "File not found: $file"
        echo "=============================================="
        echo "RESULT: FILE_NOT_FOUND"
        return 1
    fi

    # Run each check
    for check_func in check_syntax check_safety check_dependencies check_size check_format; do
        ((check_count++))

        # Run check - output goes to stdout/stderr, we capture only the result
        local check_result=0
        $check_func "$file" || check_result=$?

        if [[ $check_result -eq 0 ]]; then
            ((pass_count++))
            update_metrics "${check_func#check_}" "$skill" "true" "$file"
        else
            all_passed=false
            update_metrics "${check_func#check_}" "$skill" "false" "$file"
        fi
    done

    echo "=============================================="
    echo "Check Summary: $pass_count/$check_count passed"
    echo "Result: $([[ "$all_passed" == true ]] && echo "PASSED" || echo "FAILED")"
    echo "=============================================="

    [[ "$all_passed" == true ]] && return 0 || return 1
}

# ============================================================================
# Skill Check
# ============================================================================

check_skill() {
    local skill_name="$1"

    log_info "Checking skill: $skill_name"

    if [[ -f "$SKILL_REGISTRY" ]]; then
        local skill_path
        skill_path=$(jq -r ".skills[] | select(.name == \"$skill_name\") | .path" "$SKILL_REGISTRY" 2>/dev/null)

        if [[ -n "$skill_path" && "$skill_path" != "null" ]]; then
            if [[ -f "$skill_path" ]]; then
                run_all_checks "$skill_path" "$skill_name"
                return $?
            fi
        fi

        skill_path=$(find "${PROJECT_ROOT}/skills" -name "*${skill_name}*" -type f 2>/dev/null | head -1)
        if [[ -n "$skill_path" ]]; then
            run_all_checks "$skill_path" "$skill_name"
            return $?
        fi
    fi

    local skill_file="${PROJECT_ROOT}/skills/${skill_name}.sh"
    if [[ -f "$skill_file" ]]; then
        run_all_checks "$skill_file" "$skill_name"
        return $?
    fi

    log_fail "Skill not found: $skill_name"
    return 2
}

# ============================================================================
# Report Functions
# ============================================================================

show_report() {
    ensure_metrics_dir
    init_metrics_file

    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║           CLAUDE HOURS QUALITY ENFORCEMENT REPORT          ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""

    if [[ ! -f "$METRICS_FILE" ]]; then
        echo "No quality metrics available yet."
        echo ""
        return 0
    fi

    if command -v jq &>/dev/null; then
        local total_checks
        total_checks=$(jq '.total_checks' "$METRICS_FILE")
        local total_passed
        total_passed=$(jq '.total_passed' "$METRICS_FILE")
        local total_failed
        total_failed=$(jq '.total_failed' "$METRICS_FILE")

        local pass_rate=0
        if [[ $total_checks -gt 0 ]]; then
            pass_rate=$((total_passed * 100 / total_checks))
        fi

        echo "📊 Quality Summary"
        echo "────────────────────────────────────────────"
        echo "  Total Checks:     $total_checks"
        echo "  Passed:           $total_passed"
        echo "  Failed:           $total_failed"
        echo "  Pass Rate:        ${pass_rate}%"
        echo ""

        echo "📈 Checks by Type"
        echo "────────────────────────────────────────────"
        jq -r '.by_check_type | to_entries[] | "  \(.key): \(.value.passed // 0)/\(.value.checks // 0) passed"' "$METRICS_FILE" 2>/dev/null || echo "  No data available"
        echo ""

        if [[ $(jq '.by_skill | keys | length' "$METRICS_FILE" 2>/dev/null || echo 0) -gt 0 ]]; then
            echo "🎯 Skills Performance"
            echo "────────────────────────────────────────────"
            jq -r '.by_skill | to_entries[] | "  \(.key): \(.value.passed // 0)/\(.value.checks // 0) passed"' "$METRICS_FILE" 2>/dev/null || echo "  No data available"
            echo ""
        fi

        local failure_count
        failure_count=$(jq '[.failure_patterns[-10:]] | length' "$METRICS_FILE" 2>/dev/null || echo 0)
        if [[ $failure_count -gt 0 ]]; then
            echo "⚠️  Recent Failure Patterns"
            echo "────────────────────────────────────────────"
            jq -r '.failure_patterns[-10:][] | "  - \(.pattern)"' "$METRICS_FILE" 2>/dev/null | head -10 || echo "  No patterns recorded"
            echo ""
        fi

        echo "🏆 Quality Score: $(get_quality_score)"
        echo ""
    else
        echo "Install jq for detailed metrics reporting."
        echo ""
        tail -20 "$QUALITY_LOG" 2>/dev/null || echo "No log entries yet."
    fi
}

get_quality_score() {
    if [[ ! -f "$METRICS_FILE" ]]; then
        echo "N/A"
        return
    fi

    local total_checks
    total_checks=$(jq '.total_checks' "$METRICS_FILE" 2>/dev/null || echo 0)
    local total_passed
    total_passed=$(jq '.total_passed' "$METRICS_FILE" 2>/dev/null || echo 0)

    if [[ $total_checks -eq 0 ]]; then
        echo "N/A"
        return
    fi

    local score=$((total_passed * 100 / total_checks))

    if [[ $score -ge 95 ]]; then
        echo "A+ (Excellent)"
    elif [[ $score -ge 90 ]]; then
        echo "A (Great)"
    elif [[ $score -ge 85 ]]; then
        echo "B+ (Good)"
    elif [[ $score -ge 80 ]]; then
        echo "B (Satisfactory)"
    elif [[ $score -ge 70 ]]; then
        echo "C (Needs Improvement)"
    else
        echo "F (Critical)"
    fi
}

show_metrics() {
    ensure_metrics_dir
    init_metrics_file

    if [[ ! -f "$METRICS_FILE" ]]; then
        echo "No metrics available."
        return
    fi

    if command -v jq &>/dev/null; then
        echo "Full Metrics JSON:"
        echo "────────────────────────────────────────────"
        cat "$METRICS_FILE"
        echo ""
        echo "Quality Log:"
        echo "────────────────────────────────────────────"
        tail -50 "$QUALITY_LOG" 2>/dev/null || echo "No log entries yet."
    else
        echo "Metrics file: $METRICS_FILE"
        echo "Quality log: $QUALITY_LOG"
    fi
}

# ============================================================================
# Integration Function
# ============================================================================

integrate_validation() {
    local target_script="$1"

    if [[ ! -f "$target_script" ]]; then
        log_fail "Script not found: $target_script"
        return 1
    fi

    log_info "Integrating quality validation into: $target_script"

    local integration_code="
# Quality Validation Integration (added by quality-enforcer.sh)
QUALITY_ENFORCER_SCRIPT=\"$(dirname "$0")/quality-enforcer.sh\"
VALIDATION_ENABLED=true

validate_quality() {
    if [[ \"\$VALIDATION_ENABLED\" != \"true\" ]]; then
        return 0
    fi
    local current_file=\"\$1\"
    if [[ -z \"\$current_file\" ]]; then
        current_file=\"\$0\"
    fi
    if [[ -f \"\$QUALITY_ENFORCER_SCRIPT\" ]]; then
        if ! bash \"\$QUALITY_ENFORCER_SCRIPT\" check \"\$current_file\" > /dev/null 2>&1; then
            echo \"[QUALITY ENFORCER] Validation failed for \$current_file\" >&2
            return 1
        fi
    fi
    return 0
}
"

    local temp_file
    temp_file=$(mktemp)
    echo "$integration_code" > "$temp_file"
    cat "$target_script" >> "$temp_file"
    mv "$temp_file" "$target_script"

    log_success "Quality validation integrated into: $target_script"
    echo ""
    echo "Added validate_quality() function. Use: validate_quality \"\$0\""
}

# ============================================================================
# Test Functions
# ============================================================================

run_tests() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║              QUALITY ENFORCER TEST SUITE                   ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""

    local test_dir="${PROJECT_ROOT}/.claude/quality-tests"
    mkdir -p "$test_dir"

    create_test_scripts "$test_dir"

    local passed=0
    local failed=0

    echo "Running tests..."
    echo ""

    echo "Test 1: Valid script should pass"
    if run_all_checks "${test_dir}/good-script.sh" > /dev/null 2>&1; then
        echo "  ✓ PASSED"
        ((passed++))
    else
        echo "  ✗ FAILED"
        ((failed++))
    fi

    echo "Test 2: Invalid bash syntax should be detected"
    if run_all_checks "${test_dir}/bad-syntax.sh" > /dev/null 2>&1; then
        echo "  ✗ FAILED (should have detected syntax error)"
        ((failed++))
    else
        echo "  ✓ PASSED"
        ((passed++))
    fi

    echo "Test 3: Dangerous patterns should be detected"
    if run_all_checks "${test_dir}/dangerous-script.sh" > /dev/null 2>&1; then
        echo "  ✗ FAILED (should have detected dangerous pattern)"
        ((failed++))
    else
        echo "  ✓ PASSED"
        ((passed++))
    fi

    echo "Test 4: Oversized file should be detected"
    if run_all_checks "${test_dir}/large-script.sh" > /dev/null 2>&1; then
        echo "  ✗ FAILED (should have detected oversized file)"
        ((failed++))
    else
        echo "  ✓ PASSED"
        ((passed++))
    fi

    echo "Test 5: Invalid JSON should be detected"
    if run_all_checks "${test_dir}/bad-data.json" > /dev/null 2>&1; then
        echo "  ✗ FAILED (should have detected invalid JSON)"
        ((failed++))
    else
        echo "  ✓ PASSED"
        ((passed++))
    fi

    echo "Test 6: Valid JSON should pass"
    if run_all_checks "${test_dir}/good-data.json" > /dev/null 2>&1; then
        echo "  ✓ PASSED"
        ((passed++))
    else
        echo "  ✗ FAILED"
        ((failed++))
    fi

    echo ""
    echo "────────────────────────────────────────────"
    echo "Test Results: $passed passed, $failed failed"
    echo ""

    if [[ $failed -eq 0 ]]; then
        echo "🎉 All tests passed!"
        return 0
    else
        echo "⚠️  Some tests failed."
        return 1
    fi
}

create_test_scripts() {
    local test_dir="$1"

    cat > "${test_dir}/good-script.sh" << 'EOF'
#!/bin/bash
# Good script for testing
set -euo pipefail
function process() {
    echo "Processing..."
    return 0
}
process
EOF

    cat > "${test_dir}/bad-syntax.sh" << 'EOF'
#!/bin/bash
# Script with syntax errors
function broken() {
    if [[ $# -eq 0
        echo "No args"
    fi
}
broken
EOF

    cat > "${test_dir}/dangerous-script.sh" << 'EOF'
#!/bin/bash
# Dangerous script
rm -rf /tmp/test
chmod -R 777 /path
EOF

    # Create large script (2100 lines to exceed 2000 limit)
    {
        echo "#!/bin/bash"
        echo "# Large script for size testing"
        for i in $(seq 1 2100); do
            echo "# Line $i: Just some content to make the file large"
        done
        echo "echo done"
    } > "${test_dir}/large-script.sh"

    cat > "${test_dir}/bad-data.json" << 'EOF'
{"name": "test", "invalid": json here}
EOF

    cat > "${test_dir}/good-data.json" << 'EOF'
{"name": "test", "value": 123, "active": true}
EOF

    log_info "Test scripts created in: $test_dir"
}

# ============================================================================
# Main Entry Point
# ============================================================================

main() {
    local command="${1:-help}"
    shift || true

    case "$command" in
        check)
            if [[ "${1:-}" == "--skill" ]]; then
                check_skill "${2:-}"
            else
                run_all_checks "${1:-}"
            fi
            ;;
        report)
            show_report
            ;;
        metrics)
            show_metrics
            ;;
        integrate)
            integrate_validation "${1:-}"
            ;;
        test)
            run_tests
            ;;
        help|--help|-h)
            echo "Quality Enforcer for Claude Hours"
            echo ""
            echo "Usage: $0 <command> [options]"
            echo ""
            echo "Commands:"
            echo "  check <file|skill>      Run quality checks"
            echo "  check --skill <name>    Check a skill by name"
            echo "  report                  Show quality summary report"
            echo "  metrics                 Show detailed metrics"
            echo "  integrate <script>      Add validation to a script"
            echo "  test                    Run test suite"
            echo "  help                    Show this help"
            echo ""
            echo "Examples:"
            echo "  $0 check ./scripts/my-script.sh"
            echo "  $0 check --skill parse-json"
            echo "  $0 report"
            ;;
        *)
            echo "Unknown command: $command"
            echo "Use: $0 help"
            exit 2
            ;;
    esac
}

main "$@"
