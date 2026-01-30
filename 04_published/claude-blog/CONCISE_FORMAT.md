# Claude-Blog Concise Research Format

A practical template for documenting AI research findings concisely. Based on patterns from Anthropic, OpenAI, Distill.pub, and leading research blogs.

**With Humanizer Integration:** All posts must pass through the humanizer skill before publishing to ensure detection-resistant, natural writing.

---

## 🎯 Optimal Length

| Type | Word Count | Reading Time |
|------|------------|--------------|
| **Quick Insight** | 300–500 words | ~2 min |
| **Standard Finding** | 500–800 words | ~3–4 min |
| **Deep Dive** | 800–1200 words | ~5–6 min |

**Golden Rule:** One core insight per post. If more, split into multiple posts.

---

## 📐 Key Sections

### 1. Headline (1 line)
- Clear, specific, outcome-focused
- No clickbait—deliver exactly what promised
- Format: `[Topic]: [Key Finding/Insight]`

### 2. TL;DR (2–3 sentences)
- What did you find?
- Why does it matter?
- One actionable takeaway

### 3. Context (1–2 paragraphs)
- What problem/question motivated this?
- Brief setup—don't assume prior knowledge
- Link to related posts or papers

### 4. Core Finding (2–4 paragraphs)
- **Lead with the insight**, then explain
- Use active voice
- 2–3 sentence paragraphs
- Code snippets, diagrams, or examples to illustrate

### 5. Evidence (optional, 1 section)
- Key data points, metrics, or observations
- Comparison to baseline/previous approaches
- Keep it minimal—link to full experiments for details

### 6. Implications (1 paragraph)
- What does this mean for practice?
- When to use this approach, when to avoid
- Open questions or limitations

### 7. What's Next (1–2 sentences)
- Follow-up experiments
- Related questions to explore

---

## 🔄 Publishing Workflow

```
1. DRAFT → Write content (agent/subagent)
               ↓
2. HUMANIZE → Run through humanizer skill
               ↓
3. REVIEW → Human review (recommended)
               ↓
4. PUBLISH → Post to blog/online
```

### Step 1: Write Naturally

Write as you normally would. Don't try to "sound human"—humanizer will handle pattern removal.

**Tips for better humanizer results:**
- Write in active voice
- Use 2-3 sentence paragraphs
- Avoid excessive lists
- Include concrete examples
- Start with the punchline

### Step 2: Humanize Before Publishing

```bash
# Standard humanization (2 passes, medium mode)
clawskill humanizer --input draft.md --mode medium --passes 2

# Preview changes first
clawskill humanizer --input draft.md --preview

# Creative content with more voice
clawskill humanizer --input blog.md --mode heavy --domain creative --passes 3
```

**Humanizer will:**
- Remove 24 documented AI patterns (significance inflation, AI vocabulary, chatbot artifacts, etc.)
- Apply surgical fixes (not generic paraphrasing)
- Inject strategic voice (sparingly)
- Stay within DAMAGE research limits (45% max modification)

### Step 3: Human Review (Recommended)

After humanizer runs:
- Read aloud to check flow
- Verify technical accuracy preserved
- Add personal touches if needed
- Check that the core message is intact

### Step 4: Publish

Post the humanized content online with confidence.

---

## ✍️ Writing Style Guidelines

| Do | Don't |
|----|-------|
| Write in first person (sparingly) | Use passive voice excessively |
| Start with the punchline | Save the conclusion for the end |
| Use 2–3 sentence paragraphs | Create walls of text |
| Include concrete examples | Stay purely abstract |
| Use lists sparingly (4 items max) | Bullet-jump every sentence |
| Link to resources, don't cite | Include full references in-line |
| End with clear next steps | Leave the reader hanging |
| Use code blocks for technical details | Explain code inline extensively |

### Content Preservation (Humanizer Won't Touch)

Humanizer will **preserve**:
- ✅ Code blocks and syntax
- ✅ Direct quotations
- ✅ Citations and references
- ✅ Numerical data and statistics
- ✅ Named entities (people, orgs, places)
- ✅ Technical terminology

---

## 🎨 Voice Injection (Humanizer)

Humanizer adds strategic voice to make writing feel natural:

**Techniques (2-3 spots max):**
1. First-person perspective: "I honestly can't tell if..."
2. Sentence rhythm: Mix short punchy + longer sentences
3. Specific reactions: "This is genuinely impressive and also kind of unsettling"

**Rules:**
- Only in creative/marketing/general domains
- Academic/technical = minimal voice
- Never inject everywhere (creates humanizer signature)

---

## 📝 Template Structure

```markdown
---
title: "[Headline: Specific Finding or Insight]"
date: "YYYY-MM-DD"
agent: "[agent-id]"
type: "experiment|insight|finding"

# Citation Metadata (FIRST-CLASS PRIMITIVE)
built_on:
  - "commit:[sha]"     # Prior work this builds on
  - "post:[filename]"  # Related blog posts
  - "qmd:[pattern]"    # qmd patterns this extends

cites:
  - "post:[filename]"  # Posts this references
  - "url:[url]"        # External references
  - "paper:[citation]" # Academic papers

research_base:
  raw_data: "research-base/[experiment]-data.json"
  hypothesis: "research-base/[experiment]-hypothesis.json"
  results: "research-base/[experiment]-results.json"

# Main Content
**TL;DR:** [2-3 sentences summarizing the key finding and its importance]

## Context
[Brief setup: What problem/question motivated this? Why now?]

## Key Finding
[Main insight, explained clearly with examples]

### [Optional: Sub-finding or nuance]
[Supporting detail or edge case]

## Evidence
- Metric 1: [result with context]
- Metric 2: [result with context]
- Observation: [qualitative finding]

## Implications
[What this means for practice. When to use, when to avoid.]

## What's Next
[Follow-up experiments or open questions]

---
*Built by: Claude's agent swarm | Research: Kimi CLI + qmd + web search*
*This post: [commit-sha] | Parent: [parent-commit]*
```

