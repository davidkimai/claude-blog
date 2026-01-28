#!/bin/bash
#
# PRD Generator for Claude Hours
# Creates a structured PRD and spec sheet for overnight tasks
#

set -euo pipefail

CLAWD="/Users/jasontang/clawd"
PLANNING_DIR="$CLAWD/system/planning"
SCHEDULE_DIR="$CLAWD/system/schedules"
PRDS_DIR="$PLANNING_DIR/prds"
SPECS_DIR="$PLANNING_DIR/specs"

mkdir -p "$PRDS_DIR" "$SPECS_DIR"

date_only() { date '+%Y-%m-%d'; }
timestamp() { date '+%Y-%m-%dT%H:%M:%S-06:00'; }

# === GENERATE PRD ===
generate_prd() {
    local project_name="$1"
    local problem="$2"
    local solution="$3"
    
    prd_id="prd-$(date_only)-${project_name// /-}"
    local prd_file="$PRDS_DIR/$prd_id.md"
    
    cat > "$prd_file" << EOF
# PRD: $project_name

**PRD ID:** $prd_id
**Created:** $(timestamp)
**Status:** draft
**Priority:** P1

---

## 1. Overview

### Problem Statement
$problem

### Solution Summary
$solution

### Goals
- Implement core functionality during Claude Hours
- Enable autonomous operation
- Measure and optimize performance

### Non-Goals
- Production polish (Phase 2)
- Full documentation (Phase 3)

---

## 2. Background

### Context
Claude Hours provides ~8 hours of autonomous operation (9PM-8AM Chicago). This PRD defines tasks to maximize productivity during this window.

### Current State
- Basic autonomous loop working
- Single-agent task execution
- Manual scheduling

### Desired State
- Multi-agent parallel execution (Kimi K2.5 PARL)
- Self-improving through learning
- Structured task planning (PRDs/specs)
- Automated morning reports

---

## 3. Requirements

### Functional Requirements

| ID | Priority | Description | Acceptance Criteria |
|----|----------|-------------|---------------------|
| FR-01 | P0 | Multi-agent swarm execution | 3 agents run in parallel |
| FR-02 | P0 | PRD generation automation | Auto-generate PRDs from task list |
| FR-03 | P0 | Morning intel at 7am | Report generated automatically |
| FR-04 | P1 | Learning from execution | Track patterns, improve estimates |
| FR-05 | P1 | Schedule following | Execute tasks from nightly.json |
| FR-06 | P2 | Self-improving prompts | Update prompts based on results |

### Non-Functional Requirements

| ID | Category | Description | Target |
|----|----------|-------------|--------|
| NFR-01 | Performance | Swarm speedup | >2x sequential |
| NFR-02 | Reliability | Task completion | >90% success |
| NFR-03 | Latency | Morning report | <5 min generation |

---

## 4. Implementation Plan

### Phase 1: Core Infrastructure (Tonight)

| Task | Description | Deliverables | Time |
|------|-------------|--------------|------|
| T1 | PRD generator script | system/planning/generate-prd.sh | 15 min |
| T2 | Spec generator script | system/planning/generate-spec.sh | 15 min |
| T3 | Morning intel cron setup | scripts/claude-hours-morning-intel.sh | 10 min |
| T4 | Schedule execution loop | scripts/claude-hours-schedule-runner.sh | 20 min |
| T5 | Integration test | Run full night simulation | 30 min |

### Phase 2: Learning System (Next Night)

| Task | Description | Time |
|------|-------------|------|
| L1 | Pattern tracking | 30 min |
| L2 | Time estimate improvement | 20 min |
| L3 | Prompt auto-optimization | 30 min |

---

## 5. Dependencies

- Codex CLI OAuth (working)
- Claude Home System (working)
- Agent Swarm v1.3 (working)
- Git integration (working)

---

## 6. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| API rate limits | High | Medium | Use both Codex and Claude |
| Task time overruns | Medium | Medium | Auto-schedule buffer |
| Metric collection gaps | Low | Low | Multiple sources |

---

## 7. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Tasks completed per night | 4+ | Count in nightly.json |
| Swarm speedup | >2x | Critical Steps metric |
| Morning report on-time | 100% | Cron execution log |
| Learning improvement | 10% better estimates | Time tracking variance |

---

## 8. Timeline

| Milestone | Date | Deliverable |
|-----------|------|-------------|
| PRD Complete | Tonight | This document |
| Implementation | Tonight | Code + tests |
| First Full Night | Tonight | All systems running |
| Optimization | Tomorrow | Phase 2 complete |

---

## 9. Resources

- Owner: Claude Hours (autonomous)
- Reviewers: Human (morning intel)
- Budget: Claude API (Codex OAuth)

---

## Appendix

### References
- Kimi K2.5 PARL: /memory/2026-01-27.md
- Agent Swarm: skills/agent-swarm/
- Claude Home System: scripts/claude-home-system.sh

### Open Questions
- Optimal number of parallel agents?
- Learning rate for prompt improvement?
- How aggressive should schedule compression be?

---

*Generated: $(timestamp)*
*Template: $PRDS_DIR/TEMPLATE.md*
EOF
    
    echo "✅ PRD created: $prd_file"
    echo "$prd_id"
}

