#!/usr/bin/env node

/**
 * Ouroboros Intent Detection Test Suite
 * Tests GSD↔Ralph workflow patterns for robustness and coverage
 */

const { detectIntent, loadConfig } = require('./intent-detector.js');

// Test cases organized by workflow
const TEST_CASES = {
  'GSD → Ralph Full Orchestration': [
    { input: 'Build a complete authentication system with OAuth', expected: 'gsd-ralph-full', desc: 'Complex system' },
    { input: 'Create a full-stack SaaS platform from scratch', expected: 'gsd-ralph-full', desc: 'Production platform' },
    { input: 'Implement a new React feature with backend integration', expected: 'gsd-ralph-full', desc: 'Full-stack feature' },
    { input: 'Build an AI-powered content management system', expected: 'gsd-ralph-full', desc: 'AI + CMS' },
    { input: 'Create a scalable microservices architecture', expected: 'gsd-ralph-full', desc: 'Microservices' },
  ],
  
  'GSD Only (Planning/Discussion)': [
    { input: 'Should I use SQL or NoSQL for my analytics platform?', expected: 'gsd-only', desc: 'Architecture decision' },
    { input: 'What are the pros and cons of server components?', expected: 'gsd-only', desc: 'Discuss tradeoffs' },
    { input: 'Design the database schema for a social network', expected: 'gsd-only', desc: 'Schema design' },
    { input: 'Which auth strategy is better for a mobile app?', expected: 'gsd-only', desc: 'Auth decision' },
    { input: 'Discuss the architecture for real-time collaboration', expected: 'gsd-only', desc: 'Architecture discussion' },
  ],
  
  'Ralph Only (Quick Execution)': [
    { input: 'Fix the TypeScript error in auth.ts', expected: 'quick', desc: 'Quick fix' },
    { input: 'Add a button to the dashboard', expected: 'quick', desc: 'Simple addition' },
    { input: 'The login button is not working', expected: 'quick', desc: 'Bug fix' },
    { input: 'Update the README with new instructions', expected: 'quick', desc: 'Simple update' },
    { input: 'Change the primary color to blue', expected: 'quick', desc: 'Simple style change' },
  ],
  
  'Research Workflow': [
    { input: 'Research how to implement rate limiting in Node.js', expected: 'research', desc: 'Technical research' },
    { input: 'What is the best way to handle file uploads?', expected: 'research', desc: 'Best practices research' },
    { input: 'Explore the new React 19 features', expected: 'research', desc: 'Feature exploration' },
    { input: 'Find out how to optimize bundle size', expected: 'research', desc: 'Optimization research' },
    { input: 'Investigate performance issues with large lists', expected: 'research', desc: 'Performance investigation' },
  ],
  
  'Clarify (Ambiguous)': [
    { input: 'it', expected: 'clarify', desc: 'Single word' },
    { input: 'hello', expected: 'clarify', desc: 'Greeting' },
    { input: 'that thing we talked about', expected: 'clarify', desc: 'Vague reference' },
    { input: '?', expected: 'clarify', desc: 'Just a question mark' },
  ],
  
  'Edge Cases': [
    { input: 'BUILD A REACT APP', expected: 'gsd-ralph-full', desc: 'All caps' },
    { input: '  build a small feature  ', expected: 'quick', desc: 'Whitespace' },
    { input: 'Build a React app and also fix the bug', expected: 'gsd-ralph-full', desc: 'Mixed intent' },
    { input: 'implement feature (urgent)', expected: 'quick', desc: 'With urgency' },
  ],
};

