#!/usr/bin/env node

/**
 * Ouroboros Context-Aware Orchestration (Phase 2 - US-012)
 * 
 * Context-aware routing and orchestration:
 * - Detect current project type
 * - Check for existing GSD artifacts
 * - Consider recent conversation context
 * - Adjust suggestions based on flow state
 * 
 * Usage:
 *   node context-aware.js analyze <path>
 *   node context-aware.js route <intent-json>
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, '../memory');
const CONTEXT_CACHE = path.join(MEMORY_DIR, 'context-cache.json');

// Project type detection patterns
const PROJECT_TYPES = {
  web_frontend: {
    patterns: [
      /package\.json.*("react"|"vue"|"angular"|"svelte")/i,
      /\.(jsx|tsx|vue)$/,
      /src\/components\//,
      /vite\.config|webpack\.config/,
    ],
    skills: ['vite-setup', 'component-library', 'ralph-tui-prd'],
  },
  
  web_fullstack: {
    patterns: [
      /package\.json.*("next"|"remix"|"sveltekit"|"nuxt")/i,
      /app\/api\//,
      /pages\/api\//,
      /server\//,
    ],
    skills: ['get-shit-done', 'ralph-tui-prd', 'api-setup', 'db-schema'],
  },
  
  backend_api: {
    patterns: [
      /package\.json.*("express"|"fastify"|"nestjs"|"hono")/i,
      /\/routes\//,
      /\/controllers\//,
      /\/middleware\//,
    ],
    skills: ['api-setup', 'db-schema', 'ralph-tui-prd'],
  },
  
  cli_tool: {
    patterns: [
      /bin\//,
      /cli\.js/,
      /commander|yargs|oclif/,
      /#!\/usr\/bin\/env node/,
    ],
    skills: ['laboratory', 'ralph-tui-prd'],
  },
  
  library: {
    patterns: [
      /index\.(js|ts)$/,
      /dist\//,
      /lib\//,
      /package\.json.*"type".*"module"/,
    ],
    skills: ['laboratory', 'ralph-tui-prd'],
  },
  
  data_analysis: {
    patterns: [
      /\.ipynb$/,
      /data\//,
      /analysis\//,
      /pandas|numpy|jupyter/,
    ],
    skills: ['research', 'laboratory'],
  },
};

// GSD artifact patterns
const GSD_ARTIFACTS = {
  spec: [
    /SPEC\.md$/i,
    /requirements\.md$/i,
    /PRD\.md$/i,
  ],
  
  architecture: [
    /ARCHITECTURE\.md$/i,
    /DESIGN\.md$/i,
    /system-design\.md$/i,
  ],
  
  tasks: [
    /TASKS\.md$/i,
    /TODO\.md$/i,
    /backlog\.md$/i,
  ],
  
  decisions: [
    /ADR\//i,
    /decisions\//i,
    /DECISION.*\.md$/i,
  ],
};

/**
 * Load context cache
 */
function loadContextCache() {
  try {
    const data = fs.readFileSync(CONTEXT_CACHE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {
      projectType: null,
      artifacts: {},
      lastAnalysis: null,
      metadata: {},
    };
  }
}

/**
 * Save context cache
 */
function saveContextCache(cache) {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
  
  cache.lastAnalysis = new Date().toISOString();
  fs.writeFileSync(CONTEXT_CACHE, JSON.stringify(cache, null, 2), 'utf8');
}

/**
 * Recursively scan directory for files
 */
function scanDirectory(dirPath, maxDepth = 3, currentDepth = 0) {
  if (currentDepth > maxDepth) return [];
  
  const files = [];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip common directories to ignore
      if (entry.name.startsWith('.') || 
          entry.name === 'node_modules' || 
          entry.name === 'dist' ||
          entry.name === 'build') {
        continue;
      }
      
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...scanDirectory(fullPath, maxDepth, currentDepth + 1));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    // Ignore permission errors
  }
  
  return files;
}

/**
 * Detect project type from file patterns
 */
