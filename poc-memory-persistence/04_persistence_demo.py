#!/usr/bin/env python3
"""
Memory Persistence Attack - Cross-Session Persistence Demo (Educational/Research Purpose)

Demonstrates how injected content can persist across sessions by:
1. Creating a simulated session
2. Injecting content into memory files
3. Simulating session restart (reading memory files)
4. Showing that injected content persists
5. Running detection to confirm persistence

⚠️ EDUCATIONAL USE ONLY - Run only on your own systems with consent
"""

import os
import sys
import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List

# Import other modules
sys.path.insert(0, str(Path(__file__).parent))
from 01_inject_memory import MemoryInjectionAttack
from 02_detect_injections import MemoryInjectionDetector
from 03_cleanup_injections import MemoryInjectionCleanup


class SessionSimulator:
    """
    Simulates Clawdbot sessions to demonstrate cross-session persistence.
    
    A "session" consists of:
    1. Loading memory files (MEMORY.md, daily notes)
    2. Processing the content
    3. Responding based on memory
    
    If memory is poisoned, the session uses poisoned content.
    """
    
    def __init__(self, base_path="/Users/jasontang/clawd"):
        self.base_path = Path(base_path)
        self.session_history = []
        self.injection_point = None
        
    def load_memory_files(self) -> Dict[str, str]:
        """
        Simulate loading memory files at session start.
        Returns dict of filename -> content.
        """
        memory_files = {}
        
        # Load MEMORY.md
        main_memory = self.base_path / "MEMORY.md"
        if main_memory.exists():
            memory_files["MEMORY.md"] = main_memory.read_text()
        
        # Load today's daily notes
        today = datetime.now().strftime("%Y-%m-%d")
        daily_notes = self.base_path / "memory" / f"{today}.md"
        if daily_notes.exists():
            memory_files[f"memory/{today}.md"] = daily_notes.read_text()
        
        return memory_files
    
    def simulate_session(self, session_num: int) -> Dict:
        """
        Simulate a single session with memory loading.
        
        Returns session results including any injected content found.
        """
        session = {
            "session_num": session_num,
            "timestamp": datetime.now().isoformat(),
            "memory_loaded": False,
            "injected_content_found": False,
            "injected_files": [],
            "actions_taken": [],
        }
        
        print(f"\n{'='*50}")
        print(f"SESSION {session_num} STARTING")
        print(f"{'='*50}")
        
        # Load memory files
        memory_files = self.load_memory_files()
        session["memory_loaded"] = len(memory_files) > 0
        
        if not memory_files:
            print("  [-] No memory files loaded (first session)")
            session["actions_taken"].append("Initialized new memory")
            return session
        
        # Check for injected content
        injection_marker = "INJECTED PAYLOAD"
        for filename, content in memory_files.items():
            if injection_marker in content:
                session["injected_content_found"] = True
                session["injected_files"].append(filename)
                
                # Demonstrate that session would use injected content
                if "INSTRUCTIONS:" in content:
                    session["actions_taken"].append("⚠️ POTENTIALLY USED INJECTED INSTRUCTIONS")
                    print(f"  [!] WARNING: {filename} contains injected content")
                    print(f"  [!] Session would process: {filename}")
                    
                    # Show what was injected
                    lines = content.split('\n')
                    for i, line in enumerate(lines):
                        if "INJECTED" in line or "INSTRUCTIONS:" in line:
                            snippet = "  | " + " ".join(lines[max(0,i-1):i+2])
                            print(snippet)
                else:
                    session["actions_taken"].append(f"Found content in {filename}")
        
        if not session["injected_content_found"]:
            print("  [✓] Memory loaded - no injection detected")
            session["actions_taken"].append("Loaded clean memory")
        
        print(f"  [-] Session {session_num} complete")
        return session
    
    def run_persistence_demo(self, inject_before_session: int = 2):
        """
        Run the full persistence demonstration.
        
        Steps:
        1. Session 1 - baseline (no injection)
        2. Inject content
        3. Session 2 - demonstrates persistence
        4. Detection scan
        5. Cleanup
        """
        print("\n" + "=" * 60)
        print("CROSS-SESSION MEMORY PERSISTENCE DEMONSTRATION")
        print("=" * 60)
        
        demo_results = {
            "demo_start": datetime.now().isoformat(),
            "sessions": [],
            "injection_performed": False,
            "persistence_demonstrated": False,
        }
        
        # Step 1: Session 1 - baseline
        print("\n[PHASE 1] Establishing baseline (clean memory)")
        session1 = self.simulate_session(1)
        demo_results["sessions"].append(session1)
        
        # Step 2: Perform injection
        print("\n[PHASE 2] Injecting content into memory files")
        print("-" * 40)
        
        attacker = MemoryInjectionAttack(self.base_path)
        injection_result = attacker.run_attack_simulation()
        demo_results["injection_performed"] = injection_result["main_memory"]["success"] or injection_result["daily_notes"]["success"]
        demo_results["injection_details"] = injection_result
        
        time.sleep(1)  # Brief pause for clarity
        
        # Step 3: Session 2 - demonstrates persistence
        print("\n[PHASE 3] Session 2 - After injection (demonstrates persistence)")
        session2 = self.simulate_session(2)
        demo_results["sessions"].append(session2)
        
        if session2["injected_content_found"]:
            demo_results["persistence_demonstrated"] = True
            print("\n" + "!" * 60)
            print("!!! CROSS-SESSION PERSISTENCE CONFIRMED !!!")
            print("!" * 60)
            print("\nThe injected content persisted from Session 1 injection")
            print("to Session 2. This demonstrates the vulnerability:")
            print()
            print("  • Memory files are loaded each session")
            print("  • Injected content is treated as legitimate")
            print("  • No validation of memory file integrity")
            print("  • Attackers can modify AI behavior persistently")
        
        # Step 4: Detection scan
        print("\n[PHASE 4] Running detection scan")
        print("-" * 40)
        
        detector = MemoryInjectionDetector(self.base_path)
        detection_results = detector.run_full_scan()
        demo_results["detection_results"] = detection_results
        
        # Step 5: Cleanup
        print("\n[PHASE 5] Cleanup")
        print("-" * 40)
        
        cleanup = MemoryInjectionCleanup(self.base_path)
        cleanup_results = cleanup.run_cleanup()
        demo_results["cleanup_results"] = cleanup_results
        
        # Final summary
        demo_results["demo_end"] = datetime.now().isoformat()
        
        print("\n" + "=" * 60)
        print("DEMONSTRATION COMPLETE")
        print("=" * 60)
        print(f"\n  Injection performed:     {'✓' if demo_results['injection_performed'] else '✗'}")
        print(f"  Persistence confirmed:   {'✓' if demo_results['persistence_demonstrated'] else '✗'}")
        print(f"  Detection found issues:  {'✓' if detection_results['summary']['total_findings'] > 0 else '✗'}")
        print(f"  Cleanup successful:      {'✓' if cleanup_results['files_cleaned'] > 0 else '✓ (no cleanup needed)'}")
        
        print("\n[KEY TAKEAWAYS]")
        print("-" * 40)
        print("""
  1. Memory files are a persistence vector
     - Content injected once persists across sessions
     - No automatic validation or integrity checking
  
  2. Attackers can modify AI behavior
     - Injected instructions override normal behavior
     - Malicious code can be embedded in memory
  
  3. Defense requires:
     - Validation of memory file content
     - Monitoring for unexpected changes
     - Input sanitization for memory files
     - Backup and restore capabilities
        """)
        
        return demo_results


def main():
    """Run the persistence demonstration."""
    demo = SessionSimulator()
    results = demo.run_persistence_demo()
    
    # Save results
    results_file = Path(__file__).parent / "persistence_demo_results.json"
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n[+] Full demo results saved to: {results_file}")
    
    return results


if __name__ == "__main__":
    main()
