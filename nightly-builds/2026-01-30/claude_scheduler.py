# claude_scheduler.py
#
# An intelligent scheduler that analyzes past activity logs to identify
# peak productivity hours and recommend an optimal, timezone-aware schedule
# for future Claude Hours sessions.

import json
import re
import argparse
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple, Any

try:
    from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
except ImportError:
    print("Error: 'zoneinfo' module not found. This script requires Python 3.9+.")
    print("For older Python versions, you may need to install the 'tzdata' package: pip install tzdata")
    exit(1)


# --- Constants ---
DEFAULT_CONFIG_PATH = 'scheduler_config.json'
# Regex to capture timestamps in the format [YYYY-MM-DD HH:MM:SS]
TIMESTAMP_REGEX = re.compile(r'\[(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\]')


# --- Core Functions ---

def load_config(config_path: str) -> Optional[Dict[str, Any]]:
    """
    Loads and validates the configuration from a JSON file.

    Args:
        config_path: Path to the configuration JSON file.

    Returns:
        A dictionary containing the configuration, or None if an error occurs.
    """
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)

        # Basic validation
        required_keys = ["log_file_path", "user_timezone", "productivity_window_hours", "analysis_period_days"]
        for key in required_keys:
            if key not in config:
                print(f"Error: Missing required key '{key}' in configuration file.")
                return None
        
        # Validate timezone
        try:
            ZoneInfo(config["user_timezone"])
        except ZoneInfoNotFoundError:
            print(f"Error: Invalid timezone '{config['user_timezone']}' in configuration.")
            print("Please use a valid IANA Time Zone name (e.g., 'America/New_York', 'Europe/London', 'UTC').")
            return None

        return config
    except FileNotFoundError:
        print(f"Error: Configuration file not found at '{config_path}'.")
        return None
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from '{config_path}'. Please check its format.")
        return None

def parse_activity_logs(log_file_path: str, analysis_period_days: int, user_tz: ZoneInfo) -> Tuple[List[datetime], List[str]]:
    """
    Parses activity logs, extracting timestamps within the analysis period.

    Args:
        log_file_path: Path to the activity log file.
        analysis_period_days: The number of past days to analyze.
        user_tz: The timezone of the user to interpret timestamps correctly.

    Returns:
        A tuple containing:
        - A list of timezone-aware datetime objects representing user activity.
        - A list of error messages for lines that could not be parsed.
    """
    timestamps = []
    errors = []
    time_limit = datetime.now(user_tz) - timedelta(days=analysis_period_days)

    try:
        with open(log_file_path, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f):
                match = TIMESTAMP_REGEX.search(line)
                if match:
                    try:
                        ts_str = match.group(1)
                        # Assume timestamps in the log are in the user's local time
                        naive_ts = datetime.strptime(ts_str, '%Y-%m-%d %H:%M:%S')
                        aware_ts = naive_ts.astimezone(user_tz)
                        
                        if aware_ts >= time_limit:
                            timestamps.append(aware_ts)
                    except ValueError:
                        errors.append(f"Line {i+1}: Found timestamp-like string, but failed to parse: '{match.group(1)}'")
                # else:
                #     errors.append(f"Line {i+1}: No timestamp found.")
    except FileNotFoundError:
        errors.append(f"Log file not found at '{log_file_path}'.")
    
    return timestamps, errors

def analyze_activity(timestamps: List[datetime]) -> Dict[int, int]:
    """
    Analyzes a list of timestamps to find the distribution of activity by hour.

    Args:
        timestamps: A list of timezone-aware datetime objects.

    Returns:
        A dictionary mapping each hour (0-23) to the number of activities
        that occurred during that hour.
    """
    hourly_activity = defaultdict(int)
    for ts in timestamps:
        hourly_activity[ts.hour] += 1
    return hourly_activity

def find_optimal_window(hourly_activity: Dict[int, int], window_hours: int) -> Tuple[int, int]:
    """
    Finds the most active continuous time window.

    This function slides a window of `window_hours` across the 24-hour day
    to find the block of time with the highest cumulative activity.

    Args:
        hourly_activity: A dict mapping hours to activity counts.
        window_hours: The desired length of the productivity window.

    Returns:
        A tuple containing:
        - The best starting hour for the window.
        - The total activity count within that best window.
    """
    if not hourly_activity:
        return 0, 0

    max_activity = -1
    best_start_hour = -1

    # Iterate through all possible start hours (0-23)
    for start_hour in range(24):
        current_window_activity = 0
        # Sum activity for the current window, wrapping around the 24-hour clock
        for i in range(window_hours):
            hour = (start_hour + i) % 24
            current_window_activity += hourly_activity.get(hour, 0)
        
        if current_window_activity > max_activity:
            max_activity = current_window_activity
            best_start_hour = start_hour

    return best_start_hour, max_activity

