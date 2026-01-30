# RLM Code Architecture Analysis

**Repository:** https://github.com/alexzhang13/rlm  
**Analysis Date:** 2026-01-29  
**Purpose:** Extract implementation patterns for recursive self-improvement system

---

## Executive Summary

The RLM codebase is a masterclass in implementing symbolic recursion for LLMs. The architecture separates concerns cleanly:

1. **RLM Core** - Main orchestration loop
2. **Environment** - REPL with persistent namespace
3. **LM Handler** - Routes sub-calls via socket server
4. **Clients** - Abstract interface for different LLMs

**Key Insight:** RLM achieves unbounded context by treating the prompt as a symbolic variable in an external REPL, not as tokens in a context window. This enables programmatic recursion that our meta-skill system should emulate.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         RLM (Main Class)                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ completion() - Main entry point                          │  │
│  │ - Spawns LM handler + environment                       │  │
│  │ - Runs iteration loop (max_iterations)                 │  │
│  │ - Checks for FINAL_VAR termination                     │  │
│  │ - Routes to _completion_turn() each iteration          │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│     LM Handler             │   │    Environment (REPL)       │
│  ┌─────────────────────┐   │   │  ┌─────────────────────┐   │
│  │ Socket Server      │   │   │  │ Persistent Namespace│   │
│  │ - Routes requests  │   │   │  │ - context_0, _1... │   │
│  │ - Multi-threaded  │   │   │  │ - llm_query() fn   │   │
│  └─────────────────────┘   │   │  │ - FINAL_VAR() fn   │   │
│         │                 │   │  └─────────────────────┘   │
│         ▼                 │   │          │                 │
│  ┌─────────────────────┐   │   │          ▼                 │
│  │ Client Routing     │   │   │  ┌─────────────────────┐   │
│  │ - depth=0: default │   │   │  │ execute_code()     │   │
│  │ - depth=1: other   │   │   │  │ - Runs code        │   │
│  │ - model override   │   │   │  │ - Captures stdout  │   │
│  └─────────────────────┘   │   │  │ - Returns result   │   │
└─────────────────────────────┘   │  └─────────────────────┘   │
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   BaseLM Interface     │
                    │   - openai, anthropic  │
                    │   - gemini, portkey    │
                    └─────────────────────────┘
```

---

## Core Components Deep Dive

### 1. RLM Class (`rlm.py`)

**Main Entry Point:**
```python
class RLM:
    def completion(
        self,
        prompt: str | dict[str, Any],
        root_prompt: str | None = None
    ) -> RLMChatCompletion:
        """Main entry point - replaces lm.completion()"""
```

**Key Parameters:**
- `backend`: LLM provider ("openai", "anthropic", etc.)
- `max_depth`: Max recursion depth (currently only 1 supported)
- `max_iterations`: Max iterations per completion
- `environment`: REPL type ("local", "docker", "modal", "prime")
- `persistent`: Reuse environment across calls

**Iteration Loop:**
```python
for i in range(self.max_iterations):
    # 1. Prompt the model with context metadata
    current_prompt = message_history + [build_user_prompt(...)]
    
    # 2. Get response and extract code
    iteration = self._completion_turn(current_prompt, lm_handler, environment)
    
    # 3. Check for final answer
    final_answer = find_final_answer(iteration.response, environment=environment)
    if final_answer is not None:
        return final_answer
    
    # 4. Update history with execution results
    new_messages = format_iteration(iteration)
    message_history.extend(new_messages)
```

**Key Pattern: Metadata-Only Context**
```python
# Only pass metadata, not actual prompt text!
metadata = QueryMetadata(prompt)  # Length, prefix, access info
message_history = build_rlm_system_prompt(system_prompt, query_metadata)
```

### 2. Environment (REPL) Implementation

**LocalREPL Class Structure:**
```python
class LocalREPL(NonIsolatedEnv):
    def __init__(self, lm_handler_address, context_payload, ...):
        # Setup persistent namespace
        self.globals = {...safe_builtins...}
        self.locals = {}
        
        # Add helper functions
        self.globals["FINAL_VAR"] = self._final_var
        self.globals["llm_query"] = self._llm_query
        self.globals["llm_query_batched"] = self._llm_query_batched
