# RLM Paper Deep Analysis - Extracting Patterns for Recursive Self-Improvement

**Paper:** Recursive Language Models (Zhang, Kraska, Khattab - 2026)  
**Analysis Date:** 2026-01-29  
**Purpose:** Extract patterns from RLM research to improve our recursive self-improvement system

---

## Executive Summary

RLM (Recursive Language Model) is a breakthrough in handling arbitrarily long contexts by treating the prompt as an external environment and enabling symbolic recursion. The core insight - **offload context to an external system, enable recursive self-reference, and use symbolic execution for decomposition** - applies directly to our meta-skill activation system.

**Key Pattern Transfer:**
- RLM: Prompt → REPL variable → Recursive sub-calls → Output
- Our System: Context → Skill registry → Recursive skill activation → Action

---

## Core Innovation: The RLM Paradigm

### Traditional LLM Approach
```
User: "Solve complex task with long context"
LLM: [Tries to fit everything in context window]
     [Degrades with length]
     [Limited by context window]
```

### RLM Approach
```
User: "Solve complex task"
RLM:  [Offload prompt to REPL as variable]
      [Programmatic decomposition]
      [Recursive sub-calls on snippets]
      [Execution feedback loop]
      [Combine results]
      [Return output]
```

### Three Critical Design Choices (From Paper)

#### Design Choice 1: Symbolic Handle to Context
**RLM:** Give LLM a symbolic handle to the prompt, not text in context window
**Our System:** Give meta-skill a symbolic handle to the context, not raw files in working memory

**Mechanism:**
- RLM: `prompt` variable in REPL, not in LLM context
- Our System: `skill_registry` structure, not raw skill files

**Pattern:**
```
CONTEXT_AS_VARIABLE not CONTEXT_IN_WINDOW
```

#### Design Choice 2: Symbolic Recursion
**RLM:** Code can invoke sub-LMs programmatically in loops
**Our System:** Patterns can invoke skill activations programmatically

**Mechanism:**
- RLM: `for chunk in prompt: sub_RLM(chunk)` - O(n) or O(n²) calls
- Our System: `for pattern in patterns: activate_skill(pattern)` - adaptive depth

**Pattern:**
```
PROGRAMMATIC_RECURSIVE_CALLS not VERBALIZED_DELEGATION
```

#### Design Choice 3: REPL Feedback Loop
**RLM:** Persistent REPL environment with execution feedback
**Our System:** Persistent pattern library with outcome tracking

**Mechanism:**
- RLM: `REPL(state, code)` → `(new_state, stdout)` → metadata to LLM
- Our System: `PatternLibrary(patterns, usage)` → `(new_patterns, metrics)` → activation rules

**Pattern:**
```
EXECUTION_FEEDBACK not ONE_SHOT_GENERATION
```

---

## Key Observations from RLM Experiments

### Observation 1: REPL Enables Long Context Scaling

**Finding:** Even without sub-calls, REPL alone enables scaling beyond context limits
**Evidence:** "Our ablation of the RLM is able to scale beyond the context limit of the model and outperform other task-agnostic baselines"

**Implication for Our System:**
- Just having skill registry (REPL equivalent) improves activation
- Sub-calls (skill combinations) provide additional benefit
- **Start with registry, add combination patterns over time**

### Observation 2: Recursive Sub-Calling Necessary for Information-Dense Tasks

**Finding:** On linear (OOLONG) and quadratic (OOLONG-Pairs) complexity tasks, recursive sub-calling is necessary
**Evidence:** "Across all information-dense tasks, RLMs outperform the ablation without sub-calling by 10%-59%"

**Implication for Our System:**
- Simple skill activation works for simple tasks
- Multi-skill workflows needed for complex tasks
- **Need both single-skill and multi-skill activation paths**

### Observation 3: Performance Degradation Patterns

**Finding:** LM performance degrades as function of input length AND problem complexity
**Evidence:** "GPT-5 performance degrades significantly faster for more complex tasks, while RLM performance degrades at a much slower rate"

