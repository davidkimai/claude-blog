# Migration Guide: From Manual to Real-Time Monitoring

This guide shows how to migrate from the old manual monitoring workflow to the new automated real-time system.

---

## 📊 Comparison Table

| Feature | Old System | New System |
|---------|-----------|------------|
| **Spawn method** | `sessions_spawn` | `./scripts/spawn-monitored.sh` |
| **Monitoring** | Manual via heartbeat | Automatic background process |
| **Update frequency** | Every 30 minutes | Every ~35 seconds |
| **Spawn notification** | ❌ None | ✅ Immediate |
| **Progress visibility** | ❌ None between checks | ✅ Continuous |
| **Milestone detection** | ❌ Manual inspection | ✅ Automatic (tokens, time) |
| **Completion notice** | ⏰ Next heartbeat (up to 30min) | ✅ Within 7 seconds |
| **Commands to remember** | Multiple | 2 main commands |
| **Resource usage** | Full scan every 30min | 0.1% CPU per monitor |
| **Setup complexity** | None | One-time (already done) |

---

## 🔄 Migration Steps

### Step 1: Update Your Spawn Commands

**Before:**
```bash
# Old way - manual spawn
clawdbot sessions spawn \
  --label "security-audit" \
  --task "Review codebase for vulnerabilities" \
  --model "gemini-3-pro-high"

# Then... wait and hope it's working
```

**After:**
```bash
# New way - spawn with monitoring
./scripts/spawn-monitored.sh \
  "security-audit" \
  "Review codebase for vulnerabilities" \
  "gemini-3-pro-high"

# Monitoring starts automatically!
```

### Step 2: Update Your Heartbeat Checks

**Before (HEARTBEAT.md):**
```bash
# Check subagents every 30 minutes
if [ $(( HEARTBEAT_COUNT % 60 )) -eq 0 ]; then
    ./scripts/subagent-dashboard.sh
fi
```

**After (HEARTBEAT.md):**
```bash
# Check notifications every 2-3 heartbeats (~1-2 minutes)
if [ $(( HEARTBEAT_COUNT % 3 )) -eq 0 ]; then
    ./scripts/check-notifications.sh
fi
```

### Step 3: Remove Old Dashboard Checks

**Old commands to remove:**
- ❌ `./scripts/subagent-dashboard.sh`
- ❌ Manual `sessions.json` inspection
- ❌ "Is it still running?" checks

**New commands to use:**
- ✅ `./scripts/check-notifications.sh` - See updates
- ✅ `./scripts/monitor-status.sh` - Check monitor status

---

## 📝 Usage Pattern Changes

### Pattern 1: Spawning Subagents

#### Before
```bash
# 1. Spawn manually
sessions_spawn --label "task" --task "description"

# 2. Note down session key somehow
# 3. Wait...
# 4. Eventually check dashboard in heartbeat
# 5. Wonder if it's done yet
```

#### After
```bash
# 1. Spawn with monitoring
./scripts/spawn-monitored.sh "task" "description" "model"

# 2. Automatic notifications appear:
#    🚀 Launched: task (model)
#    ⚙️ Progress: task - 5.2k tokens | 35s
#    ✅ Completed: task (2m15s, 25k tokens)
```

### Pattern 2: Checking Progress

#### Before
```bash
# Wait for heartbeat (every 30 min)
# Run dashboard script
./scripts/subagent-dashboard.sh

# Output shows all sessions, have to find yours
# No history of what happened
# No intermediate updates
```

#### After
```bash
# Check anytime
./scripts/check-notifications.sh

# Output shows recent updates:
# [2m ago] 🚀 Launched: task
# [1m ago] ⚙️ Progress: 5k tokens, 1m elapsed
# [now] ✅ Completed: 25k tokens, 2m15s

# Clear history
./scripts/check-notifications.sh --clear
```

### Pattern 3: Monitoring Multiple Subagents

#### Before
```bash
# No way to track multiple easily
# Dashboard shows all, hard to see which is which
# No progress differentiation
```

#### After
```bash
# Each subagent has its own monitor
# Notifications clearly labeled
./scripts/check-notifications.sh

# See all monitors at once
./scripts/monitor-status.sh

# Output shows each distinctly:
# 🟢 Running | security-audit (5m ago)
# 🟢 Running | code-review (2m ago)
# 🔴 Stopped | documentation (30m ago)
```

