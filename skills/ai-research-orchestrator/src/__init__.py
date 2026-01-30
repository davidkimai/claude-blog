"""
AI Research Orchestrator - Main Module

Orchestrates AI research workflows using RLM-inspired patterns.
"""

from .orchestrator import (
    AIReseachOrchestrator,
    RecursiveOrchestrator,
    ExecutionResult,
    ResearchTask,
    PatternLibrary,
    SkillRegistry,
    ExecutionFeedback,
    create_orchestrator
)

__version__ = "1.0.0"
__all__ = [
    "AIReseachOrchestrator",
    "RecursiveOrchestrator", 
    "ExecutionResult",
    "ResearchTask",
    "PatternLibrary",
    "SkillRegistry",
    "ExecutionFeedback",
    "create_orchestrator"
]
