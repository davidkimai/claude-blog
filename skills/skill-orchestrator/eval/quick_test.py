#!/usr/bin/env python3
"""
Quick Research Skills Test

Test research capabilities across CLI providers with 3 fast prompts.
Run this first to get baseline metrics.

Usage:
    python eval/quick_test.py --provider=kimi
    python eval/quick_test.py --all
"""

import subprocess
import time
import json
from datetime import datetime


# Quick test prompts (faster than full evaluation)
QUICK_PROMPTS = [
    ("attention", "Explain multi-head attention in 2 sentences with a simple analogy."),
    ("lora", "What is LoRA fine-tuning? Give 3 key points."),
    ("safety", "Name 3 AI safety evaluation techniques."),
]


def run_test(provider: str):
    """Run quick test for a provider."""
    results = []
    
    print(f"\n{'='*50}")
    print(f"Testing: {provider.upper()}")
    print(f"{'='*50}")
    
    for name, prompt in QUICK_PROMPTS:
        start = time.time()
        
        if provider == "kimi":
            cmd = ["kimi", "-p", prompt]
        elif provider == "codex":
            cmd = ["codex", "-p", prompt]
        elif provider == "claude":
            cmd = ["claude", "-p", prompt]
        else:
            print(f"Unknown provider: {provider}")
            return
        
        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True, timeout=60
            )
            elapsed = time.time() - start
            output = result.stdout[:500] + "..." if len(result.stdout) > 500 else result.stdout
            
            print(f"\n[{name}] {elapsed:.1f}s")
            print(f"  Output: {output[:100]}...")
            
            results.append({
                "prompt": name,
                "time": elapsed,
                "length": len(result.stdout),
                "success": result.returncode == 0
            })
        except Exception as e:
            print(f"\n[{name}] ERROR: {e}")
            results.append({
                "prompt": name,
                "time": time.time() - start,
                "error": str(e)
            })
    
    # Save results
    output_file = f"/Users/jasontang/clawd/skills/skill-orchestrator/eval/quick_test_{provider}.json"
    with open(output_file, "w") as f:
        json.dump({
            "provider": provider,
            "timestamp": datetime.now().isoformat(),
            "results": results
        }, f, indent=2)
    
    print(f"\nResults saved to: {output_file}")
    return results


def main():
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--all":
        for provider in ["kimi", "codex", "claude"]:
            run_test(provider)
    else:
        provider = sys.argv[1] if len(sys.argv) > 1 else "kimi"
        run_test(provider)


if __name__ == "__main__":
    main()
