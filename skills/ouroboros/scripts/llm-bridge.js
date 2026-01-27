#!/usr/bin/env node

/**
 * Simple LLM Bridge for Ouroboros
 * Returns null if Claude is not available
 */

async function callClaude(prompt) {
  // Return null if no Claude access
  // In production, this would call the Claude API
  return null;
}

module.exports = { callClaude };
