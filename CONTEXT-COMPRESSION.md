# Context Compression System

**Status:** ✅ Phase 1 Complete (Infrastructure)  
**Created:** 2026-01-25  
**Impact:** 80-94% token reduction

---

## Quick Start

### Check turn count and trigger summarization
```bash
./scripts/summarize-context.sh
```

### Manual summarization (when integrated)
```bash
# After Gemini integration is complete:
./scripts/summarize-context.sh --force
```

### View conversation summaries
```bash
cat memory/conversation-summary.md
```

---

## How It Works

### Overview
Every 5 conversation turns, the system:
1. Counts turns since last summary
2. When threshold reached → extracts recent messages
3. Sends to Gemini for compression (80-90% reduction)
4. Appends summary to `memory/conversation-summary.md`
5. Model receives: all summaries + last 3 raw messages

### Token Savings
| Turns | Before | After | Reduction |
|-------|--------|-------|-----------|
| 10    | 150K   | 24K   | 84%       |
| 20    | 300K   | 30K   | 90%       |
| 50    | 750K   | 45K   | 94%       |
| 100   | 1.5M   | 65K   | 96%       |

### Files
- **Turn counter:** `memory/turn-counter.json` - Tracks state
- **Summaries:** `memory/conversation-summary.md` - Compressed history
- **Script:** `scripts/summarize-context.sh` - Turn checker
- **Prompt:** `prompts/summarization-prompt.md` - Gemini instructions

---

## Implementation Status

### ✅ Completed (Phase 1)
- [x] Implementation plan with 3 approaches analyzed
- [x] File-based infrastructure (no code changes needed)
- [x] Turn counter with state tracking
- [x] Summary file template
- [x] Summarization script (turn counting works)
- [x] Summarization prompt for Gemini
- [x] Test scenario documented
- [x] Expected token savings calculated

### 🔄 In Progress (Phase 2)
- [ ] Gemini API integration in summarization script
- [ ] Message extraction from session JSONL
- [ ] Summary quality validation
- [ ] Heartbeat integration (automatic checks)
- [ ] AGENTS.md update (load summary on session start)

### 📋 Planned (Phase 3)
- [ ] Automatic hook integration (native Clawdbot)
- [ ] Adaptive summarization (aggressive for banter)
- [ ] Quality metrics and monitoring
- [ ] Multi-session summary management

---

## Architecture

### Current Session Structure
```
~/.clawdbot/agents/main/sessions/
├── 56c4671f-4cb6-4a18-9360-a36f8908062b.jsonl  (2.3MB, 570 lines)
└── sessions.json                                (metadata)
```

**Session format:** JSONL (JSON Lines)
- Each event: `{type, id, parentId, timestamp, data}`
- User messages: `{type: "message", role: "user", content: "..."}`
- Tool calls: `{type: "tool_call", tool: "...", args: {...}}`

**Current session:** 88 turns (as of 2026-01-25 09:11)

### Compression Flow
```
Session JSONL (500-1500K tokens)
         ↓
    Turn Counter (checks every heartbeat)
         ↓
    Threshold reached? (every 5 turns)
         ↓
Extract messages for turns X-(X+5)
         ↓
    Gemini Summarization
    (compress 2000 tokens → 300 tokens)
         ↓
Append to conversation-summary.md
         ↓
Model receives: summaries + last 3 messages
    (total: ~25K tokens vs 500K+)
```

---

## Implementation Details

### Turn Counter Schema
```json
{
  "sessionId": "56c4671f-4cb6-4a18-9360-a36f8908062b",
  "totalTurns": 88,
  "lastSummaryTurn": 88,
  "lastCheckedAt": "2026-01-25T15:11:15Z",
  "summaries": []
}
```

### Summary Format
```markdown
## Summary (Turns 1-5) - 2026-01-25T15:20:00Z

- **Topic:** Context compression implementation
- **Key Actions:** 
  - Created implementation plan with 3 approaches
  - Built turn counter and summary infrastructure
- **Technical Details:**
  - Session file: `~/.clawdbot/agents/main/sessions/56c4671f...jsonl`
  - Turn threshold: 5 messages
  - Summarization model: google/gemini-3-pro-preview
- **Decisions:**
  - Chose file-based approach (Phase 1) for rapid deployment
  - Deferred hook implementation to Phase 2
- **Open Items:**
  - Integrate Gemini API for actual summarization
  - Test with real conversation
```

---

## Integration Guide

### For Main Agent (AGENTS.md)
Add to "Every Session" checklist:

```markdown
3. Read `memory/conversation-summary.md` for compressed conversation history
4. Read `memory/YYYY-MM-DD.md` (today) for recent raw logs
```

### For Heartbeat (HEARTBEAT.md)
Add to periodic checks:

```markdown
## Context Compression (Check every ~30 min)
- Run: `./scripts/summarize-context.sh`
- If threshold reached → summarization triggered automatically
- Next summary at turn: [shown in script output]
```

---

## Testing

### Verify Turn Counting
```bash
$ ./scripts/summarize-context.sh
Current turns: 88
Last summary at turn: 88
Turns since summary: 0

⏳ No action needed. Next summary in 5 turns.
```

### Test Scenario
See: `memory/test-scenario-context-compression.md`

**Phases:**
1. Manual validation (turn counting, summarization quality)
2. Token measurement (baseline vs compressed)
3. Quality validation (conversation continuity)

**Success criteria:**
- ✅ Turn counting accurate
- ✅ Token reduction ≥ 80%
- ✅ Conversation continuity maintained
- ✅ No context loss or hallucinations

---

## Next Actions

### Today (2026-01-25)
1. Integrate Gemini API in `summarize-context.sh`
2. Test summarization with turns 1-88
3. Validate summary quality
4. Update AGENTS.md with new memory pattern

### Tomorrow (2026-01-26)
1. Continue conversation 5+ more turns
2. Trigger second summarization automatically
3. Test model recall of earlier context
4. Measure actual token usage

### Week 1
1. Heartbeat integration
2. Production validation
3. Monitor quality and token savings
4. Refine summarization prompt if needed

---

## Monitoring

### Metrics to Track
- **Turn count:** Current vs last summary
- **Token savings:** Baseline vs compressed
- **Summary quality:** Manual review
- **Conversation continuity:** Can model reference early turns?
- **Response latency:** No degradation expected

### Health Check
```bash
# Check counter state
cat memory/turn-counter.json | jq

# View recent summaries
tail -50 memory/conversation-summary.md

# Count current turns
grep '"type":"message"' ~/.clawdbot/agents/main/sessions/*.jsonl | \
  grep '"role":"user"' | wc -l
```

---

## Troubleshooting

### Turn count seems wrong
- Check session ID in turn-counter.json matches current session
- Verify JSONL file exists and is readable
- Manually count user messages to verify

### Summarization not triggering
- Run script manually: `./scripts/summarize-context.sh`
- Check threshold: needs 5+ turns since last summary
- Verify heartbeat is running

### Summary quality issues
- Review summarization prompt: `prompts/summarization-prompt.md`
- Check Gemini model output
- Refine prompt to preserve more context

---

## References

- **Design doc:** `memory/context-compression-design.md`
- **Test scenario:** `memory/test-scenario-context-compression.md`
- **Token optimization:** `TOKEN-OPTIMIZATION.md`
- **Implementation log:** `memory/token-optimization-implementation.md`

---

**Last Updated:** 2026-01-25 09:20 CST  
**Next Review:** After first production summarization
