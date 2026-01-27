#!/usr/bin/env node

/**
 * Ouroboros Proactive Suggestions Engine (Phase 2 - US-005)
 * 
 * Proactive workflow suggestions:
 * - Detect workflow state transitions
 * - Suggest next logical action
 * - Learn from accepted/rejected suggestions
 * - Rate limit suggestions (1 per 5 min)
 * 
 * Usage:
 *   node proactive-engine.js suggest <context-json>
 *   node proactive-engine.js feedback <suggestion-id> <accepted|rejected>
 *   node proactive-engine.js stats
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, '../memory');
const SUGGESTIONS_LOG = path.join(MEMORY_DIR, 'proactive-suggestions.jsonl');
const FEEDBACK_LOG = path.join(MEMORY_DIR, 'suggestion-feedback.jsonl');
const STATE_FILE = path.join(MEMORY_DIR, 'workflow-state.json');

// Suggestion rate limit (milliseconds)
const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes

// Workflow state machine
const WORKFLOW_STATES = {
  IDLE: 'idle',
  PLANNING: 'planning',
  EXECUTING: 'executing',
  TESTING: 'testing',
  DEBUGGING: 'debugging',
  REVIEWING: 'reviewing',
  WAITING: 'waiting',
  COMPLETED: 'completed',
};

// State transitions and suggested next actions
const STATE_TRANSITIONS = {
  [WORKFLOW_STATES.IDLE]: {
    nextStates: [WORKFLOW_STATES.PLANNING],
    suggestions: [
      { action: 'start_planning', reason: 'Begin by planning the approach' },
      { action: 'quick_research', reason: 'Research similar implementations first' },
    ],
  },
  
  [WORKFLOW_STATES.PLANNING]: {
    nextStates: [WORKFLOW_STATES.EXECUTING, WORKFLOW_STATES.IDLE],
    suggestions: [
      { action: 'create_spec', reason: 'Document requirements before coding' },
      { action: 'start_execution', reason: 'Planning complete, ready to implement' },
      { action: 'validate_plan', reason: 'Review plan with human before proceeding' },
    ],
  },
  
  [WORKFLOW_STATES.EXECUTING]: {
    nextStates: [WORKFLOW_STATES.TESTING, WORKFLOW_STATES.DEBUGGING, WORKFLOW_STATES.REVIEWING],
    suggestions: [
      { action: 'run_tests', reason: 'Verify implementation with tests' },
      { action: 'manual_verification', reason: 'Check if implementation meets requirements' },
      { action: 'commit_progress', reason: 'Save progress to version control' },
    ],
  },
  
  [WORKFLOW_STATES.TESTING]: {
    nextStates: [WORKFLOW_STATES.DEBUGGING, WORKFLOW_STATES.REVIEWING, WORKFLOW_STATES.COMPLETED],
    suggestions: [
      { action: 'fix_failing_tests', reason: 'Address test failures before proceeding' },
      { action: 'add_more_tests', reason: 'Increase test coverage' },
      { action: 'mark_complete', reason: 'All tests passing, ready to complete' },
    ],
  },
  
  [WORKFLOW_STATES.DEBUGGING]: {
    nextStates: [WORKFLOW_STATES.TESTING, WORKFLOW_STATES.EXECUTING],
    suggestions: [
      { action: 'run_laboratory', reason: 'Use laboratory skill for systematic debugging' },
      { action: 'add_logging', reason: 'Add more debugging output' },
      { action: 'retest', reason: 'Verify fix with tests' },
    ],
  },
  
  [WORKFLOW_STATES.REVIEWING]: {
    nextStates: [WORKFLOW_STATES.EXECUTING, WORKFLOW_STATES.COMPLETED],
    suggestions: [
      { action: 'request_feedback', reason: 'Get human review before completing' },
      { action: 'iterate', reason: 'Make improvements based on review' },
      { action: 'finalize', reason: 'Review complete, finalize work' },
    ],
  },
  
  [WORKFLOW_STATES.WAITING]: {
    nextStates: [WORKFLOW_STATES.IDLE, WORKFLOW_STATES.EXECUTING],
    suggestions: [
      { action: 'check_blockers', reason: 'Identify what is blocking progress' },
      { action: 'work_on_other', reason: 'Switch to another task while waiting' },
      { action: 'follow_up', reason: 'Check if blocking issue is resolved' },
    ],
  },
};

/**
 * Ensure log files exist
 */
function ensureLogFiles() {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(SUGGESTIONS_LOG)) {
    fs.writeFileSync(SUGGESTIONS_LOG, '', 'utf8');
  }
  
  if (!fs.existsSync(FEEDBACK_LOG)) {
    fs.writeFileSync(FEEDBACK_LOG, '', 'utf8');
  }
}

/**
 * Load current workflow state
 */