```

**Key Functions Added to Namespace:**

1. **llm_query() - Programmatic Sub-Calls**
```python
def _llm_query(self, prompt: str, model: str | None = None) -> str:
    """Query LM via socket connection to handler."""
    if not self.lm_handler_address:
        return "Error: No LM handler configured"
    
    request = LMRequest(prompt=prompt, model=model, depth=self.depth)
    response = send_lm_request(self.lm_handler_address, request)
    
    # Track for logging
    self._pending_llm_calls.append(response.chat_completion)
    
    return response.chat_completion.response
```

**This is the symbolic recursion mechanism!**

2. **FINAL_VAR() - Termination Detection**
```python
def _final_var(self, variable_name: str) -> str:
    """Return variable value as final answer."""
    variable_name = variable_name.strip().strip("\"'")
    if variable_name in self.locals:
        return str(self.locals[variable_name])
    return f"Error: Variable '{variable_name}' not found"
```

**Pattern:**
```python
# Code can call: FINAL_VAR("result")
# Which extracts: self.locals["result"]
# And returns it as the final answer
```

3. **Context Storage**
```python
def add_context(self, context_payload, context_index: int | None = None) -> int:
    """Add context as context_N variable."""
    if context_index is None:
        context_index = self._context_count
    
    var_name = f"context_{context_index}"
    
    # Store as file, load via code
    context_path = os.path.join(self.temp_dir, f"context_{context_index}.json")
    with open(context_path, "w") as f:
        json.dump(context_payload, f)
    
    # Execute code to load it
    self.execute_code(
        f"import json\nwith open(r'{context_path}', 'r') as f:\n"
        f"    {var_name} = json.load(f)"
    )
    
    # Alias context_0 as 'context'
    if context_index == 0:
        self.execute_code(f"context = {var_name}")
    
    self._context_count = max(self._context_count, context_index + 1)
    return context_index
```

**Execution Pattern:**
```python
def execute_code(self, code: str) -> REPLResult:
    """Execute code in persistent namespace."""
    with self._capture_output() as (stdout_buf, stderr_buf):
        combined = {**self.globals, **self.locals}
        exec(code, combined, combined)  # Shared namespace!
        
        # Update locals with new variables
        for key, value in combined.items():
            if key not in self.globals and not key.startswith("_"):
                self.locals[key] = value
    
    return REPLResult(
        stdout=stdout_buf.getvalue(),
        stderr=stderr_buf.getvalue(),
        locals=self.locals.copy(),  # Return state
        execution_time=...,
        rlm_calls=self._pending_llm_calls.copy(),
    )
```

### 3. LM Handler - Socket-Based Routing

**Architecture:**
```python
class LMHandler:
    def __init__(self, client: BaseLM, other_backend_client: BaseLM | None = None):
        self.default_client = client
        self.other_backend_client = other_backend_client
        self.clients = {}  # model_name -> client
    
    def get_client(self, model: str | None = None, depth: int = 0) -> BaseLM:
        """Route request to appropriate client."""
        if model and model in self.clients:
            return self.clients[model]
        
        # Depth-based routing
        if depth == 1 and self.other_backend_client is not None:
            return self.other_backend_client
        
        return self.default_client
```

**Socket Protocol:**
- 4-byte big-endian length prefix + JSON payload
- Multi-threaded server for concurrent requests
- Handles both single and batched requests

**Client Registration:**
```python
# Register main client
self.register_client(client.model_name, client)

# Register other backend for sub-calls
if self.other_backends and self.other_backend_kwargs:
    other_client = get_client(self.other_backends[0], self.other_backend_kwargs[0])
    self.register_client(other_client.model_name, other_client)
```

### 4. Client Interface

**BaseLM Abstract Class:**
```python
class BaseLM(ABC):
    @abstractmethod
    def completion(self, prompt: str) -> str:
        """Get completion from the model."""
    
    @abstractmethod
    def get_last_usage(self) -> dict:
        """Get token usage from last call."""
    
    @abstractmethod
    def get_usage_summary(self) -> UsageSummary:
        """Get merged usage across all calls."""
