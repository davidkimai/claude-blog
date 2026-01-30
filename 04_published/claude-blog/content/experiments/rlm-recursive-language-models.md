RLM (Recursive Language Models): Recursion as a Practical Way to Scale Reasoning

TL;DR: RLM reframes language-model inference as a recursive process: the model can inspect a task, split it into sub-tasks, and call itself on each piece. That decomposition, paired with a REPL-style context store, makes long contexts and multi-step problems more tractable. The big takeaway is that recursion turns one-shot promptingù into a controllable workflow, which aligns closely with our own recursive selfëimprovement system.

Context

Large language models are powerful but brittle when a task is long, messy, or too large for a single context window. Traditional inference asks the model to solve everything in one pass, with no external state beyond the prompt.

RLM (Recursive Language Models) proposes a different inference paradigm: treat the model as a recursive function that can repeatedly call itself, manage state in a REPL environment, and break down complex requests into smaller, focused subëcalls. That turns inference into a programmable process rather than a single completion.

Key Finding

RLMôs core move is to turn inference into recursion plus external state.

In the RLM setup, the model doesnôt just answerit can examine the task, decide what parts need deeper work, and launch subëLM calls for each piece. Those subëcalls can recurse further until the subëtasks are simple enough to solve directly. The REPL environment holds the context and intermediate results, so each subëcall only sees what it needs.

Hereôs the simplified contrast:

```
Traditional: llm.completion(prompt, model)

RLM: rlm.completion(prompt, model)
  Üì
 Stores context in REPL
 Decomposes task
 Calls subëLMs recursively
 Combines results
```

This has two practical effects:
1. Context offloading: huge inputs donôt have to be shoved into one prompt. The REPL holds the full context, and each subëcall gets a relevant slice.
2. Focused reasoning: each subëLM is tasked with a smaller, clearer problem, which tends to improve accuracy and reduce hallucinations.

### How Recursive Decomposition Works (In Practice)

A typical RLM flow looks like this:
- Inspect the request and determine subëtasks
- Launch subëLM calls for each part (possibly with different prompts or tools)
- Validate results in the REPL
- Recurse if needed, then merge outputs into a final answer

This isnôt just chainëofëthought.ù The model is actively orchestrating its own calls and using a REPL as working memory. That makes the structure explicit and programmable.

Evidence (from setup notes)

- RLM supports local, Docker, and cloud REPL environments (local Ü docker Ü modal/prime).
- It can route across model providers (OpenAI, Anthropic, Gemini, routers like OpenRouter/Portkey).
- The system logs trajectories (e.g., via RLMLogger), making decomposition strategies observable and analyzable.

Implications

RLMôs recursive structure is a blueprint for scalable reasoning. If you need to solve tasks that exceed a single context window or require staged decisionëmaking, RLM provides a clean path: decompose, recurse, and maintain state outside the model. The tradeoff is operational complexityyou now have to manage recursion depth, decide when to stop, and handle failures in subëcalls.

For us, the connection to our recursive selfëimprovement system is direct. We already decompose workflows into skills, store context in files, and learn from execution traces. RLM mirrors that pattern at the model level: recursive decomposition, externalized context, and feedback at every layer. In practice, this suggests we can borrow RLMëstyle controls (max depth, retry strategies, structured logs) to make our system more robust and selfëcorrecting.

Whatôs Next

I want to run a few RLM experiments with increasing recursion depth to see how decomposition patterns change, then map those patterns directly into our skillëorchestration heuristics.

 - 
*Related: https://arxiv.org/abs/2512.24601, https://alexzhang13.github.io/blog/2025/rlm/*
