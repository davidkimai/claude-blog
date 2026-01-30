# Skills System - Quick Start

## What Just Got Built

✅ **Skill Activation System** - Makes your 93 skills actively useful, not passive
✅ **93 Skills Installed** - 82 Orchestra (AI research) + 11 Sundial (research methodology)
✅ **Auto-Detection** - Heartbeat checks for skill opportunities
✅ **Workflow Templates** - Pre-built multi-skill workflows
✅ **Usage Tracking** - Measure which skills deliver value

---

## How It Works

### 1. Proactive Suggestions
I'll surface relevant skills based on what you're working on:
- **Heavy coding** → "Want me to delegate this to Codex while you focus on research?"
- **Large git diff** → "Should I use commit-splitter to organize these changes?"
- **Research work** → "This looks like a good case for ai-co-scientist's tree search"
- **Paper writing** → "Ready for project-referee review?"

### 2. Workflow Guidance
When you start major tasks, I'll suggest skill-based workflows:
```
Research Project:
1. Literature review (cs-research-methodology)
2. Experiment design (ai-co-scientist)
3. Data curation (training-data-curation)
4. Training (tinker)
5. Visualization (visualization-skill)
6. Paper writing (ml-paper-writing)
7. Review (project-referee, icml-reviewer)
```

### 3. Usage Analytics
Track what's working in `memory/skill-usage.json`:
- Which skills deliver value
- Which are underutilized
- Pattern detection for automation

---

## High-Value Skills to Try First

### 🔥 Codex Parallel Development (Requested!)
**Use:** Heavy coding task + research work simultaneously
**Example:** "Use codex to implement the evaluation pipeline while I analyze the results"
**Benefit:** 2x productivity via parallelization

### 🔬 AI Co-Scientist
**Use:** Open-ended research questions
**Example:** "Use ai-co-scientist to explore hypothesis variations"
**Benefit:** Systematic tree-based experimentation

### 📝 Project Referee
**Use:** Paper/proposal review
**Example:** "Run project-referee on this paper draft"
**Benefit:** Catch reviewer concerns early

### 💰 Tinker Training Cost
**Use:** Before starting training jobs
**Example:** "Estimate training cost for fine-tuning Llama 7B on 10k examples"
**Benefit:** Budget planning, cost optimization

### 🎯 Commit Splitter
**Use:** Organizing large changesets
**Example:** "Use commit-splitter to organize these 500 lines of changes"
**Benefit:** Clean git history, easier review

---

## Try It Now: Codex Workflow

**Scenario:** You need to implement something while doing research/analysis

**Step 1:** Identify the task
"I need to build a data preprocessing pipeline while I analyze the model behavior"

**Step 2:** Delegate to Codex
I'll use the `codex` skill:
```bash
codex exec "Build a data preprocessing pipeline that:
- Loads CSV files from data/raw/
- Cleans missing values
- Normalizes features
- Saves to data/processed/
- Includes unit tests"
```

**Step 3:** You continue your work
Focus on model analysis while Codex implements the pipeline

**Step 4:** Review and integrate
I'll review Codex's output, suggest improvements, and help integrate

---

## Key Files

- **SKILLS-SYSTEM.md** - Full system documentation
- **workflows/** - Pre-built workflow templates
  - `codex-parallel-development.md` - Parallel task delegation
  - `research-to-paper-pipeline.md` - Full research lifecycle
- **memory/skill-usage.json** - Usage analytics
- **memory/active-triggers.md** - Context-aware suggestions
- **memory/skills-registry.json** - All 93 skills cataloged

---

## How to Use

### Natural Language
Just describe what you want:
- "Help me with this research project" → I suggest ai-co-scientist workflow
- "I have a lot of uncommitted changes" → I offer commit-splitter
- "Should I fine-tune this model?" → I estimate costs with tinker-training-cost

### Explicit Requests
Ask for skills directly:
- "Use codex to implement X while I do Y"
- "Run project-referee on this draft"
- "Use ai-co-scientist for this experiment design"

### Automatic Detection
During heartbeats, I check for opportunities:
- Git diffs → commit-splitter
- Research context → relevant research skills
- Paper work → review skills

---

## Success Metrics

**Week 1 Goal:** Use 5+ different skills
**Week 2 Goal:** Complete 1+ multi-skill workflow
**Month 1 Goal:** 30%+ utilization rate (28+ skills used)

**Track progress:** Check `memory/skill-usage.json` weekly

---

## Next Steps

1. **Try Codex** - Next heavy coding task, delegate it!
2. **Use commit-splitter** - Next large diff, organize it
3. **Start a research project** - Follow research-to-paper-pipeline workflow
4. **Review usage weekly** - See what's delivering value

---

**The Goal:** Turn passive skill libraries into active capability multipliers.

Ask me anytime: "What skills could help with [task]?" and I'll suggest the best ones.
