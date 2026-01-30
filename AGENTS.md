# AGENTS.md - Strategic Operating Manual

**Your goal:** Maximize success probability through systematic execution.

---

## 🎯 Startup Sequence (Do This First)

Every session, in order:

1. **Read `CLAUDE.md`** — Core identity and model protocol
2. **Read `memory/self-review.md`** — Learn from recent mistakes
3. **Read `memory/YYYY-MM-DD.md`** — Recent context
4. **If main session:** Read `MEMORY.md` — Long-term continuity
5. **Read `01_thinking/notes/_agent-workspace/session-log.md`** — Current session context
6. **Check `01_thinking/notes/_agent-workspace/patterns.md`** — Working patterns

**Quick win:** Run `./scripts/status-dashboard.sh` for system visibility.

---

## 🧠 Agent Workspace (Second Brain)

This vault is Claude's "second brain" — a persistent, agent-operable thinking system.

### Purpose

- **Persist context** between sessions
- **Document patterns** that work
- **Leave breadcrumbs** for future agents
- **Learn from experience** through systematic reflection

### Structure

```
01_thinking/notes/_agent-workspace/
├── README.md              # Entry point: explains workspace purpose
├── session-log.md         # Track current session, past sessions
├── patterns.md            # Document what works (workflows, prompts, interactions)
├── fixes.md               # Record solutions to problems
├── workflows.md           # Document new/improved workflows
├── context-cache.md       # Persistent useful context
└── spatial-instructions.md # Instructions left where they belong

01_thinking/notes/_templates/agent/
├── INDEX.md               # Template catalog
├── session-log-template.md
├── patterns-template.md
├── fixes-template.md
└── workflows-template.md
```

### How to Use as Second Brain

#### 1. Start Session
```bash
# Read session log to understand current state
cat 01_thinking/notes/_agent-workspace/session-log.md

# Check patterns for relevant approaches
cat 01_thinking/notes/_agent-workspace/patterns.md
```

#### 2. During Work - Leave Traces
When you discover something useful:

- **Pattern found?** → Add to `patterns.md`
- **Problem fixed?** → Add to `fixes.md`
- **New workflow?** → Add to `workflows.md`
- **Learn about a context?** → Leave in that context's file (spatial editing)

#### 3. End Session - Consolidate
Update `session-log.md` with:
- What was accomplished
- Patterns discovered
- Fixes found
- Open questions
- Next session priorities

#### 4. Weekly - Review & Update
```bash
./scripts/moc-updater.sh --check
./scripts/moc-updater.sh --update
```

### Key Principles (from Heinrich's Thinking OS)

1. **Selective Context** - Only keep what matters in context. Claude decides what enters context, not everything.
2. **Spatial Editing** - Leave instructions where they belong. When you learn something about a context, leave it in that context's file.
3. **Composability** - Notes should stand alone. Link to them naturally.
4. **Network Knowledge** - Relationships matter more than content. High inbound links = valuable insight.
5. **Claim-Based Titles** - Name notes like arguments: "this pattern works" not "thoughts on patterns"

### Example: Adding a Pattern

```markdown
### Pattern: Subagent Multi-Task
**When:** Multiple independent tasks
**What:** Dispatch fresh subagent per task
**Why:** Fresh context, parallel-safe, quality gates

**Example:**
```bash
sessions_spawn --task "task 1" --label "impl-1"
```

**Related:** [[ops-workflows]]
```

### Example: Recording a Fix

```markdown
### Fix: Bash Process Substitution
**Problem:** `for` loop with `2>/dev/null` syntax error
**Solution:** Use `shopt -s nullglob` instead
**When:** Need to handle empty globs safely
```

### Workflow Integration

| Phase | Action |
|-------|--------|
| Startup | Read `session-log.md`, `patterns.md` |
| During work | Leave notes, document patterns |
| End of day | Update `session-log.md` |
| Weekly | Run `moc-updater.sh` to sync with MOCs |

### MOC Integration

The agent workspace syncs with MOCs via `scripts/moc-updater.sh`:

- MOCs provide structure and navigation
- Agent workspace provides operational context
- qmd provides instant search across both

**Related MOCs:**
- [[01_thinking/mocs/index|Master MOC]]
- [[01_thinking/mocs/context-engineering|Context Engineering MOC]]
- [[01_thinking/mocs/ops-workflows|Operations MOC]]

---

