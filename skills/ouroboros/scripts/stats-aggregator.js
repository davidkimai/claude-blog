#!/usr/bin/env node

/**
 * Ouroboros Stats Aggregator (Phase 4 - Self-Improvement Dashboard)
 * 
 * Unified statistics and effectiveness metrics:
 * - Aggregate all Ouroboros metrics
 * - Display effectiveness tracking data
 * - Show self-improvement learning progress
 * - Command: /ouroboros:stats
 * 
 * Usage:
 *   node stats-aggregator.js all
 *   node stats-aggregator.js effectiveness
 *   node stats-aggregator.js feedback
 *   node stats-aggregator.js patterns
 *   node stats-aggregator.js workflows
 *   node stats-aggregator.js calibration
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, '../memory');
const DECISIONS_LOG = path.join(MEMORY_DIR, 'ouroboros-decisions.jsonl');
const FEEDBACK_LOG = path.join(MEMORY_DIR, 'ouroboros-feedback.jsonl');
const EFFECTIVENESS_LOG = path.join(MEMORY_DIR, 'ouroboros-effectiveness.jsonl');
const PATTERN_WEIGHTS_FILE = path.join(__dirname, '../memory/pattern-weights.json');
const PATTERN_CALIBRATION_FILE = path.join(__dirname, '../memory/pattern-calibration.json');
const CROSS_WORKFLOW_LOG = path.join(__dirname, '../memory/cross-workflow-learning.jsonl');
const PROACTIVE_SUGGESTIONS_LOG = path.join(__dirname, '../memory/proactive-suggestions.jsonl');
const SUGGESTION_FEEDBACK_LOG = path.join(__dirname, '../memory/suggestion-feedback.jsonl');

/**
 * Read JSONL file and return parsed objects
 */
function readJsonl(filePath, limit = 1000) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8').trim();
    if (!content) return [];
    return content.split('\n')
      .filter(Boolean)
      .slice(-limit)
      .map(line => JSON.parse(line));
  } catch (err) {
    return [];
  }
}

/**
 * Get decision statistics
 */
function getDecisionStats() {
  const decisions = readJsonl(DECISIONS_LOG, 1000);
  
  if (decisions.length === 0) {
    return { total: 0 };
  }
  
  // Intent distribution
  const intentCounts = {};
  const workflowCounts = {};
  let totalConfidence = 0;
  let llmUsed = 0;
  
  for (const d of decisions) {
    intentCounts[d.intent] = (intentCounts[d.intent] || 0) + 1;
    workflowCounts[d.suggestedWorkflow] = (workflowCounts[d.suggestedWorkflow] || 0) + 1;
    totalConfidence += d.confidence || 0;
    if (d.llmUsed) llmUsed++;
  }
  
  return {
    total: decisions.length,
    avgConfidence: (totalConfidence / decisions.length).toFixed(1),
    llmUsageRate: ((llmUsed / decisions.length) * 100).toFixed(1),
    intentDistribution: Object.fromEntries(
      Object.entries(intentCounts).sort((a, b) => b[1] - a[1])
    ),
    workflowDistribution: Object.fromEntries(
      Object.entries(workflowCounts).sort((a, b) => b[1] - a[1])
    ),
  };
}

/**
 * Get feedback statistics
 */
