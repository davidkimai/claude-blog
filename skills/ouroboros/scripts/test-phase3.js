#!/usr/bin/env node

/**
 * Ouroboros Phase 3 Integration Test
 * 
 * Tests:
 * 1. Intent detection with caching
 * 2. LLM fallback trigger (low confidence)
 * 3. Safety controller approvals
 * 4. Workflow monitor state
 */

const { detectIntent, loadConfig } = require('./intent-detector.js');
const { SafetyController, ACTIONS } = require('./safety-controller.js');
const { WorkflowMonitor } = require('./workflow-monitor.js');

async function runTests() {
  console.log('=== Ouroboros Phase 3 Integration Test ===\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Intent Detection (High Confidence)
  console.log('Test 1: High confidence intent detection');
  try {
    const result1 = await detectIntent('Build a React auth system with better-auth');
    
    if (result1.intent === 'create_project' && result1.confidence >= 70) {
      console.log('✅ PASS - Detected create_project with high confidence');
      console.log(`   Confidence: ${result1.confidence}%, LLM Used: ${result1.llmUsed}`);
      passed++;
    } else {
      console.log('❌ FAIL - Unexpected result');
      console.log(JSON.stringify(result1, null, 2));
      failed++;
    }
  } catch (error) {
    console.log('❌ FAIL - Error:', error.message);
    failed++;
  }
  
  // Test 2: Context Caching
  console.log('\nTest 2: Context caching');
  try {
    const result2a = await detectIntent('Fix the TypeScript error in auth.ts');
    const result2b = await detectIntent('Fix the TypeScript error in auth.ts');
    
    if (!result2a.fromCache && result2b.fromCache) {
      console.log('✅ PASS - Cache working');
      console.log(`   First call: fromCache=${result2a.fromCache}`);
      console.log(`   Second call: fromCache=${result2b.fromCache}`);
      passed++;
    } else {
      console.log('❌ FAIL - Cache not working');
      console.log(`   First: ${result2a.fromCache}, Second: ${result2b.fromCache}`);
      failed++;
    }
  } catch (error) {
    console.log('❌ FAIL - Error:', error.message);
    failed++;
  }
  
  // Test 3: Safety Controller - Auto Approve
  console.log('\nTest 3: Safety controller auto-approve');
  try {
    const safety = new SafetyController();
    const check = safety.requiresApproval(ACTIONS.CONFIG_CHANGE);
    
    if (!check.required && check.autoApproved) {
      console.log('✅ PASS - Config changes auto-approved');
      console.log(`   Required: ${check.required}, Auto: ${check.autoApproved}`);
      passed++;
    } else {
      console.log('❌ FAIL - Unexpected approval requirement');
      console.log(JSON.stringify(check, null, 2));
      failed++;
    }
  } catch (error) {
    console.log('❌ FAIL - Error:', error.message);
    failed++;
  }
  
  // Test 4: Safety Controller - Human Approval
  console.log('\nTest 4: Safety controller human approval');
  try {
    const safety = new SafetyController();
    const check = safety.requiresApproval(ACTIONS.CODE_CHANGE);
    
    if (check.required && check.reason === 'policy') {
      console.log('✅ PASS - Code changes require human approval');
      console.log(`   Required: ${check.required}, Reason: ${check.reason}`);
      passed++;
    } else {
      console.log('❌ FAIL - Code changes should require approval');
      console.log(JSON.stringify(check, null, 2));
      failed++;
    }
  } catch (error) {
    console.log('❌ FAIL - Error:', error.message);
    failed++;
  }
  
  // Test 5: Workflow Monitor
  console.log('\nTest 5: Workflow monitor state');
  try {
    const monitor = new WorkflowMonitor();
    const state = monitor.getState();
    
    if (state && state.currentPhase) {
      console.log('✅ PASS - Workflow monitor working');
      console.log(`   Current phase: ${state.currentPhase}`);
      passed++;
    } else {
      console.log('❌ FAIL - Invalid state');
      console.log(JSON.stringify(state, null, 2));
      failed++;
    }
  } catch (error) {
    console.log('❌ FAIL - Error:', error.message);
    failed++;
  }
  
  // Test 6: Config Threshold
  console.log('\nTest 6: Config threshold');
  try {
    const config = loadConfig();
    
    if (config.intent_detection.min_confidence_threshold === 40) {
      console.log('✅ PASS - Threshold lowered to 40%');
      console.log(`   Threshold: ${config.intent_detection.min_confidence_threshold}%`);
      passed++;
    } else {
      console.log('❌ FAIL - Threshold not updated');
      console.log(`   Expected: 40, Got: ${config.intent_detection.min_confidence_threshold}`);
      failed++;
    }
  } catch (error) {
    console.log('❌ FAIL - Error:', error.message);
    failed++;
  }
  
  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Total: ${passed + failed}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All Phase 3 tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite error:', err.message);
  process.exit(1);
});
