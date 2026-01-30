# Agent Swarm Architecture Research

**Date:** 2025-10-01
**Author:** Agent Swarm Research
**Status:** In Progress

---

## Executive Summary

This document outlines recommendations for implementing PARL-inspired (Parallel-Agent Reinforcement Learning) multi-agent orchestration in Clawdbot. We have analyzed CrewAI and AutoGen patterns and adapted them to our existing skills-based architecture.

**Key Findings:**
1. CrewAI/AutoGen concepts map well to our JSON templates with `tools` and `system_prompt` fields.
2. We should adopt a "Manager Pattern" similar to CrewAI's `Crew` for orchestrating subagents.
3. Critical Steps tracking requires explicit start/end markers and asynchronous aggregation.
4. Integration with existing skills (`ouroboros`, `ralph-tui`, `get-shit-done`) should use an Event Bus or shared State Manager pattern.

---

## 1. Current State Analysis

### 1.1 Existing Architecture

We have a functional but fragmented multi-agent system:

- **`skill-orchestrator`** (Python): Central registry and CLI executor. Contains `AgentSwarmExecutor` class.
- **`agent-swarm`** (Node.js): Standalone orchestrator with JSON templates and parallel execution.
- **Templates**: Located at `skills/agent-swarm/templates/*.json` with `role`, `system_prompt`, `tools`, and `max_steps`.

### 1.2 Gap Analysis

| Feature | CrewAI/AutoGen | Our System |
|---------|----------------|------------|
| Orchestration | Central `Crew` class | Separate Python/Node scripts |
| State Management | Shared Context | No shared state between skills |
| Task Definition | `Task` class | Implicit in `decomposeTask` |
| Tool Calling | Dynamic registration | Static `tools` array |
| Parallelism | `ProcessPoolExecutor` | `Promise.all` (JS) |

---

## 2. Recommendations

### 2.1 Adapting CrewAI/AutoGen to a Skill-Based System

We should NOT adopt CrewAI/AutoGen as a framework (too heavy). Instead, we borrow their architectural concepts:

#### CrewAI Concepts vs. Our Adaptation

| CrewAI Concept | Our Adaptation |
|----------------|----------------|
| `Agent` | JSON Template (frozen) |
| `Task` | Dynamic subtask dictionary |
| `Crew` | `SwarmOrchestrator` class |
| `Process` | `execute_parallel()` method |
| `Memory` | Shared `state.json` |

#### Implementation Pattern: "Manager Pattern"

Instead of creating new Agent classes, we manage JSON templates:

```python
# skills/skill-orchestrator/src/swarm_manager.py

class SwarmManager:
    """Manager for swarm orchestration - inspired by CrewAI Crew."""

    def __init__(self, templates_dir: str):
        self.templates = self._load_templates(templates_dir)
        self.state_manager = StateManager()

    def activate(self, task: str, mode: str = "parallel") -> ExecutionResult:
        """Activate swarm for a task."""
        
        # 1. Intent Analysis (Ouroboros integration)
        intent = self.analyze_intent(task)
        
        # 2. Task Decomposition
        subtasks = self.decompose(task, intent)
        
        # 3. Execution (Parallel or Sequential)
        if mode == "parallel":
            results = self.execute_parallel(subtasks)
        else:
            results = self.execute_sequential(subtasks)
        
        # 4. Aggregation
        return self.aggregate(results)
```

### 2.2 Subagent Template Structure

Our current templates are good but need refinement. We recommend adding explicit `inputs` and `outputs` for better integration:

#### Enhanced Template Design

```json
{
  "name": "ai-researcher",
  "role": "AI Researcher",
  "description": "Research and synthesis specialist",
  "system_prompt": "You are an expert AI researcher...",
  "tools": ["web_search", "read", "write", "summarize"],
  "max_steps": 50,
  "frozen": true,
  "examples": [
    "Find top papers on a topic",
    "Research a technology stack"
  ],
  "io_schema": {
    "input_format": "JSON with 'query' field",
    "output_format": "JSON with 'findings' array",
    "required_fields": ["query"]
  },
  "dependencies": [],
  "timeout_ms": 180000
}
```

#### Key Improvements:
1. **`io_schema`**: Defines input/output structure for type safety.
2. **`dependencies`**: Explicitly declares what other templates it needs (for dependency graph).
3. **`timeout_ms`**: Explicit timeout for resource management.

### 2.3 Integration Architecture with Existing Skills