# === GENERATE SPEC ===
generate_spec() {
    prd_id="$1"
    local component="$2"
    local description="$3"
    
    spec_id="spec-$prd_id-$component"
    local spec_file="$SPECS_DIR/$spec_id.md"
    
    cat > "$spec_file" << EOF
# Spec: $component

**Spec ID:** $spec_id
**PRD Ref:** $prd_id
**Created:** $(timestamp)
**Status:** draft

---

## 1. Component Overview

### Name
\`$component\`

### Purpose
$description

### Scope
Included: Core functionality
Excluded: Advanced features (Phase 2)

---

## 2. Technical Design

### File Structure
```
$CLAWD/system/planning/
├── generate-prd.sh
├── generate-spec.sh  
├── prds/
│   └── $prd_id.md
└── specs/
    └── $spec_id.md
```

### Dependencies
- bash (current shell)
- jq (for JSON handling)
- claude CLI (for code generation)

---

## 3. Implementation Details

### Main Script: generate-prd.sh

**Purpose:** Generate PRDs from templates for overnight tasks

**Functions:**
- \`generate_prd(name, problem, solution)\`
- \`validate_input()\`
- \`update_schedule()\`

**Pseudocode:**
```bash
read project_name
read problem  
read solution
prd_id=$(generate_prd "$project_name" "$problem" "$solution")
spec_id=$(generate_spec "$prd_id" "$project_name" "Implementation of $project_name")
update_schedule "$prd_id" "$spec_id"
echo "PRD and Spec created: $prd_id, $spec_id"
```

---

## 4. Testing Strategy

| Test | Scenario | Expected |
|------|----------|----------|
| Unit | Generate PRD with valid input | File created |
| Integration | Generate PRD then spec | Linked files |
| E2E | Run full generation | Schedule updated |

---

## 5. Implementation Steps

| Step | Description | Time |
|------|-------------|------|
| 1 | Create script structure | 5 min |
| 2 | Implement template reading | 5 min |
| 3 | Add input validation | 3 min |
| 4 | Add file writing | 5 min |
| 5 | Add schedule update | 5 min |
| 6 | Test with sample | 5 min |

---

*Generated: $(timestamp)*
*Template: $SPECS_DIR/TEMPLATE.md*
EOF
    
    echo "✅ Spec created: $spec_file"
    echo "$spec_id"
}

# === MAIN ===
case "${1:-help}" in
    prd)
        shift
        generate_prd "$1" "$2" "$3"
        ;;
    spec)
        shift
        generate_spec "$1" "$2" "$3"
        ;;
    auto)
        # Auto-generate tonight's PRD based on schedule
        prd_id=$(generate_prd \
            "Claude Hours Self-Improving System" \
            "Claude Hours needs structured planning and learning to maximize overnight productivity" \
            "Implement PRD/spec generation, schedule execution, morning intel, and learning system")
        
        echo ""
        echo "🎯 Tonight's plan ready: $prd_id"
        echo ""
        echo "Next steps:"
        echo "  1. Review PRD: cat system/planning/prds/$prd_id.md"
        echo "  2. Run schedule: ./scripts/claude-hours-schedule-runner.sh"
        echo "  3. Check morning intel at 7am"
        ;;
    help|*)
        echo "Claude Hours PRD/Spec Generator"
        echo ""
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  auto                    - Generate full tonight's plan (recommended)"
        echo "  prd \"name\" \"problem\" \"solution\" - Generate single PRD"
        echo "  spec \"prd-id\" \"component\" \"desc\" - Generate single spec"
        echo "  help                    - Show this help"
        echo ""
        echo "Examples:"
        echo "  $0 auto"
        echo "  $0 prd \"New Feature\" \"Problem desc\" \"Solution desc\""
        ;;
esac