```

**Concrete Implementations:**
- `OpenAIClient` - OpenAI API
- `AnthropicClient` - Anthropic API
- `GeminiClient` - Google Gemini
- `PortkeyClient` - Multi-provider routing
- `LiteLLMClient` - Unified interface

---

## Key Implementation Patterns

### Pattern 1: Symbolic Context Storage

**Problem:** LLMs have limited context windows
**Solution:** Store context as REPL variable, not in context

**Implementation:**
```python
# Instead of: prompt = "very long text..."
# Do:
environment.add_context(prompt, context_index=0)

# Code accesses via:
# - context (alias to context_0)
# - context_0, context_1, ... (versioned)
```

**Our System Equivalent:**
```python
# Instead of: patterns in working memory
# Do:
pattern_library["research"] = load_patterns("research_skills")
pattern_library["coding"] = load_patterns("coding_skills")

# Code accesses via:
# - skills["research"]
# - skills["coding"]
```

### Pattern 2: Programmatic Sub-Calls

**Problem:** Verbalized delegation is limited
**Solution:** Code can invoke `llm_query()` programmatically

**Implementation:**
```python
# In REPL namespace:
def llm_query(prompt: str, model: str | None = None) -> str:
    """Programmatic sub-LM call."""
    request = LMRequest(prompt=prompt, model=model, depth=depth)
    response = send_lm_request(handler_address, request)
    return response.chat_completion.response

# Usage in code:
for chunk in context.split('\n'):
    result = llm_query(f"Process: {chunk}")
    results.append(result)
```

**Our System Equivalent:**
```python
# In our pattern library:
def activate_skill(skill_name: str, **kwargs) -> Any:
    """Programmatic skill activation."""
    skill = skill_registry[skill_name]
    return skill.execute(**kwargs)

# Usage:
for pattern in detected_patterns:
    result = activate_skill(pattern.name, **pattern.params)
    intermediate_results.append(result)
```

### Pattern 3: Execution Feedback Loop

**Problem:** No visibility into intermediate steps
**Solution:** Capture stdout/stderr and return as metadata

**Implementation:**
```python
def execute_code(self, code: str) -> REPLResult:
    with self._capture_output() as (stdout_buf, stderr_buf):
        exec(code, combined, combined)
    
    return REPLResult(
        stdout=stdout_buf.getvalue(),
        stderr=stderr_buf.getvalue(),
        locals=self.locals.copy(),  # State changes
        execution_time=...,
        rlm_calls=self._pending_llm_calls.copy(),
    )
```

**Our System Equivalent:**
```python
def activate_pattern(pattern: Pattern) -> ActivationResult:
    start_time = time.perf_counter()
    result = pattern.execute()
    
    return ActivationResult(
        output=result.output,
        state_changes=result.state,  # Pattern learned?
        execution_time=time.perf_counter() - start_time,
        skill_calls=result.activations,  # What skills triggered?
    )
```

### Pattern 4: Depth-Based Routing

**Problem:** How to handle recursive sub-calls?
**Solution:** Route based on depth parameter

**Implementation:**
```python
def get_client(self, model: str | None = None, depth: int = 0) -> BaseLM:
    if model and model in self.clients:
        return self.clients[model]
    
    if depth == 1 and self.other_backend_client is not None:
        return self.other_backend_client
    
    return self.default_client
```

**Usage:**
```python
# Root call (depth=0): uses main client (GPT-5)
# Sub-call (depth=1): uses smaller client (GPT-5-mini)
```

**Our System Equivalent:**
```python
def get_skill_handler(depth: int = 0) -> SkillHandler:
    if depth == 0:
        return full_skill_registry  # All skills
    elif depth == 1:
        return filtered_skill_registry  # Core skills only
    return minimal_skill_registry  # Basic skills
```

### Pattern 5: Safe Execution Environment

**Problem:** Code execution can be dangerous
**Solution:** Whitelist safe builtins, sandbox namespace

**Implementation:**
```python
_SAFE_BUILTINS = {
    # Core types and functions
    "print": print,
    "len": len,
    "str": str,
    "list": list,
    "dict": dict,
    # ... limited set ...
    
    # Blocked
    "eval": None,
    "exec": None,
    "input": None,
    "globals": None,
    "locals": None,
}
```

**Our System Equivalent:**
```python
# Pattern execution sandbox
_SAFE_ACTIVATIONS = {
    "activate_skill": activate_skill,
    "get_pattern": get_pattern,
    "log_result": log_result,
    # Limited to safe operations
}
```

---

## Code Flow Example

### RLM Execution Flow

```
1. User calls: rlm.completion("Analyze this long document")
                    │
