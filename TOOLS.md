# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

---

## Subagent Monitoring 🚀

**When spawning subagents**, use the monitored wrapper for automatic real-time tracking:

```bash
# Spawn with monitoring (RECOMMENDED)
./scripts/spawn-monitored.sh "task-label" "task description" "model-name"

# Check for updates (use in heartbeats!)
./scripts/check-notifications.sh

# See active monitors
./scripts/monitor-status.sh

# Stop monitors
./scripts/stop-monitors.sh
```

**Quick reference:** `CLAUDE-QUICKREF.md`  
**Full guide:** `CLAUDE-SUBAGENT-WORKFLOW.md`  
**Technical details:** `REALTIME-SUBAGENT-TRACKING.md`

### Why Use This?
- ✅ Know immediately when subagent starts
- ✅ Get progress updates every ~35 seconds
- ✅ See milestones (token usage, time elapsed)
- ✅ Know exactly when task completes
- ✅ No more wondering "is it still running?"

### Heartbeat Integration
Add to your heartbeat checks (every 2-3 heartbeats):
```bash
./scripts/check-notifications.sh
```

This replaces the old slow `subagent-dashboard.sh` checks!

---

## What Goes Here

Things specific to your environment and preferences:

### Cameras
*(Add your cameras here)*
```
- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered
```

### SSH
*(Add your SSH hosts)*
```
- home-server → 192.168.1.100, user: admin
```

### TTS Preferences
- Preferred voice: *(e.g., "Nova" — warm, slightly British)*
- Default speaker: *(e.g., Kitchen HomePod)*

### Device Nicknames
- Anything environment-specific that helps you work effectively

---

## Why Separate?

Skills are shared across all Claude instances. Your setup is yours.

Keeping them apart means:
- You can update skills without losing your notes
- You can share skills without leaking your infrastructure
- This file evolves with your preferences over time

---

## Quick Reference

| Resource | Purpose |
|----------|---------|
| `CLAUDE-QUICKREF.md` | Fast lookup for common commands |
| `CLAUDE-SUBAGENT-WORKFLOW.md` | Subagent spawning and monitoring |
| `REALTIME-SUBAGENT-TRACKING.md` | Technical implementation details |

---

*Add whatever helps you do your job. This is your cheat sheet.*
