# RLM Strategic Pattern Extraction for Clawd

**Analysis Date:** 2026-01-29  
**Purpose:** Extract and adapt RLM patterns for recursive self-improvement in Clawd

---

## Core Insight

**RLM's Breakthrough:** Treat prompt as external REPL variable, not as tokens. This enables symbolic recursion beyond context limits.

**Our Application:** Treat patterns as external library, not as working memory. This enables recursive skill activation beyond session limits.

---

## Pattern 1: Externalized Context Storage

### RLM Implementation
```python
# Instead of passing full context in prompt
context = load_large_document()  # 100K+ chars
prompt = f"Analyze this: {context}"  # ❌ Limited by context window

# RLM stores as REPL variable
def add_context(context_payload, context_index=None):
    var_name = f"context_{context_index}"
    # Store as file for large payloads
    context_path = os.path.join(temp_dir, f"context_{context_index}.json")
    json.dump(context_payload, open(context_path, "w"))
    # Load via code execution
    execute_code(f"import json\n{var_name} = json.load(open('{context_path}'))")
    # Alias for convenience
    execute_code(f"context = {var_name}")
```

### Our System: Pattern Library Externalization

**Current State:**
- Patterns loaded into working memory at session start
- Limited by session memory (context window equivalent)
- Patterns lost between sessions

**RLM-Inspired Solution:**
```
patterns/
├── research/
│   ├── meta-patterns.json    # Externalized pattern library
│   ├── skill-activations.json
│   └── pattern-confidence.json
├── coding/
│   ├── implementation-patterns.json
│   └── refactoring-patterns.json
└── ...

# Pattern activation becomes symbolic
pattern_library["research"] = load_patterns("research")
patterns_available = list(pattern_library.keys())
```

**Implementation:**
```python
class PatternLibrary:
    """External pattern storage like RLM's context_0 system."""
    
    def __init__(self, patterns_dir="patterns/"):
        self.patterns_dir = Path(patterns_dir)
        self._loaded_patterns = {}
        self._pattern_metadata = {}  # Confidence, usage, last_updated
    
    def get_patterns(self, domain: str) -> dict:
        """Load pattern library for a domain (lazy load)."""
        if domain not in self._loaded_patterns:
            pattern_file = self.patterns_dir / f"{domain}.json"
            if pattern_file.exists():
                self._loaded_patterns[domain] = json.load(open(pattern_file))
            else:
                self._loaded_patterns[domain] = {}
        return self._loaded_patterns[domain]
    
    def activate_pattern(self, pattern_name: str, **kwargs) -> ActivationResult:
        """Symbolic pattern activation (like llm_query)."""
        pattern = self.find_pattern(pattern_name)
        if pattern:
            result = pattern.execute(**kwargs)
            self._update_confidence(pattern_name, result.success)
            return result
        return None
    
    def add_pattern(self, domain: str, pattern: dict) -> None:
        """Add new pattern to library (enables learning)."""
        patterns = self.get_patterns(domain)
        patterns[pattern["name"]] = pattern
        self._save_patterns(domain)
```

### Strategic Value
- **Scale:** Can store 1000+ patterns, only load relevant ones
- **Persistence:** Patterns survive session restarts
- **Learning:** Can update pattern confidence between sessions

---

## Pattern 2: Symbolic Recursion via Function Calls

### RLM Implementation
```python
# Code can programmatically invoke sub-LLM calls
def _llm_query(self, prompt: str, model: str | None = None) -> str:
    """Query LM via socket connection."""
    request = LMRequest(prompt=prompt, model=model, depth=self.depth)
    response = send_lm_request(self.lm_handler_address, request)
    return response.chat_completion.response

# Usage in REPL:
# ```repl
# for chunk in context.split('\n'):
#     result = llm_query(f"Analyze: {chunk}")
#     results.append(result)
# ```
```

### Our System: Programmatic Skill Activation

**Current State:**
- Verbalized delegation: "I need to use the X skill"
- Limited expressiveness in skill routing
- No programmatic composition of skills

**RLM-Inspired Solution:**
```python
def activate_skill(skill_name: str, **kwargs) -> ActivationResult:
    """
    Programmatic skill activation (like llm_query).
    
    Enables:
    - Conditional skill selection
    - Parallel skill activation
    - Skill composition pipelines
    """
    skill = skill_registry[skill_name]
    result = skill.execute(**kwargs)
    log_activation(skill_name, kwargs, result)
    return result

