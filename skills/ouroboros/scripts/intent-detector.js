#!/usr/bin/env node

/**
 * Ouroboros Intent Detector (v0.3 - Self-Improved)
 * 
 * Multi-layer intent detection with self-improvement:
 * - Layer 1: Fast keyword/pattern matching
 * - Layer 2: Entity extraction
 * - Layer 3: LLM classification (fallback)
 * - Self-learning from feedback and decisions
 * 
 * Usage:
 *   node intent-detector.js "Build a React auth system"
 *   node intent-detector.js --explain "Build a React auth system"
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Simple LRU cache implementation
class LRUCache {
  constructor({ max = 100, ttl = 5 * 60 * 1000 }) {
    this.max = max;
    this.ttl = ttl;
    this.cache = new Map();
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }
  
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    if (this.cache.size >= this.max) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }
  
  clear() {
    this.cache.clear();
  }
}

// Global intent cache
const intentCache = new LRUCache({ max: 100, ttl: 5 * 60 * 1000 });

// Intent categories
const INTENTS = {
  CREATE_PROJECT: 'create_project',
  EXTEND_FEATURE: 'extend_feature',
  DEBUG_FIX: 'debug_fix',
  DISCUSS_DECISION: 'discuss_decision',
  OPTIMIZE: 'optimize',
  RESEARCH: 'research',
  QUICK_TASK: 'quick_task',
  CLARIFY: 'clarify',
};

// Workflow types
const WORKFLOWS = {
  GSD_RALPH_FULL: 'gsd-ralph-full',
  GSD_ONLY: 'gsd-only',
  RALPH_ONLY: 'ralph-only',
  QUICK: 'quick',
  RESEARCH: 'research',
  CLARIFY: 'clarify',
};

// NEW: Compound/Mixed Intent Patterns (Proposal #1)
const COMPOUND_PATTERNS = {
  build_and_fix: [
    /\b(build|create|implement)\s+\w+(?:\s+\w+)*\s+and\s+(?:also\s+)?(fix|debug|resolve)/i,
    /\b(fix|debug|resolve)\s+\w+(?:\s+\w+)*\s+and\s+(?:also\s+)?(build|create|add)/i,
    /\b(add|create)\s+\w+(?:\s+\w+)*\s+and\s+(?:also\s+)?(fix|debug)/i,
  ],
  plan_and_execute: [
    /\b(plan|design|spec)\s+\w+(?:\s+\w+)*\s+and\s+(?:then\s+)?(implement|build|execute)/i,
    /\bdesign\s+\w+(?:\s+\w+)*\s+and\s+(?:then\s+)?build/i,
  ],
  implement_and_test: [
    /\b(implement|build|create)\s+\w+(?:\s+\w+)*\s+and\s+(?:then\s+)?(test|verify|validate)/i,
    /\bbuild\s+\w+(?:\s+\w+)*\s+and\s+test/i,
  ],
};

// Pattern definitions for fast matching (IMPROVED with Proposals #2, #3, #4, #6)
const PATTERNS = {
  // Create project patterns (IMPROVED)
  create_project: [
    /\b(build|create|make|develop|implement)\s+(a|an|the)?\s*\w+\s+(app|application|system|service|platform|website|tool|component)\b/i,
    /\bfrom\s+scratch\b/i,
    /\bnew\s+project\b/i,
    /\bscaffold\b/i,
    /\bset\s+up\s+(a|an|the)?\w+\s+(app|project|system)\b/i,
    /\bwrite\s+(a|an)?\w+\s+(from|to|for)\b/i,
    /\bbuild\s+(me|this|that)\s/i,
    /\bauthentication\s+system\b/i,
  ],
  
  // Extend feature patterns (IMPROVED)
  extend_feature: [
    /\b(add|implement|integrate|include)\s+(a|an|the)?\s*\w+\s+(feature|functionality|capability|button|form|endpoint)\b/i,
    /\bextend\b/i,
    /\benhance\b/i,
    /\bupdate\b/i,
    /\bmodify\b/i,
    /\bchange\b/i,
    /\badd\s+(support|functionality)\b/i,
  ],
  
  // Debug/fix patterns (IMPROVED)
  debug_fix: [
    /\b(fix|debug|resolve|solve)\s+(the|a|an)?\s*(bug|error|issue|problem)\b/i,
    /\bnot\s+working\b/i,
    /\bbroken\b/i,
    /\berror\s+(in|at|with)\b/i,
    /\bfailing\b/i,
    /\bbug\s+(in|at|with)\b/i,
    /\bhelp\s+with\s+(the|a)?\s*(bug|error|issue)\b/i,
    /\bdoesn't\s+work\b/i,
    /\bwon't\s+work\b/i,
    /\bget\s+stuck\b/i,
    /\bhelp\s+debug\b/i,
  ],
  
  // Discussion patterns (IMPROVED - Proposal #3)
  discuss_decision: [
    /\b(should\s+I|what\s+if|which\s+is\s+better|compare)\b/i,
    /\barchitecture\b/i,
    /\bdesign\s+decision\b/i,
    /\bpros\s+and\s+cons\b/i,
    /\bwhich\s+(one|should)\b/i,
    /\b(decide|deciding)\s+(on|between)\b/i,
    /\bthink\s+about\s+(this|that|the)\b/i,
    /\bschema\b/i,
    // NEW patterns from Proposal #3:
    /\bwhich\s+\w+\s+is\s+better\b/i,
    /\b(compare|comparison)\s+\w+\s+(vs|versus|and)\s+\w+/i,
    /\bdecide\s+(between|which)\b/i,
    /\bhelp\s+me\s+(choose|decide|pick)\b/i,
    /\bpros\s+and\s+cons\s+of\b/i,
    /\bshould\s+I\s+use\s+\w+\s+or\s+\w+/i,
    /\bwhich\s+auth\s+strategy\b/i,
  ],
  
  // Optimization patterns (IMPROVED)
  optimize: [
    /\b(optimize|refactor|performance|faster)\b/i,
    /\bimprove\s+(performance|speed|efficiency)\b/i,
    /\bspeed\s+up\b/i,
    /\bclean\s+up\b/i,
    /\bmake\s+(it\s+)?(faster|better|more\s+efficient)\b/i,
    /\brefactor\s+(the\s+)?code\b/i,
    /\bperformance\s+improvement\b/i,
  ],
  
  // Research patterns (IMPROVED)
  research: [
    /\b(research|investigate|explore|learn\s+about|find\s+out|search\s+for)\b/i,
    /\bhow\s+does\s+\w+\s+work\b/i,
    /\bwhat\s+is\s+the\s+best\s+way\b/i,
    /\bhow\s+to\s+(implement|build|create|add)\b/i,
    /\blook\s+into\b/i,
    /\bunderstand\s+(how|what|why)\b/i,
    /\bexplore\s+(the\s+)?options\b/i,
  ],

  // Quick task patterns (IMPROVED - Proposal #2)
  quick_task: [
    /\badd\s+(a|an|the)?\s*(button|input|field|label|text|link|image|icon)\b/i,
    /\bchange\s+(the|a|an)?\s*(color|size|width|height|padding|margin)\b/i,
    /\bupdate\s+(the|a|an)?\s*(README|docs|documentation|CHANGELOG)\b/i,
    /\bfix\s+(the|a|an)?\s*(typo|spelling|grammar|format)\b/i,
    /\bremove\s+(the|a|an)?\s*\w+\b/i,
    /\brename\s+(the|a|an)?\s*\w+\b/i,
    /\bsmall\b/i,
    /\bquick\b/i,
    /\bsimple\b/i,
    /\beasy\b/i,
    /\btiny\b/i,
    /\bminor\b/i,
    /\bone\s+line\b/i,
    /\bsingle\s+line\b/i,
  ],
};

// NEW: Urgency normalization (Proposal #4)
function normalizeMessage(message) {
  const urgencyMarkers = [
    /\(urgent\)/gi,
    /\(asap\)/gi,
    /\(quickly\)/gi,
    /\(high priority\)/gi,
    /\(critical\)/gi,
    /\(now\)/gi,
    /\(today\)/gi,
  ];
  
  let normalized = message;
  for (const marker of urgencyMarkers) {
    normalized = normalized.replace(marker, '');
  }
  
  return normalized.trim();
}

// Complexity indicators (IMPROVED with Proposal #6)
const COMPLEXITY_SIGNALS = {
  high: [
    /\bsystem\b/i,
    /\bplatform\b/i,
    /\bfull(-|\s)?stack\b/i,
    /\bmultiple\s+\w+/i,
    /\bscalable\b/i,
    /\bproduction(-|\s)?ready\b/i,
    /\bauthentication\b/i,
    /\bAI\b/i,
    /\bmicroservices\b/i,
    /\bcloud\b/i,
    /\benterprise\b/i,
  ],
  medium: [
    /\bfeature\b/i,
    /\bcomponent\b/i,
    /\bmodule\b/i,
    /\bintegrat(e|ion)\b/i,
    /\bAPI\b/i,
    /\bendpoint\b/i,
    /\bauth\b/i,
    /\bdatabase\b/i,
  ],
  low: [
    /\bfix\b/i,
    /\bquick\b/i,
    /\bsimple\b/i,
    /\bsmall\b/i,
    /\bbutton\b/i,
    /\bform\b/i,
    /\btext\b/i,
    /\btiny\b/i,
    /\bone\s+line\b/i,
    /\btest\b/i,
  ],
};

// NEW: Architecture keyword boost (Proposal #6)
const ARCHITECTURE_KEYWORDS = [
  'architecture', 'schema', 'database', 'infrastructure', 
  'design pattern', 'scalability', 'performance', 'system design',
  'microservices', 'integration', 'full-stack'
];

// Framework/library extraction
const TECH_PATTERNS = {
  frameworks: /\b(React|Vue|Angular|Next\.js|Nuxt|Svelte|SvelteKit|Remix|Astro|Qwik)\b/gi,
  backend: /\b(Node\.js|Express|Fastify|NestJS|Hono|Bun|Deno|Python|Go|Rust)\b/gi,
  database: /\b(PostgreSQL|MySQL|MongoDB|Redis|Supabase|Firebase|PlanetScale)\b/gi,
  auth: /\b(better-auth|Auth\.js|Clerk|Supabase\s+Auth|Firebase\s+Auth)\b/gi,
  ui: /\b(Tailwind|shadcn|Chakra|MUI|Ant\s+Design|Mantine)\b/gi,
};

// NEW: Compound intent detection (Proposal #1)
function detectCompoundIntent(message) {
  for (const [type, patterns] of Object.entries(COMPOUND_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        return {
          type,
          matchedPattern: pattern.toString(),
          isCompound: true
        };
      }
    }
  }
  return null;
}

/**
 * Layer 1: Fast keyword/pattern matching (IMPROVED with boosting)
 */
