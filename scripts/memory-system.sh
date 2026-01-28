#!/bin/bash
#
# Three-Layer Memory System for Claude Hours
# Based on @spacepixel's memory upgrade guide
# Strategic implementation for compounding intelligence
#

set -euo pipefail

CLAWD="/Users/jasontang/clawd"
MEMORY_DIR="$CLAWD/memory"
LIFE_DIR="$CLAWD/life"
AREAS_DIR="$LIFE_DIR/areas"
ENTITIES_DIR="$AREAS_DIR/.entities"
SYNTHESIS_DIR="$LIFE_DIR/synthesis"
STATE_DIR="$CLAWD/.claude/state"
CRON_DIR="$CLAWD/system/schedules"

mkdir -p "$MEMORY_DIR" "$LIFE_DIR" "$AREAS_DIR" "$ENTITIES_DIR" "$SYNTHESIS_DIR" "$STATE_DIR" "$CRON_DIR"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ts() { date '+%Y-%m-%d %H:%M:%S'; }
date_only() { date '+%Y-%m-%d'; }
week_start() { date -v-"$(date +%w)"d '+%Y-%m-%d' 2>/dev/null || date -d "last $(date +%A)" '+%Y-%m-%d' 2>/dev/null || echo "$(date '+%Y-%m-%d')"; }

log() { echo "[$(ts)] [MEMORY] $1" >> "$STATE_DIR/memory.log"; }

# === LAYER 1: KNOWLEDGE GRAPH ===

# Create entity directory structure
init_knowledge_graph() {
    log "Initializing knowledge graph structure..."
    
    # Entity categories
    local categories=("people" "companies" "projects" "topics" "preferences" "patterns")
    
    for cat in "${categories[@]}"; do
        mkdir -p "$ENTITIES_DIR/$cat"
    done
    
    # Create index files
    cat > "$ENTITIES_DIR/index.json" << EOF
{
  "created": "$(ts)",
  "categories": ["people", "companies", "projects", "topics", "preferences", "patterns"],
  "strategy": "Entity-based storage with atomic facts"
}
EOF
    
    log "Knowledge graph initialized at $ENTITIES_DIR"
}

# Add fact to knowledge graph
add_fact() {
    local entity="$1"
    local category="$2"
    local fact="$3"
    local source="${4:-conversation}"
    
    local entity_dir="$ENTITIES_DIR/$category/$entity"
    mkdir -p "$entity_dir"
    
    local fact_file="$entity_dir/facts.jsonl"
    local timestamp=$(date -Iseconds)
    
    # Append atomic fact
    echo "{\"timestamp\":\"$timestamp\",\"fact\":\"$fact\",\"source\":\"$source\"}" >> "$fact_file"
    
    log "Fact added: $entity/$category - $fact"
    
    # Update living summary
    update_living_summary "$entity" "$category" "$fact"
}

# Update living summary for entity
update_living_summary() {
    local entity="$1"
    local category="$2"
    local new_fact="$3"
    
    local summary_file="$ENTITIES_DIR/$category/$entity/summary.md"
    local timestamp=$(date '+%Y-%m-%d')
    
    # Append to living summary
    echo "" >> "$summary_file" 2>/dev/null || true
    echo "## Updated: $timestamp" >> "$summary_file" 2>/dev/null || true
    echo "- $new_fact" >> "$summary_file" 2>/dev/null || true
}

# === LAYER 2: DAILY NOTES ===
# (Already exists - memory/YYYY-MM-DD.md)

extract_facts_from_conversation() {
    local conversation_file="$1"
    local output_file="$MEMORY_DIR/extracted-facts-$(date_only).jsonl"
    
    log "Extracting facts from $conversation_file..."
    
    # Simple fact extraction patterns
    local patterns=(
        "I like|I prefer|My preference"
        "I work at|I work for|My company"
        "My boss|My manager|My team"
        "My goal|My objective|I'm trying"
        "I hate|I love|I enjoy"
        "Remember to|Don't forget"
        "Important|Key point|Crucial"
    )
    
    # Extract facts using simple pattern matching
    for pattern in "${patterns[@]}"; do
        grep -i "$pattern" "$conversation_file" 2>/dev/null | while read -r line; do
            local clean_line=$(echo "$line" | sed 's/"/\\"/g')
            echo "{\"pattern\":\"$pattern\",\"content\":\"$clean_line\",\"extracted\":\"$(ts)\"}"
        done
    done > "$output_file"
    
    log "Facts extracted to $output_file"
    echo "$output_file"
}

# === LAYER 3: TACIT KNOWLEDGE (MEMORY.md) ===
# Already exists - updates happen through normal Claude Hours