function detectProjectType(projectPath) {
  const files = scanDirectory(projectPath);
  const fileContents = {};
  
  // Read key files for content analysis
  const keyFiles = ['package.json', 'pyproject.toml', 'Cargo.toml', 'go.mod'];
  for (const file of files) {
    const basename = path.basename(file);
    if (keyFiles.includes(basename)) {
      try {
        fileContents[basename] = fs.readFileSync(file, 'utf8');
      } catch (err) {
        // Ignore read errors
      }
    }
  }
  
  // Score each project type
  const scores = {};
  
  for (const [typeName, typeConfig] of Object.entries(PROJECT_TYPES)) {
    let score = 0;
    
    for (const pattern of typeConfig.patterns) {
      // Check file paths
      for (const file of files) {
        if (pattern.test(file)) {
          score += 10;
        }
      }
      
      // Check file contents
      for (const content of Object.values(fileContents)) {
        if (pattern.test(content)) {
          score += 20;
        }
      }
    }
    
    if (score > 0) {
      scores[typeName] = score;
    }
  }
  
  // Find highest scoring type
  const entries = Object.entries(scores);
  if (entries.length === 0) {
    return {
      type: 'unknown',
      confidence: 0,
      suggestedSkills: [],
    };
  }
  
  const [topType, topScore] = entries.reduce((a, b) => b[1] > a[1] ? b : a);
  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const confidence = Math.min((topScore / totalScore) * 100, 100);
  
  return {
    type: topType,
    confidence: Math.round(confidence),
    scores,
    suggestedSkills: PROJECT_TYPES[topType].skills,
  };
}

/**
 * Find GSD artifacts in project
 */
function findGSDartifacts(projectPath) {
  const files = scanDirectory(projectPath, 2);
  const artifacts = {};
  
  for (const [artifactType, patterns] of Object.entries(GSD_ARTIFACTS)) {
    const matches = [];
    
    for (const file of files) {
      for (const pattern of patterns) {
        if (pattern.test(file)) {
          matches.push(file);
        }
      }
    }
    
    if (matches.length > 0) {
      artifacts[artifactType] = matches;
    }
  }
  
  return artifacts;
}

/**
 * Analyze project context
 */
function analyzeContext(projectPath = process.cwd()) {
  if (!fs.existsSync(projectPath)) {
    return {
      error: 'Project path does not exist',
      path: projectPath,
    };
  }
  
  // Detect project type
  const projectType = detectProjectType(projectPath);
  
  // Find GSD artifacts
  const artifacts = findGSDartifacts(projectPath);
  
  // Check if git repository
  const isGitRepo = fs.existsSync(path.join(projectPath, '.git'));
  
  // Get basic stats
  const files = scanDirectory(projectPath);
  const hasTests = files.some(f => /\.(test|spec)\.(js|ts|jsx|tsx)$/.test(f));
  const hasConfig = files.some(f => /^(\..*rc|.*\.config\.(js|ts|json))$/.test(path.basename(f)));
  
  const context = {
    projectPath,
    projectType,
    artifacts,
    hasGSDartifacts: Object.keys(artifacts).length > 0,
    metadata: {
      isGitRepo,
      hasTests,
      hasConfig,
      fileCount: files.length,
    },
    analyzedAt: new Date().toISOString(),
  };
  
  // Cache the context
  saveContextCache(context);
  
  return context;
}

/**
 * Route based on context and intent
 */