function fastMatch(message) {
  const scores = {};
  const matchedPatterns = [];
  
  // Score each intent based on pattern matches
  for (const [intent, patterns] of Object.entries(PATTERNS)) {
    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        score += 20;
        matchedPatterns.push(intent);
      }
    }
    scores[intent] = Math.min(score, 100);
  }
  
  // NEW: Phrase boosts (Proposal #1, #2, #3, #6)
  // Build a → create_project boost
  if (/\bbuild\s+(a|an|the)/i.test(message)) scores.create_project = (scores.create_project || 0) + 15;
  if (/\bcreate\s+(a|an|the)/i.test(message)) scores.create_project = (scores.create_project || 0) + 15;
  
  // Fix the → debug_fix boost
  if (/\bfix\s+(the|a|an)/i.test(message)) scores.debug_fix = (scores.debug_fix || 0) + 20;
  
  // Which/is better → discuss_decision boost
  if (/\bwhich\s+\w+\s+(is\s+)?better\b/i.test(message)) scores.discuss_decision = (scores.discuss_decision || 0) + 15;
  if (/\bshould\s+I\s+(use|choose)\b/i.test(message)) scores.discuss_decision = (scores.discuss_decision || 0) + 15;
  
  // Architecture keywords boost
  for (const keyword of ARCHITECTURE_KEYWORDS) {
    if (new RegExp(`\\b${keyword}\\b`, 'i').test(message)) {
      scores.discuss_decision = (scores.discuss_decision || 0) + 10;
      break;
    }
  }
  
  // Quick boost for docs/styles (Proposal #2)
  if (/\b(update|edit|change)\s+(the\s+)?(README|docs|documentation|CHANGELOG)/i.test(message)) {
    scores.quick_task = (scores.quick_task || 0) + 25;
  }
  if (/\bchange\s+(the\s+)?(color|style|css|theme|padding|margin)/i.test(message)) {
    scores.quick_task = (scores.quick_task || 0) + 20;
  }
  
  // Find highest scoring intent
  const entries = Object.entries(scores);
  if (entries.length === 0) {
    return { intent: null, confidence: 0, matchedPatterns: [] };
  }
  
  const [topIntent, topScore] = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  
  return {
    intent: topIntent,
    confidence: Math.min(topScore + 30, 100), // Base boost for any match
    matchedPatterns,
  };
}