**Degradation Mapping:**
| Task Type | Complexity | LM Degradation | RLM Behavior |
|-----------|------------|----------------|--------------|
| S-NIAH | O(1) | Minimal | Slight improvement |
| OOLONG | O(n) | Significant | Much slower degradation |
| OOLONG-Pairs | O(n²) | Catastrophic | Maintains strong performance |

**Implication for Our System:**
| Task Type | Complexity | Meta-Skill Behavior |
|-----------|------------|---------------------|
| Single skill | O(1) | Fast activation |
| Multi-skill workflow | O(n) | Moderate overhead |
| Recursive workflow | O(n²) | Higher overhead but necessary |

**Pattern:**
```
CHOOSE_COMPLEXITY_APPROPRIATE_TO_TASK
```

### Observation 4: Cost Scaling

**Finding:** RLM costs scale proportionally to task complexity, remain comparable to base LM
**Evidence:** "For GPT-5, the median RLM run is cheaper than the median base model run"

**Cost Mapping:**
| Complexity | RLM Cost | Base LM Cost | Winner |
|------------|----------|--------------|--------|
| Simple (S-NIAH) | Low | Low | Base LM |
| Medium (OOLONG) | Medium | High | RLM |
| Complex (OOLONG-Pairs) | High | Very High | RLM |

**Implication for Our System:**
- Simple task: Direct skill activation
- Complex task: Multi-skill workflow (pay overhead)
- Very complex: Recursive pattern application (pay more, get result)

**Pattern:**
```
PAY_COMPLEXITY_COST_ONLY_WHEN_NECESSARY
```

### Observation 5: Model-Specific Behaviors

**Finding:** Different models exhibit different patterns of context management and sub-calling
**Evidence:** "RLM(Qwen3-Coder) launches a sub-call per line in OOLONG while GPT-5 is conservative about sub-querying"

**Implication for Our System:**
- Different "models" (skill combinations) behave differently
- Some prefer: Many simple skills
- Some prefer: Few complex skills
- **System should adapt to user preferences, not impose one pattern**

**Pattern:**
```
ADAPT_TO_USER_PREFERENCES not ONE_SIZE_FITS_ALL
```

---

## Emergent Patterns in RLM Trajectories

### Pattern A: Chunking and Recursively Sub-Calling

**Description:** RLMs chunk the context and recursively process each chunk
**Example:** "In Figure 4b, RLM(Qwen3-Coder) chunks by newline in a 1000+ line context"

**RLM Implementation:**
```python
for line in prompt.split('\n'):
    result = sub_RLM(line)
    intermediate_results.append(result)
final_answer = combine(intermediate_results)
```

**Our System Equivalent:**
```python
for pattern in skill_patterns:
    skill_result = activate_skill(pattern)
    intermediate_results.append(skill_result)
final_answer = orchestrate(intermediate_results)
```

**When to Use:**
- Information-dense tasks
- Tasks requiring full coverage of context
- Aggregation problems

### Pattern B: Filtering Using Code Execution Based on Model Priors

**Description:** RLMs use code (regex, filtering) to narrow search space without seeing all context
**Example:** "RLM(GPT-5) using regex queries to search for chunks containing keywords"

**RLM Implementation:**
```python
# Filter before processing
relevant_chunks = [chunk for chunk in prompt.split('\n') 
                   if re.search(keywords, chunk)]
results = [sub_RLM(chunk) for chunk in relevant_chunks]
```

**Our System Equivalent:**
```python
# Filter before activating
relevant_skills = [skill for skill in all_skills 
                   if skill.matches(context, user_request)]
best_skills = rank_by_confidence(relevant_skills)
```

**Key Insight:**
```
DONT_PROCESS_EVERYTHING - FILTER_FIRST
Use model priors (user history, task type) to narrow scope
```

### Pattern C: Variable Passing for Long Output Tasks

**Description:** RLMs build output incrementally through variables, allowing unbounded output
**Example:** "RLM stored output of sub-LM calls in variables and stitched them together"

**RLM Implementation:**
```python
results = []
for chunk in chunks:
    result = sub_RLM(chunk)
    results.append(result)
final_answer = stitch(results)  # Variable composition
```

**Our System Equivalent:**
```python
results = []
for skill in skills_to_activate:
    result = activate_skill(skill)
    results.append(result)
final_action = compose(results)  # Result composition
```

