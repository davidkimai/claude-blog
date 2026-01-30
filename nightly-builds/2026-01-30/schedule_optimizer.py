import os
import argparse
import subprocess
import json
from datetime import datetime
import pandas as pd
import sys

# --- Constants ---
LOG_DIR_DEFAULT = 'claude-hours'
GIT_LOG_COMMAND = "git log --pretty=format:%at"

class ClaudeScheduleOptimizer:
    """
    Analyzes git commit history in a specified directory to identify productivity patterns.
    It generates a report suggesting an optimized schedule based on commit frequency.
    """

    def __init__(self, log_dir, days_history):
        """
        Initializes the optimizer.

        Args:
            log_dir (str): The directory containing the activity logs (git repository).
            days_history (int): The number of days of history to analyze.
        """
        self.log_dir = log_dir
        self.days_history = days_history
        self.since_date = (datetime.now() - pd.Timedelta(days=days_history)).strftime('%Y-%m-%d')
        self.activity_data = []

    def _validate_directory(self):
        """
        Checks if the provided directory exists and is a git repository.
        """
        if not os.path.isdir(self.log_dir):
            raise FileNotFoundError(f"Error: Directory '{self.log_dir}' not found.")
        
        git_check_command = ["git", "rev-parse", "--is-inside-work-tree"]
        try:
            # Check if we are in a git repository.
            subprocess.run(
                git_check_command,
                check=True,
                capture_output=True,
                text=True,
                cwd=os.path.dirname(os.path.abspath(self.log_dir)) or '.'
            )
        except (subprocess.CalledProcessError, FileNotFoundError):
            raise EnvironmentError(f"Error: Directory '{self.log_dir}' is not part of a git repository.")

    def fetch_commit_timestamps(self):
        """
        Fetches commit timestamps from the git log for the specified directory.
        """
        command = f"{GIT_LOG_COMMAND} --since={self.since_date} -- {self.log_dir}"
        try:
            result = subprocess.run(
                command,
                shell=True,
                check=True,
                capture_output=True,
                text=True
            )
            timestamps = result.stdout.strip().split('\n')
            # Filter out empty strings that can result from no commits
            self.activity_data = [int(ts) for ts in timestamps if ts]
        except subprocess.CalledProcessError as e:
            # It's possible for a directory to have no commits, which is not a fatal error.
            if e.returncode == 128 and 'does not have any commits' in e.stderr:
                 self.activity_data = []
            else:
                print(f"Error fetching git log: {e.stderr}", file=sys.stderr)
                self.activity_data = []
        except ValueError:
            print(f"Error: Could not parse commit timestamps.", file=sys.stderr)
            self.activity_data = []


    def analyze_activity(self):
        """
        Analyzes the fetched commit timestamps to find productivity patterns.

        Returns:
            pandas.DataFrame: A DataFrame with commit data, or None if no data exists.
        """
        if not self.activity_data:
            return None

        df = pd.DataFrame(self.activity_data, columns=['unix_timestamp'])
        df['datetime'] = pd.to_datetime(df['unix_timestamp'], unit='s')
        
        # Adjust for local timezone
        df['datetime'] = df['datetime'].dt.tz_localize('UTC').dt.tz_convert(None)

        df['day_of_week'] = df['datetime'].dt.day_name()
        df['hour'] = df['datetime'].dt.hour
        return df

    def generate_report(self, analysis_df):
        """
        Generates a JSON report with a productivity heatmap and schedule suggestions.

        Args:
            analysis_df (pandas.DataFrame): DataFrame containing the activity analysis.

        Returns:
            str: A JSON string representing the report.
        """
        if analysis_df is None or analysis_df.empty:
            return json.dumps({
                "summary": "No activity found for the given period.",
                "heatmap": {},
                "suggested_schedule": []
            }, indent=2)

        # Create a heatmap pivot table
        heatmap = analysis_df.groupby(['day_of_week', 'hour']).size().unstack(fill_value=0)
        
        # Ensure all days and hours are present for a complete heatmap
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        hours = range(24)
        heatmap = heatmap.reindex(index=days, columns=hours, fill_value=0)

        # Get suggestions for the best time slots
        activity_counts = analysis_df.groupby(['day_of_week', 'hour']).size().reset_index(name='commits')
        top_slots = activity_counts.sort_values('commits', ascending=False).head(5)

        suggested_schedule = [
            {
                "day": row['day_of_week'],
                "hour": int(row['hour']),
                "activity_score": int(row['commits'])
            }
            for _, row in top_slots.iterrows()
        ]

        report = {
            "summary": {
                "total_commits": len(analysis_df),
                "period_analyzed_days": self.days_history,
                "log_directory": self.log_dir,
            },
            "productivity_heatmap": heatmap.to_dict(),
            "suggested_schedule": suggested_schedule
        }
        
        return json.dumps(report, indent=2)
        
    def run(self):
        """
        Executes the full analysis and report generation workflow.
        """
        try:
            self._validate_directory()
            self.fetch_commit_timestamps()
            analysis_df = self.analyze_activity()
            report_json = self.generate_report(analysis_df)
            print(report_json)
        except (FileNotFoundError, EnvironmentError) as e:
            error_report = {"error": str(e)}
            print(json.dumps(error_report, indent=2), file=sys.stderr)
            sys.exit(1)


def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(description="Claude Schedule Optimizer")
    parser.add_argument(
        "--log-dir",
        type=str,
        default=LOG_DIR_DEFAULT,
        help=f"Directory containing the Claude Hours logs. Defaults to '{LOG_DIR_DEFAULT}'."
    )
    parser.add_argument(
        "--days",
        type=int,
        default=90,
        help="Number of past days to analyze. Defaults to 90."
    )
    args = parser.parse_args()

    optimizer = ClaudeScheduleOptimizer(log_dir=args.log_dir, days_history=args.days)
    optimizer.run()

if __name__ == "__main__":
    main()
