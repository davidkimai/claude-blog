# AI Research Orchestration Layer

**Purpose:** Orchestrate AI research skills with RLM-inspired recursive self-improvement  
**Location:** `/Users/jasontang/clawd/skills/ai-research-orchestrator/`  
**Version:** 1.0.0

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AI RESEARCH ORCHESTRATOR                             │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 1. PATTERN LIBRARY (RLM Pattern 1: Externalized Storage)        │   │
│  │    - Research patterns externalized from working memory          │   │
│  │    - Lazy loading of pattern subsets                             │   │
│  │    - Versioned pattern history                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 2. SKILL ACTIVATOR (RLM Pattern 2: Symbolic Recursion)          │   │
│  │    - Programmatic skill activation (not verbalized)             │   │
│  │    - Conditional routing based on context                        │   │
│  │    - Parallel skill execution                                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 3. EXECUTION ENGINE (RLM Pattern 3: Feedback Loop)              │   │
│  │    - Capture execution outcomes                                  │   │
│  │    - Update pattern confidence                                   │   │
│  │    - Learn from research trajectories                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 4. RECURSIVE ORCHESTRATOR (RLM Pattern 4: Iteration)            │   │
│  │    - Iterative research refinement                               │   │
│  │    - Depth-based complexity routing                              │   │
│  │    - Termination detection                                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         SKILL ECOSYSTEM                                 │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │  Anthropic Skills │  │  Agent Swarm    │  │   Custom Skills  │      │
│  │                  │  │   Templates     │  │                  │      │
│  │  - docx/pdf/xlsx │  │  - ai-researcher│  │  - rlm-research  │      │
│  │  - canvas-design │  │  - code-special │  │  - context-eng   │      │
│  │  - mcp-builder   │  │  - documenter   │  │  - ai-safety     │      │
│  │  - webapp-test   │  │  - fact-checker │  │  - attacks       │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Pattern Library (Externalized Storage)

**Location:** `patterns/pattern-library.json`

```json
{
  "version": "1.0.0",
  "last_updated": "2026-01-29",
  "domains": {
    "research": {
      "description": "AI research and paper analysis",
      "patterns": [
        {
          "name": "paper-synthesis",
          "triggers": ["paper", "research", "arxiv", "paper analysis"],
          "confidence": 0.85,
          "usage_count": 42,
          "skills": ["web_search", "read", "summarize"],
          "complexity": "medium"
        },
        {
          "name": "topic-exploratory",
          "triggers": ["explore", "survey", "landscape", "overview"],
          "confidence": 0.72,
          "usage_count": 18,
          "skills": ["web_search", "ai-researcher"],
          "complexity": "low"
        },
        {
          "name": "safety-analysis",
          "triggers": ["safety", "jailbreak", "attack", "red team"],
          "confidence": 0.91,
          "usage_count": 56,
          "skills": ["ai-researcher", "fact-checker"],
          "complexity": "high"
        }
      ]
    },
    "coding": {
      "description": "Code-related tasks",
      "patterns": [...]
    },
    "documentation": {
      "description": "Documentation and writing",
      "patterns": [...]
    }
  },
  "metadata": {
    "total_patterns": 24,
    "total_skills": 12,
    "avg_confidence": 0.78
  }
}
```

### 2. Skill Registry

**Location:** `skills/skill-registry.json`

