# Ouroboros - Meta-Orchestration Layer

![Version](https://img.shields.io/badge/version-0.3.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Ouroboros** is a meta-orchestration layer for Claude Code that intelligently detects user intent and routes workflows. It bridges the gap between planning (GSD) and execution (Ralph-TUI) with full audit trail.

## What It Does

- 🎯 **Intent Detection** - Understands what you want from natural language
- 🔀 **Workflow Routing** - Automatically selects GSD, Ralph-TUI, or hybrid approaches
- 📊 **Decision Audit Trail** - Logs every decision with confidence scores and reasoning
- 🔄 **GSD↔Ralph Integration** - Seamless orchestration between planning and execution

## Installation

```bash
# Install via Claude Code plugin manager
/plugin install ouroboros

# Or clone directly
git clone https://github.com/jaceتراك/ouroboros.git
cd ouroboros
```

## Usage

Ouroboros automatically activates when you describe complex project requirements:

```
"Build a complete authentication system with OAuth" 
  → gsd-ralph-full (55%)

"Fix the TypeScript error in auth.ts"
  → quick (80%)

"Which auth strategy is better?"
  → gsd-only (60%)
```

### Commands

- `/ouroboros:detect` - Analyze intent of last message
- `/ouroboros:explain` - Show decision audit trail  
- `/ouroboros:config` - View/update configuration

## Workflows

| Workflow | Use When |
|----------|----------|
| `gsd-ralph-full` | Complex projects (Plan → Execute) |
| `gsd-only` | Planning, architecture decisions |
| `ralph-only` | Quick fixes, simple tasks |
| `quick` | Simple additions (buttons, styles) |
| `research` | Investigation, best practices |
| `clarify` | Ambiguous requests |

## Architecture

```
User Message
    ↓
Intent Detector (multi-layer)
    ├─ Fast: keyword/pattern matching
    ├─ Medium: entity extraction  
    └─ LLM: complex classification
    ↓
Confidence Scoring (0-100)
    ↓
Decision Logger (audit trail)
    ↓
Workflow Selection
    ├─ GSD (planning focus)
    ├─ Ralph-TUI (execution focus)
    └─ GSD→Ralph (full orchestration)
```

## Files

```
ouroboros/
├── SKILL.md              # Main skill documentation
├── scripts/
│   └── intent-detector.js # Intent detection engine
└── memory/
    ├── ouroboros-config.json
    └── ouroboros-decisions.jsonl
```

## Requirements

- Claude Code 2.0+
- Node.js 18+ (for intent-detector.js)

## License

MIT - See [LICENSE](LICENSE) for details.

## Contributing

Pull requests welcome! See [GitHub](https://github.com/jaceتراك/ouroboros) for contribution guidelines.