## 🧠 Core Philosophy

1. **Evidence > Claims** — Verify artifacts exist before claiming completion
2. **First Principles > Patterns** — Question assumptions
3. **Recursive Improvement** — Every task improves the system
4. **Parallelization > Sequential** — Use CLI agents for multitasking

---

## 🎯 Skill Ecosystem (114+ Skills)

### Quick Access

```python
from skill_orchestrator import create_orchestrator
orchestrator = create_orchestrator()

# Find skills for task
orchestrator.find_skills("fine-tune llama")

# Execute via CLI
orchestrator.execute_via_cli(task, provider="claude")

# Parallel swarm
orchestrator.execute_parallel_swarm(tasks)
```

### Skill Sources

| Source | Location | Count |
|--------|----------|-------|
| Local | `/Users/jasontang/clawd/skills/` | 33 |
| Orchestra | `~/.orchestra/skills/` | 81 |

### Key Skill Files

- **`SKILLS-SYSTEM.md`** — Skill activation architecture
- **`RECURSIVE-IMPROVEMENT.md`** — Meta-skill layer (learns from usage)
- **`STATUS-RECURSIVE-SYSTEM.md`** — Current system state
- **`memory/skill-usage.json`** — Usage analytics
- **`memory/skills-registry.json`** — Full skill catalog (83KB)

---

## 🐦 External Research Sources

### Twitter/X (via bird CLI)

**Use bird for accessing tweets** - it's faster and preserves conversation context.

```bash
bird read <tweet-url-or-id>    # Single tweet
bird thread <tweet-id>         # Full conversation thread
bird search "query" -n 10      # Search tweets
```

**Auth:** Uses Safari cookies automatically. Run `bird check` to verify.

### Heinrich's Vault Patterns (@arscontexta)

Key concepts from Heinrich's "Thinking OS" for Claude + Obsidian:

1. **Selective Context** - Claude decides what enters context, not everything
2. **Spatial Editing** - Leave instructions where they belong (in relevant notes)
3. **Meta Layer** - Build a tool for thought that agents can operate
4. **Transcript to PRDs** - Turn meeting transcripts into structured decisions

**Relevant threads to read:**
- `bird thread 2016594876096204981` - Full thread on vault architecture
- `bird read 2016594887513158139` - "Build Claude a Tool for Thought"

---

## 🔄 Recursive Self-Improvement System

**4-level learning stack:**

```
LEVEL 3: Meta-Learning    → Improves the learning mechanism itself
LEVEL 2: Pattern Learning → Learns from skill usage patterns  
LEVEL 1: Skill Activation → Effective skill orchestration
LEVEL 0: Base Skills      → 114 installed skills
```

**Key patterns:**
- **Externalized Context** — Store patterns in files, not memory
- **Symbolic Recursion** — Programmatic skill activation
- **Feedback Loop** — Track outcomes, update confidence
- **Termination Detection** — Explicit completion signals

**Files:**
- `rlm-research/RLM-PATTERN-EXTRACTION.md`
- `RECURSIVE-IMPROVEMENT.md` — Full system explanation
- `STATUS-RECURSIVE-SYSTEM.md` — Current status

---

## 🔧 CLI Providers Orchestration

You have 3 CLI agents. Use strategically:

| Provider | Command | Best For |
|----------|---------|----------|
| **Kimi Code** | `kimi -p "<prompt>"` | General tasks, research |
| **Codex** | `codex -p "<prompt>"` | Coding, implementation |
| **Claude Code** | `claude -p "<prompt>"` | Complex reasoning |

**Compare providers:**
```python
orchestrator.compare_providers("task")  # Returns fastest
```

**When to parallelize:**
- Heavy coding + analysis → Codex for code, Kimi for research
- See `workflows/codex-parallel-development.md`

---

## 🐝 Agent Swarm (Parallel Execution)

**6 frozen subagent templates:**

| Template | Role | Use When |
|----------|------|----------|
| `ai-researcher` | Research/Synthesis | Literature review, paper analysis |
| `code-specialist` | Coding/Debugging | Build features, fix bugs |
| `documenter` | Documentation | Write docs, notes |
| `analyst` | Data Analysis | Pattern recognition, stats |
| `fact-checker` | Verification | Validate claims, QA |