# Usage in skill code:
# ```skill
# for pattern in detected_patterns:
#     result = activate_skill(
#         pattern.name, 
#         context=pattern.context,
#         depth=pattern.complexity
#     )
#     intermediate_results.append(result)
# ```

# Parallel activation (like llm_query_batched)
def activate_skills_batched(
    tasks: list[dict]
) -> list[ActivationResult]:
    """Activate multiple skills concurrently."""
    return [activate_skill(**task) for task in tasks]
```

### Strategic Value
- **Composability:** Skills can call other skills programmatically
- **Conditional Routing:** IF pattern detection THEN skill activation
- **Parallelism:** Batch skill activations for independent tasks

---

## Pattern 3: Termination Detection

### RLM Implementation
```python
def _final_var(self, variable_name: str) -> str:
    """Return variable value as final answer."""
    if variable_name in self.locals:
        return str(self.locals[variable_name])
    return f"Error: Variable '{variable_name}' not found"

# Usage:
# ```repl
# final_answer = combine_results(buffers)
# FINAL_VAR("final_answer")
# ```

# Or inline:
# FINAL(answer_string)
```

### Our System: Completion Detection

**Current State:**
- Implicit completion when tool returns
- No explicit "done" signal from skills
- Hard to detect when task is truly complete

**RLM-Inspired Solution:**
```python
class TaskCompletion:
    """Explicit termination detection."""
    
    COMPLETION_SIGNALS = ["COMPLETE", "DONE", "FINAL"]
    
    @staticmethod
    def check(text: str) -> tuple[bool, str | None]:
        """Check if text contains completion signal."""
        for signal in TaskCompletion.COMPLETION_SIGNALS:
            if re.search(rf'^{signal}\((.*)\)', text, re.MULTILINE):
                match = re.search(rf'{signal}\((.*)\)', text, re.DOTALL)
                return True, match.group(1).strip() if match else None
        return False, None
    
    @staticmethod
    def from_variable(name: str, context: dict) -> str | None:
        """Retrieve value from context and return as completion."""
        if name in context:
            return str(context[name])
        return None

# Skill usage:
# Skill can return: COMPLETE(result) or COMPLETE_VAR("output_var")
```

### Strategic Value
- **Explicit Endpoints:** Clear completion signals
- **Variable Retrieval:** Can return computed values
- **Debugging:** Easy to see when tasks complete

---

## Pattern 4: Iteration Loop with State Persistence

### RLM Implementation
```python
for i in range(self.max_iterations):
    # 1. Build prompt with metadata only
    current_prompt = message_history + [build_user_prompt(...)]
    
    # 2. Get LLM response
    iteration = self._completion_turn(current_prompt, lm_handler, environment)
    
    # 3. Execute code and capture results
    for code_block in code_blocks:
        result = environment.execute_code(code_block)
    
    # 4. Check for final answer
    final_answer = find_final_answer(iteration.response, environment)
    if final_answer is not None:
        return final_answer
    
    # 5. Update history with execution results
    message_history.extend(format_iteration(iteration))
```

### Our System: Recursive Skill Orchestration

**Current State:**
- Linear skill chains
- No iteration on skill results
- Limited state accumulation

**RLM-Inspired Solution:**
```python
class RecursiveSkillOrchestrator:
    """Iteration-based skill orchestration with state persistence."""
    
    def __init__(self, max_iterations=30):
        self.max_iterations = max_iterations
        self.state = {}
        self.pattern_library = PatternLibrary()
    
    def execute(self, task: dict) -> Any:
        """Execute task with iterative skill activation."""
        message_history = []
        pattern_history = []
        
        for i in range(self.max_iterations):
            # 1. Detect relevant patterns
            detected = self._detect_patterns(task, pattern_history)
            
            # 2. Activate skills based on patterns
            results = []
            for pattern in detected:
                result = self._activate_skill_with_feedback(
                    pattern, 
                    self.state
                )
                results.append(result)
                self.state[pattern.name] = result
            
            # 3. Check for completion
            completion = self._check_completion(results, task)
            if completion:
                return completion
            
            # 4. Update history
            message_history.extend(self._format_results(results))
            pattern_history.extend(detected)
        
        # Fallback: return accumulated state
        return self._finalize_results(self.state)
