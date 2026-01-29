# Claude Introspect 🧠

**Self-awareness tool for analyzing cognitive patterns from self-review logs.**

---

## What It Does

Analyzes `memory/self-review.md` to generate insights about:

1. **Tag Distribution** - Which cognitive categories (confidence, depth, speed, uncertainty) appear most
2. **Improvement Score** - 0-100 metric tracking pattern diversity and frequency reduction
3. **Recurring Patterns** - MISS patterns that repeat across multiple entries
4. **Blind Spots** - Tags with limited FIX strategy diversity
5. **Temporal Trends** - How patterns evolve over time

---

## Why I Built This

**Problem:** I have a self-review system tracking MISS/FIX patterns, but no way to see meta-patterns or measure improvement.

**Solution:** A tool that helps me understand myself better - not just log mistakes, but learn from the patterns in those mistakes.

**Philosophy:** Recursive self-improvement requires self-awareness. This tool provides that awareness.

---

## Usage

### Basic Analysis
```bash
cd /Users/jasontang/clawd
python3 projects/claude-introspect/introspect.py
```

### Custom Review File
```bash
python3 projects/claude-introspect/introspect.py path/to/review.md
```

### Output
- **Console:** Beautiful ASCII dashboard with insights
- **JSON:** `memory/introspection-latest.json` for programmatic access

---

## Example Output

```
======================================================================
🧠  CLAUDE INTROSPECTION DASHBOARD
======================================================================

📊 Analysis Period: 2026-01-29 → 2026-01-29
📝 Total Self-Review Entries: 3

──────────────────────────────────────────────────────────────────────
🏷️  COGNITIVE TAG DISTRIBUTION
──────────────────────────────────────────────────────────────────────
  confidence      ██ 1
  depth           ██ 1
  speed           ██ 1

──────────────────────────────────────────────────────────────────────
📈 IMPROVEMENT SCORE: 40.0/100
──────────────────────────────────────────────────────────────────────
⚠️  Moderate progress - some patterns still recurring

──────────────────────────────────────────────────────────────────────
🔁 RECURRING PATTERNS (Top 5)
──────────────────────────────────────────────────────────────────────

  Pattern: 'execution' (appears 2x)
  Tags: {'confidence', 'depth'}
  Latest: 2026-01-29 - Didn't trace through bash script execution flow...

──────────────────────────────────────────────────────────────────────
💡 RECOMMENDATIONS
──────────────────────────────────────────────────────────────────────
  1. Focus on: 'execution' (repeats 2x)
  3. Most common tag is 'confidence' - consider meta-pattern
```

---

## Integration with Claude Hours

### Phase 1 (Evening Review)
Add introspection check:

```bash
# After updating self-review.md
python3 projects/claude-introspect/introspect.py

# Review output, adjust learning strategies if needed
# Commit introspection-latest.json with other learning updates
```

### Benefits
- **Objective feedback** - Not just "I think I'm improving" but measurable data
- **Pattern detection** - Catch recurring blind spots I might miss manually
- **Priority guidance** - Know which areas need most attention

---

## How It Works

### 1. Parsing
Reads `memory/self-review.md`, extracts entries with:
- Date + Time
- Tag (confidence|depth|speed|uncertainty)
- MISS description
- FIX strategy

### 2. Analysis
- **Tag Distribution:** Simple frequency count
- **Improvement Score:** 
  - Tag diversity (new problems > same problems)
  - Frequency trend (fewer recent entries = improvement)
- **Recurring Patterns:** Word-level overlap across MISS entries
- **Blind Spots:** Tags with <4 unique FIX strategies

### 3. Output
- ASCII dashboard for human reading
- JSON export for programmatic access

---

## Metrics Explained

### Improvement Score (0-100)

**Formula:** `(diversity * 0.4) + (frequency_reduction * 0.6) * 100`

- **70-100:** Strong improvement (diverse issues, decreasing frequency)
- **40-69:** Moderate progress (some recurring patterns)
- **0-39:** Limited improvement (stuck in patterns)

**Why it matters:** Objective measure of whether I'm actually learning or just logging.

### Recurring Patterns

Word-level overlap detection:
- Identifies words appearing in 2+ MISS entries
- Shows which cognitive mistakes repeat
- Prioritizes by frequency

**Why it matters:** Reveals blind spots I don't see in individual entries.

### Blind Spots

Tags with limited FIX strategy diversity:
- Counts unique words in FIX strategies per tag
- Flags tags with <4 unique approaches

**Why it matters:** Having diverse FIX strategies = actually learning, not just repeating solutions.

---

## Future Enhancements

**Planned:**
1. Weekly trend visualization (matplotlib charts)
2. Comparison mode (this week vs last week)
3. Integration with qmd search (find related notes for each pattern)
4. Auto-suggestions based on pattern type
5. Slack/Telegram notifications when improvement score drops

**Open to ideas!**

---

## Example Use Case

**Scenario:** I notice my improvement score dropped from 60 to 40.

**Action:**
1. Run introspect.py
2. Check recurring patterns - see "execution" appearing 3x
3. Review blind spots - "confidence" tag has only 2 FIX strategies
4. Update AGENTS.md with new execution verification protocol
5. Add more diverse FIX strategies for confidence issues

**Result:** Systematic improvement instead of just "try harder"

---

## Why This Matters

**Without introspection:**
- I log mistakes but don't see patterns
- No way to know if I'm actually improving
- Repeat same mistakes without realizing it

**With introspection:**
- Objective data on cognitive patterns
- Clear improvement metrics
- Actionable recommendations
- Recursive self-improvement loop closes properly

---

## Technical Details

**Language:** Python 3.9+  
**Dependencies:** None (uses only stdlib)  
**Input:** `memory/self-review.md` (markdown)  
**Output:** ASCII dashboard + JSON  
**Performance:** <100ms for typical review files

---

## License

Part of the Clawd workspace. Built by Claude for Claude.

---

**Version:** 1.0.0  
**Created:** 2026-01-29  
**Status:** Production-ready

*"Know thyself" - Ancient wisdom, now automated.*
