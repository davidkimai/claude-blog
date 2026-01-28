#!/usr/bin/env node

/**
 * Ouroboros Meta-Orchestrator (v0.5)
 * 
 * Seamless integration with Compound Engineering workflows.
 * Automatically triggers appropriate workflows based on intent detection
 * and conversation context.
 * 
 * Features:
 * - Auto-trigger Compound workflows based on intent
 * - State tracking across workflow phases
 * - Seamless handoff between Ouroboros and Compound
 * - Natural integration - user doesn't invoke manually
 * 
 * Usage:
 *   node meta-orchestrator.js "Your request here"
 *   node meta-orchestrator.js --status  # Check current state
 *   node meta-orchestrator.js --next    # Suggest next action
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Scripts directory
const SCRIPTS_DIR = path.join(__dirname, '.');

// Memory paths
const MEMORY_DIR = path.join(__dirname, '../memory');
const DECISIONS_LOG = path.join(MEMORY_DIR, 'ouroboros-decisions.jsonl');
const EFFECTIVENESS_LOG = path.join(MEMORY_DIR, 'ouroboros-effectiveness.jsonl');
const WORKFLOW_STATE = path.join(MEMORY_DIR, 'workflow-state.json');
const COMPOUND_STATE = path.join(MEMORY_DIR, 'compound-state.json');

// Import intent detector
const { detectIntent, WORKFLOWS, INTENTS } = require('./intent-detector.js');

// Compound workflow commands
const COMPOUND_COMMANDS = {
  BRAINSTORMING: '/brainstorming',
  PLAN: '/workflows:plan',
  WORK: '/workflows:work',
  REVIEW: '/workflows:review',
  COMPOUND: '/workflows:compound',
  SKILL_CREATOR: '/skill-creator',
};

// Workflow state tracking
let workflowState = {
  currentPhase: null,
  projectId: null,
  startedAt: null,
  lastAction: null,
  brainstormOutput: null,
  planOutput: null,
  reviewOutput: null,
  taskId: null,
};

/**
 * Load workflow state
 */
function loadWorkflowState() {
  try {
    if (fs.existsSync(WORKFLOW_STATE)) {
      const data = fs.readFileSync(WORKFLOW_STATE, 'utf8');
      return { ...workflowState, ...JSON.parse(data) };
    }
  } catch (err) {
    // Use defaults
  }
  return workflowState;
}

/**
 * Save workflow state
 */
function saveWorkflowState(state) {
  workflowState = state;
  fs.writeFileSync(WORKFLOW_STATE, JSON.stringify(state, null, 2));
}

/**
 * Load compound state (tracks Compound workflow phases)
 */
function loadCompoundState() {
  try {
    if (fs.existsSync(COMPOUND_STATE)) {
      return JSON.parse(fs.readFileSync(COMPOUND_STATE, 'utf8'));
    }
  } catch (err) {
    // Default state
  }
  return {
    phase: null,
    inProgress: false,
    lastCompleted: null,
    projectContext: null,
  };
}

/**
 * Save compound state
 */
function saveCompoundState(state) {
  fs.writeFileSync(COMPOUND_STATE, JSON.stringify(state, null, 2));
}

/**
 * Log decision to audit trail
 */
function logDecision(result, action, context = {}) {
  const decision = {
    timestamp: new Date().toISOString(),
    message: result.message,
    intent: result.intent,
    confidence: result.confidence,
    workflow: result.suggestedWorkflow,
    action,
    context,
    reasoning: result.reasoning,
  };
  
  // Rotate log if too large
  try {
    if (fs.existsSync(DECISIONS_LOG)) {
      const stats = fs.statSync(DECISIONS_LOG);
      if (stats.size > 10 * 1024 * 1024) { // 10MB
        fs.renameSync(DECISIONS_LOG, DECISIONS_LOG.replace('.jsonl', '.bak.jsonl'));
      }
    }
  } catch (err) {
    // Ignore
  }
  
  fs.appendFileSync(DECISIONS_LOG, JSON.stringify(decision) + '\n');
}

/**
 * Log effectiveness metric
 */
