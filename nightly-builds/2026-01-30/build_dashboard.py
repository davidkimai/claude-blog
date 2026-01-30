# -*- coding: utf-8 -*-
"""
Builds a static HTML dashboard from Claude's operational JSON logs.

This script reads structured logs from the .claude/logs/ directory, analyzes them
to extract metrics on session activity, skill usage, and feedback trends, and
then renders an HTML report using a Jinja2 template.

Assumed Log Structure:
- Each .json file in the log directory represents a session.
- Files contain either a single JSON array of event objects or one JSON object per line.
- Events are expected to have keys like 'event_type', 'timestamp', and 'data'.
- 'tool_call' events contain tool usage data.
- 'feedback' events contain MISS/FIX information.
"""

import os
import json
from datetime import datetime
from collections import Counter
import jinja2

# --- Configuration ---
# Adhering to Claude's existing project structure.
# The script is expected to be run from the repository root.
LOG_DIR = ".claude/logs/"
TEMPLATE_NAME = "dashboard_template.html"
OUTPUT_NAME = "self_reflection_dashboard.html"


def parse_logs():
    """
    Parses all JSON log files in the specified LOG_DIR.

    Handles file I/O and JSON decoding errors gracefully. Assumes logs are either
    a JSON list or JSON-lines format.

    Returns:
        A tuple containing:
        - list: A flat list of all log events found across all files.
        - int: The total number of session files processed.
    """
    all_events = []
    session_count = 0
    if not os.path.isdir(LOG_DIR):
        print(f"Error: Log directory not found at '{LOG_DIR}'")
        return [], 0

    try:
        log_files = sorted([f for f in os.listdir(LOG_DIR) if f.endswith('.json')])
    except OSError as e:
        print(f"Error: Could not read log directory '{LOG_DIR}'. Reason: {e}")
        return [], 0
        
    session_count = len(log_files)

    for filename in log_files:
        filepath = os.path.join(LOG_DIR, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                # Gracefully handle empty or whitespace-only files
                if not content.strip():
                    continue
                # Handle logs that are a list of JSON objects or one JSON object per line
                if content.strip().startswith('['):
                    events = json.loads(content)
                else:
                    events = [json.loads(line) for line in content.strip().splitlines() if line]
                all_events.extend(events)
        except json.JSONDecodeError:
            print(f"Warning: Could not decode JSON from '{filepath}'. File may be corrupt or not valid JSON.")
        except (IOError, OSError) as e:
            print(f"Warning: Could not read file '{filepath}'. Error: {e}")

    return all_events, session_count


def analyze_data(events, session_count):
    """
    Analyzes parsed log events to generate aggregated metrics for the dashboard.

    Args:
        events (list): A list of log event dictionaries.
        session_count (int): The total number of sessions.

    Returns:
        dict: A dictionary of aggregated data ready for template rendering.
    """
    # Initialize metric counters
    skill_usage = Counter()
    miss_fix_counts = Counter()
    activity_by_hour = Counter()
    errors = []

    for event in events:
        if not isinstance(event, dict):
            continue  # Skip malformed event entries

        # --- Skill Usage Analysis ---
        # Assumed structure: {'event_type': 'tool_call', 'data': {'tool_name': '...'}}
        if event.get('event_type') == 'tool_call' and isinstance(event.get('data'), dict):
            tool_name = event['data'].get('tool_name')
            if tool_name:
                skill_usage[tool_name] += 1

        # --- MISS/FIX Trend Analysis ---
        # Assumed structure: {'event_type': 'feedback', 'data': {'type': 'MISS'}}
        if event.get('event_type') == 'feedback' and isinstance(event.get('data'), dict):
            feedback_type = event['data'].get('type')
            if feedback_type and feedback_type.upper() in ['MISS', 'FIX']:
                miss_fix_counts[feedback_type.upper()] += 1

        # --- Performance Metrics: Activity by Hour ---
        # Assumed structure: {'timestamp': 'YYYY-MM-DDTHH:MM:SS...'}
        timestamp_str = event.get('timestamp')
        if isinstance(timestamp_str, str):
            try:
                # Normalize timestamp by removing 'Z' and handling timezone offsets
                if timestamp_str.endswith('Z'):
                    timestamp_str = timestamp_str[:-1] + '+00:00'
                dt_obj = datetime.fromisoformat(timestamp_str)
                activity_by_hour[dt_obj.hour] += 1
            except (ValueError, TypeError):
                continue # Ignore if timestamp is malformed

        # --- Error Logging ---
        # Assumed structure: {'event_type': 'error', 'data': {'message': '...'}}
        if event.get('event_type') == 'error' and isinstance(event.get('data'), dict):
            errors.append(event['data'].get('message', 'Unknown error message'))

    # Prepare data for Chart.js rendering
    top_skills = skill_usage.most_common(10)
    skill_labels = [skill[0] for skill in top_skills]
    skill_data = [skill[1] for skill in top_skills]

    # Ensure consistent ordering for MISS/FIX
    miss_fix_labels = sorted(miss_fix_counts.keys())
    miss_fix_data = [miss_fix_counts[key] for key in miss_fix_labels]
    
    hourly_labels = list(range(24))
    hourly_data = [activity_by_hour[hour] for hour in hourly_labels]

    # Assemble the final context dictionary for Jinja2
    context = {
        'generation_time': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC'),
        'total_sessions': session_count,
        'total_events': len(events),
        'total_tool_calls': sum(skill_usage.values()),
        'unique_skills_used': len(skill_usage),
        'skill_labels': skill_labels,
        'skill_data': skill_data,
        'miss_fix_labels': miss_fix_labels,
        'miss_fix_data': miss_fix_data,
        'hourly_labels': hourly_labels,
        'hourly_data': hourly_data,
        'recent_errors': errors[-10:],  # Show 10 most recent errors
    }
    return context


def generate_dashboard(context):
    """
    Renders the HTML dashboard using Jinja2 and the provided context.

    Args:
        context (dict): Data to be rendered in the template.
    """
    try:
        # The template is assumed to be in the same directory as the script.
        template_loader = jinja2.FileSystemLoader(searchpath=".")
        template_env = jinja2.Environment(loader=template_loader, autoescape=True)
        template = template_env.get_template(TEMPLATE_NAME)
        output_html = template.render(context)

        with open(OUTPUT_NAME, 'w', encoding='utf-8') as f:
            f.write(output_html)

        print(f"✓ Successfully generated dashboard: '{os.path.abspath(OUTPUT_NAME)}'")

    except jinja2.exceptions.TemplateNotFound:
        print(f"Error: Template file not found at '{TEMPLATE_NAME}'. Ensure it's in the same directory as the script.")
    except Exception as e:
        print(f"An unexpected error occurred during HTML generation: {e}")


if __name__ == "__main__":
    """
    Main execution block. Orchestrates the log parsing, analysis, and
    dashboard generation process.
    """
    print("Starting self-reflection dashboard build process...")
    events, sessions = parse_logs()
    
    if sessions > 0 and events:
        dashboard_context = analyze_data(events, sessions)
        generate_dashboard(dashboard_context)
    elif sessions == 0:
        print("No log files found in the directory. Dashboard not generated.")
    else:
        print("Log files were found, but they contained no valid events. Dashboard not generated.")
        
    print("Build process finished.")
