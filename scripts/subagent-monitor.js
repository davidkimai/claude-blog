#!/usr/bin/env node
/**
 * Real-Time Subagent Monitor
 * 
 * Monitors a subagent session and sends periodic progress updates to the main session.
 * 
 * Usage: node subagent-monitor.js <subagentSessionKey> [options]
 * 
 * Options:
 *   --interval <ms>       Polling interval in milliseconds (default: 7000)
 *   --main-session <key>  Main session key (default: agent:main:main)
 *   --config <path>       Path to config file (optional)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ===== Configuration =====
const DEFAULT_CONFIG = {
  pollIntervalMs: 7000,
  mainSessionKey: 'agent:main:main',
  sessionsJsonPath: path.join(os.homedir(), '.clawdbot/agents/main/sessions/sessions.json'),
  tokenMilestones: [5000, 10000, 20000, 50000, 100000],
  timeMilestones: [60000, 300000], // 1 min, 5 min
  toolCallMilestones: [1, 5, 10, 20, 50],
};

// Parse CLI args
function parseArgs() {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };
  
  if (args.length === 0) {
    console.error('Usage: subagent-monitor.js <subagentSessionKey> [options]');
    process.exit(1);
  }
  
  config.subagentSessionKey = args[0];
  
  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--interval':
        config.pollIntervalMs = parseInt(args[++i], 10);
        break;
      case '--main-session':
        config.mainSessionKey = args[++i];
        break;
      case '--config':
        const userConfig = JSON.parse(fs.readFileSync(args[++i], 'utf8'));
        Object.assign(config, userConfig);
        break;
    }
  }
  
  return config;
}

// ===== State Tracking =====
class SubagentMonitor {
  constructor(config) {
    this.config = config;
    this.state = {
      startTime: Date.now(),
      lastUpdate: null,
      lastTokens: 0,
      lastToolCalls: 0,
      tokenMilestonesHit: new Set(),
      timeMilestonesHit: new Set(),
      toolCallMilestonesHit: new Set(),
      firstToolCallSeen: false,
      pollCount: 0,
      lastSnapshot: null,
    };
    this.running = true;
  }

  // Read sessions.json
  readSessions() {
    try {
      const data = fs.readFileSync(this.config.sessionsJsonPath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`[monitor] Error reading sessions.json: ${err.message}`);
      return null;
    }
  }

  // Get subagent session data
  getSubagentSession(sessions) {
    return sessions[this.config.subagentSessionKey];
  }

  // Send notification to main session
  sendNotification(message, channel = 'telegram') {
    // Use sessions_send if available, otherwise log to console
    // In production, this would call the Clawdbot API
    console.log(`[notify] ${message}`);
    
    // Write to a notification queue file that the main agent can poll
    const notifFile = path.join(os.homedir(), '.clawdbot/agents/main/notifications.jsonl');
    const notif = {
      timestamp: Date.now(),
      from: this.config.subagentSessionKey,
      to: this.config.mainSessionKey,
      message,
      channel,
    };
    
    try {
      fs.appendFileSync(notifFile, JSON.stringify(notif) + '\n');
    } catch (err) {
      console.error(`[monitor] Error writing notification: ${err.message}`);
    }
  }

  // Format duration
  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.floor(ms / 1000)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m${seconds}s`;
  }

  // Format tokens
  formatTokens(tokens) {
    if (tokens < 1000) return `${tokens} tokens`;
    return `${(tokens / 1000).toFixed(1)}k tokens`;
  }

  // Check for milestones
  checkMilestones(session) {
    const notifications = [];
    const elapsed = Date.now() - this.state.startTime;
    const tokens = session.totalTokens || 0;
    
    // First tool call
    if (!this.state.firstToolCallSeen && session.inputTokens > 1000) {
      this.state.firstToolCallSeen = true;
      notifications.push(`🔧 First activity: ${session.label || 'subagent'}`);
    }

    // Token milestones
    for (const milestone of this.config.tokenMilestones) {
      if (tokens >= milestone && !this.state.tokenMilestonesHit.has(milestone)) {
        this.state.tokenMilestonesHit.add(milestone);
        notifications.push(
          `📊 Milestone: ${session.label}\n` +
          `   - ${this.formatTokens(tokens)} processed\n` +
          `   - Running for ${this.formatDuration(elapsed)}`
        );
      }
    }

    // Time milestones
    for (const milestone of this.config.timeMilestones) {
      if (elapsed >= milestone && !this.state.timeMilestonesHit.has(milestone)) {
        this.state.timeMilestonesHit.add(milestone);
        notifications.push(
          `⏰ Long-running: ${session.label}\n` +
          `   - Running for ${this.formatDuration(elapsed)}\n` +
          `   - ${this.formatTokens(tokens)} processed`
        );
      }
    }

    // Heavy activity detection (large token jump)
    if (this.state.lastTokens > 0) {
      const tokenDelta = tokens - this.state.lastTokens;
      const timeDelta = Date.now() - (this.state.lastUpdate || this.state.startTime);
      
      if (tokenDelta > 5000 && timeDelta < 30000) {
        notifications.push(
          `📊 Heavy activity: ${session.label}\n` +
          `   - ${this.formatTokens(tokenDelta)} in ${this.formatDuration(timeDelta)}`
        );
      }
    }

    return notifications;
  }

  // Main monitoring loop
  async poll() {
    this.state.pollCount++;
    
    const sessions = this.readSessions();
    if (!sessions) {
      console.error('[monitor] Failed to read sessions, retrying...');
      return;
    }

    const session = this.getSubagentSession(sessions);
    if (!session) {
      console.error('[monitor] Subagent session not found, stopping...');
      this.running = false;
      return;
    }

    // Check if completed
    const isCompleted = session.totalTokens > 0 && (
      session.abortedLastRun === true ||
      session.updatedAt < Date.now() - 60000 // No update in 1 min
    );

    if (isCompleted && this.state.lastSnapshot?.totalTokens === session.totalTokens) {
      const elapsed = Date.now() - this.state.startTime;
      const status = session.abortedLastRun ? '🛑 Aborted' : '✅ Completed';
      
      this.sendNotification(
        `${status}: ${session.label}\n` +
        `   - Duration: ${this.formatDuration(elapsed)}\n` +
        `   - Total tokens: ${this.formatTokens(session.totalTokens)}`
      );
      
      this.running = false;
      return;
    }

    // Check for milestones
    const notifications = this.checkMilestones(session);
    for (const notif of notifications) {
      this.sendNotification(notif);
    }

    // Periodic progress update (every 5 polls = ~35 seconds with default interval)
    if (this.state.pollCount % 5 === 0) {
      const elapsed = Date.now() - this.state.startTime;
      const tokens = session.totalTokens || session.inputTokens || 0;
      
      this.sendNotification(
        `⚙️ Progress: ${session.label}\n` +
        `   - ${this.formatTokens(tokens)} used\n` +
        `   - Running for ${this.formatDuration(elapsed)}`
      );
    }

    // Update state
    this.state.lastUpdate = Date.now();
    this.state.lastTokens = session.totalTokens || 0;
    this.state.lastSnapshot = { ...session };
  }

  // Start monitoring
  async start() {
    console.log(`[monitor] Starting monitor for ${this.config.subagentSessionKey}`);
    console.log(`[monitor] Polling interval: ${this.config.pollIntervalMs}ms`);
    
    const sessions = this.readSessions();
    const session = this.getSubagentSession(sessions);
    
    if (!session) {
      console.error('[monitor] Subagent session not found');
      process.exit(1);
    }

    // Send immediate spawn notification
    this.sendNotification(
      `🚀 Launched: ${session.label} (${session.model || 'unknown model'})`
    );

    // Start polling loop
    while (this.running) {
      try {
        await this.poll();
      } catch (err) {
        console.error(`[monitor] Error in poll: ${err.message}`);
      }
      
      if (this.running) {
        await new Promise(resolve => setTimeout(resolve, this.config.pollIntervalMs));
      }
    }

    console.log('[monitor] Monitoring stopped');
  }
}

// ===== Main =====
async function main() {
  const config = parseArgs();
  const monitor = new SubagentMonitor(config);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n[monitor] Received SIGINT, shutting down...');
    monitor.running = false;
  });
  
  process.on('SIGTERM', () => {
    console.log('\n[monitor] Received SIGTERM, shutting down...');
    monitor.running = false;
  });
  
  await monitor.start();
}

if (require.main === module) {
  main().catch(err => {
    console.error(`[monitor] Fatal error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { SubagentMonitor, DEFAULT_CONFIG };
