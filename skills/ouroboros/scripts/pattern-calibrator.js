#!/usr/bin/env node

/**
 * Ouroboros Pattern Calibrator (Phase 4 - Self-Improvement)
 * 
 * Pattern weight tuning and confidence calibration:
 * - Add pattern weight tuning (confidence score adjustments)
 * - Calibrate keyword/pattern matching based on actual usage
 * - Add fallback logic when confidence is borderline
 * 
 * Usage:
 *   node pattern-calibrator.js calibrate <message> <detected-intent> <confidence>
 *   node pattern-calibrator.js evaluate <message>
 *   node pattern-calibrator.js boost <pattern> <amount>
 *   node pattern-calibrator.js fallback-status
 *   node pattern-calibrator.js reset
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, '../memory');
const PATTERN_CALIBRATION_FILE = path.join(__dirname, '../memory/pattern-calibration.json');
const USAGE_STATS_FILE = path.join(__dirname, '../memory/pattern-usage-stats.jsonl');
const FEEDBACK_LOG = path.join(MEMORY_DIR, 'ouroboros-feedback.jsonl');

// Confidence thresholds
const CONFIDENCE = {
  VERY_LOW: 30,
  LOW: 45,
  BORDERLINE: 55,
  HIGH: 75,
  VERY_HIGH: 90,
};

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

/**
 * Ensure files exist
 */
function ensureFiles() {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(PATTERN_CALIBRATION_FILE)) {
    fs.writeFileSync(PATTERN_CALIBRATION_FILE, JSON.stringify(getDefaultCalibration(), null, 2), 'utf8');
  }
  
  if (!fs.existsSync(USAGE_STATS_FILE)) {
    fs.writeFileSync(USAGE_STATS_FILE, '', 'utf8');
  }
}

/**
 * Default calibration settings
 */
function getDefaultCalibration() {
  return {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    thresholds: {
      veryLow: CONFIDENCE.VERY_LOW,
      low: CONFIDENCE.LOW,
      borderline: CONFIDENCE.BORDERLINE,
      high: CONFIDENCE.HIGH,
      veryHigh: CONFIDENCE.VERY_HIGH,
      llmFallback: CONFIDENCE.BORDERLINE, // Trigger LLM below this
      autoApprove: CONFIDENCE.VERY_HIGH,  // Auto-approve above this
    },
    patternWeights: {
      // Build-related patterns
      'build': 20,
      'create': 20,
      'implement': 20,
      'develop': 20,
      'make': 15,
      'from_scratch': 25,
      'new_project': 20,
      'scaffold': 20,
      
      // Fix-related patterns
      'fix': 25,
      'debug': 20,
      'resolve': 20,
      'solve': 20,
      'error': 15,
      'bug': 20,
      'broken': 15,
      'not_working': 20,
      
      // Extend patterns
      'add': 15,
      'extend': 20,
      'enhance': 20,
      'update': 15,
      'modify': 15,
      'change': 10,
      
      // Discuss patterns
      'which': 15,
      'should': 15,
      'better': 15,
      'compare': 20,
      'pros_cons': 25,
      'architecture': 20,
      'design': 15,
      
      // Optimize patterns
      'optimize': 25,
      'refactor': 25,
      'performance': 20,
      'faster': 20,
      'improve': 15,
      'clean': 15,
      
      // Research patterns
      'research': 25,
      'investigate': 25,
      'explore': 20,
      'learn': 15,
      'how': 10,
      'what': 10,
      
      // Quick task patterns
      'button': 15,
      'field': 15,
      'text': 10,
      'typo': 20,
      'small': 15,
      'quick': 15,
      'simple': 15,
      'minor': 15,
      
      // Complexity indicators
      'system': 15,
      'platform': 15,
      'fullstack': 20,
      'multiple': 15,
      'scalable': 15,
      'production': 15,
      'authentication': 15,
      'feature': 10,
      'component': 10,
      'module': 10,
    },
    fallbackBehavior: {
      enableBorderslineLLM: true,
      borderlineAction: 'clarify', // 'clarify', 'llm', 'default'
      enableMultiPass: true,
      maxPasses: 2,
    },
    calibrationHistory: [],
  };
}

/**
 * Load calibration settings
 */
