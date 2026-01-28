# Agent Swarm Skill 🐝

**Inspired by Kimi K2.5 PARL (Parallel-Agent Reinforcement Learning)**

Self-directed agent swarm orchestration that automatically decomposes tasks into parallelizable subtasks, spawns subagents, and coordinates execution with Critical Steps tracking.

## When to Trigger

**Automatic triggers:**
- Agent runs with complex, multi-part task
- User mentions "parallel", "swarm", "multiple agents"
- Task naturally decomposes into independent subtasks

**Manual triggers:**
- `/swarm:init <task>` - Start swarm for a task
- `/swarm:status` - Check active swarm
- `/swarm:stop` - Terminate swarm

## Architecture

```
User Task
    ↓
┌─────────────────────────────────────────────────┐
│            SWARM ORCHESTRATOR                    │
│  ┌───────────────────────────────────────────┐  │
│  │ 1. Intent Detection (Ouroboros)           │  │
│  │    - Analyze task complexity              │  │
│  │    - Determine parallelism potential      │  │
│  │    - Estimate critical steps              │  │
│  └───────────────────────────────────────────┘  │
│                    ↓                            │
│  ┌───────────────────────────────────────────┐  │
│  │ 2. Task Decomposition (Ralph-TUI)         │  │
│  │    - Break into parallelizable subtasks   │  │
│  │    - Create dependency graph              │  │
│  │    - Assign to specialized subagents      │  │
│  └───────────────────────────────────────────┘  │
│                    ↓                            │
│  ┌───────────────────────────────────────────┐  │
│  │ 3. Context Engineering (GSD)              │  │
│  │    - Extract relevant context             │  │
│  │    - Prepare subagent prompts             │  │
│  │    - Generate specialized roles           │  │
│  └───────────────────────────────────────────┘  │
│                    ↓                            │
│  ┌───────────────────────────────────────────┐  │
│  │ 4. Subagent Spawning                      │  │
│  │    - Instantiate frozen subagents         │  │
│  │    - Execute in parallel                  │  │
│  │    - Track Critical Steps                 │  │
│  └───────────────────────────────────────────┘  │
│                    ↓                            │
│  ┌───────────────────────────────────────────┐  │
│  │ 5. Result Aggregation                     │  │
│  │    - Collect subagent outputs             │  │
│  │    - Resolve dependencies                 │  │
│  │    - Synthesize final result              │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Key Features (Kimi K2.5 Inspired)

### 1. PARL-Inspired Orchestration

- **Dynamic decomposition** - No predefined subagent roles
- **Staged reward shaping** - Parallelism encouraged, then optimized
- **Critical Steps tracking** - Measures true parallel efficiency

### 2. Subagent Templates

Pre-configured frozen subagents for common roles:
- `ai-researcher` - Research and synthesis
- `code-specialist` - Coding and debugging
- `documenter` - Documentation and notes
- `analyst` - Data analysis and patterns
- `fact-checker` - Verification and validation

### 3. Metrics Tracking

| Metric | Description |
|--------|-------------|
| `total_steps` | Sum of all subagent steps |
| `critical_steps` | Max time per parallel stage |
| `parallelism_ratio` | `total_steps / critical_steps` |
| `speedup` | Sequential / Parallel time |

### 4. Integration with Existing Skills

| Skill | Role |
|-------|------|
| `ouroboros` | Intent detection, decision audit |
| `ralph-tui` | Task decomposition, bead management |
| `get-shit-done` | Context engineering, spec creation |

## Commands

### `/swarm:init <task>`
Initialize a new agent swarm for a task.

**Example:**
```
/swarm:init "Research AI safety, write code examples, and create documentation"
```

**Output:**
```
🐝 Agent Swarm Initialized
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Task: Research AI safety, write code examples, and create documentation
Complexity: High (parallelizable)
Subtasks: 3 (parallel)
Estimated Critical Steps: 3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Subtask 1: AI safety research (AI Researcher)
✓ Subtask 2: Code examples (Code Specialist)  
✓ Subtask 3: Documentation (Documenter)
```

### `/swarm:status`
Show current swarm status.

**Output:**
```
🐝 Swarm Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Active: 2 subagents running
Completed: 5 subtasks
Failed: 0
Critical Steps: 8 / 15 total
Speedup: 1.9x vs sequential
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### `/swarm:stop`
Terminate all active subagents.

### `/swarm:metrics`
Show swarm performance metrics.

## Usage Examples

### Example 1: Multi-Task Research

```
/swarm:init "Find top 10 AI safety papers, summarize each, and create a bibliography"
```

**Swarm decomposition:**
1. AI Researcher → Find papers
2. AI Researcher → Summarize papers
3. Documenter → Create bibliography

**Execution:** All 3 run in parallel → Results aggregated

### Example 2: Code + Docs

