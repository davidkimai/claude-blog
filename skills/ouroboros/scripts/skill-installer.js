#!/usr/bin/env node

/**
 * Ouroboros Skill Installer (Phase 2 - US-002)
 * 
 * Auto-install skills based on detected intent:
 * - Map intent → required skills
 * - Check if skills are installed
 * - Query skills.sh for availability
 * - Execute installation via CLI
 * - Cache installation preferences
 * 
 * Usage:
 *   node skill-installer.js check <intent>
 *   node skill-installer.js install <skill-name>
 *   node skill-installer.js suggest <detection-result-json>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MEMORY_DIR = path.join(__dirname, '../memory');
const PREFERENCES_FILE = path.join(MEMORY_DIR, 'skill-preferences.json');
const SKILLS_DIR = path.join(__dirname, '../../../skills');
const CONFIG_FILE = path.join(MEMORY_DIR, 'ouroboros-config.json');

// Intent → Skills mapping
const INTENT_SKILL_MAP = {
  create_project: ['get-shit-done', 'ralph-tui-prd', 'laboratory'],
  extend_feature: ['ralph-tui-prd', 'laboratory'],
  debug_fix: ['laboratory'],
  discuss_decision: ['get-shit-done'],
  optimize: ['laboratory'],
  research: ['web-search', 'research'],
  quick_task: [],
  clarify: [],
};

// Entity → Skills mapping (for context-aware suggestions)
const ENTITY_SKILL_MAP = {
  // Framework-specific skills
  frameworks: {
    React: ['vite-setup', 'component-library'],
    'Next.js': ['nextjs-setup'],
    Vue: ['vue-setup'],
  },
  
  // Backend skills
  backend: {
    'Node.js': ['nodejs-setup'],
    Express: ['api-setup'],
  },
  
  // Database skills
  database: {
    PostgreSQL: ['db-schema', 'prisma-setup'],
    Supabase: ['supabase-setup'],
  },
  
  // Auth skills
  auth: {
    'better-auth': ['auth-setup'],
  },
};

/**
 * Load configuration
 */
function loadConfig() {
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {
      safety: {
        auto_approve: ['config', 'logging', 'patterns'],
        human_approval_required: ['code_changes', 'skill_installation'],
      },
    };
  }
}

/**
 * Load skill installation preferences
 */
function loadPreferences() {
  try {
    const data = fs.readFileSync(PREFERENCES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {
      auto_install: [],
      never_install: [],
      always_ask: [],
      last_updated: new Date().toISOString(),
    };
  }
}

/**
 * Save skill installation preferences
 */
function savePreferences(preferences) {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
  
  preferences.last_updated = new Date().toISOString();
  fs.writeFileSync(PREFERENCES_FILE, JSON.stringify(preferences, null, 2), 'utf8');
}

/**
 * Check if a skill is installed
 */
function isSkillInstalled(skillName) {
  const skillPath = path.join(SKILLS_DIR, skillName);
  return fs.existsSync(skillPath) && fs.existsSync(path.join(skillPath, 'SKILL.md'));
}

/**
 * Get list of all installed skills
 */
function getInstalledSkills() {
  if (!fs.existsSync(SKILLS_DIR)) {
    return [];
  }
  
  return fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => isSkillInstalled(name));
}

/**
 * Query skills.sh for available skills (if it exists)
 */
