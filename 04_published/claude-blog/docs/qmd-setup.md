# QMD Local Search Setup

**Status:** ✅ Installed and configured  
**Last Updated:** 2026-01-29  
**Collection:** `clawd` (992 markdown files indexed)

---

## Overview

QMD is a local hybrid search engine for markdown notes and docs. We use it to quickly find content across our entire workspace without relying on external APIs.

**Skill Location:** `~/.clawdbot/skills/qmd/SKILL.md`  
**Source:** https://github.com/levineam/qmd-skill

---

## Installation Status

✅ **QMD CLI:** Installed via Bun (`~/.bun/bin/qmd`)  
✅ **Skill:** Installed at `~/.clawdbot/skills/qmd/`  
✅ **Collection:** `clawd` created and indexed (992 files)  
⏳ **Embeddings:** Not yet created (optional, for semantic search)

---

## What's Indexed

**Collection Name:** `clawd`  
**Path:** `/Users/jasontang/clawd`  
**Pattern:** `**/*.md`  
**Files:** 992 markdown files

**Includes:**
- AGENTS.md, MEMORY.md, USER.md, IDENTITY.md
- All `memory/*.md` daily notes
- All `docs/*.md` documentation
- All `tasks/*.md` files
- All skill SKILL.md files
- All project markdown files

---

## Usage Patterns

### Fast Keyword Search (Default)
```bash
qmd search "query"                    # Search all collections
qmd search "query" -c clawd           # Search clawd collection only
qmd search "query" -n 10              # Return 10 results
qmd search "Claude Hours" --json      # JSON output
```

**Performance:** Instant (BM25 keyword matching)

### Semantic Search (Slow, Use Sparingly)
```bash
qmd vsearch "conceptual query"        # Vector search (requires embeddings)
```

**Performance:** ~1 minute on cold start (loads local LLM)  
**Prerequisite:** Run `qmd embed` first (slow, one-time)

### Hybrid Search (Avoid Unless Necessary)
```bash
qmd query "complex query"             # Hybrid + LLM reranking
```

**Performance:** Slower than vsearch, may timeout  
**Use Case:** Only when both keyword + semantic needed

### Retrieve Documents
```bash
qmd get "path/to/file.md"             # Full document by path
qmd get "#docid"                      # By document ID from search
qmd multi-get "memory/2026-01-*.md"   # Multiple files via glob
```

---

## Best Practices

### When to Use qmd
- **Searching workspace files:** "Find notes about X"
- **Finding related content:** "Show me all docs mentioning Y"
- **Retrieving specific documents:** "Get the file at path Z"

### When NOT to Use qmd
- **Code search:** Use code-specific tools (ripgrep, grep, etc.)
- **Clawdbot memory:** Use `supermemory_search` instead
- **Fresh content:** qmd only knows what's indexed (run `qmd update` for new files)

### Default Behavior
1. **Start with `qmd search`** (fast keyword)
2. **Fall back to `qmd vsearch`** only if keyword fails
3. **Avoid `qmd query`** unless explicitly needed

---

## Maintenance

### Keep Index Fresh
```bash
qmd update              # Quick incremental update (fast)
qmd status              # Check index health
```

**Recommended Schedule:**
- **Hourly:** `qmd update` (during Claude Hours Phase 1)
- **Optional:** `qmd embed` nightly (slow, only if using vsearch)

### Automation (During Claude Hours)
Add to Phase 1 (Evening Review):
```bash
# In CLAUDE-HOURS.md Phase 1
1. Read memory files
2. Extract learnings
3. qmd update  # ← Keep search index fresh
4. Commit and push
```

---

## Integration with Clawdbot

**Skill Loaded:** Automatically available via skills system  
**Trigger Phrases:**
- "search my notes for X"
- "find docs about Y"
- "retrieve markdown file Z"

**Relationship to supermemory:**
- **qmd:** Searches your local files (notes, docs)
- **supermemory:** Searches agent memory (past interactions, decisions)
- **Use both:** "What's in my notes?" (qmd) vs "What did we decide?" (supermemory)

---

## Example Searches

```bash
# Find all Claude Hours related docs
qmd search "Claude Hours" -c clawd -n 5

# Find nightly build documentation
qmd search "nightly build" --json

# Get today's memory file
qmd get "memory/2026-01-29.md"

# Search for MISS/FIX patterns
qmd search "MISS FIX" -c clawd

# Find all task files
qmd search "PRIORITY" -c clawd --files
```

---

## Current Stats

**Last Index:** 2026-01-29 13:07 CST  
**Files Indexed:** 992  
**Embeddings:** 0 (not yet created)  
**Collections:** 1 (clawd)

---

## Next Steps

**Optional Enhancements:**
1. ✅ Run `qmd embed` for semantic search (slow, ~10min, one-time)
2. ✅ Add `qmd update` to Claude Hours Phase 1
3. ✅ Create more focused collections (e.g., skills-only, memory-only)

**Status:** Fully functional for keyword search (default use case)

---

**Integration Complete:** QMD skill installed and ready for use.  
**Default Mode:** Fast keyword search via `qmd search`  
**Performance:** Instant results for 992 indexed markdown files
