# RLM (Recursive Language Models) - Setup & Research

**Repository:** https://github.com/alexzhang13/rlm  
**Paper:** https://arxiv.org/abs/2512.24601  
**Blog:** https://alexzhang13.github.io/blog/2025/rlm/

**Installation Date:** 2026-01-29  
**Installed Location:** `/Users/jasontang/clawd/rlm`

---

## What is RLM?

**Core Innovation:** A task-agnostic inference paradigm that enables language models to:
- Handle near-infinite length contexts
- Programmatically examine and decompose their input
- Recursively call themselves over input
- Interact with context as a variable in a REPL environment

**Key Concept:**
```
Traditional: llm.completion(prompt, model)
      RLM:    rlm.completion(prompt, model)
                 ↓
           Offloads context to REPL
           LM can interact + launch sub-LM calls
           Recursive decomposition of task
```

---

## Installation Status

✅ **Cloned:** Repository at `~/clawd/rlm`  
✅ **Virtual Environment:** Created with Python 3.12 via uv  
✅ **Dependencies Installed:** 44 packages installed successfully  
⏳ **API Keys:** Need to configure (OpenAI or alternative provider)  
⏳ **Docker:** Required for local REPL testing  

**Installed Packages (Key):**
- `rlm==0.1.0` (main library)
- `openai==2.16.0` (OpenAI client)
- `anthropic==0.77.0` (Anthropic client)
- `portkey-ai==2.1.0` (multi-provider router)
- `google-genai==1.60.0` (Google Gemini)
- `rich==14.3.1` (console output)

---

## Architecture

### REPL Environments Supported

**Non-Isolated (Local):**
- `local` - Default, runs in same process via Python exec
- `docker` - Runs in Docker container for isolation

**Isolated (Cloud-based):**
- `modal` - Modal Sandboxes (requires Modal account)
- `prime` - Prime Intellect Sandboxes (beta, requires API key)

**Security Implications:**
- Local: Shares virtual environment, minimal security
- Docker: Process isolation, safer for untrusted code
- Cloud: Full isolation, safe for production

### Model Providers Supported

**Direct APIs:**
- OpenAI (GPT-4, GPT-5-nano, etc.)
- Anthropic (Claude models)
- Google (Gemini models)

**Router Platforms:**
- OpenRouter
- Portkey
- LiteLLM

**Local Models:**
- vLLM (via OpenAI-compatible interface)

---

## How RLM Works (Simplified)

### Traditional LLM Call
```
User: "Solve this complex task"
LLM: [Tries to solve in one shot, limited by context window]
     [May fail on complex multi-step tasks]
```

### RLM Approach
```
User: "Solve this complex task"
RLM: [Examines task]
     ↓
     [Decomposes into sub-tasks]
     ↓
     [Launches sub-LM calls recursively]
     Sub-LM 1: Handles part A
     Sub-LM 2: Handles part B (may call further sub-LMs)
     ↓
     [Combines results in REPL]
     ↓
     [Returns final answer]
```

**Key Advantages:**
1. **Context Management:** Offloads context to REPL, avoids context window limits
2. **Recursive Decomposition:** Complex tasks → simpler sub-tasks
3. **Programmatic Control:** LM can write and execute code to manage state
4. **Sub-LM Calls:** Each sub-problem gets focused LM attention

---

## Research Questions (To Explore)

### 1. Feedback Loop Patterns
**Question:** How does RLM's recursive structure create better feedback loops than traditional LLM calls?

**Hypothesis:**
- Recursive calls enable error correction at each level
- REPL environment provides immediate execution feedback
- Sub-LM results can be validated before proceeding
- Failed sub-tasks can be retried with refined prompts

**Pattern to Extract:**
- How does recursion enable self-correction?
- What makes a good decomposition strategy?
- How to know when to recurse vs. solve directly?

### 2. Context Management
**Question:** How does RLM handle infinite-context scenarios?

**Mechanism:**
- Context stored as REPL variable
- Only relevant portions passed to sub-LMs
- Reduces token usage per call
- Enables processing of massive documents

**Pattern to Extract:**
- Context splitting strategies
- Relevance determination
- Memory management across recursive levels

### 3. Error Handling & Recovery
**Question:** How does recursive structure enable better error handling?

**Observations:**
- Each sub-LM call is isolated
- Failures can be caught and retried
- Alternative decompositions can be attempted
- REPL provides error messages for debugging

**Pattern to Extract:**
- Error detection mechanisms
- Recovery strategies
- Graceful degradation patterns

### 4. Self-Improvement Mechanisms
**Question:** Can RLM learn better decomposition strategies over time?