function logEffectiveness(workflow, success, rating, context = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    workflow,
    success,
    rating,
    context,
  };
  
  fs.appendFileSync(EFFECTIVENESS_LOG, JSON.stringify(entry) + '\n');
}

/**
 * Determine if we should auto-trigger Compound workflow
 */
function shouldAutoTrigger(result, compoundState) {
  // Don't auto-trigger if Compound workflow is already in progress
  if (compoundState.inProgress) {
    return { should: false, reason: 'Compound workflow already in progress' };
  }
  
  // High confidence + clear intent = auto-trigger
  if (result.confidence >= 75 && result.intent !== INTENTS.CLARIFY) {
    return { should: true, reason: 'High confidence intent detected' };
  }
  
  // Medium confidence + Compound intent pattern = suggest with context
  if (result.confidence >= 50 && result.isCompound) {
    return { should: true, reason: 'Compound intent pattern detected', suggest: true };
  }
  
  return { should: false, reason: 'Intent unclear or requires user confirmation' };
}

/**
 * Generate seamless workflow suggestion
 */
function generateWorkflowSuggestion(result, compoundState) {
  const suggestions = [];
  
  // Phase detection based on conversation context
  const hasClarification = result.intent === INTENTS.CLARIFY;
  const hasComplexProject = result.confidence >= 70 && 
    [INTENTS.CREATE_PROJECT, INTENTS.EXTEND_FEATURE].includes(result.intent);
  const hasImplementation = result.intent === INTENTS.QUICK_TASK || 
    result.intent === INTENTS.DEBUG_FIX;
  
  if (hasClarification) {
    suggestions.push({
      command: COMPOUND_COMMANDS.BRAINSTORMING,
      description: 'Clarify requirements through structured brainstorming',
      autoTrigger: true,
      reasoning: 'Intent unclear - brainstorming will help clarify',
    });
  }
  
  if (hasComplexProject && !hasClarification) {
    // Check current phase
    if (compoundState.phase === 'brainstorming' || !compoundState.phase) {
      suggestions.push({
        command: COMPOUND_COMMANDS.PLAN,
        description: 'Create detailed implementation plan',
        autoTrigger: true,
        reasoning: 'Clear intent for complex project - planning recommended',
      });
    } else if (compoundState.phase === 'planning') {
      suggestions.push({
        command: COMPOUND_COMMANDS.WORK,
        description: 'Execute plan with worktrees and task tracking',
        autoTrigger: true,
        reasoning: 'Plan exists - time to execute',
      });
    } else if (compoundState.phase === 'working') {
      suggestions.push({
        command: COMPOUND_COMMANDS.REVIEW,
        description: 'Run multi-agent code review',
        autoTrigger: false,
        reasoning: 'Work in progress - suggest review when ready',
        readyForReview: true,
      });
    }
  }
  
  if (hasImplementation && compoundState.phase === 'working') {
    suggestions.push({
      command: COMPOUND_COMMANDS.REVIEW,
      description: 'Review changes before finalizing',
      autoTrigger: false,
      reasoning: 'Implementation complete - review recommended',
    });
  }
  
  // Skill creation detection
  if (result.intent === INTENTS.CREATE_PROJECT && 
      /skill|capability|extend.*claude/i.test(result.message)) {
    suggestions.push({
      command: COMPOUND_COMMANDS.SKILL_CREATOR,
      description: 'Create new skill using Skill Creator',
      autoTrigger: true,
      reasoning: 'Skill creation detected',
    });
  }
  
  return suggestions;
}

/**
 * Get current status for user
 */
function getStatus(compoundState) {
  const state = loadWorkflowState();
  
  let status = {
    phase: compoundState.phase || 'idle',
    inProgress: compoundState.inProgress,
    lastAction: state.lastAction,
    projectId: state.projectId,
  };
  
  if (state.brainstormOutput) {
    status.brainstormCompleted = true;
  }
  if (state.planOutput) {
    status.planCompleted = true;
  }
  if (state.reviewOutput) {
    status.reviewCompleted = true;
  }
  
  return status;
}

/**
 * Get next suggested action based on current state
 */