```

### Strategic Value
- **Iterative Refinement:** Can retry with different patterns
- **State Accumulation:** Results compound across iterations
- **Termination Safety:** max_iterations prevents infinite loops

---

## Pattern 5: Depth-Based Routing

### RLM Implementation
```python
def get_client(self, model: str | None = None, depth: int = 0) -> BaseLM:
    """Route request based on depth."""
    if model and model in self.clients:
        return self.clients[model]
    
    # Depth-based routing
    if depth == 1 and self.other_backend_client is not None:
        return self.other_backend_client  # Smaller/faster model
    
    return self.default_client  # Full model

# Usage: depth=0 for main call, depth=1 for sub-calls
```

### Our System: Complexity-Based Routing

**Current State:**
- All tasks use same skill depth
- No routing based on complexity
- Inefficient for simple tasks

**RLM-Inspired Solution:**
```python
class SkillRouter:
    """Route skills based on complexity depth."""
    
    def __init__(self):
        self.simple_skills = set(["grep", "read", "write"])
        self.medium_skills = set(["analyze", "compare", "summarize"])
        self.complex_skills = set(["design", "architect", "create"])
    
    def get_handler(self, depth: int = 0) -> SkillHandler:
        """Get handler based on complexity depth."""
        if depth == 0:
            return FullSkillHandler()  # All skills
        elif depth == 1:
            return CoreSkillHandler()  # Frequently used only
        return MinimalSkillHandler()  # Basic operations
    
    def estimate_complexity(self, task: dict) -> int:
        """Estimate task complexity (0-2)."""
        # Simple: file operations, searches
        # Medium: analysis, comparison
        # Complex: design, creation, multi-step
        ...

# Usage in orchestrator:
# handler = SkillRouter().get_handler(depth=task.complexity)
# result = handler.execute(task)
```

### Strategic Value
- **Cost Optimization:** Simple tasks use simpler skills
- **Latency Reduction:** Faster response for simple tasks
- **Resource Efficiency:** Reserve complex skills for complex tasks

---

## Pattern 6: Safe Sandbox Execution

### RLM Implementation
```python
_SAFE_BUILTINS = {
    # Allowed
    "print": print,
    "len": len,
    "str": str,
    "list": list,
    "dict": dict,
    # ...
    # Blocked
    "eval": None,
    "exec": None,
    "input": None,
    "globals": None,
    "locals": None,
}

def execute_code(self, code: str) -> REPLResult:
    """Execute in sandboxed namespace."""
    combined = {**self.globals, **self.locals}
    exec(code, combined, combined)  # Safe: limited builtins
    ...
```

### Our System: Safe Skill Execution

**Current State:**
- Skills run with full system access
- No sandboxing between skill executions
- Risk of unintended side effects

**RLM-Inspired Solution:**
```python
_SAFE_SKILL_OPERATIONS = {
    # Safe skill operations
    "activate": activate_skill,
    "get_pattern": get_pattern,
    "log": log_execution,
    "read_file": safe_read,
    "write_file": safe_write,
    # ...
    # Blocked
    "exec_command": None,
    "import_module": None,
    "eval": None,
}

class SandboxedSkillExecutor:
    """Execute skills in sandboxed environment."""
    
    def execute(self, skill_code: str, context: dict) -> ExecutionResult:
        """Execute with whitelisted operations only."""
        safe_globals = {
            "__builtins__": _SAFE_SKILL_OPERATIONS,
            **context,
        }
        try:
            exec(skill_code, safe_globals, safe_globals)
            return ExecutionResult(success=True, output=safe_globals.get("result"))
        except Exception as e:
            return ExecutionResult(success=False, error=str(e))