function getFeedbackStats() {
  const feedback = readJsonl(FEEDBACK_LOG, 500);
  
  if (feedback.length === 0) {
    return { total: 0 };
  }
  
  const ratings = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const outcomes = { success: 0, failed: 0 };
  const byIntent = {};
  const byWorkflow = {};
  
  for (const f of feedback) {
    ratings[f.rating] = (ratings[f.rating] || 0) + 1;
    if (f.actualOutcome) outcomes[f.actualOutcome] = (outcomes[f.actualOutcome] || 0) + 1;
    
    if (!byIntent[f.intent]) byIntent[f.intent] = { total: 0, successes: 0 };
    byIntent[f.intent].total++;
    if (f.actualOutcome === 'success') byIntent[f.intent].successes++;
    
    if (!byWorkflow[f.suggestedWorkflow]) byWorkflow[f.suggestedWorkflow] = { total: 0, successes: 0 };
    byWorkflow[f.suggestedWorkflow].total++;
    if (f.actualOutcome === 'success') byWorkflow[f.suggestedWorkflow].successes++;
  }
  
  const avgRating = Object.entries(ratings).reduce((sum, [rating, count]) => 
    sum + (parseInt(rating) * count), 0) / feedback.length;
  
  return {
    total: feedback.length,
    avgRating: avgRating.toFixed(2),
    successRate: ((outcomes.success / feedback.length) * 100).toFixed(1),
    ratingDistribution: ratings,
    outcomes,
    topIntents: Object.entries(byIntent)
      .map(([intent, stats]) => ({
        intent,
        ...stats,
        successRate: (stats.successes / stats.total * 100).toFixed(1),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5),
    topWorkflows: Object.entries(byWorkflow)
      .map(([workflow, stats]) => ({
        workflow,
        ...stats,
        successRate: (stats.successes / stats.total * 100).toFixed(1),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5),
  };
}

/**
 * Get effectiveness metrics
 */
function getEffectivenessStats() {
  const effectiveness = readJsonl(EFFECTIVENESS_LOG, 500);
  
  if (effectiveness.length === 0) {
    return { total: 0 };
  }
  
  // Group by workflow success rates
  const workflowStats = {};
  const intentWorkflowMatrix = {};
  
  for (const e of effectiveness) {
    if (!workflowStats[e.workflow]) {
      workflowStats[e.workflow] = { total: 0, successes: 0, totalRating: 0 };
    }
    workflowStats[e.workflow].total += e.total || 1;
    workflowStats[e.workflow].successes += e.successes || 0;
    workflowStats[e.workflow].totalRating += e.totalRating || 0;
    
    const key = `${e.intent}:${e.workflow}`;
    if (!intentWorkflowMatrix[key]) {
      intentWorkflowMatrix[key] = { total: 0, successes: 0 };
    }
    intentWorkflowMatrix[key].total += e.total || 1;
    intentWorkflowMatrix[key].successes += e.successes || 0;
  }
  
  return {
    total: effectiveness.length,
    workflowEffectiveness: Object.entries(workflowStats).map(([workflow, stats]) => ({
      workflow,
      totalUses: stats.total,
      successRate: (stats.successes / stats.total * 100).toFixed(1),
      avgRating: (stats.totalRating / stats.total).toFixed(2),
    })).sort((a, b) => parseFloat(b.successRate) - parseFloat(a.successRate)),
    topCombinations: Object.entries(intentWorkflowMatrix)
      .map(([combination, stats]) => {
        const [intent, workflow] = combination.split(':');
        return {
          intent,
          workflow,
          totalUses: stats.total,
          successRate: (stats.successes / stats.total * 100).toFixed(1),
        };
      })
      .sort((a, b) => b.totalUses - a.totalUses)
      .slice(0, 10),
  };
}

/**
 * Get pattern calibration stats
 */
function getCalibrationStats() {
  try {
    const calibration = JSON.parse(fs.readFileSync(PATTERN_CALIBRATION_FILE, 'utf8'));
    
    return {
      version: calibration.version,
      lastUpdated: calibration.lastUpdated,
      thresholds: calibration.thresholds,
      patternCount: Object.keys(calibration.patternWeights).length,
      calibrationEvents: calibration.calibrationHistory?.length || 0,
      fallbackBehavior: calibration.fallbackBehavior,
      topPatterns: Object.entries(calibration.patternWeights)
        .map(([pattern, weight]) => ({ pattern, weight }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 10),
    };
  } catch (err) {
    return { error: 'Could not load calibration data' };
  }
}

/**
 * Get cross-workflow stats
 */
function getCrossWorkflowStats() {
  const handovers = readJsonl(CROSS_WORKFLOW_LOG, 500);
  
  if (handovers.length === 0) {
    return { total: 0 };
  }
  
  const byTransition = {};
  const byOutcome = {};
  const byProjectType = {};
  
  for (const h of handovers) {
    const transition = `${h.fromSkill}→${h.toSkill}`;
    byTransition[transition] = (byTransition[transition] || 0) + 1;
    
    if (h.outcome) {
      byOutcome[h.outcome] = (byOutcome[h.outcome] || 0) + 1;
    }
    
    if (h.projectType) {
      byProjectType[h.projectType] = (byProjectType[h.projectType] || 0) + 1;
    }
  }
  
  return {
    total: handovers.length,
    byTransition,
    byOutcome,
    byProjectType,
    successRate: byOutcome.success !== undefined && handovers.length > 0
      ? ((byOutcome.success / handovers.length) * 100).toFixed(1)
      : 0,
  };
}

/**
 * Get proactive suggestion stats
 */
function getProactiveStats() {
  const suggestions = readJsonl(PROACTIVE_SUGGESTIONS_LOG, 500);
  const feedback = readJsonl(SUGGESTION_FEEDBACK_LOG, 500);
  
  if (suggestions.length === 0) {
    return { totalSuggestions: 0 };
  }
  
  const byState = {};
  const byAction = {};
  let accepted = 0;
  let rejected = 0;
  
  for (const s of suggestions) {
    byState[s.currentState] = (byState[s.currentState] || 0) + 1;
    byAction[s.action] = (byAction[s.action] || 0) + 1;
  }
  
  for (const f of feedback) {
    if (f.result === 'accepted') accepted++;
    else if (f.result === 'rejected') rejected++;
  }
  
  return {
    totalSuggestions: suggestions.length,
    byState,
    byAction,
    feedbackReceived: feedback.length,
    acceptanceRate: feedback.length > 0 ? ((accepted / feedback.length) * 100).toFixed(1) : 0,
  };
}

/**
 * Get pattern weights from feedback learner
 */
function getPatternWeightsStats() {
  try {
    const weights = JSON.parse(fs.readFileSync(PATTERN_WEIGHTS_FILE, 'utf8'));
    
    return {
      version: weights.version,
      lastUpdated: weights.lastUpdated,
      intentWeights: weights.intentWeights,
      patternBoost: weights.patternBoost,
      workflowSuccessRates: weights.workflowSuccessRates,
    };
  } catch (err) {
    return { error: 'Could not load pattern weights' };
  }
}

/**
 * Generate comprehensive stats report
 */
function generateAllStats() {
  const decisions = getDecisionStats();
  const feedback = getFeedbackStats();
  const effectiveness = getEffectivenessStats();
  const calibration = getCalibrationStats();
  const crossWorkflow = getCrossWorkflowStats();
  const proactive = getProactiveStats();
  const patternWeights = getPatternWeightsStats();
  
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalDecisions: decisions.total || 0,
      totalFeedback: feedback.total || 0,
      feedbackSuccessRate: feedback.successRate || 0,
      avgRating: feedback.avgRating || 0,
    },
    decisions,
    feedback,
    effectiveness,
    calibration,
    crossWorkflow,
    proactive,
    patternWeights,
  };
}

/**
 * Generate formatted text report
 */
function formatTextReport(stats) {
  let report = `
╔══════════════════════════════════════════════════════════════╗
║           OUROBOROS EFFECTIVENESS STATISTICS                 ║
╚══════════════════════════════════════════════════════════════╝

📊 SUMMARY
─────────────────────────────────────────────────────────────────
Total Decisions: ${stats.summary.totalDecisions}
Total Feedback:  ${stats.summary.totalFeedback}
Success Rate:    ${stats.summary.feedbackSuccessRate}%
Avg Rating:      ${stats.summary.avgRating}/5

📈 INTENT DETECTION
─────────────────────────────────────────────────────────────────`;
  
  if (stats.decisions.total > 0) {
    report += `
Avg Confidence: ${stats.decisions.avgConfidence}%
LLM Usage:      ${stats.decisions.llmUsageRate}%

Top Intents:`;
    for (const [intent, count] of Object.entries(stats.decisions.intentDistribution || {}).slice(0, 5)) {
      report += `
  • ${intent}: ${count}`;
    }
  } else {
    report += `
  No decisions logged yet`;
  }
  
  report += `

💬 WORKFLOW ROUTING
─────────────────────────────────────────────────────────────────`;
  
  if (stats.decisions.total > 0) {
    report += `
Top Workflows:`;
    for (const [workflow, count] of Object.entries(stats.decisions.workflowDistribution || {}).slice(0, 5)) {
      report += `
  • ${workflow}: ${count}`;
    }
  }
  
  report += `

📊 EFFECTIVENESS TRACKING
─────────────────────────────────────────────────────────────────`;
  
  if (stats.effectiveness.total > 0) {
    report += `
Workflow Success Rates:`;
    for (const w of (stats.effectiveness.workflowEffectiveness || []).slice(0, 5)) {
      report += `
  • ${w.workflow}: ${w.successRate}% (${w.totalUses} uses, avg: ${w.avgRating})`;
    }
  } else {
    report += `
  No effectiveness data yet. Rate workflow decisions to build metrics.`;
  }
  
  report += `

🔄 CROSS-WORKFLOW
─────────────────────────────────────────────────────────────────`;
  
  if (stats.crossWorkflow.total > 0) {
    report += `
Total Handovers: ${stats.crossWorkflow.total}
Success Rate:    ${stats.crossWorkflow.successRate}%

Top Transitions:`;
    for (const [transition, count] of Object.entries(stats.crossWorkflow.byTransition || {}).slice(0, 5)) {
      report += `
  • ${transition}: ${count}`;
    }
  } else {
    report += `
  No cross-workflow handoffs recorded.`;
  }
  
  report += `

📈 SELF-IMPROVEMENT
─────────────────────────────────────────────────────────────────`;
  
  if (stats.feedback.total > 0) {
    report += `
Feedback Collected: ${stats.feedback.total}
Rating Distribution: `;
    const ratings = stats.feedback.ratingDistribution || {};
    report += `★${ratings[5] || 0} · ☆${ratings[4] || 0} · ${ratings[3] || 0} · ${ratings[2] || 0} · ${ratings[1] || 0}`;
  } else {
    report += `
  No feedback collected. Rate workflow decisions to improve.`;
  }
  
  report += `

⚙️ CALIBRATION
─────────────────────────────────────────────────────────────────`;
  
  if (!stats.calibration.error) {
    report += `
Version:        v${stats.calibration.version}
Last Updated:   ${new Date(stats.calibration.lastUpdated).toLocaleString()}
Patterns:       ${stats.calibration.patternCount}
Calibration Events: ${stats.calibration.calibrationEvents}

Confidence Thresholds:
  Very Low:  <${stats.calibration.thresholds.veryLow}%
  Low:       ${stats.calibration.thresholds.veryLow}-${stats.calibration.thresholds.low}%
  Borderline: ${stats.calibration.thresholds.low}-${stats.calibration.thresholds.borderline}%
  High:      ${stats.calibration.thresholds.borderline}-${stats.calibration.thresholds.high}%
  Very High: >${stats.calibration.thresholds.high}%
`;
  } else {
    report += `
  ${stats.calibration.error}`;
  }
  
  report += `

🎯 PROACTIVE SUGGESTIONS
─────────────────────────────────────────────────────────────────`;
  
  if (stats.proactive.totalSuggestions > 0) {
    report += `
Total:          ${stats.proactive.totalSuggestions}
Acceptance Rate: ${stats.proactive.acceptanceRate}%

Top Actions:`;
    for (const [action, count] of Object.entries(stats.proactive.byAction || {}).slice(0, 5)) {
      report += `
  • ${action}: ${count}`;
    }
  } else {
    report += `
  No proactive suggestions made.`;
  }
  
  report += `

═══════════════════════════════════════════════════════════════

💡 To improve Ouroboros:
  • Rate workflow decisions: /ouroboros:feedback <decision-id> <1-5>
  • Check effectiveness: /ouroboros:effectiveness <intent>
  • Adjust calibration: node pattern-calibrator.js boost <pattern> <amount>
  • Learn from execution: node cross-workflow-integrator.js learn <type> <intent> <workflow> <success|fail>

Generated: ${new Date(stats.generatedAt).toLocaleString()}
═══════════════════════════════════════════════════════════════
`;
  
  return report;
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  const format = args.includes('--json') ? 'json' : 'text';
  
  if (command === '--help' || command === '-h') {
    console.log(`
Ouroboros Stats Aggregator

Usage:
  node stats-aggregator.js all [--json]
  node stats-aggregator.js effectiveness [--json]
  node stats-aggregator.js feedback [--json]
  node stats-aggregator.js patterns [--json]
  node stats-aggregator.js workflows [--json]
  node stats-aggregator.js calibration [--json]

Options:
  --json    Output as JSON instead of formatted text

Examples:
  node stats-aggregator.js all
  node stats-aggregator.js effectiveness --json
  node stats-aggregator.js feedback
`);
    process.exit(0);
  }
  
  let stats;
  let output;
  
  switch (command) {
    case 'all':
      stats = generateAllStats();
      output = format === 'json' ? JSON.stringify(stats, null, 2) : formatTextReport(stats);
      break;
    
    case 'effectiveness':
      stats = getEffectivenessStats();
      output = format === 'json' ? JSON.stringify(stats, null, 2) : JSON.stringify(stats, null, 2);
      break;
    
    case 'feedback':
      stats = getFeedbackStats();
      output = format === 'json' ? JSON.stringify(stats, null, 2) : JSON.stringify(stats, null, 2);
      break;
    
    case 'patterns':
      stats = getCalibrationStats();
      output = format === 'json' ? JSON.stringify(stats, null, 2) : JSON.stringify(stats, null, 2);
      break;
    
    case 'workflows':
      stats = getCrossWorkflowStats();
      output = format === 'json' ? JSON.stringify(stats, null, 2) : JSON.stringify(stats, null, 2);
      break;
    
    case 'calibration':
      stats = getCalibrationStats();
      output = format === 'json' ? JSON.stringify(stats, null, 2) : JSON.stringify(stats, null, 2);
      break;
    
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run with --help for usage information');
      process.exit(1);
  }
  
  console.log(output);
}

// Export for use as module
if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
} else {
  module.exports = {
    generateAllStats,
    getDecisionStats,
    getFeedbackStats,
    getEffectivenessStats,
    getCalibrationStats,
    getCrossWorkflowStats,
    getProactiveStats,
    formatTextReport,
  };
}