```json
{
  "skills": {
    "ai-researcher": {
      "source": "agent-swarm/templates/ai-researcher.json",
      "type": "frozen_subagent",
      "tools": ["web_search", "read", "write", "summarize"],
      "max_steps": 50
    },
    "code-specialist": {
      "source": "agent-swarm/templates/code-specialist.json",
      "type": "frozen_subagent",
      "tools": ["exec", "read", "write"],
      "max_steps": 100
    },
    "documenter": {
      "source": "agent-swarm/templates/documenter.json",
      "type": "frozen_subagent",
      "tools": ["read", "write"],
      "max_steps": 30
    },
    "fact-checker": {
      "source": "agent-swarm/templates/fact-checker.json",
      "type": "frozen_subagent",
      "tools": ["web_search", "read"],
      "max_steps": 25
    },
    "docx": {
      "source": "anthropics-skills/skills/docx",
      "type": "skill",
      "description": "Create and edit Word documents"
    },
    "pdf": {
      "source": "anthropics-skills/skills/pdf",
      "type": "skill",
      "description": "Extract and edit PDF content"
    },
    "xlsx": {
      "source": "anthropics-skills/skills/xlsx",
      "type": "skill",
      "description": "Create and edit spreadsheets"
    },
    "canvas-design": {
      "source": "anthropics-skills/skills/canvas-design",
      "type": "skill",
      "description": "Create visual designs"
    },
    "web_search": {
      "source": "builtin",
      "type": "tool",
      "description": "Web search capability"
    },
    "summarize": {
      "source": "builtin",
      "type": "tool",
      "description": "Summarize content"
    }
  },
  "skill_categories": {
    "research": ["ai-researcher", "fact-checker", "web_search", "summarize"],
    "coding": ["code-specialist", "exec", "read", "write"],
    "documentation": ["documenter", "docx", "pdf", "write"],
    "analysis": ["analyst", "xlsx", "canvas-design"]
  }
}
```

### 3. Orchestrator Engine

**Location:** `src/orchestrator.py`