// Test runner
async function runTests() {
  console.log('🧪 Ouroboros Intent Detection Test Suite\n');
  console.log('=' .repeat(60));
  
  let passed = 0;
  let failed = 0;
  const results = [];
  
  for (const [category, cases] of Object.entries(TEST_CASES)) {
    console.log(`\n📂 ${category}`);
    console.log('-'.repeat(60));
    
    for (const testCase of cases) {
      const result = await detectIntent(testCase.input, { noCache: true });
      const success = result.suggestedWorkflow === testCase.expected;
      
      if (success) {
        passed++;
        console.log(`  ✅ ${testCase.desc}: "${testCase.input.substring(0, 50)}..."`);
        console.log(`     → ${result.suggestedWorkflow} (${result.confidence}%)`);
      } else {
        failed++;
        console.log(`  ❌ ${testCase.desc}: "${testCase.input.substring(0, 50)}..."`);
        console.log(`     Expected: ${testCase.expected}, Got: ${result.suggestedWorkflow} (${result.confidence}%)`);
        console.log(`     Reasoning: ${result.reasoning}`);
      }
      
      results.push({
        category,
        ...testCase,
        actual: result.suggestedWorkflow,
        confidence: result.confidence,
        success,
      });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Summary`);
  console.log(`   Passed: ${passed}/${passed + failed} (${Math.round(passed / (passed + failed) * 100)}%)`);
  console.log(`   Failed: ${failed}/${passed + failed} (${Math.round(failed / (passed + failed) * 100)}%)\n`);
  
  // Failed tests detail
  if (failed > 0) {
    console.log('❌ Failed Tests:');
    console.log('-'.repeat(60));
    for (const r of results.filter(x => !x.success)) {
      console.log(`  ${r.category}: "${r.input.substring(0, 40)}..."`);
      console.log(`    Expected: ${r.expected}, Got: ${r.actual}`);
    }
    console.log();
  }
  
  // Coverage analysis
  console.log('📈 Workflow Coverage:');
  const workflows = {};
  for (const r of results) {
    workflows[r.actual] = (workflows[r.actual] || 0) + 1;
  }
  for (const [wf, count] of Object.entries(workflows)) {
    const bar = '█'.repeat(Math.round(count / results.length * 30));
    console.log(`   ${wf.padEnd(18)} ${bar} ${count}`);
  }
  
  // Save results
  const fs = require('fs');
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    summary: { passed, failed, total: passed + failed },
    results,
  };
  fs.writeFileSync(
    './memory/intent-test-results.json',
    JSON.stringify(report, null, 2)
  );
  console.log(`\n📄 Results saved to: memory/intent-test-results.json`);
  
  return failed === 0;
}

// Specific workflow validation
async function validateGSDRalphPatterns() {
  console.log('\n🎯 GSD↔Ralph Pattern Validation\n');
  console.log('='.repeat(60));
  
  const patterns = [
    {
      name: 'Complex Project → GSD+Ralph',
      tests: [
        'Build a complete authentication system',
        'Create a full-stack application from scratch',
        'Implement a new feature with database changes',
      ],
      expected: 'gsd-ralph-full',
    },
    {
      name: 'Quick Fix → Ralph Only',
      tests: [
        'Fix the bug in login.ts',
        'Add validation to the form',
        'Update the error message',
      ],
      expected: 'quick',
    },
    {
      name: 'Planning/Discussion → GSD Only',
      tests: [
        'Should I use Next.js or Remix?',
        'Design the data model',
        'Discuss authentication strategies',
      ],
      expected: 'gsd-only',
    },
  ];
  
  let allPass = true;
  for (const pattern of patterns) {
    console.log(`\n${pattern.name}:`);
    for (const test of pattern.tests) {
      const result = await detectIntent(test, { noCache: true });
      const pass = result.suggestedWorkflow === pattern.expected;
      const symbol = pass ? '✅' : '❌';
      console.log(`  ${symbol} "${test}" → ${result.suggestedWorkflow}`);
      if (!pass) allPass = false;
    }
  }
  
  return allPass;
}

// Run tests
const success = runTests();
const patternsValid = validateGSDRalphPatterns();

console.log('\n' + '='.repeat(60));
if (success && patternsValid) {
  console.log('\n🎉 All tests passed! Ouroboros intent detection is ready.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Review the output above.\n');
  process.exit(1);
}
