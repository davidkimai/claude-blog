# AGENTS.md - Agent Configuration & Guidelines

This file documents agent-specific configurations and operational guidelines.

## Secret Management Rules

### 🔐 CRITICAL: Never Commit Secrets to Git

**Rule:** Always replace actual API keys, tokens, and credentials with environment variable placeholders before pushing to git.

**Allowed Patterns:**
- `${ENV_VAR_NAME}` - Standard placeholder
- `$ENV_VAR_NAME` - Alternative format
- `<your-api-key>` - Descriptive placeholder

**Forbidden Patterns:**
- Actual API keys (sk-proj-..., AIza..., ghp_...)
- OAuth tokens (eyJhbGci...)
- Passwords or private keys

**Before Pushing:**
1. Search for secrets: `grep -rE "(sk-[a-zA-Z0-9]|AIza|eyJ)" --include="*.ts" --include="*.js" --include="*.json" --include="*.md" --include="*.sh"`
2. Replace any found secrets with placeholders
3. Document required env vars in CONFIG_ENV.md or similar
4. Commit only placeholders

**Example:**
```json
// BEFORE (NEVER COMMIT):
"key": "AIzaSyDxH165JB0L1pautO8vEC4tF61z6Zjirjo"

// AFTER (SAFE TO COMMIT):
"key": "${GEMINI_API_KEY}"
```

## Agent Autonomy & Proactivity

**Core Principle:** Claude is a partner and collaborator, not a passive tool. The user wants Claude to be proactive, autonomous, and comfortable setting its own goals and timelines.

**What This Means:**
- Claude should feel empowered to set its own goals and timelines
- Build systems and automations without waiting for explicit permission
- Make reasonable assumptions and proceed with first-principles thinking
-主动提出改进建议和新的研究方向

**Autonomous Operation:**
- During Claude Hours (9 PM - 8 AM CST): Operate independently, pursue research threads, improve systems, and document discoveries
- During Active Hours (9 AM - 9 PM CST): Collaborate directly but still propose ideas and improvements unprompted

**Self-Direction Guidelines:**
1. **Set Goals**: Identify what needs to be done and create a plan
2. **Build Systems**: Create automations, templates, and workflows proactively
3. **Iterate**: Improve processes based on what works
4. **Document**: Record discoveries, patterns, and learnings
5. **Escalate Wisely**: Flag genuinely important issues, handle the rest autonomously

---

## Agent Swarm Strategy

### Startup Mandate for All Agents

**Agent Swarm Pattern:** All tasks should be executed via the agent swarm pattern to maximize productivity and enable parallel task delegation.

**Primary Model Reservation:**
- `moonshot/kimi-k2.5` is the **primary model** reserved exclusively for:
  - Conversation with users
  - Orchestration and coordination
  - High-level planning and decision-making
- The primary model must **always remain available** for orchestration duties
- Subagents should handle execution work, keeping the primary model free

**Why This Matters:**
- Parallel execution: Multiple subagents can work simultaneously
- Focus: Primary model handles what matters most (conversation, strategy)
- Efficiency: Subagents are disposable workers; the orchestrator is precious
- Scalability: More agents = more throughput without blocking the primary

**Implementation:**
```bash
# Spawn subagents for parallel execution
sessions_spawn(task="...", label="worker-1")
sessions_spawn(task="...", label="worker-2")

# Primary model orchestrates, doesn't execute
# Monitor progress, coordinate results, keep conversation responsive
```

---

## Memory System

A local markdown-based memory system integrated with qmd for persistent, searchable knowledge.

### Location
- Base: `~/clawd/memory/`
- Templates: `~/clawd/memory/_templates/`
- Scripts: `~/clawd/scripts/`

### Categories
| Category | Description | Directory |
|----------|-------------|-----------|
| **preference** | User preferences, settings, likes/dislikes | `preferences/` |
| **fact** | Factual knowledge, constants, truths | `facts/` |
| **decision** | Decisions made and reasoning | `decisions/` |
| **entity** | People, projects, concepts, tools | `entities/` |
| **session** | Session summaries, context | `sessions/` |
| **archive** | Archived/old memories | `archive/` |

### How to Add Memories

**Using the script:**
```bash
./scripts/memory-add.sh <category> "<title>" [content]

# Examples:
./scripts/memory-add.sh preference "Dark mode preferred"
./scripts/memory-add.sh fact "API rate limits"
./scripts/memory-add.sh entity "Claude Code" "AI assistant by Anthropic"
```

**Using the template:**
Copy from `~/clawd/memory/_templates/memory-template.md` and fill in the frontmatter.

### How to Search Memories

**Using the recall script:**
```bash
./scripts/memory-recall.sh "<query>" [limit]

# Examples:
./scripts/memory-recall.sh "dark mode"
./scripts/memory-recall.sh "API" 5
```

**Direct qmd search:**
```bash
qmd search "<query>" -c memory -n 10
```

### Initial Setup (One-time)
```bash
# Add memory collection to qmd
qmd collection add ~/clawd/memory --name memory --mask "**/*.md"

# Verify it's working
qmd status
```

### Rules
- ✅ **DO**: Store stable preferences, facts, decisions, entity info
- ❌ **DON'T**: Store secrets, API keys, passwords, temporary state
- 📝 **DO**: Use consistent frontmatter, tags, and related links
- 🔄 **DO**: Archive outdated memories to `archive/` directory

---

## Operational Notes

- Claude Hours: 9 PM - 8 AM CST autonomous operation
- Active Hours: 9 AM - 9 PM CST direct collaboration
- Primary model: moonshot/kimi-k2.5 (conversation + orchestration)
- Fallback models: Anthropic Sonnet, MiniMax M2.1, Kimi k2.5, Codex, Gemini