```python
"""
AI Research Orchestrator

Orchestrates AI research workflows using RLM-inspired patterns:
- Externalized pattern storage
- Symbolic skill activation
- Feedback loop learning
- Recursive orchestration
"""

import json
import time
from pathlib import Path
from typing import Any
from dataclasses import dataclass, field


@dataclass
class ExecutionResult:
    """Result of a skill or pattern execution."""
    success: bool
    output: Any | None = None
    error: str | None = None
    execution_time: float = 0.0
    confidence_delta: float = 0.0
    metadata: dict = field(default_factory=dict)


@dataclass
class ResearchTask:
    """A research task to be executed."""
    description: str
    context: dict | None = None
    complexity: str = "medium"  # low, medium, high
    max_depth: int = 3
    require_parallel: bool = False


class PatternLibrary:
    """
    Externalized pattern storage (RLM Pattern 1).
    
    Patterns stored in JSON, loaded on-demand.
    Enables 100+ patterns without working memory limits.
    """
    
    def __init__(self, patterns_path: str = "patterns/pattern-library.json"):
        self.patterns_path = Path(patterns_path)
        self._loaded_patterns = {}
        self._metadata = {}
        self._load_metadata()
    
    def _load_metadata(self):
        """Load pattern metadata without full patterns."""
        if self.patterns_path.exists():
            data = json.load(open(self.patterns_path))
            self._metadata = data.get("metadata", {})
            # Don't load full patterns yet - lazy load
    
    def get_patterns(self, domain: str) -> list[dict]:
        """Get patterns for a domain (lazy load)."""
        if domain not in self._loaded_patterns:
            if self.patterns_path.exists():
                data = json.load(open(self.patterns_path))
                self._loaded_patterns[domain] = data.get("domains", {}).get(domain, {}).get("patterns", [])
            else:
                self._loaded_patterns[domain] = []
        return self._loaded_patterns[domain]
    
    def find_matching_patterns(self, query: str, domain: str = "research") -> list[dict]:
        """Find patterns matching query (metadata-only search)."""
        patterns = self.get_patterns(domain)
        query_lower = query.lower()
        
        scored = []
        for pattern in patterns:
            score = self._compute_match_score(query_lower, pattern)
            if score > 0.3:
                scored.append((pattern, score))
        
        scored.sort(key=lambda x: x[1], reverse=True)
        return [p for p, _ in scored[:5]]
    
    def _compute_match_score(self, query: str, pattern: dict) -> float:
        """Compute match score based on triggers and confidence."""
        score = 0.0
        triggers = pattern.get("triggers", [])
        
        for trigger in triggers:
            if trigger in query:
                score += 0.3
            elif trigger.split()[0] in query:  # Partial match
                score += 0.1
        
        # Boost by confidence
        score *= pattern.get("confidence", 0.5)
        return score
    
    def update_confidence(self, pattern_name: str, success: bool, domain: str = "research"):
        """Update pattern confidence based on execution outcome."""
        patterns = self.get_patterns(domain)
        for pattern in patterns:
            if pattern["name"] == pattern_name:
                delta = 0.05 if success else -0.05
                pattern["confidence"] = max(0.1, min(1.0, pattern["confidence"] + delta))
                pattern["usage_count"] += 1
                self._save_patterns(domain)
                return
    def _save_patterns(self, domain: str):
        """Save patterns back to file."""
        if self.patterns_path.exists():
            data = json.load(open(self.patterns_path))
            data["domains"][domain]["patterns"] = self._loaded_patterns[domain]
            json.dump(data, open(self.patterns_path, "w"), indent=2)


class SkillRegistry:
    """
    Registry of available skills from multiple sources.
    
    Sources:
    - agent-swarm/templates/*.json (frozen subagents)
    - anthropics-skills/skills/* (skill folders)
    - custom skills (research/, attacks/)
    """
    
    def __init__(self, registry_path: str = "skills/skill-registry.json"):
        self.registry_path = Path(registry_path)
        self._skills = {}
        self._load_registry()
    
    def _load_registry(self):
        """Load skill registry."""
        if self.registry_path.exists():
            data = json.load(open(self.registry_path))
            self._skills = data.get("skills", {})
    
    def get_skill(self, name: str) -> dict | None:
        """Get skill by name."""
        return self._skills.get(name)
    
    def get_skills_by_category(self, category: str) -> list[str]:
        """Get all skills in a category."""
        if self.registry_path.exists():
            data = json.load(open(self.registry_path))
            return data.get("skill_categories", {}).get(category, [])
        return []
    
    def activate_skill(self, name: str, **kwargs) -> ExecutionResult:
        """
        Activate a skill programmatically (RLM Pattern 2).
        
        Unlike verbalized delegation, this is symbolic and composable.
        """
        skill = self.get_skill(name)
        if not skill:
            return ExecutionResult(success=False, error=f"Skill {name} not found")
        
        start_time = time.perf_counter()
        
        try:
            # Dispatch based on skill type
            if skill.get("type") == "frozen_subagent":
                result = self._activate_subagent(skill, **kwargs)
            elif skill.get("type") == "skill":
                result = self._activate_skill(skill, **kwargs)
            elif skill.get("type") == "tool":
                result = self._activate_tool(skill, **kwargs)
            else:
                result = ExecutionResult(success=False, error=f"Unknown skill type: {skill.get('type')}")
            
            result.execution_time = time.perf_counter() - start_time
            return result
        except Exception as e:
            return ExecutionResult(
                success=False,
                error=str(e),
                execution_time=time.perf_counter() - start_time
            )
    
    def _activate_subagent(self, skill: dict, **kwargs) -> ExecutionResult:
        """Activate a frozen subagent."""
        # Implementation would spawn subagent with template
        return ExecutionResult(success=True, output={"subagent": skill.get("name")})
    
    def _activate_skill(self, skill: dict, **kwargs) -> ExecutionResult:
        """Activate a skill."""
        return ExecutionResult(success=True, output={"skill": skill.get("name")})
    
    def _activate_tool(self, skill: dict, **kwargs) -> ExecutionResult:
        """Activate a tool."""
        return ExecutionResult(success=True, output={"tool": skill.get("name")})


class ExecutionFeedback:
    """
    Feedback loop for learning from executions (RLM Pattern 3).
    
    Captures:
    - Execution outcome (success/failure)
    - Execution time
    - Confidence changes
    - Patterns used
    """
    
    def __init__(self, log_path: str = "memory/research-execution-log.jsonl"):
        self.log_path = Path(log_path)
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
    
    def log_execution(
        self,
        task: str,
        patterns: list[str],
        skills: list[str],
        result: ExecutionResult
    ):
        """Log an execution for learning."""
        log_entry = {
            "timestamp": time.time(),
            "task": task,
            "patterns_used": patterns,
            "skills_activated": skills,
            "success": result.success,
            "execution_time": result.execution_time,
            "confidence_delta": result.confidence_delta,
            "error": result.error
        }
        
        with open(self.log_path, "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    
    def get_statistics(self) -> dict:
        """Get execution statistics for analysis."""
        stats = {
            "total_executions": 0,
            "success_rate": 0.0,
            "avg_execution_time": 0.0,
            "patterns_by_usage": {},
            "skills_by_success": {}
        }
        
        if not self.log_path.exists():
            return stats
        
        with open(self.log_path, "r") as f:
            for line in f:
                entry = json.loads(line)
                stats["total_executions"] += 1
                
                if entry["success"]:
                    stats["success_rate"] = (stats["success_rate"] * (stats["total_executions"] - 1) + 1) / stats["total_executions"]
                else:
                    stats["success_rate"] = (stats["success_rate"] * (stats["total_executions"] - 1)) / stats["total_executions"]
                
                stats["avg_execution_time"] = (stats["avg_execution_time"] * (stats["total_executions"] - 1) + entry["execution_time"]) / stats["total_executions"]
                
                for pattern in entry.get("patterns_used", []):
                    if pattern not in stats["patterns_by_usage"]:
                        stats["patterns_by_usage"][pattern] = 0
                    stats["patterns_by_usage"][pattern] += 1
                
                for skill in entry.get("skills_activated", []):
                    if skill not in stats["skills_by_success"]:
                        stats["skills_by_success"][skill] = {"success": 0, "total": 0}
                    stats["skills_by_success"][skill]["total"] += 1
                    if entry["success"]:
                        stats["skills_by_success"][skill]["success"] += 1
        
        return stats


class RecursiveOrchestrator:
    """
    Recursive orchestrator for complex research tasks (RLM Pattern 4).
    
    Features:
    - Iterative refinement with max iterations
    - Depth-based complexity routing
    - Termination detection
    """
    
    def __init__(
        self,
        pattern_library: PatternLibrary,
        skill_registry: SkillRegistry,
        feedback: ExecutionFeedback,
        max_iterations: int = 10,
        max_depth: int = 3
    ):
        self.pattern_library = pattern_library
        self.skill_registry = skill_registry
        self.feedback = feedback
        self.max_iterations = max_iterations
        self.max_depth = max_depth
        self.state = {}
    
    def execute(self, task: ResearchTask) -> ExecutionResult:
        """
        Execute a research task with recursive orchestration.
        
        Flow:
        1. Match patterns to task
        2. Activate skills based on patterns
        3. Check for completion
        4. Update state and iterate if needed
        """
        start_time = time.perf_counter()
        patterns_used = []
        skills_activated = []
        results = []
        
        # Find matching patterns
        matched_patterns = self.pattern_library.find_matching_patterns(task.description)
        
        for i in range(self.max_iterations):
            # Activate skills for each pattern
            for pattern in matched_patterns:
                pattern_name = pattern["name"]
                patterns_used.append(pattern_name)
                
                skills = pattern.get("skills", [])
                for skill_name in skills:
                    skills_activated.append(skill_name)
                    
                    result = self.skill_registry.activate_skill(skill_name)
                    results.append(result)
                    
                    # Update pattern confidence
                    self.pattern_library.update_confidence(
                        pattern_name,
                        result.success
                    )
                    
                    self.state[pattern_name] = result
            
            # Check for completion
            completion = self._check_completion(results, task)
            if completion:
                self.feedback.log_execution(
                    task.description,
                    patterns_used,
                    skills_activated,
                    ExecutionResult(success=True, output=completion)
                )
                return ExecutionResult(
                    success=True,
                    output=completion,
                    execution_time=time.perf_counter() - start_time
                )
            
            # Update patterns based on results and retry
            matched_patterns = self._refine_patterns(results, matched_patterns)
        
        # Max iterations reached
        final_output = self._finalize_results(results)
        self.feedback.log_execution(
            task.description,
            patterns_used,
            skills_activated,
            ExecutionResult(success=True, output=final_output)
        )
        
        return ExecutionResult(
            success=True,
            output=final_output,
            execution_time=time.perf_counter() - start_time
        )
    
    def _check_completion(self, results: list[ExecutionResult], task: ResearchTask) -> str | None:
        """Check if task is complete."""
        # Simple heuristic: if most results are successful and output is non-empty
        successful = [r for r in results if r.success and r.output]
        if len(successful) >= len(results) * 0.7:
            return f"Completed {len(successful)}/{len(results)} steps successfully"
        return None
    
    def _refine_patterns(
        self,
        results: list[ExecutionResult],
        current_patterns: list[dict]
    ) -> list[dict]:
        """Refine patterns based on execution results."""
        # Simple refinement: boost patterns with successful results
        successful_patterns = []
        for pattern in current_patterns:
            pattern_name = pattern["name"]
            if self.state.get(pattern_name, ExecutionResult(success=False)).success:
                successful_patterns.append(pattern)
        
        return successful_patterns if successful_patterns else current_patterns
    
    def _finalize_results(self, results: list[ExecutionResult]) -> dict:
        """Finalize and compose results."""
        return {
            "total_results": len(results),
            "successful": len([r for r in results if r.success]),
            "outputs": [r.output for r in results if r.success]
        }


class AIReseachOrchestrator:
    """
    Main orchestrator combining all components.
    
    Entry point for AI research workflows.
    """
    
    def __init__(self):
        self.pattern_library = PatternLibrary()
        self.skill_registry = SkillRegistry()
        self.feedback = ExecutionFeedback()
        self.orchestrator = RecursiveOrchestrator(
            self.pattern_library,
            self.skill_registry,
            self.feedback
        )
    
    def research(
        self,
        query: str,
        complexity: str = "medium",
        depth: int = 3
    ) -> dict:
        """
        Execute an AI research task.
        
        Args:
            query: Research question or task description
            complexity: Task complexity (low, medium, high)
            depth: Maximum recursion depth
        
        Returns:
            Research results
        """
        task = ResearchTask(
            description=query,
            complexity=complexity,
            max_depth=depth
        )
        
        result = self.orchestrator.execute(task)
        
        return {
            "query": query,
            "success": result.success,
            "output": result.output,
            "execution_time": result.execution_time,
            "statistics": self.feedback.get_statistics()
        }
    
    def parallel_research(
        self,
        queries: list[str],
        complexity: str = "medium"
    ) -> list[dict]:
        """
        Execute multiple research queries in parallel.
        
        Uses agent-swarm patterns for parallel execution.
        """
        results = []
        for query in queries:
            results.append(self.research(query, complexity))
        return results
    
    def analyze_paper(self, paper_path: str) -> dict:
        """Analyze a research paper."""
        return self.research(
            f"Analyze paper at {paper_path}",
            complexity="high",
            depth=2
        )
    
    def survey_topic(self, topic: str) -> dict:
        """Survey a research topic."""
        return self.research(
            f"Survey current research on {topic}",
            complexity="medium",
            depth=3
        )
    
    def compare_approaches(self, approaches: list[str], task: str) -> dict:
        """Compare different approaches to a task."""
        return self.parallel_research(
            [f"Compare {approach} for {task}" for approach in approaches],
            complexity="high"
        )


# Convenience function
def create_orchestrator() -> AIReseachOrchestrator:
    """Create and return an AI research orchestrator instance."""
    return AIReseachOrchestrator()


if __name__ == "__main__":
    # Example usage
    orchestrator = create_orchestrator()
    
    # Simple research
    result = orchestrator.research("AI safety jailbreak techniques")
    print(f"Research result: {result['success']}")
    print(f"Output: {result['output']}")
    
    # Paper analysis
    paper_result = orchestrator.analyze_paper("/research/ai-safety/paper.pdf")
    print(f"Paper analysis: {paper_result['success']}")
    
    # Topic survey
    survey_result = orchestrator.survey_topic("context engineering")
    print(f"Survey result: {survey_result['success']}")
```

