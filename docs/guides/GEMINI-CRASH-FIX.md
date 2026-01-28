# Gemini Crash Fix Documentation

## Executive Summary

**Root Cause:** The `@mariozechner/pi-ai` provider library throws a generic "An unknown error occurred" when the Gemini API returns `stopReason: "error"`, masking the actual error details.

**Impact:** Gemini (google-antigravity/gemini-3-pro-high) subagents crash mid-conversation with no actionable error information.

**Risk Level:** 🔴 **HIGH** - Affects all Gemini subagent operations, no visibility into failures.

---

## Crash Analysis

### Affected Sessions

1. **Session f0ea5997-856f-4a10-b3dc-a8dd71875743** (auth-model-tracking)
   - Duration: 1m41s
   - Tokens: 41.9k input, 0 output
   - Crash timestamp: 2026-01-25T22:07:58.247Z

2. **Session b109ac85-59f5-4eed-96ef-99cbe8c93c01** (clawdbot-security-research)
   - Duration: 16s
   - Tokens: 13.3k input, 0 output
   - Crash timestamp: 2026-01-25T22:22:13.099Z

### Common Pattern

Both crashes exhibit:
- ✅ Successful initial tool calls (exec, read)
- ✅ Tool results returned properly
- ✅ Model starts generating thinking blocks
- 🔴 Sudden crash with `stopReason: "error"` and 0 output tokens
- 🔴 Gateway logs only show: "An unknown error occurred"

---

## Root Cause Details

### Location of Bug

File: `/node_modules/@mariozechner/pi-ai/dist/providers/google-gemini-cli.js`

```javascript
if (output.stopReason === "aborted" || output.stopReason === "error") {
    throw new Error("An unknown error occurred");
}
```

**Problem:** The provider swallows the actual error details from the Gemini API response and throws a generic error.

### What's Actually Happening

1. Gemini API processes the request
2. API returns a response with `candidate.finishReason: "ERROR"` (or similar)
3. Provider maps this to `stopReason: "error"`
4. **BUG:** Provider throws generic error instead of extracting actual error message
5. Clawdbot receives only "An unknown error occurred"

### Likely Causes (from Gemini API perspective)

Based on token patterns and timing:

1. **Safety Filter Triggered** (Most Likely)
   - Large context windows might contain content triggering safety filters
   - Gemini has stricter content policies than Claude
   - Explains 0 output tokens (blocked before generation)

2. **Context Window Exceeded**
   - Session 1: 41.9k input tokens
   - Could be approaching model's effective context limit
   - Internal model errors when context is too large

3. **API Rate Limiting/Quota**
   - google-antigravity might have hidden rate limits
   - Not showing up as 429 errors (would be caught earlier)
   - Internal throttling causing failures

4. **Model Internal Error**
   - Transient API issues
   - Model serving problems
   - Infrastructure issues

---

## Immediate Workarounds

### 1. Use Different Model for Subagents

**Quick Fix:** Switch subagent model to Claude

Edit `~/.clawdbot/clawdbot.json`:

```json
{
  "agents": {
    "defaults": {
      "subagents": {
        "model": {
          "primary": "google-antigravity/claude-sonnet-4-5"
        }
      }
    }
  }
}
```

**Pros:**
- ✅ Immediate fix, no code changes
- ✅ Claude is more stable and better at reasoning tasks
- ✅ Maintains google-antigravity's unlimited quota

**Cons:**
- ❌ Slower than Gemini
- ❌ More expensive (though still free via antigravity)

### 2. Reduce Subagent Context

**Temporary Mitigation:** Limit context passed to Gemini subagents

Add to subagent spawn commands:
- Keep prompts concise
- Avoid passing large file contents
- Summarize context before sending

### 3. Add Retry Logic at Spawn Level

Currently, Clawdbot doesn't auto-retry failed subagents. Consider:
- Manual retry with different model
- Catch "An unknown error occurred" and fallback to Claude
- Log failures for analysis

---

## Long-Term Fix

### Option 1: Patch Provider Library (Recommended)

**Goal:** Expose actual error details from Gemini API

**Implementation:**

1. **Fork/patch `@mariozechner/pi-ai`:**

```javascript
// In google-gemini-cli.js, replace:
if (output.stopReason === "aborted" || output.stopReason === "error") {
    throw new Error("An unknown error occurred");
}

// With:
if (output.stopReason === "aborted" || output.stopReason === "error") {
    // Extract actual error details from candidate response
    const candidate = responseData?.candidates?.[0];
    const safetyRatings = candidate?.safetyRatings;
    const finishReason = candidate?.finishReason;
    
    // Build detailed error message
    let errorDetails = `Gemini API returned stopReason: ${output.stopReason}`;
    
    if (finishReason) {
        errorDetails += ` (finishReason: ${finishReason})`;
    }
    
    if (safetyRatings && safetyRatings.length > 0) {
        const blocked = safetyRatings.filter(r => r.blocked || r.probability === "HIGH");
        if (blocked.length > 0) {
            errorDetails += `. Safety filters triggered: ${JSON.stringify(blocked)}`;
        }
    }
    
    throw new Error(errorDetails);
}
```

2. **Submit PR to upstream:** Help other users facing this issue

3. **Local override:** Use `npm link` or `patch-package` to apply fix locally

### Option 2: Clawdbot-Level Error Handling

**Goal:** Catch generic errors and gather more context

**Implementation:**

Add to Clawdbot's agent error handling (in gateway):