```

### Strategic Value
- **Security:** Prevent dangerous skill operations
- **Isolation:** Skills can't interfere with each other
- **Reliability:** Predictable execution environment

---

## Pattern 7: Feedback Loop with Execution Results

### RLM Implementation
```python
def execute_code(self, code: str) -> REPLResult:
    """Execute code and capture full feedback."""
    with self._capture_output() as (stdout_buf, stderr_buf):
        exec(code, combined, combined)
    
    return REPLResult(
        stdout=stdout_buf.getvalue(),
        stderr=stderr_buf.getvalue(),
        locals=self.locals.copy(),
        execution_time=time.perf_counter() - start_time,
        rlm_calls=self._pending_llm_calls.copy(),
    )

# Feedback returned to LLM for next iteration
```

### Our System: Pattern Learning Feedback

**Current State:**
- Limited feedback on skill effectiveness
- No systematic learning from skill outcomes
- Patterns don't improve over time

**RLM-Inspired Solution:**
```python
class PatternFeedback:
    """Capture and use execution feedback for learning."""
    
    def __init__(self):
        self.execution_log = []
    
    def execute_pattern(
        self, 
        pattern: Pattern, 
        context: Context
    ) -> PatternResult:
        """Execute pattern with full feedback capture."""
        start_time = time.perf_counter()
        
        try:
            result = pattern.execute(context)
            
            return PatternResult(
                success=True,
                output=result.output,
                execution_time=time.perf_counter() - start_time,
                state_changes=self._capture_state_changes(pattern),
                skill_calls=result.activations,
                confidence_delta=self(pattern, result),
            )
        except Exception as e:
._compute_confidence            return PatternResult(
                success=False,
                error=str(e),
                execution_time=time.perf_counter() - start_time,
                confidence_delta=-0.1,  # Decrease confidence on failure
            )
    
    def update_patterns(self, results: list[PatternResult]) -> None:
        """Update pattern library based on feedback."""
        for result in results:
            if result.success:
                pattern = result.pattern
                pattern.confidence = min(1.0, pattern.confidence + result.confidence_delta)
                pattern.usage_count += 1
            else:
                pattern.confidence = max(0.0, pattern.confidence + result.confidence_delta)
        
        self._save_pattern_updates()
```

### Strategic Value
- **Continuous Learning:** Patterns improve with use
- **Adaptive Routing:** More confident patterns get优先
- **Failure Recovery:** Decrease confidence on failures

---

## Pattern 8: Metadata-Only Context Passing

### RLM Implementation
```python
def _setup_prompt(self, prompt: str | dict[str, Any]) -> list[dict[str, Any]]:
    """Build prompt with metadata, not full context."""
    metadata = QueryMetadata(prompt)
    # Only pass: context_type, context_lengths, context_total_length
    # NOT: actual context content
    message_history = build_rlm_system_prompt(
        system_prompt=self.system_prompt, 
        query_metadata=metadata
    )
    return message_history
```

### Our System: Pattern Metadata Query

**Current State:**
- Full pattern library passed to each skill decision
- Wastes context on pattern descriptions
- Limits number of patterns we can consider

**RLM-Inspired Solution:**
```python
class PatternMetadataStore:
    """Store pattern metadata for efficient querying."""
    
    def __init__(self, pattern_library: PatternLibrary):
        self.metadata = {}
        for name, pattern in pattern_library.patterns.items():
            self.metadata[name] = {
                "domain": pattern.get("domain"),
                "trigger_keywords": pattern.get("triggers", []),
                "confidence": pattern.get("confidence", 0.5),
                "usage_count": pattern.get("usage_count", 0),
                "last_used": pattern.get("last_used"),
                "complexity": pattern.get("complexity", "medium"),
                "input_types": pattern.get("input_types", []),
                "output_type": pattern.get("output_type"),
            }
    
    def query_patterns(
        self, 
        task: dict, 
        max_results: int = 10
    ) -> list[str]:
        """
        Query patterns by metadata only (no full content).
        Returns pattern names, not full patterns.
        """
        # Score patterns based on metadata match
        candidates = []
        for name, meta in self.metadata.items():
            score = self._compute_match_score(task, meta)
            candidates.append((name, score))
        
        # Return top k pattern names
        candidates.sort(key=lambda x: x[1], reverse=True)
        return [name for name, _ in candidates[:max_results]]
    
    def load_patterns(self, names: list[str]) -> list[Pattern]:
        """Load full patterns on demand (lazy load)."""
        return [self.pattern_library.get(name) for name in names]