/**
 * Layer 2: Entity extraction
 */
function extractEntities(message) {
  const entities = {};
  
  for (const [category, pattern] of Object.entries(TECH_PATTERNS)) {
    const matches = message.match(pattern);
    if (matches && matches.length > 0) {
      entities[category] = [...new Set(matches)];
    }
  }
  
  for (const [level, patterns] of Object.entries(COMPLEXITY_SIGNALS)) {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        entities.complexity = level;
        break;
      }
    }
    if (entities.complexity) break;
  }
  
  return entities;
}

/**
 * Map intent + entities to workflow (IMPROVED)
 */
function selectWorkflow(intent, entities, confidence) {
  const complexity = entities.complexity || 'medium';
  
  // Low confidence → clarify (Proposal #5: Lowered threshold)
  if (confidence < 40) {
    return {
      workflow: WORKFLOWS.CLARIFY,
      reasoning: 'Confidence below threshold - need clarification',
    };
  }
  
  // Quick task override
  if (intent === INTENTS.QUICK_TASK) {
    return {
      workflow: WORKFLOWS.QUICK,
      reasoning: 'Simple/quick task - execute directly without orchestration',
    };
  }
  
  // Intent-based routing
  switch (intent) {
    case INTENTS.CREATE_PROJECT:
      if (complexity === 'high') {
        return {
          workflow: WORKFLOWS.GSD_RALPH_FULL,
          reasoning: 'High complexity project requires planning (GSD) + execution (Ralph)',
        };
      } else if (complexity === 'medium') {
        return {
          workflow: WORKFLOWS.GSD_RALPH_FULL,
          reasoning: 'Medium complexity - use full GSD→Ralph orchestration',
        };
      }
      return {
        workflow: WORKFLOWS.RALPH_ONLY,
        reasoning: 'Simple project - Ralph can execute directly',
      };
    
    case INTENTS.EXTEND_FEATURE:
      if (complexity === 'high') {
        return {
          workflow: WORKFLOWS.GSD_ONLY,
          reasoning: 'Complex feature addition - plan with GSD first',
        };
      } else if (complexity === 'low') {
        return {
          workflow: WORKFLOWS.QUICK,
          reasoning: 'Simple feature - quick execution',
        };
      }
      return {
        workflow: WORKFLOWS.RALPH_ONLY,
        reasoning: 'Feature implementation - execute with Ralph',
      };
    
    case INTENTS.DEBUG_FIX:
      return {
        workflow: WORKFLOWS.QUICK,
        reasoning: 'Debug/fix task - handle directly without orchestration overhead',
      };
    
    case INTENTS.DISCUSS_DECISION:
      return {
        workflow: WORKFLOWS.GSD_ONLY,
        reasoning: 'Discussion/decision task - use GSD for context and analysis',
      };
    
    case INTENTS.OPTIMIZE:
      if (complexity === 'high') {
        return {
          workflow: WORKFLOWS.GSD_RALPH_FULL,
          reasoning: 'Complex optimization - research (GSD) + implement (Ralph)',
        };
      }
      return {
        workflow: WORKFLOWS.RESEARCH,
        reasoning: 'Optimization - research best practices first',
      };
    
    case INTENTS.RESEARCH:
      return {
        workflow: WORKFLOWS.RESEARCH,
        reasoning: 'Research task - no execution needed',
      };
    
    default:
      if (complexity === 'high') {
        return {
          workflow: WORKFLOWS.GSD_RALPH_FULL,
          reasoning: 'High complexity - full orchestration recommended',
        };
      } else if (complexity === 'low') {
        return {
          workflow: WORKFLOWS.QUICK,
          reasoning: 'Low complexity - direct execution',
        };
      }
      return {
        workflow: WORKFLOWS.CLARIFY,
        reasoning: 'Intent unclear - ask for clarification',
      };
  }
}

