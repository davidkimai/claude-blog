"""
Master Skill Orchestration Layer v2.0

Unified orchestration for 120+ skills with real execution via:
- Kimi Code CLI
- Codex CLI
- Claude Code CLI
- Agent Swarm (parallel subagents)
"""

import json
import time
import asyncio
import subprocess
from pathlib import Path
from typing import Any, Callable
from dataclasses import dataclass, field
from enum import Enum
import re


class CLIProvider(Enum):
    """Available CLI providers for execution."""
    KIMI = "kimi"
    CODEX = "codex"
    CLAUDE = "claude"
    AGENT_SWARM = "agent-swarm"
    LOCAL = "local"


class SkillSource(Enum):
    """Source of a skill."""
    LOCAL = "local"
    ORCHESTRA = "orchestra"
    CUSTOM = "custom"


class Complexity(Enum):
    """Task complexity levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ExecutionMode(Enum):
    """Skill execution mode."""
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    PIPELINE = "pipeline"


@dataclass
class Skill:
    """A skill representation."""
    name: str
    source: SkillSource
    source_path: str
    category: str
    description: str
    triggers: list[str] = field(default_factory=list)
    skills_used: list[str] = field(default_factory=list)
    confidence: float = 0.5
    usage_count: int = 0
    last_used: float = 0.0
    metadata: dict = field(default_factory=dict)
    
    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "source": self.source.value,
            "source_path": self.source_path,
            "category": self.category,
            "description": self.description,
            "triggers": self.triggers,
            "skills_used": self.skills_used,
            "confidence": self.confidence,
            "usage_count": self.usage_count,
            "last_used": self.last_used,
            "metadata": self.metadata
        }


@dataclass
class ExecutionResult:
    """Result of skill execution."""
    success: bool
    skill_name: str
    provider: str
    output: Any = None
    error: str = None
    execution_time: float = 0.0
    confidence_delta: float = 0.0
    exit_code: int = None


@dataclass
class CLIConfig:
    """Configuration for CLI execution."""
    provider: CLIProvider
    command: str
    timeout: int = 300
    non_interactive: bool = True
    
    def execute(self, prompt: str, context: dict = None) -> ExecutionResult:
        """Execute via CLI provider."""
        start_time = time.perf_counter()
        
        # Build command
        cmd = self._build_command(prompt, context)
        
        try:
            if self.non_interactive:
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=self.timeout
                )
                output = result.stdout + result.stderr
                success = result.returncode == 0
            else:
                # Interactive mode - would need PTY
                output = "Interactive mode not supported in current execution"
                success = False
            
            return ExecutionResult(
                success=success,
                skill_name=f"{self.provider.value}-execution",
                provider=self.provider.value,
                output=output[:10000],  # Limit output size
                execution_time=time.perf_counter() - start_time,
                exit_code=result.returncode if self.non_interactive else None
            )
        except subprocess.TimeoutExpired:
            return ExecutionResult(
                success=False,
                skill_name=f"{self.provider.value}-execution",
                provider=self.provider.value,
                error="Execution timeout",
                execution_time=time.perf_counter() - start_time
            )
        except Exception as e:
            return ExecutionResult(
                success=False,
                skill_name=f"{self.provider.value}-execution",
                provider=self.provider.value,
                error=str(e),
                execution_time=time.perf_counter() - start_time
            )
    
    def _build_command(self, prompt: str, context: dict = None) -> list[str]:
        """Build CLI command based on provider."""
        if self.provider == CLIProvider.KIMI:
            return ["kimi", "-p", prompt]
        elif self.provider == CLIProvider.CODEX:
            return ["codex", "-p", prompt]
        elif self.provider == CLIProvider.CLAUDE:
            return ["claude", "-p", prompt]
        else:
            return [self.command, prompt]


class AgentSwarmExecutor:
    """Execute tasks via Agent Swarm."""
    
    def __init__(self, swarm_path: str = None):
        if swarm_path is None:
            self.swarm_path = Path("/Users/jasontang/clawd/skills/agent-swarm")
        else:
            self.swarm_path = Path(swarm_path)
        
        self.templates_path = self.swarm_path / "templates"
        self.scripts_path = self.swarm_path / "scripts"
        self.state_file = self.swarm_path / "memory" / "swarm-state.json"
        
        # Load templates
        self.templates = self._load_templates()
    
    def _load_templates(self) -> dict:
        """Load subagent templates."""
        templates = {}
        if self.templates_path.exists():
            for template_file in self.templates_path.glob("*.json"):
                if template_file.name.endswith(".json") and not template_file.name.startswith("night"):
                    try:
                        template = json.load(open(template_file))
                        templates[template["name"]] = template
                    except json.JSONDecodeError:
                        pass
        return templates
    
    def get_template(self, name: str) -> dict | None:
        """Get a subagent template."""
        return self.templates.get(name)
    
    def list_templates(self) -> list[dict]:
        """List all available templates."""
        return [
            {
                "name": name,
                "role": t.get("role", "Unknown"),
                "description": t.get("description", ""),
                "tools": t.get("tools", []),
                "max_steps": t.get("max_steps", 50)
            }
            for name, t in self.templates.items()
        ]
    
    def spawn_subagent(
        self,
        template_name: str,
        task: str,
        context: dict = None
    ) -> ExecutionResult:
        """Spawn a subagent using a template."""
        start_time = time.perf_counter()
        
        template = self.get_template(template_name)
        if not template:
            return ExecutionResult(
                success=False,
                skill_name=f"agent-swarm-{template_name}",
                provider="agent-swarm",
                error=f"Template '{template_name}' not found"
            )
        
        # Build system prompt from template
        system_prompt = template.get("system_prompt", "")
        role = template.get("role", "Agent")
        
        # Construct full prompt
        full_prompt = f"{system_prompt}\n\nTask: {task}"
        if context:
            full_prompt += f"\n\nContext: {json.dumps(context)}"
        
        # Execute using Claude CLI (default for now)
        # Could also use kimi or codex
        try:
            result = subprocess.run(
                ["claude", "-p", full_prompt],
                capture_output=True,
                text=True,
                timeout=300
            )
            
            return ExecutionResult(
                success=result.returncode == 0,
                skill_name=f"agent-swarm-{template_name}",
                provider="agent-swarm",
                output=result.stdout + result.stderr,
                execution_time=time.perf_counter() - start_time,
                exit_code=result.returncode
            )
        except Exception as e:
            return ExecutionResult(
                success=False,
                skill_name=f"agent-swarm-{template_name}",
                provider="agent-swarm",
                error=str(e),
                execution_time=time.perf_counter() - start_time
            )
    
    def execute_parallel(
        self,
        tasks: list[dict],
        max_concurrent: int = 5
    ) -> list[ExecutionResult]:
        """Execute multiple subagents in parallel."""
        results = []
        
        # Use ThreadPoolExecutor for parallelism
        import concurrent.futures
        
        def run_task(task: dict) -> ExecutionResult:
            template = task.get("template", "ai-researcher")
            return self.spawn_subagent(template, task.get("task", ""))
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_concurrent) as executor:
            futures = {executor.submit(run_task, t): t for t in tasks}
            for future in concurrent.futures.as_completed(futures):
                try:
                    results.append(future.result())
                except Exception as e:
                    results.append(ExecutionResult(
                        success=False,
                        skill_name="parallel-execution",
                        provider="agent-swarm",
                        error=str(e)
                    ))
        
        return results


class SkillDiscovery:
    """Discovers and indexes skills from multiple sources."""
    
    def __init__(self):
        self.local_skills_path = Path("/Users/jasontang/clawd/skills")
        self.orchestra_skills_path = Path.home() / ".orchestra" / "skills"
        self.discovered_skills: dict[str, Skill] = {}
    
    def discover_all(self) -> dict[str, Skill]:
        """Discover all skills from all sources."""
        self.discovered_skills = {}
        
        local_skills = self._discover_local_skills()
        self.discovered_skills.update(local_skills)
        
        orchestra_skills = self._discover_orchestra_skills()
        self.discovered_skills.update(orchestra_skills)
        
        return self.discovered_skills
    
    def _discover_local_skills(self) -> dict[str, Skill]:
        """Discover skills from local skills directory."""
        skills = {}
        
        if not self.local_skills_path.exists():
            return skills
        
        for skill_dir in self.local_skills_path.iterdir():
            if skill_dir.is_dir() and not skill_dir.name.startswith("_"):
                skill = self._parse_local_skill(skill_dir)
                if skill:
                    skills[skill.name] = skill
        
        return skills
    
    def _parse_local_skill(self, skill_dir: Path) -> Skill | None:
        """Parse a local skill from SKILL.md."""
        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            return None
        
        content = skill_md.read_text()
        name = skill_dir.name.lower().replace("-", "_")
        
        # Extract description
        description = ""
        if "## Description" in content:
            desc_match = re.search(r"## Description\s*\n(.*?)(?:\n##|\n#|$)", content, re.DOTALL)
            if desc_match:
                description = desc_match.group(1).strip()[:500]
        
        # Extract triggers
        triggers = []
        if "trigger" in content.lower():
            triggers = re.findall(r'"([^"]+)"', content)
        
        # Categorize
        category = self._categorize_skill(name, description)
        
        return Skill(
            name=name,
            source=SkillSource.LOCAL,
            source_path=str(skill_dir),
            category=category,
            description=description or f"Local skill: {name}",
            triggers=triggers
        )
    
    def _discover_orchestra_skills(self) -> dict[str, Skill]:
        """Discover skills from Orchestra Research directory."""
        skills = {}
        
        if not self.orchestra_skills_path.exists():
            return skills
        
        category_map = {
            "01-model-architecture": "Model Architecture",
            "02-tokenization": "Tokenization",
            "03-fine-tuning": "Fine-Tuning",
            "04-mechanistic-interpretability": "Mechanistic Interpretability",
            "05-data-processing": "Data Processing",
            "06-post-training": "Post-Training",
            "07-safety-alignment": "Safety & Alignment",
            "08-distributed-training": "Distributed Training",
            "09-infrastructure": "Infrastructure",
            "10-optimization": "Optimization",
            "11-evaluation": "Evaluation",
            "12-inference-serving": "Inference & Serving",
            "13-mlops": "MLOps",
            "14-agents": "Agents",
            "15-rag": "RAG",
            "16-prompt-engineering": "Prompt Engineering",
            "17-observability": "Observability",
            "18-multimodal": "Multimodal",
            "19-emerging-techniques": "Emerging Techniques",
            "20-ml-paper-writing": "ML Paper Writing",
        }
        
        for cat_dir in self.orchestra_skills_path.iterdir():
            if cat_dir.is_dir():
                category_name = category_map.get(cat_dir.name, cat_dir.name)
                
                for skill_dir in cat_dir.iterdir():
                    if skill_dir.is_dir():
                        skill = self._parse_orchestra_skill(skill_dir, category_name)
                        if skill:
                            skills[skill.name] = skill
        
        return skills
    
    def _parse_orchestra_skill(self, skill_dir: Path, category: str) -> Skill | None:
        """Parse an Orchestra skill."""
        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            return None
        
        content = skill_md.read_text()
        name = skill_dir.name.lower().replace("-", "_")
        
        # Extract description
        description = ""
        lines = content.split("\n")
        in_description = False
        for line in lines:
            if line.startswith("##"):
                if in_description:
                    break
                in_description = True
            elif in_description and line.strip():
                description += line.strip() + " "
        
        description = description[:500].strip()
        
        # Extract triggers
        triggers = [name.replace("_", " ")]
        if "Use when" in content:
            section_match = re.search(r"Use when[^.]*\.(.*?)(?:\n##|\n#|$)", content, re.DOTALL)
            if section_match:
                triggers.extend(re.findall(r'"([^"]+)"', section_match.group(1)))
        
        return Skill(
            name=name,
            source=SkillSource.ORCHESTRA,
            source_path=str(skill_dir),
            category=category,
            description=description or f"Orchestra skill: {name}",
            triggers=triggers[:10],
            confidence=0.7  # Orchestra skills have high baseline confidence
        )
    
    def _categorize_skill(self, name: str, description: str) -> str:
        """Categorize a local skill."""
        text = f"{name} {description}".lower()
        
        categories = {
            "DevOps": ["deployment", "devops", "docker", "kubernetes"],
            "Frontend": ["react", "frontend", "ui", "css", "html"],
            "Database": ["database", "sql", "postgres", "supabase"],
            "Authentication": ["auth", "login", "security"],
            "Testing": ["test", "testing", "coverage"],
            "Research": ["research", "analysis", "paper"],
            "Documentation": ["document", "write", "read"],
        }
        
        for cat, keywords in categories.items():
            if any(kw in text for kw in keywords):
                return cat
        return "General"


class SkillRegistry:
    """Unified registry of all skills."""
    
    def __init__(self, discovery: SkillDiscovery = None):
        self.skills: dict[str, Skill] = {}
        self.by_category: dict[str, list[str]] = {}
        self.discovery = discovery or SkillDiscovery()
    
    def load(self) -> dict[str, Skill]:
        """Load all skills."""
        self.skills = self.discovery.discover_all()
        self._build_category_index()
        return self.skills
    
    def _build_category_index(self):
        """Build index by category."""
        self.by_category = {}
        for skill in self.skills.values():
            if skill.category not in self.by_category:
                self.by_category[skill.category] = []
            self.by_category[skill.category].append(skill.name)
    
    def get(self, name: str) -> Skill | None:
        """Get a skill by name."""
        return self.skills.get(name)
    
    def find_matching(self, query: str, limit: int = 10) -> list[tuple[Skill, float]]:
        """Find skills matching a query."""
        query_lower = query.lower()
        query_words = set(query_lower.split())
        
        scored = []
        for skill in self.skills.values():
            score = self._compute_match_score(query_lower, query_words, skill)
            if score > 0.1:
                scored.append((skill, score))
        
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:limit]
    
    def _compute_match_score(self, query: str, query_words: set, skill: Skill) -> float:
        """Compute match score."""
        score = 0.0
        
        if skill.name in query:
            score += 0.5
        elif any(word in skill.name for word in query_words if len(word) > 3):
            score += 0.3
        
        for trigger in skill.triggers:
            if trigger in query:
                score += 0.4
            elif query in trigger:
                score += 0.3
        
        if skill.description:
            desc_words = set(skill.description.lower().split())
            overlap = len(query_words & desc_words)
            if overlap > 0:
                score += 0.2 * min(overlap, 5)
        
        score *= (0.5 + 0.5 * skill.confidence)
        return min(score, 1.0)
    
    def update_confidence(self, name: str, success: bool):
        """Update skill confidence."""
        if name not in self.skills:
            return
        
        skill = self.skills[name]
        delta = 0.05 if success else -0.05
        skill.confidence = max(0.1, min(1.0, skill.confidence + delta))
        skill.usage_count += 1
        skill.last_used = time.time()
    
    def get_statistics(self) -> dict:
        """Get registry statistics."""
        return {
            "total_skills": len(self.skills),
            "by_source": {
                "local": len([s for s in self.skills.values() if s.source == SkillSource.LOCAL]),
                "orchestra": len([s for s in self.skills.values() if s.source == SkillSource.ORCHESTRA]),
            },
            "by_category": {cat: len(names) for cat, names in self.by_category.items()},
            "avg_confidence": sum(s.confidence for s in self.skills.values()) / len(self.skills) if self.skills else 0
        }
    
    def list_categories(self) -> list[str]:
        """List all categories."""
        return sorted(self.by_category.keys())


class MasterSkillOrchestrator:
    """
    Master orchestrator with real execution capabilities.
    
    Supports:
    - Kimi Code CLI
    - Codex CLI
    - Claude Code CLI
    - Agent Swarm (parallel subagents)
    """
    
    def __init__(self):
        self.discovery = SkillDiscovery()
        self.registry = SkillRegistry(self.discovery)
        self.registry.load()
        
        # Initialize executors
        self.cli_config = {
            CLIProvider.KIMI: CLIConfig(CLIProvider.KIMI, "kimi"),
            CLIProvider.CODEX: CLIConfig(CLIProvider.CODEX, "codex"),
            CLIProvider.CLAUDE: CLIConfig(CLIProvider.CLAUDE, "claude"),
        }
        
        self.swarm = AgentSwarmExecutor()
        
        # Execution log
        self.execution_log: list[dict] = []
        
        print(f"Master Skill Orchestrator v2.0")
        print(f"=" * 60)
        stats = self.registry.get_statistics()
        print(f"Total skills: {stats['total_skills']}")
        print(f"  - Local: {stats['by_source']['local']}")
        print(f"  - Orchestra: {stats['by_source']['orchestra']}")
        print(f"CLI Providers: kimi, codex, claude")
        print(f"Agent Swarm Templates: {len(self.swarm.templates)}")
        print()
    
    def execute_via_cli(
        self,
        task: str,
        provider: str = "claude",
        context: dict = None
    ) -> ExecutionResult:
        """Execute a task via CLI provider."""
        provider_enum = CLIProvider(provider.lower())
        
        if provider_enum not in self.cli_config:
            return ExecutionResult(
                success=False,
                skill_name=f"cli-{provider}",
                provider=provider,
                error=f"Unknown provider: {provider}"
            )
        
        config = self.cli_config[provider_enum]
        result = config.execute(task, context)
        
        # Log execution
        self.execution_log.append({
            "timestamp": time.time(),
            "task": task,
            "provider": provider,
            "success": result.success,
            "execution_time": result.execution_time
        })
        
        return result
    
    def execute_via_swarm(
        self,
        task: str,
        template: str = "ai-researcher",
        context: dict = None
    ) -> ExecutionResult:
        """Execute a task via Agent Swarm subagent."""
        result = self.swarm.spawn_subagent(template, task, context)
        
        self.execution_log.append({
            "timestamp": time.time(),
            "task": task,
            "provider": "agent-swarm",
            "template": template,
            "success": result.success,
            "execution_time": result.execution_time
        })
        
        return result
    
    def execute_parallel_swarm(
        self,
        tasks: list[dict],
        max_concurrent: int = 5
    ) -> list[ExecutionResult]:
        """Execute multiple tasks in parallel via swarm."""
        results = self.swarm.execute_parallel(tasks, max_concurrent)
        
        for result in results:
            self.execution_log.append({
                "timestamp": time.time(),
                "provider": "agent-swarm-parallel",
                "skill": result.skill_name,
                "success": result.success,
                "execution_time": result.execution_time
            })
        
        return results
    
    def activate_for_task(
        self,
        task: str,
        mode: str = "auto",
        provider: str = "claude",
        context: dict = None
    ) -> dict:
        """
        Activate skills for a task with real execution.
        
        Args:
            task: Task description
            mode: Execution mode (auto, sequential, parallel, pipeline, cli, swarm)
            provider: CLI provider for execution
            context: Additional context
        """
        # Find matching skills
        matches = self.registry.find_matching(task, limit=10)
        
        if not matches:
            return {"error": "No matching skills found", "task": task}
        
        # Select skills
        selected = [s for s, score in matches[:5] if score > 0.2]
        if not selected:
            selected = [matches[0][0]]
        
        # Execute based on mode
        if mode == "cli":
            result = self.execute_via_cli(task, provider, context)
            return {
                "task": task,
                "mode": "cli",
                "provider": provider,
                "result": result.__dict__
            }
        
        elif mode == "swarm":
            # Use best matching template
            template = self._select_template(selected[0].category)
            result = self.execute_via_swarm(task, template, context)
            return {
                "task": task,
                "mode": "swarm",
                "template": template,
                "result": result.__dict__
            }
        
        elif mode == "parallel":
            # Create parallel swarm tasks
            tasks = [
                {"template": self._select_template(s.category), "task": task}
                for s in selected[:5]
            ]
            results = self.execute_parallel_swarm(tasks)
            return {
                "task": task,
                "mode": "parallel",
                "skills_used": [r.skill_name for r in results],
                "results": [r.__dict__ for r in results]
            }
        
        else:  # auto, sequential, pipeline
            # Execute via CLI sequentially
            cli_result = self.execute_via_cli(task, provider, context)
            
            return {
                "task": task,
                "mode": mode,
                "provider": provider,
                "skills_used": [s.name for s in selected],
                "cli_result": cli_result.__dict__
            }
    
    def _select_template(self, category: str) -> str:
        """Select appropriate swarm template based on category."""
        category_templates = {
            "Research": "ai-researcher",
            "Code": "code-specialist",
            "Documentation": "documenter",
            "Analysis": "analyst",
            "General": "ai-researcher"
        }
        
        for cat, template in category_templates.items():
            if cat.lower() in category.lower():
                return template
        
        return "ai-researcher"
    
    def research(self, query: str, provider: str = "claude") -> dict:
        """Execute a research task."""
        return self.activate_for_task(
            f"Research and summarize: {query}",
            mode="swarm",
            provider=provider
        )
    
    def code(self, task: str, provider: str = "claude") -> dict:
        """Execute a coding task."""
        return self.activate_for_task(
            f"Write code for: {task}",
            mode="swarm",
            provider=provider
        )
    
    def compare_providers(self, task: str) -> dict:
        """Compare results from all CLI providers."""
        results = {}
        
        for provider in ["kimi", "codex", "claude"]:
            result = self.execute_via_cli(task, provider)
            results[provider] = {
                "success": result.success,
                "execution_time": result.execution_time,
                "output_length": len(str(result.output)) if result.output else 0
            }
        
        return {
            "task": task,
            "provider_comparison": results,
            "winner": min(results.keys(), key=lambda k: results[k]["execution_time"])
        }
    
    def list_categories(self) -> list[str]:
        """List all categories."""
        return self.registry.list_categories()
    
    def list_swarm_templates(self) -> list[dict]:
        """List available swarm templates."""
        return self.swarm.list_templates()
    
    def get_statistics(self) -> dict:
        """Get orchestrator statistics."""
        stats = self.registry.get_statistics()
        stats["cli_providers"] = ["kimi", "codex", "claude"]
        stats["swarm_templates"] = len(self.swarm.templates)
        stats["total_executions"] = len(self.execution_log)
        stats["recent_executions"] = self.execution_log[-10:]
        return stats
    
    def find_skills(self, query: str, limit: int = 10) -> list[tuple[Skill, float]]:
        """Find skills matching a query."""
        return self.registry.find_matching(query, limit)
    
    def get_skill_info(self, name: str) -> dict | None:
        """Get skill information."""
        skill = self.registry.get(name)
        if not skill:
            return None
        return {
            "name": skill.name,
            "source": skill.source.value,
            "category": skill.category,
            "description": skill.description,
            "confidence": skill.confidence,
            "usage_count": skill.usage_count
        }


def create_orchestrator() -> MasterSkillOrchestrator:
    """Create and return a master orchestrator."""
    return MasterSkillOrchestrator()


if __name__ == "__main__":
    orchestrator = create_orchestrator()
    
    print("\n" + "=" * 60)
    print("CLI Provider Comparison")
    print("=" * 60)
    
    # Quick comparison
    result = orchestrator.compare_providers("What is LoRA fine-tuning?")
    print(f"\nTask: {result['task']}")
    for provider, data in result['provider_comparison'].items():
        print(f"  {provider}: {data['success']} in {data['execution_time']:.2f}s")
    print(f"  Fastest: {result['winner']}")
    
    print("\n" + "=" * 60)
    print("Swarm Templates Available:")
    for t in orchestrator.list_swarm_templates()[:5]:
        print(f"  - {t['name']}: {t['role']}")
    
    print("\n" + "=" * 60)
    print("Research Task via Swarm")
    print("=" * 60)
    
    result = orchestrator.research("Latest advances in RLM recursive self-improvement")
    print(f"Mode: {result['mode']}")
    print(f"Template: {result.get('template', 'N/A')}")
    print(f"Success: {result.get('result', {}).get('success', 'N/A')}")
