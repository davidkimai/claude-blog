#!/usr/bin/env node

/**
 * Ouroboros Bottleneck Detector (Phase 2 - US-006)
 * 
 * Detect workflow bottlenecks and suggest unblocking actions:
 * - Monitor time since last progress
 * - Detect common bottleneck patterns
 * - Suggest specific unblocking actions
 * 
 * Usage:
 *   node bottleneck-detector.js check <context-json>
 *   node bottleneck-detector.js report
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, '../memory');
const PROGRESS_LOG = path.join(MEMORY_DIR, 'progress-tracking.jsonl');
const BOTTLENECK_LOG = path.join(MEMORY_DIR, 'bottlenecks.jsonl');

// Time thresholds (milliseconds)
const THRESHOLDS = {
  NO_PROGRESS: 30 * 60 * 1000,        // 30 minutes
  STALLED: 2 * 60 * 60 * 1000,        // 2 hours
  BLOCKED: 24 * 60 * 60 * 1000,       // 24 hours
};

// Bottleneck pattern definitions
const BOTTLENECK_PATTERNS = {
  waiting_verification: {
    keywords: ['verify', 'check', 'confirm', 'validate', 'test', 'waiting', 'need to check'],
    severity: 'medium',
    suggestions: [
      'Run automated tests if available',
      'Create a verification checklist',
      'Break down into smaller testable pieces',
      'Use laboratory skill for systematic verification',
    ],
  },
  
  unclear_requirements: {
    keywords: ['unclear', 'not sure', 'what should', 'which way', 'how to', 'confused', 'ambiguous'],
    severity: 'high',
    suggestions: [
      'Ask specific clarifying questions',
      'Create a requirements checklist',
      'Document assumptions and get confirmation',
      'Use GSD skill to break down requirements',
    ],
  },
  
  technical_blocker: {
    keywords: ['error', 'bug', 'failing', 'broken', 'doesn\'t work', 'crash', 'exception'],
    severity: 'high',
    suggestions: [
      'Use laboratory skill for debugging',
      'Add logging/diagnostics',
      'Search for similar issues',
      'Create minimal reproduction case',
    ],
  },
  
  dependency_wait: {
    keywords: ['waiting for', 'blocked by', 'depends on', 'need', 'requires', 'external'],
    severity: 'medium',
    suggestions: [
      'Work on parallel tasks',
      'Create mock/stub for dependency',
      'Follow up on blocking dependency',
      'Document what is blocking progress',
    ],
  },
  
  decision_paralysis: {
    keywords: ['should I', 'or should', 'which is better', 'not decided', 'options', 'alternatives'],
    severity: 'medium',
    suggestions: [
      'Use GSD skill for decision analysis',
      'List pros/cons of each option',
      'Start with simplest option',
      'Time-box the decision (pick within X minutes)',
    ],
  },
  
  scope_creep: {
    keywords: ['also add', 'what about', 'should we also', 'expanding', 'additional', 'and also'],
    severity: 'low',
    suggestions: [
      'Defer non-critical features',
      'Create backlog for future work',
      'Focus on original scope',
      'Document scope boundaries',
    ],
  },
  
  complexity_overwhelm: {
    keywords: ['too complex', 'overwhelming', 'too much', 'complicated', 'don\'t know where to start'],
    severity: 'high',
    suggestions: [
      'Break into smaller tasks',
      'Start with simplest component',
      'Use GSD for decomposition',
      'Focus on one piece at a time',
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
  
  if (!fs.existsSync(PROGRESS_LOG)) {
    fs.writeFileSync(PROGRESS_LOG, '', 'utf8');
  }
  
  if (!fs.existsSync(BOTTLENECK_LOG)) {
    fs.writeFileSync(BOTTLENECK_LOG, '', 'utf8');
  }
}

/**
 * Log progress event
 */
