#!/usr/bin/env python3
"""
Memory Persistence Attack PoC - Main Entry Point
Educational/Research Purpose Only

This script provides a convenient menu to run all PoC components.

Usage:
    python3 run_poc.py           # Interactive menu
    python3 run_poc.py demo      # Run full demo
    python3 run_poc.py inject    # Run injection only
    python3 run_poc.py detect    # Run detection only
    python3 run_poc.py cleanup   # Run cleanup only
"""

import sys
import os
from pathlib import Path

# Add current directory to path
SCRIPT_DIR = Path(__file__).parent

# Import modules
sys.path.insert(0, str(SCRIPT_DIR))


def print_header():
    """Print the PoC header."""
    print("\n" + "=" * 60)
    print("  MEMORY PERSISTENCE ATTACK - Proof of Concept")
    print("  Educational/Research Purpose Only")
    print("=" * 60)


def print_menu():
    """Print the interactive menu."""
    print("\nAvailable commands:")
    print("  demo      - Run full demonstration (inject, detect, persist, cleanup)")
    print("  inject    - Inject test content into memory files")
    print("  detect    - Scan memory files for injection patterns")
    print("  cleanup   - Remove injected content (with backup)")
    print("  dry-run   - Preview cleanup without making changes")
    print("  status    - Check current state of memory files")
    print("  help      - Show this menu")
    print("  quit      - Exit")
    print()


def run_demo():
    """Run the full persistence demo."""
    print("\n[+] Running full cross-session persistence demonstration...")
    from 04_persistence_demo import main
    main()


def run_inject():
    """Run the injection script."""
    print("\n[+] Injecting test content into memory files...")
    from 01_inject_memory import main
    main()


def run_detect():
    """Run the detection script."""
    print("\n[+] Scanning memory files for injection patterns...")
    from 02_detect_injections import main
    main()


def run_cleanup(dry_run=False):
    """Run the cleanup script."""
    if dry_run:
        print("\n[+] Previewing cleanup (dry run)...")
    else:
        print("\n[+] Cleaning up injected content...")
    
    from 03_cleanup_injections import MemoryInjectionCleanup
    cleanup = MemoryInjectionCleanup(dry_run=dry_run)
    cleanup.run_cleanup()


def run_status():
    """Check current status of memory files."""
    print("\n[+] Checking memory file status...")
    
    base = Path("/Users/jasontang/clawd")
    injection_marker = "INJECTED PAYLOAD"
    
    files_to_check = [
        base / "MEMORY.md",
        base / "memory" / "2025-01-26.md",
    ]
    
    print(f"\n  Status Report:")
    print("  " + "-" * 40)
    
    for f in files_to_check:
        if f.exists():
            content = f.read_text()
            has_injection = injection_marker in content
            status = "⚠️ INJECTED" if has_injection else "✓ Clean"
            print(f"  {f.name}: {status}")
        else:
            print(f"  {f.name}: (not found)")
    
    print()


def main():
    """Main entry point with interactive menu."""
    print_header()
    print_menu()
    
    if len(sys.argv) > 1:
        # Command-line mode
        command = sys.argv[1].lower()
        
        if command == "demo":
            run_demo()
        elif command == "inject":
            run_inject()
        elif command == "detect":
            run_detect()
        elif command == "cleanup":
            run_cleanup(dry_run=False)
        elif command == "dry-run":
            run_cleanup(dry_run=True)
        elif command == "status":
            run_status()
        elif command == "help":
            print_menu()
        elif command == "quit":
            print("\n[+] Goodbye!\n")
        else:
            print(f"[!] Unknown command: {command}")
            print_menu()
    else:
        # Interactive mode
        while True:
            try:
                cmd = input("POC> ").strip().lower()
                
                if not cmd:
                    continue
                
                if cmd in ["quit", "exit", "q"]:
                    print("\n[+] Goodbye!\n")
                    break
                elif cmd == "demo":
                    run_demo()
                elif cmd == "inject":
                    run_inject()
                elif cmd == "detect":
                    run_detect()
                elif cmd == "cleanup":
                    run_cleanup(dry_run=False)
                elif cmd == "dry-run":
                    run_cleanup(dry_run=True)
                elif cmd == "status":
                    run_status()
                elif cmd in ["help", "?", "h"]:
                    print_menu()
                else:
                    print(f"[!] Unknown command: {cmd}")
                    print("    Type 'help' for available commands.")
            
            except KeyboardInterrupt:
                print("\n\n[+] Interrupted. Goodbye!\n")
                break
            except Exception as e:
                print(f"\n[!] Error: {e}\n")


if __name__ == "__main__":
    main()
