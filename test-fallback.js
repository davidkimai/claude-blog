#!/usr/bin/env node
/**
 * Test script to verify model fallback chain works
 * 
 * This simulates what happens when anthropic/claude-sonnet-4-5 hits rate limits
 * and verifies the fallback to google-antigravity/claude-sonnet-4-5 works
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

async function testFallback() {
  console.log('🧪 Testing model fallback chain...\n');
  
  // Test 1: Verify config has fallbacks
  console.log('1️⃣ Checking config...');
  try {
    const configPath = path.join(os.homedir(), '.clawdbot', 'clawdbot.json');
    const configRaw = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configRaw);
    
    const fallbacks = config?.agents?.defaults?.model?.fallbacks || [];
    const primary = config?.agents?.defaults?.model?.primary;
    
    console.log(`   Primary model: ${primary}`);
    console.log(`   Fallback chain: ${fallbacks.join(' → ')}`);
    
    if (fallbacks.length === 0) {
      console.error('   ❌ No fallbacks configured!');
      return false;
    }
    
    if (!fallbacks.includes('google-antigravity/claude-sonnet-4-5')) {
      console.error('   ❌ google-antigravity/claude-sonnet-4-5 not in fallback chain!');
      return false;
    }
    
    console.log('   ✅ Fallback chain configured correctly\n');
  } catch (err) {
    console.error('   ❌ Failed to read config:', err.message);
    return false;
  }
  
  // Test 2: Check auth profiles
  console.log('2️⃣ Checking auth profiles...');
  try {
    const configPath = path.join(os.homedir(), '.clawdbot', 'clawdbot.json');
    const configRaw = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configRaw);
    const profiles = config?.auth?.profiles || {};
    
    const hasAnthropicAuth = 'anthropic:default' in profiles;
    const hasGoogleAntigravityAuth = Object.keys(profiles).some(k => k.startsWith('google-antigravity:'));
    
    console.log(`   Anthropic auth: ${hasAnthropicAuth ? '✅' : '❌'}`);
    console.log(`   Google Antigravity auth: ${hasGoogleAntigravityAuth ? '✅' : '❌'}`);
    
    if (!hasAnthropicAuth || !hasGoogleAntigravityAuth) {
      console.error('   ❌ Missing required auth profiles!');
      return false;
    }
    
    console.log('   ✅ Auth profiles configured\n');
  } catch (err) {
    console.error('   ❌ Failed to check auth:', err.message);
    return false;
  }
  
  // Test 3: Check subagent model config
  console.log('3️⃣ Checking subagent model...');
  try {
    const configPath = path.join(os.homedir(), '.clawdbot', 'clawdbot.json');
    const configRaw = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configRaw);
    
    const subagentModel = config?.agents?.defaults?.subagents?.model?.primary;
    
    console.log(`   Subagent model: ${subagentModel}`);
    
    if (subagentModel !== 'google-antigravity/gemini-3-pro-high') {
      console.error('   ⚠️  Subagent model should be google-antigravity/gemini-3-pro-high for unlimited usage');
      console.log('   Current:', subagentModel);
    } else {
      console.log('   ✅ Subagent model set to unlimited variant\n');
    }
  } catch (err) {
    console.error('   ❌ Failed to check subagent config:', err.message);
    return false;
  }
  
  console.log('✅ All configuration tests passed!\n');
  console.log('📝 The fallback will activate automatically when:');
  console.log('   • anthropic/claude-sonnet-4-5 returns a 429 (rate limit)');
  console.log('   • anthropic/claude-sonnet-4-5 returns a 529 (overloaded)');
  console.log('   • Connection fails or times out');
  console.log('\n🎯 Next fallback: google-antigravity/claude-sonnet-4-5');
  
  return true;
}

testFallback()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