We recommend an **Event Bus + Shared State** pattern for loose coupling.

#### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CLAWDBOT EVENT BUS                              │
├─────────────────────────────────────────────────────────────────────┤
│  ouroboros (Intent) → [TASK_DETECTED] → agent-swarm (Orchestration) │
│  ralph-tui (Beads)  → [TASK_UPDATED]    → agent-swarm                │
│  get-shit-done (Context) → [CONTEXT_READY] → agent-swarm            │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │  SHARED STATE       │
                    │  (swarm-state.json) │
                    └─────────────────────┘
```

#### Implementation

```python
# skills/skill-orchestrator/src/event_bus.py

from typing import Callable, Dict, List
from enum import Enum
import json
import asyncio

class EventType(Enum):
    TASK_CREATED = "task_created"
    TASK_UPDATED = "task_updated"
    CONTEXT_READY = "context_ready"
    SUBAGENT_COMPLETE = "subagent_complete"
    SWARM_COMPLETE = "swarm_complete"

class EventBus:
    """Simple event bus for skill communication."""

    def __init__(self, state_file: str = "/Users/jasontang/clawd/skills/agent-swarm/memory/swarm-state.json"):
        self.subscribers: Dict[EventType, List[Callable]] = {}
        self.state_file = state_file
        self.state = self._load_state()

    def subscribe(self, event: EventType, callback: Callable):
        if event not in self.subscribers:
            self.subscribers[event] = []
        self.subscribers[event].append(callback)

    async def publish(self, event: EventType, data: dict):
        print(f"[EVENT BUS] Publishing {event.value}: {data.get('task_id', 'N/A')}")
        
        # Update shared state
        self._update_state(event, data)
        
        # Notify subscribers
        if event in self.subscribers:
            for callback in self.subscribers[event]:
                await callback(data)

    def _load_state(self) -> dict:
        try:
            with open(self.state_file) as f:
                return json.load(f)
        except:
            return {"tasks": {}, "contexts": {}}

    def _update_state(self, event: EventType, data: dict):
        task_id = data.get("task_id")
        if not task_id:
            return
            
        if "tasks" not in self.state:
            self.state["tasks"] = {}
            
        if task_id not in self.state["tasks"]:
            self.state["tasks"][task_id] = {"events": []}
            
        self.state["tasks"][task_id]["events"].append({
            "type": event.value,
            "timestamp": str(datetime.now()),
            "data": data
        })
        
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)
```

### 2.4 Critical Steps Tracking Implementation

We need explicit tracking of parallel execution time.

#### Kimi K2.5 Metric Definition

```
Critical Steps = Σ(max(execution_time_of_subagents_in_each_stage))

Example:
- Stage 1: [A(10s), B(10s)] → max = 10s
- Stage 2: [C(5s)]          → max = 5s
- Stage 3: [D(8s)]          → max = 8s
Critical Steps = 10 + 5 + 8 = 23s
```

#### Implementation

```python
# skills/skill-orchestrator/src/critical_steps.py

import time
from dataclasses import dataclass, field
from typing import List, Dict
from enum import Enum

