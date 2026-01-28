# Clawdbot Workspace

**Home:** `/Users/jasontang/clawd`

## Directory Structure

```
clawd/
├── CLAUDE.md              # ← START HERE - Core context for Claude
├── README.md              # This file
├── SOUL.md                # Deep identity & values (reference)
├── src/                   # Core Clawdbot source code
├── skills/                # 45+ skills (agent capabilities)
├── scripts/               # Utility & automation scripts
├── docs/                  # Documentation
│   ├── guides/           # How-to, workflows, troubleshooting
│   ├── architecture/     # System design & security analysis
│   └── security/         # Security research & reports
├── research/             # AI safety research
│   ├── ai-safety/        # Safety frameworks, evaluations
│   └── attacks/          # Attack taxonomy, PoCs
├── memory/               # Session continuity (read every startup)
├── projects/             # Active projects
├── sandbox/              # Testing environments
├── archive/              # Archived/legacy docs
└── test-environment/     # Test harnesses
```

## Quick Links

| Need | Go To |
|------|-------|
| Start working | `CLAUDE.md` |
| Write code | `skills/` + `src/` |
| Research AI safety | `research/ai-safety/` |
| Security analysis | `docs/security/` |
| Scripts & tools | `scripts/` |
| Check history | `memory/` |
| Active work | `projects/` |

## Core Files

- **CLAUDE.md** - Essential context (read first!)
- **SOUL.md** - Deep identity & values
- **HEARTBEAT.md** - Proactive monitoring protocol
- **MEMORY.md** - Curated long-term memories

## Skills Overview

| Category | Count | Examples |
|----------|-------|----------|
| Development | 15+ | coding-agent, react-native-best-practices |
| AI/ML | 10+ | ai-safety-skills, gemini, nano-banana-pro |
| Productivity | 10+ | things-mac, apple-notes, obsidian |
| Communication | 8+ | imsg, slack, whatsapp, telegram |
| Research | 5+ | summarize, content-research, audit-website |

See `skills/` directory for full list.

## Connected Services

| Service | Status | Config |
|---------|--------|--------|
| Telegram | ✅ | @acejaece |
| WhatsApp | ✅ | Connected |
| GitHub | ✅ | davidkimai/clawd (private) |

## Git Workflow

```bash
# Quick sync
git add -A
git commit -m "Update - $(date +%Y-%m-%d)"
git push origin main
```

## Backup

- **Private repo:** https://github.com/davidkimai/clawd
- **Auto-sync:** See `scripts/backup-to-github.sh`

## Notes

- Root-level `.md` files are minimized — most moved to `docs/`
- Legacy docs in `archive/`
- Test environments in `test-environment/`
- PoCs in `research/attacks/`
