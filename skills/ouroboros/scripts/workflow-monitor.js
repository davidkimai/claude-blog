#!/usr/bin/env node

/**
 * Ouroboros Workflow Monitor (Phase 3)
 * 
 * Integrates existing Clawdbot subagent monitoring infrastructure:
 * - Uses ./scripts/spawn-monitored.sh for spawning
 * - Hooks into notification system
 * - Tracks GSD↔Ralph phase transitions
 * - No new monitoring infrastructure - leverages existing tools
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

// Workflow phases
const PHASES = {
  IDLE: 'idle',
  GSD_PLANNING: 'gsd_planning',
  GSD_DISCUSSING: 'gsd_discussing',
  GSD_SPECIFYING: 'gsd_specifying',
  BRIDGE: 'bridge',
  RALPH_EXECUTING: 'ralph_executing',
  RALPH_VERIFYING: 'ralph_verifying',
  COMPLETE: 'complete',
  ERROR: 'error',
};

class WorkflowMonitor {
  constructor(config = {}) {
    this.config = {
      notificationFile: config.notificationFile || 
        path.join(os.homedir(), '.clawdbot/agents/main/notifications.jsonl'),
      workflowStatePath: config.workflowStatePath || 
        path.join(__dirname, '../memory/workflow-state.json'),
      ...config
    };
    
    this.state = this.loadState();
  }
  
  /**
   * Spawn subagent with monitoring (uses existing spawn-monitored.sh)
   */
  async spawnWithMonitoring(taskLabel, taskDescription, model = 'openai-codex/gpt-5.2') {
    return new Promise((resolve, reject) => {
      const spawnScript = path.join(__dirname, '../../../scripts/spawn-monitored.sh');
      
      if (!fs.existsSync(spawnScript)) {
        reject(new Error('spawn-monitored.sh not found - monitoring infrastructure missing'));
        return;
      }
      
      const proc = spawn(spawnScript, [taskLabel, taskDescription, model], {
        stdio: ['inherit', 'pipe', 'pipe']
      });
      
      let sessionKey = '';
      
      proc.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);
        
        // Extract session key
        const match = output.match(/Session:\s+([^\s]+)/);
        if (match) {
          sessionKey = match[1];
        }
      });
      
      proc.stderr.on('data', (data) => {
        console.error(data.toString());
      });
      
      proc.on('close', (code) => {
        if (code === 0 && sessionKey) {
          resolve({ sessionKey, taskLabel });
        } else {
          reject(new Error(`Spawn failed with code ${code}`));
        }
      });
    });
  }
  
  /**
   * Check for new notifications (uses existing notification system)
   */
  checkNotifications(since = null) {
    try {
      if (!fs.existsSync(this.config.notificationFile)) {
        return [];
      }
      
      const data = fs.readFileSync(this.config.notificationFile, 'utf8');
      const lines = data.trim().split('\n').filter(line => line);
      
      const notifications = lines.map(line => JSON.parse(line));
      
      // Filter by timestamp if provided
      if (since) {
        return notifications.filter(n => n.timestamp > since);
      }
      
      return notifications;
    } catch (error) {
      console.error('[Monitor] Error reading notifications:', error.message);
      return [];
    }
  }
  
  /**
   * Track phase transition
   */
  transitionTo(phase, context = {}) {
    const timestamp = Date.now();
    const previousPhase = this.state.currentPhase;
    
    this.state = {
      currentPhase: phase,
      previousPhase,
      lastTransition: timestamp,
      context,
      history: [
        ...(this.state.history || []),
        {
          from: previousPhase,
          to: phase,
          timestamp,
          context
        }
      ].slice(-50) // Keep last 50 transitions
    };
    
    this.saveState();
    
    return {
      from: previousPhase,
      to: phase,
      timestamp
    };
  }
  
  /**
   * Detect phase from workflow activity
   */
  detectPhase(activity) {
    // Map activity to phase
    const activityPatterns = {
      [PHASES.GSD_PLANNING]: [/gsd:new-project/, /PROJECT\.md/],
      [PHASES.GSD_DISCUSSING]: [/gsd:discuss/, /CONTEXT\.md/],
      [PHASES.GSD_SPECIFYING]: [/gsd:plan/, /PLAN\.xml/],
      [PHASES.BRIDGE]: [/ralph-tui create-prd/, /\.prd\.json/],
      [PHASES.RALPH_EXECUTING]: [/ralph-tui run/, /executing task/i],
      [PHASES.RALPH_VERIFYING]: [/gsd:verify/, /verification/i],
      [PHASES.COMPLETE]: [/completed/i, /✅/],
      [PHASES.ERROR]: [/error/i, /failed/i, /❌/],
    };
    
    for (const [phase, patterns] of Object.entries(activityPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(activity)) {
          return phase;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Monitor workflow with auto phase detection
   */
  async monitorWorkflow(sessionKey, label) {
    console.log(`[Monitor] Started monitoring: ${label} (${sessionKey})`);
    
    const startTime = Date.now();
    let lastNotificationCheck = startTime;
    
    const interval = setInterval(() => {
      const notifications = this.checkNotifications(lastNotificationCheck);
      lastNotificationCheck = Date.now();
      
      for (const notif of notifications) {
        if (notif.from === sessionKey || notif.message.includes(label)) {
          console.log(`[Monitor] ${notif.message}`);
          
          // Detect phase from notification
          const phase = this.detectPhase(notif.message);
          if (phase && phase !== this.state.currentPhase) {
            const transition = this.transitionTo(phase, { notif });
            console.log(`[Monitor] Phase transition: ${transition.from} → ${transition.to}`);
          }
          
          // Check for completion
          if (/completed|aborted/i.test(notif.message)) {
            clearInterval(interval);
            this.transitionTo(PHASES.COMPLETE, { 
              duration: Date.now() - startTime,
              finalNotification: notif 
            });
            console.log(`[Monitor] Workflow complete (${Math.round((Date.now() - startTime) / 1000)}s)`);
          }
        }
      }
    }, 5000); // Check every 5 seconds
    
    return {
      stop: () => clearInterval(interval),
      getState: () => this.state
    };
  }
  
  /**
   * Get current workflow state
   */
  getState() {
    return { ...this.state };
  }
  
  /**
   * Load state from disk
   */
  loadState() {
    try {
      if (fs.existsSync(this.config.workflowStatePath)) {
        const data = fs.readFileSync(this.config.workflowStatePath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[Monitor] Error loading state:', error.message);
    }
    
    return {
      currentPhase: PHASES.IDLE,
      previousPhase: null,
      lastTransition: null,
      context: {},
      history: []
    };
  }
  
  /**
   * Save state to disk
   */
  saveState() {
    try {
      const dir = path.dirname(this.config.workflowStatePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(
        this.config.workflowStatePath,
        JSON.stringify(this.state, null, 2)
      );
    } catch (error) {
      console.error('[Monitor] Error saving state:', error.message);
    }
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Ouroboros Workflow Monitor

Integrates with existing Clawdbot subagent monitoring infrastructure.

Usage:
  node workflow-monitor.js spawn <label> <description> [model]
  node workflow-monitor.js check
  node workflow-monitor.js state
  node workflow-monitor.js transition <phase>

Commands:
  spawn        Spawn subagent with monitoring
  check        Check for new notifications
  state        Show current workflow state
  transition   Manually transition to phase

Examples:
  node workflow-monitor.js spawn "GSD Planning" "Plan auth system" openai-codex/gpt-5.2
  node workflow-monitor.js check
  node workflow-monitor.js state
  node workflow-monitor.js transition gsd_planning
`);
    process.exit(0);
  }
  
  const command = args[0];
  const monitor = new WorkflowMonitor();
  
  switch (command) {
    case 'spawn':
      if (args.length < 3) {
        console.error('Error: spawn requires <label> <description> [model]');
        process.exit(1);
      }
      const label = args[1];
      const description = args[2];
      const model = args[3] || 'openai-codex/gpt-5.2';
      
      try {
        const result = await monitor.spawnWithMonitoring(label, description, model);
        console.log(`✓ Spawned: ${result.sessionKey}`);
        
        // Start monitoring
        await monitor.monitorWorkflow(result.sessionKey, label);
      } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
      }
      break;
    
    case 'check':
      const notifications = monitor.checkNotifications(Date.now() - 60000);
      console.log(JSON.stringify(notifications, null, 2));
      break;
    
    case 'state':
      console.log(JSON.stringify(monitor.getState(), null, 2));
      break;
    
    case 'transition':
      if (!args[1]) {
        console.error('Error: phase required');
        console.error('Available phases:', Object.values(PHASES).join(', '));
        process.exit(1);
      }
      const transition = monitor.transitionTo(args[1]);
      console.log(`✓ Transitioned: ${transition.from} → ${transition.to}`);
      break;
    
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
} else {
  module.exports = {
    WorkflowMonitor,
    PHASES,
  };
}