/**
 * NEW: LLM Fallback (Proposal #5 - Lowered threshold to 50%)
 */
async function llmFallback(message, fastResult, entities) {
  try {
    // Only trigger if confidence < 50 (Proposal #5)
    if (fastResult.confidence >= 50) {
      return null;
    }
    
    const { callClaude } = require('./llm-bridge.js');
    const prompt = `Classify user intent for: "${message}"
    
    Fast detection result:
    - Intent: ${fastResult.intent || 'unknown'}
    - Confidence: ${fastResult.confidence}%
    - Entities: ${JSON.stringify(fastResult.entities || {})}
    
    Available intents: create_project, extend_feature, debug_fix, discuss_decision, optimize, research, quick_task, clarify
    
    Return JSON:
    {
      "intent": "single intent from list",
      "confidence": 0-100,
      "reasoning": "brief explanation"
    }`;
    
    const result = await callClaude(prompt);
    
    // Parse JSON response
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Ignore parse errors
    }
    
    return null;
  } catch (error) {
    console.error('LLM fallback failed:', error.message);
    return null;
  }
}

/**
 * Main detection function (IMPROVED with caching + LLM)
 */
async function detectIntent(message, options = {}) {
  const timestamp = new Date().toISOString();
  
  // NEW: Check cache first (Proposal #7)
  const cacheKey = message.trim().toLowerCase();
  if (intentCache && !options.noCache) {
    const cached = intentCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
  }
  
  // NEW: Normalize message (Proposal #4)
  const normalizedMessage = normalizeMessage(message);
  
  // Layer 1: Fast pattern matching
  // NEW: Check compound intent FIRST (Proposal #1)
  const compoundResult = detectCompoundIntent(normalizedMessage);
  
  const fastResult = fastMatch(normalizedMessage);
  
  // Layer 2: Entity extraction
  const entities = extractEntities(normalizedMessage);
  
  // Adjust confidence based on entity richness
  let confidence = fastResult.confidence;
  if (Object.keys(entities).length > 0) {
    confidence = Math.min(confidence + 10, 100);
  }
  
  // NEW: Layer 3: LLM fallback (Proposal #5 - threshold 50%)
  let llmUsed = false;
  if (confidence < 50) {
    const llmResult = await llmFallback(message, fastResult, entities);
    if (llmResult && llmResult.confidence > confidence) {
      fastResult.intent = llmResult.intent;
      confidence = llmResult.confidence;
      llmUsed = true;
    }
  }
  
  // Select workflow
  const { workflow, reasoning } = selectWorkflow(
    fastResult.intent,
    entities,
    confidence
  );
  
  // Build result
  const result = {
    timestamp,
    message,
    normalizedMessage,
    intent: fastResult.intent || INTENTS.CLARIFY,
    confidence: Math.round(confidence),
    entities,
    suggestedWorkflow: workflow,
    reasoning,
    matchedPatterns: fastResult.matchedPatterns,
    llmUsed,
    isCompound: false,
  };
  
  // NEW: Check for compound intent (Proposal #1)
  if (compoundResult) {
    result.isCompound = true;
    result.compoundType = compoundResult.type;
    result.suggestedWorkflow = WORKFLOWS.GSD_RALPH_FULL;
    result.reasoning = 'Compound intent detected - requires both GSD planning and Ralph execution';
  }
  
  return result;
}

