"""
Master Skill Orchestration Layer v2.0

Unified orchestration for 120+ skills with real execution via:
- Kimi Code CLI
- Codex CLI
- Claude Code CLI
- Agent Swarm (parallel subagents)
"""

from .orchestrator import (
    MasterSkillOrchestrator,
    SkillRegistry,
    SkillDiscovery,
    Skill,
    ExecutionResult,
    SkillSource,
    CLIProvider,
    CLIConfig,
    AgentSwarmExecutor,
    Complexity,
    ExecutionMode,
    create_orchestrator
)

__version__ = "2.0.0"
__all__ = [
    "MasterSkillOrchestrator",
    "SkillRegistry",
    "SkillDiscovery",
    "Skill",
    "ExecutionResult",
    "SkillSource",
    "CLIProvider",
    "CLIConfig",
    "AgentSwarmExecutor",
    "Complexity",
    "ExecutionMode",
    "create_orchestrator"
]
