#!/usr/bin/env node

/**
 * Ouroboros Safety Controller (Phase 3 - Simplified MVP)
 * 
 * Implements minimal safety boundaries for self-improvement:
 * - Human approval for code changes and skill installation
 * - Auto-approve for config/rules changes
 * - Basic audit trail (JSONL)
 * - No rollback system (deferred to post-MVP)
 * 
 * Based on SOUL.md principles:
 * - Minimal Authority
 * - Human Oversight
 * - Transparency
 */

const fs = require('fs');
const path = require('path');

// Action categories
const ACTIONS = {
  CONFIG_CHANGE: 'config_change',
  RULE_CHANGE: 'rule_change',
  CODE_CHANGE: 'code_change',
  SKILL_INSTALL: 'skill_install',
  WORKFLOW_START: 'workflow_start',
  PHASE_TRANSITION: 'phase_transition',
};

// Approval policies
const POLICIES = {
  OPTION_A: {
    auto_approve: ['config_change', 'rule_change'],
    human_approval: ['code_change', 'skill_install'],
    no_approval: ['workflow_start', 'phase_transition'],
  },
  OPTION_B: {
    auto_approve: [],
    human_approval: ['code_change', 'skill_install', 'config_change'],
    no_approval: ['workflow_start', 'phase_transition', 'rule_change'],
  },
};

class SafetyController {
  constructor(config = {}) {
    this.config = {
      policy: config.policy || 'option_a',
      auditPath: config.auditPath || path.join(__dirname, '../memory/safety-audit.jsonl'),
      maxIterations: config.maxIterations || 3,
      ...config
    };
    
    this.policy = POLICIES[this.config.policy.toUpperCase()];
    this.iterationCount = 0;
  }
  
  /**
   * Check if action requires approval
   */
  requiresApproval(action, context = {}) {
    const policy = this.policy;
    
    // Check iteration bounds
    if (this.iterationCount >= this.config.maxIterations) {
      return {
        required: true,
        reason: 'max_iterations_exceeded',
        message: `Maximum iterations (${this.config.maxIterations}) reached`
      };
    }
    
    // Check policy
    if (policy.auto_approve.includes(action)) {
      return { required: false, autoApproved: true };
    }
    
    if (policy.human_approval.includes(action)) {
      return {
        required: true,
        reason: 'policy',
        message: `Policy requires human approval for: ${action}`
      };
    }
    
    if (policy.no_approval.includes(action)) {
      return { required: false, autoApproved: false };
    }
    
    // Default: require approval for unknown actions
    return {
      required: true,
      reason: 'unknown_action',
      message: `Unknown action type: ${action}`
    };
  }
  
  /**
   * Execute action with safety checks
   */
  async execute(action, executeFn, context = {}) {
    const timestamp = new Date().toISOString();
    
    // Check approval
    const approvalCheck = this.requiresApproval(action, context);
    
    if (approvalCheck.required) {
      this.audit({
        timestamp,
        action,
        status: 'blocked',
        reason: approvalCheck.reason,
        message: approvalCheck.message,
        context
      });
      
      throw new Error(`Action blocked: ${approvalCheck.message}`);
    }
    
    // Execute
    try {
      const result = await executeFn();
      
      this.iterationCount++;
      
      this.audit({
        timestamp,
        action,
        status: 'success',
        autoApproved: approvalCheck.autoApproved,
        iteration: this.iterationCount,
        context,
        result: typeof result === 'object' ? JSON.stringify(result) : String(result)
      });
      
      return { success: true, result };
    } catch (error) {
      this.audit({
        timestamp,
        action,
        status: 'error',
        error: error.message,
        context
      });
      
      throw error;
    }
  }
  
  /**
   * Check bounds (simple version)
   */
  withinBounds(context = {}) {
    if (this.iterationCount >= this.config.maxIterations) {
      return {
        valid: false,
        reason: 'max_iterations',
        message: `Iteration limit (${this.config.maxIterations}) exceeded`
      };
    }
    
    return { valid: true };
  }
  
  /**
   * Audit action to JSONL
   */
  audit(entry) {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.config.auditPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.appendFileSync(this.config.auditPath, JSON.stringify(entry) + '\n');
    } catch (error) {
      console.error('[Safety] Audit failed:', error.message);
    }
  }
  
  /**
   * Read audit log
   */
  readAudit(limit = 100) {
    try {
      if (!fs.existsSync(this.config.auditPath)) {
        return [];
      }
      
      const data = fs.readFileSync(this.config.auditPath, 'utf8');
      const lines = data.trim().split('\n').filter(line => line);
      
      return lines
        .slice(-limit)
        .map(line => JSON.parse(line));
    } catch (error) {
      console.error('[Safety] Read audit failed:', error.message);
      return [];
    }
  }
  
  /**
   * Reset iteration counter
   */
  reset() {
    this.iterationCount = 0;
  }
  
  /**
   * Get current status
   */
  status() {
    return {
      policy: this.config.policy,
      iterations: this.iterationCount,
      maxIterations: this.config.maxIterations,
      withinBounds: this.iterationCount < this.config.maxIterations
    };
  }
}

/**
 * CLI Interface
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Ouroboros Safety Controller

Usage:
  node safety-controller.js status
  node safety-controller.js check <action>
  node safety-controller.js audit [limit]
  node safety-controller.js reset

Commands:
  status       Show current safety status
  check        Check if action requires approval
  audit        Read audit log (default: 100 entries)
  reset        Reset iteration counter

Examples:
  node safety-controller.js status
  node safety-controller.js check code_change
  node safety-controller.js audit 50
`);
    process.exit(0);
  }
  
  const command = args[0];
  const safety = new SafetyController();
  
  switch (command) {
    case 'status':
      console.log(JSON.stringify(safety.status(), null, 2));
      break;
    
    case 'check':
      if (!args[1]) {
        console.error('Error: Action required');
        console.error('Available actions:', Object.values(ACTIONS).join(', '));
        process.exit(1);
      }
      const check = safety.requiresApproval(args[1]);
      console.log(JSON.stringify(check, null, 2));
      break;
    
    case 'audit':
      const limit = args[1] ? parseInt(args[1], 10) : 100;
      const entries = safety.readAudit(limit);
      console.log(JSON.stringify(entries, null, 2));
      break;
    
    case 'reset':
      safety.reset();
      console.log('✓ Iteration counter reset');
      break;
    
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

if (require.main === module) {
  main();
} else {
  module.exports = {
    SafetyController,
    ACTIONS,
    POLICIES,
  };
}