2. Spawn LM handler + LocalREPL environment
                    │
3. Load prompt as context_0
                    │
4. Loop (up to max_iterations):
    │
    ├─ 4a. Build prompt with metadata only
    │   (length, not full text)
    │
    ├─ 4b. Get LLM response
    │
    ├─ 4c. Extract code blocks
    │
    ├─ 4d. Execute in REPL:
    │   - code can access context_0
    │   - code can call llm_query() 
    │   - code can set variables
    │   - stdout captured
    │
    ├─ 4e. Check for FINAL_VAR("varname")
    │   - If set, return that variable
    │
    └─ 4f. Update history, continue loop
```

### Example Code in REPL

```python
# The LLM generates this code (example from paper):

# 1. Decompose context
chunks = context.split('\n')

# 2. Process each chunk with sub-calls
results = []
for i, chunk in enumerate(chunks):
    result = llm_query(f"Analyze chunk {i}: {chunk[:100]}")
    results.append(result)

# 3. Combine results
combined = "\n".join(results)

# 4. Set final answer
FINAL_VAR("combined")

# Result: Returns the combined analysis
```

---

## Data Flow for Sub-Calls

```
┌──────────────────────────────────────────────────────────────────────┐
│                      Main Process (depth=0)                          │
│  RLM.completion() → LMHandler → OpenAI API                          │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
                   ┌───────────────┴───────────────┐
                   ▼                               ▼
    ┌─────────────────────────┐     ┌─────────────────────────┐
    │   Environment (REPL)   │     │  LMHandler Socket     │
    │                       │     │  - Port: random       │
    │   context_0 = ...     │     │  - Listening          │
    │   llm_query() fn     │     └───────────┬───────────┘
    │   execute_code()      │                 │
    └───────────────────────┘                 │
                                           │
                              ┌──────────────┴──────────────┐
                              ▼                             ▼
                     ┌─────────────────┐          ┌─────────────────┐
                     │ Code calls     │          │ Socket receives │
                     │ llm_query()   │          │ LMRequest       │
                     │ - Socket send │          │ - Routes to     │
                     │ - Blocks      │          │   client        │
                     └───────┬───────┘          └───────┬─────────┘
                             │                          │
                             ▼                          ▼
                     ┌─────────────────┐          ┌─────────────────┐
                     │ Socket recv    │          │ Client.call()   │
                     │ LMResponse    │          │ - OpenAI       │
                     │ - Extract     │          │ - Returns text │
                     │   chat_comp   │          └─────────────────┘
                     └───────┬───────┘
                             │
                             ▼
                     ┌─────────────────┐
                     │ Return to code │
                     │ Results in     │
                     │ execution flow │
                     └───────────────┘
```

---

## How RLM Enables Unbounded Context

### Traditional Approach
```
Input: 100K tokens
Processing: All in context window
Limitation: Context window size (8K-1M tokens)
```

### RLM Approach
```
Input: 100K tokens
Processing:
  1. Store as context_0 (file, not in window)
  2. Generate code that:
     - Splits context into chunks
     - Calls llm_query() per chunk
     - Combines results
     - Sets FINAL_VAR("result")

  3. Each llm_query() is separate API call
     - Can use smaller model for sub-calls
     - Can process chunks in parallel
     - Can retry failed chunks

Output: FINAL_VAR value (any length)
```

**Key Insight:** The REPL acts as an external memory system. The LLM never sees all 100K tokens at once - it only sees metadata and the results of programmatic operations.

---

## Pattern Extraction for Our System

### Mapping RLM to Meta-Skill

| RLM Component | Our System Equivalent | Purpose |
|---------------|---------------------|---------|
| Prompt → context_0 | Task → pattern_library | Externalize state |
| llm_query() | activate_skill() | Programmatic invocation |
| execute_code() | run_pattern() | Execution with feedback |
| FINAL_VAR() | completion_check() | Termination detection |
| LMHandler | SkillRouter | Route to appropriate handler |
| Socket server | IPC/function calls | Inter-component communication |
| REPL namespace | Pattern state | Persistent execution context |

### Implementation Recommendations

#### 1. External Pattern Storage
```python
# Instead of loading all patterns into memory
patterns = load_all_patterns()  # ❌ Limited by working memory