/**
 * Load configuration
 */
function loadConfig() {
  const configPath = path.join(__dirname, '../memory/ouroboros-config.json');
  
  try {
    const data = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {
      intent_detection: {
        min_confidence_threshold: 40,
        use_llm_fallback: true,
        llm_fallback_threshold: 50, // Proposal #5: Lowered from 40
        log_all_detections: true,
      },
      workflow_routing: {
        auto_execute: false,
        require_confirmation: true,
        default_workflow: 'clarify',
      },
      audit: {
        max_log_entries: 10000,
        log_path: 'memory/ouroboros-decisions.jsonl',
      },
    };
  }
}

/**
 * NEW: Progress tracking initialization (Proposal #7)
 */
function initializeProgressTracking(workflowId, initialState) {
  const PROGRESS_LOG = path.join(__dirname, '../memory/progress-tracking.jsonl');
  
  const progressEntry = {
    workflowId,
    state: initialState,
    timestamp: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    milestones: []
  };
  
  try {
    fs.appendFileSync(PROGRESS_LOG, JSON.stringify(progressEntry) + '\n');
  } catch (err) {
    // File might not exist, create it
    fs.writeFileSync(PROGRESS_LOG, JSON.stringify(progressEntry) + '\n');
  }
}

/**
 * NEW: Suggestion feedback prompts (Proposal #8)
 */
