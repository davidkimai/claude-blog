# Real-Time Subagent Tracking System

**Status:** ✅ Implemented  
**Last Updated:** 2025-01-25

## Overview

This system provides real-time monitoring and notifications for subagent sessions, replacing the slow 30-minute heartbeat checks with immediate spawn notifications and frequent progress updates.

## Architecture

**Design Choice:** Option A - Background Monitor Process

Each subagent spawn automatically launches a lightweight monitoring process that:
- Polls `sessions.json` every 5-10 seconds
- Detects milestones (first activity, token usage, long-running, completion)
- Writes notifications to a queue file
- Terminates when subagent completes

## Components

### 1. `scripts/subagent-monitor.js`
Core monitoring script that tracks a single subagent session.

**Features:**
- Immediate spawn notification
- Periodic progress updates (~35 seconds)
- Milestone detection:
  - First activity (when tokens > 1k)
  - Token milestones: 5k, 10k, 20k, 50k, 100k
  - Time milestones: 1 min, 5 min
  - Heavy activity detection (>5k tokens in <30s)
  - Completion/abort detection

**Usage:**
```bash
node scripts/subagent-monitor.js <sessionKey> [options]

Options:
  --interval <ms>       Polling interval (default: 7000ms)
  --main-session <key>  Main session key (default: agent:main:main)
  --config <path>       Config file path (optional)
```

**Example:**
```bash
node scripts/subagent-monitor.js agent:main:subagent:abc123 --interval 5000
```

### 2. `scripts/spawn-with-monitoring.js`
Wrapper for spawning subagents with automatic monitoring.

**Usage (from code):**
```javascript
const { spawnWithMonitoring } = require('./scripts/spawn-with-monitoring.js');

const result = await spawnWithMonitoring(
  'task-label',
  'Detailed task description here...',
  {
    model: 'gemini-3-pro-high',
    pollIntervalMs: 7000,
  }
);

console.log(`Spawned: ${result.sessionKey}`);
console.log(`Monitor PID: ${result.monitorPid}`);
```

**Usage (CLI):**
```bash
node scripts/spawn-with-monitoring.js "task-label" "task description" --model gemini-3-pro-high
```

### 3. `scripts/check-subagent-notifications.js`
Utility to check and display notifications from monitors.

**Usage:**
```bash
# Check new notifications since last check
node scripts/check-subagent-notifications.js

# Check all notifications
node scripts/check-subagent-notifications.js --all

# Check and clear
node scripts/check-subagent-notifications.js --clear
```

**Integration with main agent:**
```javascript
const { readNotifications } = require('./scripts/check-subagent-notifications.js');

// In heartbeat or periodic check
const notifications = readNotifications(lastCheckTimestamp);
for (const notif of notifications) {
  console.log(notif.message);
  // Or send via message tool to Telegram
}
```

## Configuration

### Global Config File (optional)
Create `~/.clawdbot/subagent-monitor-config.json`:

```json
{
  "pollIntervalMs": 7000,
  "mainSessionKey": "agent:main:main",
  "tokenMilestones": [5000, 10000, 20000, 50000, 100000],
  "timeMilestones": [60000, 300000],
  "toolCallMilestones": [1, 5, 10, 20, 50]
}
```

Use with:
```bash
node scripts/subagent-monitor.js <sessionKey> --config ~/.clawdbot/subagent-monitor-config.json
```

### Customization

**Adjust polling frequency:**
- Faster updates: `--interval 5000` (5 seconds)
- Slower (save resources): `--interval 10000` (10 seconds)
- Default: `7000` (7 seconds)

**Modify milestones:**
Edit the config file or modify `DEFAULT_CONFIG` in `subagent-monitor.js`:

```javascript
const DEFAULT_CONFIG = {
  pollIntervalMs: 7000,
  tokenMilestones: [5000, 10000, 20000, 50000, 100000],
  timeMilestones: [60000, 300000], // 1 min, 5 min
  toolCallMilestones: [1, 5, 10, 20, 50],
};
```

## Notification Examples

### Spawn Notification
```
🚀 Launched: security-strategy-implementation (gemini-3-pro-high)
```

### First Activity
```
🔧 First activity: security-strategy-implementation
```

### Progress Update
```
⚙️ Progress: security-strategy-implementation
   - 5.2k tokens used
   - Running for 35s
```

### Token Milestone
```
📊 Milestone: security-strategy-implementation
   - 10.0k tokens processed
   - Running for 1m15s
```

### Heavy Activity
```
📊 Heavy activity: security-strategy-implementation
   - 8.5k tokens in 15s
```

### Long-Running Alert
```
⏰ Long-running: security-strategy-implementation
   - Running for 5m0s
   - 25.3k tokens processed
```

