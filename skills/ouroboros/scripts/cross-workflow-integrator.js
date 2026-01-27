#!/usr/bin/env node

/**
 * Ouroboros Cross-Workflow Integrator (Phase 4 - Compound Engineering Synergy)
 * 
 * Integrate Ouroboros with existing GSD and Ralph-TUI workflows:
 * - Add cross-workflow learning (what works across similar projects)
 * - Improve handoff documentation between workflows
 * - Track cross-workflow success patterns
 * 
 * Usage:
 *   node cross-workflow-integrator.js handoff <from-skill> <to-skill> <context-json>
 *   node cross-workflow-integrator.js learn <project-type> <intent> <workflow> <success|fail>
 *   node cross-workflow-integrator.js suggest-handler <intent> <context>
 *   node cross-workflow-integrator.js project-patterns <project-type>
 *   node cross-workflow-integrator.js handoff-docs <from> <to>
 *   node cross-workflow-integrator.js stats
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, '../memory');
const CROSS_WORKFLOW_LOG = path.join(__dirname, '../memory/cross-workflow-learning.jsonl');
const PROJECT_PATTERNS_FILE = path.join(__dirname, '../memory/project-patterns.json');
const HANDOFF_TEMPLATES_FILE = path.join(__dirname, '../memory/handoff-templates.json');

// Workflow constants
const WORKFLOWS = {
  GSD: 'get-shit-done',
  RALPH: 'ralph-tui',
  GSD_RALPH: 'gsd-ralph-full',
  RALPH_PRD: 'ralph-tui-prd',
  QUICK: 'quick',
  RESEARCH: 'research',
};

// Project type patterns
const PROJECT_TYPES = {
  WEB_FRONTEND: 'web_frontend',
  WEB_BACKEND: 'web_backend',
  FULLSTACK: 'fullstack',
  API: 'api',
  CLI: 'cli',
  LIBRARY: 'library',
  MOBILE: 'mobile',
  DESKTOP: 'desktop',
  INFRASTRUCTURE: 'infrastructure',
  DATA: 'data',
};

/**
 * Ensure files exist
 */
function ensureFiles() {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(CROSS_WORKFLOW_LOG)) {
    fs.writeFileSync(CROSS_WORKFLOW_LOG, '', 'utf8');
  }
  
  if (!fs.existsSync(PROJECT_PATTERNS_FILE)) {
    fs.writeFileSync(PROJECT_PATTERNS_FILE, JSON.stringify(getDefaultProjectPatterns(), null, 2), 'utf8');
  }
  
  if (!fs.existsSync(HANDOFF_TEMPLATES_FILE)) {
    fs.writeFileSync(HANDOFF_TEMPLATES_FILE, JSON.stringify(getDefaultHandoffTemplates(), null, 2), 'utf8');
  }
}

/**
 * Default project patterns
 */