**Key Insight:**
```
BUILD_INCREMENTALLY not ONE_SHOT_OUTPUT
Use composition to handle complex results
```

---

## Patterns Relevant to Our Meta-Skill System

### Pattern 1: External Context Storage

**From RLM:** Context stored as REPL variable, not in LLM window
**To Our System:** Context stored in files/structures, not in working memory

**Implementation:**
- `memory/skill-usage.json` stores activation patterns
- `memory/skills-registry.json` stores skill metadata
- `memory/active-triggers.md` stores current context

**Benefit:** Can handle arbitrarily many skills without working memory limits

### Pattern 2: Recursive Pattern Application

**From RLM:** Recursive sub-calls on programmatic transformations
**To Our System:** Recursive skill activation based on pattern matching

**Implementation:**
```
TASK → DETECT_PATTERNS → MATCH_SKILLS → ACTIVATE
                                      ↓
                              [If complex]
                              DECOMPOSE → RECURSE
```

**Example:**
- Simple task: Match 1 skill, activate it
- Medium task: Match 5 skills, activate sequentially
- Complex task: Match 20 skills, decompose into phases, activate recursively

### Pattern 3: Execution Feedback Loop

**From RLM:** Each iteration executes code, updates REPL state, collects output
**To Our System:** Each activation updates pattern confidence, refines triggers

**Implementation:**
```
ACTIVATE_SKILL → OBSERVE_OUTCOME → UPDATE_PATTERN → REFINE_TRIGGER
```

**Example:**
- Skill activated → Check outcome (success/failure) → Update confidence → Adjust threshold

### Pattern 4: Adaptive Complexity Selection

**From RLM:** Different models make different decisions about sub-calling depth
**To Our System:** Different contexts require different activation complexity

**Implementation:**
```
TASK → ASSESS_COMPLEXITY → CHOOSE_APPROACH
                      ↓         ↓
              Single skill   Multi-skill workflow
                              ↓
                      Recursive activation
```

### Pattern 5: Prior-Based Filtering

**From RLM:** Model uses priors to filter context before processing
**To Our System:** System uses user history to filter skills before activation

**Implementation:**
```
USER_REQUEST → MATCH_HISTORY → NARROW_SCOPE → ACTIVATE_RELEVANT
```

**Example:**
- User frequently does research → Prioritize research skills
- User frequently writes code → Prioritize coding skills
- User is preparing for interview → Prioritize interview skills

---

## Algorithm Comparison

### Algorithm 1: RLM (Effective Design)

```
state ← InitREPL(prompt=P)
state ← AddFunction(state, sub_RLM)
hist ← [Metadata(state)]

while True:
    code ← LLM(hist)
    (state, stdout) ← REPL(state, code)
    hist ← hist ∥ code ∥ Metadata(stdout)
    if state[Final] is set:
        return state[Final]
```

**Key Properties:**
- Symbolic handle to context (not in hist)
- Programmatic sub-calls (sub_RLM function)
- Feedback loop (REPL execution)
- Termination condition (Final variable)

### Algorithm 2: Poor Design (What to Avoid)

```
actions ← {Finish, Exec, Search, sub_LLM}
hist ← [Metadata(actions), P]  # PROBLEM: Prompt in context

while True:
    (action, val) ← LLM(hist)
    if action is Finish:
        return val
    out ← RUN(action, val)
    hist ← hist ∥ (action, val, out)
    if Tok(hist) > K:  # PROBLEM: Must compact
        hist ← Compact(hist)
```

**Flaws:**
- Prompt in context window (limited by K)
- Autoregressive output (limited by K)
- No symbolic recursion (verbalized only)
- Context compaction (loses information)

### Algorithm 3: Our Meta-Skill System (Should Look Like)

```
patterns ← LoadPatterns()
skills ← LoadSkills()
hist ← [Metadata(patterns, skills)]

while True:
    context ← CurrentContext()
    matched_patterns ← Match(patterns, context)
    selected_skills ← Select(skills, matched_patterns)
    
    if should_terminate(selected_skills, context):
        return compose_activations(selected_skills)
    
    code ← GenerateActivationCode(selected_skills)
    (patterns, outcome) ← Execute(patterns, code)
    hist ← hist ∥ code ∥ Metadata(outcome)
    
    # Feedback loop - learn from outcome
    patterns ← UpdatePatterns(patterns, outcome)
```

