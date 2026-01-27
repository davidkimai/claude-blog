#!/usr/bin/env node

/**
 * Ouroboros Feedback Learning System (Phase 4 - Self-Improvement)
 * 
 * Self-improving feedback mechanism:
 * - Collect user ratings on workflow selections
 * - Store feedback in ouroboros-feedback.jsonl
 * - Auto-adjust intent detection weights based on successful/failed predictions
 * - Track pattern success rates over time
 * 
 * Usage:
 *   node feedback-learner.js rate <decision-id> <rating> [notes]
 *   node feedback-learner.js analyze [--days N]
 *   node feedback-learner.js adjust-weights
 *   node feedback-learner.js stats
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, '../memory');
const FEEDBACK_LOG = path.join(MEMORY_DIR, 'ouroboros-feedback.jsonl');
const EFFECTIVENESS_LOG = path.join(MEMORY_DIR, 'ouroboros-effectiveness.jsonl');
const PATTERN_WEIGHTS_FILE = path.join(__dirname, '../memory/pattern-weights.json');
const DECISIONS_LOG = path.join(__dirname, '../memory/ouroboros-decisions.jsonl');

// Rating constants
const RATINGS = {
  EXCELLENT: 5,
  GOOD: 4,
  ACCEPTABLE: 3,
  POOR: 2,
  FAILED: 1,
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

// Workflow types
const WORKFLOWS = {
  GSD_RALPH_FULL: 'gsd-ralph-full',
  GSD_ONLY: 'gsd-only',
  RALPH_ONLY: 'ralph-only',
  QUICK: 'quick',
  RESEARCH: 'research',
  CLARIFY: 'clarify',
};

/**
 * Ensure log files exist
 */
function ensureLogFiles() {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(FEEDBACK_LOG)) {
    fs.writeFileSync(FEEDBACK_LOG, '', 'utf8');
  }
  
  if (!fs.existsSync(EFFECTIVENESS_LOG)) {
    fs.writeFileSync(EFFECTIVENESS_LOG, '', 'utf8');
  }
}

/**
 * Load pattern weights (adaptive)
 */