```

### Strategic Value
- **Efficient Routing:** Can consider 1000+ patterns by metadata
- **Lazy Loading:** Only load patterns when needed
- **Scalability:** Pattern library can grow without context limits

---

## Implementation Priority Matrix

| Pattern | Difficulty | Impact | Priority | Dependencies |
|---------|------------|--------|----------|--------------|
| Externalized Pattern Storage | Medium | High | P1 | PatternLibrary class |
| Symbolic Skill Activation | High | Critical | P1 | PatternLibrary |
| Termination Detection | Low | Medium | P2 | None |
| Recursive Orchestration | High | Critical | P2 | Pattern 1-2 |
| Depth-Based Routing | Medium | Medium | P2 | None |
| Safe Sandbox | Low | High | P2 | None |
| Feedback Loop | Medium | High | P3 | Pattern 1 |
| Metadata Query | Low | Medium | P3 | PatternLibrary |

---

## Recommended Implementation Order

### Phase 1: Foundation (This Week)
1. **PatternLibrary** - Externalized pattern storage
2. **Symbolic Activation** - Programmatic skill invocation
3. **Termination Signals** - Explicit completion detection

### Phase 2: Orchestration (This Month)
4. **Recursive Orchestrator** - Iteration-based skill execution
5. **Depth Routing** - Complexity-based skill selection
6. **Sandbox Isolation** - Safe skill execution

### Phase 3: Learning (This Quarter)
7. **Feedback System** - Pattern confidence tracking
8. **Metadata Query** - Efficient pattern selection

---

## Code Structure

```
clawd/
├── skills/
│   └── (existing 44 skills)
├── patterns/
│   ├── __init__.py
│   ├── library.py           # PatternLibrary class
│   ├── activation.py        # Symbolic activation
│   ├── orchestrator.py      # Recursive orchestrator
│   ├── router.py            # Depth-based routing
│   ├── sandbox.py           # Safe execution
│   ├── feedback.py          # Pattern learning
│   └── metadata.py          # Metadata query
├── rlm-research/
│   └── PATTERN-IMPLEMENTATION.md  # This file
└── workflows/
    └── recursive-skills.md  # Usage patterns
```

---

## Key Files to Study in RLM

| File | Pattern |
|------|---------|
| `rlm/core/rlm.py` | Iteration loop, termination detection |
| `rlm/environments/local_repl.py` | Symbolic recursion, safe execution |
| `rlm/core/lm_handler.py` | Depth-based routing |
| `rlm/utils/parsing.py` | Code block extraction |
| `rlm/utils/prompts.py` | Metadata-only context |

---

## Success Metrics

- **Pattern Scale:** Can we handle 1000+ patterns?
- **Recursion Depth:** Can we chain 5+ skill activations?
- **Learning Rate:** Does pattern confidence correlate with success?
- **Latency:** Is routing faster than execution?

---

## Conclusion

RLM demonstrates that symbolic recursion is achievable through:
1. External context storage (beyond working memory)
2. Programmatic sub-calls (not verbalized delegation)
3. Feedback loops (execution informs next steps)
4. Explicit termination (clear completion signals)
5. Depth-based routing (optimize for cost/latency)

Our meta-skill system should adopt these patterns to achieve recursive self-improvement.

**The key insight:** Externalize state to enable recursion that would otherwise be bounded by working memory limits.