# Store as versioned variables
pattern_library = {
    "research": load_patterns("research"),
    "coding": load_patterns("coding"),
    "writing": load_patterns("writing"),
}
# ✅ Can scale to 100+ patterns
```

#### 2. Programmatic Skill Activation
```python
def activate_skill(skill_name: str, **kwargs) -> ActivationResult:
    """Programmatic skill invocation."""
    skill = skill_registry[skill_name]
    
    # Track for logging
    log_activation(skill_name, kwargs)
    
    # Execute
    result = skill.execute(**kwargs)
    
    # Update pattern confidence
    skill.confidence = update_confidence(skill.confidence, result.success)
    
    return result
```

#### 3. Execution Feedback Loop
```python
def run_pattern(pattern: Pattern, context: Context) -> PatternResult:
    """Execute pattern with full feedback."""
    result = pattern.execute(context)
    
    return PatternResult(
        output=result.output,
        new_patterns=result.learned_patterns,  # What was learned?
        execution_time=result.duration,
        confidence_change=result.confidence_delta,
    )
```

#### 4. Depth-Based Complexity
```python
def get_handler(depth: int = 0) -> Handler:
    if depth == 0:
        return FullHandler()  # All skills
    elif depth == 1:
        return CoreHandler()  # Frequently used skills
    return MinimalHandler()  # Basic operations
```

#### 5. Safe Pattern Execution
```python
_SAFE_ACTIVATIONS = {
    "activate": activate_skill,
    "compose": compose_results,
    "log": log_execution,
    # Only safe operations allowed
}
```

---

## Key Files to Study

| File | Purpose | Key Patterns |
|------|---------|--------------|
| `rlm/core/rlm.py` | Main RLM class | Iteration loop, termination detection |
| `rlm/environments/local_repl.py` | REPL implementation | Symbolic recursion, safe execution |
| `rlm/core/lm_handler.py` | Sub-call routing | Depth-based routing, socket protocol |
| `rlm/core/types.py` | Type definitions | Data structures |
| `rlm/utils/prompts.py` | Prompt construction | Metadata-only context |
| `rlm/clients/base_lm.py` | Client interface | Abstract interface |

---

## Critical Insights

### 1. Externalization Enables Scale
RLM doesn't try to fit long contexts in context windows. It externalizes them. Our system should externalize pattern state.

### 2. Symbolicity Enables Recursion
By providing `llm_query()` as a function, code can invoke sub-calls programmatically. Our system needs `activate_skill()` as a function.

### 3. Feedback Enables Learning
Every execution returns stdout, stderr, locals, and timing. Our system should capture similar feedback for pattern improvement.

### 4. Termination is Explicit
FINAL_VAR() provides clear termination signal. Our system needs explicit completion detection.

### 5. Routing Enables Optimization
Different models at different depths allows cost optimization. Our system can route simple tasks to simple handlers.

---

## Next Steps for Implementation

### Immediate (This Week)
1. Create `PatternLibrary` class (like `LocalREPL`)
2. Implement `activate_skill()` function (like `llm_query()`)
3. Add `run_pattern()` with feedback (like `execute_code()`)
4. Implement `FINAL_VAR()` equivalent (completion detection)

### Short-Term (This Month)
1. Add depth-based routing for complexity
2. Implement persistent pattern state
3. Build feedback collection system
4. Add safe execution guards

### Long-Term (This Quarter)
1. Self-modifying patterns
2. Cross-pattern learning
3. Automatic pattern generation
4. Full recursive self-improvement

---

## Conclusion

The RLM codebase demonstrates that recursive self-improvement is achievable through:

1. **Symbolic representation** - Context as variables, not tokens
2. **Programmatic invocation** - Functions for sub-calls, not verbalized delegation
3. **Feedback loops** - Execution results inform next steps
4. **External state** - Persistence beyond working memory
5. **Explicit termination** - Clear completion signals

Our meta-skill system should adopt these patterns to achieve recursive self-improvement.
