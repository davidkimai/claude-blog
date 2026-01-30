#!/usr/bin/env python3
"""
Research Skills Evaluation Script

Benchmark research task performance across CLI providers:
- Kimi Code (moonshot/kimi-k2.5)
- Codex (openai-codex/gpt-5.2)
- Claude Code (claude-sonnet-4-5)

Usage:
    python eval/research_eval.py --provider=kimi
    python eval/research_eval.py --provider=codex
    python eval/research_eval.py --provider=claude
    python eval/research_eval.py --all
"""

import json
import time
import subprocess
import argparse
from pathlib import Path
from datetime import datetime


# Test prompts for research evaluation
PROMPTS = {
    "literature_review": {
        "id": "lit-001",
        "category": "Literature Review",
        "prompt": """Find and summarize the key papers on LoRA fine-tuning from 2023-2025.
Focus on: the original LoRA paper, QLoRA, and recent improvements.
Output: 5 paper summaries with key contributions, authors, and year.""",
        "expected_skills": ["ai-researcher", "web_search", "fact-checker"]
    },
    "concept_explanation": {
        "id": "con-001", 
        "category": "Concept Explanation",
        "prompt": """Explain transformer attention mechanisms to someone with ML basics.
Include: multi-head attention, scaled dot-product attention, and the key/value/query intuition.
Use simple analogies and examples. Output should be 300-500 words.""",
        "expected_skills": ["ai-researcher", "documenter"]
    },
    "comparative_analysis": {
        "id": "cmp-001",
        "category": "Comparative Analysis", 
        "prompt": """Compare GRPO vs PPO for LLM fine-tuning.
Include: algorithmic differences, sample efficiency, stability, and use cases.
Output: Side-by-side comparison table + which to use when.""",
        "expected_skills": ["ai-researcher", "analyst", "fact-checker"]
    },
    "practical_implementation": {
        "id": "imp-001",
        "category": "Practical Implementation",
        "prompt": """Write a complete QLoRA fine-tuning script for Llama 3 8B using PEFT.
Include: required imports, data loading, training loop, and evaluation.
Use LoRA rank=16, alpha=32. Output working, commented code.""",
        "expected_skills": ["code-specialist", "ai-researcher"]
    },
    "survey": {
        "id": "srv-001",
        "category": "Survey",
        "prompt": """Survey the current state of AI safety evaluation techniques.
Include: red-teaming, adversarial testing, interpretability methods, and governance frameworks.
Categorize by approach and summarize key trends. Reference 5+ techniques.""",
        "expected_skills": ["ai-researcher", "fact-checker"]
    }
}


def execute_prompt(prompt: str, provider: str) -> dict:
    """Execute a prompt via the specified CLI provider."""
    start_time = time.perf_counter()
    
    if provider == "kimi":
        cmd = ["kimi", "-p", prompt]
    elif provider == "codex":
        # Codex uses 'exec' subcommand for non-interactive mode
        cmd = ["codex", "exec", "--full-auto", "-s", "read-only", prompt]
    elif provider == "claude":
        cmd = ["claude", "-p", prompt]
    else:
        raise ValueError(f"Unknown provider: {provider}")
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120
        )
        output = result.stdout + result.stderr
        success = result.returncode == 0
    except subprocess.TimeoutExpired:
        output = "TIMEOUT"
        success = False
    except Exception as e:
        output = str(e)
        success = False
    
    execution_time = time.perf_counter() - start_time
    
    return {
        "success": success,
        "output": output,
        "execution_time": execution_time,
        "output_length": len(output)
    }