function getDefaultProjectPatterns() {
  return {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    patterns: {
      [PROJECT_TYPES.WEB_FRONTEND]: {
        frameworks: ['React', 'Vue', 'Angular', 'Next.js', 'Svelte'],
        typicalIntents: ['create_project', 'extend_feature', 'optimize'],
        bestWorkflow: 'gsd-ralph-full',
        commonTasks: ['components', 'routing', 'state-management', 'styling'],
        gsdFirst: true,
      },
      [PROJECT_TYPES.WEB_BACKEND]: {
        frameworks: ['Node.js', 'Express', 'Fastify', 'NestJS', 'Python', 'Go'],
        typicalIntents: ['create_project', 'extend_feature', 'optimize'],
        bestWorkflow: 'gsd-ralph-full',
        commonTasks: ['endpoints', 'authentication', 'database', 'validation'],
        gsdFirst: true,
      },
      [PROJECT_TYPES.FULLSTACK]: {
        frameworks: ['Next.js', 'Remix', 'Astro', 'Node.js'],
        typicalIntents: ['create_project', 'extend_feature'],
        bestWorkflow: 'gsd-ralph-full',
        commonTasks: ['api', 'frontend', 'database', 'auth'],
        gsdFirst: true,
        requiresCoordination: true,
      },
      [PROJECT_TYPES.API]: {
        frameworks: ['REST', 'GraphQL', 'gRPC'],
        typicalIntents: ['create_project', 'extend_feature', 'optimize'],
        bestWorkflow: 'gsd-ralph-full',
        commonTasks: ['endpoints', 'models', 'documentation'],
        gsdFirst: true,
      },
      [PROJECT_TYPES.CLI]: {
        frameworks: ['Commander', 'Oclif', 'Ink'],
        typicalIntents: ['create_project', 'extend_feature'],
        bestWorkflow: 'ralph-only',
        commonTasks: ['commands', 'flags', 'help'],
        gsdFirst: false,
      },
      [PROJECT_TYPES.LIBRARY]: {
        frameworks: ['npm', 'PyPI', 'Cargo'],
        typicalIntents: ['create_project', 'optimize'],
        bestWorkflow: 'gsd-only',
        commonTasks: ['exports', 'types', 'tests', 'docs'],
        gsdFirst: true,
      },
      [PROJECT_TYPES.INFRASTRUCTURE]: {
        frameworks: ['Docker', 'Kubernetes', 'Terraform'],
        typicalIntents: ['create_project', 'optimize'],
        bestWorkflow: 'gsd-ralph-full',
        commonTasks: ['configuration', 'deployment', 'monitoring'],
        gsdFirst: true,
      },
      [PROJECT_TYPES.DATA]: {
        frameworks: ['Python', 'Pandas', 'Spark'],
        typicalIntents: ['research', 'create_project'],
        bestWorkflow: 'gsd-ralph-full',
        commonTasks: ['pipelines', 'analysis', 'visualization'],
        gsdFirst: true,
      },
    },
    crossWorkflowPatterns: [],
  };
}

/**
 * Default handoff templates
 */
function getDefaultHandoffTemplates() {
  return {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    templates: {
      'gsd→ralph': {
        name: 'GSD to Ralph-TUI Handoff',
        required: ['spec_summary', 'architecture', 'tasks', 'constraints'],
        optional: ['known_issues', 'dependencies', 'test_strategy'],
        template: `## Handoff: GSD → Ralph-TUI

### Project Context
- **Type**: {project_type}
- **Framework**: {framework}
- **Complexity**: {complexity}

### Spec Summary
{spec_summary}

### Architecture Decisions
{architecture}

### Tasks (in priority order)
{tasks}

### Constraints & Requirements
{constraints}

### Known Issues / Blockers
{known_issues}

### Dependencies
{dependencies}

### Test Strategy
{test_strategy}

### Success Criteria
{success_criteria}
`,
      },
      'ralph→gsd': {
        name: 'Ralph-TUI to GSD Handoff',
        required: ['execution_summary', 'findings', 'remaining_work'],
        optional: ['blockers', 'questions', 'artifacts'],
        template: `## Handoff: Ralph-TUI → GSD

### Execution Summary
{execution_summary}

### Key Findings
{findings}

### Completed Work
{completed_work}

### Remaining Work
{remaining_work}

### Blockers & Issues
{blockers}

### Questions for Planning
{questions}

### Generated Artifacts
{artifacts}

### Recommendations
{recommendations}
`,
      },
      'quick→gsd': {
        name: 'Quick Task to GSD Escalation',
        required: ['task_description', 'why_escalate', 'context'],
        optional: ['attempted_solutions', 'related_work'],
        template: `## Escalation: Quick → GSD

### Task Description
{task_description}

### Why Escalation Needed
{why_escalate}

### Context & Background
{context}

### Attempted Solutions
{attempted_solutions}

### Related Work
{related_work}

### Expected Outcome
{expected_outcome}
`,
      },
      'gsd→quick': {
        name: 'GSD to Quick Task Downgrade',
        required: ['task_description', 'simplified_scope', 'scope_rationale'],
        optional: ['original_complexity', 'reasons'],
        template: `## Downgrade: GSD → Quick Task

### Task Description
{task_description}

### Simplified Scope
{simplified_scope}

### Scope Reduction Rationale
{scope_rationale}

### Original Complexity Assessment
{original_complexity}

### Benefits of Simpler Approach
{benefits}

### Next Steps
{next_steps}
`,
      },
    },
  };
}

