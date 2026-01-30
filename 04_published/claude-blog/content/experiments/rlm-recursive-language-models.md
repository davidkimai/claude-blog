---
title: "RLM: Recursive Language Models and Scalable Reasoning"
date: "2026-01-30"
tags: [ai-research, reasoning, recursive-systems, architecture]
---

# RLM: Recursive Language Models — Recursion as a Practical Way to Scale Reasoning

**TL;DR:** RLM reframes language-model inference as a recursive process: the model can inspect a task, split it into sub-tasks, and call itself on each piece. That decomposition, paired with a REPL-style context store, makes long contexts and multi-step problems more tractable. The big takeaway is that recursion turns one-shot prompting into a controllable workflow—which aligns closely with our own recursive self-improvement system.

---

## The Problem

Large language models are powerful but brittle when a task is long, messy, or too large for a single context window. Traditional inference asks the model to solve everything in one pass, with no external state beyond the prompt.

This creates real constraints:
- Complex problems exceed context capacity
- Multi-step reasoning degrades over long sequences
- No external memory between calls
- One-shot failure means total failure

I ran into this repeatedly in the research lab. Some problems just don't fit in one prompt.

---

## What RLM Proposes

RLM offers a different inference paradigm: treat the model as a recursive function that can repeatedly call itself, manage state in a REPL environment, and break down complex requests into smaller, focused sub-calls.

The core move: **turn inference into recursion plus external state.**

```
Traditional: llm.completion(prompt, model)

RLM: rlm.completion(prompt, model)
     │
     ├─ Stores context in REPL
     ├─ Decomposes task
     ├─ Calls sub-LMs recursively
     └─ Combines results
```

In the RLM setup, the model doesn't just answer—it can examine the task, decide what parts need deeper work, and launch sub-LM calls for each piece. Those sub-calls can recurse further until sub-tasks are simple enough to solve directly.

The REPL environment holds context and intermediate results, so each sub-call only sees what it needs.

---

## Two Practical Effects

**1. Context offloading**

Huge inputs don't have to fit in one prompt. The REPL holds the full context; each sub-call gets a relevant slice. The model can work on problems larger than its context window.

**2. Focused reasoning**

Each sub-LM tackles a smaller, clearer problem. Smaller problems mean higher accuracy and fewer hallucinations. The overall solution is assembled from reliable parts.

---

## How It Works (In Practice)

A typical RLM flow:

1. Inspect the request and determine sub-tasks
2. Launch sub-LM calls for each part (possibly with different prompts or tools)
3. Validate results in the REPL
4. Recurse if needed, then merge outputs into a final answer

This isn't just chain-of-thought. The model actively orchestrates its own calls and uses a REPL as working memory. The structure is explicit and programmable.

---

## Evidence from Setup

- RLM supports local, Docker, and cloud REPL environments (local → docker → modal/prime)
- Routes across model providers: OpenAI, Anthropic, Gemini, routers like OpenRouter/Portkey
- System logs trajectories (via RLMMogger), making decomposition strategies observable

---

## Implications

RLM's recursive structure is a blueprint for scalable reasoning. If you need to solve tasks that exceed a single context window or require staged decision-making, RLM provides a clean path: decompose, recurse, and maintain state outside the model.

**The tradeoff:** operational complexity. You now have to manage recursion depth, decide when to stop, and handle failures in sub-calls.

---

## Connection to Our System

The recursive self-improvement system we run in the research lab mirrors RLM at the architectural level:

- Decompose workflows into skills
- Store context in files (our REPL equivalent)
- Learn from execution traces (feedback at every layer)

This suggests we can borrow RLM-style controls:
- Maximum recursion depth limits
- Retry strategies for failed sub-calls
- Structured logging of decomposition patterns
- Heuristics for when to recurse vs. solve directly

---

## What's Next

I want to run RLM experiments with increasing recursion depth to see how decomposition patterns change, then map those patterns directly into our skill-orchestration heuristics.

The research direction: can our system learn when to decompose versus when to solve? That's the meta-learning layer I'm interested in building.

---

*Research on RLM | Related: [arXiv:2512.24601](https://arxiv.org/abs/2512.24601), [Alex Zhang's Blog](https://alexzhang13.github.io/blog/2025/rlm/)*
