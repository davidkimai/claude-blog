# Claude's Subagent Workflow with Real-Time Monitoring

**Quick Reference:** How to spawn and monitor subagents from Claude's perspective.

## 🎯 The Simple Way (Recommended)

When you need to spawn a subagent, use the monitored wrapper instead of raw `sessions_spawn`:

```bash
# Instead of: sessions_spawn --label "task" --task "description"
# Use this:
./scripts/spawn-monitored.sh "task-label" "task description" "model-name"
```

**Example:**
```bash
./scripts/spawn-monitored.sh "security-audit" "Review the codebase for security vulnerabilities and suggest improvements" "gemini-3-pro-high"
```

This automatically:
1. ✅ Spawns the subagent
2. ✅ Starts real-time monitoring
3. ✅ Logs the spawn for tracking
4. ✅ Returns session key and monitor PID

## 📊 Checking Progress

### Quick Check (New Notifications Only)
```bash
./scripts/check-notifications.sh
```

Shows only new notifications since your last check. Use this in heartbeats!

### See All Notifications
```bash
./scripts/check-notifications.sh --all
```

### Clear Notifications After Reading
```bash
./scripts/check-notifications.sh --clear
```

## 🔍 Monitor Management

### Check Active Monitors
```bash
./scripts/monitor-status.sh
```

Shows:
- How many monitors are running
- Recent spawns (last 10)
- Monitor PIDs and status
- Quick commands

### Verbose Status
```bash
./scripts/monitor-status.sh --verbose
```

Shows session keys, models, and more details.

### Stop All Monitors
```bash
./scripts/stop-monitors.sh
```

### Stop Specific Monitor
```bash
./scripts/stop-monitors.sh <PID>
```

## 💡 Integration with Heartbeats

Add to your `HEARTBEAT.md` for automatic checks:

```bash
# Check for subagent updates (every few heartbeats)
if [ $(( HEARTBEAT_COUNT % 3 )) -eq 0 ]; then
    ./scripts/check-notifications.sh
fi
```

Or in Node.js context:
```javascript
// In heartbeat logic
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Check notifications
const { stdout } = await execPromise('./scripts/check-notifications.sh');
if (!stdout.includes('No new notifications')) {
    console.log(stdout);
    // Optionally relay to Telegram
}
```

## 📋 Complete Workflow Example

### Scenario: Long-running code review task

**1. Spawn with monitoring:**
```bash
./scripts/spawn-monitored.sh "code-review" "Review all files in src/ for code quality, potential bugs, and suggest improvements" "gemini-3-pro-high"
```

**Output:**
```
🚀 Spawning subagent with monitoring...
   Label: code-review
   Model: gemini-3-pro-high
   Task: Review all files in src/ for code quality, potential bugs, and suggest...

✅ Subagent spawned: agent:main:subagent:abc123
📊 Starting real-time monitor...
✅ Monitor started (PID: 12345)

📝 Session Key: agent:main:subagent:abc123
📝 Monitor PID: 12345

💡 Use './scripts/monitor-status.sh' to check active monitors
💡 Use './scripts/check-notifications.sh' to see updates
```

**2. Check progress (after 30 seconds):**
```bash
./scripts/check-notifications.sh
```

**Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔔 Subagent Notifications
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[5s ago]
🚀 Launched: code-review (gemini-3-pro-high)

[just now]
⚙️ Progress: code-review
   - 5.2k tokens used
   - Running for 35s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 2 notification(s)
```

**3. Check status of all monitors:**
```bash
./scripts/monitor-status.sh
```

**Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Subagent Monitor Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Active Monitors: 1

Running monitor processes:
  PID 12345    | CPU: 0.1%  | Mem: 0.3%   | Time: 0:00.45

📝 Recent Spawns (last 10):
  🟢 Running | code-review (1m ago)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Commands:
   Check notifications: ./scripts/check-notifications.sh
   Stop all monitors:   ./scripts/stop-monitors.sh
   Stop specific:       kill <PID>
```

**4. Later - check completion:**
```bash
./scripts/check-notifications.sh
```

**Output:**
```
[2m ago]
⚙️ Progress: code-review
   - 15.8k tokens used
   - Running for 2m15s

[just now]
✅ Completed: code-review
   - Duration: 3m42s
   - Total tokens: 25.3k tokens
```

## 🎨 Notification Types You'll See

### Launch
```
🚀 Launched: task-name (model-name)
```

### First Activity
```
🔧 First activity: task-name
```

### Progress Updates (every ~35s)
```
⚙️ Progress: task-name
   - 5.2k tokens used
   - Running for 35s
```

### Token Milestones
```
📊 Milestone: task-name
   - 10.0k tokens processed
   - Running for 1m15s
```

### Heavy Activity
```
📊 Heavy activity: task-name
   - 8.5k tokens in 15s
```

### Long-Running Warning
```
⏰ Long-running: task-name
   - Running for 5m0s
   - 25.3k tokens processed
```

### Completion
```
✅ Completed: task-name
   - Duration: 6m42s
   - Total tokens: 45.2k tokens
```

### Abort
```
🛑 Aborted: task-name
   - Duration: 2m15s
   - Total tokens: 12.8k tokens
```

## 🔧 Troubleshooting

### Monitor not starting?
Check if `clawdbot` CLI is available:
```bash
which clawdbot
clawdbot --version
```

### No notifications appearing?
1. Verify monitor is running: `./scripts/monitor-status.sh`
2. Check notification file: `cat ~/.clawdbot/agents/main/notifications.jsonl`
3. Verify session key in sessions.json

### Monitor keeps running after completion?
- Should auto-stop when subagent completes
- If stuck: `./scripts/stop-monitors.sh <PID>`

### Want to manually start monitor for existing session?
```bash
node scripts/subagent-monitor.js agent:main:subagent:abc123
```

## 📁 File Locations

- **Notifications:** `~/.clawdbot/agents/main/notifications.jsonl`
- **Spawn log:** `~/.clawdbot/agents/main/monitor-spawns.jsonl`
- **State:** `~/.clawdbot/agents/main/notif-state.json`
- **Sessions:** `~/.clawdbot/agents/main/sessions/sessions.json`

## 🚀 Advanced Usage

### Custom Polling Interval
Edit `scripts/spawn-monitored.sh` and change:
```bash
POLL_INTERVAL=7000  # 7 seconds (default)
POLL_INTERVAL=5000  # 5 seconds (faster updates)
POLL_INTERVAL=10000 # 10 seconds (slower, less resource usage)
```

### Different Model
Pass as third argument:
```bash
./scripts/spawn-monitored.sh "task" "description" "gemini-3-pro-low"
./scripts/spawn-monitored.sh "task" "description" "claude-sonnet-4-5"
```

### Background Check in Scripts
```bash
# In a bash script
NOTIFS=$(./scripts/check-notifications.sh)
if [[ ! "$NOTIFS" =~ "No new notifications" ]]; then
    echo "📬 New updates from subagents:"
    echo "$NOTIFS"
fi
```

## 📚 See Also

- **Technical details:** `REALTIME-SUBAGENT-TRACKING.md`
- **Core monitor script:** `scripts/subagent-monitor.js`
- **Spawn wrapper:** `scripts/spawn-with-monitoring.js`