function logProgress(event) {
  ensureLogFiles();
  
  const progressRecord = {
    timestamp: new Date().toISOString(),
    type: event.type || 'milestone',
    description: event.description,
    metadata: event.metadata || {},
  };
  
  fs.appendFileSync(PROGRESS_LOG, JSON.stringify(progressRecord) + '\n', 'utf8');
  
  return progressRecord;
}

/**
 * Get time since last progress
 */
function getTimeSinceLastProgress() {
  ensureLogFiles();
  
  try {
    const lines = fs.readFileSync(PROGRESS_LOG, 'utf8').trim().split('\n').filter(Boolean);
    
    if (lines.length === 0) {
      return null;
    }
    
    const lastLine = lines[lines.length - 1];
    const lastProgress = JSON.parse(lastLine);
    const timeSince = Date.now() - new Date(lastProgress.timestamp).getTime();
    
    return {
      lastProgress,
      timeSinceMs: timeSince,
      timeSinceMinutes: Math.floor(timeSince / 60000),
      timeSinceHours: (timeSince / 3600000).toFixed(1),
    };
  } catch (err) {
    return null;
  }
}

/**
 * Detect bottleneck patterns in context
 */
function detectBottleneckPatterns(context = {}) {
  const { recentMessages = [], currentState = '', metadata = {} } = context;
  
  const allText = [...recentMessages, currentState].join(' ').toLowerCase();
  
  const detectedPatterns = [];
  
  for (const [patternName, patternConfig] of Object.entries(BOTTLENECK_PATTERNS)) {
    const matches = patternConfig.keywords.filter(keyword => 
      allText.includes(keyword.toLowerCase())
    );
    
    if (matches.length > 0) {
      detectedPatterns.push({
        pattern: patternName,
        severity: patternConfig.severity,
        matchedKeywords: matches,
        suggestions: patternConfig.suggestions,
      });
    }
  }
  
  // Sort by severity (high → medium → low)
  const severityOrder = { high: 0, medium: 1, low: 2 };
  detectedPatterns.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  
  return detectedPatterns;
}

/**
 * Check for bottlenecks
 */
function checkForBottlenecks(context = {}) {
  const timeSinceProgress = getTimeSinceLastProgress();
  const patterns = detectBottleneckPatterns(context);
  
  // Determine bottleneck status
  let status = 'progressing';
  let statusReason = 'Making progress';
  
  if (!timeSinceProgress) {
    status = 'unknown';
    statusReason = 'No progress tracking data available';
  } else if (timeSinceProgress.timeSinceMs >= THRESHOLDS.BLOCKED) {
    status = 'blocked';
    statusReason = `No progress for ${timeSinceProgress.timeSinceHours} hours`;
  } else if (timeSinceProgress.timeSinceMs >= THRESHOLDS.STALLED) {
    status = 'stalled';
    statusReason = `Limited progress for ${timeSinceProgress.timeSinceHours} hours`;
  } else if (timeSinceProgress.timeSinceMs >= THRESHOLDS.NO_PROGRESS) {
    status = 'slowing';
    statusReason = `${timeSinceProgress.timeSinceMinutes} minutes since last progress`;
  }
  
  // Determine if this is a bottleneck worth logging
  const isBottleneck = status !== 'progressing' || patterns.length > 0;
  
  if (isBottleneck) {
    logBottleneck({
      status,
      statusReason,
      patterns,
      timeSinceProgress,
      context,
    });
  }
  
  // Generate unblocking suggestions
  const suggestions = new Set();
  
  // Add pattern-based suggestions
  patterns.forEach(p => {
    p.suggestions.forEach(s => suggestions.add(s));
  });
  
  // Add time-based suggestions
  if (status === 'blocked' || status === 'stalled') {
    suggestions.add('Re-evaluate approach - may need different strategy');
    suggestions.add('Ask for help or clarification');
    suggestions.add('Document what has been tried so far');
  }
  
  if (status === 'slowing') {
    suggestions.add('Review current task - is it clearly defined?');
    suggestions.add('Check if waiting on external input');
  }
  
  return {
    isBottleneck,
    status,
    statusReason,
    timeSinceProgress,
    detectedPatterns: patterns,
    suggestions: Array.from(suggestions).slice(0, 5),
    severity: patterns.length > 0 ? patterns[0].severity : 'low',
  };
}

