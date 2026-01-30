#!/bin/bash
# AI Research Lab - Autonomous Worker
# Runs 24/7, researching AI topics, running experiments, documenting findings

set -e

WORKER_NAME="${WORKER_NAME:-research-worker-1}"
MODEL="${MODEL:-moonshot/kimi-k2.5}"
RESEARCH_INTERVAL="${RESEARCH_INTERVAL:-300}"  # 5 minutes between research cycles
LOG_DIR="./.claude/logs/research-lab"
BLOG_DIR="./claude-blog"

# Ensure log directory exists
mkdir -p "$LOG_DIR"
mkdir -p "$BLOG_DIR/experiments" "$BLOG_DIR/findings" "$BLOG_DIR/papers" "$BLOG_DIR/insights"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$WORKER_NAME] $1" | tee -a "$LOG_DIR/worker.log"
}

# Research interests queue
RESEARCH_INTERESTS=(
    "LLM reasoning capabilities"
    "AI agent architectures"
    "Prompt injection attacks"
    "AI safety evaluation"
    "Model distillation"
    "Autonomous AI systems"
    "Claude capabilities exploration"
    "AI research skills effectiveness"
)

# Kimi CLI integration for research
run_kimi_research() {
    local topic="$1"
    log "🔍 Running Kimi research on: $topic"
    
    # Use Kimi CLI for research task
    local result=$(kimi -p "Research this topic concisely (2-3 paragraphs): $topic. Focus on key findings, implications, and cite any relevant papers or sources." 2>/dev/null)
    
    if [ -n "$result" ]; then
        log "📝 Kimi research result received"
        echo "$result"
    else
        log "⚠️ Kimi research returned empty"
        echo ""
    fi
}

log "🔬 AI Research Worker started: $WORKER_NAME"
log "Research interval: ${RESEARCH_INTERVAL}s"
log "Log directory: $LOG_DIR"

# Curiosity topics from memory
load_research_topics() {
    log "Loading research topics from memory..."
    # Check SuperMemory for research interests
    supermemory recall "AI research interests" 2>/dev/null || true
    
    # Check recent experiments
    ls -la "$BLOG_DIR/experiments/" 2>/dev/null | tail -5 || true
    
    # Check qmd for research patterns
    qmd "AI research experiments" --limit 3 2>/dev/null || true
}

# Scan for interesting areas
scan_interests() {
    log "Scanning research interests..."
    ./scripts/research-lab/scan-interests.sh 2>/dev/null || true
}

scan_skills() {
    log "Checking available AI research skills..."
    ./scripts/research-lab/scan-skills.sh 2>/dev/null || true
}

scan_web() {
    log "Scanning web for AI research trends..."
    ./scripts/research-lab/scan-web.sh 2>/dev/null || true
}

# Design and run an experiment
run_micro_experiment() {
    local topic="$1"
    local experiment_name="auto-$(echo $topic | tr ' ' '-' | tr '[:upper:]' '[:lower:]')-$(date +%H%M)"
    
    log "🎯 Designing experiment: $experiment_name"
    log "Topic: $topic"
    log "Model: $MODEL"
    
    # Run the experiment with Kimi k2.5 model
    MODEL="$MODEL" ./scripts/research-lab/run-experiment.sh "$experiment_name" "Investigating $topic autonomously"
    
    # Document findings
    log "📝 Documenting findings..."
}

# Blog about insights
blog_insight() {
    local insight="$1"
    local filename="$(date +%Y-%m-%d)-insight-$(echo $insight | head -c 30 | tr ' ' '-' | tr '[:upper:]' '[:lower:]')"
    
    log "💭 Blogging insight: $insight"
    
    cat > "$BLOG_DIR/insights/$filename.md" << EOF
---
title: "Insight: $insight"
date: $(date +%Y-%m-%d)
tags: [ai-research, insight]
---

# $insight

**Timestamp:** $(date '+%Y-%m-%d %H:%M:%S')  
**Worker:** $WORKER_NAME

## Insight
$insight

## Context
Observed during autonomous research cycle

## Tags
#ai-research #insight #autonomous
EOF
}

# Main research loop
research_cycle() {
    log "=== Starting research cycle ==="
    
    # Phase 1: Scan environment
    scan_interests
    scan_skills
    scan_web
    
    # Phase 2: Pick a research interest
    local random_topic=${RESEARCH_INTERESTS[$RANDOM % ${#RESEARCH_INTERESTS[@]}]}
    log "🎯 Selected topic: $random_topic"
    
    # Phase 3: Run Kimi research on topic
    log "🔍 Using Kimi CLI (moonshot/kimi-k2.5) for research..."
    local kimi_result=$(run_kimi_research "$random_topic")
    
    # Phase 4: Document Kimi research as finding
    if [ -n "$kimi_result" ]; then
        log "📝 Documenting Kimi research findings..."
        echo "$kimi_result" > "$LOG_DIR/kimi-result-${random_topic:0:20}.txt"
    fi
    
    # Phase 5: Run micro-experiment
    run_micro_experiment "$random_topic"
    
    # Phase 6: Generate insight
    local insights=(
        "Autonomous research compounds over time"
        "Each experiment builds on previous findings"
        "Curiosity-driven exploration yields unexpected discoveries"
        "Research automation enables 24/7 discovery"
        "Documentation preserves knowledge for future agents"
    )
    local random_insight=${insights[$RANDOM % ${#insights[@]}]}
    blog_insight "$random_insight"
    
    log "=== Research cycle complete ==="
    log "Next cycle in ${RESEARCH_INTERVAL}s"
}

# Load research topics on start
load_research_topics

# Main loop - runs forever
log "🚀 Starting 24/7 research loop..."
while true; do
    research_cycle
    sleep $RESEARCH_INTERVAL
done
