const { detectIntent } = require('./scripts/intent-detector.js');

async function test() {
  const tests = [
    'Build a React auth system',
    'Fix the TypeScript error in auth.ts',
    'Which auth strategy is better?',
    'Update the README',
    'Build a React app and also fix the bug',
    'implement feature (urgent)',
  ];

  for (const test of tests) {
    const result = await detectIntent(test);
    console.log(`"${test.substring(0, 40)}..." → ${result.suggestedWorkflow} (${result.confidence}%) ${result.isCompound ? '[COMPOUND]' : ''}`);
  }
}

test().catch(console.error);
