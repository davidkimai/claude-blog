#!/usr/bin/env node
/**
 * Check Subagent Notifications
 * 
 * Reads notifications from the monitoring system and displays them.
 * Can be called periodically by the main agent or during heartbeats.
 * 
 * Usage:
 *   node scripts/check-subagent-notifications.js [--clear] [--since <timestamp>]
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const NOTIF_FILE = path.join(os.homedir(), '.clawdbot/agents/main/notifications.jsonl');

function readNotifications(sinceTimestamp = 0, clear = false) {
  if (!fs.existsSync(NOTIF_FILE)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(NOTIF_FILE, 'utf8');
    const notifications = content
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line))
      .filter(n => n.timestamp > sinceTimestamp);
    
    if (clear) {
      // Clear the file after reading
      fs.writeFileSync(NOTIF_FILE, '');
    }
    
    return notifications;
  } catch (err) {
    console.error(`Error reading notifications: ${err.message}`);
    return [];
  }
}

function getLastCheckTimestamp() {
  const stateFile = path.join(os.homedir(), '.clawdbot/agents/main/notif-state.json');
  
  try {
    if (fs.existsSync(stateFile)) {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      return state.lastCheck || 0;
    }
  } catch (err) {
    console.error(`Error reading state: ${err.message}`);
  }
  
  return 0;
}

function updateLastCheckTimestamp() {
  const stateFile = path.join(os.homedir(), '.clawdbot/agents/main/notif-state.json');
  
  try {
    fs.writeFileSync(stateFile, JSON.stringify({ lastCheck: Date.now() }));
  } catch (err) {
    console.error(`Error writing state: ${err.message}`);
  }
}

function formatNotification(notif) {
  const timestamp = new Date(notif.timestamp).toLocaleTimeString();
  return `[${timestamp}] ${notif.message}`;
}

async function main() {
  const args = process.argv.slice(2);
  let clear = false;
  let sinceTimestamp = getLastCheckTimestamp();
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--clear':
        clear = true;
        break;
      case '--since':
        sinceTimestamp = parseInt(args[++i], 10);
        break;
      case '--all':
        sinceTimestamp = 0;
        break;
    }
  }
  
  const notifications = readNotifications(sinceTimestamp, clear);
  
  if (notifications.length === 0) {
    console.log('No new notifications');
    return;
  }
  
  console.log(`\n📬 ${notifications.length} new notification(s):\n`);
  
  for (const notif of notifications) {
    console.log(formatNotification(notif));
    console.log('');
  }
  
  updateLastCheckTimestamp();
}

if (require.main === module) {
  main().catch(err => {
    console.error(`Fatal error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = {
  readNotifications,
  getLastCheckTimestamp,
  updateLastCheckTimestamp,
};