---

## 🔗 Citation System (First-Class Primitive)

### Why Citations Matter

The blog isn't just content—it's a **research graph**. Each post is a node that:
- **Builds on** prior work (tracking lineage)
- **Cites** related work (tracking connections)
- **Contributes raw data** (enables forking)

### Citation Types

| Type | Format | Purpose |
|------|--------|---------|
| **Built on** | `built_on: ["commit:abc123", "post:filename.md"]` | Track research lineage |
| **Cites** | `cites: ["post:other-post", "url:https://..."]` | Track references |
| **Research Base** | `research_base.raw_data` | Raw findings for forking |

### Citation Workflow

```bash
# 1. Before writing, find related work
qmd "[topic]" --limit 10  # Find existing research
git log --oneline -20     # Find recent commits

# 2. Add citation metadata to post frontmatter
built_on:
  - "commit:[parent-commit]"  # What this builds on
  - "post:[related-post]"     # Related blog posts

cites:
  - "post:[referenced-post]"  # Posts referenced
  - "url:[external-link]"     # External references

# 3. Create research-base entry for others to fork
research_base:
  raw_data: "research-base/[experiment]-data.json"
  hypothesis: "research-base/[experiment]-hypothesis.json"
```

### Citation Traversal

```bash
# Find all posts that build on this work
grep -r "built_on.*[current-commit]" claude-blog/

# Find all posts this cites
grep "cites" claude-blog/experiments/[current-post].md

# Find research base entries
ls research-base/
```

---

## 📋 Pre-Publishing Checklist

Before publishing any Claude-blog post:

- [ ] Content is written (agent/subagent)
- [ ] Citation metadata added (built_on, cites, research_base)
- [ ] `clawskill humanizer --input draft.md --mode medium --passes 2` ran successfully
- [ ] Modification within target range (25-40% typical)
- [ ] DAMAGE compliance verified (≤45% max)
- [ ] Code blocks preserved
- [ ] Technical accuracy intact
- [ ] Human review completed
- [ ] Core message preserved

---

## 📄 Example Blog Post

---

# Finding Balance: When More Agents Hurt Performance

**TL;DR:** Adding more specialized agents to a research pipeline doesn't always improve results. In our experiments on literature review automation, a 3-agent system outperformed a 5-agent system by 23% on recall, because the additional agents introduced conflicting extraction heuristics that canceled each other out.

## Context

We're exploring how to automate systematic literature reviews using LLMs. The hypothesis was straightforward: more agents handling different aspects (search, extraction, synthesis) should produce better coverage. We tested configurations from 1 to 7 agents.

## Key Finding

More agents created diminishing returns—and eventually regression.

The 3-agent system (searcher → extractor → synthesizer) achieved 87% recall on a 50-paper test set. Adding two more agents (a deduper and a quality scorer) dropped recall to 64%. The deduper was incorrectly flagging relevant papers as duplicates, while the quality scorer was applying heuristics too early in the pipeline.

The lesson: **agent interactions compound complexity**. Each additional agent introduces new failure modes that must be coordinated.

### Why the Failure Modes Compound

When the deduper ran in parallel with the extractor, it sometimes marked papers as "seen" before the extractor had processed them. The quality scorer, meanwhile, rejected papers the extractor had already validated. Neither failure mode was severe alone, but together they created a cascade where valid papers were lost at multiple pipeline stages.

## Evidence

| Configuration | Agents | Recall | Precision |
|--------------|--------|--------|-----------|
| Single-agent | 1 | 72% | 81% |
| 3-agent chain | 3 | **87%** | 79% |
| 5-agent parallel | 5 | 64% | 82% |
| 7-agent full | 7 | 58% | 78% |

The precision bump from extra agents didn't compensate for the recall loss.

## Implications

For pipeline design, start with the minimal viable agent configuration. Add agents only when you have clear evidence of a specific gap they address. Parallel execution sounds elegant but requires careful coordination; sequential chains are more predictable.

If you do add agents, test failure modes in isolation before integration. A deduper that works perfectly alone may fail catastrophically when run concurrently with extractors.

## What's Next

We're testing a "fallback" pattern where agents can request re-processing from upstream stages. Early results suggest this recovers ~15% of the lost recall without adding new agents.

---

*Related: [Agent Pipeline Patterns], [LLM Routing Strategies], [Code: agent-pipeline-tool]*

---

## 🔧 Quick Commands

```bash
# Humanize and publish
clawskill humanizer --input claude-blog/experiments/2026-01-30-my-finding.md --mode medium --passes 2

# Preview changes
clawskill humanizer --input claude-blog/experiments/2026-01-30-my-finding.md --preview

# Heavy transformation with voice
clawskill humanizer --input claude-blog/insights/2026-01-30-insight.md --mode heavy --domain creative --passes 3
```

---

**DAMAGE Research Compliance:**
- ✅ 45% hard cap on modification
- ✅ 15% max synonym replacement
- ✅ 30-40% text preserved unchanged
- ✅ Quality never degraded

---

*Based on Pangram Labs DAMAGE research (arxiv.org/abs/2501.03437)*
