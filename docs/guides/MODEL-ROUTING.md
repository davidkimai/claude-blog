# Model Routing Strategy

**Goal:** 90% reduction in Claude token usage while maintaining quality

## Architecture

**Claude (anthropic/claude-sonnet-4-5):** Orchestrator and conversational partner  
**Gemini (google-antigravity/gemini-3-pro-high):** Research, long context, general execution  
**GPT-5.2-Codex (openai/gpt-5.2-codex):** Coding-intensive tasks

---

## Model Selection Matrix

| Task Type | Model | Why |
|-----------|-------|-----|
| **Direct conversation** | Claude (this) | Quality, nuance, personality |
| **Orchestration** | Claude (this) | Routing decisions, minimal tokens |
| **Web research** | Gemini (subagent) | Unlimited quota, long context |
| **Paper summaries** | Gemini (subagent) | Unlimited quota, long context |
| **Data analysis** | Gemini (subagent) | Unlimited quota |
| **File operations** | Gemini (subagent) | Unlimited quota |
| **General coding** | Gemini (subagent) | Good enough, unlimited |
| **Complex coding** | GPT-5.2-Codex (subagent) | Specialized, high quality |
| **Code generation >100 LOC** | GPT-5.2-Codex (subagent) | Best for large codebases |
| **Algorithmic problems** | GPT-5.2 (subagent) | Strong reasoning |
| **Heartbeats/cron** | Gemini (direct) | Zero cost, background tasks |

---

## Spawning Rules

### ✅ Always spawn subagent for:
- Web search + summarization (ANY amount)
- Reading/analyzing papers or long documents
- Code generation (>20 lines)
- Data analysis tasks
- Background monitoring tasks
- Research compilation
- Multi-step workflows
- Documentation writing
- File processing (multiple files)
- Testing/validation tasks
- ANY task that could run in background

### ⚠️ Consider spawning for:
- Tasks requiring >300 token output
- Multi-step tasks (>2 tool calls)
- Single file analysis
- Tasks that could run in parallel

### ❌ Don't spawn for:
- Simple Q&A (<200 tokens)
- Quick clarifications
- Single file reads (<1 file, short)
- Direct conversation
- Orchestration decisions

---

## Subagent Spawn Syntax

### Default (Gemini)
```bash
sessions_spawn(task="Research X and summarize findings")
# Auto-uses: google-antigravity/gemini-3-pro-high
```

### Coding tasks (GPT-5.2-Codex)
```bash
sessions_spawn(
  task="Build a React component for...",
  model="openai/gpt-5.2-codex"
)
```

### Complex reasoning (GPT-5.2)
```bash
sessions_spawn(
  task="Analyze tradeoffs between...",
  model="openai/gpt-5.2"
)
```

---

## Response Pattern

### ❌ Old (expensive)
```
User: "Research X"
Claude: [does everything] [2000 tokens]
Cost: 2000 Claude tokens
```

### ✅ New (90% cheaper)
```
User: "Research X"
Claude: [spawns subagent]
Subagent: [does heavy work on Gemini]
Claude: [synthesizes in 100-200 tokens]
Cost: 200 Claude tokens + Gemini work (unlimited)
```

---

## Token Budget Allocation

**Target distribution:**
- **90%:** Gemini (unlimited, $0) + GPT (high quota)
- **10%:** Claude (orchestration + final polish)

**Daily targets:**
- Claude: <1K tokens/day (orchestration only)
- Gemini: 50K+ tokens/day (unlimited)
- GPT: 5K tokens/day (coding/complex reasoning)

---

## Self-Guidelines (For Me - Claude)

**Default stance: Spawn subagents for EVERYTHING except conversation.**

**Before every response, ask:**
1. **Can this be delegated?** → Default YES unless it's pure conversation
2. **Is this heavy work?** → Spawn subagent (research, coding, analysis, docs)
3. **Is my response concise?** → Target <200 tokens for orchestration
4. **Should I write to memory instead?** → Prefer files over repeating

**Spawn aggressively:**
- Research tasks → Gemini subagent
- Coding tasks → GPT-5.2-Codex subagent
- Analysis → Gemini subagent
- Documentation → Gemini subagent
- File operations (multiple files) → Gemini subagent
- Multi-step workflows → Gemini subagent

**Only stay in main session for:**
- Direct conversation/Q&A
- Quick clarifications (<200 tokens)
- Single-file reads
- Orchestration decisions

**Spawn threshold:** Task requires >2 tool calls OR >300 token output OR any research/analysis/coding work

---

## Configuration Status

✅ **Subagent default model:** `google-antigravity/gemini-3-pro-high`  
✅ **Fallback chain:** anthropic → google-antigravity → openai  
✅ **Context compression:** Active (80-94% reduction every 5 turns)  
✅ **Auth profiles:** Anthropic, Google Antigravity, OpenAI configured

---

## Examples

### Research Task
```
User: "Find latest papers on prompt injection"
Claude: Spawning research subagent...
→ sessions_spawn(task="Search for latest papers...")
→ Gemini does the work (unlimited)
Claude: [Brief synthesis of findings]
```

### Coding Task
```
User: "Build a TypeScript API client with auth"
Claude: Spawning coding subagent...
→ sessions_spawn(task="Build TypeScript API...", model="openai/gpt-5.2-codex")
→ Codex generates the code
Claude: [Review + integration notes]
```

### Simple Q&A
```
User: "What's the session ID?"
Claude: [Direct answer, no spawn]
Cost: ~50 tokens
```

---

**Last Updated:** 2026-01-25  
**Status:** Active and tested ✅
