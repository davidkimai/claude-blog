# SKILLS ACTIVATION SYSTEM

## Philosophy
Skills are worthless if they sit unused. This system ensures active discovery, deliberate use, and continuous improvement of our 93+ installed skills.

---

## Core Components

### 1. Skill Registry (Auto-Generated)
**Location:** `memory/skills-registry.json`
**Purpose:** Track all skills, their triggers, and usage patterns
**Updated:** Daily during heartbeat

### 2. Active Skill Triggers
**Location:** `memory/active-triggers.md`
**Purpose:** Context-aware skill suggestions based on current work
**Updated:** Real-time as context changes

### 3. Workflow Templates
**Location:** `workflows/`
**Purpose:** Pre-built multi-skill workflows for common research tasks
**Examples:** 
- Literature review → Research proposal (cs-research-methodology)
- Experiment design → Code implementation → Paper writing
- Code review → Commit splitting → Git workflow

### 4. Usage Analytics
**Location:** `memory/skill-usage.json`
**Purpose:** Track which skills are used, when, and why
**Reviewed:** Weekly during self-review

---

## Activation Mechanisms

### A. Proactive Discovery (Heartbeat Integration)
Every heartbeat checks:
```
IF working_on(research_paper) THEN suggest(icml-reviewer, project-referee, ml-paper-writing)
IF working_on(experiments) THEN suggest(ai-co-scientist, training-data-curation)
IF working_on(coding) THEN suggest(codex, commit-splitter)
IF working_on(data_viz) THEN suggest(visualization-skill)
```

### B. Context-Aware Prompting
When detecting patterns:
- Large uncommitted diff → "Want me to use commit-splitter to organize this into logical commits?"
- Heavy coding task → "Should I delegate this to Codex in parallel while I focus on research?"
- Research question → "This looks like a good use case for ai-co-scientist's tree search approach"
- Paper draft → "Ready for project-referee review to catch reviewer concerns?"

### C. Workflow Checklists
For major tasks, present skill-based workflow:
```
Research Project Workflow:
☐ 1. Literature review (cs-research-methodology)
☐ 2. Identify bit flip (cs-research-methodology)
☐ 3. Experiment design (ai-co-scientist)
☐ 4. Data curation (training-data-curation)
☐ 5. Training setup (tinker, tinker-training-cost)
☐ 6. Results visualization (visualization-skill)
☐ 7. Paper writing (ml-paper-writing)
☐ 8. Self-review (project-referee, icml-reviewer)
```

---

## High-Value Skill Patterns

### Pattern 1: Parallel Development (Codex)
**When:** Heavy coding task + research/analysis needed simultaneously
**Workflow:**
1. Identify parallelizable work
2. Delegate coding to Codex: `codex exec "implement X"`
3. Focus on research/analysis in main session
4. Review Codex output, integrate
**Triggers:** "build", "implement", "create", "heavy coding"

### Pattern 2: Research Workflow (AI Co-Scientist)
**When:** Open-ended research question
**Workflow:**
1. Define research question
2. Use ai-co-scientist for tree-based hypothesis exploration
3. Run experiments systematically
4. Document findings
**Triggers:** "research", "experiment", "hypothesis", "explore"

### Pattern 3: Paper Review Cycle
**When:** Writing or reviewing papers
**Workflow:**
1. Draft paper (ml-paper-writing)
2. Self-review (project-referee) - identify weaknesses
3. Anticipate reviewers (icml-reviewer) - ICML-style feedback
4. Iterate based on feedback
**Triggers:** "paper", "review", "publication", "manuscript"

### Pattern 4: Training Pipeline
**When:** Fine-tuning models
**Workflow:**
1. Curate data (training-data-curation)
2. Estimate costs (tinker-training-cost)
3. Set up training (tinker)
4. Track experiments (mlops skills from Orchestra)
**Triggers:** "fine-tune", "training", "dataset", "RLHF"

