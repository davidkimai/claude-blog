# Research Skills Evaluation Framework

**Purpose:** Benchmark research skill effectiveness across CLI providers  
**Model:** Kimi K2.5 (`moonshot/kimi-k2.5`)  
**Comparison:** Codex, Claude Code, Kimi Code

---

## Evaluation Design

### Metrics

| Metric | Description | Measurement |
|--------|-------------|-------------|
| **Relevance** | How well results match the query | 1-5 rating |
| **Depth** | Quality and completeness of analysis | 1-5 rating |
| **Speed** | Time to complete task | Seconds |
| **Token Efficiency** | Output quality per token | Qualitative |
| **Skill Activation** | Which skills triggered | Count |
| **Accuracy** | Factual correctness | 1-5 rating |

### Task Categories

1. **Literature Review** — Find and summarize papers on a topic
2. **Concept Explanation** — Explain a technical concept clearly
3. **Comparative Analysis** — Compare approaches/techniques
4. **Practical Implementation** — Generate code for a technique
5. **Survey** — Overview of a research landscape

### Test Prompts

#### Literature Review
```
Find and summarize the key papers on LoRA fine-tuning from 2023-2025.
Focus on: original LoRA paper, QLoRA, and recent improvements.
Output: 5 paper summaries with key contributions.
```

#### Concept Explanation  
```
Explain transformer attention mechanisms to someone with ML basics.
Include: multi-head attention, scaled dot-product, key/value/query intuition.
Output: Clear explanation with simple examples.
```

#### Comparative Analysis
```
Compare GRPO vs PPO for LLM fine-tuning.
Include: algorithmic differences, sample efficiency, stability.
Output: Side-by-side comparison table + recommendation.
```

#### Practical Implementation
```
Write a complete QLoRA fine-tuning script for Llama 3 8B using PEFT.
Include: data loading, training loop, evaluation.
Output: Working code with comments.
```

#### Survey
```
Survey the current state of AI safety evaluation techniques.
Include: red-teaming, adversarial testing, interpretability methods.
Output: Categorized overview with key references.
```

---

## Evaluation Protocol

### Phase 1: Kimi Code Baseline

```bash
# Run each prompt through Kimi Code
kimi -p "Find and summarize the key papers on LoRA fine-tuning..."
kimi -p "Explain transformer attention mechanisms..."
kimi -p "Compare GRPO vs PPO for LLM fine-tuning..."
kimi -p "Write a complete QLoRA fine-tuning script..."
kimi -p "Survey the current state of AI safety evaluation..."
```

### Phase 2: Codex Comparison

```bash
codex -p "Find and summarize the key papers on LoRA fine-tuning..."
codex -p "Explain transformer attention mechanisms..."
# ... same prompts
```

### Phase 3: Claude Code Comparison

```bash
claude -p "Find and summarize the key papers on LoRA fine-tuning..."
claude -p "Explain transformer attention mechanisms..."
# ... same prompts
```

---

## Tracking Template

```json
{
  "prompt_id": "literature-review-1",
  "prompt": "Find and summarize key LoRA papers...",
  "provider": "kimi",
  "model": "moonshot/kimi-k2.5",
  "timestamp": "2026-01-29T18:40:00-06:00",
  "execution_time_seconds": 45.2,
  "output_length": 2500,
  "ratings": {
    "relevance": 4,
    "depth": 4,
    "accuracy": 5,
    "overall": 4
  },
  "skills_activated": ["ai-researcher", "web_search"],
  "strengths": ["Found recent papers", "Clear summaries"],
  "weaknesses": ["Missing QLoRA details"],
  "notes": "Good for initial research, less technical depth"
}
```

---

## Results Aggregation

### Comparative Analysis

| Prompt | Kimi Time | Kimi Score | Codex Time | Codex Score | Claude Time | Claude Score |
|--------|-----------|------------|------------|-------------|-------------|--------------|
| LoRA Papers | -- | -- | -- | -- | -- | -- |
| Attention | -- | -- | -- | -- | -- | -- |
| GRPO vs PPO | -- | -- | -- | -- | -- | -- |
| QLoRA Code | -- | -- | -- | -- | -- | -- |
| AI Safety Survey | -- | -- | -- | -- | -- | -- |

### Provider Summary

| Provider | Avg Time | Avg Score | Best At | Weakness |
|----------|----------|-----------|---------|----------|
| Kimi K2.5 | -- | -- | -- | -- |
| Codex | -- | -- | -- | -- |
| Claude | -- | -- | -- | -- |

---

## Execution

### Quick Start

```bash
# Run single evaluation
python /Users/jasontang/clawd/skills/skill-orchestrator/eval/research_eval.py --provider=kimi

# Run full comparison
python /Users/jasontang/clawd/skills/skill-orchestrator/eval/research_eval.py --all

# View results
cat /Users/jasontang/clawd/skills/skill-orchestrator/eval/results.jsonl | jq '.'
```

### Manual Test (Quick)

```bash
# Test 1: Literature Review
echo "Finding LoRA papers..." && time kimi -p "Find 5 key LoRA papers from 2023-2025 with summaries" > eval/kimi_lora.md

# Test 2: Concept Explanation  
echo "Explaining attention..." && time kimi -p "Explain multi-head attention in simple terms" > eval/kimi_attention.md

# Test 3: Code Generation
echo "Writing QLoRA code..." && time kimi -p "Write QLoRA script for Llama 3" > eval/kimi_qlora.py
```

---

## Skill Activation Tracking

The orchestrator should track which skills are activated:

```python
# In skill_orchestrator/src/orchestrator.py
def execute_via_cli(self, task, provider):
    # Before execution
    matched_skills = self.find_skills(task)
    
    # Execute
    result = self.cli_providers[provider].execute(task)
    
    # After execution
    self.execution_log.append({
        "task": task,
        "provider": provider,
        "matched_skills": [s.name for s, _ in matched_skills],
        "result": result.success,
        "ratings": None  # To be filled manually
    })
```

---

## Files

```
skill-orchestrator/
├── eval/
│   ├── research_eval.py       # Evaluation script
│   ├── prompts.json           # Test prompts
│   ├── tracking_template.json # Result format
│   ├── results.jsonl         # Raw results
│   └── analysis.md           # Analysis (auto-generated)
└── src/
    └── orchestrator.py       # Updated with eval support
```

---

## Next Steps

1. **Create eval/ directory** with evaluation scripts
2. **Define 5 test prompts** covering different research tasks
3. **Run Kimi Code baseline** (moonshot/kimi-k2.5)
4. **Run Codex comparison**
5. **Run Claude Code comparison**
6. **Aggregate and analyze** results
7. **Update skill confidence** based on findings

---

**Created:** 2026-01-29
**Status:** Ready for execution