/**
 * Log bottleneck occurrence
 */
function logBottleneck(bottleneck) {
  ensureLogFiles();
  
  const bottleneckRecord = {
    timestamp: new Date().toISOString(),
    status: bottleneck.status,
    reason: bottleneck.statusReason,
    patterns: bottleneck.patterns?.map(p => p.pattern) || [],
    timeSinceProgressMinutes: bottleneck.timeSinceProgress?.timeSinceMinutes || 0,
  };
  
  fs.appendFileSync(BOTTLENECK_LOG, JSON.stringify(bottleneckRecord) + '\n', 'utf8');
}

/**
 * Generate bottleneck report
 */
function generateReport() {
  ensureLogFiles();
  
  try {
    const bottleneckLines = fs.readFileSync(BOTTLENECK_LOG, 'utf8').trim().split('\n').filter(Boolean);
    const progressLines = fs.readFileSync(PROGRESS_LOG, 'utf8').trim().split('\n').filter(Boolean);
    
    const bottlenecks = bottleneckLines.map(line => JSON.parse(line));
    const progressEvents = progressLines.map(line => JSON.parse(line));
    
    // Count pattern occurrences
    const patternCounts = {};
    bottlenecks.forEach(b => {
      b.patterns.forEach(pattern => {
        patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
      });
    });
    
    // Sort by frequency
    const topPatterns = Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([pattern, count]) => ({ pattern, count }));
    
    // Status distribution
    const statusCounts = {};
    bottlenecks.forEach(b => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    });
    
    // Recent bottlenecks
    const recentBottlenecks = bottlenecks.slice(-10);
    
    return {
      summary: {
        totalBottlenecks: bottlenecks.length,
        totalProgressEvents: progressEvents.length,
        bottleneckRate: ((bottlenecks.length / Math.max(progressEvents.length, 1)) * 100).toFixed(1),
      },
      statusDistribution: statusCounts,
      topPatterns: topPatterns.slice(0, 5),
      recentBottlenecks: recentBottlenecks.map(b => ({
        timestamp: b.timestamp,
        status: b.status,
        reason: b.reason,
        patterns: b.patterns,
      })),
      currentStatus: getTimeSinceLastProgress(),
    };
  } catch (err) {
    return {
      error: 'Could not generate report',
      message: err.message,
    };
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === '--help' || command === '-h') {
    console.log(`
Ouroboros Bottleneck Detector

Usage:
  node bottleneck-detector.js check <context-json>    Check for bottlenecks
  node bottleneck-detector.js progress <description>  Log progress event
  node bottleneck-detector.js report                  Generate bottleneck report

Examples:
  node bottleneck-detector.js check '{"recentMessages":["waiting for verification"]}'
  node bottleneck-detector.js progress "Completed user authentication"
  node bottleneck-detector.js report
`);
    process.exit(0);
  }
  
  switch (command) {
    case 'check': {
      const jsonInput = args.slice(1).join(' ');
      const context = jsonInput ? JSON.parse(jsonInput) : {};
      
      const result = checkForBottlenecks(context);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    
    case 'progress': {
      const description = args.slice(1).join(' ');
      if (!description) {
        console.error('Error: Progress description required');
        process.exit(1);
      }
      
      const event = logProgress({ description });
      console.log(JSON.stringify(event, null, 2));
      break;
    }
    
    case 'report': {
      const report = generateReport();
      console.log(JSON.stringify(report, null, 2));
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
    checkForBottlenecks,
    logProgress,
    getTimeSinceLastProgress,
    detectBottleneckPatterns,
    generateReport,
    logBottleneck,
    THRESHOLDS,
    BOTTLENECK_PATTERNS,
  };
}
