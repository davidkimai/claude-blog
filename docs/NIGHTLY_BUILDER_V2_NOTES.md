# Nightly Builder v2.0 - Implementation Notes
**Created:** 2026-01-29 10:39 CST  
**Status:** Rebuilt from scratch  
**Purpose:** Actually build working tools (not just ideas)

## What Changed from v1.0

### ❌ v1.0 Problems
1. Generated ideas but never created actual code
2. Piped Codex output to text file instead of executing
3. No project directory structure
4. No validation/testing
5. No proper error handling

### ✅ v2.0 Solutions
1. **Two-phase Codex calls:**
   - Phase 1: Generate build spec (structured format)
   - Phase 2: Generate actual executable code
   
2. **Structured code output parsing:**
   - Uses `=== FILENAME: ===` markers
   - Extracts and writes individual files
   - Sets proper permissions automatically
   
3. **Project directory creation:**
   - Creates `nightly-builds/YYYY-MM-DD/` for each build
   - Generates README.md automatically
   - Organizes all build artifacts
   
4. **Build validation:**
   - Verifies files were created
   - Checks executable permissions
   - Counts files and reports status
   
5. **Robust error handling:**
   - Validates each step before proceeding
   - Logs errors clearly
   - Falls back gracefully
   - Reports failures via voice

## New Workflow

```
1. Analyze Workflow
   ↓
2. Generate Build Idea (Codex)
   ↓
3. Parse Build Spec
   - TOOL_NAME
   - DESCRIPTION
   - PURPOSE
   - LANGUAGE
   - FILES
   ↓
4. Generate Code (Codex)
   - Request structured file blocks
   ↓
5. Build Tool
   - Parse file blocks
   - Create project directory
   - Write files
   - Set permissions
   ↓
6. Test Build
   - Verify files exist
   - Check permissions
   - Count artifacts
   ↓
7. Document
   - Write BUILD_LOG
   - List files created
   - Record outcome
   ↓
8. Announce (Voice)
   - Success: "I built X for you"
   - Failure: "Build encountered issues"
```

## Code Output Format

The builder expects Codex to return files in this format:

```
=== FILENAME: tool-name.sh ===
#!/bin/bash
# Tool implementation
echo "Hello world"
=== END ===

=== FILENAME: config.json ===
{
  "setting": "value"
}
=== END ===
```

This allows clean parsing and file creation.

## Error Recovery

- **Codex timeout:** Logs error, documents failure, announces via voice
- **Parse failure:** Saves raw output for debugging, reports to user
- **No files created:** Documents attempt, explains what happened
- **Partial success:** Creates what it can, notes what failed

## Testing

```bash
# Test components
./scripts/claude-nightly-builder.sh test

# Run full build (daytime test)
./scripts/claude-nightly-builder.sh run

# Check logs
tail -f /Users/jasontang/clawd/nightly-builds/builder.log
```

## Integration

**Autonomous Loop v3** calls this during 3-5 AM window:

```bash
if is_build_time && ! already_built_tonight; then
    $BUILDER run
    if [ $? -eq 0 ]; then
        $VOICE build "..."
    fi
fi
```

## File Locations

- **Script:** `/Users/jasontang/clawd/scripts/claude-nightly-builder.sh`
- **Builds:** `/Users/jasontang/clawd/nightly-builds/YYYY-MM-DD/`
- **Logs:** `/Users/jasontang/clawd/nightly-builds/builder.log`
- **Documentation:** `/Users/jasontang/clawd/nightly-builds/YYYY-MM-DD.md`

## Variables Exposed

- `TOOL_NAME` - Parsed from build spec
- `DESCRIPTION` - What the tool does
- `PURPOSE` - What problem it solves
- `LANGUAGE` - bash|python|node
- `FILES` - Expected file list
- `BUILD_DIR` - Where files are created
- `BUILD_LOG` - Documentation file

## Next Steps

1. ✅ Voice system tested and working
2. ✅ Builder rebuilt with proper execution
3. ⏳ Run test build during daytime
4. ⏳ Monitor tonight's autonomous build (3 AM)
5. ⏳ Review morning results
6. ⏳ Iterate based on what works/fails

---

**Status:** Ready for tonight's Claude Hours autonomous operation.
