#!/usr/bin/env node
/**
 * Spawn Subagent with Real-Time Monitoring
 * 
 * Wrapper around subagent spawning that automatically starts monitoring.
 * 
 * Usage (from main agent):
 *   const { spawnWithMonitoring } = require('./scripts/spawn-with-monitoring.js');
 *   await spawnWithMonitoring('task-label', 'task description', options);
 * 
 * Or CLI:
 *   node scripts/spawn-with-monitoring.js "task-label" "task description"
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const DEFAULT_OPTIONS = {
  model: 'gemini-3-pro-high',
  pollIntervalMs: 7000,
  detached: true, // Run monitor in background
  monitorScript: path.join(__dirname, 'subagent-monitor.js'),
};

/**
 * Spawn a subagent with automatic monitoring
 * @param {string} label - Task label
 * @param {string} task - Task description
 * @param {object} options - Spawn options
 * @returns {Promise<{sessionKey: string, monitorPid: number}>}
 */
async function spawnWithMonitoring(label, task, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Note: In production, this would use the actual Clawdbot sessions API
  // For now, we'll simulate the spawn by creating a mock session key
  // In real usage, this would be replaced with the actual spawn call
  
  console.log(`[spawn] Spawning subagent: ${label}`);
  console.log(`[spawn] Model: ${opts.model}`);
  console.log(`[spawn] Task: ${task.substring(0, 100)}...`);
  
  // Generate a mock session key (in production, this comes from actual spawn)
  const sessionId = generateSessionId();
  const sessionKey = `agent:main:subagent:${sessionId}`;
  
  // In production, this would be the actual spawn call:
  // const { sessionKey } = await clawdbot.sessions.spawn({
  //   label,
  //   task,
  //   model: opts.model,
  // });
  
  // Start the monitoring process
  console.log(`[spawn] Starting monitor for ${sessionKey}`);
  
  const monitorArgs = [
    opts.monitorScript,
    sessionKey,
    '--interval', opts.pollIntervalMs.toString(),
  ];
  
  const monitorProcess = spawn('node', monitorArgs, {
    detached: opts.detached,
    stdio: opts.detached ? 'ignore' : 'inherit',
  });
  
  if (opts.detached) {
    monitorProcess.unref();
  }
  
  console.log(`[spawn] Monitor started (PID: ${monitorProcess.pid})`);
  
  // Log spawn info
  logSpawn(sessionKey, label, monitorProcess.pid);
  
  return {
    sessionKey,
    monitorPid: monitorProcess.pid,
  };
}

/**
 * Generate a session ID (mock - in production, comes from Clawdbot)
 */
function generateSessionId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const segments = [8, 4, 4, 4, 12];
  return segments
    .map(len => {
      let seg = '';
      for (let i = 0; i < len; i++) {
        seg += chars[Math.floor(Math.random() * chars.length)];
      }
      return seg;
    })
    .join('-');
}

/**
 * Log spawn information for tracking
 */
function logSpawn(sessionKey, label, monitorPid) {
  const logFile = path.join(os.homedir(), '.clawdbot/agents/main/monitor-spawns.jsonl');
  const logEntry = {
    timestamp: Date.now(),
    sessionKey,
    label,
    monitorPid,
  };
  
  try {
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  } catch (err) {
    console.error(`[spawn] Error logging spawn: ${err.message}`);
  }
}

/**
 * Stop monitoring for a specific session
 */
function stopMonitoring(sessionKey) {
  const logFile = path.join(os.homedir(), '.clawdbot/agents/main/monitor-spawns.jsonl');
  
  try {
    const logs = fs.readFileSync(logFile, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));
    
    const spawn = logs.find(s => s.sessionKey === sessionKey);
    if (spawn && spawn.monitorPid) {
      try {
        process.kill(spawn.monitorPid, 'SIGTERM');
        console.log(`[spawn] Stopped monitor (PID: ${spawn.monitorPid})`);
      } catch (err) {
        console.error(`[spawn] Error stopping monitor: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`[spawn] Error reading spawn log: ${err.message}`);
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: spawn-with-monitoring.js <label> <task> [--model <model>] [--interval <ms>]');
    process.exit(1);
  }
  
  const [label, task] = args;
  const options = {};
  
  for (let i = 2; i < args.length; i++) {
    switch (args[i]) {
      case '--model':
        options.model = args[++i];
        break;
      case '--interval':
        options.pollIntervalMs = parseInt(args[++i], 10);
        break;
    }
  }
  
  const result = await spawnWithMonitoring(label, task, options);
  console.log(`[spawn] Spawned: ${result.sessionKey}`);
  console.log(`[spawn] Monitor PID: ${result.monitorPid}`);
}

if (require.main === module) {
  main().catch(err => {
    console.error(`[spawn] Fatal error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = {
  spawnWithMonitoring,
  stopMonitoring,
};