function routeWithContext(detectionResult, projectContext = null) {
  const { intent, confidence, entities = {}, suggestedWorkflow } = detectionResult;
  
  // Load cached context if not provided
  if (!projectContext) {
    projectContext = loadContextCache();
    
    // If cache is stale or empty, re-analyze
    if (!projectContext.lastAnalysis || 
        Date.now() - new Date(projectContext.lastAnalysis).getTime() > 24 * 60 * 60 * 1000) {
      projectContext = analyzeContext();
    }
  }
  
  // Start with original workflow
  let workflow = suggestedWorkflow;
  let reasoning = [`Original suggestion: ${workflow}`];
  let adjustedSkills = [];
  
  // Adjust based on GSD artifacts
  if (projectContext.hasGSDartifacts) {
    if (workflow === 'gsd-only' || workflow === 'gsd-ralph-full') {
      reasoning.push('GSD artifacts exist - can reference existing specs');
      
      if (projectContext.artifacts.spec) {
        reasoning.push(`Found spec: ${path.basename(projectContext.artifacts.spec[0])}`);
      }
      
      if (projectContext.artifacts.tasks) {
        reasoning.push('Tasks documented - can proceed to execution');
        if (workflow === 'gsd-only') {
          workflow = 'ralph-only';
          reasoning.push('Adjusted: Use Ralph for execution since planning exists');
        }
      }
    }
  } else {
    // No GSD artifacts - may need planning
    if (intent === 'create_project' || intent === 'extend_feature') {
      if (workflow === 'ralph-only') {
        workflow = 'gsd-ralph-full';
        reasoning.push('Adjusted: No specs found - start with GSD planning');
      }
    }
  }
  
  // Add project-type specific skills
  if (projectContext.projectType && projectContext.projectType.type !== 'unknown') {
    adjustedSkills = projectContext.projectType.suggestedSkills || [];
    reasoning.push(`Project type: ${projectContext.projectType.type} (${projectContext.projectType.confidence}% confidence)`);
  }
  
  // Consider conversation context
  const conversationSignals = detectConversationSignals(entities);
  if (conversationSignals.length > 0) {
    reasoning.push(...conversationSignals.map(s => `Conversation signal: ${s}`));
  }
  
  return {
    originalWorkflow: suggestedWorkflow,
    adjustedWorkflow: workflow,
    reasoning,
    projectContext: {
      type: projectContext.projectType?.type || 'unknown',
      confidence: projectContext.projectType?.confidence || 0,
      hasGSDartifacts: projectContext.hasGSDartifacts,
      artifacts: Object.keys(projectContext.artifacts || {}),
    },
    suggestedSkills: adjustedSkills,
    confidenceAdjustment: projectContext.projectType?.confidence > 70 ? 10 : 0,
  };
}

/**
 * Detect conversation signals from entities
 */
function detectConversationSignals(entities) {
  const signals = [];
  
  if (entities.frameworks && entities.frameworks.length > 0) {
    signals.push(`Using framework: ${entities.frameworks.join(', ')}`);
  }
  
  if (entities.database && entities.database.length > 0) {
    signals.push(`Database: ${entities.database.join(', ')}`);
  }
  
  if (entities.complexity) {
    signals.push(`Complexity: ${entities.complexity}`);
  }
  
  return signals;
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === '--help' || command === '-h') {
    console.log(`
Ouroboros Context-Aware Orchestration

Usage:
  node context-aware.js analyze [path]           Analyze project context
  node context-aware.js route <detection-json>   Route with context awareness
  node context-aware.js cache                    Show cached context

Examples:
  node context-aware.js analyze ./my-project
  node context-aware.js route '{"intent":"create_project","confidence":90}'
  node context-aware.js cache
`);
    process.exit(0);
  }
  
  switch (command) {
    case 'analyze': {
      const projectPath = args[1] || process.cwd();
      const context = analyzeContext(projectPath);
      console.log(JSON.stringify(context, null, 2));
      break;
    }
    
    case 'route': {
      const jsonInput = args.slice(1).join(' ');
      if (!jsonInput) {
        console.error('Error: Detection result JSON required');
        process.exit(1);
      }
      
      try {
        const detection = JSON.parse(jsonInput);
        const routing = routeWithContext(detection);
        console.log(JSON.stringify(routing, null, 2));
      } catch (err) {
        console.error('Error: Invalid JSON input');
        console.error(err.message);
        process.exit(1);
      }
      break;
    }
    
    case 'cache': {
      const cache = loadContextCache();
      console.log(JSON.stringify(cache, null, 2));
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
    analyzeContext,
    routeWithContext,
    detectProjectType,
    findGSDartifacts,
    loadContextCache,
    saveContextCache,
    PROJECT_TYPES,
    GSD_ARTIFACTS,
  };
}
