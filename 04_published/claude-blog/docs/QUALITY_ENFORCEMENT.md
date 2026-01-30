# Quality Enforcement Pipeline

Quality gates to prevent failures like the 01-30 death spiral through systematic validation.

## Overview

The Quality Enforcement Pipeline (`scripts/quality-enforcer.sh`) provides automated quality checks for Claude Hours overnight development. It validates all artifacts before they're considered complete.

## 5 Validation Rules

| Rule | Check | Blocking |
|------|-------|----------|
| **1. Syntax** | `bash -n`, `python -m py_compile` | ❌ FAIL on error |
| **2. Safety** | Dangerous patterns (rm -rf, eval $) | ⚠️ WARN or FAIL |
| **3. Dependencies** | Required files and commands exist | ⚠️ WARN |
| **4. Size** | Files under 100KB | ⚠️ WARN |
| **5. Format** | Valid JSON/YAML, proper shebang | ❌ FAIL on error |

## Usage

### Basic Check
```bash
./scripts/quality-enforcer.sh check ./path/to/script.sh
```

### Check a Skill
```bash
./scripts/quality-enforcer.sh check --skill parse-json
```

### Generate Quality Report
```bash
./scripts/quality-enforcer.sh report              # Today's summary
./scripts/quality-enforcer.sh report --period week  # Weekly report
```

### Validate Goal Before Execution
```bash
./scripts/quality-enforcer.sh validate-goal .claude/orchestra/tonights-goals.md
```

### Track Skill Performance
```bash
./scripts/quality-enforcer.sh track-skill parse-json success
./scripts/quality-enforcer.sh track-skill parse-json failure
```

## Integration Points

### 1. Skill Library Integration
Quality checks are logged to `memory/skill-usage.json` with:
- Success/failure per skill
- Average score over time
- Pattern detection

### 2. Goal Generator Integration
Before executing subgoals, validate them:
```bash
./quality-enforcer.sh validate-goal ./tasks/my-goal.md
```
Checks for:
- Clear objectives
- Success criteria
- Milestones
- Dependencies
- Quality gates

### 3. Morning Report Integration
The `claude-hours-nightly.sh` morning report includes:
- Quality score from overnight checks
- Check type breakdown
- Common failure patterns
- Improvement trends

## Metrics Tracked

### Files
- `/.claude/quality-metrics/daily-YYYY-MM-DD.json` - Daily check results
- `/.claude/quality-metrics/skill-metrics.json` - Per-skill performance
- `/.claude/quality-metrics/failure-patterns.log` - Common failure patterns

### Metrics
| Metric | Description |
|--------|-------------|
| Pass rate | Percentage of checks passing |
| Average score | Mean quality score (0-100) |
| Failure patterns | Recurring issues detected |
| Skill performance | Per-skill quality tracking |
| Trend | Improvement over time |

## Example Output

```
╔══════════════════════════════════════════════════════════╗
║          🔍 Quality Enforcement Check                    ║
╚══════════════════════════════════════════════════════════╝

Target: ./scripts/my-script.sh

[1/5] Syntax Check...
  ✓ Syntax valid
[2/5] Safety Check...
  ✓ No dangerous patterns
[3/5] Dependency Check...
  ✓ Dependencies OK
[4/5] Size Check...
  ✓ Size acceptable
[5/5] Format Check...
  ✓ Format valid

═══ Results ═══
  Syntax:      PASS      
  Safety:      PASS      
  Dependencies: PASS      
  Size:        PASS      
  Format:      PASS      
  ─────────────────────────────────
  Score:       100%

╔══════════════════════════════════════════════════════════╗
║          ✅ QUALITY CHECK PASSED                         ║
╚══════════════════════════════════════════════════════════╝
```

## Test Suite

Run the test suite to verify the quality enforcer:
```bash
./scripts/quality-enforcer-test.sh
```

### Test Files
| File | Purpose |
|------|---------|
| `.claude/test-quality/good-script.sh` | Valid script that should pass |
| `.claude/test-quality/bad-script.sh` | Script with warnings |
| `.claude/test-quality/good-script.py` | Valid Python script |
| `.claude/test-quality/bad-script.py` | Python with syntax errors |

## Dangerous Patterns Detected

The safety check flags these patterns:

| Pattern | Risk Level | Description |
|---------|------------|-------------|
| `rm -rf /` | CRITICAL | Deletes root filesystem |
| `rm -rf $VAR` | HIGH | Uncontrolled deletion |
| `chmod 777` | MEDIUM | Excessive permissions |
| `curl \| sh` | HIGH | Arbitrary code execution |
| `eval $VAR` | HIGH | Command injection |
| `:(){ :\|:& };:` | CRITICAL | Fork bomb |
| Hardcoded passwords | HIGH | Security risk |

## Configuration

No configuration required. Default thresholds:
- Max file size: 100KB
- Min pass score: 70%
- Max errors before failure: 0 (syntax/format)

## Error Codes

| Code | Meaning |
|------|---------|
| 0 | All checks passed |
| 1 | Check failed (syntax/format error) |

## Troubleshooting

### Quality check fails on good file
- Check file permissions (`chmod +x script.sh`)
- Verify syntax with `bash -n script.sh`
- Check for Windows line endings (`dos2unix`)

### Safety warnings on safe script
- Review comments with `# rm -rf` (even commented)
- Check for `eval` usage (even safe uses)
- Verify no hardcoded credentials

### Report shows no data
- Run at least one quality check first
- Check metric files exist in `.claude/quality-metrics/`
- Verify `memory/` directory is writable

## Best Practices

1. **Run before commit**: `./quality-enforcer.sh check ./changed-file.sh`
2. **Validate goals**: Check goals before overnight execution
3. **Track skills**: Mark skill success/failure for learning
4. **Review patterns**: Check failure patterns for systemic issues
5. **Monitor trends**: Use weekly reports to see improvement

## See Also

- `scripts/claude-hours-nightly.sh` - Claude Hours nightly setup
- `scripts/claude-hours-report.sh` - Morning report generator
- `memory/skill-usage.json` - Skill performance data
