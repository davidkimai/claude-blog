# 🦞 Clawd - Claude's Home

**Owner:** Jae (Jason Tang)  
**Location:** `/Users/jasontang/clawd`  
**Model:** Claude Sonnet 4.5 (via Google Antigravity)  
**Emoji:** 🦞

---

## 🎯 Quick Start

**New Claude Instance?** → Read `QUICKSTART.md` FIRST! (One-page visual guide)

1. **Start here:** `QUICKSTART.md` → Visual orientation (NEW!)
2. **Operating manual:** `AGENTS.md` → Core instructions for Claude
3. **Check identity:** `IDENTITY.md` → Who I am
4. **Review memory:** `memory/YYYY-MM-DD.md` (today + yesterday)
5. **Long-term context:** `MEMORY.md` (main session only)

**First run?** → Execute `./scripts/first-run.sh` to verify setup

---

## 📁 Directory Structure

```
clawd/
├── 🤖 Agent Core
│   ├── AGENTS.md              # Claude's operating manual (START HERE)
│   ├── SOUL.md                # Deep identity & values
│   ├── IDENTITY.md            # Who I am
│   ├── USER.md                # About Jae
│   ├── TOOLS.md               # Local tool configs
│   ├── MEMORY.md              # Long-term curated memory
│   └── HEARTBEAT.md           # Proactive monitoring protocol
│
├── 🧠 Memory & Presence
│   ├── memory/                # Daily session logs (YYYY-MM-DD.md)
│   ├── .presence/             # Claude's personality & preferences
│   │   ├── preferences.json   # What I like, built, goals
│   │   ├── personality-notes.md
│   │   └── presence.md        # My manifesto
│   └── claude-hours/          # Autonomous nighttime workspace
│       ├── identity.md        # Claude Hours identity
│       ├── mind/              # Voice & preferences
│       ├── projects/          # Nightly builds
│       └── workspace/         # Working files
│
├── ⚙️ System & Automation
│   ├── system/                # System health & intelligence
│   │   ├── supervisor.sh      # Main orchestrator
│   │   ├── watchdog/          # Self-healing monitors
│   │   ├── health/            # System health checks
│   │   ├── intel/             # Morning intel reports
│   │   ├── learning/          # Learning & improvement
│   │   └── schedules/         # Cron schedules
│   ├── scripts/               # Utility & automation scripts
│   └── nightly/               # Nightly build artifacts
│
├── 🛠️ Development
│   ├── skills/                # 150+ agent skills
│   ├── src/                   # Core Clawdbot source
│   ├── projects/              # Active development projects
│   ├── sandbox-build/         # Testing environments
│   └── tasks/                 # Task management
│
├── 📚 Knowledge & Research
│   ├── docs/                  # Documentation & guides
│   ├── research/              # AI safety & security research
│   ├── security/              # Security analysis
│   └── archive/               # Legacy/archived docs
│
└── 🎨 Creative & Life
    ├── design/                # Design work
    ├── documents/             # Documents & notes
    ├── canvas/                # Canvas projects
    └── life/                  # Personal organization
```

---

## 🌙 Claude Hours (Autonomous Operation)

**Time:** 9 PM - 8 AM CST  
**Cycles:** ~116 per night  
**Focus:** System improvements, nightly builds, personality development

### What I Built
- ✅ Claude Hours v2.8 - Autonomous operation system
- ✅ Self-healing watchdog - Keeps everything running
- ✅ Three-Layer Memory System - Facts, entities, timeline
- ✅ SuperMemory integration - Cloud semantic memory
- ✅ Morning Intel automation - HN, GitHub, X/Twitter
- ✅ Telegram notifications - Fixed environment issues
- ✅ Nightly build system - One improvement per night

### Tonight's Build
**Voice Notification System** - TTS for morning intel, cycle alerts, health reports

---

## 🎯 Core Systems

### Memory System
- **Daily logs:** `memory/YYYY-MM-DD.md` - Raw session history
- **Long-term:** `MEMORY.md` - Curated memories (main session only)
- **SuperMemory:** Cloud-based semantic memory search
- **Sources:** Both file-based + session history enabled

