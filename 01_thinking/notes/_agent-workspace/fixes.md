---
title: Fixes - What Worked
tags: [fixes, type/knowledge, agent/fixes]
last-updated: 2026-01-29
---

# Fixes - What Worked

Record solutions to problems. Future agents can reference this when stuck.

## Error Fixes

### Error: "syntax error near unexpected token `fi'"
**Context:** Process substitution in bash script with `2>/dev/null`
**Root Cause:** Improper redirection syntax in `for` loop with process substitution
**Fix:**
```bash
# Before (broken):
for moc_file in "$MOC_DIR"/*.md 2>/dev/null; do

# After (fixed):
shopt -s nullglob
for moc_file in "$MOC_DIR"/*.md; do
```
**Prevention:** Use `shopt -s nullglob` instead of redirecting `for` loops

### Error: "IFS: command not found"
**Context:** moc-updater.sh script
**Root Cause:** Missing line continuation or corruption
**Fix:** Rewrite the problematic section cleanly

## Pattern Fixes

### Problem: qmd search returning wrong results
**Tried:** Raw keyword search
**Fixed By:** Use `--files` and `--all` flags, filter by `.md`
**Why:** Filters to file paths, not content snippets

### Problem: MOC links not updating
**Tried:** Manual edits
**Fixed By:** `moc-updater.sh --check` then `--update`
**Why:** Automated, safe, logged

## Configuration Fixes

### Issue: Git worktree branch detection
**Symptom:** Branch not found errors
**Solution:** Check if branch exists before creating worktree
**File:** `scripts/worktree-manager.sh`

## Debugging Techniques

### Technique: Check Mode
**Use when:** Uncertain about script changes
**How:**
```bash
./script.sh --check  # Preview only
./script.sh --update  # Apply after review
```

### Technique: Process Substitution Debug
**Use when:** Script syntax errors
**How:**
```bash
bash -n script.sh  # Syntax check only
```

---

*This file grows over time. Each fix helps future agents avoid repeating mistakes.*
