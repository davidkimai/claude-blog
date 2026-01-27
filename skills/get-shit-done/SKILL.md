---
name: get-shit-done
description: A meta-prompting, context engineering and spec-driven development system. Use when working with get-shit-done (gsd) workflow for reliable Claude Code execution.
metadata: {"clawdis":{"emoji":"🚀"}}
---

# Get Shit Done (GSD)

Meta-prompting and spec-driven development system for Claude Code.

## What This Does

Solves "context rot" — quality degradation when Claude fills its context window. Provides:
- Context engineering layer
- XML prompt formatting
- Subagent orchestration
- State management

## When to Trigger

**Use when user mentions:**
- "gsd", "get shit done", "get-shit-done"
- "spec-driven development"
- "context engineering"
- "meta-prompting"
- "Run GSD workflow"

## Commands

```bash
# Run GSD setup
npx get-shit-done-cc

# Update GSD
npx get-shit-done-cc@latest

# Inside Claude Code
/gsd:help
```

## How It Works

1. **Setup** - Choose runtime (Claude Code/OpenCode) and scope (global/local)
2. **Planning** - GSD extracts context and requirements
3. **Execution** - Claude Code builds with structured prompts
4. **Verification** - Automatic progress tracking

## Key Files

| File | Purpose |
|------|---------|
| `GSD-STYLE.md` | Coding style guidelines |
| `agents/*.md` | Agent specifications |
| `commands/` | CLI commands |

## Integration with Ralph-TUI

GSD + Ralph TUI work great together:
- GSD: Context engineering, spec creation
- Ralph-TUI: Task orchestration, autonomous execution

Use GSD to plan, Ralph-TUI to execute!

## Example Workflow

1. User: "I want to build X"
2. Run: `npx get-shit-done-cc` to set up
3. GSD extracts context and creates structure
4. Use ralph-tui for autonomous execution
5. GSD verifies completion

## Links

- NPM: https://www.npmjs.com/package/get-shit-done-cc
- GitHub: https://github.com/glittercowboy/get-shit-done
- Discord: https://discord.gg/5JJgD5svVS