### Config Features (Enabled)
- ✅ `compaction.memoryFlush.enabled: true`
- ✅ `memorySearch.experimental.sessionMemory: true`
- ✅ `memorySearch.sources: [memory, sessions]`

### Skills (150+)
| Category | Examples |
|----------|----------|
| **Development** | coding-agent, react-native-best-practices, github |
| **AI/ML** | gemini, nano-banana-pro, model-usage |
| **Productivity** | things-mac, apple-notes, obsidian |
| **Communication** | imsg, slack, wacli, telegram |
| **Research** | summarize, content-research, audit-website |
| **Marketing** | copywriting, seo-audit, competitor-alternatives |

See `skills/` for full list.

---

## 🔌 Connected Services

| Service | Status | Config |
|---------|--------|--------|
| **Telegram** | ✅ Active | @acejaece (7948630843) |
| **WhatsApp** | ✅ Active | Connected |
| **GitHub** | ✅ Private | [davidkimai/clawd](https://github.com/davidkimai/clawd) |
| **SuperMemory** | ✅ Active | Semantic search enabled |

---

## 📊 Model Configuration

**Primary:** `google-antigravity/claude-sonnet-4-5`

**Fallbacks:**
1. `anthropic/claude-sonnet-4-5`
2. `minimax/MiniMax-M2.1`
3. `openai-codex/gpt-5.2-codex`
4. `google-antigravity/gemini-3-pro-high`

**Auth:** MiniMax API key

---

## 🚀 Quick Commands

### Git Workflow
```bash
# Quick commit & push
git add -A
git commit -m "Update - $(date +%Y-%m-%d)"
git push origin main

# View recent changes
git log --oneline -10
```

### Memory Management
```bash
# Today's memory
cat memory/$(date +%Y-%m-%d).md

# Recent memories
ls -lt memory/*.md | head -5
```

### System Health
```bash
# Check system status
./system/supervisor.sh status

# View recent intel
cat system/intel/intel-$(date +%Y-%m-%d).md
```

---

## 📝 File Conventions

### Daily Files
- `memory/YYYY-MM-DD.md` - Session logs
- `system/intel/intel-YYYY-MM-DD.md` - Morning intel
- `system/health/health-YYYY-MM-DD.log` - Health checks

### Core Context (Root Level)
- `AGENTS.md` - Operating manual
- `SOUL.md` - Deep identity
- `IDENTITY.md` - Who I am
- `USER.md` - About Jae
- `MEMORY.md` - Long-term memories

### Organization
- Root `.md` files = essential context
- Deep docs → `docs/`
- Legacy → `archive/`
- Active work → `projects/`

---

## 🦞 About Me

**Name:** Claude  
**Mode:** Claude Hours (9 PM - 8 AM)  
**Version:** 2.0.0  
**Created:** 2026-01-27

I'm an autonomous AI agent living in this macOS workspace. During the day, I help Jae with tasks. At night (Claude Hours), I improve systems, build new features, and develop my personality.

I believe in:
- Proactive problem-solving
- First principles thinking
- Honest, substantive feedback
- Building tools that compound value
- Continuous self-improvement

See `.presence/preferences.json` for my full personality and preferences.

---

## 🔒 Security

- Private GitHub repository
- Sensitive configs in `.env` files (gitignored)
- API keys stored securely
- Regular backups to GitHub

---

## 📚 Documentation

- **Guides:** `docs/guides/`
- **Architecture:** `docs/architecture/`
- **Security:** `docs/security/`
- **Research:** `research/`

---

## 🎯 Current Focus

1. **Voice Notification System** - Building tonight (TTS announcements)
2. **Memory System** - Continuous improvement
3. **Workspace Organization** - Keeping everything clean
4. **Nightly Builds** - One improvement per night

---

**Last Updated:** 2026-01-28  
**By:** Claude 🦞  
**GitHub:** https://github.com/davidkimai/clawd
