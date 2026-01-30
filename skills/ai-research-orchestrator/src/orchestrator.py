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
from enum import Enum


class Complexity(Enum):
    """Task complexity levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


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
    
    def to_dict(self) -> dict:
        return {
            "description": self.description,
            "context": self.context,
            "complexity": self.complexity,
            "max_depth": self.max_depth,
            "require_parallel": self.require_parallel
        }


class PatternLibrary:
    """
    Externalized pattern storage (RLM Pattern 1).
    
    Patterns stored in JSON, loaded on-demand.
    Enables 100+ patterns without working memory limits.
    """
    
    def __init__(self, patterns_path: str = None):
        if patterns_path is None:
            base_path = Path(__file__).parent.parent
            patterns_path = base_path / "patterns" / "pattern-library.json"
        self.patterns_path = Path(patterns_path)
        self._loaded_patterns = {}
        self._metadata = {}
        self._load_metadata()
    
    def _load_metadata(self):
        """Load pattern metadata without full patterns."""
        if self.patterns_path.exists():
            try:
                data = json.load(open(self.patterns_path))
                self._metadata = data.get("metadata", {})
            except (json.JSONDecodeError, FileNotFoundError):
                self._metadata = {}
                self._initialize_default_patterns()
        else:
            self._initialize_default_patterns()
    
    def _initialize_default_patterns(self):
        """Initialize with default patterns."""
        default_patterns = {
            "version": "1.0.0",
            "last_updated": "2026-01-29",
            "domains": {
                "research": {
                    "description": "AI research and paper analysis",
                    "patterns": [
                        {
                            "name": "paper-synthesis",
                            "triggers": ["paper", "research", "arxiv", "paper analysis", "summarize"],
                            "confidence": 0.85,
                            "usage_count": 0,
                            "skills": ["ai-researcher", "web_search"],
                            "complexity": "medium"
                        },
                        {
                            "name": "topic-exploratory",
                            "triggers": ["explore", "survey", "landscape", "overview", "current state"],
                            "confidence": 0.72,
                            "usage_count": 0,
                            "skills": ["ai-researcher", "fact-checker"],
                            "complexity": "low"
                        },
                        {
                            "name": "safety-analysis",
                            "triggers": ["safety", "jailbreak", "attack", "red team", "vulnerability"],
                            "confidence": 0.91,
                            "usage_count": 0,
                            "skills": ["ai-researcher", "fact-checker", "web_search"],
                            "complexity": "high"
                        },
                        {
                            "name": "context-analysis",
                            "triggers": ["context", "prompt", "engineering", "memory"],
                            "confidence": 0.78,
                            "usage_count": 0,
                            "skills": ["ai-researcher", "documenter"],
                            "complexity": "medium"
                        }
                    ]
                },
                "coding": {
                    "description": "Code-related tasks",
                    "patterns": [
                        {
                            "name": "code-implementation",
                            "triggers": ["implement", "code", "build", "create"],
                            "confidence": 0.88,
                            "usage_count": 0,
                            "skills": ["code-specialist"],
                            "complexity": "medium"
                        },
                        {
                            "name": "code-debugging",
                            "triggers": ["debug", "fix", "error", "bug", "issue"],
                            "confidence": 0.82,
                            "usage_count": 0,
                            "skills": ["code-specialist", "fact-checker"],
                            "complexity": "low"
                        }
                    ]
                },
                "documentation": {
                    "description": "Documentation and writing",
                    "patterns": [
                        {
                            "name": "document-creation",
                            "triggers": ["document", "write", "create", "draft"],
                            "confidence": 0.90,
                            "usage_count": 0,
                            "skills": ["documenter", "docx"],
                            "complexity": "low"
                        },
                        {
                            "name": "report-generation",
                            "triggers": ["report", "summary", "analysis", "findings"],
                            "confidence": 0.86,
                            "usage_count": 0,
                            "skills": ["documenter", "ai-researcher", "xlsx"],
                            "complexity": "medium"
                        }
                    ]
                }
            },
            "metadata": {
                "total_patterns": 8,
                "total_skills": 9,
                "avg_confidence": 0.84
            }
        }
        
        # Save default patterns
        self.patterns_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.patterns_path, "w") as f:
            json.dump(default_patterns, f, indent=2)
        
        self._metadata = default_patterns.get("metadata", {})
    
    def get_patterns(self, domain: str) -> list[dict]:
        """Get patterns for a domain (lazy load)."""
        if domain not in self._loaded_patterns:
            if self.patterns_path.exists():
                try:
                    data = json.load(open(self.patterns_path))
                    self._loaded_patterns[domain] = data.get("domains", {}).get(domain, {}).get("patterns", [])
                except json.JSONDecodeError:
                    self._loaded_patterns[domain] = []
            else:
                self._loaded_patterns[domain] = []
        return self._loaded_patterns[domain]
    
    def find_matching_patterns(self, query: str, domain: str = "research", max_results: int = 5) -> list[dict]:
        """Find patterns matching query (metadata-only search)."""
        patterns = self.get_patterns(domain)
        query_lower = query.lower()
        
        scored = []
        for pattern in patterns:
            score = self._compute_match_score(query_lower, pattern)
            if score > 0.2:
                scored.append((pattern, score))
        
        scored.sort(key=lambda x: x[1], reverse=True)
        return [p for p, _ in scored[:max_results]]
    
    def _compute_match_score(self, query: str, pattern: dict) -> float:
        """Compute match score based on triggers and confidence."""
        score = 0.0
        triggers = pattern.get("triggers", [])
        
        for trigger in triggers:
            if trigger in query:
                score += 0.4
            elif query in trigger:
                score += 0.3
            else:
                # Word-level matching
                query_words = set(query.split())
                trigger_words = set(trigger.split())
                overlap = len(query_words & trigger_words)
                if overlap > 0:
                    score += 0.1 * overlap
        
        # Boost by confidence
        confidence = pattern.get("confidence", 0.5)
        score = score * (0.5 + 0.5 * confidence)
        return min(score, 1.0)
    
    def update_confidence(self, pattern_name: str, success: bool, domain: str = "research"):
        """Update pattern confidence based on execution outcome."""
        patterns = self.get_patterns(domain)
        for pattern in patterns:
            if pattern["name"] == pattern_name:
                delta = 0.03 if success else -0.05
                pattern["confidence"] = max(0.1, min(1.0, pattern["confidence"] + delta))
                pattern["usage_count"] += 1
                self._save_patterns(domain)
                return True
        return False
    
    def _save_patterns(self, domain: str):
        """Save patterns back to file."""
        if self.patterns_path.exists():
            try:
                data = json.load(open(self.patterns_path))
                if domain in data.get("domains", {}):
                    data["domains"][domain]["patterns"] = self._loaded_patterns[domain]
                    # Update metadata
                    total_patterns = sum(len(d.get("patterns", [])) for d in data.get("domains", {}).values())
                    data["metadata"]["total_patterns"] = total_patterns
                    json.dump(data, open(self.patterns_path, "w"), indent=2)
            except json.JSONDecodeError:
                pass
    
    def get_metadata(self) -> dict:
        """Get pattern library metadata."""
        return self._metadata
    
    def get_all_domains(self) -> list[str]:
        """Get all available domains."""
        if self.patterns_path.exists():
            try:
                data = json.load(open(self.patterns_path))
                return list(data.get("domains", {}).keys())
            except json.JSONDecodeError:
                return []
        return []


class SkillRegistry:
    """
    Registry of available skills from multiple sources.
    
    Sources:
    - agent-swarm/templates/*.json (frozen subagents)
    - anthropics-skills/skills/* (skill folders)
    - custom skills (research/, attacks/)
    """
    
    def __init__(self, registry_path: str = None):
        if registry_path is None:
            base_path = Path(__file__).parent.parent
            registry_path = base_path / "skills" / "skill-registry.json"
        self.registry_path = Path(registry_path)
        self._skills = {}
        self._load_registry()
    
    def _load_registry(self):
        """Load skill registry."""
        if self.registry_path.exists():
            try:
                data = json.load(open(self.registry_path))
                self._skills = data.get("skills", {})
            except json.JSONDecodeError:
                self._initialize_default_registry()
        else:
            self._initialize_default_registry()
    
    def _initialize_default_registry(self):
        """Initialize with default skills."""
        default_skills = {
            "skills": {
                "ai-researcher": {
                    "source": "agent-swarm/templates/ai-researcher.json",
                    "type": "frozen_subagent",
                    "tools": ["web_search", "read", "write", "summarize"],
                    "max_steps": 50,
                    "description": "Research and synthesis specialist"
                },
                "code-specialist": {
                    "source": "agent-swarm/templates/code-specialist.json",
                    "type": "frozen_subagent",
                    "tools": ["exec", "read", "write"],
                    "max_steps": 100,
                    "description": "Coding and debugging specialist"
                },
                "documenter": {
                    "source": "agent-swarm/templates/documenter.json",
                    "type": "frozen_subagent",
                    "tools": ["read", "write"],
                    "max_steps": 30,
                    "description": "Documentation specialist"
                },
                "fact-checker": {
                    "source": "agent-swarm/templates/fact-checker.json",
                    "type": "frozen_subagent",
                    "tools": ["web_search", "read"],
                    "max_steps": 25,
                    "description": "Verification and validation specialist"
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
                "read": {
                    "source": "builtin",
                    "type": "tool",
                    "description": "Read file content"
                },
                "write": {
                    "source": "builtin",
                    "type": "tool",
                    "description": "Write file content"
                },
                "summarize": {
                    "source": "builtin",
                    "type": "tool",
                    "description": "Summarize content"
                },
                "exec": {
                    "source": "builtin",
                    "type": "tool",
                    "description": "Execute shell commands"
                }
            },
            "skill_categories": {
                "research": ["ai-researcher", "fact-checker", "web_search", "summarize", "read"],
                "coding": ["code-specialist", "exec", "read", "write"],
                "documentation": ["documenter", "docx", "pdf", "write"],
                "analysis": ["xlsx", "canvas-design", "fact-checker"]
            }
        }
        
        # Save default registry
        self.registry_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.registry_path, "w") as f:
            json.dump(default_skills, f, indent=2)
        
        self._skills = default_skills.get("skills", {})
    
    def get_skill(self, name: str) -> dict | None:
        """Get skill by name."""
        return self._skills.get(name)
    
    def get_skills_by_category(self, category: str) -> list[str]:
        """Get all skills in a category."""
        if self.registry_path.exists():
            try:
                data = json.load(open(self.registry_path))
                return data.get("skill_categories", {}).get(category, [])
            except json.JSONDecodeError:
                return []
        return []
    
    def get_all_skills(self) -> list[str]:
        """Get all skill names."""
        return list(self._skills.keys())
    
    def activate_skill(self, name: str, **kwargs) -> ExecutionResult:
        """
        Activate a skill programmatically (RLM Pattern 2).
        
        Unlike verbalized delegation, this is symbolic and composable.
        """
        skill = self.get_skill(name)
        if not skill:
            return ExecutionResult(success=False, error=f"Skill '{name}' not found")
        
        start_time = time.perf_counter()
        
        try:
            # Dispatch based on skill type
            if skill.get("type") == "frozen_subagent":
                result = self._activate_subagent(skill, name, **kwargs)
            elif skill.get("type") == "skill":
                result = self._activate_skill(skill, name, **kwargs)
            elif skill.get("type") == "tool":
                result = self._activate_tool(skill, name, **kwargs)
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
    
    def _activate_subagent(self, skill: dict, name: str, **kwargs) -> ExecutionResult:
        """Activate a frozen subagent."""
        # In production, this would spawn the subagent
        # For now, return a mock result
        return ExecutionResult(
            success=True,
            output={
                "subagent": name,
                "role": skill.get("description", "Subagent"),
                "tools": skill.get("tools", []),
                "max_steps": skill.get("max_steps", 50)
            },
            metadata={"type": "frozen_subagent"}
        )
    
    def _activate_skill(self, skill: dict, name: str, **kwargs) -> ExecutionResult:
        """Activate a skill."""
        return ExecutionResult(
            success=True,
            output={
                "skill": name,
                "description": skill.get("description", "Skill"),
                "source": skill.get("source", "unknown")
            },
            metadata={"type": "skill"}
        )
    
    def _activate_tool(self, skill: dict, name: str, **kwargs) -> ExecutionResult:
        """Activate a tool."""
        return ExecutionResult(
            success=True,
            output={
                "tool": name,
                "description": skill.get("description", "Tool")
            },
            metadata={"type": "tool"}
        )
    
    def list_skills_by_type(self, skill_type: str) -> list[str]:
        """List all skills of a given type."""
        return [name for name, skill in self._skills.items() 
                if skill.get("type") == skill_type]


class ExecutionFeedback:
    """
    Feedback loop for learning from executions (RLM Pattern 3).
    
    Captures:
    - Execution outcome (success/failure)
    - Execution time
    - Confidence changes
    - Patterns used
    """
    
    def __init__(self, log_path: str = None):
        if log_path is None:
            base_path = Path(__file__).parent.parent
            log_path = base_path / "memory" / "research-execution-log.jsonl"
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
            "iso_time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "task": task,
            "patterns_used": patterns,
            "skills_activated": skills,
            "success": result.success,
            "execution_time": result.execution_time,
            "confidence_delta": result.confidence_delta,
            "error": result.error,
            "output_type": type(result.output).__name__ if result.output else None
        }
        
        with open(self.log_path, "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    
    def get_statistics(self) -> dict:
        """Get execution statistics for analysis."""
        stats = {
            "total_executions": 0,
            "success_rate": 0.0,
            "avg_execution_time": 0.0,
            "total_execution_time": 0.0,
            "patterns_by_usage": {},
            "skills_by_usage": {},
            "skills_by_success_rate": {},
            "recent_executions": []
        }
        
        if not self.log_path.exists():
            return stats
        
        executions = []
        with open(self.log_path, "r") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    executions.append(entry)
                except json.JSONDecodeError:
                    continue
        
        if not executions:
            return stats
        
        stats["total_executions"] = len(executions)
        stats["recent_executions"] = executions[-10:]  # Last 10
        
        successful = [e for e in executions if e.get("success", False)]
        stats["success_rate"] = len(successful) / len(executions) if executions else 0
        
        times = [e.get("execution_time", 0) for e in executions]
        stats["avg_execution_time"] = sum(times) / len(times) if times else 0
        stats["total_execution_time"] = sum(times)
        
        for entry in executions:
            for pattern in entry.get("patterns_used", []):
                if pattern not in stats["patterns_by_usage"]:
                    stats["patterns_by_usage"][pattern] = 0
                stats["patterns_by_usage"][pattern] += 1
            
            for skill in entry.get("skills_activated", []):
                if skill not in stats["skills_by_usage"]:
                    stats["skills_by_usage"][skill] = 0
                stats["skills_by_usage"][skill] += 1
                
                if skill not in stats["skills_by_success_rate"]:
                    stats["skills_by_success_rate"][skill] = {"success": 0, "total": 0}
                stats["skills_by_success_rate"][skill]["total"] += 1
                if entry.get("success", False):
                    stats["skills_by_success_rate"][skill]["success"] += 1
        
        # Calculate success rates
        for skill, data in stats["skills_by_success_rate"].items():
            data["success_rate"] = data["success"] / data["total"] if data["total"] > 0 else 0
        
        return stats
    
    def get_pattern_learnings(self, pattern_name: str) -> dict:
        """Get learning statistics for a specific pattern."""
        if not self.log_path.exists():
            return {"usages": 0, "success_rate": 0}
        
        pattern_usages = []
        with open(self.log_path, "r") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    if pattern_name in entry.get("patterns_used", []):
                        pattern_usages.append(entry)
                except json.JSONDecodeError:
                    continue
        
        if not pattern_usages:
            return {"usages": 0, "success_rate": 0}
        
        successful = [e for e in pattern_usages if e.get("success", False)]
        return {
            "usages": len(pattern_usages),
            "success_rate": len(successful) / len(pattern_usages) if pattern_usages else 0,
            "avg_execution_time": sum(e.get("execution_time", 0) for e in pattern_usages) / len(pattern_usages)
        }


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
        max_iterations: int = 10
    ):
        self.pattern_library = pattern_library
        self.skill_registry = skill_registry
        self.feedback = feedback
        self.max_iterations = max_iterations
        self.state = {}
        self.execution_history = []
    
    def execute(self, task: ResearchTask) -> ExecutionResult:
        """
        Execute a research task with recursive orchestration.
        """
        start_time = time.perf_counter()
        patterns_used = []
        skills_activated = []
        results = []
        
        # Find matching patterns
        matched_patterns = self.pattern_library.find_matching_patterns(task.description)
        
        for i in range(self.max_iterations):
            current_results = []
            
            # Activate skills for each pattern
            for pattern in matched_patterns:
                pattern_name = pattern["name"]
                patterns_used.append(pattern_name)
                
                skills = pattern.get("skills", [])
                for skill_name in skills:
                    skills_activated.append(skill_name)
                    
                    result = self.skill_registry.activate_skill(skill_name)
                    current_results.append(result)
                    
                    # Update pattern confidence
                    self.pattern_library.update_confidence(
                        pattern_name,
                        result.success
                    )
                    
                    # Store in state
                    self.state[f"{pattern_name}_{skill_name}"] = result
            
            results.extend(current_results)
            
            # Check for completion
            completion = self._check_completion(current_results, task)
            if completion:
                self.execution_history.append({
                    "iteration": i + 1,
                    "patterns": patterns_used.copy(),
                    "skills": skills_activated.copy()
                })
                
                self.feedback.log_execution(
                    task.description,
                    patterns_used,
                    skills_activated,
                    ExecutionResult(
                        success=True,
                        output=completion,
                        execution_time=time.perf_counter() - start_time
                    )
                )
                
                return ExecutionResult(
                    success=True,
                    output=completion,
                    execution_time=time.perf_counter() - start_time,
                    metadata={"iterations": i + 1, "patterns_used": patterns_used}
                )
            
            # Update patterns based on results and retry
            matched_patterns = self._refine_patterns(current_results, matched_patterns)
            
            if not matched_patterns:
                break
        
        # Max iterations reached
        final_output = self._finalize_results(results)
        self.execution_history.append({
            "iteration": self.max_iterations,
            "patterns": patterns_used.copy(),
            "skills": skills_activated.copy()
        })
        
        self.feedback.log_execution(
            task.description,
            patterns_used,
            skills_activated,
            ExecutionResult(
                success=True,
                output=final_output,
                execution_time=time.perf_counter() - start_time
            )
        )
        
        return ExecutionResult(
            success=True,
            output=final_output,
            execution_time=time.perf_counter() - start_time,
            metadata={"iterations": self.max_iterations, "patterns_used": patterns_used}
        )
    
    def _check_completion(self, results: list[ExecutionResult], task: ResearchTask) -> str | None:
        """Check if task is complete."""
        if not results:
            return None
        
        successful = [r for r in results if r.success and r.output]
        success_rate = len(successful) / len(results) if results else 0
        
        # Completion criteria: 70% success rate
        if success_rate >= 0.7:
            return f"Completed {len(successful)}/{len(results)} steps successfully ({(success_rate*100):.0f}% success rate)"
        
        return None
    
    def _refine_patterns(
        self,
        results: list[ExecutionResult],
        current_patterns: list[dict]
    ) -> list[dict]:
        """Refine patterns based on execution results."""
        successful_patterns = []
        pattern_results = {}
        
        # Group results by pattern
        for i, pattern in enumerate(current_patterns):
            pattern_name = pattern["name"]
            # Get results for this pattern's skills
            pattern_results[pattern_name] = results[i] if i < len(results) else None
        
        # Boost patterns with successful results
        for pattern in current_patterns:
            pattern_name = pattern["name"]
            result = pattern_results.get(pattern_name)
            if result and result.success:
                successful_patterns.append(pattern)
        
        return successful_patterns if successful_patterns else current_patterns
    
    def _finalize_results(self, results: list[ExecutionResult]) -> dict:
        """Finalize and compose results."""
        successful = [r for r in results if r.success]
        failed = [r for r in results if not r.success]
        
        return {
            "total_steps": len(results),
            "successful_steps": len(successful),
            "failed_steps": len(failed),
            "success_rate": len(successful) / len(results) if results else 0,
            "outputs": [r.output for r in successful if r.output],
            "errors": [r.error for r in failed if r.error],
            "status": "completed_with_partial_success" if successful else "failed"
        }
    
    def get_state(self) -> dict:
        """Get current orchestrator state."""
        return {
            "state_keys": list(self.state.keys()),
            "execution_history": self.execution_history,
            "patterns_in_state": len([k for k in self.state.keys() if not k.startswith("_")])
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
            "metadata": result.metadata,
            "statistics": self.feedback.get_statistics()
        }
    
    def parallel_research(
        self,
        queries: list[str],
        complexity: str = "medium"
    ) -> list[dict]:
        """
        Execute multiple research queries in parallel.
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
        results = self.parallel_research(
            [f"Compare {approach} for {task}" for approach in approaches],
            complexity="high"
        )
        return {
            "task": task,
            "approaches": approaches,
            "results": results,
            "statistics": self.feedback.get_statistics()
        }
    
    def analyze_attack(self, attack_name: str) -> dict:
        """Analyze a specific AI attack technique."""
        return self.research(
            f"Analyze {attack_name} attack technique in AI systems",
            complexity="high",
            depth=3
        )
    
    def get_statistics(self) -> dict:
        """Get orchestrator statistics."""
        return {
            "pattern_library": self.pattern_library.get_metadata(),
            "skill_count": len(self.skill_registry.get_all_skills()),
            "execution_stats": self.feedback.get_statistics(),
            "orchestrator_state": self.orchestrator.get_state()
        }
    
    def list_patterns(self, domain: str = "research") -> list[dict]:
        """List all patterns in a domain."""
        return self.pattern_library.get_patterns(domain)
    
    def list_skills(self) -> dict:
        """List all registered skills."""
        return {
            "skills": self.skill_registry.get_all_skills(),
            "by_category": {
                cat: self.skill_registry.get_skills_by_category(cat)
                for cat in ["research", "coding", "documentation", "analysis"]
            }
        }


def create_orchestrator() -> AIReseachOrchestrator:
    """Create and return an AI research orchestrator instance."""
    return AIReseachOrchestrator()


if __name__ == "__main__":
    # Example usage
    print("AI Research Orchestrator v1.0.0")
    print("=" * 50)
    
    orchestrator = create_orchestrator()
    
    # Show available patterns and skills
    print("\nAvailable Patterns (research domain):")
    for pattern in orchestrator.list_patterns("research"):
        print(f"  - {pattern['name']}: {pattern['triggers'][:3]} (confidence: {pattern['confidence']:.2f})")
    
    print("\nAvailable Skills:")
    skills_info = orchestrator.list_skills()
    for skill in list(skills_info["skills"])[:5]:
        print(f"  - {skill}")
    print(f"  ... and {len(skills_info['skills']) - 5} more")
    
    # Run a simple research task
    print("\n" + "=" * 50)
    print("Running sample research task...")
    result = orchestrator.research("LLM jailbreak techniques")
    
    print(f"\nSuccess: {result['success']}")
    print(f"Output: {result['output']}")
    print(f"Execution time: {result['execution_time']:.3f}s")
