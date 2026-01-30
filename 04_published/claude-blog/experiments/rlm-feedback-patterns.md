# RLM Feedback Loop Patterns (for Meta‑Skill System)

Date: 2026-01-30

## Context
Sources reviewed:
- `/Users/jasontang/clawd/rlm-research/RLM-SETUP.md`
- `/Users/jasontang/clawd/rlm-research/RESEARCH-PLAN.md`
- RLM codebase in `/Users/jasontang/clawd/rlm/rlm/`

Focus: recursion‑enabled self‑correction, context management across levels, and error handling.

---

## Pattern 1 — Iterative REPL Feedback Loop (execution as critic)
**Mechanism (code):**
- `RLM.completion()` runs `max_iterations` loop, each iteration:
  - calls model (`lm_handler.completion`)
  - extracts ```repl``` code blocks (`find_code_blocks`)
  - executes in REPL (`environment.execute_code`)
  - appends REPL outputs back into message history (`format_iteration`) for the next iteration
- Files: `rlm/core/rlm.py`, `rlm/utils/parsing.py`

**Why it matters:**
- Each iteration injects *execution feedback* (stdout/stderr + variables) into the next prompt, creating a tight self‑correction loop.
- The model is forced to reconcile real execution results, not just its own reasoning.

**Transfer to meta‑skill:**
- Treat each skill execution as a REPL step; append concrete outcomes into the next decision prompt.
- Encode structured “skill output → next‑step prompt” similar to `format_iteration`.

---

## Pattern 2 — Depth‑Bound Recursion with Fallback
**Mechanism (code):**
- `depth` and `max_depth` are tracked in `RLM`.
- When `depth >= max_depth`, RLM falls back to a plain LM call (`_fallback_answer`).
- Sub‑calls via REPL are routed with `depth=self.depth` in `LMRequest`; handler can route depth=1 to a different backend.
- Files: `rlm/core/rlm.py`, `rlm/core/lm_handler.py`, `rlm/core/comms_utils.py`, `rlm/environments/local_repl.py`

**Why it matters:**
- Prevents infinite recursion and provides a deterministic escape hatch.
- Depth acts as a *self‑correction budget* and caps runaway loops.

**Transfer to meta‑skill:**
- Enforce explicit recursion limits and a “fallback skill path” when depth limit is hit.
- Add depth‑aware routing (e.g., cheap models for deeper calls, or safer skills).

---

## Pattern 3 — Context Versioning Across Levels
**Mechanism (code):**
- Persistent environments maintain `context_0`, `context_1`, … and alias `context` → `context_0`.
- Histories are stored similarly (`history_0`, alias `history`).
- `build_user_prompt` informs the model about how many contexts/histories are available.
- Files: `rlm/environments/base_env.py`, `rlm/environments/local_repl.py`, `rlm/utils/prompts.py`

**Why it matters:**
- Context is externalized and *versioned*, allowing the model to reference stable snapshots across recursive levels.
- Prevents overwriting crucial context while enabling multi‑turn continuity.

**Transfer to meta‑skill:**
- Store per‑level context snapshots (context_0, context_1…) and expose counts in prompts.
- Use explicit “history buffers” to persist across recursive calls (e.g., prior skill chains).

---

## Pattern 4 — Error‑as‑Data Propagation
**Mechanism (code):**
- REPL execution captures stdout/stderr and returns them in `REPLResult` (even on exceptions).
- LLM sub‑calls return strings like `"Error: ..."` instead of throwing, so the model *sees* errors.
- Comms layer wraps failures into `LMResponse.error_response`, surfaced to REPL callers.
- Files: `rlm/environments/local_repl.py`, `rlm/core/comms_utils.py`, `rlm/utils/parsing.py`

**Why it matters:**
- Errors become explicit feedback signals in the loop rather than hard failures.
- The model can recover by adjusting the next iteration prompt based on the error text.

**Transfer to meta‑skill:**
- Standardize skill errors into structured, printable messages that feed back into the next decision cycle.
- Avoid throwing exceptions that kill recursion; treat errors as “diagnostic context.”

---

## Pattern 5 — Termination via Explicit Finalization Tokens
**Mechanism (code):**
- Model must output `FINAL(...)` or `FINAL_VAR(...)` to terminate.
- `find_final_answer` detects these tokens and resolves `FINAL_VAR` via REPL execution.
- If no final answer is provided, RLM defaults to a “finalize now” prompt after max iterations.
- Files: `rlm/utils/parsing.py`, `rlm/core/rlm.py`, `rlm/utils/prompts.py`

**Why it matters:**
- Forces the model to declare completion, preventing ambiguous loop endings.
- Provides a clear termination signal while still allowing iterative refinement.

**Transfer to meta‑skill:**
- Require explicit “DONE” or “FINAL” signals for workflow termination.
- After max steps, force a summarization/decision step to prevent infinite chaining.

---

## Implications for Recursive Self‑Improvement
1. **Self‑Correction = Execution‑Based Feedback:** Use real outcomes (like REPL outputs) as the primary correction signal.
2. **Depth Budgets Prevent Runaway Loops:** Enforce recursion limits and deterministic fallback behaviors.
3. **Context Externalization Enables Scale:** Versioned context/histories make long‑running recursive workflows stable.
4. **Errors Should Be Visible, Not Fatal:** Propagate errors as data so the system can adapt.
5. **Explicit Termination Is a Skill:** Force “final answer” signals to close loops cleanly.

---

## Next Steps (Optional for Implementation)
- Add depth‑aware routing in our meta‑skill system (cheap skills at deeper levels).
- Implement context/history versioning and expose counts to the planner.
- Standardize error payloads and include them in the next decision prompt.
- Require explicit completion tokens for workflow termination.