### Completion
```
✅ Completed: security-strategy-implementation
   - Duration: 6m42s
   - Total tokens: 45.2k tokens
```

### Abort
```
🛑 Aborted: security-strategy-implementation
   - Duration: 2m15s
   - Total tokens: 12.8k tokens
```

## Integration Workflows

### Option 1: Manual Spawn + Monitor
```bash
# 1. Spawn subagent (existing workflow)
# ... use existing spawn method ...

# 2. Start monitor manually
node scripts/subagent-monitor.js agent:main:subagent:abc123
```

### Option 2: Automatic Spawn + Monitor (Recommended)
```javascript
// Replace existing spawn calls with:
const { spawnWithMonitoring } = require('./scripts/spawn-with-monitoring.js');

await spawnWithMonitoring('task-label', 'task description', {
  model: 'gemini-3-pro-high',
});
```

### Option 3: Heartbeat Integration
Update `HEARTBEAT.md` to check notifications:

```bash
# Add to heartbeat script
node scripts/check-subagent-notifications.js

# If notifications exist, they'll be displayed
# The main agent can then relay them to Telegram
```

## File Locations

### Runtime Files
- **Notifications queue:** `~/.clawdbot/agents/main/notifications.jsonl`
- **Spawn tracking:** `~/.clawdbot/agents/main/monitor-spawns.jsonl`
- **Notification state:** `~/.clawdbot/agents/main/notif-state.json`
- **Sessions data:** `~/.clawdbot/agents/main/sessions/sessions.json`

### Scripts
- **Monitor:** `scripts/subagent-monitor.js`
- **Spawn wrapper:** `scripts/spawn-with-monitoring.js`
- **Check notifications:** `scripts/check-subagent-notifications.js`

## Monitoring Active Monitors

List running monitors:
```bash
ps aux | grep subagent-monitor
```

Stop a specific monitor:
```bash
kill <PID>
```

Stop all monitors:
```bash
pkill -f subagent-monitor.js
```

## Troubleshooting

### No notifications appearing
1. Check if monitor is running: `ps aux | grep subagent-monitor`
2. Check notification file exists: `ls -la ~/.clawdbot/agents/main/notifications.jsonl`
3. Verify session key is correct in sessions.json
4. Check monitor logs (if running in foreground)

### Monitor keeps running after subagent completes
- Monitors should auto-terminate when subagent completes
- If stuck, manually kill: `kill <monitor-PID>`
- Check sessions.json to verify subagent completion

### Too many/too few notifications
Adjust configuration:
- **Fewer updates:** Increase `pollIntervalMs` or reduce milestones
- **More updates:** Decrease `pollIntervalMs` or add milestones

## Performance

**Resource usage per monitor:**
- CPU: ~0.1% (polling only)
- Memory: ~20-30 MB (Node.js process)
- Disk I/O: Minimal (reads sessions.json every 7 seconds)

**Scalability:**
- Can run 10+ monitors simultaneously without issue
- Each monitor is independent and lightweight

## Future Enhancements

Potential improvements:
- [ ] WebSocket support for instant updates (no polling)
- [ ] Integration with Clawdbot's native `sessions_send` API
- [ ] Web dashboard for visualizing active subagents
- [ ] Notification filtering (only critical milestones)
- [ ] Slack/Discord integration
- [ ] Token burn rate tracking (tokens/minute)
- [ ] Estimated completion time prediction

## Testing

### Test the monitoring system:

1. **Test monitor standalone:**
```bash
# Create a mock session in sessions.json or use existing one
node scripts/subagent-monitor.js agent:main:subagent:test-session --interval 3000
```

2. **Test spawn wrapper:**
```bash
node scripts/spawn-with-monitoring.js "test-task" "This is a test task description"
```

3. **Test notifications:**
```bash
# In another terminal
node scripts/check-subagent-notifications.js --all
```

4. **Verify spawn notification:**
Should see: `🚀 Launched: test-task (gemini-3-pro-high)`

5. **Verify periodic updates:**
Should see progress updates every ~35 seconds

6. **Verify completion:**
When subagent finishes, should see: `✅ Completed: test-task`

## Migration from Old System

### Before (HEARTBEAT.md - 30 min checks)
```bash
# Every 30 minutes
./scripts/subagent-dashboard.sh
# Manual, slow, no real-time updates
```

### After (Real-time monitoring)
```bash
# Automatic on spawn
const result = await spawnWithMonitoring('task', 'description');
# Immediate notifications, progress updates every ~35s
```

### Compatibility
- Old heartbeat checks still work
- Can run both systems simultaneously
- Gradually migrate to new spawn wrapper

## Support

For issues or questions:
1. Check this documentation
2. Review script comments in source files
3. Check notification queue: `cat ~/.clawdbot/agents/main/notifications.jsonl`
4. Test with verbose logging (run monitor in foreground)
