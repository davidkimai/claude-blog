# 📜 Scripts Index

**Location:** `/Users/jasontang/clawd/scripts/`  
**Total Scripts:** 38  
**Purpose:** Automation, monitoring, and utility scripts for the Clawd workspace

---

## 🔍 Quick Find

```bash
# Search for a script by keyword
ls scripts/ | grep "keyword"

# Find what a script does
head -5 scripts/script-name.sh  # Read the header comment

# See all scripts by category
cat scripts/README.md  # You're reading it!
```

---

## 🤖 Core Automation

| Script | Purpose |
|--------|---------|
| `claude-autonomous-loop.sh` | Main Claude Hours autonomous operation loop (full version) |
| `claude-autonomous-loop-simple.sh` | Simplified autonomous loop for testing |
| `claude-home-system.sh` | Home system automation orchestrator |

**Usage:**
```bash
./scripts/claude-autonomous-loop.sh run
./scripts/claude-autonomous-loop-simple.sh init "System Improvements"
```

---

## 🌙 Claude Hours (Nightly Automation)

| Script | Purpose |
|--------|---------|
| `claude-hours-morning-intel.sh` | 7 AM daily HackerNews/GitHub/X intelligence gathering |
| `claude-hours-notifier.sh` | Telegram notifications for Claude Hours events |
| `claude-hours-schedule-runner.sh` | Executes scheduled nightly tasks |
| `claude-hours-skill-generator.sh` | Auto-generates skills from context and patterns |
| `claude-hours-swarm-commander.sh` | Orchestrates parallel subagent swarms |
| `claude-hours-fact-extractor.sh` | Extracts facts for memory system |
| `claude-hours-link-ingestor.sh` | Ingests URLs and creates skill contexts |
| `claude-hours-viewer.sh` | View session progress and reports |
| `claude-hours-supermemory.sh` | SuperMemory integration (remember/recall/profile) |

**Usage:**
```bash
./scripts/claude-hours-morning-intel.sh              # Generate morning intel
./scripts/claude-hours-viewer.sh today               # View today's session
./scripts/claude-hours-notifier.sh "Your message"   # Send Telegram notification
./scripts/claude-hours-skill-generator.sh analyze   # Analyze skill patterns
./scripts/claude-hours-supermemory.sh remember "fact" # Store to SuperMemory
```

**Cron Schedule:**
```bash
0 7 * * * /Users/jasontang/clawd/scripts/claude-hours-morning-intel.sh
```

---

## 🧠 Memory Management

| Script | Purpose |
|--------|---------|
| `memory-search.sh` | Search through memory files semantically |
| `memory-system.sh` | Memory system operations and maintenance |

**Usage:**
```bash
./scripts/memory-search.sh "AI safety research"    # Search memories
./scripts/memory-system.sh compact                 # Compact old memories
```

---

## 👁️ Monitoring & Status

| Script | Purpose |
|--------|---------|
| `claude-status.sh` | Quick status overview of Claude systems |
| `claude-tasks-monitor.sh` | Monitor active tasks and progress |
| `monitor-status.sh` | Overall system monitoring status |
| `subagent-dashboard.sh` | Real-time subagent monitoring dashboard |
| `subagent-dashboard-v2.sh` | Enhanced subagent dashboard (v2) |
| `subagent-monitor.sh` | Monitor subagent sessions |
| `subagent-monitor.js` | Node.js subagent monitor |

**Usage:**
```bash
./scripts/claude-status.sh                # Quick system status
./scripts/subagent-dashboard.sh           # Watch subagent activity
./scripts/monitor-status.sh               # Full monitoring overview
```

---

## 🔔 Notifications & Communication

| Script | Purpose |
|--------|---------|
| `check-notifications.sh` | Check for pending notifications |
| `check-subagent-notifications.js` | Check subagent notification status |
| `claude-greet.sh` | Send greeting messages |
| `claude-feedback.sh` | Send feedback to channels |

**Usage:**
```bash
./scripts/check-notifications.sh          # Check pending notifications
./scripts/claude-greet.sh "Hello!"        # Send greeting
```

---

## 🚀 Spawning & Orchestration

| Script | Purpose |
|--------|---------|
| `spawn-monitored.sh` | Spawn subagent with monitoring |
| `spawn-with-monitor.sh` | Spawn subagent with attached monitor |
| `spawn-with-monitoring.js` | Node.js spawning with monitoring |
| `stop-monitors.sh` | Stop all monitoring processes |

**Usage:**
```bash
./scripts/spawn-monitored.sh "Task description"    # Spawn with monitoring
./scripts/stop-monitors.sh                         # Stop all monitors
```

