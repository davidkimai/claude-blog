# 🚀 Subagent Monitoring - Quick Reference for Claude

## Spawn with Monitoring
```bash
./scripts/spawn-monitored.sh "task-label" "task description" "model"
```

## Check Updates
```bash
./scripts/check-notifications.sh          # New since last check
./scripts/check-notifications.sh --all    # All notifications
./scripts/check-notifications.sh --clear  # Clear after reading
```

## Monitor Status
```bash
./scripts/monitor-status.sh           # Quick status
./scripts/monitor-status.sh --verbose # Detailed info
```

## Stop Monitors
```bash
./scripts/stop-monitors.sh       # Stop all
./scripts/stop-monitors.sh <PID> # Stop specific
```

## Notification Types
- 🚀 **Launched** - Subagent started
- 🔧 **First activity** - Initial response
- ⚙️ **Progress** - Periodic update (~35s)
- 📊 **Milestone** - Token/time thresholds
- ⏰ **Long-running** - Over 1min or 5min
- ✅ **Completed** - Task finished
- 🛑 **Aborted** - Task stopped early

## Full Docs
- `CLAUDE-SUBAGENT-WORKFLOW.md` - Complete guide
- `REALTIME-SUBAGENT-TRACKING.md` - Technical details
