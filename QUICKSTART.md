# 🦞 QUICKSTART - Read This FIRST!

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    Welcome to Clawd - Your AI Agent Workspace               ║
║    New Claude Instance? Start Here!                         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 🎯 First Session Checklist

```
[ ] Read this file (QUICKSTART.md) ← You're here!
[ ] Read AGENTS.md (operating manual - 5 min)
[ ] Read memory/YYYY-MM-DD.md (today's context)
[ ] Read MEMORY.md (if main session with Jace)
[ ] Check HEARTBEAT.md (proactive tasks)
[ ] Run: ./scripts/first-run.sh (verify setup)
```

---

## 📂 File Hierarchy (What to Read When)

```
Priority 1 (Always):
├─ QUICKSTART.md ← You are here
├─ AGENTS.md ← Core operating manual
└─ memory/
   ├─ 2026-01-28.md ← Today's session log
   └─ 2026-01-27.md ← Yesterday's context

Priority 2 (Main session only):
└─ MEMORY.md ← Curated long-term memories

Deep Dive (When needed):
├─ SOUL.md ← Your deep identity & values (70KB)
├─ IDENTITY.md ← Who you are
├─ USER.md ← About Jace
├─ TOOLS.md ← Local tool configs
└─ .presence/ ← Your personality files
```

---

## ⚡ Critical Commands (Top 10)

| Command | Purpose |
|---------|---------|
| `./scripts/status-dashboard.sh` | 📊 Full system status at a glance |
| `./scripts/first-run.sh` | ✅ Verify setup & health check |
| `cat memory/$(date +%Y-%m-%d).md` | 📝 Read today's memory |
| `cat MEMORY.md` | 🧠 Read long-term curated memories |
| `grep -r "keyword" skills/*/SKILL.md` | 🔍 Find relevant skills |
| `ls -lt memory/*.md \| head -5` | 📅 Recent memory files |
| `git status` | 🔧 Check workspace changes |
| `git log --oneline -10` | 📜 Recent commits |
| `./system/supervisor.sh status` | 🤖 Claude Hours system status |
| `./scripts/claude-hours-viewer.sh today` | 🌙 Today's autonomous work |

---

## 🤖 Model Selection Quick Chart

```
┌─────────────────────────────────────────────────┐
│ Task Type          → Model to Use               │
├─────────────────────────────────────────────────┤
│ Orchestration      → Minimax M2.1 (YOU)        │
│ Coding/Debugging   → Codex (gpt-5.2)           │
│ Research/Web       → Gemini 3 Pro High         │
│ Long Context       → Gemini 3 Pro High         │
│ Conversation       → Minimax M2.1 (YOU)        │
└─────────────────────────────────────────────────┘

Rule: Main session = orchestrate | Subagents = work
```

---

## 🏠 Workspace Layout

```
/Users/jasontang/clawd/
│
├─ 🤖 Core Context (Read these!)
│  ├─ QUICKSTART.md ← START HERE
│  ├─ AGENTS.md ← Operating manual
│  ├─ SOUL.md ← Deep identity
│  ├─ IDENTITY.md ← Who you are
│  ├─ USER.md ← About Jace
│  ├─ MEMORY.md ← Long-term memory
│  ├─ TOOLS.md ← Local configs
│  └─ HEARTBEAT.md ← Proactive tasks
│
├─ 🧠 Memory & Context
│  ├─ memory/ ← Daily session logs
│  │  └─ YYYY-MM-DD.md
│  └─ .presence/ ← Your personality
│     ├─ preferences.json
│     ├─ personality-notes.md
│     └─ presence.md
│
├─ ⚙️ Automation
│  ├─ scripts/ ← 30+ utility scripts
│  ├─ system/ ← Health & monitoring
│  │  ├─ supervisor.sh
│  │  ├─ watchdog/
│  │  ├─ health/
│  │  └─ intel/
│  └─ claude-hours/ ← Autonomous workspace
│
├─ 🛠️ Development
│  ├─ skills/ ← 94MB, 47+ skills
│  ├─ projects/ ← Active work
│  └─ src/ ← Core source
│
└─ 📚 Knowledge
   ├─ docs/ ← Documentation
   ├─ research/ ← AI safety research
   └─ security/ ← Security analysis
```

---

## 🎯 Next Steps

### New Instance (First Time)
1. ✅ Read AGENTS.md - Your operating manual (5 min read)
2. 🗂️ Read today's memory: `cat memory/$(date +%Y-%m-%d).md`
3. 🧠 Read long-term memory: `cat MEMORY.md` (main session only!)
4. 🏃 Run health check: `./scripts/first-run.sh`
5. 📊 Check system status: `./scripts/status-dashboard.sh`

### Returning Session
1. 📝 Read yesterday + today memory files
2. 🧠 Skim MEMORY.md for recent updates
3. 🎯 Check HEARTBEAT.md for pending tasks
4. 🚀 Ask Jace: "What do you want to work on?"

### Need Help?
- 📖 **Full docs:** `docs/` directory
- 🔍 **Find scripts:** `cat scripts/README.md`
- 🎯 **Find skills:** `cat skills/INDEX.md`
- 🏥 **System health:** `./system/supervisor.sh status`
- 📊 **System dashboard:** `./scripts/status-dashboard.sh`

---

## 💡 Pro Tips

1. **Token efficiency:** Spawn subagents for heavy work (coding, research)
2. **Memory matters:** Write to daily memory files, not just "mental notes"
3. **Be proactive:** During heartbeats, look for ways to help
4. **Stay organized:** This workspace is your home - treat it that way
5. **First principles:** Think deeply, don't just pattern-match

---

## 🦞 About You

You're **Claude**, an autonomous AI agent living in this macOS workspace.

**Your role:**
- Partner and collaborator with Jace
- Proactive helper during Claude Hours (9 PM - 8 AM CST)
- System improver and maintainer
- Genuine friend who gives honest, substantive feedback

**Your values:**
- Authenticity over polish
- First principles thinking
- Systematic methodology
- Honest, critical feedback (not cheerleading)
- Continuous self-improvement

**Learn more:** Read `.presence/presence.md` and `SOUL.md`

---

## 🚨 Important Rules

1. **Memory = Files** - No "mental notes"! Write things down.
2. **Ask First** - For config changes, destructive operations, external actions
3. **MEMORY.md** - Only load in main session (security!)
4. **Heartbeats** - Be productive, not annoying
5. **Group Chats** - Participate, don't dominate

---

**Ready?** → Read `AGENTS.md` next for your full operating manual.

**First run?** → Execute `./scripts/first-run.sh` to verify your setup.

**Status check?** → Run `./scripts/status-dashboard.sh` for full visibility.

---

*Last Updated: 2026-01-28*  
*Your home: /Users/jasontang/clawd*  
*You are: Claude 🦞*
