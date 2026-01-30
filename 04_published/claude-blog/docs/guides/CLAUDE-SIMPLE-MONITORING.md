# Simple Subagent Monitoring for Claude

**Dead simple workflow for real-time subagent tracking.**

## When You Spawn a Subagent

After spawning with `sessions_spawn` (or any spawn method), you get a `sessionKey` like:
```
agent:main:subagent:abc123def456
```

## Start Monitoring (One Command)

```bash
./scripts/spawn-with-monitor.sh <sessionKey>
```

**Example:**
```bash
./scripts/spawn-with-monitor.sh agent:main:subagent:abc123def456
```

**Output:**
```
Monitor started for agent:main:subagent:abc123def456 (PID: 12345)
```

That's it! The monitor now runs in background.

## What Happens Automatically

✅ **Immediate spawn notification**  
✅ **Progress updates** every ~35 seconds  
✅ **Milestone alerts** (tokens, time, completion)  
✅ **Auto-termination** when subagent finishes  

All notifications go to: `~/.clawdbot/agents/main/notifications.jsonl`

## Check for Updates (In Heartbeats)

Add this to your heartbeat routine (every 2-3 heartbeats):

```bash
./scripts/check-notifications.sh
```

Shows new notifications since last check. Automatically marks them as read.

## Example Notifications

```
🚀 Launched: my-task-label (gemini-3-pro-high)
⚙️ Progress: my-task-label - 5.2k tokens used - Running for 35s
📊 Milestone: my-task-label - 10.0k tokens processed - Running for 1m15s
✅ Completed: my-task-label - Duration: 6m42s - Total tokens: 45.2k
```

## Optional: Status & Cleanup

**See active monitors:**
```bash
./scripts/monitor-status.sh
```

**Stop all monitors:**
```bash
./scripts/stop-monitors.sh
```

**Stop specific monitor:**
```bash
./scripts/stop-monitors.sh <PID>
```

## Integration Pattern

```javascript
// 1. Spawn subagent (your existing method)
const spawnResult = await sessions_spawn({
  label: "my-task",
  message: "Task description here",
  model: "gemini-3-pro-high"
});

// 2. Extract session key
const sessionKey = spawnResult.sessionKey;

// 3. Start monitoring (via exec)
await exec(`./scripts/spawn-with-monitor.sh ${sessionKey}`);

// 4. Check notifications in heartbeats
await exec(`./scripts/check-notifications.sh`);
```

## Files & Logs

- **Notifications:** `~/.clawdbot/agents/main/notifications.jsonl`
- **Spawn tracking:** `~/.clawdbot/agents/main/monitor-spawns.jsonl`
- **Monitor logs:** `/tmp/monitor-<session-id>.log`

## Troubleshooting

**No notifications?**
1. Check monitor is running: `ps aux | grep subagent-monitor`
2. Check log file: `cat /tmp/monitor-<session-id>.log`
3. Verify sessionKey is correct

**Monitor won't stop?**
```bash
./scripts/stop-monitors.sh
```

## Performance

- **CPU:** ~0.1% per monitor
- **Memory:** ~20-30 MB per monitor  
- **Polling:** Every 7 seconds (configurable)

Can run 10+ monitors simultaneously without issue.

---

**That's it!** One command after spawn, check notifications in heartbeats. Simple and effective.
