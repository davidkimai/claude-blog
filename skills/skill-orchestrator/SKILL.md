# Master Skill Orchestration Layer v2.0

**Purpose:** Unified orchestration for 114+ skills with real execution via CLI + Agent Swarm  
**Location:** `/Users/jasontang/clawd/skills/skill-orchestrator/`  
**Version:** 2.0.0

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SKILL ORCHESTRATOR v2.0                              │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 1. SKILL DISCOVERY ENGINE                                        │   │
│  │    - 114 skills discovered (33 local + 81 Orchestra)            │   │
│  │    - 27 categories spanning AI research lifecycle               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 2. CLI EXECUTION ENGINES                                         │   │
│  │    ┌───────────┐  ┌───────────┐  ┌───────────┐                 │   │
│  │    │  Kimi     │  │  Codex    │  │  Claude   │                 │   │
│  │    │  Code CLI │  │  CLI      │  │  Code CLI │                 │   │
│  │    └─────┬─────┘  └─────┬─────┘  └─────┬─────┘                 │   │
│  │          └──────────────┴──────────────┘                         │   │
│  │                         ↓                                         │   │
│  │              Real execution with results                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 3. AGENT SWARM INTEGRATION                                       │   │
│  │    - 6 frozen subagent templates                                 │   │
│  │    - Parallel execution                                          │   │
│  │    - Critical Steps tracking                                     │   │
│  │    ┌───────────┐  ┌───────────┐  ┌───────────┐                 │   │
│  │    │Researcher │  │  Code     │  │ Documenter│                 │   │
│  │    │ Specialist│  │ Specialist│  │           │                 │   │
│  │    └───────────┘  └───────────┘  └───────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 4. FEEDBACK & LEARNING                                          │   │
│  │    - Execution tracking                                          │   │
│  │    - Confidence updates                                          │   │
│  │    - Provider comparison                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## CLI Providers

| Provider | Command | Status |
|----------|---------|--------|
| Kimi Code | `kimi -p "<prompt>"` | ✓ Available |
| Codex | `codex -p "<prompt>"` | ✓ Available |
| Claude Code | `claude -p "<prompt>"` | ✓ Available |

---

## Agent Swarm Templates

| Template | Role | Description |
|----------|------|-------------|
| ai-researcher | AI Researcher | Research and synthesis |
| code-specialist | Code Specialist | Coding and debugging |
| documenter | Documentation | Docs and notes |
| analyst | Analyst | Data analysis |
| fact-checker | Fact Checker | Verification |
| code-specialist | Code Specialist | Software engineering |

---

## Usage

### Execute via CLI

```python
from skill_orchestrator import create_orchestrator

orchestrator = create_orchestrator()

# Execute via any CLI provider
result = orchestrator.execute_via_cli(
    "What is LoRA fine-tuning?",
    provider="claude"  # or "kimi", "codex"
)
print(result.output)
print(f"Time: {result.execution_time:.2f}s")
```

### Compare Providers

```python
# Compare all providers
comparison = orchestrator.compare_providers(
    "Explain transformer attention mechanism"
)
print(f"Fastest: {comparison['winner']}")
for provider, data in comparison['provider_comparison'].items():
    print(f"  {provider}: {data['success']} in {data['execution_time']:.2f}s")
```

### Execute via Swarm

```python
# Spawn a subagent
result = orchestrator.execute_via_swarm(
    task="Research latest RLM papers",
    template="ai-researcher"
)

# Parallel execution
results = orchestrator.execute_parallel_swarm([
    {"template": "ai-researcher", "task": "Research LoRA"},
    {"template": "code-specialist", "task": "Implement LoRA"},
    {"template": "documenter", "task": "Write documentation"}
])
```

### Research Task

```python
# High-level research task
result = orchestrator.research("Latest AI safety techniques")
result = orchestrator.code("Build a REST API with FastAPI")
```

---

## Skills Discovered: 114 Total

| Source | Count |
|--------|-------|
| Local skills | 33 |
| Orchestra Research | 81 |

## Categories: 27

| Category | Skills |
|----------|--------|
| Model Architecture | 5 |
| Fine-Tuning | 4 |
| Post-Training | 8 |
| Distributed Training | 6 |
| Inference & Serving | 4 |
| Multimodal | 7 |
| Safety & Alignment | 3 |
| Emerging Techniques | 6 |
| ... and 18 more | ... |

---

## Files

```
skill-orchestrator/
├── SKILL.md              # This file
├── README.md             # Quick start
├── src/
│   ├── __init__.py
│   └── orchestrator.py   # v2.0 with CLI + Swarm integration
└── data/
    └── unified-registry.json  # Auto-built index
```

---

## See Also

- [Orchestra Research Skills](https://github.com/Orchestra-Research/AI-research-SKILLs)
- [agent-swarm](../agent-swarm/SKILL.md)
- [ai-research-orchestrator](../ai-research-orchestrator/SKILL.md)
- [rlm-research](../rlm-research/RLM-PATTERN-EXTRACTION.md)
