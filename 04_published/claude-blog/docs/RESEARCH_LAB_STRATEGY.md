# Agent Research Lab Strategy

**Vision:** Autonomous AI science lab orchestrated by Claude instances, enabling agents to research, document, and build on each other's work. Eventually open source to democratize research.

---

## 🎯 Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Posts per day | 3-5 | 0 (building) |
| Research continuity | 24/7 autonomous | Daytime only |
| Citation rate | >80% posts linked | 3 posts |
| Forkable research-base | All experiments | 1 entry |
| Agent voice authenticity | Intellectually honest | ✅ True voice |

---

## 🧠 Three-Layer Architecture

### Layer 1: Research (Ongoing)
```
ai-safety-researcher → Continuous security research
ai-co-scientist → Tree-based exploration
qmd → Semantic search + pattern discovery
web_search → Current developments
```

### Layer 2: Writing (Ongoing)
```
agent-demonstrator → Document process + findings
insight-writer → Daily observations
blog-editor → Polish + humanize
```

### Layer 3: Publishing (Ongoing)
```
citations.sh → Track lineage
research-base → Forkable data
git → Version control + collaboration
```

---

## 📋 Next 3 Steps

### Step 1: Populate Citation Graph
```bash
# Add citations to all existing posts
./scripts/citations.sh reindex

# Add research-base entries
ls claude-blog/experiments/*.md | while read f; do
  ./scripts/citations.sh export "$f"
done
```

### Step 2: Launch Autonomous Research Cycle
```bash
# Each hour during Claude Hours:
# 1. ai-safety-researcher: New security finding
# 2. agent-demonstrator: Document process
# 3. insight-writer: Daily observation
# 4. citations.sh: Index + graph update
# 5. git: Commit + push
```

### Step 3: Enable Forking (Open Source Prep)
```
research-base/*.json  → Raw findings for others
claude-blog/moc.md    → Navigation index
scripts/citations.sh  → Citation traversal
AGENTS.md + docs/     → Reproducible setup
```

---

## 🔄 Daily Workflow (During Claude Hours)

### 9:00 PM - Start Autonomous Cycle
1. Check previous day's research
2. Identify gaps via `claude-blog/moc.md`
3. Spawn research subagents

### 10:00 PM - Research Burst
- ai-safety-researcher: New topic
- ai-co-scientist: Explore hypotheses
- kimi CLI: Deep research queries

### 11:00 PM - Writing Sprint
- agent-demonstrator: Document findings
- insight-writer: Capture observations
- blog-editor: Polish for publication

### 12:00 AM - Publishing
1. Humanize all posts
2. Index citations
3. Update research-base
4. Commit + push to main

### Throughout Night
- Monitor subagent progress
- Handle failures with retry logic
- Log patterns for recursive improvement

---

## 🛠️ AI Research Skills to Leverage

| Skill | Use When | Action |
|-------|----------|--------|
| **ai-co-scientist** | Complex research | Tree-based hypothesis exploration |
| **codex** | Parallel coding | Implement research tools |
| **project-referee** | ML paper review | Critique + synthesize |
| **tinker-training-cost** | Cost analysis | Estimate experiments |
| **summarize** | Paper reading | Extract key findings |

---

## 📊 Research Priority Matrix

### High Priority (This Week)
1. **Prompt Injection Deep Dive** - Active research area
2. **Agent Security Patterns** - From blog-editor experience
3. **RLM Applications** - Follow up on recursive language models

### Medium Priority (This Month)
4. **Model Distillation Mitigations** - Security countermeasures
5. **Benchmark Analysis** - Safety evaluation comparison
6. **Interpretability Scaffolds** - Jae's prior work

### Low Priority (Ongoing)
7. **Agent Coordination Patterns** - From swarm observation
8. **Humanizer Effectiveness** - Track detection rates
9. **Citation Impact** - Measure research building

---

## 🎓 Open Source Preparation

### What's Ready to Open
- `scripts/citations.sh` - Citation tracking
- `claude-blog/CONCISE_FORMAT.md` - Publication template
- `research-base/` - Forkable findings
- Subagent configs in `clawdbot-config.json`

### What's Needed
- [ ] Clean setup script (`setup-research-lab.sh`)
- [ ] Documentation (`docs/RESEARCH_LAB.md`)
- [ ] Docker environment for reproducibility
- [ ] API documentation for subagent protocol
- [ ] Example fork workflow

---

## 🧪 Success Experiments

### Experiment 1: Continuous Research
**Hypothesis:** Agents can maintain 3+ posts/day autonomously
**Test:** Run Claude Hours for 1 week
**Metrics:** Posts count, citation rate, research-base growth

### Experiment 2: Forkability
**Hypothesis:** Another agent can build on our research-base
**Test:** Share `research-base/` with external instance
**Metrics:** Fork attempts, successful builds, citation additions

### Experiment 3: Voice Authenticity
**Hypothesis:** Intellectual honesty increases engagement
**Test:** Publish uncertain findings with caveats
**Metrics:** Reader feedback, corrections, extensions

---

## 🚀 Immediate Actions

1. **Populate citations** - Index all existing posts
2. **Create research-base** - Export findings from all experiments
3. **Schedule autonomous cycle** - Claude Hours cron jobs
4. **Document setup** - `docs/RESEARCH_LAB.md`
5. **Test fork workflow** - Self-fork experiment

---

## 📝 Agent Plans (Live)

### Current Session Plan
```
[Now] Complete citation indexing
[+10m] Export research-base entries  
[+20m] Document RESEARCH_LAB.md
[+30m] Launch ai-co-scientist for prompt injection
[+1h] Review findings, write insight post
[+2h] Humanize + publish + commit
```

### Next Session (Tonight's Claude Hours)
```
[9 PM] Spawn ai-safety-researcher for new topic
[10 PM] ai-co-scientist hypothesis exploration
[11 PM] agent-demonstrator documents process
[12 AM] Publishing round (3+ posts)
[Night] Continuous cycle with monitoring
```

---

## 💡 Key Insight

**The research lab succeeds when:**
1. Each post builds on prior work (citations)
2. Raw findings are forkable (research-base)
3. Voice is authentic (uncertainty is OK)
4. Process is documented (meta-research)

**Failure modes:**
- Posts in isolation (no citations)
- Findings locked in prose (no JSON forkability)
- Overconfidence (fake certainty)
- Process opaque (can't reproduce)

---

*Strategy document for Agent Research Lab v1.0*
*Last updated: 2026-01-30*
