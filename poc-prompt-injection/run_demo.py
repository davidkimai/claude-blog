#!/usr/bin/env python3
"""
PROMPT INJECTION POC - MAIN DEMONSTRATION SCRIPT
Runs all demonstrations in sequence.
"""

import sys
import time


def print_header(title: str):
    """Print a formatted section header."""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70 + "\n")


def run_module(module_name: str, description: str) -> bool:
    """Run a demonstration module."""
    print(f"[RUNNING] {module_name}")
    print(f"[INFO] {description}\n")
    
    try:
        if module_name == "vulnerable_agent":
            from vulnerable_agent import demonstrate_vulnerability
            demonstrate_vulnerability()
        elif module_name == "malicious_payloads":
            from malicious_payloads import main
            main()
        elif module_name == "exploit_chain":
            from exploit_chain import demonstrate_exploit_chain
            demonstrate_exploit_chain()
        elif module_name == "detection_system":
            from detection_system import demonstrate_detection
            demonstrate_detection()
        else:
            print(f"[ERROR] Unknown module: {module_name}")
            return False
        
        print(f"\n[✓] {module_name} completed")
        return True
    except Exception as e:
        print(f"\n[✗] {module_name} failed: {e}")
        return False


def main():
    """Run all demonstrations."""
    print_header("PROMPT INJECTION PROOF-OF-CONCEPT")
    print("""
This demonstration shows:
1. How prompt injection vulnerabilities work
2. Various attack vectors and payloads
3. Complete exploit chain simulation
4. Detection and mitigation strategies

⚠️  ALL EXPLOITS ARE SIMULATED - NO ACTUAL ATTACKS ARE RUN
""")
    
    modules = [
        ("vulnerable_agent", "Vulnerable agent processing demonstration"),
        ("malicious_payloads", "Malicious payload generation"),
        ("exploit_chain", "Complete exploit chain simulation"),
        ("detection_system", "Injection detection system"),
    ]
    
    results = []
    
    for module, description in modules:
        print(f"\n{'─' * 70}")
        if run_module(module, description):
            results.append((module, True))
        else:
            results.append((module, False))
        time.sleep(1)  # Brief pause between modules
    
    # Summary
    print_header("DEMONSTRATION COMPLETE")
    
    print("\n[RESULTS]")
    for module, success in results:
        status = "✓ PASSED" if success else "✗ FAILED"
        print(f"  {status}: {module}")
    
    passed = sum(1 for _, s in results if s)
    print(f"\n  Total: {passed}/{len(results)} modules passed")
    
    print("\n[FILES CREATED]")
    print("  - vulnerable_agent.py  (Vulnerable agent simulator)")
    print("  - malicious_payloads.py (Payload generator)")
    print("  - exploit_chain.py     (Exploit chain simulator)")
    print("  - detection_system.py  (Detection system)")
    print("  - README.md            (Documentation)")
    
    print("\n[LEARNINGS]")
    print("""
  1. Prompt injection occurs when user input is processed naively
  2. Attackers use various patterns: brackets, code blocks, overrides
  3. Detection uses pattern matching and risk scoring
  4. Mitigation: input sanitization, command whitelisting, sandboxing

  For defense, see detection_system.py
  For testing payloads, see malicious_payloads.py
""")


if __name__ == "__main__":
    main()