```
/swarm:init "Build a REST API with /users endpoint and document it"
```

**Swarm decomposition:**
1. Code Specialist → Build API
2. Documenter → Write docs
3. Fact Checker → Verify API works

**Execution:** API and docs run in parallel → Verification after both complete

### Example 3: Complex Analysis

```
/swarm:init "Analyze this codebase: check security, performance, and style"
```

**Swarm decomposition:**
1. Security Analyst → Security review
2. Code Specialist → Performance analysis
3. Code Specialist → Style review

**Execution:** All 3 run in parallel → Results aggregated

## Subagent Templates

Located in `skills/agent-swarm/templates/`:

| Template | Role | Description |
|----------|------|-------------|
| `ai-researcher.json` | AI Researcher | Research, synthesis, finding patterns |
| `code-specialist.json` | Code Specialist | Coding, debugging, refactoring |
| `documenter.json` | Documenter | Writing docs, notes, summaries |
| `analyst.json` | Analyst | Data analysis, pattern recognition |
| `fact-checker.json` | Fact Checker | Verification, validation, QA |

### Template Format

```json
{
  "name": "ai-researcher",
  "role": "AI Researcher",
  "system_prompt": "You are an expert AI researcher...",
  "tools": ["web_search", "read", "write"],
  "max_steps": 50,
  "frozen": true
}
```

## Critical Steps Tracking

The Agent Swarm skill tracks Kimi K2.5's Critical Steps metric:

```
Critical Steps = Σ(max(execution_time_of_subagents_in_parallel_stages))

Sequential:    [A]→[B]→[C] = 3 critical steps
Parallel (AB): [A]→[B,C]→[D] = 3 critical steps, 2 parallel
Speedup: 3/2 = 1.5x

Best case: All parallel → [A,B,C] = 1 critical step
Speedup: 3/1 = 3x
```

## Configuration

Located in `skills/agent-swarm/memory/config.json`:

```json
{
  "max_subagents": 10,
  "parallel_stages": true,
  "track_critical_steps": true,
  "auto_aggregate": true,
  "templates_dir": "./templates",
  "ollaborative_mode": true,
  "metrics_file": "./metrics/swarm-metrics.jsonl"
}
```

## Files

### Skill Files
| File | Purpose |
|------|---------|
| `SKILL.md` | This documentation |
| `scripts/swarm-orchestrator.js` | Main orchestrator |
| `scripts/subagent-spawner.js` | Subagent instantiation |
| `scripts/metrics-tracker.js` | Critical Steps tracking |
| `templates/*.json` | Subagent templates |
| `memory/config.json` | Configuration |
| `memory/swarm-state.json` | Active swarm state |

### Integration Points
- Uses `ouroboros` for intent detection
- Uses `ralph-tui` for task/bead management
- Uses `get-shit-done` for context engineering
- Uses `claude-home-system.sh` for metrics

## Kimi K2.5 PARL Inspiration

This skill implements concepts from Kimi K2.5's Parallel-Agent Reinforcement Learning:

1. **Dynamic Orchestration** - No predefined subagents, creates on-demand
2. **Staged Rewards** - Early: encourage parallelism; Late: optimize quality
3. **Critical Steps** - Measures true parallel efficiency
4. **Frozen Subagents** - Pre-configured, specialized for tasks

### Performance Targets

| Metric | Target |
|--------|--------|
| Speedup vs sequential | 2x-4x |
| Critical Steps reduction | 3x-4.5x |
| Subagent success rate | >90% |

## Best Practices

1. **Trigger for complex tasks** - Swarm is overkill for simple tasks
2. **Limit subagents** - 3-10 subagents ideal, 100 max
3. **Track metrics** - Learn from Critical Steps data
4. **Use templates** - Frozen subagents reduce setup overhead
5. **Aggregate results** - Synthesize, don't just concatenate

## Troubleshooting

### Subagent fails
- Check template configuration
- Verify tools are available
- Review max_steps limit

### No parallelism detected
- Task may not be decomposable
- Reduce task complexity
- Manual decomposition may be needed

### High Critical Steps
- Too many sequential dependencies
- Refactor to increase parallelism
- Some tasks are inherently sequential

## Related Skills

- [Ouroboros](../ouroboros/SKILL.md) - Intent detection and orchestration
- [Ralph-TUI](../ralph-tui-create-beads/SKILL.md) - Task decomposition
- [Get Shit Done](../get-shit-done/SKILL.md) - Context engineering
- [Claude Home System](../claude-home-system.sh) - Metrics and tracking

## References

- [Kimi K2.5 Technical Report](https://kimi.com/blog) - Agent Swarm paradigm
- [PARL Paper](https://arxiv.org) - Parallel-Agent Reinforcement Learning
- [Ralph-TUI Beads](https://github.com/yopeio/ralph) - Task management
