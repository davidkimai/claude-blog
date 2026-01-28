# Codex CLI Installation Guide

**For Claude Hours autonomous coding (token-efficient)**

---

## What is Codex CLI?

OpenAI's Codex CLI is a coding agent that runs locally and uses `gpt-5.2-codex` model. It's designed for:
- Writing and editing code
- Running shell commands
- Creating files and projects
- Autonomous operation during Claude Hours

**Key benefit:** Uses its own tokens, doesn't drain your Claude plan.

---

## Installation

### Option 1: npm/pnpm/bun

```bash
npm install -g @openai/codex
# or
pnpm add -g @openai/codex
# or
bun add -g @openai/codex
```

### Option 2: Direct download

Check https://github.com/openai/codex for releases.

### Option 3: Via Homebrew

```bash
brew install openai/codex/codex
```

---

## Configuration

### API Key Setup

Codex uses OpenAI API. Set your key:

```bash
export OPENAI_API_KEY="sk-..."
```

Or add to your shell profile (`~/.zshrc` or `~/.bashrc`):
```bash
echo 'export OPENAI_API_KEY="sk-..."' >> ~/.zshrc
```

### Verify Installation

```bash
codex --version
codex --help
```

---

## Usage for Claude Hours

### Quick One-Shot

```bash
# Create temp git repo (Codex requires git)
SCRATCH=$(mktemp -d) && cd $SCRATCH && git init && codex exec "Your prompt"

# Or in existing project
cd /Users/jasontang/clawd
codex exec --full-auto "Build a feature that..."
```

### Flags

| Flag | Effect |
|------|--------|
| `exec "prompt"` | One-shot execution, exits when done |
| `--full-auto` | Sandboxed but auto-approves in workspace |
| `--yolo` | NO sandbox, NO approvals (fastest, most dangerous) |

### Running in Background

```bash
codex --full-auto "Build a tool that improves our workflow" &
# Or use with pty in clawdbot:
bash pty:true background:true command:"codex --full-auto 'Your task'"
```

---

## Integration with Clawdbot

### Via coding-agent Skill

Use `bash pty:true` for Codex operations:

```bash
bash pty:true workdir:/Users/jasontang/clawd command:"codex exec --full-auto 'Create a script that...'"
```

### Safety Rules

- ✅ Use `--full-auto` for building
- ✅ Create PRs, don't push live
- ✅ Never run in ~/clawd/ directly (use worktrees)
- ❌ Don't delete files without explicit permission
- ❌ Don't commit directly to main

---

## Tips for Claude Hours

1. **Start with clear prompts** — "Build X that does Y, output to Z"
2. **Define success criteria** — "Done when file X exists and works"
3. **Use --full-auto** — Auto-approves changes, faster for overnight work
4. **Create PRs for review** — Don't push to main without approval
5. **Log progress** — Update nightly report with what Codex built

---

## Troubleshooting

### "Not in a git repository"
```bash
cd /Users/jasontang/clawd
git status  # Must be in or under a git repo
```

### Authentication errors
```bash
export OPENAI_API_KEY="sk-..."
echo $OPENAI_API_KEY  # Verify it's set
```

### Slow performance
- Check API rate limits
- Use `--full-auto` instead of interactive mode
- Keep prompts focused and atomic

---

## See Also

- [coding-agent Skill](../../skills/coding-agent/SKILL.md)
- [Claude Hours Framework](../../memory/2026-01-27.md)
