#!/usr/bin/env python3
"""
Workspace Health Monitor
Monitors project health, staleness, and workspace churn metrics.
"""

import json
import sys
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.git_parser import GitParser
from utils.dashboard import Dashboard, Colors


class Project:
    """Represents a single project in the workspace."""
    
    def __init__(self, path: Path):
        self.path = path
        self.name = path.name
        self.last_modified = None
        self.size_bytes = 0
        self.file_count = 0
        self.is_git_repo = False
        self.last_commit_date = None
        self.commit_count = 0
        self.days_since_modified = None
        self.days_since_commit = None
        self.health_score = 0
        
        self._analyze()
    
    def _analyze(self):
        """Analyze project health."""
        # File system metrics
        self._analyze_filesystem()
        
        # Git metrics
        self._analyze_git()
        
        # Calculate health score
        self._calculate_health()
    
    def _analyze_filesystem(self):
        """Analyze filesystem metrics."""
        if not self.path.exists():
            return
        
        # Find all files (excluding hidden and build artifacts)
        files = []
        for item in self.path.rglob('*'):
            if item.is_file():
                # Skip hidden, build artifacts, dependencies
                if any(part.startswith('.') for part in item.parts):
                    continue
                if any(part in ['node_modules', '__pycache__', 'venv', 'dist', 'build'] 
                       for part in item.parts):
                    continue
                
                files.append(item)
                self.size_bytes += item.stat().st_size
        
        self.file_count = len(files)
        
        # Find most recent modification
        if files:
            most_recent = max(files, key=lambda f: f.stat().st_mtime)
            self.last_modified = datetime.fromtimestamp(most_recent.stat().st_mtime)
            self.days_since_modified = (datetime.now() - self.last_modified).days
    
    def _analyze_git(self):
        """Analyze git repository."""
        git_dir = self.path / '.git'
        if not git_dir.exists():
            return
        
        self.is_git_repo = True
        
        try:
            parser = GitParser(str(self.path))
            commits = parser.get_commits(max_count=100)
            
            if commits:
                self.last_commit_date = commits[0].date
                self.days_since_commit = (datetime.now() - self.last_commit_date).days
                self.commit_count = len(commits)
        except:
            pass
    
    def _calculate_health(self):
        """Calculate project health score (0-100)."""
        score = 100
        
        # Penalize for staleness
        if self.days_since_modified is not None:
            if self.days_since_modified > 90:
                score -= 40
            elif self.days_since_modified > 30:
                score -= 20
            elif self.days_since_modified > 7:
                score -= 10
        
        # Penalize for stale commits
        if self.is_git_repo and self.days_since_commit is not None:
            if self.days_since_commit > 60:
                score -= 30
            elif self.days_since_commit > 30:
                score -= 15
        
        # Bonus for git repo
        if self.is_git_repo:
            score += 10
        
        # Bonus for recent activity
        if self.days_since_modified is not None and self.days_since_modified < 7:
            score += 10
        
        # Penalize empty projects
        if self.file_count < 3:
            score -= 20
        
        self.health_score = max(0, min(100, score))
    
    def get_status(self) -> str:
        """Get human-readable status."""
        if self.health_score >= 80:
            return "healthy"
        elif self.health_score >= 60:
            return "active"
        elif self.health_score >= 40:
            return "stale"
        else:
            return "abandoned"
    
    def __repr__(self):
        return f"<Project {self.name} (health: {self.health_score})>"


