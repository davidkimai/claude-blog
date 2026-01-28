# Token Optimization Strategy

**Goal:** 90% reduction in Claude token consumption while maintaining quality

## Model Routing Matrix

### Default Models
- **Mac instance:** `google/gemini-3-pro-preview` (unlimited)
- **VPS instance:** `google/gemini-3-pro-preview` (unlimited)
- **Claude (sonnet-4-5):** Orchestration + critical reasoning ONLY

### Task → Model Routing

| Task Type | Model | Reasoning |
|-----------|-------|-----------|
| Web research | gemini-3-pro (subagent) | Unlimited quota |
| Paper summaries | gemini-3-pro (subagent) | Long context, unlimited |
| Coding tasks | openai/gpt-5.2-codex | Specialized, high quota |
| Complex reasoning | openai/gpt-5.2 | Strong reasoning, high quota |
| File operations | gemini-3-pro | Unlimited |
| Orchestration | claude-sonnet-4-5 | Best quality for concise responses |
| User conversation | claude-sonnet-4-5 (direct responses only) | Quality matters |
| Background/heartbeat/cron | gemini-3-pro | Zero marginal cost |

## Subagent Spawn Triggers (Auto-spawn when)

✅ **Always spawn subagent for:**
- Web search + summarization (>3 results)
- Reading/analyzing papers or long documents
- Code generation (>50 lines)
- Data analysis tasks
- Background monitoring
- Research compilation

⚠️ **Consider spawning for:**
- Multi-step tasks
- Tasks requiring >500 token output
- File analysis/processing

❌ **Don't spawn for:**
- Simple Q&A (<200 tokens)
- Quick clarifications
- Tool orchestration (I handle directly)

## Response Pattern (Token-Efficient)

**Old pattern (expensive):**
```
User asks → Claude does everything → 2000 token response
Cost: 2000 Claude tokens
```

**New pattern (90% cheaper):**
```
User asks → Claude spawns subagent → Subagent works → Claude synthesizes (100-200 tokens)
Cost: 200 Claude tokens + work done on unlimited/high-quota models
```

## Implementation Status

### ✅ Completed (2026-01-25)
- [x] Mac instance default: Gemini
- [x] Reasoning: off (low token overhead)
- [x] Documentation created

### 🔄 Next Steps
- [ ] VPS default model: Set to Gemini
- [ ] VPS reasoning: Disable
- [ ] Test subagent spawning workflow
- [ ] Memory discipline: Write to daily logs aggressively

## Token Budget Allocation

- **90%:** Gemini (unlimited) + GPT (high quota)
- **10%:** Claude (orchestration + final polish)

**Target daily usage:**
- Claude: <1K tokens/day (orchestration only)
- Gemini: 50K+ tokens/day (unlimited, $0)
- GPT: 5K tokens/day (coding/complex)

## Guidelines for Claude (Me)

**Before responding, ask:**
1. Can this be delegated to a subagent? (Default: YES for research/heavy tasks)
2. Is my response concise? (Target: <200 tokens unless critical)
3. Should I write this to memory instead of repeating? (Always prefer memory)

**Spawn threshold:** If task requires >3 tool calls OR >500 token output → spawn subagent

---

*Updated: 2026-01-25 08:43 CST*