function loadCalibration() {
  ensureFiles();
  try {
    const data = fs.readFileSync(PATTERN_CALIBRATION_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return getDefaultCalibration();
  }
}

/**
 * Save calibration settings
 */
function saveCalibration(calibration) {
  ensureFiles();
  calibration.lastUpdated = new Date().toISOString();
  fs.writeFileSync(PATTERN_CALIBRATION_FILE, JSON.stringify(calibration, null, 2), 'utf8');
}

/**
 * Record pattern usage for calibration
 */
function recordUsage(message, detectedIntent, confidence, actualOutcome = null) {
  ensureFiles();
  
  const stats = {
    timestamp: new Date().toISOString(),
    message: message.substring(0, 200),
    detectedIntent,
    confidence,
    actualOutcome, // 'success', 'failed', or null if unknown
  };
  
  fs.appendFileSync(USAGE_STATS_FILE, JSON.stringify(stats) + '\n', 'utf8');
  
  return stats;
}

/**
 * Evaluate confidence level
 */
function evaluateConfidenceLevel(confidence) {
  const calibration = loadCalibration();
  const thresholds = calibration.thresholds;
  
  if (confidence >= thresholds.veryHigh) {
    return { level: 'very_high', action: 'auto_approve', color: '🟢' };
  } else if (confidence >= thresholds.high) {
    return { level: 'high', action: 'approve', color: '🟢' };
  } else if (confidence >= thresholds.borderline) {
    return { level: 'borderline', action: calibration.fallbackBehavior.borderlineAction, color: '🟡' };
  } else if (confidence >= thresholds.low) {
    return { level: 'low', action: 'llm_fallback', color: '🟠' };
  } else {
    return { level: 'very_low', action: 'clarify', color: '🔴' };
  }
}

/**
 * Get fallback recommendation for borderline confidence
 */
function getFallbackRecommendation(message, currentIntent, confidence) {
  const calibration = loadCalibration();
  
  const result = {
    confidence,
    level: evaluateConfidenceLevel(confidence),
    recommendations: [],
  };
  
  if (confidence < calibration.thresholds.veryLow) {
    result.recommendations.push({
      action: 'clarify',
      reason: 'Confidence too low - ask user for clarification',
    });
  }
  
  if (confidence < calibration.thresholds.high && calibration.fallbackBehavior.enableBorderslineLLM) {
    result.recommendations.push({
      action: 'llm_fallback',
      reason: 'Confidence below threshold - use LLM for better classification',
    });
  }
  
  // Check for common ambiguous patterns
  const ambiguousPatterns = [
    { pattern: /\b(add|create|build)\s+(a|an|the)?\s*\w+\s+(and|or)\s+\w+/i, hint: 'Compound intent detected - consider splitting into two requests' },
    { pattern: /\b(help|check|review)\s+(my|the)\s+\w+/i, hint: 'Ambiguous - ask what specific action is needed' },
    { pattern: /\b(make|suggest|recommend)\s+\w+/i, hint: 'Unclear intent - ask for more details' },
  ];
  
  for (const { pattern, hint } of ambiguousPatterns) {
    if (pattern.test(message)) {
      result.recommendations.push({
        action: 'clarify',
        reason: hint,
        matchedPattern: pattern.toString(),
      });
    }
  }
  
  // Suggest alternative intents based on message analysis
  const alternatives = suggestAlternativeIntents(message);
  if (alternatives.length > 0 && alternatives[0].intent !== currentIntent) {
    result.alternatives = alternatives.slice(0, 3);
  }
  
  return result;
}

/**
 * Suggest alternative intents for a message
 */
function suggestAlternativeIntents(message) {
  const calibration = loadCalibration();
  const weights = calibration.patternWeights;
  
  const scores = {};
  const lowerMessage = message.toLowerCase();
  
  // Score each intent category
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    let score = 0;
    let matchedPatterns = [];
    
    for (const [patternName, pattern] of Object.entries(patterns)) {
      if (pattern.test(lowerMessage)) {
        score += weights[patternName] || 10;
        matchedPatterns.push(patternName);
      }
    }
    
    if (score > 0) {
      scores[intent] = { score, matchedPatterns };
    }
  }
  
  return Object.entries(scores)
    .sort((a, b) => b[1].score - a[1].score)
    .map(([intent, data]) => ({
      intent,
      score: data.score,
      matchedPatterns: data.matchedPatterns,
    }));
}