function loadPatternWeights() {
  try {
    const data = fs.readFileSync(PATTERN_WEIGHTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // Default weights
    return {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      intentWeights: {
        create_project: 1.0,
        extend_feature: 1.0,
        debug_fix: 1.0,
        discuss_decision: 1.0,
        optimize: 1.0,
        research: 1.0,
        quick_task: 1.0,
        clarify: 1.0,
      },
      patternBoost: {
        'build_a': 15,
        'create_a': 15,
        'fix_the': 20,
        'which_better': 15,
        'quick_boost': 10,
      },
      workflowSuccessRates: {},
    };
  }
}

/**
 * Save pattern weights
 */
function savePatternWeights(weights) {
  weights.lastUpdated = new Date().toISOString();
  fs.writeFileSync(PATTERN_WEIGHTS_FILE, JSON.stringify(weights, null, 2), 'utf8');
}

/**
 * Get decision by ID from log
 */
function getDecisionById(decisionId) {
  try {
    const lines = fs.readFileSync(DECISIONS_LOG, 'utf8').trim().split('\n').filter(Boolean);
    const decisions = lines.map(line => JSON.parse(line));
    return decisions.find(d => d._id === decisionId || d.timestamp === decisionId);
  } catch (err) {
    return null;
  }
}

/**
 * Rate a workflow decision
 */
function rateDecision(decisionId, rating, notes = '') {
  ensureLogFiles();
  
  // Validate rating
  const validRatings = Object.values(RATINGS);
  if (!validRatings.includes(rating) && !validRatings.includes(parseInt(rating))) {
    return {
      success: false,
      error: `Invalid rating. Must be one of: ${validRatings.join(', ')}`,
    };
  }
  
  const numericRating = parseInt(rating);
  
  // Get the original decision
  const decision = getDecisionById(decisionId);
  if (!decision) {
    return {
      success: false,
      error: `Decision ${decisionId} not found`,
    };
  }
  
  // Create feedback record
  const feedback = {
    id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    decisionTimestamp: decision.timestamp,
    message: decision.message,
    intent: decision.intent,
    confidence: decision.confidence,
    suggestedWorkflow: decision.suggestedWorkflow,
    actualOutcome: numericRating >= 3 ? 'success' : 'failed',
    rating: numericRating,
    ratingLabel: Object.entries(RATINGS).find(([k, v]) => v === numericRating)?.[0] || 'UNKNOWN',
    notes,
    metadata: {
      patternMatches: decision.matchedPatterns || [],
      entities: decision.entities || {},
    },
  };
  
  // Append to feedback log
  fs.appendFileSync(FEEDBACK_LOG, JSON.stringify(feedback) + '\n', 'utf8');
  
  // Update effectiveness metrics
  updateEffectivenessMetrics(feedback);
  
  return {
    success: true,
    feedback,
    message: 'Feedback recorded. Intent detection weights will be adjusted.',
  };
}

/**
 * Update effectiveness metrics based on feedback
 */
function updateEffectivenessMetrics(feedback) {
  ensureLogFiles();
  
  const { intent, suggestedWorkflow, actualOutcome, rating } = feedback;
  const key = `${intent}:${suggestedWorkflow}`;
  
  // Read existing effectiveness data
  let effectivenessData = {};
  try {
    const lines = fs.readFileSync(EFFECTIVENESS_LOG, 'utf8').trim().split('\n').filter(Boolean);
    lines.forEach(line => {
      const record = JSON.parse(line);
      const eKey = `${record.intent}:${record.workflow}`;
      if (!effectivenessData[eKey]) {
        effectivenessData[eKey] = {
          intent: record.intent,
          workflow: record.workflow,
          total: 0,
          successes: 0,
          totalRating: 0,
          confidenceSum: 0,
          lastUpdated: record.timestamp,
        };
      }
      effectivenessData[eKey].total++;
      if (actualOutcome === 'success') {
        effectivenessData[eKey].successes++;
      }
      effectivenessData[eKey].totalRating += rating;
      effectivenessData[eKey].confidenceSum += feedback.confidence;
      effectivenessData[eKey].lastUpdated = record.timestamp;
    });
  } catch (err) {
    // File might be empty
  }
  
  // Update or create entry
  if (!effectivenessData[key]) {
    effectivenessData[key] = {
      intent,
      workflow: suggestedWorkflow,
      total: 0,
      successes: 0,
      totalRating: 0,
      confidenceSum: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
  
  effectivenessData[key].total++;
  if (actualOutcome === 'success') {
    effectivenessData[key].successes++;
  }
  effectivenessData[key].totalRating += rating;
  effectivenessData[key].confidenceSum += feedback.confidence;
  effectivenessData[key].lastUpdated = new Date().toISOString();
  
  // Write updated effectiveness log
  const logLines = Object.values(effectivenessData).map(d => JSON.stringify(d));
  fs.writeFileSync(EFFECTIVENESS_LOG, logLines.join('\n') + '\n', 'utf8');
}

/**
 * Analyze feedback and generate insights
 */
function analyzeFeedback(options = {}) {
  const { days = 7 } = options;
  ensureLogFiles();
  
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  try {
    const lines = fs.readFileSync(FEEDBACK_LOG, 'utf8').trim().split('\n').filter(Boolean);
    const feedback = lines
      .map(line => JSON.parse(line))
      .filter(f => new Date(f.timestamp) > cutoffDate);
    
    if (feedback.length === 0) {
      return {
        totalFeedback: 0,
        message: 'No feedback collected in the last ${days} days',
      };
    }
    
    // Calculate statistics
    const total = feedback.length;
    const successes = feedback.filter(f => f.actualOutcome === 'success').length;
    const avgRating = feedback.reduce((sum, f) => sum + f.rating, 0) / total;
    
    // Success rate by intent
    const intentStats = {};
    const workflowStats = {};
    const patternStats = {};
    
    for (const f of feedback) {
      // Intent stats
      if (!intentStats[f.intent]) {
        intentStats[f.intent] = { total: 0, successes: 0, avgRating: 0 };
      }
      intentStats[f.intent].total++;
      if (f.actualOutcome === 'success') {
        intentStats[f.intent].successes++;
      }
      
      // Workflow stats
      if (!workflowStats[f.suggestedWorkflow]) {
        workflowStats[f.suggestedWorkflow] = { total: 0, successes: 0, avgRating: 0 };
      }
      workflowStats[f.suggestedWorkflow].total++;
      if (f.actualOutcome === 'success') {
        workflowStats[f.suggestedWorkflow].successes++;
      }
      
      // Pattern stats
      for (const pattern of f.metadata?.patternMatches || []) {
        if (!patternStats[pattern]) {
          patternStats[pattern] = { total: 0, successes: 0 };
        }
        patternStats[pattern].total++;
        if (f.actualOutcome === 'success') {
          patternStats[pattern].successes++;
        }
      }
    }
    
    // Calculate averages
    for (const intent of Object.keys(intentStats)) {
      intentStats[intent].avgRating = intentStats[intent].total > 0
        ? (intentStats[intent].totalRating || intentStats[intent].avgRating) / intentStats[intent].total
        : 0;
    }
    for (const workflow of Object.keys(workflowStats)) {
      workflowStats[workflow].avgRating = workflowStats[workflow].total > 0
        ? workflowStats[workflow].totalRating || workflowStats[workflow].avgRating / workflowStats[workflow].total
        : 0;
    }
    
    return {
      period: `${days} days`,
      totalFeedback: total,
      successRate: ((successes / total) * 100).toFixed(1),
      avgRating: avgRating.toFixed(2),
      intentStats,
      workflowStats,
      patternStats: Object.fromEntries(
        Object.entries(patternStats)
          .map(([k, v]) => [k, { ...v, successRate: (v.successes / v.total * 100).toFixed(1) }])
          .sort((a, b) => b[1].total - a[1].total)
          .slice(0, 20)
      ),
    };
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Adjust pattern weights based on feedback analysis
 */
function adjustPatternWeights() {
  ensureLogFiles();
  
  const weights = loadPatternWeights();
  const analysis = analyzeFeedback({ days: 30 });
  
  if (analysis.error || analysis.totalFeedback === 0) {
    return {
      success: false,
      message: 'Insufficient feedback data to adjust weights',
    };
  }
  
  const adjustments = [];
  
  // Adjust intent weights based on success rates
  for (const [intent, stats] of Object.entries(analysis.intentStats || {})) {
    const successRate = (stats.successes / stats.total) * 100;
    const currentWeight = weights.intentWeights[intent] || 1.0;
    
    if (successRate < 50 && currentWeight > 0.5) {
      // Low success rate - reduce weight
      const newWeight = Math.max(0.5, currentWeight - 0.1);
      weights.intentWeights[intent] = newWeight;
      adjustments.push({
        intent,
        from: currentWeight,
        to: newWeight,
        reason: `Low success rate (${successRate.toFixed(1)}%)`,
      });
    } else if (successRate > 80 && currentWeight < 1.5) {
      // High success rate - increase weight
      const newWeight = Math.min(1.5, currentWeight + 0.1);
      weights.intentWeights[intent] = newWeight;
      adjustments.push({
        intent,
        from: currentWeight,
        to: newWeight,
        reason: `High success rate (${successRate.toFixed(1)}%)`,
      });
    }
  }
  
  // Adjust pattern boosts based on success rates
  for (const [pattern, stats] of Object.entries(analysis.patternStats || {})) {
    const successRate = (stats.successes / stats.total) * 100;
    const currentBoost = weights.patternBoost[pattern] || 10;
    
    if (successRate < 50 && currentBoost > 5) {
      const newBoost = Math.max(5, currentBoost - 2);
      weights.patternBoost[pattern] = newBoost;
      adjustments.push({
        pattern,
        from: currentBoost,
        to: newBoost,
        reason: `Pattern "${pattern}" low success (${successRate.toFixed(1)}%)`,
      });
    } else if (successRate > 80 && currentBoost < 25) {
      const newBoost = Math.min(25, currentBoost + 2);
      weights.patternBoost[pattern] = newBoost;
      adjustments.push({
        pattern,
        from: currentBoost,
        to: newBoost,
        reason: `Pattern "${pattern}" high success (${successRate.toFixed(1)}%)`,
      });
    }
  }
  
  // Track workflow success rates
  weights.workflowSuccessRates = {};
  for (const [workflow, stats] of Object.entries(analysis.workflowStats || {})) {
    weights.workflowSuccessRates[workflow] = {
      successRate: stats.total > 0 ? (stats.successes / stats.total * 100).toFixed(1) : 0,
      totalUses: stats.total,
    };
  }
  
  savePatternWeights(weights);
  
  return {
    success: true,
    adjustments,
    weights: {
      intentWeights: weights.intentWeights,
      patternBoost: weights.patternBoost,
      workflowSuccessRates: weights.workflowSuccessRates,
    },
  };
}

/**
 * Get workflow effectiveness for specific intent
 */
function getWorkflowEffectiveness(intent) {
  try {
    const lines = fs.readFileSync(EFFECTIVENESS_LOG, 'utf8').trim().split('\n').filter(Boolean);
    const records = lines.map(line => JSON.parse(line));
    
    return records
      .filter(r => r.intent === intent)
      .sort((a, b) => (b.successes / b.total) - (a.successes / a.total))
      .map(r => ({
        workflow: r.workflow,
        successRate: r.total > 0 ? ((r.successes / r.total) * 100).toFixed(1) : 0,
        totalUses: r.total,
        avgRating: r.total > 0 ? (r.totalRating / r.total).toFixed(2) : 0,
        avgConfidence: r.total > 0 ? (r.confidenceSum / r.total).toFixed(1) : 0,
      }));
  } catch (err) {
    return [];
  }
}

/**
 * Suggest optimal workflow based on historical success
 */
function suggestOptimalWorkflow(intent) {
  const effectiveness = getWorkflowEffectiveness(intent);
  
  if (effectiveness.length === 0) {
    return {
      intent,
      suggestedWorkflow: null,
      message: 'No historical data - learn by collecting feedback',
      effectiveness: [],
    };
  }
  
  const sorted = effectiveness.sort((a, b) => parseFloat(b.successRate) - parseFloat(a.successRate));
  const best = sorted[0];
  
  return {
    intent,
    suggestedWorkflow: best.workflow,
    successRate: best.successRate,
    totalUses: best.totalUses,
    alternatives: sorted.slice(1, 3),
    effectiveness,
  };
}

/**
 * Generate overall statistics
 */
function generateStats() {
  ensureLogFiles();
  
  const feedbackAnalysis = analyzeFeedback({ days: 30 });
  const weights = loadPatternWeights();
  
  let totalFeedback = 0;
  let successCount = 0;
  let ratingSum = 0;
  
  try {
    const lines = fs.readFileSync(FEEDBACK_LOG, 'utf8').trim().split('\n').filter(Boolean);
    totalFeedback = lines.length;
    
    for (const line of lines) {
      const f = JSON.parse(line);
      if (f.actualOutcome === 'success') successCount++;
      ratingSum += f.rating || 0;
    }
  } catch (err) {
    // File might be empty
  }
  
  return {
    totalFeedback,
    successRate: totalFeedback > 0 ? ((successCount / totalFeedback) * 100).toFixed(1) : 0,
    avgRating: totalFeedback > 0 ? (ratingSum / totalFeedback).toFixed(2) : 0,
    patternWeightsVersion: weights.version,
    lastWeightUpdate: weights.lastUpdated,
    topWorkflows: Object.entries(weights.workflowSuccessRates || {})
      .sort((a, b) => parseFloat(b[1].successRate) - parseFloat(a[1].successRate))
      .slice(0, 5)
      .map(([workflow, data]) => ({ workflow, ...data })),
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
Ouroboros Feedback Learning System

Usage:
  node feedback-learner.js rate <decision-id> <rating> [notes]
  node feedback-learner.js analyze [--days N]
  node feedback-learner.js adjust-weights
  node feedback-learner.js effectiveness <intent>
  node feedback-learner.js suggest-workflow <intent>
  node feedback-learner.js stats

Rating Scale:
  5 - Excellent (worked perfectly)
  4 - Good (worked well)
  3 - Acceptable (worked with minor issues)
  2 - Poor (had significant issues)
  1 - Failed (didn't work at all)

Examples:
  node feedback-learner.js rate "2025-01-27T04:22:14.905Z" 4 "Good match"
  node feedback-learner.js analyze --days 7
  node feedback-learner.js adjust-weights
  node feedback-learner.js effectiveness create_project
  node feedback-learner.js suggest-workflow debug_fix
  node feedback-learner.js stats
`);
    process.exit(0);
  }
  
  switch (command) {
    case 'rate': {
      const [, decisionId, rating, ...notesParts] = args;
      if (!decisionId || !rating) {
        console.error('Error: Decision ID and rating required');
        process.exit(1);
      }
      
      const notes = notesParts.join(' ');
      const result = rateDecision(decisionId, parseInt(rating), notes);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    
    case 'analyze': {
      const daysArg = args.find(arg => arg.startsWith('--days'))?.split(' ')[1];
      const days = daysArg ? parseInt(daysArg) : 7;
      const analysis = analyzeFeedback({ days });
      console.log(JSON.stringify(analysis, null, 2));
      break;
    }
    
    case 'adjust-weights': {
      const result = adjustPatternWeights();
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    
    case 'effectiveness': {
      const intent = args[1];
      if (!intent) {
        console.error('Error: Intent required');
        process.exit(1);
      }
      const effectiveness = getWorkflowEffectiveness(intent);
      console.log(JSON.stringify(effectiveness, null, 2));
      break;
    }
    
    case 'suggest-workflow': {
      const intent = args[1];
      if (!intent) {
        console.error('Error: Intent required');
        process.exit(1);
      }
      const suggestion = suggestOptimalWorkflow(intent);
      console.log(JSON.stringify(suggestion, null, 2));
      break;
    }
    
    case 'stats': {
      const stats = generateStats();
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
    rateDecision,
    analyzeFeedback,
    adjustPatternWeights,
    getWorkflowEffectiveness,
    suggestOptimalWorkflow,
    generateStats,
    loadPatternWeights,
    savePatternWeights,
    RATINGS,
    INTENTS,
    WORKFLOWS,
  };
}
