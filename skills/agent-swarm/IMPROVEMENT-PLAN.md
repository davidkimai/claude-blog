# Agent Swarm Improvement Plan
**Based on Kimi K2.5 PARL Analysis**

**Date:** 2026-01-29  
**Reference:** [Kimi K2.5 Agent Swarm](https://www.kimi.com/blog/kimi-k2-5.html)

---

## Kimi K2.5 vs Our Implementation

| Feature | Kimi K2.5 | Our Implementation | Gap |
|---------|-----------|-------------------|-----|
| **Subagents** | Up to 100 | 5 templates | ⚠️ Limited |
| **Tool Calls** | 1,500 max | Template-defined | ⚠️ Fixed |
| **Orchestration** | Trainable PARL | Template-based | ❌ Missing |
| **Decomposition** | Self-directed | Manual triggers | ❌ Missing |
| **Reward Shaping** | λaux: 0.1→0.0 | None | ❌ Missing |
| **Critical Steps** | Yes | Yes (implemented) | ✅ Good |
| **Parallel Execution** | Auto-detected | Manual init | ⚠️ Partial |

---

## Improvement Roadmap

### Phase 1: Quick Wins (This Week)

#### 1.1 Expand Template Library
```bash
# Current: 5 templates
# Target: 15+ specialized templates

templates/
├── ai-researcher.json      # Existing
├── code-specialist.json    # Existing
├── documenter.json         # Existing
├── analyst.json            # Existing
├── fact-checker.json       # Existing
├── security-researcher.json    # NEW
├── performance-analyst.json    # NEW
├── user-experience.json        # NEW
├── data-engineer.json          # NEW
├── devops-specialist.json      # NEW
├── api-designer.json           # NEW
├── test-automation.json        # NEW
├── documentation-writer.json   # NEW
├── research-synthesizer.json   # NEW
└── code-reviewer.json          # NEW
```

#### 1.2 Auto-Detect Parallelism
Add intent detection to automatically trigger swarm:

```python
# In ouroboros integration
def detect_parallelism(task: str) -> float:
    """Score task for parallelism potential (0.0-1.0)"""
    parallel_keywords = [
        "and", "also", "plus", "multiple",
        "research", "analyze", "review",
        "build", "test", "document"
    ]
    score = sum(1 for kw in parallel_keywords if kw in task.lower())
    return min(score / 5, 1.0)  # Cap at 1.0

# Auto-trigger if score > 0.6
```

#### 1.3 Add Execution Metrics
```json
// memory/swarm-metrics.jsonl
{
  "timestamp": "2026-01-29T19:00:00Z",
  "task": "Research + code + docs",
  "subagents": 3,
  "total_steps": 150,
  "critical_steps": 50,
  "parallelism_ratio": 3.0,
  "speedup_vs_sequential": 2.8,
  "success": true
}
```

---

### Phase 2: Core Engine (2-4 Weeks)

#### 2.1 Implement PARL-Inspired Orchestrator

**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│                   PARL ORCHESTRATOR                      │
├─────────────────────────────────────────────────────────┤
│  Stage 1: Intent Analysis                               │
│  - Classify task type                                   │
│  - Estimate subtask count                               │
│  - Detect dependencies                                  │
├─────────────────────────────────────────────────────────┤
│  Stage 2: Dynamic Decomposition                         │
│  - Break into parallelizable units                      │
│  - Create dependency graph                              │
│  - Assign specialized templates                         │
├─────────────────────────────────────────────────────────┤
│  Stage 3: Execution Coordination                        │
│  - Spawn subagents in waves                             │
│  - Track Critical Steps                                 │
│  - Handle failures/retries                              │
├─────────────────────────────────────────────────────────┤
│  Stage 4: Result Aggregation                            │
│  - Collect outputs                                      │
│  - Resolve dependency order                             │
│  - Synthesize final result                              │
└─────────────────────────────────────────────────────────┘
```

**Key Functions:**
```python
class PARLOrchestrator:
    def __init__(self, max_subagents: int = 20):
        self.max_subagents = max_subagents
        self.templates = load_templates()
        self.metrics = SwarmMetrics()
    
    def decompose(self, task: str) -> List[Subtask]:
        """Self-directed task decomposition"""
        # Use LLM to analyze task and create subtasks
        # No predefined roles - dynamically assigned
    
    def execute(self, subtasks: List[Subtask]) -> List[Result]:
        """Parallel execution with Critical Steps tracking"""
        # Spawn subtasks in waves
        # Track critical path
        # Return aggregated results
```

#### 2.2 Add Staged Reward Shaping

```python
def compute_reward(orchestrator: PARLOrchestrator, stage: int) -> float:
    """
    Kimi K2.5: Rt = λaux(e)·rparallel + (1-λaux(e))·I[success]·Q(τ)
    
    Stage 1-10: λaux = 0.1 (encourage parallelism)
    Stage 11+: λaux → 0.0 (optimize task quality)
    """
    total_stages = 20  # Training stages
    lambda_aux = max(0.1 * (1 - stage / total_stages), 0.0)
    
    # Parallelism reward: more subagents = higher reward early
    r_parallel = min(len(orchestrator.active_subagents) / 5, 1.0)
    
    # Task quality reward: only matters later
    success_rate = orchestrator.metrics.success_rate()
    task_quality = orchestrator.metrics.quality_score()
    
    return lambda_aux * r_parallel + (1 - lambda_aux) * success_rate * task_quality
```

#### 2.3 Implement Critical Steps V2

```python
def compute_critical_steps(execution_graph: DAG) -> int:
    """
    Critical Steps = Σ(max(subagent_time_per_stage))
    
    Example:
    Stage 1: [A: 10s, B: 8s] → max = 10s
    Stage 2: [C: 15s] → max = 15s
    Stage 3: [D: 5s] → max = 5s
    
    Critical Steps = 10 + 15 + 5 = 30s
    Speedup vs sequential = total_time / critical_steps
    """
    total = 0
    for stage in execution_graph.stages:
        max_time = max(subagent.elapsed for subagent in stage)
        total += max_time
    return total
```

---

### Phase 3: Advanced Features (1-2 Months)

#### 3.1 Trainable Orchestrator

**Data Collection:**
```python
# Collect execution data for training
training_data = []
for execution in swarm_history:
    training_data.append({
        "task": execution.task,
        "decomposition": execution.subtasks,
        "metrics": execution.metrics,
        "success": execution.success,
        "user_rating": execution.user_feedback
    })
```

**Training Pipeline:**
```python
# Use collected data to improve decomposition
# - What decompositions work best?
# - What parallelism patterns succeed?
# - How to handle failures?
```

#### 3.2 Visual Debugging

Add visualization of:
- Execution timeline (Gantt chart)
- Dependency graph
- Critical path highlight
- Resource utilization

#### 3.3 Memory Integration

```python
class SwarmMemory:
    """Learn from past swarm executions"""
    
    def remember(self, execution: SwarmExecution):
        """Store execution for learning"""
        self.decompositions[execution.task_type].append(execution.subtasks)
        self.metrics[execution.task_type].append(execution.metrics)
    
    def recall(self, task: str) -> List[SwarmExecution]:
        """Get similar past executions"""
        return self.decompositions.similar(task)
    
    def improve(self, task: str) -> List[Subtask]:
        """Suggest improved decomposition based on history"""
        past = self.recall(task)
        return best_practices(past)
```

---

## Implementation Priority

| Priority | Feature | Effort | Impact | Status |
|----------|---------|--------|--------|--------|
| P0 | Expand templates (15+) | 1 day | High | Not started |
| P0 | Auto-detect parallelism | 2 days | High | Not started |
| P1 | PARL orchestrator core | 1 week | High | Design ready |
| P1 | Reward shaping | 3 days | Medium | Not started |
| P1 | Critical Steps V2 | 1 day | Medium | Design ready |
| P2 | Training pipeline | 2 weeks | High | Future |
| P2 | Visual debugging | 1 week | Medium | Future |
| P2 | Memory integration | 1 week | Medium | Not started |

---

## Files to Modify/Create

```
skills/agent-swarm/
├── scripts/
│   ├── parl-orchestrator.py      # NEW: Core PARL engine
│   ├── decomposition-engine.py   # NEW: Self-directed decomposition
│   ├── reward-calculator.py      # NEW: Staged reward shaping
│   ├── critical-steps-v2.py      # NEW: Improved metrics
│   ├── swarm-executor.py         # NEW: Parallel execution
│   ├── result-aggregator.py      # NEW: Output synthesis
│   ├── existing scripts...       # Keep for compatibility
├── templates/
│   ├── ai-researcher.json        # Update
│   ├── code-specialist.json      # Update
│   ├── security-researcher.json  # NEW
│   ├── performance-analyst.json  # NEW
│   └── ... (10 more)
├── memory/
│   ├── swarm-metrics.jsonl       # NEW: Execution history
│   ├── swarm-memory.pkl          # NEW: Learned patterns
│   └── config.json               # Update
├── docs/
│   ├── PARL-design.md            # NEW: Technical design
│   └── api-reference.md          # NEW: API docs
└── SKILL.md                      # Update with new features
```

---

## Quick Test Plan

### Test 1: Parallelism Detection
```bash
/swarm:init "Research AI safety AND write code examples"
# Should auto-detect 2 parallel subtasks
```

### Test 2: Critical Steps
```bash
/swarm:init "Analyze 3 files for security, performance, style"
# Should track: 3 subagents, 1 critical step
# Expected speedup: 3x
```

### Test 3: Template Selection
```bash
/swarm:init "Build REST API, document it, test it"
# Should select: code-specialist, documenter, fact-checker
```

---

## Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Templates | 5 | 15+ | 1 week |
| Auto-parallelism | 0% | 80% | 2 weeks |
| Speedup vs sequential | ? | 2x-4x | 1 month |
| Subagent success rate | ? | >90% | 1 month |
| Critical Steps tracking | Basic | Advanced | 2 weeks |

---

## Next Actions

1. **Today:** Expand to 10 templates (quick win)
2. **Tomorrow:** Add auto-parallelism detection in ouroboros
3. **This week:** Implement PARL orchestrator core
4. **Next week:** Add reward shaping and metrics
5. **This month:** Full integration and testing

---

*Plan based on Kimi K2.5 PARL analysis from https://www.kimi.com/blog/kimi-k2-5.html*