# === WEEKLY SYNTHESIS ===
synthesize_weekly() {
    local week="${1:-$(week_start)}"
    local synthesis_file="$SYNTHESIS_DIR/week-$week.md"
    
    log "Running weekly synthesis for week starting $week..."
    
    # THE COMPOUNDING ENGINE (from @spacepixel's guide)
    # 1. Review newly added facts
    # 2. Update relevant summaries  
    # 3. Mark contradicted facts as historical
    # 4. Produce clean, current snapshot
    
    echo "Running the compounding engine..."    
    # Collect all daily notes for the week
    local daily_notes=""
    for i in {0..6}; do
        local day=$(date -d "$week + $i days" '+%Y-%m-%d' 2>/dev/null || date -v+"$i"d '+%Y-%m-%d')
        if [ -f "$MEMORY_DIR/$day.md" ]; then
            daily_notes="$daily_notes $MEMORY_DIR/$day.md"
        fi
    done
    
    # Generate synthesis
    cat > "$synthesis_file" << EOF
# Weekly Synthesis - Week of $week

**Generated:** $(ts)

## Patterns Identified

$(grep -h "pattern" $daily_notes 2>/dev/null | cut -d'"' -f4 | sort | uniq -c | sort -rn | head -10 || echo "No patterns yet")

## Key Facts Extracted

$(tail -50 $daily_notes 2>/dev/null | grep -v "^#" | head -20 || echo "No facts yet")

## Entity Updates

$(ls "$ENTITIES_DIR"/*/*/summary.md 2>/dev/null | head -5 | xargs -I {} bash -c 'echo "### $(basename $(dirname {}))"; head -10 {}' || echo "No entities yet")

## Recommendations

- Continue monitoring conversation patterns
- Update entity summaries weekly
- Prune stale context as needed

---
*Generated by Three-Layer Memory System*
EOF
    
    log "Weekly synthesis complete: $synthesis_file"
    echo "$synthesis_file"
}

# === AUTOMATED FACT EXTRACTION (Sub-agent) ===
run_fact_extraction() {
    log "Running automated fact extraction..."
    
    # This would normally run as a cheap sub-agent
    # For now, we'll create a template
    
    local extraction_script="$CLAWD/scripts/claude-hours-fact-extractor.sh"
    
    cat > "$extraction_script" << 'EXTRACTOR'
#!/bin/bash
# Sub-agent for cheap fact extraction
# Runs every 30 minutes, costs pennies

CLAWD="/Users/jasontang/clawd"
MEMORY_DIR="$CLAWD/memory"
STATE_DIR="$CLAWD/.claude/state"

cd "$CLAWD"

# Get recent conversation context
# In production, this would query the messaging API
# For now, we'll scan memory files

# Extract and store facts
"$CLAWD/scripts/memory-system.sh" extract "$MEMORY_DIR/$(date '+%Y-%m-%d').md"

# Update knowledge graph
log "Fact extraction complete"
EXTRACTOR

    chmod +x "$extraction_script"
    log "Fact extraction script created: $extraction_script"
}

# === PRUNE STALE CONTEXT ===
prune_stale() {
    log "Pruning stale context..."
    
    local pruned=0
    local threshold_days=30
    
    # Find and archive old facts
    for fact_file in "$ENTITIES_DIR"/*/*/facts.jsonl; do
        [ -f "$fact_file" ] || continue
        
        local temp_file="${fact_file}.tmp"
        local archive_file="${fact_file}.archive"
        
        # Keep recent facts, archive old ones
        while IFS= read -r line; do
            local date_str=$(echo "$line" | grep -oP '"timestamp":"\K[^"]+' || echo "")
            if [ -n "$date_str" ]; then
                local fact_date=$(echo "$date_str" | cut -d'T' -f1)
                local days_old=$(($(date +%s) - $(date -d "$fact_date" +%s 2>/dev/null || echo 0) / 86400))
                
                if [ "$days_old" -gt "$threshold_days" ]; then
                    echo "$line" >> "$archive_file"
                else
                    echo "$line" >> "$temp_file"
                fi
            fi
        done < "$fact_file"
        
        mv "$temp_file" "$fact_file"
        pruned=$((pruned + $(wc -l < "$archive_file" 2>/dev/null || echo 0)))
    done
    
    log "Pruned $pruned stale facts"
    echo "$pruned"
}

# === SUPERSEDING (Not Deleting) ===
supersede_fact() {
    local entity="$1"
    local category="$2"
    local old_fact="$3"
    local new_fact="$4"
    
    local entity_dir="$ENTITIES_DIR/$category/$entity"
    
    # Mark old fact as historical
    if [ -f "$entity_dir/facts.jsonl" ]; then
        sed -i '' "s/$old_fact/[HISTORICAL] $old_fact/g" "$entity_dir/facts.jsonl" 2>/dev/null || \
        sed -i "s/$old_fact/[HISTORICAL] $old_fact/g" "$entity_dir/facts.jsonl" 2>/dev/null || true
    fi
    
    # Add new fact
    add_fact "$entity" "$category" "$new_fact" "superseded"
    
    log "Fact superseded: $entity - $old_fact -> $new_fact"
}

