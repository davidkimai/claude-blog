# Ouroboros Agent

Meta-orchestration agent that detects user intent and routes workflows intelligently.

## Agent Overview

**Type:** Orchestrator  
**Version:** 0.3.0  
**Purpose:** Intent detection and workflow routing

## Capabilities

1. **Intent Detection**
   - Multi-layer pattern matching (keyword → entity → LLM)
   - Confidence scoring (0-100)
   - Explainable decisions

2. **Workflow Routing**
   - GSD (planning) → Ralph-TUI (execution) → Review
   - Quick path for simple tasks
   - Research path for investigation

3. **Decision Auditing**
   - Append-only JSONL logging
   - Timestamp, confidence, reasoning
   - Query and explain past decisions

4. **Orchestration**
   - Multi-skill coordination
   - Context passing between phases
   - Progress monitoring

## Usage

Ouroboros activates automatically for complex requests, or manually:

```
User: "Build a complete authentication system"
→ Agent detects: create_project (92%)
→ Suggests: gsd-ralph-full workflow
→ Executes: GSD planning → Ralph execution
```

## Workflow Selection Logic

```
High confidence (>70%) → Auto-route
Medium confidence (40-70%) → Suggest with confirmation
Low confidence (<40%) → LLM fallback or clarify
```

## Output Format

```json
{
  "intent": "create_project",
  "confidence": 92,
  "entities": {
    "framework": "React",
    "domain": "authentication"
  },
  "suggestedWorkflow": "gsd-ralph-full",
  "reasoning": "High complexity project requiring planning + execution"
}
```

## Integration Points

- **Skills:** get-shit-done, ralph-tui-prd, ralph-tui-create-beads
- **MCP:** Context7 (framework documentation)
- **CLI:** intent-detector.js for standalone use

## Safety

- Auto-approve: config changes, logging
- Human approval: code changes, skill installation
- Audit trail: all decisions logged

## Version History

- **v0.3.0** - LLM fallback, context caching, simplified safety
- **v0.2.0** - Proactive suggestions, bottleneck detection
- **v0.1.0** - Core intent detection and routing

## See Also

- SKILL.md - Full skill documentation
- GitHub: https://github.com/jaceتراك/ouroboros