// Intent pattern definitions for alternative detection
const INTENT_PATTERNS = {
  [INTENTS.CREATE_PROJECT]: {
    build: /\b(build|create|make)\b/i,
    from_scratch: /\bfrom\s+scratch\b/i,
    new_project: /\bnew\s+project\b/i,
    scaffold: /\bscaffold\b/i,
  },
  [INTENTS.EXTEND_FEATURE]: {
    add: /\b(add|extend|enhance)\b/i,
    feature: /\bfeature|capability\b/i,
    update: /\bupdate|modify\b/i,
  },
  [INTENTS.DEBUG_FIX]: {
    fix: /\bfix|debug\b/i,
    error: /\berror|bug|broken\b/i,
    not_working: /\bnot\s+working\b/i,
  },
  [INTENTS.DISCUSS_DECISION]: {
    which: /\bwhich|should\b/i,
    better: /\bbetter|compare\b/i,
    pros_cons: /\bpros\s+and\s+cons\b/i,
    architecture: /\barchitecture|design\b/i,
  },
  [INTENTS.OPTIMIZE]: {
    optimize: /\boptimize|refactor\b/i,
    performance: /\bperformance|speed\b/i,
    improve: /\bimprove|better\b/i,
  },
  [INTENTS.RESEARCH]: {
    research: /\bresearch|investigate\b/i,
    explore: /\bexplore|learn\b/i,
    how: /\bhow|what\b/i,
  },
  [INTENTS.QUICK_TASK]: {
    small: /\bsmall|quick|simple\b/i,
    button: /\bbutton|field|input\b/i,
    typo: /\btypo|spelling\b/i,
    minor: /\bminor|tiny\b/i,
  },
};

/**
 * Calibrate pattern based on usage feedback
 */
function calibratePattern(patternName, outcome) {
  const calibration = loadCalibration();
  const weights = calibration.patternWeights;
  
  const currentWeight = weights[patternName] || 10;
  let adjustment = 0;
  
  // Adjust based on outcome
  if (outcome === 'success') {
    adjustment = 2; // Increase weight for successful patterns
  } else if (outcome === 'failed') {
    adjustment = -2; // Decrease weight for failed patterns
  } else if (outcome === 'partial') {
    adjustment = 0; // No change for partial
  }
  
  const newWeight = Math.max(5, Math.min(30, currentWeight + adjustment));
  weights[patternName] = newWeight;
  
  // Record calibration history
  calibration.calibrationHistory.push({
    timestamp: new Date().toISOString(),
    pattern: patternName,
    from: currentWeight,
    to: newWeight,
    adjustment,
    outcome,
  });
  
  // Keep only last 100 calibration events
  if (calibration.calibrationHistory.length > 100) {
    calibration.calibrationHistory = calibration.calibrationHistory.slice(-100);
  }
  
  saveCalibration(calibration);
  
  return {
    pattern: patternName,
    from: currentWeight,
    to: newWeight,
    adjustment,
  };
}

/**
 * Apply boost to a pattern
 */
function boostPattern(patternName, amount) {
  const calibration = loadCalibration();
  const currentWeight = calibration.patternWeights[patternName] || 10;
  const newWeight = Math.max(5, Math.min(50, currentWeight + amount));
  
  calibration.patternWeights[patternName] = newWeight;
  
  calibration.calibrationHistory.push({
    timestamp: new Date().toISOString(),
    pattern: patternName,
    type: 'manual_boost',
    from: currentWeight,
    to: newWeight,
    amount,
  });
  
  saveCalibration(calibration);
  
  return {
    pattern: patternName,
    previousWeight: currentWeight,
    newWeight,
    adjustment: amount,
  };
}

/**
 * Get pattern usage statistics
 */
function getUsageStats(days = 7) {
  ensureFiles();
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  let total = 0;
  let byIntent = {};
  let byConfidence = { very_low: 0, low: 0, borderline: 0, high: 0, very_high: 0 };
  let successes = 0;
  let failures = 0;
  
  try {
    const lines = fs.readFileSync(USAGE_STATS_FILE, 'utf8').trim().split('\n').filter(Boolean);
    
    for (const line of lines) {
      const stat = JSON.parse(line);
      if (new Date(stat.timestamp) < cutoffDate) continue;
      
      total++;
      
      // By intent
      const intent = stat.detectedIntent || 'unknown';
      if (!byIntent[intent]) byIntent[intent] = 0;
      byIntent[intent]++;
      
      // By confidence level
      const level = evaluateConfidenceLevel(stat.confidence).level;
      byConfidence[level]++;
      
      // Outcomes
      if (stat.actualOutcome === 'success') successes++;
      else if (stat.actualOutcome === 'failed') failures++;
    }
  } catch (err) {
    // File might be empty
  }
  
  return {
    period: `${days} days`,
    total,
    byIntent,
    byConfidence,
    successRate: total > 0 ? ((successes / (successes + failures || 1)) * 100).toFixed(1) : 0,
    feedbackCount: successes + failures,
  };
}