**Key Properties:**
- Patterns external (not in context)
- Symbolic skill selection (not verbalized)
- Feedback loop (learn from outcomes)
- Adaptive termination (based on outcomes)

---

## How to Apply RLM Patterns to Our System

### Immediate Actions (This Week)

#### 1. Externalize Pattern Storage
**Current:** Patterns stored in SKILL.md files
**Better:** Patterns extracted and stored in `memory/pattern-library.json`

**Action:**
- Create `memory/pattern-library.json`
- Extract patterns from all SKILL.md files
- Store as structured data for programmatic access

#### 2. Implement Execution Feedback Loop
**Current:** Skills activated, outcomes not systematically tracked
**Better:** Every activation recorded, patterns updated based on outcomes

**Action:**
- Modify `meta-skill-activation` to log outcomes
- Update pattern confidence scores after each use
- Refine triggers based on success/failure

#### 3. Add Symbolic Recursion Support
**Current:** Simple skill activation
**Better:** Can activate skills that activate other skills

**Action:**
- Add `recursive_activation` function
- Implement depth limiting to prevent infinite loops
- Test with simple recursive patterns

### Medium-Term Actions (Next Month)

#### 1. Prior-Based Filtering
**Current:** Context matching is explicit
**Better:** Uses implicit user preferences from history

**Action:**
- Analyze `memory/skill-usage.json` for user patterns
- Prioritize frequently used skills
- Build user preference model

#### 2. Adaptive Complexity Selection
**Current:** Same activation path for all tasks
**Better:** Task complexity determines activation strategy

**Action:**
- Implement complexity scoring
- Simple tasks → Direct activation
- Complex tasks → Multi-skill workflow
- Very complex → Recursive activation

#### 3. Variable Composition
**Current:** Skills activated, results returned
**Better:** Skills activated, results composed into larger structures

**Action:**
- Add `compose_results` function
- Enable skills to build on each other's outputs
- Handle complex orchestration

### Long-Term Actions (Quarter 1+)

#### 1. Self-Modifying Patterns
**Current:** Patterns manually updated
**Better:** Patterns automatically refined based on usage

**Action:**
- Implement pattern learning algorithm
- Extract new patterns from successful activations
- Remove underperforming patterns

#### 2. Native Recursive Training
**Current:** Prompt existing models
**Better:** Train models specifically for recursive activation

**Action:**
- Collect RLM-style trajectories
- Fine-tune on activation patterns
- Create "native recursive meta-skill"

---

## Concrete Implementation Plan

### Phase 1: Foundation (Days 1-3)

**Goal:** Implement basic RLM-like architecture

**Actions:**
1. Create `memory/pattern-library.json` with extracted patterns
2. Implement `PatternMatcher` class
3. Implement `ActivationExecutor` class
4. Add basic feedback loop

**Code Structure:**
```
meta-skill-activation/
├── pattern_matcher.py      # Match patterns to context
├── activation_executor.py  # Execute skill activations
├── feedback_loop.py        # Learn from outcomes
├── pattern_library.json    # Extracted patterns
└── SKILL.md               # Updated with RLM principles
```

### Phase 2: Feedback Learning (Days 4-7)

**Goal:** Implement execution feedback loop

**Actions:**
1. Log every skill activation with outcome
2. Calculate pattern confidence scores
3. Refine triggers based on data
4. Implement automatic threshold adjustment

**Metrics to Track:**
- Activation success rate per pattern
- Time to successful activation
- User satisfaction (if available)
- Pattern confidence scores

### Phase 3: Recursion Support (Week 2)

**Goal:** Enable recursive skill activation

**Actions:**
1. Implement recursive activation function
2. Add depth limiting
3. Test with simple recursive patterns
4. Handle edge cases (infinite loops)

**Recursive Pattern Example:**
```
ActivatePattern("research_workflow")
  → ActivatePattern("literature_review")
    → ActivatePattern("paper_search")
    → ActivatePattern("summary_extraction")
  → ActivatePattern("hypothesis_generation")
    → ActivatePattern("experiment_design")
```

