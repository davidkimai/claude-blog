#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

// Paths
const HOME = os.homedir();
const CLAWDBOT_DIR = path.join(HOME, '.clawdbot');
const AUTH_PROFILES_PATH = path.join(CLAWDBOT_DIR, 'agents/main/agent/auth-profiles.json');
const CLAWDBOT_CONFIG_PATH = path.join(CLAWDBOT_DIR, 'clawdbot.json');
const MEMORY_DIR = path.join(process.cwd(), 'memory');
const STATE_FILE = path.join(MEMORY_DIR, 'auth-state.json');

// Ensure memory dir exists
if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

// Helpers
function loadJson(p) {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return null;
  }
}

function saveJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

function formatTime(ms) {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function timeUntil(ms) {
  const diff = ms - Date.now();
  if (diff <= 0) return 'now';
  const mins = Math.ceil(diff / 60000);
  return `${mins}m`;
}

// Main Logic
function main() {
  const args = process.argv.slice(2);
  const isCheck = args.includes('--check');

  const profilesData = loadJson(AUTH_PROFILES_PATH);
  const configData = loadJson(CLAWDBOT_CONFIG_PATH);

  if (!profilesData) {
    if (!isCheck) console.error("❌ Could not load auth-profiles.json");
    return;
  }

  const stats = profilesData.usageStats || {};
  const profiles = profilesData.profiles || {};
  const fallbacks = configData?.agents?.defaults?.model?.fallbacks || [];
  const primaryModel = configData?.agents?.defaults?.model?.primary;

  // 1. Determine Current Active Profile
  // Find profile with most recent lastUsed
  let currentProfileId = null;
  let lastUsedTs = 0;

  for (const [id, stat] of Object.entries(stats)) {
    if (stat.lastUsed && stat.lastUsed > lastUsedTs) {
      lastUsedTs = stat.lastUsed;
      currentProfileId = id;
    }
  }

  // 2. Analyze Health
  const rateLimited = [];
  const cooldowns = [];
  const errors = [];

  for (const [id, stat] of Object.entries(stats)) {
    // Check cooldowns
    if (stat.cooldownUntil && stat.cooldownUntil > Date.now()) {
      cooldowns.push({
        id,
        until: stat.cooldownUntil,
        reason: stat.failureCounts ? Object.keys(stat.failureCounts).join(',') : 'unknown'
      });
    }
    
    // Check high errors (arbitrary threshold or just presence)
    if (stat.errorCount > 0) {
      errors.push({ id, count: stat.errorCount });
    }
  }

  // 3. Resolve Aliases
  const getAlias = (id) => {
    // Try to match id to a model alias if possible, but auth profile IDs are like "anthropic:default"
    // The config maps models like "anthropic/claude-sonnet-4-5" to aliases.
    // Auth profiles map to providers.
    // We can just show the ID.
    return id;
  };

  const currentState = {
    currentProfileId,
    lastUsedTs,
    cooldowns: cooldowns.map(c => c.id), // just IDs for comparison
    errorCounts: errors.reduce((acc, e) => ({ ...acc, [e.id]: e.count }), {})
  };

  // 4. Compare with Previous State (if checking)
  if (isCheck) {
    const prevState = loadJson(STATE_FILE) || { errorCounts: {} };
    const notifications = [];

    // Check for Model Switch
    if (prevState.currentProfileId && currentProfileId && prevState.currentProfileId !== currentProfileId) {
       // Only notify if the switch happened recently (e.g. within last check period)
       // Actually, we just notify on detection.
       notifications.push(`⚠️ **Model Switched**: \`${prevState.currentProfileId}\` → \`${currentProfileId}\``);
    }

    // Check for New Cooldowns
    for (const c of cooldowns) {
      if (!prevState.cooldowns?.includes(c.id)) {
        notifications.push(`⏸️ **Cooldown Active**: \`${c.id}\` until ${formatTime(c.until)} (${c.reason})`);
      }
    }

    // Check for Increasing Errors (approaching limit)
    for (const [id, count] of Object.entries(currentState.errorCounts)) {
      const prevCount = prevState.errorCounts[id] || 0;
      if (count > prevCount && count >= 3) { // Notify on 3+ errors if increased
         notifications.push(`📉 **Error Rate**: \`${id}\` has ${count} errors.`);
      }
    }

    // Save new state
    saveJson(STATE_FILE, currentState);

    if (notifications.length > 0) {
      console.log(notifications.join('\n'));
    }
  } else {
    // 5. Human Readable Status Output
    console.log(`\n🔍 **Auth & Model Status**`);
    console.log(`──────────────────────────────────`);
    
    if (currentProfileId) {
      console.log(`✅ **Active**: \`${currentProfileId}\``);
      console.log(`   Last used: ${formatTime(lastUsedTs)}`);
    } else {
      console.log(`❓ **Active**: Unknown (no recent usage)`);
    }

    if (cooldowns.length > 0) {
      console.log(`\n⏸️ **Cooldowns**:`);
      cooldowns.forEach(c => {
        console.log(`   - \`${c.id}\`: Wait ${timeUntil(c.until)} (${c.reason})`);
      });
    }

    if (errors.length > 0) {
      console.log(`\n📉 **Errors**:`);
      errors.forEach(e => {
        // Only show if not in cooldown (redundant) or if significant
        if (!cooldowns.find(c => c.id === e.id)) {
           console.log(`   - \`${e.id}\`: ${e.count} errors`);
        }
      });
    }
    
    console.log(`──────────────────────────────────`);
  }
}

main();
