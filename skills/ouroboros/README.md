# Ouroboros - Quick Reference

Meta-orchestration layer for Clawdbot. Detects user intent, routes workflows, and provides decision audit trail.

## Quick Start

```bash
cd ~/clawd/skills/ouroboros

# Test intent detection
node scripts/intent-detector.js "Build a React app"
node scripts/intent-detector.js --explain "Fix the bug in auth.ts"

# View decision history
node scripts/decision-logger.js explain 10
node scripts/decision-logger.js stats

# Run integration test
node scripts/test-integration.js
```

## Intent Categories

| Intent | Description | Typical Workflow |
|--------|-------------|------------------|
| `create_project` | Build from scratch | GSD → Ralph full |
| `extend_feature` | Add to existing | GSD → Ralph or Ralph only |
| `debug_fix` | Fix bugs/errors | Quick (no orchestration) |
| `discuss_decision` | Architecture/design | GSD discussion only |
| `optimize` | Improve performance | GSD → Ralph |
| `research` | Gather information | Research skill |
| `clarify` | Need more info | Ask questions |

## Workflows

- **`gsd-ralph-full`** - Full GSD→Ralph orchestration (complex projects)
- **`gsd-only`** - Planning/discussion only
- **`ralph-only`** - Direct execution
- **`quick`** - Handle directly (simple fixes)
- **`research`** - No execution needed
- **`clarify`** - Ask for more information

## Configuration

Edit `memory/ouroboros-config.json`:

```json
{
  "intent_detection": {
    "min_confidence_threshold": 70  // Adjust threshold
  },
  "workflow_routing": {
    "auto_execute": false,           // Safety: require confirmation
    "require_confirmation": true
  }
}
```

## Integration (Developers)

```javascript
const { detectIntent } = require('./skills/ouroboros/scripts/intent-detector');
const { logDecision } = require('./skills/ouroboros/scripts/decision-logger');

// Detect intent
const result = detectIntent("Build a React app");

// Log decision
logDecision(result);

// Use result
if (result.confidence >= 70) {
  switch (result.suggestedWorkflow) {
    case 'gsd-ralph-full':
      // Run full orchestration
      break;
    case 'quick':
      // Handle directly
      break;
  }
}
```

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Full documentation |
| `PHASE1-COMPLETION.md` | Implementation summary |
| `scripts/intent-detector.js` | Intent detection engine |
| `scripts/decision-logger.js` | Audit trail system |
| `scripts/test-integration.js` | Integration tests |
| `memory/ouroboros-config.json` | Configuration |
| `memory/ouroboros-decisions.jsonl` | Decision log |

## Phase 1 Status

✅ **Complete** - Core orchestration with intent detection and audit trail  
📅 **Next:** Phase 2 - Proactive suggestions and auto-skill installation

See `PHASE1-COMPLETION.md` for full details.
