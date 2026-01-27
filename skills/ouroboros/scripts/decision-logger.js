#!/usr/bin/env node

/**
 * Ouroboros Decision Logger (Phase 1 - US-008)
 * 
 * Append-only JSONL audit trail for all intent detection decisions.
 * Provides explainability and decision history.
 * 
 * Usage:
 *   node decision-logger.js log <detection-result-json>
 *   node decision-logger.js query [--limit N] [--intent TYPE]
 *   node decision-logger.js explain [N]
 *   node decision-logger.js stats
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const MEMORY_DIR = path.join(__dirname, '../memory');
const LOG_FILE = path.join(MEMORY_DIR, 'ouroboros-decisions.jsonl');
const CONFIG_FILE = path.join(MEMORY_DIR, 'ouroboros-config.json');

/**
 * Ensure memory directory and log file exist
 */
function ensureLogFile() {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '', 'utf8');
  }
}

/**
 * Load configuration
 */
function loadConfig() {
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {
      intent_detection: {
        min_confidence_threshold: 70,
        use_llm_fallback: true,
        log_all_detections: true,
      },
      workflow_routing: {
        auto_execute: false,
        require_confirmation: true,
        default_workflow: 'clarify',
      },
      audit: {
        max_log_entries: 10000,
        log_path: 'memory/ouroboros-decisions.jsonl',
      },
    };
  }
}

/**
 * Append a decision to the log
 */
function logDecision(decision) {
  ensureLogFile();
  
  // Ensure decision has timestamp
  if (!decision.timestamp) {
    decision.timestamp = new Date().toISOString();
  }
  
  // Append to JSONL file
  const line = JSON.stringify(decision) + '\n';
  fs.appendFileSync(LOG_FILE, line, 'utf8');
  
  // Check if we need to rotate
  const config = loadConfig();
  rotateIfNeeded(config.audit.max_log_entries);
  
  return decision;
}

/**
 * Rotate log file if it exceeds max entries
 */
function rotateIfNeeded(maxEntries) {
  const lineCount = countLines();
  
  if (lineCount > maxEntries) {
    console.error(`⚠️  Log file has ${lineCount} entries (max: ${maxEntries}). Rotating...`);
    
    // Read all lines
    const lines = fs.readFileSync(LOG_FILE, 'utf8').trim().split('\n');
    
    // Keep only the most recent entries
    const keepLines = lines.slice(-maxEntries);
    
    // Archive old entries
    const archivePath = LOG_FILE.replace('.jsonl', `-archive-${Date.now()}.jsonl`);
    const archiveLines = lines.slice(0, lines.length - maxEntries);
    fs.writeFileSync(archivePath, archiveLines.join('\n') + '\n', 'utf8');
    
    // Write kept entries back
    fs.writeFileSync(LOG_FILE, keepLines.join('\n') + '\n', 'utf8');
    
    console.error(`✓ Archived ${archiveLines.length} entries to ${path.basename(archivePath)}`);
  }
}

/**
 * Count lines in log file
 */
function countLines() {
  if (!fs.existsSync(LOG_FILE)) {
    return 0;
  }
  
  const content = fs.readFileSync(LOG_FILE, 'utf8').trim();
  return content ? content.split('\n').length : 0;
}

/**
 * Query decisions with filters
 */
