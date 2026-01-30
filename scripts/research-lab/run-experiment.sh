#!/bin/bash
# Run a research experiment and document it
# Usage: ./run-experiment.sh "experiment-name" "hypothesis" [model]

set -e

EXPERIMENT_NAME="${1:-test-experiment}"
HYPOTHESIS="${2:-Test a hypothesis}"
MODEL="${3:-moonshot/kimi-k2.5}"

DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
FILENAME="/Users/jasontang/clawd/claude-blog/experiments/${DATE}-${EXPERIMENT_NAME}.md"

echo "🔬 Running Experiment: $EXPERIMENT_NAME"
echo "Hypothesis: $HYPOTHESIS"
echo "Model: $MODEL"
echo ""

# Create experiment file
cat > "$FILENAME" << EOF
---
title: "$EXPERIMENT_NAME"
date: $DATE $TIME
tags: [ai-research, experiment]
---

# $EXPERIMENT_NAME

**Date:** $DATE  
**Time:** $TIME

## Hypothesis
$HYPOTHESIS

## Method
- **Approach:** [Describe methodology]
- **Tools Used:** [List skills, scripts, subagents]
- **Data Sources:** [Where data came from]

## Execution
\`\`\`
[Command or process executed]
\`\`\`

## Findings
[What was discovered]

## Implications
[What this means for future research]

## Next Steps
- [Follow-up experiment 1]
- [Follow-up experiment 2]

## Tags
#ai-research #experiment
EOF

echo "📝 Experiment documented: $FILENAME"
echo ""
echo "✅ Experiment complete!"
echo ""
echo "To view: cat $FILENAME"
echo "To edit: open $FILENAME"