### Phase 4: Adaptive Complexity (Week 3)

**Goal:** Match activation complexity to task complexity

**Actions:**
1. Implement complexity scorer
2. Add strategy selection
3. Test with varying complexity tasks
4. Measure cost/benefit tradeoffs

**Complexity Indicators:**
- Task description length
- Number of implicit sub-tasks
- Historical complexity of similar tasks
- User expertise level

### Phase 5: Self-Improvement (Week 4+)

**Goal:** System improves itself automatically

**Actions:**
1. Implement pattern extraction algorithm
2. Add automatic pattern generation
3. Remove underperforming patterns
4. Test self-modification safety

---

## Mapping RLM Concepts to Our System

| RLM Concept | Our System Equivalent |
|-------------|----------------------|
| Prompt variable | Pattern registry |
| REPL environment | Execution context |
| Sub-LM calls | Skill activations |
| Metadata to LLM | Triggers to meta-skill |
| Final variable | Completed workflow |
| Trajectory logging | Usage analytics |
| Context filtering | Skill prioritization |

---

## Key Insights for Recursive Self-Improvement

### Insight 1: External Storage Enables Scale

**RLM:** Context in REPL, not LLM window → Can handle 10M+ tokens
**Our System:** Patterns in files, not working memory → Can handle 100+ skills

**Takeaway:** Always externalize state. Never rely on working memory limits.

### Insight 2: Symbolic Recursion Enables Complexity

**RLM:** Programmatic sub-calls → Can handle O(n²) tasks
**Our System:** Symbolic pattern activation → Can handle complex workflows

**Takeaway:** Symbolic operations scale better than verbalized operations.

### Insight 3: Feedback Loops Enable Learning

**RLM:** REPL execution → Metadata to LLM → Improved decisions
**Our System:** Skill activation → Outcome tracking → Pattern refinement

**Takeaway:** Every execution is a learning opportunity.

### Insight 4: Prior Filtering Enables Efficiency

**RLM:** Use model priors to filter context → Process less, achieve more
**Our System:** Use user history to filter skills → Activate relevant, skip irrelevant

**Takeaway:** Leverage implicit knowledge (preferences, history) to reduce effort.

### Insight 5: Composition Enables Unbounded Output

**RLM:** Stitch sub-LM outputs → Can produce unbounded tokens
**Our System:** Compose skill results → Can handle complex tasks

**Takeaway:** Build complex results from simple components.

---

## Success Metrics

### Quantitative
- Pattern coverage: % of skills with associated patterns
- Activation success rate: % of activations that achieve goal
- Complexity handling: Performance on O(1), O(n), O(n²) tasks
- Learning rate: Improvement in pattern confidence over time

### Qualitative
- User satisfaction: Does the system feel "smart"?
- Surprise factor: Does it suggest skills the user didn't think of?
- Reliability: Does it consistently make good suggestions?
- Adaptability: Does it learn user preferences over time?

### Benchmarks
| Complexity | Metric | Target |
|------------|--------|--------|
| Simple (O(1)) | Activation time | < 1 second |
| Medium (O(n)) | Workflow success rate | > 80% |
| Complex (O(n²)) | Recursive activation success | > 60% |
| All | Pattern confidence improvement | 10% per week |

---

## Conclusion

The RLM paper provides a blueprint for recursive self-improvement:

1. **Externalize** context (patterns in files, not memory)
2. **Symbolize** operations (programmatic, not verbalized)
3. **Recurse** for complexity (adaptive depth)
4. **Feedback** continuously (learn from every activation)
5. **Filter** with priors (leverage implicit knowledge)
6. **Compose** results (build complex from simple)

Our meta-skill activation system should embody these principles. The goal is not just to activate skills, but to **continuously improve our ability to activate skills** - a recursively self-improving system.

---

## Next Steps

1. **Today:** Create `memory/pattern-library.json`
2. **Tomorrow:** Implement basic feedback loop
3. **This week:** Add recursive activation support
4. **This month:** Implement adaptive complexity selection
5. **This quarter:** Enable self-modifying patterns

The path from skill activation to recursive self-improvement is clear. Let's execute.