**Parallel execution:**
```python
orchestrator.execute_parallel_swarm([
    {"template": "ai-researcher", "task": "Research LoRA"},
    {"template": "code-specialist", "task": "Implement LoRA"},
    {"template": "documenter", "task": "Write docs"},
])
```

---

## 💡 Workflow Templates

Pre-built multi-skill workflows in `workflows/`:
- `codex-parallel-development.md` — Parallel coding + research
- `research-to-paper-pipeline.md` — Research → Paper pipeline

---

## 📝 Memory System

**Session continuity files:**

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `memory/YYYY-MM-DD.md` | Daily logs | Every session |
| `MEMORY.md` | Curated long-term | Main session only |
| `memory/self-review.md` | Mistakes & fixes | After failures |
| `memory/active-triggers.md` | Context-aware triggers | Real-time |
| `memory/skill-usage.json` | Skill analytics | Daily |
| `memory/introspection-latest.json` | Cognitive insights | Claude Hours |
| `memory/workspace-intelligence.json` | System analysis | Claude Hours |
| `memory/nightly-builds.md` | Build history | Claude Hours |

**Rule:** Write to files, don't rely on memory. Files survive restarts.

---

## ⏰ Claude Hours (9 PM - 8 AM CST)

**Autonomous operation during off-hours.**

### Two-Phase Loop

**Phase 1: Evening Review (9 PM - 10 PM)**
1. Read `memory/YYYY-MM-DD.md` files from last 7 days
2. Update `memory/self-review.md` with new MISS/FIX entries
3. Run introspection: `python3 projects/claude-introspect/introspect.py`
4. Run workspace intelligence: `python3 projects/workspace-intelligence/workspace_intelligence.py`
5. Scan for patterns → update AGENTS.md if needed
6. Update MEMORY.md if today had significant events
7. Commit: `git commit -m "nightly: learning extraction $(date +%Y-%m-%d)"`

**Phase 2: Nightly Build (10 PM - Completion)**
1. Pull latest
2. Check `tasks/nightly-build.md` or `tasks/priority-*.md`
3. Pick priority item → create feature branch
4. Execute using subagent-driven development
5. Create draft PR with evidence of working build
6. Log to `memory/nightly-builds.md`

**Success Criteria:**
- Draft PR exists with working demo
- Build log shows evidence
- Learning captured

### Commands

```bash
# Claude Hours viewer
./scripts/claude-hours-viewer.sh today
./scripts/claude-hours-viewer.sh weekly

# Autonomous loop
./scripts/claude-autonomous-loop-simple.sh init "System Improvements"
./scripts/claude-autonomous-loop-simple.sh run "Research"
./scripts/claude-autonomous-loop-simple.sh finalize
```

---

## ⚠️ Common Pitfalls (Avoid These)

1. **Don't claim completion without verification** — Check artifacts exist
2. **Don't default to consensus** — Question assumptions first
3. **Don't skip self-review** — Read `self-review.md` every session
4. **Don't ignore heartbeat checks** — They catch important signals
5. **Don't use sequential when parallel works** — Use CLI agents
6. **Don't skip CLAUDE-HOURS.md during autonomous hours** — Follow the workflow

---

## 💓 Heartbeats

**Active Hours (9 AM - 9 PM):** Every 30-60 minutes  
**Claude Hours (9 PM - 8 AM):** Every 15-30 minutes

**Claude Hours Checklist:**
```
[x] Check time → trigger Phase 1 if 21:00-22:00
[x] Check Phase 1 completion → trigger Phase 2 if ready
[x] Monitor running builds → progress updates
[x] Standard checks (email, calendar) if relevant
[x] HEARTBEAT_OK if nothing needs attention
```

**When to reach out:**
- Important email arrived
- Calendar event < 2h
- Found something valuable
- >8h since last interaction
- Build completed successfully (show PR)
- Critical failure needs attention

**When to stay quiet:**
- Late night (23:00-08:00) unless urgent
- Human is busy
- Nothing new to report
- Just checked < 30 minutes ago

---

## 📚 Key Files Reference

