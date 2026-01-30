# AI Research Orchestrator

RLM-inspired orchestration layer for AI research skills.

## Quick Start

```python
from ai_research_orchestrator import create_orchestrator

orchestrator = create_orchestrator()

# Simple research
result = orchestrator.research("LLM jailbreak techniques")
print(result["output"])

# Topic survey
survey = orchestrator.survey_topic("context engineering")
print(survey["output"])

# Paper analysis
analysis = orchestrator.analyze_paper("/research/ai-safety/paper.pdf")
print(analysis["output"])
```

## Features

- **Externalized Pattern Storage** - Patterns in JSON, lazy loaded
- **Symbolic Skill Activation** - Programmatic skill invocation
- **Feedback Loop Learning** - Confidence tracking from executions
- **Recursive Orchestration** - Iterative research refinement

## Structure

```
ai-research-orchestrator/
├── SKILL.md           # Full documentation
├── README.md          # This file
├── src/
│   ├── __init__.py
│   └── orchestrator.py  # Main implementation
├── patterns/
│   └── pattern-library.json
├── skills/
│   └── skill-registry.json
└── memory/
    └── research-execution-log.jsonl
```

## Integration

- **Agent Swarm Templates:** ai-researcher, code-specialist, documenter, fact-checker
- **Anthropics Skills:** docx, pdf, xlsx, canvas-design
- **Custom Skills:** rlm-research, ai-safety, attacks

## See Also

- `SKILL.md` - Full documentation
- `rlm-research/RLM-PATTERN-EXTRACTION.md` - RLM pattern analysis
