# scheduler.py
import argparse
import json
from collections import Counter
from datetime import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from dateutil import parser as date_parser

def parse_log_file(file_path: str) -> list[datetime]:
    """
    Parses a log file containing one ISO 8601 timestamp per line.

    Args:
        file_path: The path to the log file.

    Returns:
        A list of datetime objects from the valid lines in the log file.
        Timestamps are assumed to be in UTC.
    """
    timestamps = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    # Use dateutil.parser to handle ISO 8601 format robustly
                    ts = date_parser.isoparse(line)
                    if ts.tzinfo is None:
                        # If timestamp is naive, assume it's UTC as per spec
                        ts = ts.replace(tzinfo=ZoneInfo("UTC"))
                    timestamps.append(ts)
                except ValueError:
                    # Ignore lines that cannot be parsed as a valid date
                    # In a real scenario, we might want to log this as a warning
                    pass
    except FileNotFoundError:
        # Proper error handling if log file does not exist.
        print(f"Error: Log file not found at '{file_path}'")
        return []
    return timestamps

def build_productivity_histogram(timestamps: list[datetime]) -> Counter:
    """
    Builds a histogram of activity by hour of the day (in UTC).

    Args:
        timestamps: A list of datetime objects.

    Returns:
        A Counter object mapping each hour (0-23) to the number of log entries
        in that hour.
    """
    # Convert all timestamps to UTC before extracting the hour
    utc_hours = [ts.astimezone(ZoneInfo("UTC")).hour for ts in timestamps]
    return Counter(utc_hours)

def get_peak_hours(histogram: Counter, top_n: int) -> list[int]:
    """
    Identifies the most frequent hours from a productivity histogram.

    Args:
        histogram: A Counter object mapping hour to activity count.
        top_n: The number of peak hours to return.

    Returns:
        A list of the top N most productive hours, sorted by activity count
        in descending order.
    """
    return [hour for hour, count in histogram.most_common(top_n)]

def generate_report(
    log_file: str,
    timestamps: list,
    histogram: Counter,
    peak_hours_utc: list[int],
    target_timezone: str | None,
) -> dict:
    """
    Generates a structured report of the productivity analysis.

    Args:
        log_file: Path to the log file that was analyzed.
        timestamps: The list of parsed timestamps.
        histogram: The productivity histogram in UTC.
        peak_hours_utc: A list of the most productive hours in UTC.
        target_timezone: The IANA timezone string for local time conversion.

    Returns:
        A dictionary containing the full analysis and recommendations.
    """
    report = {
        "metadata": {
            "log_file_analyzed": log_file,
            "total_log_entries": len(timestamps),
            "analysis_timestamp_utc": datetime.utcnow().isoformat() + "Z",
        },
        "analysis": {
            "productivity_histogram_utc": {
                f"{hour:02d}": histogram.get(hour, 0) for hour in range(24)
            }
        },
        "recommendations": {
            "peak_hours_utc": sorted(peak_hours_utc),
            "recommended_schedule_utc": [
                {"start": f"{hour:02d}:00", "end": f"{hour+1:02d}:00", "timezone": "UTC"}
                for hour in sorted(peak_hours_utc)
            ]
        },
    }

    if target_timezone:
        try:
            local_tz = ZoneInfo(target_timezone)
            # Create a dummy date to convert hours between timezones
            dummy_date_utc = datetime.now(ZoneInfo("UTC"))
            peak_hours_local = [
                dummy_date_utc.replace(hour=h).astimezone(local_tz).hour
                for h in peak_hours_utc
            ]
            report["recommendations"]["target_timezone"] = target_timezone
            report["recommendations"]["peak_hours_local"] = sorted(peak_hours_local)
            report["recommendations"]["recommended_schedule_local"] = [
                {"start": f"{hour:02d}:00", "end": f"{hour+1:02d}:00", "timezone": target_timezone}
                for hour in sorted(peak_hours_local)
            ]
        except ZoneInfoNotFoundError:
            report["recommendations"]["timezone_error"] = f"Timezone '{target_timezone}' not found."

    return report

def main():
    """
    Main function to run the scheduler analysis.
    Parses command-line arguments, runs the analysis, and prints a JSON report.
    """
    arg_parser = argparse.ArgumentParser(
        description="Analyzes activity logs to recommend a productive schedule."
    )
    arg_parser.add_argument(
        "--log-file",
        required=True,
        help="Path to the timestamped activity log file.",
    )
    arg_parser.add_argument(
        "--timezone",
        default=None,
        help="Optional: IANA timezone name (e.g., 'America/New_York') to generate local time recommendations.",
    )
    arg_parser.add_argument(
        "--top-n",
        type=int,
        default=3,
        help="Number of peak hours to recommend.",
    )
    args = arg_parser.parse_args()

    timestamps = parse_log_file(args.log_file)
    if not timestamps:
        # Error message for file not found is printed in parse_log_file
        # If file is empty or all lines are invalid, we exit silently.
        return

    histogram = build_productivity_histogram(timestamps)
    peak_hours = get_peak_hours(histogram, args.top_n)

    report = generate_report(
        log_file=args.log_file,
        timestamps=timestamps,
        histogram=histogram,
        peak_hours_utc=peak_hours,
        target_timezone=args.timezone,
    )

    print(json.dumps(report, indent=4))

if __name__ == "__main__":
    main()
