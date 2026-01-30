# Master Skill Orchestrator

Unified orchestration for 120+ skills (local + Orchestra Research).

## Quick Start

```python
from skill_orchestrator import create_orchestrator

orchestrator = create_orchestrator()

# Find skills for a task
matches = orchestrator.find_skills("fine-tune llama 3 with LoRA")
print(f"Found {len(matches)} matching skills")

# Activate skills for a task
result = orchestrator.activate_for_task(
    "Set up vLLM inference with safety guardrails",
    mode="parallel"
)
print(f"Skills used: {result['skills_used']}")
```

## Features

- **114 skills discovered** (33 local + 81 Orchestra Research)
- **27 categories** spanning AI research lifecycle
- **Intelligent routing** based on task matching
- **Parallel activation** for independent skills
- **Feedback learning** with confidence scores

## Structure

```
skill-orchestrator/
├── SKILL.md           # Full documentation
├── README.md          # This file
├── src/
│   └── orchestrator.py  # Main implementation
└── data/
    └── unified-registry.json  # Auto-built index
```

## See Also

- `SKILL.md` - Full documentation
- [Orchestra Research Skills](https://github.com/Orchestra-Research/AI-research-SKILLs)
- `ai-research-orchestrator/` - AI research focus
