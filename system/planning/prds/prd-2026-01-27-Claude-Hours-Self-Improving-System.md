# PRD: Claude Hours Self-Improving System

**PRD ID:** prd-2026-01-27-Claude-Hours-Self-Improving-System
**Created:** 2026-01-27T23:51:43-06:00
**Status:** draft
**Priority:** P1

---

## 1. Overview

### Problem Statement
Claude Hours needs structured planning and learning to maximize overnight productivity

### Solution Summary
Implement PRD/spec generation, schedule execution, morning intel, and learning system

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

*Generated: 2026-01-27T23:51:43-06:00*
*Template: /Users/jasontang/clawd/system/planning/prds/TEMPLATE.md*