class SubagentState(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class SubagentExecution:
    name: str
    start_time: float = 0.0
    end_time: float = 0.0
    state: SubagentState = SubagentState.PENDING
    duration: float = 0.0

class CriticalStepsTracker:
    """Tracks Critical Steps metric for swarm execution."""

    def __init__(self):
        self.stages: List[Dict] = []
        self.current_stage = None
        self.execution_start = 0.0

    def start_execution(self):
        """Mark the start of swarm execution."""
        self.execution_start = time.perf_counter()
        self._start_stage(0)

    def _start_stage(self, stage_num: int):
        """Start a new execution stage."""
        self.current_stage = {
            "stage": stage_num,
            "start_time": time.perf_counter(),
            "subagents": []
        }
        self.stages.append(self.current_stage)

    def start_subagent(self, name: str):
        """Mark a subagent as starting."""
        execution = SubagentExecution(name=name, state=SubagentState.RUNNING)
        execution.start_time = time.perf_counter()
        
        if self.current_stage:
            self.current_stage["subagents"].append(execution)
        
        return execution

    def complete_subagent(self, execution: SubagentExecution):
        """Mark a subagent as completed."""
        execution.end_time = time.perf_counter()
        execution.duration = execution.end_time - execution.start_time
        execution.state = SubagentState.COMPLETED
        
        # Check if all subagents in stage are done
        if self.current_stage:
            all_done = all(
                s.state == SubagentState.COMPLETED or s.state == SubagentState.FAILED
                for s in self.current_stage["subagents"]
            )
            
            if all_done:
                self._end_stage()

    def _end_stage(self):
        """End current stage and prepare for next."""
        if self.current_stage:
            self.current_stage["end_time"] = time.perf_counter()
            stage_duration = self.current_stage["end_time"] - self.current_stage["start_time"]
            self.current_stage["duration"] = stage_duration
            self.current_stage["max_subagent_time"] = max(
                s.duration for s in self.current_stage["subagents"]
            )
            
            # Start next stage if there are pending subagents
            # In real implementation, this would be triggered by task queue

    def get_metrics(self) -> Dict:
        """Get final metrics."""
        total_duration = time.perf_counter() - self.execution_start
        
        critical_steps = sum(
            stage.get("max_subagent_time", 0) 
            for stage in self.stages
        )
        
        total_subagent_time = sum(
            s.duration 
            for stage in self.stages 
            for s in stage.get("subagents", [])
        )
        
        return {
            "total_duration": total_duration,
            "critical_steps": critical_steps,
            "total_subagent_time": total_subagent_time,
            "speedup": total_subagent_time / critical_steps if critical_steps > 0 else 1.0,
            "stages": len(self.stages),
            "subagent_count": sum(
                len(s.get("subagents", [])) 
                for s in self.stages
            )
        }
```

### 2.5 Communication Patterns

We recommend a hybrid approach:

1. **Orchestrator ↔ Subagent**: Direct subprocess call (current pattern)
2. **Skill ↔ Swarm**: Event Bus (proposed)
3. **Subagent ↔ Subagent**: Shared Context File (proposed)

#### Shared Context Pattern

```python
# Subagents write to a shared context file
CONTEXT_FILE = "/tmp/swarm-context-{task_id}.json"

def update_context(task_id: str, data: dict):
    """Update shared context for a task."""
    path = CONTEXT_FILE.format(task_id=task_id)
    current = {}
    
    if os.path.exists(path):
        with open(path) as f:
            current = json.load(f)
    
    current.update(data)
    
    with open(path, 'w') as f:
        json.dump(current, f)

def read_context(task_id: str) -> dict:
    """Read shared context for a task."""
    path = CONTEXT_FILE.format(task_id=task_id)
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return {}
```

---

## 3. Integration Plan

### Phase 1: Template Enhancement
1. Add `io_schema` and `timeout_ms` to all templates
2. Create `template-validator.js` script
3. Update `swarm-orchestrator.js` to use new schema

### Phase 2: Event Bus Implementation
1. Create `event_bus.py` in `skill-orchestrator/src`
2. Integrate with `MasterSkillOrchestrator`
3. Add subscription hooks in `ouroboros`, `ralph-tui`, `get-shit-done`

### Phase 3: Critical Steps Tracking
1. Create `critical_steps.py` in `skill-orchestrator/src`
2. Integrate with `AgentSwarmExecutor`
3. Add metrics visualization to `swarm-metrics.jsonl`

### Phase 4: Communication Patterns
1. Implement shared context files for subagents
2. Add context propagation to `swarm-orchestrator.js`
3. Create `context-merger.js` for result aggregation

---

## 4. Code Snippets

### 4.1 Enhanced Swarm Orchestrator (Python)

```python
#!/usr/bin/env python3
"""
Enhanced Agent Swarm Orchestrator
Integrates Event Bus and Critical Steps tracking.
"""

import json
import time
import asyncio
import subprocess
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum

from .event_bus import EventBus, EventType
from .critical_steps import CriticalStepsTracker

class SwarmOrchestrator:
    """Enhanced orchestrator with Event Bus and Critical Steps."""

    def __init__(
        self,
        templates_dir: str = "/Users/jasontang/clawd/skills/agent-swarm/templates",
        state_file: str = "/Users/jasontang/clawd/skills/agent-swarm/memory/swarm-state.json"
    ):
        self.templates_dir = Path(templates_dir)
        self.state_file = state_file
        self.templates = self._load_templates()
        self.event_bus = EventBus(state_file)
        self.tracker = CriticalStepsTracker()

    def _load_templates(self) -> Dict:
        """Load subagent templates."""
        templates = {}
        for template_file in self.templates_dir.glob("*.json"):
            if template_file.name.endswith(".json") and not template_file.name.startswith("night"):
                try:
                    template = json.load(open(template_file))
                    templates[template["name"]] = template
                except json.JSONDecodeError:
                    pass
        return templates

    async def execute_swarm(
        self,
        task_id: str,
        task_description: str,
        subtasks: List[Dict]
    ) -> Dict:
        """Execute a swarm of subagents."""
        
        # Publish task start event
        await self.event_bus.publish(EventType.TASK_CREATED, {
            "task_id": task_id,
            "description": task_description,
            "subtask_count": len(subtasks)
        })
        
        # Start tracking
        self.tracker.start_execution()
        
        # Execute subtasks in parallel
        results = await self._execute_parallel(subtasks)
        
        # Get metrics
        metrics = self.tracker.get_metrics()
        
        # Publish completion event
        await self.event_bus.publish(EventType.SWARM_COMPLETE, {
            "task_id": task_id,
            "results": results,
            "metrics": metrics
        })
        
        return {
            "task_id": task_id,
            "results": results,
            "metrics": metrics
        }

    async def _execute_parallel(self, subtasks: List[Dict]) -> List[Dict]:
        """Execute subtasks in parallel."""
        import concurrent.futures
        
        async def run_subtask(subtask: Dict) -> Dict:
            name = subtask.get("name", "unknown")
            template_name = subtask.get("template", "ai-researcher")
            prompt = subtask.get("prompt", "")
            
            # Start tracking
            execution = self.tracker.start_subagent(name)
            
            # Execute
            result = await self._run_subagent(template_name, prompt)
            
            # Complete tracking
            self.tracker.complete_subagent(execution)
            
            return {
                "name": name,
                "success": result.returncode == 0,
                "output": result.stdout + result.stderr,
                "duration": execution.duration
            }
        
        # Run all in parallel
        tasks = [run_subtask(st) for st in subtasks]
        results = await asyncio.gather(*tasks)
        
        # End current stage
        self.tracker._end_stage()
        
        return results

    async def _run_subagent(self, template_name: str, prompt: str) -> subprocess.CompletedProcess:
        """Run a single subagent via CLI."""
        template = self.templates.get(template_name)
        if not template:
            raise ValueError(f"Template {template_name} not found")
        
        system_prompt = template.get("system_prompt", "")
        full_prompt = f"{system_prompt}\n\n{prompt}"
        
        # Use Claude CLI as default
        proc = await asyncio.create_subprocess_exec(
            "claude", "-p", full_prompt,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await proc.communicate()
        return subprocess.CompletedProcess(
            args=("claude", "-p"),
proc.returncode,
            stdout=stdout            returncode=.decode(),
            stderr=stderr.decode()
        )
```

### 4.2 Integration with Existing Skills

```python
# Integration example: ouroboros -> agent-swarm

from skill_orchestrator.src.event_bus import EventBus, EventType

class OuroborosIntegration:
    """Integrates Ouroboros intent detection with Agent Swarm."""

    def __init__(self):
        self.event_bus = EventBus()
        
        # Subscribe to intent detection events
        self.event_bus.subscribe(
            EventType.TASK_DETECTED, 
            self.on_task_detected
        )

    async def on_task_detected(self, data: dict):
        """Handle detected intent from Ouroboros."""
        intent = data.get("intent", {})
        complexity = intent.get("complexity", "low")
        
        # Auto-trigger swarm for complex tasks
        if complexity == "high":
            from skill_orchestrator.src.swarm_manager import SwarmManager
            
            manager = SwarmManager()
            
            await manager.execute_swarm(
                task_id=data["task_id"],
                task_description=intent.get("description", ""),
                subtasks=intent.get("subtasks", [])
            )
```

---

## 5. References

1. **CrewAI Framework**: https://github.com/crewAIInc/crewAI
2. **AutoGen Framework**: https://github.com/microsoft/autogen
3. **Kimi K2.5 PARL**: Kimi Code CLI documentation (internal reference)
4. **LangGraph Workflows**: https://docs.langchain.com/oss/python/langgraph/workflows-agents
5. **ControlFlow (Prefect)**: https://github.com/PrefectHQ/ControlFlow

---

## 6. Next Steps

1. **Review** this document with the team
2. **Prototype** the Event Bus implementation
3. **Update** templates with `io_schema`
4. **Test** Critical Steps tracking on a sample swarm
5. **Iterate** based on metrics data

---

*Generated by Agent Swarm Research*