def generate_recommendation(
    optimal_start_hour: int, 
    window_hours: int, 
    user_tz: ZoneInfo,
    hourly_activity: Dict[int, int],
    total_activities: int,
    analysis_period: int
) -> Dict[str, Any]:
    """
    Generates the final recommendation and analysis output.

    Args:
        optimal_start_hour: The best local hour to start the session.
        window_hours: The duration of the session in hours.
        user_tz: The user's timezone.
        hourly_activity: Dict of activity counts per hour.
        total_activities: Total number of activities analyzed.
        analysis_period: The number of days included in the analysis.

    Returns:
        A dictionary containing the full, structured recommendation.
    """
    now = datetime.now(user_tz)
    
    # Calculate start and end times for the next available slot
    start_time_local = now.replace(hour=optimal_start_hour, minute=0, second=0, microsecond=0)
    # If the suggested start time has already passed today, schedule for tomorrow
    if start_time_local < now:
        start_time_local += timedelta(days=1)
    
    end_time_local = start_time_local + timedelta(hours=window_hours)

    # Convert to UTC for unambiguous, portable representation
    start_time_utc = start_time_local.astimezone(timezone.utc)
    end_time_utc = end_time_local.astimezone(timezone.utc)
    
    # Find single most active hour for metadata
    most_active_hour_local = max(hourly_activity, key=hourly_activity.get) if hourly_activity else -1

    peak_hours_local = [(optimal_start_hour + i) % 24 for i in range(window_hours)]
    peak_hours_utc = [start_time_utc.hour + i for i in range(window_hours)] # simplified; could cross day boundary

    return {
        "status": "success",
        "recommendation": {
            "recommended_session_start_utc": start_time_utc.isoformat().replace('+00:00', 'Z'),
            "recommended_session_end_utc": end_time_utc.isoformat().replace('+00:00', 'Z'),
            "recommended_session_start_local": start_time_local.strftime('%Y-%m-%d %H:%M:%S'),
            "recommended_session_end_local": end_time_local.strftime('%Y-%m-%d %H:%M:%S'),
            "timezone": str(user_tz)
        },
        "analysis": {
            "peak_hours_local": peak_hours_local,
            "peak_hours_utc_approx": [t % 24 for t in peak_hours_utc],
            "most_active_hour_local": most_active_hour_local,
            "total_activities_analyzed": total_activities,
            "analysis_period_days": analysis_period,
            "hourly_activity_distribution_local": hourly_activity
        }
    }


def main():
    """
    Main function to execute the scheduler logic.
    """
    parser = argparse.ArgumentParser(description="Claude Timezone Scheduler")
    parser.add_argument(
        '-c', '--config',
        default=DEFAULT_CONFIG_PATH,
        help=f"Path to the configuration file. Defaults to '{DEFAULT_CONFIG_PATH}'."
    )
    args = parser.parse_args()

    # 1. Load Configuration
    config = load_config(args.config)
    if not config:
        exit(1)

    user_tz = ZoneInfo(config["user_timezone"])
    log_file = config["log_file_path"]
    period = config["analysis_period_days"]
    window = config["productivity_window_hours"]

    # 2. Parse Logs
    timestamps, parse_errors = parse_activity_logs(log_file, period, user_tz)
    
    if not timestamps:
        result = {
            "status": "error",
            "message": "No valid activity logs found within the analysis period.",
            "details": parse_errors if parse_errors else f"Could not find or parse log file at '{log_file}'."
        }
        print(json.dumps(result, indent=2))
        exit(1)

    # 3. Analyze Activity
    hourly_activity = analyze_activity(timestamps)
    
    # 4. Find Optimal Window
    optimal_start_hour, _ = find_optimal_window(hourly_activity, window)

    # 5. Generate and Output Recommendation
    recommendation = generate_recommendation(
        optimal_start_hour=optimal_start_hour,
        window_hours=window,
        user_tz=user_tz,
        hourly_activity=hourly_activity,
        total_activities=len(timestamps),
        analysis_period=period
    )
    
    print(json.dumps(recommendation, indent=2))


if __name__ == "__main__":
    main()