async function queryDecisions(options = {}) {
  ensureLogFile();
  
  const {
    limit = 10,
    intent = null,
    minConfidence = null,
    workflow = null,
  } = options;
  
  const decisions = [];
  
  // Read file line by line (streaming for large files)
  const fileStream = fs.createReadStream(LOG_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  
  for await (const line of rl) {
    if (!line.trim()) continue;
    
    try {
      const decision = JSON.parse(line);
      
      // Apply filters
      if (intent && decision.intent !== intent) continue;
      if (minConfidence && decision.confidence < minConfidence) continue;
      if (workflow && decision.suggestedWorkflow !== workflow) continue;
      
      decisions.push(decision);
    } catch (err) {
      console.error(`Error parsing line: ${line.substring(0, 50)}...`);
    }
  }
  
  // Return most recent entries
  return decisions.slice(-limit);
}

/**
 * Explain recent decisions
 */
async function explainDecisions(limit = 5) {
  const decisions = await queryDecisions({ limit });
  
  if (decisions.length === 0) {
    console.log('No decisions logged yet.');
    return;
  }
  
  console.log(`\n=== Recent Decisions (${decisions.length}) ===\n`);
  
  for (let i = 0; i < decisions.length; i++) {
    const d = decisions[i];
    const timestamp = new Date(d.timestamp).toLocaleString();
    
    console.log(`[${i + 1}] ${timestamp}`);
    console.log(`    Message: "${d.message.substring(0, 60)}${d.message.length > 60 ? '...' : ''}"`);
    console.log(`    Intent: ${d.intent} (${d.confidence}% confidence)`);
    console.log(`    Workflow: ${d.suggestedWorkflow}`);
    console.log(`    Reasoning: ${d.reasoning}`);
    
    if (d.entities && Object.keys(d.entities).length > 0) {
      const entityStr = Object.entries(d.entities)
        .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join(',') : v}`)
        .join(', ');
      console.log(`    Entities: {${entityStr}}`);
    }
    
    console.log();
  }
}

/**
 * Generate statistics from log
 */
async function generateStats() {
  const allDecisions = await queryDecisions({ limit: 10000 });
  
  if (allDecisions.length === 0) {
    console.log('No decisions logged yet.');
    return;
  }
  
  // Count by intent
  const intentCounts = {};
  const workflowCounts = {};
  let totalConfidence = 0;
  let llmUsedCount = 0;
  
  for (const d of allDecisions) {
    intentCounts[d.intent] = (intentCounts[d.intent] || 0) + 1;
    workflowCounts[d.suggestedWorkflow] = (workflowCounts[d.suggestedWorkflow] || 0) + 1;
    totalConfidence += d.confidence || 0;
    if (d.llmUsed) llmUsedCount++;
  }
  
  const avgConfidence = totalConfidence / allDecisions.length;
  
  console.log('\n=== Decision Log Statistics ===\n');
  console.log(`Total Decisions: ${allDecisions.length}`);
  console.log(`Average Confidence: ${avgConfidence.toFixed(1)}%`);
  console.log(`LLM Used: ${llmUsedCount} (${((llmUsedCount / allDecisions.length) * 100).toFixed(1)}%)\n`);
  
  console.log('Intent Distribution:');
  for (const [intent, count] of Object.entries(intentCounts).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / allDecisions.length) * 100).toFixed(1);
    console.log(`  ${intent}: ${count} (${pct}%)`);
  }
  
  console.log('\nWorkflow Distribution:');
  for (const [workflow, count] of Object.entries(workflowCounts).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / allDecisions.length) * 100).toFixed(1);
    console.log(`  ${workflow}: ${count} (${pct}%)`);
  }
  
  console.log();
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === '--help' || command === '-h') {
    console.log(`
Ouroboros Decision Logger

Usage:
  node decision-logger.js log <json>           Log a decision (JSON string or file)
  node decision-logger.js query [options]      Query decisions with filters
  node decision-logger.js explain [limit]      Show recent decisions with explanations
  node decision-logger.js stats                Generate statistics from log

Query Options:
  --limit N           Number of results (default: 10)
  --intent TYPE       Filter by intent type
  --confidence MIN    Minimum confidence threshold
  --workflow TYPE     Filter by workflow type

Examples:
  node decision-logger.js log '{"intent":"create_project","confidence":92,...}'
  node decision-logger.js query --limit 20 --intent create_project
  node decision-logger.js explain 5
  node decision-logger.js stats
`);
    process.exit(0);
  }
  
  switch (command) {
    case 'log': {
      const jsonInput = args.slice(1).join(' ');
      
      if (!jsonInput) {
        console.error('Error: No decision data provided');
        process.exit(1);
      }
      
      try {
        const decision = JSON.parse(jsonInput);
        const logged = logDecision(decision);
        console.log('✓ Decision logged');
        console.log(JSON.stringify(logged, null, 2));
      } catch (err) {
        console.error('Error: Invalid JSON input');
        console.error(err.message);
        process.exit(1);
      }
      break;
    }
    
    case 'query': {
      const options = {};
      
      for (let i = 1; i < args.length; i += 2) {
        const flag = args[i];
        const value = args[i + 1];
        
        if (flag === '--limit') options.limit = parseInt(value);
        else if (flag === '--intent') options.intent = value;
        else if (flag === '--confidence') options.minConfidence = parseInt(value);
        else if (flag === '--workflow') options.workflow = value;
      }
      
      const results = await queryDecisions(options);
      console.log(JSON.stringify(results, null, 2));
      break;
    }
    
    case 'explain': {
      const limit = args[1] ? parseInt(args[1]) : 5;
      await explainDecisions(limit);
      break;
    }
    
    case 'stats': {
      await generateStats();
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
    logDecision,
    queryDecisions,
    explainDecisions,
    generateStats,
    loadConfig,
    ensureLogFile,
  };
}