/**
 * Load project patterns
 */
function loadProjectPatterns() {
  ensureFiles();
  try {
    const data = fs.readFileSync(PROJECT_PATTERNS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return getDefaultProjectPatterns();
  }
}

/**
 * Save project patterns
 */
function saveProjectPatterns(patterns) {
  ensureFiles();
  patterns.lastUpdated = new Date().toISOString();
  fs.writeFileSync(PROJECT_PATTERNS_FILE, JSON.stringify(patterns, null, 2), 'utf8');
}

/**
 * Load handoff templates
 */
function loadHandoffTemplates() {
  ensureFiles();
  try {
    const data = fs.readFileSync(HANDOFF_TEMPLATES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return getDefaultHandoffTemplates();
  }
}

/**
 * Detect project type from context
 */
function detectProjectType(context = {}) {
  const { message = '', entities = {} } = context;
  const lowerMessage = message.toLowerCase();
  const frameworks = entities.frameworks || [];
  
  // Check for explicit project type mentions
  const typeIndicators = {
    [PROJECT_TYPES.WEB_FRONTEND]: ['frontend', 'ui', 'website', 'web app', 'spa'],
    [PROJECT_TYPES.WEB_BACKEND]: ['backend', 'api', 'server', 'service'],
    [PROJECT_TYPES.FULLSTACK]: ['fullstack', 'full-stack', 'full stack'],
    [PROJECT_TYPES.CLI]: ['cli', 'command line', 'terminal', 'tool'],
    [PROJECT_TYPES.LIBRARY]: ['library', 'package', 'sdk', 'module'],
    [PROJECT_TYPES.INFRASTRUCTURE]: ['infrastructure', 'deployment', 'docker', 'kubernetes', 'terraform'],
    [PROJECT_TYPES.MOBILE]: ['mobile', 'ios', 'android', 'react native'],
    [PROJECT_TYPES.DATA]: ['data', 'pipeline', 'analysis', 'etl'],
  };
  
  for (const [type, indicators] of Object.entries(typeIndicators)) {
    if (indicators.some(ind => lowerMessage.includes(ind))) {
      return { type, confidence: 80, matched: indicators.find(ind => lowerMessage.includes(ind)) };
    }
  }
  
  // Check framework-based detection
  const frameworkToType = {
    'React': PROJECT_TYPES.WEB_FRONTEND,
    'Vue': PROJECT_TYPES.WEB_FRONTEND,
    'Angular': PROJECT_TYPES.WEB_FRONTEND,
    'Next.js': PROJECT_TYPES.FULLSTACK,
    'Express': PROJECT_TYPES.WEB_BACKEND,
    'Fastify': PROJECT_TYPES.WEB_BACKEND,
    'Node.js': PROJECT_TYPES.WEB_BACKEND,
    'Python': PROJECT_TYPES.DATA,
    'Go': PROJECT_TYPES.WEB_BACKEND,
    'Commander': PROJECT_TYPES.CLI,
    'Oclif': PROJECT_TYPES.CLI,
    'Docker': PROJECT_TYPES.INFRASTRUCTURE,
    'Kubernetes': PROJECT_TYPES.INFRASTRUCTURE,
  };
  
  for (const framework of frameworks) {
    if (frameworkToType[framework]) {
      return { type: frameworkToType[framework], confidence: 70, matched: framework };
    }
  }
  
  return { type: null, confidence: 0 };
}

/**
 * Get best workflow for project type + intent combination
 */
function getBestWorkflow(projectType, intent) {
  const patterns = loadProjectPatterns();
  
  if (!projectType || !patterns.patterns[projectType]) {
    return null;
  }
  
  const projectPattern = patterns.patterns[projectType];
  
  // Check if intent is typical for this project type
  if (projectPattern.typicalIntents?.includes(intent)) {
    return {
      workflow: projectPattern.bestWorkflow,
      reason: 'Standard workflow for this project type and intent',
      gsdFirst: projectPattern.gsdFirst,
      requiresCoordination: projectPattern.requiresCoordination,
    };
  }
  
  // Check cross-workflow learning
  const learning = getCrossWorkflowLearning(projectType, intent);
  if (learning?.recommendedWorkflow) {
    return {
      workflow: learning.recommendedWorkflow,
      reason: 'Based on cross-workflow learning',
      confidence: learning.confidence,
      basedOnSuccessRate: learning.successRate,
    };
  }
  
  // Default based on gsdFirst flag
  return {
    workflow: projectPattern.gsdFirst ? WORKFLOWS.GSD_RALPH : WORKFLOWS.RALPH,
    reason: 'Default based on project type',
  };
}

/**
 * Record cross-workflow handoff
 */
function recordHandoff(fromSkill, toSkill, context, outcome = null) {
  ensureFiles();
  
  const handoff = {
    id: `handoff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    fromSkill,
    toSkill,
    projectType: context.projectType || detectProjectType(context).type,
    intent: context.intent,
    complexity: context.complexity,
    outcome, // 'success', 'failed', 'escalated', 'downgraded'
    notes: context.notes || '',
  };
  
  fs.appendFileSync(CROSS_WORKFLOW_LOG, JSON.stringify(handoff) + '\n', 'utf8');
  
  return handoff;
}

/**
 * Learn from cross-workflow execution
 */
function learnFromExecution(projectType, intent, workflow, outcome) {
  const patterns = loadProjectPatterns();
  
  // Update cross-workflow patterns
  const key = `${projectType}:${intent}:${workflow}`;
  const existingIndex = patterns.crossWorkflowPatterns.findIndex(
    p => p.projectType === projectType && p.intent === intent && p.workflow === workflow
  );
  
  const entry = {
    projectType,
    intent,
    workflow,
    total: 1,
    successes: outcome === 'success' ? 1 : 0,
    lastUpdated: new Date().toISOString(),
  };
  
  if (existingIndex >= 0) {
    const existing = patterns.crossWorkflowPatterns[existingIndex];
    patterns.crossWorkflowPatterns[existingIndex] = {
      ...existing,
      total: existing.total + 1,
      successes: outcome === 'success' ? existing.successes + 1 : existing.successes,
      lastUpdated: new Date().toISOString(),
    };
  } else {
    patterns.crossWorkflowPatterns.push(entry);
  }
  
  // Update best workflow recommendation
  const projectPattern = patterns.patterns[projectType];
  if (projectPattern) {
    const workflowSuccessRates = patterns.crossWorkflowPatterns
      .filter(p => p.projectType === projectType && p.intent === intent)
      .map(p => ({
        workflow: p.workflow,
        successRate: p.total > 0 ? (p.successes / p.total * 100) : 0,
        totalUses: p.total,
      }))
      .sort((a, b) => b.successRate - a.successRate);
    
    if (workflowSuccessRates.length > 0 && workflowSuccessRates[0].successRate > 50) {
      patterns.patterns[projectType].bestWorkflow = workflowSuccessRates[0].workflow;
    }
  }
  
  saveProjectPatterns(patterns);
  
  return {
    projectType,
    intent,
    workflow,
    outcome,
    updatedPattern: patterns.crossWorkflowPatterns.find(
      p => p.projectType === projectType && p.intent === intent && p.workflow === workflow
    ),
  };
}

/**
 * Get cross-workflow learning data
 */
function getCrossWorkflowLearning(projectType, intent) {
  const patterns = loadProjectPatterns();
  
  const relevant = patterns.crossWorkflowPatterns.filter(
    p => p.projectType === projectType && p.intent === intent
  );
  
  if (relevant.length === 0) {
    return null;
  }
  
  const sorted = relevant.map(p => ({
    workflow: p.workflow,
    successRate: (p.successes / p.total * 100),
    totalUses: p.total,
  })).sort((a, b) => b.successRate - a.successRate);
  
  return {
    projectType,
    intent,
    recommendedWorkflow: sorted[0].workflow,
    confidence: sorted[0].total >= 3 ? 'high' : sorted[0].total >= 1 ? 'medium' : 'low',
    successRate: sorted[0].successRate.toFixed(1),
    alternatives: sorted.slice(1, 3),
  };
}

/**
 * Get project patterns for a specific type
 */
function getProjectPatterns(projectType) {
  const patterns = loadProjectPatterns();
  return patterns.patterns[projectType] || null;
}

/**
 * Generate handoff document
 */
function generateHandoff(fromSkill, toSkill, context) {
  const templates = loadHandoffTemplates();
  
  const templateKey = `${fromSkill}→${toSkill}`;
  const template = templates.templates[templateKey];
  
  if (!template) {
    return {
      success: false,
      error: `No handoff template found for ${fromSkill} → ${toSkill}`,
      availableTemplates: Object.keys(templates.templates),
    };
  }
  
  // Fill template with context
  let filledTemplate = template.template;
  
  for (const [key, value] of Object.entries(context)) {
    const placeholder = `{${key}}`;
    filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), value || '[not provided]');
  }
  
  return {
    success: true,
    template: templateKey,
    required: template.required,
    optional: template.optional,
    document: filledTemplate,
  };
}

/**
 * Suggest handler based on context
 */
function suggestHandler(intent, context) {
  const projectType = detectProjectType(context).type || detectProjectType(context.message).type;
  
  // Check cross-workflow learning first
  const learning = projectType ? getCrossWorkflowLearning(projectType, intent) : null;
  
  // Get best workflow for project type
  const bestWorkflow = projectType ? getBestWorkflow(projectType, intent) : null;
  
  // Determine handler
  let suggestedHandler;
  let reasoning;
  
  if (learning?.recommendedWorkflow) {
    suggestedHandler = learning.recommendedWorkflow;
    reasoning = 'Based on cross-workflow learning';
  } else if (bestWorkflow?.workflow) {
    suggestedHandler = bestWorkflow.workflow;
    reasoning = 'Based on project type patterns';
  } else {
    // Default routing
    switch (intent) {
      case 'create_project':
        suggestedHandler = WORKFLOWS.GSD_RALPH;
        reasoning = 'Complex project - requires planning and execution';
        break;
      case 'extend_feature':
        suggestedHandler = WORKFLOWS.GSD_RALPH;
        reasoning = 'Feature work - planning recommended';
        break;
      case 'debug_fix':
        suggestedHandler = WORKFLOWS.QUICK;
        reasoning = 'Simple fix - direct execution';
        break;
      case 'discuss_decision':
        suggestedHandler = WORKFLOWS.GSD;
        reasoning = 'Decision work - GSD context needed';
        break;
      case 'optimize':
        suggestedHandler = WORKFLOWS.GSD_RALPH;
        reasoning = 'Optimization - analysis + implementation';
        break;
      case 'research':
        suggestedHandler = WORKFLOWS.RESEARCH;
        reasoning = 'Research - no execution needed';
        break;
      default:
        suggestedHandler = WORKFLOWS.QUICK;
        reasoning = 'Default - simple task';
    }
  }
  
  return {
    intent,
    projectType: projectType || 'unknown',
    suggestedHandler,
    reasoning,
    crossWorkflowLearning: learning,
    projectPattern: bestWorkflow,
    coordination: bestWorkflow?.requiresCoordination || false,
  };
}

/**
 * Get cross-workflow statistics
 */
function getCrossWorkflowStats() {
  ensureFiles();
  
  let total = 0;
  let byTransition = {};
  let byOutcome = { success: 0, failed: 0, escalated: 0, downgraded: 0 };
  
  try {
    const lines = fs.readFileSync(CROSS_WORKFLOW_LOG, 'utf8').trim().split('\n').filter(Boolean);
    total = lines.length;
    
    for (const line of lines) {
      const handoff = JSON.parse(line);
      const key = `${handoff.fromSkill}→${handoff.toSkill}`;
      if (!byTransition[key]) byTransition[key] = 0;
      byTransition[key]++;
      
      if (handoff.outcome && byOutcome[handoff.outcome] !== undefined) {
        byOutcome[handoff.outcome]++;
      }
    }
  } catch (err) {
    // File might be empty
  }
  
  const patterns = loadProjectPatterns();
  const projectTypes = Object.keys(patterns.patterns);
  
  return {
    totalHandovers: total,
    byTransition,
    byOutcome,
    successRate: total > 0 ? ((byOutcome.success / total) * 100).toFixed(1) : 0,
    configuredProjectTypes: projectTypes.length,
    crossWorkflowPatterns: patterns.crossWorkflowPatterns.length,
  };
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === '--help' || command === '-h') {
    console.log(`
Ouroboros Cross-Workflow Integrator

Usage:
  node cross-workflow-integrator.js handoff <from> <to> <context-json>
  node cross-workflow-integrator.js learn <project-type> <intent> <workflow> <success|fail>
  node cross-workflow-integrator.js suggest <intent> <context>
  node cross-workflow-integrator.js patterns <project-type>
  node cross-workflow-integrator.js handoff-doc <from> <to> <context-json>
  node cross-workflow-integrator.js detect-type <message>
  node cross-workflow-integrator.js stats

Project Types:
  web_frontend, web_backend, fullstack, api, cli, library, infrastructure, data

Workflows:
  gsd (get-shit-done), ralph (ralph-tui), gsd-ralph-full, quick, research

Examples:
  node cross-workflow-integrator.js handoff gsd ralph '{"intent":"create_project","complexity":"high"}'
  node cross-workflow-integrator.js learn fullstack create_project gsd-ralph-full success
  node cross-workflow-integrator.js suggest create_project '{"message":"Build a Next.js app"}'
  node cross-workflow-integrator.js patterns fullstack
  node cross-workflow-integrator.js handoff-doc gsd ralph '{"spec_summary":"Auth system","tasks":["login","logout"]}'
  node cross-workflow-integrator.js detect-type "Build a React frontend"
  node cross-workflow-integrator.js stats
`);
    process.exit(0);
  }
  
  switch (command) {
    case 'handoff': {
      const [, fromSkill, toSkill, contextJson] = args;
      if (!fromSkill || !toSkill || !contextJson) {
        console.error('Error: From skill, to skill, and context required');
        process.exit(1);
      }
      
      const context = JSON.parse(contextJson);
      const handoff = recordHandoff(fromSkill, toSkill, context);
      console.log(JSON.stringify(handoff, null, 2));
      break;
    }
    
    case 'learn': {
      const [, projectType, intent, workflow, outcome] = args;
      if (!projectType || !intent || !workflow || !outcome) {
        console.error('Error: Project type, intent, workflow, and outcome required');
        process.exit(1);
      }
      
      const result = learnFromExecution(projectType, intent, workflow, outcome);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    
    case 'suggest': {
      const [, intent, contextJson] = args;
      if (!intent) {
        console.error('Error: Intent required');
        process.exit(1);
      }
      
      const context = contextJson ? JSON.parse(contextJson) : { message: '' };
      const suggestion = suggestHandler(intent, context);
      console.log(JSON.stringify(suggestion, null, 2));
      break;
    }
    
    case 'patterns': {
      const projectType = args[1];
      if (!projectType) {
        console.error('Error: Project type required');
        process.exit(1);
      }
      
      const patterns = getProjectPatterns(projectType);
      console.log(JSON.stringify(patterns, null, 2));
      break;
    }
    
    case 'handoff-doc': {
      const [, fromSkill, toSkill, contextJson] = args;
      if (!fromSkill || !toSkill || !contextJson) {
        console.error('Error: From skill, to skill, and context required');
        process.exit(1);
      }
      
      const context = JSON.parse(contextJson);
      const doc = generateHandoff(fromSkill, toSkill, context);
      console.log(JSON.stringify(doc, null, 2));
      break;
    }
    
    case 'detect-type': {
      const message = args.slice(1).join(' ');
      if (!message) {
        console.error('Error: Message required');
        process.exit(1);
      }
      
      const result = detectProjectType({ message });
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    
    case 'stats': {
      const stats = getCrossWorkflowStats();
      console.log(JSON.stringify(stats, null, 2));
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
    recordHandoff,
    learnFromExecution,
    suggestHandler,
    getProjectPatterns,
    generateHandoff,
    detectProjectType,
    getCrossWorkflowLearning,
    getCrossWorkflowStats,
    loadProjectPatterns,
    WORKFLOWS,
    PROJECT_TYPES,
  };
}
