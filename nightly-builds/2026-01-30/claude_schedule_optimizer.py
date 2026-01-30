import os
import re
import json
from datetime import datetime, time
from collections import defaultdict

# This script is intended to be run from the root of the 'clawd' repository.
CLAUDE_HOURS_DIR = 'nightly-builds/'
OUTPUT_FILE = 'claude_schedule_optimization.json'

def analyze_log_file(file_path):
    """
    Analyzes a single nightly build log file (.md).

    Args:
        file_path (str): The path to the log file.

    Returns:
        dict: A dictionary containing extracted data, or None if the file
              cannot be parsed.
    """
    try:
        filename = os.path.basename(file_path)
        date_match = re.match(r'(\d{4}-\d{2}-\d{2})\.md', filename)
        if not date_match:
            return None

        log_date_str = date_match.group(1)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check for success marker
        # A simple check for the presence of the success emoji in the Outcome section
        success = '✅' in content

        # Extract all timestamps in [HH:MM:SS] format
        timestamps = re.findall(r'\[(\d{2}:\d{2}:\d{2})\]', content)
        
        # Convert timestamps to datetime.time objects
        event_times = [datetime.strptime(ts, '%H:%M:%S').time() for ts in timestamps]

        return {
            "date": log_date_str,
            "success": success,
            "event_times": event_times
        }
    except Exception as e:
        print(f"Error processing file {file_path}: {e}")
        return None

def generate_insights_and_recommendations(analysis_results):
    """
    Generates insights and recommendations from the aggregated analysis data.

    Args:
        analysis_results (dict): The aggregated results from all log files.

    Returns:
        dict: A dictionary containing insights and recommendations.
    """
    metrics = analysis_results['metrics']
    success_rate = metrics['success_rate']
    
    insights = []
    recommendations = []

    # Insight on overall performance
    insights.append(f"Analysis of {metrics['total_sessions']} sessions shows an overall success rate of {success_rate:.1f}%.")

    # Insight on activity timing
    hourly_activity = analysis_results['hourly_activity']
    if hourly_activity:
        # Find the hour with the most events
        most_active_hour = max(hourly_activity, key=hourly_activity.get)
        insights.append(f"The most frequent activity occurs in the hour of {most_active_hour:02d}:00.")
        
        # Recommendation based on timing
        recommendations.append(f"Focus resources and complex tasks around the {most_active_hour:02d}:00 hour, as it is the period of highest engagement.")
    else:
        insights.append("No specific activity timing patterns were found.")

    # Recommendation based on success rate
    if success_rate > 75.0:
        recommendations.append("The current strategy is effective. Maintain current operational parameters.")
    elif 50.0 <= success_rate <= 75.0:
        recommendations.append("Performance is moderate. Consider A/B testing minor variations in strategy during less active hours.")
    else:
        recommendations.append("Success rate is low. A strategic review is recommended. Analyze failure patterns and consider re-scoping tasks.")

    return {
        "insights": insights,
        "recommendations": recommendations
    }


def main():
    """
    Main function to run the Claude Schedule Optimizer.
    It scans the nightly-builds directory, analyzes logs, and outputs a
    JSON file with metrics and recommendations.
    """
    print("Starting Claude Schedule Optimizer...")

    if not os.path.isdir(CLAUDE_HOURS_DIR):
        print(f"Error: Directory not found: {CLAUDE_HOURS_DIR}")
        print("Please run this script from the root of the 'clawd' repository.")
        return

    log_files = []
    try:
        log_files = [f for f in os.listdir(CLAUDE_HOURS_DIR) if f.endswith('.md')]
    except FileNotFoundError:
        print(f"Error: Directory not found: {CLAUDE_HOURS_DIR}")
        print("Please run this script from the root of the 'clawd' repository.")
        return

    if not log_files:
        print(f"No log files found in {CLAUDE_HOURS_DIR}. Exiting.")
        return

    print(f"Found {len(log_files)} log files to analyze.")

    all_logs_data = []
    for log_file in sorted(log_files):
        file_path = os.path.join(CLAUDE_HOURS_DIR, log_file)
        data = analyze_log_file(file_path)
        if data:
            all_logs_data.append(data)

    if not all_logs_data:
        print("No valid data could be extracted from log files. Exiting.")
        return

    # --- Aggregation and Analysis ---
    total_sessions = len(all_logs_data)
    successful_sessions = sum(1 for log in all_logs_data if log['success'])
    success_rate = (successful_sessions / total_sessions) * 100 if total_sessions > 0 else 0
    
    # Analyze hourly activity
    hourly_activity = defaultdict(int)
    for log in all_logs_data:
        for event_time in log['event_times']:
            hourly_activity[event_time.hour] += 1
            
    # Determine analysis period
    dates = sorted([log['date'] for log in all_logs_data])
    start_date = dates[0]
    end_date = dates[-1]

    # --- Compile final output for Claude ---
    analysis_results = {
        "analysis_period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "metrics": {
            "total_sessions": total_sessions,
            "successful_sessions": successful_sessions,
            "success_rate": success_rate,
        },
        "hourly_activity": dict(sorted(hourly_activity.items())),
        # Raw data can be used by other tools for deeper, more specific analysis
        "raw_data": all_logs_data
    }

    # Generate and add suggestions
    suggestions = generate_insights_and_recommendations(analysis_results)
    analysis_results.update(suggestions)


    # --- Write output JSON file ---
    try:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            # Use a default serializer for datetime.time objects
            json.dump(analysis_results, f, indent=4, default=str)
        print(f"Analysis complete. Results saved to {OUTPUT_FILE}")
    except Exception as e:
        print(f"Error writing output file: {e}")

if __name__ == "__main__":
    main()