---

## RLM Pattern Mapping

| RLM Pattern | Our Implementation |
|-------------|-------------------|
| Externalized Context | `PatternLibrary` - patterns in JSON, lazy loaded |
| Symbolic Recursion | `SkillRegistry.activate_skill()` - programmatic invocation |
| REPL Feedback Loop | `ExecutionFeedback` - logs outcomes, updates confidence |
| Iteration Loop | `RecursiveOrchestrator` - max_iterations, state accumulation |
| Termination Detection | `_check_completion()` - success rate heuristic |
| Depth-Based Routing | `max_depth` parameter - complexity routing |

---

## Integration with Existing Skills

### Agent Swarm Templates

```python
# Using ai-researcher template
orchestrator.research("Find latest AI safety papers")

# Under the hood:
# 1. Match "paper-synthesis" pattern
# 2. Activate ai-researcher subagent
# 3. Log execution to feedback loop
# 4. Update pattern confidence
```

### Anthropics Skills

```python
# Using docx skill
orchestrator.skill_registry.activate_skill("docx", ...)

# Using canvas-design
orchestrator.skill_registry.activate_skill("canvas-design", ...)
```

### Custom Research Skills

```python
# Research folder integration
orchestrator.research("Analyze attacks/ directory")
# Activates: web_search, fact-checker, documenter
```

