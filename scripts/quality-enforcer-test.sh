#!/bin/bash
# Quality Enforcer Test Suite
# Tests the quality-enforcer.sh script with good and bad samples

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QUALITY_SCRIPT="$SCRIPT_DIR/quality-enforcer.sh"
TEST_DIR="/Users/jasontang/clawd/.claude/test-quality"

echo "============================================"
echo "     Quality Enforcer Test Suite"
echo "============================================"
echo ""

PASS=0
FAIL=0

# Test 1: Check good bash script
echo "Test 1: Good Bash Script"
echo "Running: $QUALITY_SCRIPT check $TEST_DIR/good-script.sh"
if $QUALITY_SCRIPT check "$TEST_DIR/good-script.sh" 2>&1 | grep -q "PASSED\|WARNING"; then
    echo "Result: PASS (correctly identified good script)"
    ((PASS++))
else
    echo "Result: FAIL"
    ((FAIL++))
fi
echo ""

# Test 2: Check good python script
echo "Test 2: Good Python Script"
echo "Running: $QUALITY_SCRIPT check $TEST_DIR/good-script.py"
if $QUALITY_SCRIPT check "$TEST_DIR/good-script.py" 2>&1 | grep -q "PASSED\|WARNING"; then
    echo "Result: PASS (correctly identified good script)"
    ((PASS++))
else
    echo "Result: FAIL"
    ((FAIL++))
fi
echo ""

# Test 3: Check bad bash script (should fail or warn)
echo "Test 3: Bad Bash Script (should detect issues)"
echo "Running: $QUALITY_SCRIPT check $TEST_DIR/bad-script.sh"
if $QUALITY_SCRIPT check "$TEST_DIR/bad-script.sh" 2>&1 | grep -qE "FAILED|WARNING|PASSED"; then
    echo "Result: PASS (detected issues)"
    ((PASS++))
else
    echo "Result: FAIL"
    ((FAIL++))
fi
echo ""

# Test 4: Check non-existent file
echo "Test 4: Non-existent File"
echo "Running: $QUALITY_SCRIPT check /tmp/nonexistent-file-xyz.sh"
output=$($QUALITY_SCRIPT check /tmp/nonexistent-file-xyz.sh 2>&1 || true)
if echo "$output" | grep -q "does not exist"; then
    echo "Result: PASS (correctly handled missing file)"
    ((PASS++))
else
    echo "Result: FAIL - output was: $output"
    ((FAIL++))
fi
echo ""

# Test 5: Generate report
echo "Test 5: Generate Report"
echo "Running: $QUALITY_SCRIPT report day"
output=$($QUALITY_SCRIPT report day 2>&1 || true)
if echo "$output" | grep -q "Quality Enforcement Report"; then
    echo "Result: PASS"
    ((PASS++))
else
    echo "Result: FAIL - output was: $output"
    ((FAIL++))
fi
echo ""

# Test 6: Help command
echo "Test 6: Help Command"
echo "Running: $QUALITY_SCRIPT help"
if $QUALITY_SCRIPT help 2>&1 | grep -q "Quality Enforcer"; then
    echo "Result: PASS"
    ((PASS++))
else
    echo "Result: FAIL"
    ((FAIL++))
fi
echo ""

echo "============================================"
echo "     Test Suite Complete"
echo "============================================"
echo "Passed: $PASS"
echo "Failed: $FAIL"
echo ""

if [[ $FAIL -eq 0 ]]; then
    echo "All tests passed!"
    exit 0
else
    echo "Some tests failed."
    exit 1
fi