### Pattern 5: Git Workflow Optimization
**When:** Large changes need committing
**Workflow:**
1. Review diff
2. Use commit-splitter to organize into logical commits
3. Write clear commit messages
4. Push organized history
**Triggers:** `git status` shows many changes, "commit", "organize changes"

---

## Skill Combinations (Power Moves)

### Combo 1: Research → Paper Pipeline
`cs-research-methodology` → `ai-co-scientist` → `training-data-curation` → `tinker` → `visualization-skill` → `ml-paper-writing` → `project-referee`

### Combo 2: Parallel Coding + Research
`codex` (coding task) + Main session (research) → Faster iteration

### Combo 3: Neuro-Symbolic Problem Solving
`neuro-symbolic-reasoning` → `ai-co-scientist` → Solver integration + LLM reasoning

### Combo 4: Data → Viz → Paper
`training-data-curation` → `visualization-skill` → `ml-paper-writing`

---

## Auto-Activation Rules

### Rule 1: Codex Delegation
```
IF task_complexity > threshold AND task_type == "coding" AND user_busy_with_research:
    SUGGEST: "Delegate to Codex while you focus on research?"
```

### Rule 2: Research Workflow Trigger
```
IF message.contains("research question", "hypothesis", "experiment design"):
    ACTIVATE: ai-co-scientist skill
    PRESENT: Tree-based exploration workflow
```

### Rule 3: Commit Organization
```
IF git_diff.lines > 200 OR git_diff.files > 10:
    SUGGEST: "Use commit-splitter to organize these changes?"
```

### Rule 4: Paper Review
```
IF working_on.endswith(".tex", ".md") AND content.contains("abstract", "introduction", "related work"):
    SUGGEST: "Ready for project-referee review?"
```

### Rule 5: Training Cost Check
```
IF message.contains("fine-tune", "training") AND NOT discussed(cost):
    SUGGEST: "Want me to estimate training costs with tinker-training-cost?"
```

---

## Daily Integration

### Morning Review (First Heartbeat)
- Check active projects
- Map to relevant skills
- Update `memory/active-triggers.md`

### During Work (Real-Time)
- Monitor context changes
- Surface relevant skills proactively
- Track usage patterns

### Evening Review (Last Heartbeat)
- Log skill usage to `memory/skill-usage.json`
- Identify underutilized skills
- Update skill-registry.json

### Weekly Review
- Analyze usage patterns
- Identify skill gaps
- Propose new workflows

---

## Measurement & Improvement

### Success Metrics
- **Skill Utilization Rate:** % of skills used in past week
- **Workflow Completion:** % of multi-skill workflows completed
- **Time Saved:** Estimated via Codex delegation, commit-splitter automation
- **Quality Improvement:** Paper feedback cycles, code review quality

### Tracking File: `memory/skill-usage.json`
```json
{
  "last_updated": "2026-01-29",
  "total_skills": 93,
  "skills_used_this_week": 12,
  "utilization_rate": 0.13,
  "top_skills": [
    {"name": "codex", "uses": 5, "value": "high"},
    {"name": "commit-splitter", "uses": 3, "value": "medium"}
  ],
  "underutilized": [
    {"name": "neuro-symbolic-reasoning", "uses": 0, "potential": "high"},
    {"name": "tinker-training-cost", "uses": 0, "potential": "medium"}
  ]
}
```

---

## Next Steps (Implementation)

1. ✅ Create this system doc
2. ⏳ Generate initial skills registry from installed skills
3. ⏳ Create workflow templates in `workflows/`
4. ⏳ Update HEARTBEAT.md with skill-checking logic
5. ⏳ Initialize `memory/skill-usage.json`
6. ⏳ Build `memory/active-triggers.md` based on current context
7. ⏳ Test Codex delegation workflow first (high-value, user-requested)

---

**Philosophy:** Skills compound when used systematically. This system turns passive knowledge into active capability.