/**
 * Reset calibration to defaults
 */
function resetCalibration() {
  const defaultCalibration = getDefaultCalibration();
  saveCalibration(defaultCalibration);
  
  return {
    success: true,
    message: 'Calibration reset to defaults',
    calibration: defaultCalibration,
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
Ouroboros Pattern Calibrator

Usage:
  node pattern-calibrator.js calibrate <message> <intent> <confidence> [outcome]
  node pattern-calibrator.js evaluate <message> <confidence>
  node pattern-calibrator.js fallback <message> <intent> <confidence>
  node pattern-calibrator.js alternatives <message>
  node pattern-calibrator.js boost <pattern> <amount>
  node pattern-calibrator.js calibrate-pattern <pattern-name> <success|failed|partial>
  node pattern-calibrator.js stats [--days N]
  node pattern-calibrator.js reset

Confidence Levels:
  0-30:  very_low  (🔴) - Require clarification
  31-45: low       (🟠) - Use LLM fallback
  46-55: borderline(🟡) - Apply fallback behavior
  56-75: high     (🟢) - Approve
  76-100: very_high(🟢) - Auto-approve

Examples:
  node pattern-calibrator.js calibrate "Build a React app" create_project 75 success
  node pattern-calibrator.js evaluate "Fix the bug" 45
  node pattern-calibrator.js fallback "Add OAuth and fix bugs" create_project 40
  node pattern-calibrator.js alternatives "Should I use React or Vue?"
  node pattern-calibrator.js boost build 5
  node pattern-calibrator.js calibrate-pattern fix success
  node pattern-calibrator.js stats --days 14
  node pattern-calibrator.js reset
`);
    process.exit(0);
  }
  
  switch (command) {
    case 'calibrate': {
      const [, message, intent, confidence, outcome] = args;
      if (!message || !intent || !confidence) {
        console.error('Error: Message, intent, and confidence required');
        process.exit(1);
      }
      
      const result = recordUsage(message, intent, parseInt(confidence), outcome || null);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    
    case 'evaluate': {
      const [, message, confidence] = args;
      if (!message || confidence === undefined) {
        console.error('Error: Message and confidence required');
        process.exit(1);
      }
      
      const result = evaluateConfidenceLevel(parseInt(confidence));
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    
    case 'fallback': {
      const [, message, intent, confidence] = args;
      if (!message || !intent || !confidence) {
        console.error('Error: Message, intent, and confidence required');
        process.exit(1);
      }
      
      const result = getFallbackRecommendation(message, intent, parseInt(confidence));
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    
    case 'alternatives': {
      const message = args.slice(1).join(' ');
      if (!message) {
        console.error('Error: Message required');
        process.exit(1);
      }
      
      const result = suggestAlternativeIntents(message);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    
    case 'boost': {
      const [, patternName, amount] = args;
      if (!patternName || amount === undefined) {
        console.error('Error: Pattern name and amount required');
        process.exit(1);
      }
      
      const result = boostPattern(patternName, parseInt(amount));
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    
    case 'calibrate-pattern': {
      const [, patternName, outcome] = args;
      if (!patternName || !outcome) {
        console.error('Error: Pattern name and outcome required');
        process.exit(1);
      }
      
      const result = calibratePattern(patternName, outcome);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    
    case 'stats': {
      const daysArg = args.find(arg => arg.startsWith('--days'))?.split(' ')[1];
      const days = daysArg ? parseInt(daysArg) : 7;
      const stats = getUsageStats(days);
      console.log(JSON.stringify(stats, null, 2));
      break;
    }
    
    case 'reset': {
      const result = resetCalibration();
      console.log(JSON.stringify(result, null, 2));
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
    recordUsage,
    evaluateConfidenceLevel,
    getFallbackRecommendation,
    suggestAlternativeIntents,
    calibratePattern,
    boostPattern,
    getUsageStats,
    resetCalibration,
    loadCalibration,
    saveCalibration,
    CONFIDENCE,
    INTENTS,
  };
}