function loadWorkflowState() {
  try {
    const data = fs.readFileSync(STATE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {
      currentState: WORKFLOW_STATES.IDLE,
      lastTransition: new Date().toISOString(),
      history: [],
      metadata: {},
    };
  }
}

/**
 * Save workflow state
 */
function saveWorkflowState(state) {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
  
  state.lastTransition = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

/**
 * Detect workflow state from context
 */
function detectWorkflowState(context = {}) {
  const { recentMessages = [], intent = '', workflow = '', entities = {} } = context;
  
  // Analyze recent activity to infer state
  const keywords = recentMessages.join(' ').toLowerCase();
  
  // State detection patterns
  if (keywords.includes('plan') || keywords.includes('design') || keywords.includes('architecture')) {
    return WORKFLOW_STATES.PLANNING;
  }
  
  if (keywords.includes('implement') || keywords.includes('build') || keywords.includes('code')) {
    return WORKFLOW_STATES.EXECUTING;
  }
  
  if (keywords.includes('test') || keywords.includes('verify') || keywords.includes('check')) {
    return WORKFLOW_STATES.TESTING;
  }
  
  if (keywords.includes('debug') || keywords.includes('fix') || keywords.includes('error') || keywords.includes('bug')) {
    return WORKFLOW_STATES.DEBUGGING;
  }
  
  if (keywords.includes('review') || keywords.includes('feedback') || keywords.includes('opinion')) {
    return WORKFLOW_STATES.REVIEWING;
  }
  
  if (keywords.includes('wait') || keywords.includes('blocked') || keywords.includes('stuck')) {
    return WORKFLOW_STATES.WAITING;
  }
  
  if (keywords.includes('done') || keywords.includes('complete') || keywords.includes('finish')) {
    return WORKFLOW_STATES.COMPLETED;
  }
  
  // Default to idle if no clear state detected
  return WORKFLOW_STATES.IDLE;
}

/**
 * Check if suggestion is rate-limited
 */
function isRateLimited() {
  ensureLogFiles();
  
  try {
    const lines = fs.readFileSync(SUGGESTIONS_LOG, 'utf8').trim().split('\n').filter(Boolean);
    if (lines.length === 0) return false;
    
    const lastLine = lines[lines.length - 1];
    const lastSuggestion = JSON.parse(lastLine);
    const timeSince = Date.now() - new Date(lastSuggestion.timestamp).getTime();
    
    return timeSince < RATE_LIMIT_MS;
  } catch (err) {
    return false;
  }
}

/**
 * Get time until next suggestion allowed
 */
function getTimeUntilNextSuggestion() {
  ensureLogFiles();
  
  try {
    const lines = fs.readFileSync(SUGGESTIONS_LOG, 'utf8').trim().split('\n').filter(Boolean);
    if (lines.length === 0) return 0;
    
    const lastLine = lines[lines.length - 1];
    const lastSuggestion = JSON.parse(lastLine);
    const timeSince = Date.now() - new Date(lastSuggestion.timestamp).getTime();
    const remaining = RATE_LIMIT_MS - timeSince;
    
    return Math.max(0, remaining);
  } catch (err) {
    return 0;
  }
}

/**
 * Learn from feedback to adjust suggestion quality
 */
function learnFromFeedback() {
  ensureLogFiles();
  
  try {
    const feedbackLines = fs.readFileSync(FEEDBACK_LOG, 'utf8').trim().split('\n').filter(Boolean);
    
    if (feedbackLines.length === 0) {
      return {
        totalFeedback: 0,
        acceptanceRate: 0,
        preferredActions: [],
      };
    }
    
    const feedback = feedbackLines.map(line => JSON.parse(line));
    const accepted = feedback.filter(f => f.result === 'accepted').length;
    const acceptanceRate = (accepted / feedback.length) * 100;
    
    // Count action preferences
    const actionCounts = {};
    feedback.forEach(f => {
      if (f.result === 'accepted') {
        actionCounts[f.action] = (actionCounts[f.action] || 0) + 1;
      }
    });
    
    const preferredActions = Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([action, count]) => ({ action, count }));
    
    return {
      totalFeedback: feedback.length,
      acceptanceRate: acceptanceRate.toFixed(1),
      preferredActions: preferredActions.slice(0, 5),
    };
  } catch (err) {
    return {
      totalFeedback: 0,
      acceptanceRate: 0,
      preferredActions: [],
    };
  }
}

/**
 * Generate proactive suggestion
 */
function generateSuggestion(context = {}) {
  // Check rate limit
  if (isRateLimited()) {
    const remaining = getTimeUntilNextSuggestion();
    const minutesRemaining = Math.ceil(remaining / 60000);
    
    return {
      suggested: false,
      reason: 'rate_limited',
      message: `Rate limit active. Next suggestion in ~${minutesRemaining} minute(s)`,
      timeUntilNext: remaining,
    };
  }
  
  // Detect current workflow state
  const currentState = detectWorkflowState(context);
  const workflowState = loadWorkflowState();
  
  // Update state if changed
  if (currentState !== workflowState.currentState) {
    workflowState.history.push({
      from: workflowState.currentState,
      to: currentState,
      timestamp: new Date().toISOString(),
    });
    workflowState.currentState = currentState;
    saveWorkflowState(workflowState);
  }
  
  // Get possible suggestions for current state
  const stateConfig = STATE_TRANSITIONS[currentState];
  if (!stateConfig || stateConfig.suggestions.length === 0) {
    return {
      suggested: false,
      reason: 'no_suggestions_available',
      currentState,
      message: `No suggestions available for state: ${currentState}`,
    };
  }
  
  // Learn from past feedback
  const learning = learnFromFeedback();
  
  // Prioritize suggestions based on learned preferences
  let suggestions = [...stateConfig.suggestions];
  if (learning.preferredActions.length > 0) {
    const preferredActionNames = learning.preferredActions.map(p => p.action);
    suggestions.sort((a, b) => {
      const aIndex = preferredActionNames.indexOf(a.action);
      const bIndex = preferredActionNames.indexOf(b.action);
      
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }
  
  // Pick top suggestion
  const topSuggestion = suggestions[0];
  
  // Generate unique ID
  const suggestionId = `sug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Log suggestion
  const suggestionRecord = {
    id: suggestionId,
    timestamp: new Date().toISOString(),
    currentState,
    action: topSuggestion.action,
    reason: topSuggestion.reason,
    context: {
      intent: context.intent,
      workflow: context.workflow,
    },
  };
  
  ensureLogFiles();
  fs.appendFileSync(SUGGESTIONS_LOG, JSON.stringify(suggestionRecord) + '\n', 'utf8');
  
  return {
    suggested: true,
    id: suggestionId,
    currentState,
    nextStates: stateConfig.nextStates,
    suggestion: topSuggestion,
    alternatives: suggestions.slice(1, 3),
    learning: {
      acceptanceRate: learning.acceptanceRate,
      basedOnFeedback: learning.totalFeedback > 0,
    },
  };
}

/**
 * Record feedback on a suggestion
 */
function recordFeedback(suggestionId, result, notes = '') {
  ensureLogFiles();
  
  // Find the original suggestion
  const suggestionLines = fs.readFileSync(SUGGESTIONS_LOG, 'utf8').trim().split('\n').filter(Boolean);
  const suggestion = suggestionLines
    .map(line => JSON.parse(line))
    .find(s => s.id === suggestionId);
  
  if (!suggestion) {
    return {
      success: false,
      error: `Suggestion ${suggestionId} not found`,
    };
  }
  
  // Log feedback
  const feedbackRecord = {
    suggestionId,
    timestamp: new Date().toISOString(),
    action: suggestion.action,
    currentState: suggestion.currentState,
    result, // 'accepted' or 'rejected'
    notes,
  };
  
  fs.appendFileSync(FEEDBACK_LOG, JSON.stringify(feedbackRecord) + '\n', 'utf8');
  
  return {
    success: true,
    feedback: feedbackRecord,
  };
}

/**
 * Generate statistics
 */
function generateStats() {
  ensureLogFiles();
  
  const suggestionLines = fs.readFileSync(SUGGESTIONS_LOG, 'utf8').trim().split('\n').filter(Boolean);
  const suggestions = suggestionLines.map(line => JSON.parse(line));
  
  const learning = learnFromFeedback();
  const workflowState = loadWorkflowState();
  
  return {
    totalSuggestions: suggestions.length,
    currentState: workflowState.currentState,
    stateHistory: workflowState.history.slice(-10),
    feedback: learning,
    rateLimitStatus: {
      isLimited: isRateLimited(),
      timeUntilNext: getTimeUntilNextSuggestion(),
    },
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
Ouroboros Proactive Suggestions Engine

Usage:
  node proactive-engine.js suggest <context-json>     Generate proactive suggestion
  node proactive-engine.js feedback <id> <result>     Record feedback on suggestion
  node proactive-engine.js stats                      Show suggestion statistics

Feedback Results:
  accepted    Suggestion was helpful and acted upon
  rejected    Suggestion was not helpful

Examples:
  node proactive-engine.js suggest '{"recentMessages":["let's build this"],"intent":"create_project"}'
  node proactive-engine.js feedback sug_12345_abc accepted
  node proactive-engine.js stats
`);
    process.exit(0);
  }
  
  switch (command) {
    case 'suggest': {
      const jsonInput = args.slice(1).join(' ');
      const context = jsonInput ? JSON.parse(jsonInput) : {};
      
      const suggestion = generateSuggestion(context);
      console.log(JSON.stringify(suggestion, null, 2));
      break;
    }
    
    case 'feedback': {
      const [, suggestionId, result, ...notesParts] = args;
      if (!suggestionId || !result) {
        console.error('Error: Suggestion ID and result required');
        process.exit(1);
      }
      
      const notes = notesParts.join(' ');
      const feedback = recordFeedback(suggestionId, result, notes);
      console.log(JSON.stringify(feedback, null, 2));
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
    generateSuggestion,
    recordFeedback,
    detectWorkflowState,
    loadWorkflowState,
    saveWorkflowState,
    generateStats,
    learnFromFeedback,
    isRateLimited,
    WORKFLOW_STATES,
  };
}