---

## 🔧 Setup & Installation

| Script | Purpose |
|--------|---------|
| `install_cron_daily_intel.sh` | Install cron job for morning intel |
| `setup-supermemory.sh` | Setup SuperMemory integration |
| `run-heartbeat.sh` | Run heartbeat check manually |

**Usage:**
```bash
./scripts/install_cron_daily_intel.sh     # Setup morning intel cron
./scripts/setup-supermemory.sh            # Configure SuperMemory
./scripts/run-heartbeat.sh                # Manual heartbeat check
```

---

## 🧪 Testing & Development

| Script | Purpose |
|--------|---------|
| `test-model-failover.sh` | Test model failover behavior |
| `test-monitoring.sh` | Test monitoring systems |
| `test-monitoring-integration.sh` | Integration tests for monitoring |

**Usage:**
```bash
./scripts/test-model-failover.sh          # Test model fallbacks
./scripts/test-monitoring.sh              # Test monitoring setup
```

---

## 🔗 API & Integration

| Script | Purpose |
|--------|---------|
| `auth-status.js` | Check authentication status for all providers |
| `codex-api.sh` | Interact with Codex API directly |
| `run-summarization.sh` | Run summarization on content |
| `summarize-context.sh` | Summarize workspace context |

**Usage:**
```bash
node scripts/auth-status.js               # Check all auth status
./scripts/codex-api.sh "prompt"           # Call Codex API
./scripts/summarize-context.sh            # Summarize current context
```

---

## 📊 Most Used Scripts (Quick Reference)

```bash
# System Status
./scripts/claude-status.sh                           # ⚡ Quick status
./scripts/subagent-dashboard.sh                      # 👁️ Watch subagents
./scripts/claude-hours-viewer.sh today               # 🌙 Claude Hours status

# Automation
./scripts/claude-autonomous-loop.sh run              # 🤖 Start autonomous loop
./scripts/claude-hours-morning-intel.sh              # 📰 Generate intel

# Memory
./scripts/memory-search.sh "query"                   # 🔍 Search memories
cat memory/$(date +%Y-%m-%d).md                      # 📝 Today's memory

# Notifications
./scripts/claude-hours-notifier.sh "message"         # 📱 Send notification

# Spawning
./scripts/spawn-monitored.sh "task"                  # 🚀 Spawn with monitoring
```

---

## 🎯 Script Naming Conventions

| Prefix | Purpose |
|--------|---------|
| `claude-hours-*` | Claude Hours autonomous operation |
| `claude-*` | Core Claude functionality |
| `subagent-*` | Subagent management and monitoring |
| `memory-*` | Memory system operations |
| `test-*` | Testing and validation scripts |

---

## 📝 Adding New Scripts

When creating new scripts:

1. **Follow naming conventions** above
2. **Add header comment** with purpose and usage
3. **Make executable:** `chmod +x scripts/your-script.sh`
4. **Update this README** in the appropriate section
5. **Test thoroughly** before committing

**Template:**
```bash
#!/bin/bash
# Script Name - Brief description
#
# Usage: ./scripts/script-name.sh [args]
#
# Description: Detailed explanation of what this script does

# Your code here
```

---

## 🔍 Finding Scripts

**By keyword:**
```bash
ls scripts/ | grep "keyword"
```

**By purpose:**
```bash
grep -l "keyword" scripts/*.sh scripts/*.js
```

**By recent modification:**
```bash
ls -lt scripts/*.sh | head -10
```

**All executable scripts:**
```bash
find scripts/ -type f -executable
```

---

## 🚨 Important Notes

1. **Scripts are executable** - No need for `bash scripts/file.sh`, just `./scripts/file.sh`
2. **Environment matters** - Some scripts expect to run from workspace root
3. **Cron jobs** - Use absolute paths in cron: `/Users/jasontang/clawd/scripts/...`
4. **Dependencies** - Some scripts require: jq, curl, clawdbot CLI
5. **Logs** - Most scripts log to `.claude/logs/` or output to stdout

---

## 🆘 Troubleshooting

**Script not executable?**
```bash
chmod +x scripts/your-script.sh
```

**Script not found?**
```bash
# Run from workspace root
cd /Users/jasontang/clawd
./scripts/your-script.sh
```

**Script failing in cron?**
```bash
# Use absolute paths in cron entries
/Users/jasontang/clawd/scripts/your-script.sh

# Check cron logs
tail -f /var/log/system.log | grep CRON
```

---

**Last Updated:** 2026-01-28  
**Total Scripts:** 38  
**Maintained by:** Claude 🦞
