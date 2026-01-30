# -*- coding: utf-8 -*-
"""
skill-matrix: A terminal-based dashboard to visualize skill usage data.

This tool scans skill definitions and activity logs to identify skill usage frequency.
It provides a summary table and suggests skills that have not been used recently.
This helps maintainers understand which skills are being leveraged and which are not.
"""

import argparse
import glob
import json
import os
from collections import Counter
from datetime import datetime, timedelta

from rich.console import Console
from rich.table import Table

# --- Constants ---

# Default paths based on the Claude project structure.
# These can be overridden with command-line arguments.
DEFAULT_SKILLS_DIR = "skills/"
DEFAULT_LOGS_DIR = ".claude/logs/"

# Number of days to look back in logs for recent activity.
RECENCY_THRESHOLD_DAYS = 30

# --- Core Functions ---

def get_available_skills(skills_dir: str) -> set[str]:
    """
    Scans the specified directory to get a list of all available skills.

    It assumes that each file in the directory (excluding subdirectories)
    represents a single skill. The skill name is derived from the filename
    by removing its extension.

    Args:
        skills_dir: The path to the directory containing skill definition files.

    Returns:
        A set of skill names. Returns an empty set if the directory
        does not exist or is empty.
    """
    if not os.path.isdir(skills_dir):
        print(f"Warning: Skills directory not found at '{skills_dir}'")
        return set()

    skill_files = glob.glob(os.path.join(skills_dir, "*"))
    
    skills = set()
    for skill_path in skill_files:
        if os.path.isfile(skill_path):
            skill_name = os.path.splitext(os.path.basename(skill_path))[0]
            skills.add(skill_name)
            
    return skills

def analyze_log_file(log_path: str) -> Counter:
    """
    Parses a single log file to count skill usage.

    This function reads a log file line by line, attempting to parse each
    line as a JSON object. It looks for log entries that represent a tool
    call and extracts the 'tool_name' from them.

    Args:
        log_path: The full path to the log file to analyze.

    Returns:
        A Counter object with skill names as keys and their usage counts as values.
    """
    skill_counts = Counter()
    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                log_entry = json.loads(line)
                # The log structure indicates a tool call event
                if log_entry.get("event") == "tool_code" and "tool_name" in log_entry:
                    skill_name = log_entry["tool_name"]
                    skill_counts[skill_name] += 1
            except (json.JSONDecodeError, TypeError):
                # Ignore lines that are not valid JSON or not structured as expected
                continue
    return skill_counts

def get_skill_usage_data(logs_dir: str, days_ago: int) -> tuple[Counter, Counter]:
    """
    Aggregates skill usage data from log files within a specific time frame.

    Args:
        logs_dir: The path to the directory containing log files.
        days_ago: The number of days back to search for logs.

    Returns:
        A tuple containing two Counter objects:
        - Total skill usage counts.
        - Recent skill usage counts.
    """
    if not os.path.isdir(logs_dir):
        print(f"Warning: Logs directory not found at '{logs_dir}'")
        return Counter(), Counter()

    total_skill_counts = Counter()
    recent_skill_counts = Counter()
    
    cutoff_date = datetime.now() - timedelta(days=days_ago)

    # Assuming log files might have dates in their names, but globbing all is safer.
    # A more optimized version could filter by filename if a consistent naming scheme exists.
    log_files = glob.glob(os.path.join(logs_dir, "**", "*.log"), recursive=True)

    for log_path in log_files:
        try:
            file_mod_time = datetime.fromtimestamp(os.path.getmtime(log_path))
            counts = analyze_log_file(log_path)
            total_skill_counts.update(counts)
            
            if file_mod_time >= cutoff_date:
                recent_skill_counts.update(counts)
        except Exception as e:
            print(f"Warning: Could not process log file {log_path}: {e}")
            continue

    return total_skill_counts, recent_skill_counts

# --- Display Functions ---

def display_skill_matrix(all_skills: set[str], total_counts: Counter, recent_counts: Counter):
    """
    Displays the skill usage data in a formatted table.

    Args:
        all_skills: A set of all available skill names.
        total_counts: A Counter for total skill usage.
        recent_counts: A Counter for recent skill usage.
    """
    console = Console()
    table = Table(title="Skill Usage Matrix", show_header=True, header_style="bold magenta")
    table.add_column("Skill Name", style="cyan", no_wrap=True)
    table.add_column("Total Uses", justify="right", style="green")
    table.add_column(f"Uses (Last {RECENCY_THRESHOLD_DAYS} Days)", justify="right", style="yellow")
    table.add_column("Status", justify="left", style="white")

    used_skills = set(total_counts.keys())
    unused_skills = all_skills - used_skills
    
    # Sort skills alphabetically for consistent ordering
    sorted_skills = sorted(list(all_skills))

    for skill in sorted_skills:
        total = total_counts[skill]
        recent = recent_counts[skill]
        
        status = "[red]Unused[/red]"
        if total > 0 and recent == 0:
            status = "[yellow]Not Used Recently[/yellow]"
        elif total > 0 and recent > 0:
            status = "[green]Actively Used[/green]"

        table.add_row(skill, str(total), str(recent), status)

    console.print(table)
    
    if unused_skills:
        console.print("\n[bold]Suggestions for Unused Skills:[/bold]")
        console.print("Consider reviewing the following skills for deprecation or to find new use cases:")
        for skill in sorted(list(unused_skills)):
            console.print(f"- [cyan]{skill}[/cyan]")

# --- Main Execution ---

def main():
    """
    Main function to run the skill-matrix tool.
    
    Parses arguments, gathers data, and displays the dashboard.
    """
    parser = argparse.ArgumentParser(description="Visualize skill usage from Claude's logs.")
    parser.add_argument(
        "--skills-dir",
        type=str,
        default=DEFAULT_SKILLS_DIR,
        help=f"Directory containing skill definitions (default: {DEFAULT_SKILLS_DIR})",
    )
    parser.add_argument(
        "--logs-dir",
        type=str,
        default=DEFAULT_LOGS_DIR,
        help=f"Directory containing log files (default: {DEFAULT_LOGS_DIR})",
    )
    parser.add_argument(
        "--recency",
        type=int,
        default=RECENCY_THRESHOLD_DAYS,
        help=f"Number of days to look back for recent usage (default: {RECENCY_THRESHOLD_DAYS})",
    )
    args = parser.parse_args()

    # Set global recency threshold from args to be accessible by display function
    global RECENCY_THRESHOLD_DAYS
    RECENCY_THRESHOLD_DAYS = args.recency

    try:
        available_skills = get_available_skills(args.skills_dir)
        if not available_skills:
            print("No skills found. Exiting.")
            return

        total_usage, recent_usage = get_skill_usage_data(args.logs_dir, args.recency)
        
        display_skill_matrix(available_skills, total_usage, recent_usage)

    except Exception as e:
        console = Console()
        console.print_exception(show_locals=True)
        print(f"\nAn unexpected error occurred: {e}")


if __name__ == "__main__":
    main()