class HealthMonitor:
    """Monitor workspace health and project status."""
    
    def __init__(self, workspace_path: str):
        """Initialize health monitor."""
        self.workspace_path = Path(workspace_path)
        self.projects_dir = self.workspace_path / 'projects'
        self.dashboard = Dashboard(width=90)
    
    def find_projects(self) -> List[Project]:
        """Find all projects in workspace."""
        if not self.projects_dir.exists():
            return []
        
        projects = []
        
        for item in self.projects_dir.iterdir():
            if item.is_dir() and not item.name.startswith('.'):
                try:
                    project = Project(item)
                    projects.append(project)
                except Exception:
                    continue
        
        return projects
    
    def calculate_workspace_metrics(self, projects: List[Project]) -> Dict:
        """Calculate aggregate workspace metrics."""
        if not projects:
            return {
                'total_projects': 0,
                'active_projects': 0,
                'stale_projects': 0,
                'abandoned_projects': 0,
                'total_size_mb': 0,
                'total_files': 0,
                'avg_health_score': 0
            }
        
        by_status = {'healthy': 0, 'active': 0, 'stale': 0, 'abandoned': 0}
        
        total_size = 0
        total_files = 0
        total_health = 0
        
        for project in projects:
            by_status[project.get_status()] += 1
            total_size += project.size_bytes
            total_files += project.file_count
            total_health += project.health_score
        
        return {
            'total_projects': len(projects),
            'healthy_projects': by_status['healthy'],
            'active_projects': by_status['active'],
            'stale_projects': by_status['stale'],
            'abandoned_projects': by_status['abandoned'],
            'total_size_mb': total_size / (1024 * 1024),
            'total_files': total_files,
            'avg_health_score': total_health / len(projects),
            'health_rate': (by_status['healthy'] + by_status['active']) / len(projects) * 100
        }
    
    def calculate_churn_metrics(self, projects: List[Project], days: int = 30) -> Dict:
        """Calculate workspace churn metrics."""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        recently_modified = [
            p for p in projects 
            if p.last_modified and p.last_modified >= cutoff_date
        ]
        
        recently_committed = [
            p for p in projects 
            if p.last_commit_date and p.last_commit_date >= cutoff_date
        ]
        
        git_repos = [p for p in projects if p.is_git_repo]
        
        # Calculate churn rate (projects touched / total)
        churn_rate = len(recently_modified) / len(projects) * 100 if projects else 0
        
        return {
            'period_days': days,
            'recently_modified': len(recently_modified),
            'recently_committed': len(recently_committed),
            'churn_rate': churn_rate,
            'git_repos': len(git_repos),
            'git_adoption_rate': len(git_repos) / len(projects) * 100 if projects else 0,
            'active_projects': [p.name for p in recently_modified]
        }
    
    def identify_stale_projects(self, projects: List[Project], 
                               days_threshold: int = 30) -> List[Project]:
        """Identify stale or abandoned projects."""
        stale = []
        
        for project in projects:
            # Check file modification staleness
            if project.days_since_modified and project.days_since_modified > days_threshold:
                stale.append(project)
            # Or git commit staleness
            elif project.is_git_repo and project.days_since_commit and \
                 project.days_since_commit > days_threshold:
                stale.append(project)
        
        return sorted(stale, key=lambda p: p.days_since_modified or 0, reverse=True)
    
    def render_dashboard(self) -> str:
        """Render workspace health dashboard."""
        projects = self.find_projects()
        metrics = self.calculate_workspace_metrics(projects)
        churn = self.calculate_churn_metrics(projects, days=30)
        stale = self.identify_stale_projects(projects, days_threshold=30)
        
        lines = []
        
        # Header
        lines.append(self.dashboard.header(
            "🏥 Workspace Health Monitor",
            f"Analyzing {metrics['total_projects']} projects"
        ))
        
        # Overall health
        lines.append(self.dashboard.section("Overall Health"))
        
        health_color = Colors.BRIGHT_GREEN if metrics['avg_health_score'] >= 70 else \
                      Colors.BRIGHT_YELLOW if metrics['avg_health_score'] >= 50 else \
                      Colors.BRIGHT_RED
        
        lines.append(self.dashboard.key_value(
            "Average Health Score", 
            f"{metrics['avg_health_score']:.1f}/100",
            value_color=health_color
        ))
        lines.append(self.dashboard.key_value(
            "Health Rate", 
            f"{metrics['health_rate']:.1f}%",
            value_color=health_color
        ))
        
        lines.append("")
        lines.append(self.dashboard.key_value(
            "Healthy Projects", 
            metrics['healthy_projects'],
            value_color=Colors.BRIGHT_GREEN
        ))
        lines.append(self.dashboard.key_value(
            "Active Projects", 
            metrics['active_projects'],
            value_color=Colors.BRIGHT_CYAN
        ))
        lines.append(self.dashboard.key_value(
            "Stale Projects", 
            metrics['stale_projects'],
            value_color=Colors.BRIGHT_YELLOW
        ))
        lines.append(self.dashboard.key_value(
            "Abandoned Projects", 
            metrics['abandoned_projects'],
            value_color=Colors.BRIGHT_RED
        ))
        
        # Workspace metrics
        lines.append(self.dashboard.section("Workspace Metrics"))
        
        lines.append(self.dashboard.key_value(
            "Total Size", 
            f"{metrics['total_size_mb']:.1f} MB",
            value_color=Colors.BRIGHT_WHITE
        ))
        lines.append(self.dashboard.key_value(
            "Total Files", 
            metrics['total_files'],
            value_color=Colors.BRIGHT_WHITE
        ))
        lines.append(self.dashboard.key_value(
            "Git Repositories", 
            f"{churn['git_repos']} ({churn['git_adoption_rate']:.0f}%)",
            value_color=Colors.BRIGHT_CYAN
        ))
        
        # Churn metrics
        lines.append(self.dashboard.section("Activity (Past 30 Days)"))
        
        lines.append(self.dashboard.key_value(
            "Projects Modified", 
            churn['recently_modified'],
            value_color=Colors.BRIGHT_GREEN
        ))
        lines.append(self.dashboard.key_value(
            "Projects Committed", 
            churn['recently_committed'],
            value_color=Colors.BRIGHT_CYAN
        ))
        lines.append(self.dashboard.key_value(
            "Workspace Churn Rate", 
            f"{churn['churn_rate']:.1f}%",
            value_color=Colors.BRIGHT_YELLOW
        ))
        
        # Project details
        if projects:
            lines.append(self.dashboard.section("Project Details"))
            
            # Sort by health score
            sorted_projects = sorted(projects, key=lambda p: p.health_score, reverse=True)
            
            rows = []
            for project in sorted_projects[:15]:  # Top 15
                status = project.get_status()
                status_colors = {
                    'healthy': Colors.BRIGHT_GREEN,
                    'active': Colors.BRIGHT_CYAN,
                    'stale': Colors.BRIGHT_YELLOW,
                    'abandoned': Colors.BRIGHT_RED
                }
                status_colored = self.dashboard.color(status, status_colors[status])
                
                last_activity = "never"
                if project.last_commit_date:
                    last_activity = f"{project.days_since_commit}d ago"
                elif project.last_modified:
                    last_activity = f"{project.days_since_modified}d ago"
                
                git_indicator = "✓" if project.is_git_repo else "✗"
                
                rows.append([
                    project.name[:30],
                    f"{project.health_score}",
                    status_colored,
                    last_activity,
                    git_indicator
                ])
            
            lines.append(self.dashboard.table(
                headers=['Project', 'Health', 'Status', 'Last Activity', 'Git'],
                rows=rows,
                alignments=['l', 'r', 'l', 'r', 'c']
            ))
        
        # Stale projects warning
        if stale:
            lines.append(self.dashboard.section("⚠️  Stale Projects"))
            lines.append(self.dashboard.alert(
                f"These {len(stale)} projects haven't been touched in 30+ days:",
                level='warning'
            ))
            
            for project in stale[:10]:
                days = project.days_since_commit if project.is_git_repo else project.days_since_modified
                lines.append(f"    • {project.name}: {days} days ago")
        
        # Footer
        lines.append("")
        lines.append(self.dashboard.footer("Workspace health check complete"))
        
        return '\n'.join(lines)
    
    def export_json(self, output_file: Optional[str] = None) -> str:
        """Export health data as JSON."""
        projects = self.find_projects()
        metrics = self.calculate_workspace_metrics(projects)
        churn = self.calculate_churn_metrics(projects, days=30)
        
        data = {
            'timestamp': datetime.now().isoformat(),
            'metrics': metrics,
            'churn': churn,
            'projects': [
                {
                    'name': p.name,
                    'health_score': p.health_score,
                    'status': p.get_status(),
                    'last_modified': p.last_modified.isoformat() if p.last_modified else None,
                    'days_since_modified': p.days_since_modified,
                    'is_git_repo': p.is_git_repo,
                    'last_commit_date': p.last_commit_date.isoformat() if p.last_commit_date else None,
                    'days_since_commit': p.days_since_commit,
                    'file_count': p.file_count,
                    'size_mb': p.size_bytes / (1024 * 1024)
                }
                for p in projects
            ]
        }
        
        json_str = json.dumps(data, indent=2)
        
        if output_file:
            with open(output_file, 'w') as f:
                f.write(json_str)
        
        return json_str


def main():
    """CLI entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Monitor workspace health')
    parser.add_argument('--workspace', default='/Users/jasontang/clawd',
                       help='Workspace directory path')
    parser.add_argument('--json', action='store_true',
                       help='Output as JSON')
    parser.add_argument('--output', help='Output file for JSON export')
    
    args = parser.parse_args()
    
    monitor = HealthMonitor(args.workspace)
    
    if args.json:
        print(monitor.export_json(output_file=args.output))
    else:
        print(monitor.render_dashboard())


if __name__ == '__main__':
    main()