# === SETUP CRON JOBS ===
setup_cron() {
    log "Setting up memory system cron jobs..."
    
    # Get existing crontab
    crontab -l 2>/dev/null | grep -v "memory-system" > /tmp/crontab.tmp || true
    
    # Add cron jobs
    echo "# Three-Layer Memory System" >> /tmp/crontab.tmp
    echo "*/30 * * * * cd $CLAWD && $CLAWD/scripts/memory-system.sh extract >> $STATE_DIR/memory.log 2>&1" >> /tmp/crontab.tmp
    echo "0 6 * * 0 cd $CLAWD && $CLAWD/scripts/memory-system.sh synthesize >> $STATE_DIR/memory.log 2>&1" >> /tmp/crontab.tmp
    echo "0 3 * * * cd $CLAWD && $CLAWD/scripts/memory-system.sh prune >> $STATE_DIR/memory.log 2>&1" >> /tmp/crontab.tmp
    
    crontab /tmp/crontab.tmp
    rm /tmp/crontab.tmp
    
    log "Cron jobs configured"
    echo ""
    echo "Cron jobs installed:"
    crontab -l | grep memory-system
}

# === STATUS ===
show_status() {
    echo "=== Three-Layer Memory System Status ==="
    echo ""
    echo "Timestamp: $(ts)"
    echo ""
    
    echo "Layer 1: Knowledge Graph"
    local entity_count=$(find "$ENTITIES_DIR" -name "*.jsonl" 2>/dev/null | wc -l)
    echo "  Entities: $entity_count fact files"
    echo "  Location: $ENTITIES_DIR"
    echo ""
    
    echo "Layer 2: Daily Notes"
    local daily_count=$(ls "$MEMORY_DIR"/YYYY-MM-DD.md 2>/dev/null | wc -l || echo 0)
    echo "  Daily files: $daily_count"
    echo "  Location: $MEMORY_DIR"
    echo ""
    
    echo "Layer 3: Tacit Knowledge"
    if [ -f "$CLAWD/MEMORY.md" ]; then
        local mem_lines=$(wc -l < "$CLAWD/MEMORY.md")
        echo "  MEMORY.md: $mem_lines lines"
    else
        echo "  MEMORY.md: not found"
    fi
    echo ""
    
    echo "Weekly Syntheses:"
    local synthesis_count=$(ls "$SYNTHESIS_DIR"/*.md 2>/dev/null | wc -l || echo 0)
    echo "  Files: $synthesis_count"
    echo "  Location: $SYNTHESIS_DIR"
    echo ""
    
    echo "Cron Jobs:"
    crontab -l 2>/dev/null | grep memory-system || echo "  Not configured"
}

# === INITIALIZE SYSTEM ===
init() {
    echo "=== Initializing Three-Layer Memory System ==="
    echo ""
    
    init_knowledge_graph
    run_fact_extraction
    
    echo ""
    echo "System initialized!"
    echo ""
    show_status
    
    echo ""
    echo "To enable cron jobs, run: $0 setup-cron"
}

# === MAIN ===
case "${1:-init}" in
    init)
        init
        ;;
    add)
        shift
        add_fact "$1" "$2" "$3" "${4:-conversation}"
        ;;
    extract)
        extract_facts_from_conversation "${2:-$MEMORY_DIR/$(date '+%Y-%m-%d').md}"
        ;;
    synthesize)
        synthesize_weekly "${2:-$(week_start)}"
        ;;
    prune)
        prune_stale
        ;;
    supersede)
        shift
        supersede_fact "$1" "$2" "$3" "$4"
        ;;
    setup-cron)
        setup_cron
        ;;
    status)
        show_status
        ;;
    help|*)
        echo "Three-Layer Memory System for Claude Hours"
        echo ""
        echo "Based on @spacepixel's memory upgrade guide"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  init           - Initialize the memory system"
        echo "  add <entity> <category> <fact> - Add a fact"
        echo "  extract [file] - Extract facts from conversation"
        echo "  synthesize [week] - Run weekly synthesis"
        echo "  prune          - Prune stale context"
        echo "  supersede <entity> <category> <old> <new> - Supersede a fact"
        echo "  setup-cron     - Install cron jobs"
        echo "  status         - Show system status"
        echo "  help           - Show this help"
        echo ""
        echo "Layers:"
        echo "  1. Knowledge Graph (/life/areas/.entities/)"
        echo "  2. Daily Notes (memory/YYYY-MM-DD.md)"
        echo "  3. Tacit Knowledge (MEMORY.md)"
        ;;
esac