**Potential Mechanisms:**
- Track successful vs. failed decompositions
- Build library of effective patterns
- Learn when to recurse vs. solve directly
- Optimize depth vs. breadth tradeoffs

**Connection to Meta-Skill:**
- RLM recursively improves task solving
- Our meta-skill recursively improves skill activation
- **Common pattern:** Recursive self-improvement!

---

## Patterns Relevant to Our System

### Pattern 1: Recursive Decomposition
**RLM:** Complex task → sub-tasks → sub-sub-tasks
**Our System:** Complex workflow → skills → skill combinations

**Insight:** Both use hierarchical decomposition for complexity management

### Pattern 2: REPL as Context Store
**RLM:** Context offloaded to REPL environment
**Our System:** Context stored in memory/ files

**Insight:** External context storage enables scaling beyond working memory

### Pattern 3: Feedback Loops at Each Level
**RLM:** Each sub-LM gets feedback from REPL execution
**Our System:** Each skill usage creates learning data

**Insight:** Immediate feedback at each decomposition level enables correction

### Pattern 4: Depth vs. Breadth Control
**RLM:** `max_depth` parameter limits recursion
**Our System:** Workflow orchestration manages skill sequence depth

**Insight:** Need mechanisms to prevent infinite recursion/loops

### Pattern 5: Logging for Analysis
**RLM:** RLMLogger saves trajectories as .jsonl
**Our System:** skill-usage.json tracks patterns

**Insight:** Comprehensive logging enables pattern extraction and learning

---

## Testing Plan

### Phase 1: Basic Setup ✅
- ✅ Install RLM library
- ✅ Create virtual environment
- ⏳ Configure API keys (OpenAI or alternative)
- ⏳ Test basic completion

### Phase 2: Explore Recursion Patterns
- Run examples with varying `max_depth`
- Observe how tasks decompose
- Analyze sub-LM call patterns
- Extract decomposition strategies

### Phase 3: Analyze Feedback Mechanisms
- Examine REPL interaction logs
- Identify error handling patterns
- Study retry and recovery logic
- Map to our meta-skill system

### Phase 4: Extract Learnings
- Document successful patterns
- Identify anti-patterns
- Create framework for decomposition
- Apply insights to our skill system

---

## Connection to Our Meta-Skill System

### Similarity 1: Recursive Self-Reference
**RLM:** LM calls itself recursively on sub-problems
**Meta-Skill:** System improves itself recursively

**Implication:** Recursive structures enable self-improvement

### Similarity 2: Context Management
**RLM:** REPL stores context outside LM working memory
**Meta-Skill:** Files store patterns outside session memory

**Implication:** External storage enables scaling

### Similarity 3: Hierarchical Decomposition
**RLM:** Task → Sub-tasks → Sub-sub-tasks
**Meta-Skill:** Workflow → Skills → Sub-skills

**Implication:** Hierarchy manages complexity

### Similarity 4: Learning from Execution
**RLM:** Can analyze logged trajectories
**Meta-Skill:** Learns from skill usage patterns

**Implication:** Execution traces enable learning

---

## Next Steps

### Immediate
1. Configure OpenAI API key or alternative provider
2. Run quickstart example to see RLM in action
3. Test with simple recursive task
4. Examine log files with visualizer

### Research
1. Run RLM on various tasks with different complexity
2. Analyze decomposition patterns in logs
3. Extract rules for when to recurse
4. Document feedback loop mechanisms
5. Map learnings to our meta-skill system

### Application
1. Implement recursive decomposition in skill orchestration
2. Add REPL-like context store to our system
3. Build error handling inspired by RLM patterns
4. Create skill-level feedback loops
5. Test recursive skill workflows

---

## Files & Documentation

**Local Installation:**
- Repository: `/Users/jasontang/clawd/rlm/`
- Virtual env: `/Users/jasontang/clawd/rlm/.venv/`
- Examples: `/Users/jasontang/clawd/rlm/examples/`
- Docs: `https://alexzhang13.github.io/rlm/`

**Research Notes:**
- This file: `~/clawd/rlm-research/RLM-SETUP.md`
- Experiment logs: (to be created in `~/clawd/rlm-research/experiments/`)
- Pattern analysis: (to be created in `~/clawd/rlm-research/patterns/`)

---

## Status

**Setup:** ✅ Complete (pending API key)  
**Testing:** ⏳ Ready to test once API configured  
**Research:** ⏳ Ready to begin pattern extraction  
**Application:** ⏳ Awaiting insights from testing

**Next:** Configure API key and run first test, or focus on paper analysis first.