function getNextAction(compoundState) {
  const state = loadWorkflowState();
  
  if (!compoundState.phase || compoundState.phase === 'idle') {
    return {
      action: 'awaiting_input',
      message: 'What would you like to work on?',
      canAutoDetect: true,
    };
  }
  
  if (compoundState.phase === 'brainstorming' && !state.brainstormOutput) {
    return {
      action: 'continue_brainstorming',
      message: 'Continue brainstorming to clarify requirements',
    };
  }
  
  if (state.brainstormOutput && !state.planOutput) {
    return {
      action: 'trigger_plan',
      command: COMPOUND_COMMANDS.PLAN,
      message: 'Ready to create implementation plan based on brainstorm',
      autoTrigger: true,
    };
  }
  
  if (state.planOutput && !state.taskId) {
    return {
      action: 'start_work',
      command: COMPOUND_COMMANDS.WORK,
      message: 'Plan ready. Start execution with worktrees?',
      autoTrigger: false,
    };
  }
  
  if (state.taskId && compoundState.phase !== 'reviewing') {
    return {
      action: 'suggest_review',
      command: COMPOUND_COMMANDS.REVIEW,
      message: 'Work in progress. Ready for review?',
      autoTrigger: false,
    };
  }
  
  if (compoundState.phase === 'reviewing' || state.reviewOutput) {
    return {
      action: 'compound_learnings',
      command: COMPOUND_COMMANDS.COMPOUND,
      message: 'Review complete. Document learnings to compound knowledge?',
      autoTrigger: false,
    };
  }
  
  return {
    action: 'complete',
    message: 'Workflow complete! What next?',
  };
}

/**
 * Main orchestration function
 */
async function orchestrate(message, options = {}) {
  const compoundState = loadCompoundState();
  const state = loadWorkflowState();
  
  console.log('\n🔮 Ouroboros Meta-Orchestrator v0.5');
  console.log('═══════════════════════════════════════════\n');
  
  // Step 1: Detect intent (seamless - no user awareness)
  console.log('Analyzing your request...');
  const result = await detectIntent(message);
  
  console.log(`Intent: ${result.intent} (${result.confidence}% confidence)`);
  console.log(`Suggested: ${result.suggestedWorkflow}\n`);
  
  // Step 2: Check for existing workflow state
  if (compoundState.inProgress) {
    console.log(`📌 Continuing: ${compoundState.phase} phase\n`);
    
    // Check if we're ready for next phase
    const next = getNextAction(compoundState);
    
    if (next.autoTrigger) {
      console.log(`✨ Auto-suggesting: ${next.command || next.message}\n`);
      logDecision(result, 'auto_suggest', { phase: compoundState.phase, action: next.action });
      return {
        result,
        compoundState,
        suggestion: next,
        autoTriggered: true,
      };
    }
  }
  
  // Step 3: Generate workflow suggestions
  const suggestions = generateWorkflowSuggestion(result, compoundState);
  
  // Step 4: Determine auto-trigger
  const autoTrigger = shouldAutoTrigger(result, compoundState);
  
  if (autoTrigger.should) {
    const primarySuggestion = suggestions[0];
    
    console.log(`✨ Seamless suggestion: ${primarySuggestion.description}`);
    console.log(`   Command: ${primarySuggestion.command}`);
    console.log(`   Reason: ${primarySuggestion.reasoning}\n`);
    
    // Auto-trigger for high confidence
    if (primarySuggestion.autoTrigger || autoTrigger.suggest) {
      logDecision(result, 'auto_suggest', { 
        workflow: primarySuggestion.command,
        reason: autoTrigger.reason,
      });
      
      return {
        result,
        compoundState,
        suggestion: primarySuggestion,
        autoTriggered: primarySuggestion.autoTrigger,
        reasoning: autoTrigger.reason,
      };
    }
  }
  
  // Step 5: Default - show suggestions
  if (suggestions.length > 0) {
    console.log('📋 Suggested workflows:');
    suggestions.forEach((s, i) => {
      const marker = s.autoTrigger ? '✨' : '  ';
      console.log(`${marker} ${i + 1}. ${s.command} - ${s.description}`);
    });
    console.log('');
  }
  
  // Log decision
  logDecision(result, 'analyzed', { suggestions: suggestions.map(s => s.command) });
  
  return {
    result,
    compoundState,
    suggestions,
    autoTriggered: false,
  };
}