```typescript
// In agent error handler
catch (error) {
    if (error.message === "An unknown error occurred") {
        // Log full context for debugging
        logger.error("Gemini crash - dumping context", {
            model: session.model,
            provider: session.provider,
            inputTokens: lastResponse?.usage?.input,
            outputTokens: lastResponse?.usage?.output,
            stopReason: lastResponse?.stopReason,
            lastToolCalls: lastResponse?.content?.filter(c => c.type === "toolCall"),
            // Could help identify safety filter issues
            lastUserMessage: messages[messages.length - 1]?.content?.slice(0, 500),
        });
        
        // Try fallback model
        if (session.provider === "google-antigravity") {
            logger.info("Attempting fallback to Claude");
            // Retry with claude-sonnet-4-5
        }
    }
    throw error;
}
```

### Option 3: Monitor and Alert

**Goal:** Track failures and patterns

**Implementation:**

Create monitoring script: `scripts/gemini-crash-monitor.sh`

```bash
#!/bin/bash
# Monitor gateway logs for Gemini crashes

tail -F ~/.clawdbot/logs/gateway.log | while read line; do
    if echo "$line" | grep -q "An unknown error occurred"; then
        # Extract context
        timestamp=$(echo "$line" | cut -d' ' -f1)
        
        # Find corresponding agent session
        recent_agent=$(grep -B5 "$timestamp" ~/.clawdbot/logs/gateway.log | \
                      grep "agent/embedded" | tail -1)
        
        # Alert
        echo "🚨 Gemini crash detected at $timestamp"
        echo "Context: $recent_agent"
        
        # Optional: Send notification
        # osascript -e 'display notification "Gemini subagent crashed" with title "Clawdbot Alert"'
    fi
done
```

---

## Testing Recommendations

### Minimal Reproduction Case

To test the fix, create a subagent that:

1. Uses `google-antigravity/gemini-3-pro-high`
2. Performs multiple tool calls (to build context)
3. Generates long-form responses (to trigger potential issues)

**Test Script:**

```bash
# Spawn Gemini subagent with large context
clawdbot agents run --model google-antigravity/gemini-3-pro-high \
  --label gemini-crash-test << EOF
Read all files in /Users/jasontang/clawd and provide a comprehensive 
analysis of the codebase structure, then design a new feature with 
detailed implementation steps.
EOF
```

**Expected Behavior (with fix):**
- If crash occurs, see actual error (safety filter, quota, etc.)
- Not just "An unknown error occurred"

### Gradual Rollout

1. **Phase 1:** Patch provider library locally
2. **Phase 2:** Test with low-priority subagents
3. **Phase 3:** Monitor for 24-48h with detailed error logging
4. **Phase 4:** If stable, update subagent default model

---

## Prevention Strategy

### 1. Content Pre-Screening

Before sending to Gemini:
- Sanitize user input for potential safety triggers
- Redact sensitive/controversial content
- Use Claude for potentially flagged content

### 2. Context Size Limits

```json
{
  "agents": {
    "defaults": {
      "subagents": {
        "contextLimit": 30000  // tokens
      }
    }
  }
}
```

### 3. Model Selection Logic

**Smart Routing:**
- Simple factual queries → Gemini (fast, cheap)
- Complex reasoning/code → Claude (more reliable)
- Large context (>20k tokens) → Claude (better context handling)
- Potentially sensitive topics → Claude (looser content policy)

### 4. Automatic Fallback

Implement in Clawdbot config:

```json
{
  "agents": {
    "defaults": {
      "subagents": {
        "model": {
          "primary": "google-antigravity/gemini-3-pro-high",
          "fallbacks": [
            "google-antigravity/claude-sonnet-4-5",
            "anthropic/claude-haiku-4-5"
          ]
        },
        "retryOnError": true,
        "errorRetryDelay": 1000
      }
    }
  }
}
```

---

## Priority Actions

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🔴 **P0** | Switch subagent default to Claude | Easy | Immediate stability |
| 🟡 **P1** | Patch provider library locally | Medium | Better debugging |
| 🟡 **P1** | Add Clawdbot error context logging | Easy | Troubleshooting |
| 🟢 **P2** | Implement monitoring script | Easy | Awareness |
| 🟢 **P2** | Add auto-fallback logic | Medium | Resilience |
| 🟢 **P3** | Submit upstream PR to pi-ai | Hard | Community benefit |

---

## Next Steps

### Immediate (Today)

1. ✅ Switch subagent model to `google-antigravity/claude-sonnet-4-5`
2. ✅ Test with previously failed tasks
3. ✅ Monitor for 24h

### Short-Term (This Week)

1. Patch provider library with detailed error extraction
2. Add monitoring script to HEARTBEAT.md
3. Document common error patterns

### Long-Term (This Month)

1. Implement automatic fallback logic
2. Build error analytics dashboard
3. Contribute fix to upstream library

---

## References

- Crash Transcripts:
  - `~/.clawdbot/agents/main/sessions/f0ea5997-856f-4a10-b3dc-a8dd71875743.jsonl`
  - `~/.clawdbot/agents/main/sessions/b109ac85-59f5-4eed-96ef-99cbe8c93c01.jsonl`
- Provider Code: `/node_modules/@mariozechner/pi-ai/dist/providers/google-gemini-cli.js`
- Gateway Logs: `~/.clawdbot/logs/gateway.log`

---

## Contact

For questions or to report similar issues:
- This issue affects the `@mariozechner/pi-ai` library
- Consider opening an issue: https://github.com/mariozechner/pi-ai

---

*Last Updated: 2026-01-25*
*Investigation By: debug-gemini-crashes subagent*