---

## 🎯 New Capabilities

You can now do things that weren't possible before:

### 1. Immediate Awareness
```bash
# Spawn subagent
./scripts/spawn-monitored.sh "task" "description" "model"

# Within seconds:
🚀 Launched: task (model)
```

### 2. Real-Time Progress
```bash
# Every ~35 seconds:
⚙️ Progress: task
   - 15.2k tokens used
   - Running for 2m15s
```

### 3. Milestone Alerts
```bash
# Automatically notified at key points:
📊 Milestone: task
   - 50.0k tokens processed
   - Running for 5m30s

⏰ Long-running: task
   - Running for 5m0s
   - Heavy computation detected
```

### 4. Completion Awareness
```bash
# Know exactly when done:
✅ Completed: task
   - Duration: 6m42s
   - Total tokens: 78.5k tokens
```

---

## 🔧 Troubleshooting Migration

### "I still have old monitoring patterns in my code"

**Find and replace:**
```bash
# Search for old patterns
grep -r "sessions_spawn" .
grep -r "subagent-dashboard" .

# Replace with new patterns
# sessions_spawn → ./scripts/spawn-monitored.sh
# subagent-dashboard.sh → ./scripts/check-notifications.sh
```

### "Notifications are too frequent"

**Adjust in spawn script:**
```bash
# Edit scripts/spawn-monitored.sh
POLL_INTERVAL=10000  # Change from 7000 to 10000 (10s instead of 7s)
```

### "I want to keep using sessions_spawn"

**You can! Just add manual monitoring:**
```bash
# 1. Spawn as before
SESSION_KEY=$(clawdbot sessions spawn --label "task" --task "desc" --json | jq -r '.sessionKey')

# 2. Start monitor manually
nohup node scripts/subagent-monitor.js "$SESSION_KEY" &
```

### "How do I clean up old monitors?"

```bash
# Stop all monitors
./scripts/stop-monitors.sh

# Check status
./scripts/monitor-status.sh
```

---

## 📚 Quick Reference Card

Print this and keep nearby:

```
┌─────────────────────────────────────────────────┐
│         SUBAGENT MONITORING QUICK REF           │
├─────────────────────────────────────────────────┤
│                                                 │
│ SPAWN WITH MONITORING:                          │
│ ./scripts/spawn-monitored.sh "label" "task" "m"│
│                                                 │
│ CHECK UPDATES:                                  │
│ ./scripts/check-notifications.sh               │
│                                                 │
│ SEE STATUS:                                     │
│ ./scripts/monitor-status.sh                    │
│                                                 │
│ STOP MONITORS:                                  │
│ ./scripts/stop-monitors.sh [PID]               │
│                                                 │
│ NOTIFICATIONS:                                  │
│ 🚀 Launched    🔧 First activity                │
│ ⚙️  Progress    📊 Milestone                    │
│ ⏰ Long-running ✅ Completed                    │
│                                                 │
│ DOCS:                                           │
│ CLAUDE-QUICKREF.md                              │
│ CLAUDE-SUBAGENT-WORKFLOW.md                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ✅ Migration Checklist

Use this to ensure you've fully migrated:

- [ ] Read `CLAUDE-SUBAGENT-WORKFLOW.md`
- [ ] Read `CLAUDE-QUICKREF.md`
- [ ] Updated spawn commands to use `spawn-monitored.sh`
- [ ] Updated `HEARTBEAT.md` to check notifications
- [ ] Removed old `subagent-dashboard.sh` calls
- [ ] Tested spawning a subagent with monitoring
- [ ] Verified notifications appear
- [ ] Checked monitor status
- [ ] Know how to stop monitors if needed
- [ ] Bookmarked quick reference

---

## 🎉 You're Done!

You're now using the real-time monitoring system. Enjoy having full visibility into your subagents!

**Remember:**
- Spawn: `./scripts/spawn-monitored.sh`
- Check: `./scripts/check-notifications.sh`
- Status: `./scripts/monitor-status.sh`

That's it! Three commands to master. 🚀