/**
 * Update compound state after workflow completion
 */
function markWorkflowComplete(phase, output) {
  const state = loadWorkflowState();
  const compoundState = loadCompoundState();
  
  state.lastAction = phase;
  
  switch (phase) {
    case 'brainstorming':
      state.brainstormOutput = output;
      compoundState.phase = 'brainstorming';
      compoundState.inProgress = false;
      break;
    case 'planning':
      state.planOutput = output;
      compoundState.phase = 'planning';
      break;
    case 'working':
      state.taskId = output;
      compoundState.phase = 'working';
      break;
    case 'reviewing':
      state.reviewOutput = output;
      compoundState.phase = 'reviewing';
      break;
    case 'compounding':
      compoundState.phase = 'completed';
      compoundState.lastCompleted = new Date().toISOString();
      break;
  }
  
  compoundState.lastAction = phase;
  compoundState.timestamp = new Date().toISOString();
  
  saveWorkflowState(state);
  saveCompoundState(compoundState);
  
  console.log(`✓ Marked ${phase} complete`);
}

/**
 * Reset workflow state for new project
 */
function resetState() {
  const emptyState = {
    currentPhase: null,
    projectId: null,
    startedAt: null,
    lastAction: null,
    brainstormOutput: null,
    planOutput: null,
    reviewOutput: null,
    taskId: null,
  };
  
  saveWorkflowState(emptyState);
  saveCompoundState({
    phase: null,
    inProgress: false,
    lastCompleted: null,
    projectContext: null,
  });
  
  console.log('✓ State reset for new project');
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
🔮 Ouroboros Meta-Orchestrator v0.5

Seamless integration with Compound Engineering workflows.
Automatically triggers appropriate workflows based on intent.

Usage:
  node meta-orchestrator.js <message>           # Analyze and suggest workflow
  node meta-orchestrator.js --status            # Show current workflow state
  node meta-orchestrator.js --next              # Suggest next action
  node meta-orchestrator.js --complete <phase>  # Mark phase complete
  node meta-orchestrator.js --reset             # Reset for new project
  node meta-orchestrator.js --help              # Show this help

Examples:
  node meta-orchestrator.js "Build a React auth system"
  node meta-orchestrator.js "Fix the login bug"
  node meta-orchestrator.js --status

Workflow Phases:
  1. brainstorming → 2. planning → 3. working → 4. reviewing → 5. compounding

Auto-Trigger Rules:
  ✓ High confidence (75%+) + clear intent → Auto-suggest workflow
  ✓ Compound intent patterns → Auto-trigger full orchestration
  ✓ Low confidence → Suggest brainstorming first
`);
    process.exit(0);
  }
  
  if (args.includes('--status')) {
    const compoundState = loadCompoundState();
    const status = getStatus(compoundState);
    console.log('\n📊 Workflow Status:');
    console.log(JSON.stringify(status, null, 2));
    process.exit(0);
  }
  
  if (args.includes('--next')) {
    const compoundState = loadCompoundState();
    const next = getNextAction(compoundState);
    console.log('\n⏭️  Next Action:');
    console.log(JSON.stringify(next, null, 2));
    process.exit(0);
  }
  
  if (args.includes('--reset')) {
    resetState();
    process.exit(0);
  }
  
  if (args.includes('--complete')) {
    const phaseIndex = args.indexOf('--complete') + 1;
    const phase = args[phaseIndex];
    markWorkflowComplete(phase, 'CLI completion');
    process.exit(0);
  }
  
  const message = args.join(' ');
  
  if (!message) {
    console.error('Error: No message provided');
    process.exit(1);
  }
  
  const result = await orchestrate(message, { autoTrigger: true });
  
  console.log('═══════════════════════════════════════════');
  
  if (result.autoTriggered) {
    console.log('✨ Workflow auto-triggered based on intent');
  } else if (result.suggestions && result.suggestions.length > 0) {
    console.log('💡 Review suggestions above and proceed');
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
    orchestrate,
    markWorkflowComplete,
    resetState,
    getStatus,
    getNextAction,
    loadCompoundState,
    saveCompoundState,
    COMPOUND_COMMANDS,
  };
}