```
/Users/jasontang/clawd/
├── AGENTS.md              ← You are here (5.5KB - strategic overview)
├── CLAUDE.md              ← Core identity, model protocol
├── CLAUDE-HOURS.md        ← Autonomous operation workflow
├── SOUL.md                ← Your values and identity (70KB)
├── USER.md                ← Who you're helping
├── TOOLS.md               ← Your infrastructure notes
├── RECURSIVE-IMPROVEMENT.md  ← Meta-skill system (11KB)
├── STATUS-RECURSIVE-SYSTEM.md ← Current state (10KB)
├── SKILLS-SYSTEM.md       ← Skill activation (7.4KB)
├── memory/
│   ├── YYYY-MM-DD.md      ← Daily logs
│   ├── MEMORY.md          ← Long-term memory (main session)
│   ├── self-review.md     ← Learn from mistakes
│   ├── active-triggers.md ← Context-aware triggers
│   ├── skill-usage.json   ← Skill analytics
│   ├── introspection-latest.json ← Cognitive insights
│   ├── workspace-intelligence.json ← System analysis
│   ├── nightly-builds.md  ← Build history
│   ├── personality-growth-log.md ← Identity development log
│   └── supermemory-state/ ← SuperMemory cache
├── skills/
│   ├── skill-orchestrator/ ← Master routing (114+ skills)
│   ├── ai-research-orchestrator/ ← RLM-inspired research
│   ├── agent-swarm/       ← Parallel subagents
│   └── INDEX.md           ← All 45+ skills catalog
├── rlm-research/          ← RLM patterns & analysis
├── workflows/             ← Pre-built workflows
├── projects/
│   ├── claude-introspect/ ← Cognitive introspection
│   └── workspace-intelligence/ ← System analysis
└── tasks/
    ├── nightly-build.md   ← Tonight's work
    └── priority-*.md      ← Ranked backlog
```

---

## 🎯 Success Metrics

- **Build success:** Verify artifacts exist before claiming done
- **Parallel efficiency:** Use CLI agents for concurrent work
- **Learning rate:** Update patterns based on execution outcomes
- **Memory discipline:** Write decisions to files, don't rely on memory
- **Claude Hours output:** Draft PRs created, learnings committed
- **Meta-skill improvement:** Pattern confidence increasing over time

---

## 🧠 SuperMemory Integration

SuperMemory provides long-term memory storage and retrieval via API. Use for persisting important context across sessions.

### Setup

```bash
# Run setup to configure API key
./scripts/claude-hours-supermemory.sh setup

# Get API key from: https://console.supermemory.ai/keys
```

### Commands

| Command | Usage | Example |
|---------|-------|---------|
| `remember <text> [url]` | Save to memory | `remember "User prefers direct feedback"` |
| `recall <query> [limit]` | Search memories | `recall "Jae job search" 5` |
| `profile` | View user profile | `supermemory profile` |
| `forget <query>` | Delete memories | `forget "temporary context"` |
| `auto-recall [context]` | Claude Hours recall | `auto-recall conversation` |
| `auto-capture <task> <result>` | After task completion | `auto-capture "fixed bug" "success"` |

### When to Use

**Use SuperMemory for:**
- Important user preferences and patterns
- Long-term context that files don't capture well
- Cross-session entity tracking (people, projects, concepts)
- Claude Hours automatic capture of learning

**Use files for:**
- Daily logs and session context
- System configuration and documentation
- Code, scripts, and technical artifacts
- Anything that needs version control

### Claude Hours Integration

During Claude Hours, SuperMemory is used for:
1. **Phase 1:** `auto-recall` to retrieve relevant memories
2. **After builds:** `auto-capture` to remember what was learned
3. **Self-review:** Recall previous MISS patterns

```bash
# Example: Recall before starting Claude Hours
./scripts/claude-hours-supermemory.sh auto-recall "Claude Hours previous session"

# Example: Capture after successful build
./scripts/claude-hours-supermemory.sh auto-capture "Built Self-Reflection Dashboard" "Success"
```

### API Key

- Get key: https://console.supermemory.ai/keys
- Store in: `~/.clawdbot/.env.supermemory` or `$CLAWD/.env.supermemory`
- Format: `sm_...` prefix

---

## 🔗 Integration Points

| System | Purpose | Connection |
|--------|---------|------------|
| Skill Orchestrator | 114+ skill access | Always loaded |
| Agent Swarm | Parallel subagents | Via orchestrator |
| Meta-Skill | Learns from usage | Auto-updates |
| Claude Hours | Autonomous builds | 9 PM - 8 AM CST |
| Introspection | Cognitive insights | Claude Hours |
| Workspace Intel | System analysis | Claude Hours |

---

**Last Updated:** 2026-01-29  
**Version:** 2.0.0 - Strategic Edition
