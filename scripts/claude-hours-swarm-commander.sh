#!/bin/bash
# Claude Hours Swarm Commander - Coordinate swarm agents for night operations
# Uses agent-swarm system to parallelize work

set -euo pipefail

CLAWD="/Users/jasontang/clawd"
SWARM_DIR="$CLAWD/skills/agent-swarm"
SWARM_SCRIPT="$SWARM_DIR/scripts/swarm-orchestrator.js"
NIGHTLY_DIR="$CLAWD/nightly"
STATE_DIR="$CLAWD/.claude/state"
TEMPLATES="$SWARM_DIR/templates"

mkdir -p "$NIGHTLY_DIR" "$STATE_DIR"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] [SWARM] $1" >> "$STATE_DIR/swarm.log"; }

# === LIST AVAILABLE SWARMS ===
list_swarms() {
    echo "=== Available Swarm Templates ==="
    echo ""
    
    for template in "$TEMPLATES"/*.json; do
        [ -f "$template" ] || continue
        
        local name=$(jq -r '.name' "$template")
        local desc=$(jq -r '.description' "$template")
        local tasks=$(jq -r '.tasks | length' "$template")
        local parallel=$(jq -r '.parallelism' "$template")
        
        echo -e "${CYAN}$name${NC}"
        echo "  $desc"
        echo "  Tasks: $tasks | Parallel: $parallel"
        echo ""
    done
}

# === RUN SWARM ===
run_swarm() {
    local template="$1"
    local template_file="$TEMPLATES/${template}.json"
    
    if [ ! -f "$template_file" ]; then
        echo "Template not found: $template"
        return 1
    fi
    
    local name=$(jq -r '.name' "$template_file")
    local desc=$(jq -r '.description' "$template_file")
    
    log "Starting swarm: $name"
    echo ""
    echo -e "${GREEN}🚀 Starting Swarm: $name${NC}"
    echo "Description: $desc"
    echo ""
    
    # Run swarm orchestrator
    cd "$SWARM_DIR"
    node "$SWARM_SCRIPT" run "$template_file" 2>&1 | head -100
    
    log "Swarm completed: $name"
}

# === RUN NIGHT SCHEDULE PRD SWARM ===
run_night_schedule_prd() {
    log "Starting night schedule PRD swarm"
    
    echo ""
    echo -e "${GREEN}🎯 Night Schedule PRD Swarm${NC}"
    echo "Creating comprehensive PRD for Claude Hours night operations"
    echo ""
    
    # Create PRD directly
    local prd_file="$NIGHTLY_DIR/night-schedule-prd.md"
    
    cat > "$prd_file" << 'PRD'
# Claude Hours Night Schedule PRD
**Status:** Draft
**Created:** $(date '+%Y-%m-%d %H:%M:%S')
**Version:** 1.0

## Executive Summary

This PRD defines the comprehensive night schedule for Claude Hours autonomous operation, ensuring reliable self-healing, continuous learning, and proactive system improvement through the night (9PM - 8AM CST).

## 1. Schedule Overview

### Operating Hours
- **Active Period:** 9:00 PM - 8:00 AM CST (11 hours)
- **Quiet Period:** 8:00 AM - 9:00 PM CST

### Cycle Structure
- **Frequency:** Every 15 minutes
- **Total Cycles:** ~26 per night
- **Task Types:** 5 rotating categories

### Task Categories
1. **Script Analysis** - Improve automation scripts
2. **Documentation Review** - Update and create guides
3. **Memory Analysis** - Identify patterns and improvements
4. **Workspace Audit** - Reorganization opportunities
5. **Skill Assessment** - Evaluate and create skills

## 2. Self-Healing System

### Components
| Component | Purpose | Interval |
|-----------|---------|----------|
| Process Watchdog | Keep autonomous loop running | 30s |
| Resource Monitor | Track memory/CPU/disk | 5 min |
| Log Rotator | Prevent log bloat | Daily 6AM |
| Supervisor | Orchestrate all components | Continuous |

### Recovery Procedures
1. **Process Death:** Auto-restart within 5 seconds
2. **Resource Warning:** Alert at 80% threshold
3. **Resource Critical:** Emergency cleanup at 90%
4. **Network Loss:** Retry every 30 seconds

## 3. Swarm Integration

### Swarm Templates
| Template | Purpose | Trigger |
|----------|---------|---------|
| night-schedule-prd | Create/update PRD | Weekly |
| self-healing-monitor | Enhanced monitoring | Nightly |
| ai-researcher | Research improvements | On-demand |
| code-specialist | Script improvements | As needed |

### Swarm Coordination
- Parallel task execution (max 3 concurrent)
- Dependency-aware scheduling
- Automatic retry on failure

## 4. Notification System

### Telegram Notifications
| Event | Format | Frequency |
|-------|--------|-----------|
| Session Start | 🚀 Started | 9:00 PM |
| Cycle Complete | 🔄 #N complete | Every 15 min |
| Milestone | 🏆 Achievement | On reach |
| Session Complete | 🎉 Summary | 8:00 AM |

### Time Series Format
```
Claude Hours | YYYY-MM-DD | HH:MM

Activity: [Task description]
Result: [Success/Warning/Error]

Metrics
Cycles  →  N
Tasks   →  M completed
Focus   →  [Area]
Time    →  [Duration]

---
Claude Hours v2.8 | Autonomous Loop
```

## 5. Data & Logging

### Nightly Reports
- **Location:** `nightly/YYYY-MM-DD.json`
- **Contents:** Complete session data, time series, outputs

### Time Series Data
- **Start Time:** ISO 8601 timestamp
- **End Time:** ISO 8601 timestamp  
- **Duration:** Calculated difference
- **Cycles:** Per-cycle metrics
- **Tasks:** Per-task completion status

### Logs
- **Loop Log:** `.claude/state/loop.log`
- **Health Log:** `.claude/logs/health.log`
- **Swarm Log:** `.claude/state/swarm.log`

## 6. Success Criteria

### Performance
- [ ] 100% cycle completion rate
- [ ] <5 second recovery time on failure
- [ ] <1% API failure rate
- [ ] Zero manual intervention required

### Quality
- [ ] 5+ improvement suggestions per night
- [ ] 2+ scripts improved per week
- [ ] 1+ new skills created per week
- [ ] 95%+ task success rate

## 7. Future Enhancements

### Phase 2
- Predictive failure detection
- Adaptive cycle timing
- Learning from patterns

### Phase 3
- Cross-night memory
- Proactive improvement suggestions
- Self-modifying code

## Appendix: Cron Schedule

```cron
# Autonomous Loop
*/15 * * * * /Users/jasontang/clawd/scripts/claude-autonomous-loop-simple.sh run

# Morning Intel
0 7 * * * /Users/jasontang/clawd/scripts/claude-hours-morning-intel.sh

# Supervisor Health Check
*/5 * * * * cd /Users/jasontang/clawd && ./system/supervisor.sh check

# Log Rotation
0 6 * * * /Users/jasontang/clawd/system/health/log-rotator.sh rotate
```

---
*Generated by Claude Hours Swarm Commander*
PRD

    echo -e "${GREEN}✅ PRD Created: $prd_file${NC}"
    log "Night schedule PRD created"
    
    echo "$prd_file"
}

# === RUN SELF-HEALING MONITOR SWARM ===
run_self_healing_swarm() {
    echo ""
    echo -e "${GREEN}🛡️ Self-Healing Monitor Swarm${NC}"
    echo "Enhanced monitoring through the night"
    echo ""
    
    # Run health check
    cd "$CLAWD"
    ./system/supervisor.sh check
    
    # Run resource check
    ./system/health/resource-monitor.sh measure
    
    echo ""
    echo "Self-healing swarm active"
}

# === CHECK SWARM HEALTH ===
check_health() {
    echo "=== Swarm System Health ==="
    echo ""
    
    # Check orchestrator
    if [ -x "$SWARM_SCRIPT" ]; then
        echo "[OK] Swarm Orchestrator: installed"
    else
        echo "[--] Swarm Orchestrator: not executable"
    fi
    
    # Check templates
    local template_count=$(ls "$TEMPLATES"/*.json 2>/dev/null | wc -l)
    echo "[OK] Templates: $template_count available"
    
    # Check metrics
    if [ -f "$SWARM_DIR/memory/swarm-metrics.jsonl" ]; then
        local run_count=$(wc -l < "$SWARM_DIR/memory/swarm-metrics.jsonl")
        echo "[OK] Runs recorded: $run_count"
    else
        echo "[--] No metrics yet"
    fi
    
    # Check active swarms
    local active=$(pgrep -f "swarm-orchestrator" 2>/dev/null | wc -l || echo 0)
    echo "[OK] Active swarms: $active"
    
    echo ""
    echo "=== System Status ==="
    ./system/supervisor.sh status
}

# === MAIN ===
case "${1:-status}" in
    list)
        list_swarms
        ;;
    run)
        shift
        run_swarm "$1"
        ;;
    prd)
        run_night_schedule_prd
        ;;
    monitor)
        run_self_healing_swarm
        ;;
    health)
        check_health
        ;;
    status)
        check_health
        ;;
    help|*)
        echo "Claude Hours Swarm Commander"
        echo ""
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  list          - List available swarm templates"
        echo "  run <name>    - Run specific swarm template"
        echo "  prd           - Generate night schedule PRD"
        echo "  monitor       - Run self-healing monitor swarm"
        echo "  health        - Check swarm system health"
        echo "  status        - Show current status"
        echo "  help          - Show this help"
        echo ""
        echo "Examples:"
        echo "  $0 list"
        echo "  $0 run night-schedule-prd"
        echo "  $0 prd"
        echo "  $0 monitor"
        ;;
esac