function promptFeedback(suggestion) {
  const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return {
    ...suggestion,
    feedbackPrompt: `Was this helpful? Reply with /ouroboros:feedback ${feedbackId} <accepted|rejected> [reason]`,
    feedbackId
  };
}

/**
 * CLI Interface
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Ouroboros Intent Detector (v0.3)

Usage:
  node intent-detector.js <message>
  node intent-detector.js --explain <message>

Options:
  --explain    Show detailed reasoning
  --no-cache   Skip cache lookup
  --help, -h   Show this help message

Examples:
  node intent-detector.js "Build a React auth system"
  node intent-detector.js --explain "Fix the TypeScript error in auth.ts"

Auto-Applied Improvements (v0.3):
  ✓ Mixed intent detection
  ✓ LLM fallback (50% threshold)
  ✓ Urgency normalization
  ✓ Quick workflow boosts
  ✓ Decision patterns enhanced
  ✓ Context caching (5-min TTL)
  ✓ Architecture keyword boost
`);
    process.exit(0);
  }
  
  const explain = args.includes('--explain');
  const noCache = args.includes('--no-cache');
  const message = args.filter(arg => !arg.startsWith('--')).join(' ');
  
  if (!message) {
    console.error('Error: No message provided');
    process.exit(1);
  }
  
  const result = detectIntent(message, { noCache });
  const config = loadConfig();
  
  if (explain) {
    console.log('\n=== Intent Detection Result (v0.3) ===\n');
    console.log(`Message: "${result.message}"`);
    if (result.normalizedMessage !== result.message) {
      console.log(`Normalized: "${result.normalizedMessage}"`);
    }
    console.log(`\nIntent: ${result.intent}`);
    console.log(`Confidence: ${result.confidence}%`);
    console.log(`Workflow: ${result.suggestedWorkflow}\n`);
    console.log(`Reasoning: ${result.reasoning}\n`);
    
    if (result.isCompound) {
      console.log(`⚡ Compound Intent Detected: ${result.compoundType}`);
    }
    
    if (result.llmUsed) {
      console.log(`🤖 LLM Fallback Used: Yes`);
    }
    
    if (result.cached) {
      console.log(`💾 Cached Result: Yes`);
    }
    
    if (Object.keys(result.entities).length > 0) {
      console.log('\nEntities:');
      for (const [key, value] of Object.entries(result.entities)) {
        console.log(`  ${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
      }
      console.log();
    }
    
    if (result.matchedPatterns.length > 0) {
      console.log(`Matched Patterns: ${result.matchedPatterns.join(', ')}`);
    }
    
    if (result.confidence < config.intent_detection.min_confidence_threshold) {
      console.log(`\n⚠️  Confidence below threshold (${config.intent_detection.min_confidence_threshold}%)`);
    }
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}

// Export for use as module
if (require.main === module) {
  main();
} else {
  module.exports = {
    detectIntent,
    loadConfig,
    initializeProgressTracking,
    promptFeedback,
    normalizeMessage,
    detectCompoundIntent,
    INTENTS,
    WORKFLOWS,
  };
}