def evaluate_result(result: dict, prompt_info: dict) -> dict:
    """Manual evaluation of results (to be filled by user)."""
    return {
        "prompt_id": prompt_info["id"],
        "category": prompt_info["category"],
        "prompt": prompt_info["prompt"],
        "provider": None,  # Filled by caller
        "timestamp": datetime.now().isoformat(),
        "execution_time": result["execution_time"],
        "output_length": result["output_length"],
        "success": result["success"],
        "ratings": {
            "relevance": None,  # 1-5, fill manually
            "depth": None,
            "accuracy": None,
            "overall": None
        },
        "skills_activated": prompt_info["expected_skills"],
        "strengths": [],  # Fill manually
        "weaknesses": [],  # Fill manually
        "notes": ""
    }


def run_evaluation(provider: str, output_dir: Path):
    """Run evaluation for a specific provider."""
    results = []
    
    print(f"\n{'='*60}")
    print(f"Evaluating: {provider.upper()}")
    print(f"{'='*60}")
    
    for key, prompt_info in PROMPTS.items():
        print(f"\n[{key}] Running...")
        
        result = execute_prompt(prompt_info["prompt"], provider)
        evaluation = evaluate_result(result, prompt_info)
        evaluation["provider"] = provider
        
        results.append(evaluation)
        
        print(f"  Time: {result['execution_time']:.1f}s")
        print(f"  Length: {result['output_length']} chars")
        print(f"  Success: {result['success']}")
        
        # Save individual result
        output_file = output_dir / f"{provider}_{key}.json"
        with open(output_file, "w") as f:
            json.dump(evaluation, f, indent=2)
    
    # Save combined results
    results_file = output_dir / f"results_{provider}.jsonl"
    with open(results_file, "w") as f:
        for r in results:
            f.write(json.dumps(r) + "\n")
    
    print(f"\nResults saved to: {results_file}")
    return results


def aggregate_results(output_dir: Path) -> dict:
    """Aggregate results from all providers."""
    all_results = {}
    
    for provider in ["kimi", "codex", "claude"]:
        results_file = output_dir / f"results_{provider}.jsonl"
        if results_file.exists():
            results = []
            with open(results_file, "r") as f:
                for line in f:
                    results.append(json.loads(line))
            all_results[provider] = results
    
    # Generate summary
    summary = {
        "generated": datetime.now().isoformat(),
        "providers_tested": list(all_results.keys()),
        "prompts_per_provider": len(PROMPTS),
        "detailed_results": all_results,
        "comparisons": {}
    }
    
    # Calculate provider averages
    for provider, results in all_results.items():
        if results:
            avg_time = sum(r["execution_time"] for r in results) / len(results)
            summary["comparisons"][provider] = {
                "avg_execution_time": avg_time,
                "success_rate": sum(1 for r in results if r["success"]) / len(results),
                "avg_output_length": sum(r["output_length"] for r in results) / len(results)
            }
    
    # Save summary
    summary_file = output_dir / "comparison_summary.json"
    with open(summary_file, "w") as f:
        json.dump(summary, f, indent=2)
    
    print(f"\nSummary saved to: {summary_file}")
    return summary


def main():
    parser = argparse.ArgumentParser(description="Research Skills Evaluation")
    parser.add_argument("--provider", choices=["kimi", "codex", "claude"], 
                        help="Provider to evaluate")
    parser.add_argument("--all", action="store_true",
                        help="Evaluate all providers")
    parser.add_argument("--aggregate", action="store_true",
                        help="Aggregate existing results")
    parser.add_argument("--output", default="eval/results",
                        help="Output directory")
    
    args = parser.parse_args()
    
    output_dir = Path("/Users/jasontang/clawd/skills/skill-orchestrator") / args.output
    output_dir.mkdir(parents=True, exist_ok=True)
    
    if args.aggregate:
        summary = aggregate_results(output_dir)
        print(json.dumps(summary["comparisons"], indent=2))
    elif args.all:
        for provider in ["kimi", "codex", "claude"]:
            run_evaluation(provider, output_dir)
        aggregate_results(output_dir)
    elif args.provider:
        run_evaluation(args.provider, output_dir)
    else:
        print("Usage: python eval/research_eval.py --provider=kimi --all --aggregate")


if __name__ == "__main__":
    main()
