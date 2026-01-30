# claude-pattern-detector
#
# Description:
# A script that analyzes the git commit history of a repository to identify
# personal development patterns. It extracts data such as commit frequency,
# file types modified, and keywords from commit messages to generate a report
# on coding habits and project focus over time.
#
# This tool is designed to be used by an automated agent (like Claude) and
# outputs a structured JSON report to stdout for easy parsing.

import os
import json
import argparse
import collections
import re
from datetime import datetime
import sys

try:
    import git
except ImportError:
    print("Error: GitPython is not installed. Please install it with 'pip install GitPython'", file=sys.stderr)
    sys.exit(1)

# Common English stop words to filter from commit messages.
# This helps in identifying more meaningful keywords.
STOP_WORDS = {
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', "aren't", 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
    'can', "can't", 'cannot', 'com', 'could', "couldn't",
    'did', "didn't", 'do', 'does', "doesn't", 'doing', "don't", 'down', 'during',
    'each',
    'few', 'for', 'from', 'further',
    'had', "hadn't", 'has', "hasn't", 'have', "haven't", 'having', 'he', "he'd", "he'll", "he's", 'her', 'here',
    "here's", 'hers', 'herself', 'him', 'himself', 'his', 'how', "how's",
    'i', "i'd", "i'll", "i'm", "i've", 'if', 'in', 'into', 'is', "isn't", 'it', "it's", 'its', 'itself',
    "let's",
    'me', 'merge', 'more', 'most', "mustn't", 'my', 'myself',
    'no', 'nor', 'not',
    'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
    'r',
    'same', "shan't", 'she', "she'd", "she'll", "she's", 'should', "shouldn't", 'so', 'some', 'such',
    'than', 'that', "that's", 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', "there's", 'these',
    'they', "they'd", "they'll", "they're", "they've", 'this', 'those', 'through', 'to', 'too',
    'under', 'until', 'up',
    'very',
    'was', "wasn't", 'we', "we'd", "we'll", "we're", "we've", 'were', "weren't", 'what', "what's", 'when', "when's",
    'where', "where's", 'which', 'while', 'who', "who's", 'whom', 'why', "why's", 'with', "won't", 'would', "wouldn't",
    'www',
    'you', "you'd", "you'll", "you're", "you've", 'your', 'yours', 'yourself', 'yourselves'
}


def analyze_repository(repo_path, max_commits):
    """
    Analyzes a git repository to extract development patterns.

    Args:
        repo_path (str): The file path to the git repository.
        max_commits (int): The maximum number of commits to analyze.

    Returns:
        dict: A dictionary containing the analysis report.
              Returns None if the repository is invalid.
    """
    try:
        repo = git.Repo(repo_path, search_parent_directories=True)
    except git.InvalidGitRepositoryError:
        print(f"Error: '{repo_path}' is not a valid git repository.", file=sys.stderr)
        return None
    except git.NoSuchPathError:
        print(f"Error: Path '{repo_path}' does not exist.", file=sys.stderr)
        return None

    # --- Data Collection Structures ---
    commit_frequency_by_day = collections.Counter()
    commit_frequency_by_hour = collections.Counter()
    file_type_distribution = collections.Counter()
    commit_message_keywords = collections.Counter()
    # Using a dict of Counters for easier aggregation
    focus_over_time = collections.defaultdict(collections.Counter)

    print(f"Analyzing up to {max_commits} commits in '{repo.working_tree_dir}'...", file=sys.stderr)
    
    commits = list(repo.iter_commits('HEAD', max_count=max_commits))
    total_commits = len(commits)

    for i, commit in enumerate(commits):
        # Print progress to stderr to keep stdout clean for JSON output
        if (i + 1) % 100 == 0 or i + 1 == total_commits:
            print(f"Processing commit {i + 1}/{total_commits}...", file=sys.stderr)

        # 1. Analyze commit frequency
        commit_dt = commit.committed_datetime
        commit_date_str = commit_dt.strftime('%Y-%m-%d')
        commit_frequency_by_day[commit_date_str] += 1
        commit_frequency_by_hour[commit_dt.hour] += 1

        # 2. Analyze commit message keywords
        # Normalize message: lowercase, split into words, filter stop words
        message = commit.message.lower()
        words = re.findall(r'\b\w+\b', message)
        filtered_words = [word for word in words if word not in STOP_WORDS and not word.isdigit()]
        commit_message_keywords.update(filtered_words)

        # 3. Analyze file types and project focus
        # Use parent diff to get files changed in this commit
        try:
            # The first commit has no parent
            if not commit.parents:
                continue

            # We access the stats of the diff between the commit and its first parent.
            diffs = commit.parents[0].diff(commit, create_patch=False)
            
            for diff_item in diffs:
                # file_path is available in diff_item.a_path or diff_item.b_path
                file_path = diff_item.a_path or diff_item.b_path
                if not file_path:
                    continue
                
                _, ext = os.path.splitext(file_path)

                # Ignore files without extensions or dotfiles with no extension
                if ext and len(ext) > 1:
                    file_type_distribution[ext] += 1
                    focus_over_time[commit_date_str][ext] += 1
        except Exception as e:
            # This can happen for complex histories, octopus merges etc.
            # We log the error and continue, to not fail the whole analysis.
            print(f"Warning: Could not process diff for commit {commit.hexsha}. Error: {e}", file=sys.stderr)


    # --- Report Generation ---
    print("Generating report...", file=sys.stderr)

    # Convert focus_over_time to a more serializable format (list of dicts)
    # Sorting by date to make it a proper timeline
    sorted_focus = sorted(focus_over_time.items(), key=lambda item: item[0])
    focus_timeline = [
        {"date": date, "file_types": dict(counts)} for date, counts in sorted_focus
    ]

    report = {
        "analysis_metadata": {
            "repository_path": repo.working_tree_dir,
            "analysis_timestamp_utc": datetime.utcnow().isoformat(),
            "total_commits_analyzed": total_commits,
            "commit_range_start_time_utc": commits[-1].committed_datetime.isoformat() if commits else None,
            "commit_range_end_time_utc": commits[0].committed_datetime.isoformat() if commits else None,
        },
        "commit_frequency": {
            "by_day": dict(commit_frequency_by_day.most_common()),
            "by_hour_of_day_utc": dict(sorted(commit_frequency_by_hour.items())),
        },
        "file_type_distribution": dict(file_type_distribution.most_common(30)),
        "commit_message_keywords": dict(commit_message_keywords.most_common(50)),
        "project_focus_timeline": focus_timeline
    }

    return report


def main():
    """
    Main function to parse arguments and run the analysis.
    """
    parser = argparse.ArgumentParser(
        description="Analyzes git commit history to find development patterns.",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument(
        'repo_path',
        nargs='?',
        default='.',
        help='Path to the git repository. Defaults to the current directory.'
    )
    parser.add_argument(
        '--max-commits',
        type=int,
        default=1000,
        help='Maximum number of commits to analyze. Defaults to 1000.'
    )

    args = parser.parse_args()

    # The tool is designed to be used in a pipeline.
    # It prints progress to stderr and the final JSON report to stdout.
    report = analyze_repository(args.repo_path, args.max_commits)

    if report:
        # Print the final report as a JSON string to standard output.
        # This is the primary output for programmatic use.
        print(json.dumps(report, indent=2))
    else:
        # If the analysis failed, exit with a non-zero status code.
        sys.exit(1)


if __name__ == '__main__':
    main()