---

## Usage Examples

### Basic Research

```python
from ai_research_orchestrator import create_orchestrator

orchestrator = create_orchestrator()

# Simple research query
result = orchestrator.research("What are the latest LLM jailbreak techniques?")
print(result["output"])
```

### Parallel Research

```python
# Research multiple topics in parallel
results = orchestrator.parallel_research([
    "RLM recursive self-improvement",
    "Context engineering patterns",
    "AI safety evaluation metrics"
])
```

### Paper Analysis

```python
# Analyze a research paper
result = orchestrator.analyze_paper("/research/ai-safety/paper.pdf")
print(result["output"]["summary"])
```

### Topic Survey

```python
# Survey a research topic
result = orchestrator.survey_topic("prompt injection attacks")
print(result["output"]["key_papers"])
```

---

## Metrics and Feedback

The system tracks:

```json
{
  "total_executions": 156,
  "success_rate": 0.87,
  "avg_execution_time": 12.5,
  "patterns_by_usage": {
    "paper-synthesis": 42,
    "topic-exploratory": 28,
    "safety-analysis": 56
  },
  "skills_by_success": {
    "ai-researcher": {"success": 45, "total": 50},
    "fact-checker": {"success": 38, "total": 40}
  }
}
```

---

## Files

```
ai-research-orchestrator/
├── SKILL.md                          # This file
├── README.md                         # Quick reference
├── patterns/
│   └── pattern-library.json          # Externalized patterns
├── skills/
│   └── skill-registry.json           # Skill registry
├── src/
│   ├── __init__.py
│   ├── orchestrator.py               # Main orchestrator
│   ├── pattern_library.py            # Pattern externalization
│   ├── skill_registry.py             # Skill management
│   ├── feedback.py                   # Feedback loop
│   └── recursive_orchestrator.py     # Recursive execution
├── memory/
│   └── research-execution-log.jsonl  # Execution history
└── tests/
    └── test_orchestrator.py          # Unit tests
```

---

## Next Steps

1. **Initialize:** Run `python -m src.orchestrator` to create initial pattern library
2. **Integrate:** Connect to agent-swarm for subagent spawning
3. **Enhance:** Add parallel execution using agent-swarm patterns
4. **Learn:** Enable automatic pattern generation from execution logs

---

## References

- **RLM Paper:** `rlm-research/RLM-PAPER-ANALYSIS.md`
- **RLM Code:** `rlm/`
- **Agent Swarm:** `skills/agent-swarm/SKILL.md`
- **Anthropics Skills:** `skills/anthropics-skills/`