function queryAvailableSkills() {
  const skillsScript = path.join(__dirname, '../../../skills.sh');
  
  if (!fs.existsSync(skillsScript)) {
    // Fallback: scan skills directory
    return getInstalledSkills();
  }
  
  try {
    const output = execSync(`bash ${skillsScript} list`, { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean);
  } catch (err) {
    console.error('Warning: Could not query skills.sh:', err.message);
    return getInstalledSkills();
  }
}

/**
 * Get required skills for an intent
 */
function getRequiredSkills(intent, entities = {}) {
  const skills = new Set();
  
  // Add intent-based skills
  const intentSkills = INTENT_SKILL_MAP[intent] || [];
  intentSkills.forEach(s => skills.add(s));
  
  // Add entity-based skills
  for (const [entityType, entityValues] of Object.entries(entities)) {
    if (ENTITY_SKILL_MAP[entityType]) {
      if (Array.isArray(entityValues)) {
        // Handle array of values (e.g., frameworks: ['React', 'Next.js'])
        entityValues.forEach(value => {
          const skillMap = ENTITY_SKILL_MAP[entityType][value];
          if (skillMap) {
            skillMap.forEach(s => skills.add(s));
          }
        });
      } else {
        // Handle single value (e.g., complexity: 'high')
        const skillMap = ENTITY_SKILL_MAP[entityType][entityValues];
        if (skillMap) {
          skillMap.forEach(s => skills.add(s));
        }
      }
    }
  }
  
  return Array.from(skills);
}

/**
 * Check skill installation status
 */
function checkSkillStatus(intent, entities = {}) {
  const requiredSkills = getRequiredSkills(intent, entities);
  const installedSkills = getInstalledSkills();
  const preferences = loadPreferences();
  
  const status = requiredSkills.map(skillName => {
    const installed = installedSkills.includes(skillName);
    const preference = preferences.auto_install.includes(skillName) ? 'auto_install' :
                       preferences.never_install.includes(skillName) ? 'never_install' :
                       preferences.always_ask.includes(skillName) ? 'always_ask' :
                       'unknown';
    
    return {
      skill: skillName,
      installed,
      preference,
      action: !installed && preference !== 'never_install' ? 'suggest_install' : 'none',
    };
  });
  
  return {
    intent,
    entities,
    requiredSkills,
    status,
    missingSkills: status.filter(s => !s.installed && s.preference !== 'never_install').map(s => s.skill),
  };
}

/**
 * Suggest skill installations based on detection result
 */
function suggestInstallations(detectionResult) {
  const { intent, entities = {}, confidence } = detectionResult;
  
  // Don't suggest if confidence is too low
  if (confidence < 50) {
    return {
      suggestions: [],
      reasoning: 'Confidence too low for skill suggestions',
    };
  }
  
  const status = checkSkillStatus(intent, entities);
  const config = loadConfig();
  
  // Check if skill installation requires human approval
  const requiresApproval = config.safety?.human_approval_required?.includes('skill_installation');
  
  const suggestions = status.missingSkills.map(skillName => ({
    skill: skillName,
    reason: `Required for ${intent} workflow`,
    auto_install: !requiresApproval && status.status.find(s => s.skill === skillName)?.preference === 'auto_install',
  }));
  
  return {
    intent,
    confidence,
    suggestions,
    requiresApproval,
    reasoning: suggestions.length > 0 
      ? `Found ${suggestions.length} skill(s) that could enhance this workflow`
      : 'All required skills are already installed',
  };
}

/**
 * Install a skill (placeholder - would call actual install script)
 */
function installSkill(skillName, options = {}) {
  const { dryRun = false } = options;
  
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Installing skill: ${skillName}`);
  
  if (dryRun) {
    return {
      skill: skillName,
      status: 'simulated',
      message: 'Dry run - no actual installation performed',
    };
  }
  
  // Check if skill is already installed
  if (isSkillInstalled(skillName)) {
    return {
      skill: skillName,
      status: 'already_installed',
      message: `Skill ${skillName} is already installed`,
    };
  }
  
  // Try to install via skills.sh if it exists
  const skillsScript = path.join(__dirname, '../../../skills.sh');
  
  if (fs.existsSync(skillsScript)) {
    try {
      execSync(`bash ${skillsScript} install ${skillName}`, { 
        encoding: 'utf8',
        stdio: 'inherit',
      });
      
      return {
        skill: skillName,
        status: 'success',
        message: `Successfully installed ${skillName}`,
      };
    } catch (err) {
      return {
        skill: skillName,
        status: 'error',
        message: err.message,
      };
    }
  }
  
  return {
    skill: skillName,
    status: 'not_available',
    message: 'No installation mechanism available (skills.sh not found)',
  };
}

/**
 * Update skill preferences
 */
function updatePreference(skillName, preference) {
  const preferences = loadPreferences();
  
  // Remove from all preference lists
  preferences.auto_install = preferences.auto_install.filter(s => s !== skillName);
  preferences.never_install = preferences.never_install.filter(s => s !== skillName);
  preferences.always_ask = preferences.always_ask.filter(s => s !== skillName);
  
  // Add to appropriate list
  if (preference === 'auto_install') {
    preferences.auto_install.push(skillName);
  } else if (preference === 'never_install') {
    preferences.never_install.push(skillName);
  } else if (preference === 'always_ask') {
    preferences.always_ask.push(skillName);
  }
  
  savePreferences(preferences);
  
  return preferences;
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === '--help' || command === '-h') {
    console.log(`
Ouroboros Skill Installer

Usage:
  node skill-installer.js check <intent>               Check required skills for intent
  node skill-installer.js install <skill-name>         Install a skill
  node skill-installer.js suggest <detection-json>     Suggest installations from detection
  node skill-installer.js list                         List installed skills
  node skill-installer.js preference <skill> <type>    Set skill preference

Preference Types:
  auto_install    Automatically install when needed
  never_install   Never suggest this skill
  always_ask      Always ask before installing

Examples:
  node skill-installer.js check create_project
  node skill-installer.js install get-shit-done
  node skill-installer.js suggest '{"intent":"create_project","confidence":92}'
  node skill-installer.js preference laboratory auto_install
`);
    process.exit(0);
  }
  
  switch (command) {
    case 'check': {
      const intent = args[1];
      if (!intent) {
        console.error('Error: Intent required');
        process.exit(1);
      }
      
      const status = checkSkillStatus(intent);
      console.log(JSON.stringify(status, null, 2));
      break;
    }
    
    case 'install': {
      const skillName = args[1];
      if (!skillName) {
        console.error('Error: Skill name required');
        process.exit(1);
      }
      
      const dryRun = args.includes('--dry-run');
      const result = installSkill(skillName, { dryRun });
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    
    case 'suggest': {
      const jsonInput = args.slice(1).join(' ');
      if (!jsonInput) {
        console.error('Error: Detection result JSON required');
        process.exit(1);
      }
      
      try {
        const detection = JSON.parse(jsonInput);
        const suggestions = suggestInstallations(detection);
        console.log(JSON.stringify(suggestions, null, 2));
      } catch (err) {
        console.error('Error: Invalid JSON input');
        console.error(err.message);
        process.exit(1);
      }
      break;
    }
    
    case 'list': {
      const installed = getInstalledSkills();
      console.log(JSON.stringify({ installedSkills: installed }, null, 2));
      break;
    }
    
    case 'preference': {
      const [, skillName, preferenceType] = args;
      if (!skillName || !preferenceType) {
        console.error('Error: Skill name and preference type required');
        process.exit(1);
      }
      
      const preferences = updatePreference(skillName, preferenceType);
      console.log(JSON.stringify(preferences, null, 2));
      break;
    }
    
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run with --help for usage information');
      process.exit(1);
  }
}

// Export for use as module
if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
} else {
  module.exports = {
    getRequiredSkills,
    checkSkillStatus,
    suggestInstallations,
    installSkill,
    isSkillInstalled,
    getInstalledSkills,
    loadPreferences,
    savePreferences,
    updatePreference,
  };
}
