# Safe Self-Modification Design for Claude Hours

**Document Version:** 1.0  
**Date:** 2026-01-31  
**Status:** Design Proposal  
**Author:** Subagent: Self-Modification Design

---

## Executive Summary

Claude Hours currently具备 nightly builds, quality enforcement, and a recursive self-improvement system. However, **true self-modification**—where the system can safely modify its own code, learn from those modifications, and recover from failures—is not yet implemented.

This document designs a safe self-modification system that addresses three core requirements:

1. **Safe Modification Patterns** — Sandboxed, validated, staged code changes
2. **Version Control** — Full history, diff tracking, and state comparison
3. **Rollback Capabilities** — Checkpoints, emergency stops, and recovery

The design builds on existing systems (nightly builds, quality enforcement, meta-skill layer) while adding the missing safety mechanisms that make autonomous self-modification viable.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Gap Analysis: What's Missing](#gap-analysis-whats-missing)
3. [Design: Safe Modification Patterns](#design-safe-modification-patterns)
4. [Design: Version Control System](#design-version-control-system)
5. [Design: Rollback Capabilities](#design-rollback-capabilities)
6. [Architecture Overview](#architecture-overview)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Risk Assessment](#risk-assessment)

---

## Current State Analysis

### What Claude Hours Already Has

| System | Capability | Self-Modification Readiness |
|--------|------------|----------------------------|
| **Nightly Builds** | Automated overnight development | ✅ Enables modification execution |
| **Quality Enforcement** | Validates output quality | ✅ Provides modification gate |
| **Meta-Skill Layer** | Learns patterns from skill usage | ✅ Enables learning-based modification |
| **Pattern Library** | Externalized pattern storage | ✅ Foundation for modification storage |
| **Recursively Improves** | System gets smarter over time | ✅ Motivation for self-modification |

### Current Self-Modification Flow (Limited)

```
Today:
┌─────────────────────────────────────────────────────────────┐
│  1. Skill usage occurs                                      │
│  2. Meta-skill observes and learns pattern                  │
│  3. Pattern added to SKILL.md (file modification)           │
│  4. Next session uses updated pattern                       │
└─────────────────────────────────────────────────────────────┘
         │
         ▼ LIMITATIONS
         │
┌─────────────────────────────────────────────────────────────┐
│  ❌ No validation before modification applies               │
│  ❌ No rollback if pattern causes problems                  │
│  ❌ No sandboxing—modifications happen in production        │
│  ❌ No versioning—can't compare system state over time      │
│  ❌ No staged rollout—changes apply immediately             │
│  ❌ No emergency stop—runaway modification risk             │
└─────────────────────────────────────────────────────────────┘
```

### Existing Files to Leverage

```
clawd/
├── RECURSIVE-IMPROVEMENT.md      # Learning mechanism
├── STATUS-RECURSIVE-SYSTEM.md    # System state
├── AUTONOMY_VISION.md            # L5 autonomy goals
├── rlm-research/RLM-PATTERN-EXTRACTION.md  # RLM patterns to adapt
├── .claude/orchestra/            # Nightly build directory
├── memory/skill-usage.json       # Usage analytics
├── memory/active-triggers.md     # Trigger library
└── tasks/nightly-build.md        # Build template
```

---

## Gap Analysis: What's Missing

### The Three Pillars of Safe Self-Modification

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SAFE SELF-MODIFICATION                           │
├─────────────────────┬─────────────────────┬─────────────────────────┤
│  SAFE PATTERNS      │  VERSION CONTROL    │  ROLLBACK CAPABILITIES  │
│  (How to modify)    │  (Track changes)    │  (Recover from issues)  │
├─────────────────────┼─────────────────────┼─────────────────────────┤
│ • Sandboxed exec    │ • Modification log  │ • Checkpoints           │
│ • Validation gates  │ • Diff tracking     │ • Emergency stop        │
│ • Staged rollout    │ • State comparison  │ • Version revert        │
│ • Safety checks     │ • History timeline  │ • Recovery scripts      │
└─────────────────────┴─────────────────────┴─────────────────────────┘
```

### Specific Gaps Identified

| Gap | Severity | Impact | Existing Foundation |
|-----|----------|--------|---------------------|
| **No sandbox for self-mod** | Critical | System could corrupt itself | RLM sandbox patterns available |
| **No pre-apply validation** | High | Bad patterns pollute system | Quality enforcer exists |
| **No rollback mechanism** | High | Cannot recover from failures | Git available but unused for system state |
| **No version history** | Medium | Can't track improvement | Git history exists but not used |
| **No staged rollout** | Medium | All changes apply immediately | Nightly build could be repurposed |
| **No emergency stop** | Medium | Runaway modification risk | Process management exists |
| **No diff visualization** | Low | Hard to review changes | Morning report exists |

---

## Design: Safe Modification Patterns

### Core Principle: **Never Modify in Production**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MODIFICATION LIFECYCLE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  DETECT      │───►│  PROPOSE     │───►│  SANDBOX     │          │
│  │  Opportunity │    │  Change      │    │  Test        │          │
│  └──────────────┘    └──────────────┘    └──────┬───────┘          │
│                                                 │                   │
│                                                 ▼                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  PRODUCTION  │◄───│  VALIDATE    │◄───│  STAGED      │          │
│  │  Deploy      │    │  Quality     │    │  Rollout     │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Pattern 1: Sandboxed Modification Execution

**Inspired by:** RLM's safe execution environment

```python
# self-modification/sandbox.py

import os
import json
import tempfile
import hashlib
from pathlib import Path
from typing import Callable, Any, Optional
from dataclasses import dataclass

# Whitelist of safe operations for self-modification
_SAFE_MODIFICATION_BUILTINS = {
    # Safe file operations
    "read_file": lambda p: Path(p).read_text() if Path(p).exists() else None,
    "write_file": lambda p, c: Path(p).write_text(c),
    "append_file": lambda p, c: Path(p).append_text(c),
    "file_exists": lambda p: Path(p).exists(),
    "list_dir": lambda p: list(Path(p).iterdir()) if Path(p).exists() else [],
    
    # Safe string operations
    "find_pattern": lambda s, p: [m.start() for m in re.finditer(p, s)],
    "replace_text": lambda s, old, new: s.replace(old, new),
    "regex_replace": lambda s, pattern, repl: re.sub(pattern, repl, s),
    
    # Safe data operations
    "load_json": lambda p: json.loads(Path(p).read_text()) if Path(p).exists() else None,
    "save_json": lambda p, d: Path(p).write_text(json.dumps(d, indent=2)),
    "merge_dicts": lambda *d: {k: v for dct in d for k, v in dct.items()},
    
    # Safe metadata operations
    "get_file_hash": lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest(),
    "get_timestamp": lambda: datetime.now().isoformat(),
    "get_file_size": lambda p: Path(p).stat().st_size if Path(p).exists() else 0,
    
    # Blocked (not in whitelist):
    # - exec, eval, compile (code execution)
    # - subprocess, os.system (command execution)
    # - import, __import__ (module loading)
    # - globals, locals, vars (intrrospection)
}

@dataclass
class SandboxResult:
    success: bool
    output: Any
    error: Optional[str]
    modifications_made: list[dict]
    execution_time_ms: float

class SandboxedSelfModifier:
    """
    Executes self-modifications in a sandboxed environment.
    Only whitelisted operations are allowed.
    """
    
    def __init__(self, system_root: Path):
        self.system_root = system_root
        self.modification_log: list[dict] = []
        self.quarantine_dir = system_root / ".claude" / "modification-quarantine"
        self.quarantine_dir.mkdir(parents=True, exist_ok=True)
    
    def execute_modification(
        self, 
        modification_code: str, 
        context: dict
    ) -> SandboxResult:
        """
        Execute modification in sandbox.
        
        Args:
            modification_code: Python code to execute
            context: Pre-loaded context variables
            
        Returns:
            SandboxResult with success status and output
        """
        import time
        start_time = time.perf_counter()
        
        try:
            # Create sandbox namespace with whitelisted operations
            sandbox = {
                "__builtins__": _SAFE_MODIFICATION_BUILTINS,
                **context,
                "system_root": str(self.system_root),
            }
            
            # Execute in isolated namespace
            exec(modification_code, sandbox, sandbox)
            
            # Collect modifications from context
            modifications = context.get("_modifications", [])
            
            return SandboxResult(
                success=True,
                output=sandbox.get("result"),
                error=None,
                modifications_made=modifications,
                execution_time_ms=(time.perf_counter() - start_time) * 1000,
            )
            
        except Exception as e:
            return SandboxResult(
                success=False,
                output=None,
                error=str(e),
                modifications_made=[],
                execution_time_ms=(time.perf_counter() - start_time) * 1000,
            )
    
    def quarantine_bad_modification(self, modification: dict) -> None:
        """Move bad modification to quarantine for analysis."""
        import shutil
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        quarantine_path = self.quarantine_dir / f"bad_mod_{timestamp}.json"
        quarantine_path.write_text(json.dumps(modification, indent=2))
        print(f"[SANDBOX] Quarantined bad modification: {quarantine_path}")
```

### Pattern 2: Validation Gates

**Inspired by:** Quality enforcement in nightly builds

```python
# self-modification/validator.py

from dataclasses import dataclass
from typing import Optional
from enum import Enum

class ValidationStatus(Enum):
    PASSED = "passed"
    FAILED = "failed"
    WARNING = "warning"

@dataclass
class ValidationResult:
    status: ValidationStatus
    message: str
    details: dict

class ModificationValidator:
    """
    Validates modifications before they apply to production.
    """
    
    def __init__(self):
        self.validation_rules = [
            self._check_syntax,
            self._check_safety,
            self._check_dependencies,
            self._check_size,
            self._check_format,
        ]
    
    def validate(self, modification: dict) -> ValidationResult:
        """Run all validation rules on modification."""
        for rule in self.validation_rules:
            result = rule(modification)
            if result.status == ValidationStatus.FAILED:
                return result
            if result.status == ValidationStatus.WARNING:
                # Continue but warn
                pass
        return ValidationResult(
            status=ValidationStatus.PASSED,
            message="All validation rules passed",
            details={}
        )
    
    def _check_syntax(self, modification: dict) -> ValidationResult:
        """Verify modification has valid Python syntax."""
        code = modification.get("code", "")
        if not code:
            return ValidationResult(
                status=ValidationStatus.FAILED,
                message="Empty modification code",
                details={}
            )
        try:
            compile(code, "<modification>", "exec")
            return ValidationResult(
                status=ValidationStatus.PASSED,
                message="Syntax valid",
                details={}
            )
        except SyntaxError as e:
            return ValidationResult(
                status=ValidationStatus.FAILED,
                message=f"Syntax error: {e}",
                details={"line": e.lineno, "offset": e.offset}
            )
    
    def _check_safety(self, modification: dict) -> ValidationResult:
        """Check for dangerous operations."""
        code = modification.get("code", "")
        dangerous_patterns = [
            r"eval\s*\(",
            r"exec\s*\(",
            r"subprocess",
            r"os\.system",
            r"__import__",
            r"globals\(\)",
            r"locals\(\)",
            r"os\.chmod\s*\(",
            r"os\.remove\s*\(",
        ]
        
        import re
        for pattern in dangerous_patterns:
            if re.search(pattern, code):
                return ValidationResult(
                    status=ValidationStatus.FAILED,
                    message=f"Dangerous pattern detected: {pattern}",
                    details={}
                )
        
        return ValidationResult(
            status=ValidationStatus.PASSED,
            message="No dangerous patterns detected",
            details={}
        )
    
    def _check_dependencies(self, modification: dict) -> ValidationResult:
        """Verify required files/patterns exist."""
        target_file = modification.get("target_file")
        if target_file and not Path(target_file).exists():
            return ValidationResult(
                status=ValidationStatus.FAILED,
                message=f"Target file does not exist: {target_file}",
                details={}
            )
        return ValidationResult(
            status=ValidationStatus.PASSED,
            message="Dependencies satisfied",
            details={}
        )
    
    def _check_size(self, modification: dict) -> ValidationResult:
        """Limit modification size to prevent bloat."""
        code = modification.get("code", "")
        max_lines = 100
        max_chars = 5000
        
        lines = code.count('\n')
        if lines > max_lines:
            return ValidationResult(
                status=ValidationStatus.WARNING,
                message=f"Large modification ({lines} lines, max {max_lines})",
                details={"lines": lines}
            )
        
        if len(code) > max_chars:
            return ValidationResult(
                status=ValidationStatus.WARNING,
                message=f"Large modification ({len(code)} chars, max {max_chars})",
                details={"chars": len(code)}
            )
        
        return ValidationResult(
            status=ValidationStatus.PASSED,
            message="Size acceptable",
            details={"lines": lines, "chars": len(code)}
        )
    
    def _check_format(self, modification: dict) -> ValidationResult:
        """Verify modification has required metadata."""
        required_fields = ["type", "description", "confidence", "author"]
        for field in required_fields:
            if field not in modification:
                return ValidationResult(
                    status=ValidationStatus.FAILED,
                    message=f"Missing required field: {field}",
                    details={}
                )
        
        # Validate confidence is reasonable
        confidence = modification.get("confidence", 0)
        if not 0 <= confidence <= 1:
            return ValidationResult(
                status=ValidationStatus.FAILED,
                message=f"Invalid confidence: {confidence} (must be 0-1)",
                details={}
            )
        
        return ValidationResult(
            status=ValidationStatus.PASSED,
            message="Format valid",
            details={}
        )
```

### Pattern 3: Staged Rollout

**Inspired by:** Canary deployments in production systems

```python
# self-modification/staged_rollout.py

from dataclasses import dataclass
from enum import Enum
from typing import Callable
import time

class RolloutStage(Enum):
    SANDBOX = "sandbox"           # Test in isolated environment
    CANARY = "canary"             # Apply to 1 session
    GRADUAL = "gradual"           # Apply to 10% of sessions
    FULL = "full"                 # Apply to all sessions

@dataclass
class RolloutConfig:
    stage: RolloutStage
    min_success_rate: float = 0.9
    min_sessions: int = 5
    max_duration_hours: int = 24
    auto_promote: bool = True

class StagedRolloutManager:
    """
    Manages staged rollout of modifications.
    """
    
    def __init__(self, rollout_dir: Path):
        self.rollout_dir = rollout_dir
        self.rollout_dir.mkdir(parents=True, exist_ok=True)
        self.active_rollouts: dict[str, RolloutConfig] = {}
        self.rollout_history: list[dict] = []
    
    def start_rollout(self, modification_id: str, config: RolloutConfig) -> None:
        """Start staged rollout of a modification."""
        self.active_rollouts[modification_id] = config
        
        # Record rollout start
        rollout_record = {
            "modification_id": modification_id,
            "stage": config.stage.value,
            "start_time": time.time(),
            "status": "in_progress",
        }
        self.rollout_history.append(rollout_record)
        self._save_rollout_state()
        
        print(f"[ROLLOUT] Started rollout of {modification_id} at stage {config.stage.value}")
    
    def check_stage_completion(self, modification_id: str, metrics: dict) -> RolloutStage:
        """
        Check if modification can advance to next stage.
        
        Args:
            modification_id: ID of the modification
            metrics: Dict with success_rate, session_count, error_count
            
        Returns:
            Next stage, or current stage if criteria not met
        """
        config = self.active_rollouts.get(modification_id)
        if not config:
            return RolloutStage.FULL  # Already complete
        
        success_rate = metrics.get("success_rate", 0)
        session_count = metrics.get("session_count", 0)
        
        # Check if criteria met for promotion
        if (success_rate >= config.min_success_rate and 
            session_count >= config.min_sessions):
            
            # Promote to next stage
            next_stage = self._get_next_stage(config.stage)
            if next_stage:
                config.stage = next_stage
                print(f"[ROLLOUT] {modification_id} promoted to {next_stage.value}")
                return next_stage
            else:
                # Reached full rollout
                self.complete_rollout(modification_id)
                return RolloutStage.FULL
        
        return config.stage
    
    def _get_next_stage(self, current: RolloutStage) -> Optional[RolloutStage]:
        """Get next stage in rollout sequence."""
        stages = list(RolloutStage)
        try:
            idx = stages.index(current)
            if idx < len(stages) - 1:
                return stages[idx + 1]
        except ValueError:
            pass
        return None
    
    def complete_rollout(self, modification_id: str) -> None:
        """Mark rollout as complete."""
        if modification_id in self.active_rollouts:
            del self.active_rollouts[modification_id]
        
        # Update history
        for record in self.rollout_history:
            if record["modification_id"] == modification_id:
                record["status"] = "completed"
                record["end_time"] = time.time()
        
        self._save_rollout_state()
        print(f"[ROLLOUT] Completed rollout of {modification_id}")
    
    def rollback_active(self, modification_id: str, reason: str) -> None:
        """Rollback an active modification."""
        if modification_id in self.active_rollouts:
            del self.active_rollouts[modification_id]
        
        # Record rollback
        rollback_record = {
            "modification_id": modification_id,
            "reason": reason,
            "timestamp": time.time(),
            "type": "rollback",
        }
        self.rollout_history.append(rollback_record)
        
        print(f"[ROLLOUT] Rolled back {modification_id}: {reason}")
    
    def _save_rollout_state(self) -> None:
        """Persist rollout state to disk."""
        state = {
            "active_rollouts": {k: v.stage.value for k, v in self.active_rollouts.items()},
            "history": self.rollout_history,
        }
        (self.rollout_dir / "state.json").write_text(json.dumps(state, indent=2))
```

---

## Design: Version Control System

### Core Principle: **Every Modification is a Version**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VERSION CONTROL ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      Modification Store                        │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │  │
│  │  │ v1.0.0/     │ │ v1.1.0/     │ │ v1.2.0/     │             │  │
│  │  │ patterns.json│ │ patterns.json│ │ patterns.json│             │  │
│  │  │ diff.json   │ │ diff.json   │ │ diff.json   │             │  │
│  │  │ metadata.json│ │ metadata.json│ │ metadata.json│             │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      Diff Engine                               │  │
│  │  • Calculate differences between versions                      │  │
│  │  • Generate human-readable diff reports                        │  │
│  │  • Detect semantic changes (not just line diffs)               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      Timeline View                             │  │
│  │  • Chronological view of all modifications                     │  │
│  │  • Filter by type, author, confidence                          │  │
│  │  • Visualize improvement over time                             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Implementation

```python
# self-modification/version_control.py

from dataclasses import dataclass, field
from typing import Optional, list
from datetime import datetime
from enum import Enum
import json
import hashlib
from pathlib import Path

class VersionComponent(Enum):
    MAJOR = "major"  # Breaking changes
    MINOR = "minor"  # New features
    PATCH = "patch"  # Bug fixes, refinements

@dataclass
class Version:
    major: int
    minor: int
    patch: int
    
    def __str__(self) -> str:
        return f"{self.major}.{self.minor}.{self.patch}"
    
    def bump(self, component: VersionComponent) -> "Version":
        """Create new version by bumping component."""
        if component == VersionComponent.MAJOR:
            return Version(self.major + 1, 0, 0)
        elif component == VersionComponent.MINOR:
            return Version(self.major, self.minor + 1, 0)
        else:
            return Version(self.major, self.minor, self.patch + 1)

@dataclass
class ModificationDiff:
    """Represents the difference between two versions."""
    from_version: Version
    to_version: Version
    changes: list[dict] = field(default_factory=list)
    patterns_added: int = 0
    patterns_modified: int = 0
    patterns_removed: int = 0
    confidence_delta: float = 0.0
    semantic_summary: str = ""

@dataclass
class VersionMetadata:
    version: Version
    timestamp: str
    author: str  # "meta-skill", "human", "nightly-builder"
    modification_ids: list[str]
    total_patterns: int
    avg_confidence: float
    changelog: str
    breaking_changes: list[str] = field(default_factory=list)

class SystemVersionControl:
    """
    Version control for self-modifying system.
    Tracks every change, generates diffs, enables comparison.
    """
    
    def __init__(self, versions_dir: Path):
        self.versions_dir = versions_dir
        self.versions_dir.mkdir(parents=True, exist_ok=True)
        self.current_version = self._load_current_version()
        self.modification_store = versions_dir / "modifications"
        self.modification_store.mkdir(parents=True, exist_ok=True)
    
    def _load_current_version(self) -> Version:
        """Load current version from disk."""
        version_file = self.versions_dir / "current_version.json"
        if version_file.exists():
            data = json.loads(version_file.read_text())
            return Version(data["major"], data["minor"], data["patch"])
        return Version(0, 0, 0)  # Initial version
    
    def save_version(
        self,
        version: Version,
        patterns: dict,
        modifications: list[dict],
        author: str,
        changelog: str
    ) -> VersionMetadata:
        """Save a new version of the system."""
        version_dir = self.versions_dir / str(version)
        version_dir.mkdir(parents=True, exist_ok=True)
        
        # Save patterns
        (version_dir / "patterns.json").write_text(
            json.dumps(patterns, indent=2)
        )
        
        # Calculate and save diff from previous version
        if self.current_version:
            diff = self._calculate_diff(self.current_version, version, patterns)
            (version_dir / "diff.json").write_text(
                json.dumps({
                    "from": str(self.current_version),
                    "to": str(version),
                    "changes": diff.changes,
                    "summary": diff.semantic_summary,
                }, indent=2)
            )
        
        # Save metadata
        metadata = VersionMetadata(
            version=version,
            timestamp=datetime.now().isoformat(),
            author=author,
            modification_ids=[m.get("id", "unknown") for m in modifications],
            total_patterns=len(patterns),
            avg_confidence=self._calculate_avg_confidence(patterns),
            changelog=changelog,
        )
        (version_dir / "metadata.json").write_text(
            json.dumps({
                "version": str(version),
                "timestamp": metadata.timestamp,
                "author": metadata.author,
                "modification_ids": metadata.modification_ids,
                "total_patterns": metadata.total_patterns,
                "avg_confidence": metadata.avg_confidence,
                "changelog": metadata.changelog,
            }, indent=2)
        )
        
        # Update current version
        self.current_version = version
        (self.versions_dir / "current_version.json").write_text(
            json.dumps({"major": version.major, "minor": version.minor, "patch": version.patch})
        )
        
        return metadata
    
    def _calculate_diff(
        self, 
        from_ver: Version, 
        to_ver: Version, 
        current_patterns: dict
    ) -> ModificationDiff:
        """Calculate diff between two versions."""
        diff = ModificationDiff(
            from_version=from_ver,
            to_version=to_ver,
        )
        
        # Load previous patterns if available
        prev_patterns = {}
        prev_version_dir = self.versions_dir / str(from_ver)
        if prev_version_dir.exists():
            prev_file = prev_version_dir / "patterns.json"
            if prev_file.exists():
                prev_patterns = json.loads(prev_file.read_text())
        
        # Calculate changes
        current_ids = set(current_patterns.keys())
        prev_ids = set(prev_patterns.keys())
        
        diff.patterns_added = len(current_ids - prev_ids)
        diff.patterns_removed = len(prev_ids - current_ids)
        
        for pattern_id in current_ids & prev_ids:
            if current_patterns[pattern_id] != prev_patterns.get(pattern_id):
                diff.patterns_modified += 1
                diff.changes.append({
                    "pattern": pattern_id,
                    "type": "modified",
                    "from": prev_patterns.get(pattern_id),
                    "to": current_patterns[pattern_id],
                })
        
        for pattern_id in current_ids - prev_ids:
            diff.changes.append({
                "pattern": pattern_id,
                "type": "added",
                "to": current_patterns[pattern_id],
            })
        
        for pattern_id in prev_ids - current_ids:
            diff.changes.append({
                "pattern": pattern_id,
                "type": "removed",
                "from": prev_patterns[pattern_id],
            })
        
        # Generate semantic summary
        summary_parts = []
        if diff.patterns_added:
            summary_parts.append(f"+{diff.patterns_added} patterns")
        if diff.patterns_modified:
            summary_parts.append(f"~{diff.patterns_modified} patterns")
        if diff.patterns_removed:
            summary_parts.append(f"-{diff.patterns_removed} patterns")
        diff.semantic_summary = " | ".join(summary_parts) if summary_parts else "No changes"
        
        return diff
    
    def _calculate_avg_confidence(self, patterns: dict) -> float:
        """Calculate average confidence across all patterns."""
        if not patterns:
            return 0.0
        confidences = [
            p.get("confidence", 0.5) 
            for p in patterns.values()
        ]
        return sum(confidences) / len(confidences)
    
    def get_version_history(self) -> list[VersionMetadata]:
        """Get chronological history of all versions."""
        history = []
        for version_dir in sorted(self.versions_dir.iterdir()):
            if version_dir.is_dir() and version_dir.name[0].isdigit():
                metadata_file = version_dir / "metadata.json"
                if metadata_file.exists():
                    data = json.loads(metadata_file.read_text())
                    history.append(VersionMetadata(
                        version=Version(
                            int(data["version"].split(".")[0]),
                            int(data["version"].split(".")[1]),
                            int(data["version"].split(".")[2]),
                        ),
                        timestamp=data["timestamp"],
                        author=data["author"],
                        modification_ids=data["modification_ids"],
                        total_patterns=data["total_patterns"],
                        avg_confidence=data["avg_confidence"],
                        changelog=data["changelog"],
                    ))
        return sorted(history, key=lambda v: v.timestamp)
    
    def compare_versions(self, v1: Version, v2: Version) -> ModificationDiff:
        """Compare two specific versions."""
        patterns_v1 = {}
        patterns_v2 = {}
        
        dir1 = self.versions_dir / str(v1)
        dir2 = self.versions_dir / str(v2)
        
        if (dir1 / "patterns.json").exists():
            patterns_v1 = json.loads((dir1 / "patterns.json").read_text())
        if (dir2 / "patterns.json").exists():
            patterns_v2 = json.loads((dir2 / "patterns.json").read_text())
        
        diff = ModificationDiff(
            from_version=v1,
            to_version=v2,
        )
        
        # Calculate changes (same logic as _calculate_diff)
        current_ids = set(patterns_v2.keys())
        prev_ids = set(patterns_v1.keys())
        
        diff.patterns_added = len(current_ids - prev_ids)
        diff.patterns_removed = len(prev_ids - current_ids)
        
        for pattern_id in current_ids & prev_ids:
            if patterns_v2[pattern_id] != patterns_v1.get(pattern_id):
                diff.patterns_modified += 1
        
        return diff
```

---

## Design: Rollback Capabilities

### Core Principle: **Recovery is Always Possible**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ROLLBACK ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  CHECKPOINT  │───►│  DETECT      │───►│  EMERGENCY   │          │
│  │  Before      │    │  Failure     │    │  STOP        │          │
│  │  Modify      │    │  Pattern     │    │  Halt All    │          │
│  └──────────────┘    └──────────────┘    └──────┬───────┘          │
│                                                  │                   │
│                                                  ▼                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  RECOVER     │◄───│  REVERT      │◄───│  NOTIFY      │          │
│  │  Restore     │    │  Apply       │    │  Alert Human │          │
│  │  Good State  │    │  Previous    │    │  For Help    │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Implementation

```python
# self-modification/rollback.py

from dataclasses import dataclass
from typing import Optional, Callable
from datetime import datetime
from pathlib import Path
import json
import shutil
import time

@dataclass
class Checkpoint:
    id: str
    timestamp: str
    version: str
    state_snapshot: dict
    description: str

@dataclass
class RollbackResult:
    success: bool
    from_version: str
    to_version: str
    modifications_reverted: int
    error: Optional[str]

class CheckpointManager:
    """
    Creates checkpoints before modifications.
    Enables full state restoration.
    """
    
    def __init__(self, checkpoint_dir: Path):
        self.checkpoint_dir = checkpoint_dir
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        self.max_checkpoints = 10  # Keep last 10
    
    def create_checkpoint(
        self,
        description: str,
        state: dict,
        version: str
    ) -> Checkpoint:
        """Create a checkpoint before modifying state."""
        checkpoint_id = f"cp_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        checkpoint = Checkpoint(
            id=checkpoint_id,
            timestamp=datetime.now().isoformat(),
            version=version,
            state_snapshot=state,
            description=description,
        )
        
        # Save checkpoint
        (self.checkpoint_dir / f"{checkpoint_id}.json").write_text(
            json.dumps({
                "id": checkpoint.id,
                "timestamp": checkpoint.timestamp,
                "version": checkpoint.version,
                "state": checkpoint.state_snapshot,
                "description": checkpoint.description,
            }, indent=2)
        )
        
        # Cleanup old checkpoints
        self._cleanup_old_checkpoints()
        
        print(f"[CHECKPOINT] Created: {checkpoint_id}")
        return checkpoint
    
    def get_latest_checkpoint(self) -> Optional[Checkpoint]:
        """Get the most recent checkpoint."""
        checkpoints = sorted(self.checkpoint_dir.glob("cp_*.json"))
        if not checkpoints:
            return None
        
        latest = checkpoints[-1]
        data = json.loads(latest.read_text())
        return Checkpoint(
            id=data["id"],
            timestamp=data["timestamp"],
            version=data["version"],
            state_snapshot=data["state"],
            description=data["description"],
        )
    
    def _cleanup_old_checkpoints(self) -> None:
        """Remove old checkpoints beyond max."""
        checkpoints = sorted(self.checkpoint_dir.glob("cp_*.json"))
        while len(checkpoints) > self.max_checkpoints:
            old = checkpoints.pop(0)
            old.unlink()
            print(f"[CHECKPOINT] Cleaned up old checkpoint: {old.name}")


class EmergencyStop:
    """
    Emergency stop mechanism for runaway modifications.
    """
    
    def __init__(self, state_file: Path):
        self.state_file = state_file
        self.emergency_flag = state_file / "EMERGENCY_STOP"
        self.modification_limit = 100  # Max modifications per hour
        self.time_window_seconds = 3600
    
    def check_and_set(self) -> tuple[bool, Optional[str]]:
        """
        Check if modification should be allowed.
        Returns (allowed, reason_if_not).
        """
        # Check emergency flag
        if self.emergency_flag.exists():
            return False, "Emergency stop is active"
        
        # Check modification rate
        recent_count = self._count_recent_modifications()
        if recent_count >= self.modification_limit:
            self._trigger_emergency_stop("Modification rate exceeded")
            return False, "Too many modifications in time window"
        
        return True, None
    
    def _count_recent_modifications(self) -> int:
        """Count modifications in recent time window."""
        if not self.state_file.exists():
            return 0
        
        cutoff = time.time() - self.time_window_seconds
        modifications = json.loads(self.state_file.read_text())
        
        recent = [
            m for m in modifications 
            if m.get("timestamp", 0) > cutoff
        ]
        return len(recent)
    
    def _trigger_emergency_stop(self, reason: str) -> None:
        """Trigger emergency stop."""
        self.emergency_flag.write_text(
            json.dumps    
    def _trigger_emergency_stop(self, reason: str) -> None:
        """Trigger emergency stop."""
        self.emergency_flag.write_text(
            json.dumps({
                "triggered_at": datetime.now().isoformat(),
                "reason": reason,
                "action_required": "Remove .claude/orchestra/EMERGENCY_STOP to resume",
            }, indent=2)
        )
        print(f"[EMERGENCY] Stop triggered: {reason}")
    
    def reset(self) -> None:
        """Reset emergency stop (after fixing issue)."""
        if self.emergency_flag.exists():
            self.emergency_flag.unlink()
            print("[EMERGENCY] Stop reset - system can resume")


class RollbackManager:
    """
    Manages rollback to previous versions.
    """
    
    def __init__(self, version_control: SystemVersionControl):
        self.version_control = version_control
        self.rollback_log: list[dict] = []
    
    def rollback_to_version(
        self, 
        target_version: Version, 
        reason: str
    ) -> RollbackResult:
        """
        Rollback system to a specific version.
        
        Args:
            target_version: Version to rollback to
            reason: Why we're rolling back
            
        Returns:
            RollbackResult with success status
        """
        current_ver = self.version_control.current_version
        
        # Get target patterns
        target_dir = self.version_control.versions_dir / str(target_version)
        if not target_dir.exists():
            return RollbackResult(
                success=False,
                from_version=str(current_ver),
                to_version=str(target_version),
                modifications_reverted=0,
                error=f"Version {target_version} not found",
            )
        
        target_patterns = json.loads((target_dir / "patterns.json").read_text())
        
        # Revert to target version patterns
        # (In practice, would write back to the active patterns file)
        rollback_record = {
            "from_version": str(current_ver),
            "to_version": str(target_version),
            "reason": reason,
            "timestamp": datetime.now().isoformat(),
            "patterns_restored": len(target_patterns),
        }
        self.rollback_log.append(rollback_record)
        
        return RollbackResult(
            success=True,
            from_version=str(current_ver),
            to_version=str(target_version),
            modifications_reverted=len(target_patterns),
            error=None,
        )
    
    def get_rollback_history(self) -> list[dict]:
        """Get history of all rollbacks."""
        return self.rollback_log
```

---

## Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLAUDE HOURS SELF-MODIFICATION SYSTEM                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    MODIFICATION ORCHESTRATOR                         │    │
│  │                                                                      │    │
│  │  ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐     │    │
│  │  │ Pattern   │──►│ Sandbox   │──►│ Validate  │──►│ Rollout   │     │    │
│  │  │ Detector  │   │ Executor  │   │ Gate      │   │ Manager   │     │    │
│  │  └───────────┘   └───────────┘   └───────────┘   └─────┬─────┘     │    │
│  │                                                          │           │    │
│  │                                                          ▼           │    │
│  │  ┌───────────────────────────────────────────────────────────────┐   │    │
│  │  │                    VERSION CONTROL                             │   │    │
│  │  │  ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐ │   │    │
│  │  │  │ Snapshot  │──►│ Diff      │──►│ History   │──►│ Compare   │ │   │    │
│  │  │  │ Manager   │   │ Engine    │   │ Store     │   │ Tool      │ │   │    │
│  │  │  └───────────┘   └───────────┘   └───────────┘   └───────────┘ │   │    │
│  │  └───────────────────────────────────────────────────────────────┘   │    │
│  │                                                                      │    │
│  │  ┌───────────────────────────────────────────────────────────────┐   │    │
│  │  │                    ROLLBACK SYSTEM                             │   │    │
│  │  │  ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐ │   │    │
│  │  │  │ Checkpoint│──►│ Emergency │──►│ Rollback  │──►│ Recovery  │ │   │    │
│  │  │  │ Manager   │   │ Stop      │   │ Engine    │   │ Helper    │ │   │    │
│  │  │  └───────────┘   └───────────┘   └───────────┘   └───────────┘ │   │    │
│  │  └───────────────────────────────────────────────────────────────┘   │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    EXISTING INTEGRATION POINTS                       │    │
│  │                                                                      │    │
│  │  • Nightly Build System ─────► Self-Modification Trigger            │    │
│  │  • Quality Enforcer ─────────► Validation Gate                       │    │
│  │  • Meta-Skill Layer ─────────► Pattern Detection                     │    │
│  │  • Morning Report ───────────► Version Diff Display                  │    │
│  │  • Memory System ────────────► Pattern Persistence                   │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### File Structure

```
clawd/
├── docs/
│   └── SELF-MODIFICATION-DESIGN.md      ← This document
├── self-modification/
│   ├── __init__.py
│   ├── sandbox.py                        # SandboxedSelfModifier
│   ├── validator.py                      # ModificationValidator
│   ├── staged_rollout.py                 # StagedRolloutManager
│   ├── version_control.py                # SystemVersionControl
│   ├── rollback.py                       # CheckpointManager, RollbackManager
│   └── orchestrator.py                   # Main orchestration
├── .claude/
│   ├── self-modification/
│   │   ├── versions/                     # Version history
│   │   │   ├── current_version.json
│   │   │   ├── v0.0.1/
│   │   │   │   ├── patterns.json
│   │   │   │   ├── diff.json
│   │   │   │   └── metadata.json
│   │   │   └── v0.0.2/
│   │   ├── checkpoints/                  # Checkpoint storage
│   │   │   ├── cp_20260130_210000.json
│   │   │   └── cp_20260130_220000.json
│   │   ├── rollouts/
│   │   │   └── state.json
│   │   └── modification-quarantine/      # Bad modifications
│   │       └── bad_mod_20260130_210000.json
│   └── orchestra/
│       └── (existing nightly build files)
└── memory/
    └── (existing memory files)
```

### Integration with Existing Systems

#### Integration with Nightly Build

```bash
# In scripts/claude-hours-nightly.sh, add:
./self-modification/orchestrator.py prepare   # Create checkpoint before work
./scripts/claude-hours-nightly.sh setup       # Existing setup
./self-modification/orchestrator.py snapshot  # Snapshot after work
./self-modification/orchestrator.py report    # Generate modification report
```

#### Integration with Quality Enforcer

```python
# Before: Quality enforcer only checks output artifacts
# After: Quality enforcer also validates self-modifications

def quality_check_with_modifications():
    # Check existing artifacts (existing behavior)
    artifact_quality = check_artifacts()
    
    # Check proposed modifications (NEW)
    if has_pending_modifications():
        for mod in get_pending_modifications():
            validator = ModificationValidator()
            result = validator.validate(mod)
            if not result.success:
                return QualityResult(
                    passed=False,
                    reason=f"Modification {mod['id']} failed validation: {result.message}"
                )
    
    return artifact_quality
```

#### Integration with Meta-Skill Layer

```python
# Meta-skill currently learns patterns from skill usage
# After: Meta-skill also proposes modifications

class MetaSkillWithSelfMod:
    def learn_and_propose(self, skill_usage: dict) -> list[dict]:
        """Learn from usage and propose improvements."""
        # Existing: Learn pattern
        pattern = self._extract_pattern(skill_usage)
        
        # New: Propose modification if confident enough
        modifications = []
        if pattern.confidence >= 0.8:
            mod = self._create_modification(pattern)
            modifications.append(mod)
        
        return modifications
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Goal:** Core infrastructure for safe modifications

| Task | Duration | Owner | Dependencies |
|------|----------|-------|--------------|
| Create `self-modification/` directory structure | 1 day | CLI Agent | None |
| Implement `SandboxedSelfModifier` | 2 days | CLI Agent | RLM patterns |
| Implement `ModificationValidator` | 1 day | CLI Agent | Sandbox |
| Write unit tests for sandbox and validator | 1 day | CLI Agent | Implementation |
| Integration test with meta-skill layer | 1 day | CLI Agent | Tests pass |

**Deliverables:**
- `self-modification/sandbox.py` - Sandboxed execution
- `self-modification/validator.py` - Validation gates
- Test coverage > 80%

### Phase 2: Version Control (Week 2)

**Goal:** Track all modifications as versions

| Task | Duration | Owner | Dependencies |
|------|----------|-------|--------------|
| Implement `SystemVersionControl` | 2 days | CLI Agent | Phase 1 |
| Implement `ModificationDiff` engine | 1 day | CLI Agent | VersionControl |
| Create version history storage | 1 day | CLI Agent | None |
| Add diff visualization to morning report | 1 day | CLI Agent | VersionControl |
| Test version comparison and history | 1 day | CLI Agent | Implementation |

**Deliverables:**
- `self-modification/version_control.py` - Version tracking
- Version history directory with metadata
- Diff reports in morning report

### Phase 3: Rollback Capabilities (Week 3)

**Goal:** Recover from bad modifications

| Task | Duration | Owner | Dependencies |
|------|----------|-------|--------------|
| Implement `CheckpointManager` | 2 days | CLI Agent | Phase 1 |
| Implement `EmergencyStop` | 1 day | CLI Agent | CheckpointManager |
| Implement `RollbackManager` | 2 days | CLI Agent | VersionControl |
| Add emergency stop to nightly build | 1 day | CLI Agent | EmergencyStop |
| Test rollback scenarios | 1 day | CLI Agent | Implementation |

**Deliverables:**
- `self-modification/rollback.py` - Rollback system
- Checkpoint storage
- Emergency stop mechanism

### Phase 4: Staged Rollout (Week 4)

**Goal:** Safe deployment of modifications

| Task | Duration | Owner | Dependencies |
|------|----------|-------|--------------|
| Implement `StagedRolloutManager` | 2 days | CLI Agent | Phase 1-3 |
| Implement canary deployment logic | 1 day | CLI Agent | RolloutManager |
| Add metrics tracking for rollouts | 1 day | CLI Agent | RolloutManager |
| Integration with nightly build | 1 day | CLI Agent | All prior |
| Full system test | 1 day | CLI Agent | All prior |

**Deliverables:**
- `self-modification/staged_rollout.py` - Staged deployment
- Rollout metrics dashboard
- Integrated with nightly build

### Phase 5: Integration & Polish (Week 5)

**Goal:** Complete system integration

| Task | Duration | Owner | Dependencies |
|------|----------|-------|--------------|
| Full integration with meta-skill | 2 days | CLI Agent | All prior |
| Documentation and runbooks | 1 day | CLI Agent | None |
| Load testing and performance tuning | 1 day | CLI Agent | Integration |
| Security review | 1 day | Human | All prior |

**Deliverables:**
- Complete self-modification system
- Full documentation
- Production-ready

### Total Timeline

```
Week 1: ████████░░░░░░░░░░░░░░░░░░░░░░░  Phase 1 - Foundation
Week 2: ░░░░░░░░░████████░░░░░░░░░░░░░░░  Phase 2 - Version Control
Week 3: ░░░░░░░░░░░░░░░░░░████████░░░░░░  Phase 3 - Rollback
Week 4: ░░░░░░░░░░░░░░░░░░░░░░░░░░████████  Phase 4 - Staged Rollout
Week 5: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Phase 5 - Integration

Total: 5 weeks to production-ready self-modification
```

---

## Risk Assessment

### Risk Matrix

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **Runaway modification loop** | Critical | Low | Emergency stop, rate limiting |
| **Corruption of production state** | Critical | Low | Checkpoints before every change |
| **Security vulnerability in sandbox** | High | Medium | Whitelist-only operations, regular audits |
| **Validation bypass** | High | Low | Multiple validation gates, signatures |
| **Version data loss** | Medium | Low | Git backup, multiple checkpoints |
| **Performance degradation** | Low | Medium | Async operations, caching |
| **Integration breaks existing systems** | Low | Low | Gradual rollout, feature flags |

### Safety Mechanisms Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DEFENSE IN DEPTH                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Layer 1: Sandbox                                                   │
│  • Only whitelisted operations allowed                              │
│  • No file system access outside system root                         │
│  • No command execution                                              │
│                                                                      │
│  Layer 2: Validation                                                │
│  • Syntax validation                                                │
│  • Safety pattern detection                                         │
│  • Size limits                                                      │
│  • Required metadata                                                │
│                                                                      │
│  Layer 3: Checkpoints                                               │
│  • Snapshot before every modification                               │
│  • Automatic cleanup of old checkpoints                             │
│  • Instant rollback capability                                      │
│                                                                      │
│  Layer 4: Rate Limiting                                             │
│  • Max 100 modifications per hour                                   │
│  • Emergency stop on threshold breach                               │
│                                                                      │
│  Layer 5: Staged Rollout                                            │
│  • Sandbox → Canary → Gradual → Full                                │
│  • Metrics-driven promotion criteria                                │
│  • Automatic rollback on failure                                    │
│                                                                      │
│  Layer 6: Human Oversight                                           │
│  • Morning report shows all modifications                           │
│  • Human can trigger emergency stop                                 │
│  • Human review required for major versions                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Failure Scenarios

#### Scenario 1: Bad Pattern Introduced

```
What happens:
1. Meta-skill detects pattern with 85% confidence
2. Proposes modification
3. Sandbox validates → passes
4. Staged rollout: Sandbox → Canary
5. Canary metrics show 20% failure rate (below 90% threshold)
6. Automatic rollback triggered
7. System remains at previous version

Result: No impact to users, pattern quarantined for analysis
```

#### Scenario 2: Emergency Stop Triggered

```
What happens:
1. Modification rate exceeds 100/hour
2. Emergency stop flag created
3. All modifications blocked
4. Notification sent to human
5. Human investigates (checks logs, quarantined mods)
6. Human resolves issue, removes stop flag
7. System resumes

Result: Brief pause, no data loss, human in loop
```

#### Scenario 3: Version Corruption

```
What happens:
1. New version saved with corrupted patterns
2. Morning report shows anomaly (low confidence scores)
3. Human reviews diff
4. Human triggers rollback to previous version
5. System restored from checkpoint
6. Corrupted version archived for debugging

Result: Quick recovery, debugging data preserved
```

---

## Success Criteria

### Functional Requirements

- [ ] Sandboxed execution with whitelisted operations only
- [ ] Pre-apply validation of all modifications
- [ ] Checkpoint before every modification
- [ ] Emergency stop mechanism functional
- [ ] Version history for all changes
- [ ] Diff visualization in morning report
- [ ] Staged rollout with metrics tracking
- [ ] Rollback to any previous version

### Non-Functional Requirements

- [ ] Modification latency < 100ms
- [ ] Checkpoint creation < 10ms
- [ ] Version comparison < 50ms
- [ ] Emergency stop activates < 1s
- [ ] Rollback completes < 5s
- [ ] Test coverage > 80%
- [ ] Documentation complete

### Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Successful modifications | > 95% | Version history |
| Automatic rollbacks | 100% of failures | Rollback log |
| Time to detect issue | < 1 hour | Emergency stop logs |
| Time to recover | < 5 minutes | Checkpoint to restore |
| False positive rate | < 5% | Validation vs actual issues |

---

## Conclusion

This design document outlines a comprehensive system for safe self-modification in Claude Hours. By implementing:

1. **Sandboxed Execution** — Prevents dangerous operations
2. **Validation Gates** — Catches problems before they apply
3. **Version Control** — Tracks every change with full history
4. **Staged Rollout** — Reduces blast radius of issues
5. **Rollback Capabilities** — Enables quick recovery

Claude Hours can achieve **true self-modification** while maintaining safety, auditability, and recoverability.

The system builds on existing foundations (nightly builds, quality enforcement, meta-skill layer) while adding the critical safety mechanisms that make autonomous self-modification viable.

### Next Steps

1. **Review this design** with the team
2. **Prioritize Phase 1** tasks for immediate implementation
3. **Set up CI/CD** for the self-modification module
4. **Begin implementation** of sandbox and validator

---

**Document Status:** Ready for Review  
**Next Review:** After Phase 1 implementation  
**Owner:** Claude Hours Development Team
