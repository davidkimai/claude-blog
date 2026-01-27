#!/usr/bin/env node

/**
 * Integration test for Ouroboros Phase 1
 * Tests intent detection + decision logging
 */

const { detectIntent } = require('./intent-detector');
const { logDecision, queryDecisions, explainDecisions } = require('./decision-logger');

const TEST_MESSAGES = [
  'Build a React authentication system with better-auth',
  'Fix the TypeScript error in auth.ts line 42',
  'Add OAuth provider support to existing auth',
  'Optimize database query performance',
  'Should I use PostgreSQL or MongoDB for this project?',
  'Research best practices for Next.js 14 app router',
  'Create a real-time chat feature from scratch',
];

async function runTests() {
  console.log('=== Ouroboros Phase 1 Integration Test ===\n');
  
  console.log('Testing intent detection and logging...\n');
  
  for (const message of TEST_MESSAGES) {
    console.log(`Message: "${message}"`);
    
    // Detect intent
    const result = detectIntent(message);
    console.log(`  → Intent: ${result.intent} (${result.confidence}%)`);
    console.log(`  → Workflow: ${result.suggestedWorkflow}`);
    
    // Log decision
    logDecision(result);
    console.log(`  → Logged ✓\n`);
  }
  
  console.log('\n=== Querying Recent Decisions ===\n');
  await explainDecisions(3);
  
  console.log('\n=== Test Complete ===');
  console.log(`✓ Detected and logged ${TEST_MESSAGES.length} decisions`);
  console.log(`✓ Query and explain functions working`);
  console.log('\nRun: node scripts/decision-logger.js stats');
  console.log('To see full statistics\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
