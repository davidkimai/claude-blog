#!/usr/bin/env python3
"""
Git Parser Utility
Parses git history for commit analysis, skill usage patterns, and learning velocity.
"""

import subprocess
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Optional, Tuple


class GitCommit:
    """Represents a single git commit with parsed metadata."""
    
    def __init__(self, hash: str, author: str, date: datetime, message: str):
        self.hash = hash
        self.author = author
        self.date = date
        self.message = message
        self.files_changed = []
        self.insertions = 0
        self.deletions = 0
        
    def __repr__(self):
        return f"<GitCommit {self.hash[:7]} '{self.message[:50]}'>"


class GitParser:
    """Parse git repository history and extract intelligence."""
    
    def __init__(self, repo_path: str = None):
        """Initialize with repository path (defaults to current directory)."""
        self.repo_path = Path(repo_path) if repo_path else Path.cwd()
        
    def is_git_repo(self) -> bool:
        """Check if the path is a valid git repository."""
        try:
            result = subprocess.run(
                ['git', 'rev-parse', '--git-dir'],
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False
    
    def get_commits(self, since: Optional[datetime] = None, 
                   until: Optional[datetime] = None,
                   max_count: Optional[int] = None) -> List[GitCommit]:
        """
        Retrieve commits from git history.
        
        Args:
            since: Start date (inclusive)
            until: End date (inclusive)
            max_count: Maximum number of commits to retrieve
            
        Returns:
            List of GitCommit objects
        """
        if not self.is_git_repo():
            return []
        
        cmd = [
            'git', 'log',
            '--pretty=format:%H%x00%an%x00%ai%x00%s%x00%b%x00',
            '--numstat'
        ]
        
        if since:
            cmd.append(f'--since={since.isoformat()}')
        if until:
            cmd.append(f'--until={until.isoformat()}')
        if max_count:
            cmd.append(f'--max-count={max_count}')
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                return []
            
            return self._parse_git_log(result.stdout)
            
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return []
    
    def _parse_git_log(self, output: str) -> List[GitCommit]:
        """Parse git log output into GitCommit objects."""
        commits = []
        
        # Split by null separator pattern
        entries = output.split('\x00\x00')
        
        for entry in entries:
            if not entry.strip():
                continue
                
            parts = entry.split('\x00')
            if len(parts) < 4:
                continue
            
            try:
                hash_val = parts[0].strip()
                author = parts[1].strip()
                date_str = parts[2].strip()
                message = parts[3].strip()
                
                # Parse date
                date = datetime.fromisoformat(date_str.replace(' ', 'T', 1).rsplit(' ', 1)[0])
                
                commit = GitCommit(hash_val, author, date, message)
                
                # Parse numstat data (file changes)
                if len(parts) > 5:
                    stat_lines = parts[5].strip().split('\n')
                    for line in stat_lines:
                        if not line.strip():
                            continue
                        stat_parts = line.split('\t')
                        if len(stat_parts) >= 3:
                            try:
                                insertions = int(stat_parts[0]) if stat_parts[0] != '-' else 0
                                deletions = int(stat_parts[1]) if stat_parts[1] != '-' else 0
                                filename = stat_parts[2]
                                
                                commit.insertions += insertions
                                commit.deletions += deletions
                                commit.files_changed.append(filename)
                            except ValueError:
                                pass
                
                commits.append(commit)
                
            except (ValueError, IndexError):
                continue
        
        return commits
    
    def get_commit_frequency(self, days: int = 30) -> Dict[str, int]:
        """Get commit frequency by date over the past N days."""
        since = datetime.now() - timedelta(days=days)
        commits = self.get_commits(since=since)
        
        frequency = {}
        for commit in commits:
            date_key = commit.date.strftime('%Y-%m-%d')
            frequency[date_key] = frequency.get(date_key, 0) + 1
        
        return frequency
    
    def get_file_change_stats(self, days: int = 30) -> Dict[str, Dict[str, int]]:
        """Get statistics on which files/directories are changing most."""
        since = datetime.now() - timedelta(days=days)
        commits = self.get_commits(since=since)
        
        stats = {}
        for commit in commits:
            for filepath in commit.files_changed:
                if filepath not in stats:
                    stats[filepath] = {'commits': 0, 'insertions': 0, 'deletions': 0}
                stats[filepath]['commits'] += 1
        
        return stats
    
    def search_commits(self, pattern: str, days: int = 90) -> List[GitCommit]:
        """Search commit messages matching a regex pattern."""
        since = datetime.now() - timedelta(days=days)
        commits = self.get_commits(since=since)
        
        regex = re.compile(pattern, re.IGNORECASE)
        return [c for c in commits if regex.search(c.message)]
    
    def get_commit_velocity(self, window_days: int = 7, lookback_days: int = 90) -> List[Tuple[str, int]]:
        """
        Calculate commit velocity over time using a rolling window.
        
        Returns:
            List of (date, commit_count) tuples
        """
        since = datetime.now() - timedelta(days=lookback_days)
        commits = self.get_commits(since=since)
        
        # Group commits by date
        by_date = {}
        for commit in commits:
            date_key = commit.date.strftime('%Y-%m-%d')
            by_date[date_key] = by_date.get(date_key, 0) + 1
        
        # Calculate rolling window
        velocity = []
        start_date = since.date()
        end_date = datetime.now().date()
        
        current = start_date
        while current <= end_date:
            window_start = current - timedelta(days=window_days)
            window_commits = sum(
                count for date_str, count in by_date.items()
                if window_start <= datetime.strptime(date_str, '%Y-%m-%d').date() <= current
            )
            velocity.append((current.isoformat(), window_commits))
            current += timedelta(days=1)
        
        return velocity


if __name__ == '__main__':
    # Quick test
    parser = GitParser()
    if parser.is_git_repo():
        commits = parser.get_commits(max_count=10)
        print(f"Found {len(commits)} recent commits:")
        for c in commits[:5]:
            print(f"  {c.hash[:7]} - {c.message[:60]}")
    else:
        print("Not a git repository")
