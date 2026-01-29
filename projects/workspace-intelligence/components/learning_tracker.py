#!/usr/bin/env python3
"""
Learning Progress Tracker - Measures skill acquisition and improvement velocity.
"""

import json
import re
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List, Tuple

class LearningTracker:
    """Track learning progression and skill acquisition over time."""
    
    def __init__(self, workspace_root: Path):
        self.workspace_root = Path(workspace_root)
        self.git_log = []
        self.skill_usage_history = defaultdict(list)
        self.cognitive_tags_history = defaultdict(list)
        
    def load_git_history(self, days: int = 30):
        """Load commit history from git."""
        import subprocess
        
        cmd = [
            'git', 'log',
            f'--since={days} days ago',
            '--pretty=format:%H|%at|%s',
            '--all'
        ]
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.workspace_root,
                capture_output=True,
                text=True,
                check=True
            )
            
            for line in result.stdout.strip().split('\n'):
                if '|' in line:
                    hash_val, timestamp, message = line.split('|', 2)
                    self.git_log.append({
                        'hash': hash_val,
                        'date': datetime.fromtimestamp(int(timestamp)),
                        'message': message
                    })
        except subprocess.CalledProcessError:
            pass
    
    def analyze_skill_mentions(self):
        """Extract skill mentions from commit messages."""
        skill_pattern = r'\b(skill|introspect|qmd|claude[-\s]hours|workflow|system)\b'
        
        for commit in self.git_log:
            matches = re.findall(skill_pattern, commit['message'], re.IGNORECASE)
            for match in matches:
                self.skill_usage_history[match.lower()].append(commit['date'])
    
    def analyze_cognitive_improvements(self):
        """Track cognitive tag patterns over time from self-review."""
        review_path = self.workspace_root / 'memory' / 'self-review.md'
        
        if not review_path.exists():
            return
        
        content = review_path.read_text()
        
        # Parse entries with dates
        date_pattern = r'##\s+(\d{4}-\d{2}-\d{2})'
        entry_pattern = r'###\s+\[(\d{2}:\d{2})\]\s+TAG:\s+(\w+)'
        
        current_date = None
        for match in re.finditer(date_pattern, content):
            current_date = datetime.strptime(match.group(1), '%Y-%m-%d')
        
        for match in re.finditer(entry_pattern, content):
            time_str, tag = match.groups()
            if current_date:
                self.cognitive_tags_history[tag.lower()].append(current_date)
    
    def calculate_skill_acquisition_rate(self) -> Dict[str, float]:
        """Calculate rate of new skills being used per week."""
        if not self.git_log:
            return {}
        
        weeks = defaultdict(set)
        
        for skill, dates in self.skill_usage_history.items():
            for date in dates:
                week_key = date.strftime('%Y-W%W')
                weeks[week_key].add(skill)
        
        # Calculate average skills per week
        if not weeks:
            return {'avg_skills_per_week': 0.0}
        
        total_skills = sum(len(skills) for skills in weeks.values())
        avg_rate = total_skills / len(weeks)
        
        return {
            'avg_skills_per_week': round(avg_rate, 2),
            'total_weeks': len(weeks),
            'total_skill_instances': total_skills,
            'weeks_data': {week: list(skills) for week, skills in sorted(weeks.items())}
        }
    
    def calculate_improvement_velocity(self) -> Dict[str, any]:
        """Measure improvement velocity per cognitive tag."""
        velocity = {}
        
        for tag, dates in self.cognitive_tags_history.items():
            if len(dates) < 2:
                continue
            
            sorted_dates = sorted(dates)
            
            # Calculate time between occurrences
            intervals = []
            for i in range(1, len(sorted_dates)):
                delta = (sorted_dates[i] - sorted_dates[i-1]).days
                intervals.append(delta)
            
            avg_interval = sum(intervals) / len(intervals) if intervals else 0
            
            # Trend: increasing interval = improving (fewer mistakes)
            if len(intervals) >= 2:
                recent_avg = sum(intervals[-2:]) / 2
                early_avg = sum(intervals[:2]) / 2
                trend = "improving" if recent_avg > early_avg else "declining"
            else:
                trend = "insufficient_data"
            
            velocity[tag] = {
                'occurrences': len(dates),
                'avg_days_between': round(avg_interval, 1),
                'trend': trend,
                'first_seen': sorted_dates[0].strftime('%Y-%m-%d'),
                'last_seen': sorted_dates[-1].strftime('%Y-%m-%d')
            }
        
        return velocity
    
    def generate_learning_trajectory(self) -> Dict:
        """Generate ASCII chart of learning trajectory."""
        if not self.git_log:
            return {'chart': 'No data available', 'insights': []}
        
        # Group commits by week
        weekly_commits = defaultdict(int)
        weekly_skills = defaultdict(set)
        
        for commit in self.git_log:
            week_key = commit['date'].strftime('%Y-W%W')
            weekly_commits[week_key] += 1
            
            # Extract potential skill names
            words = re.findall(r'\b\w{4,}\b', commit['message'])
            weekly_skills[week_key].update(w.lower() for w in words)
        
        # Generate ASCII chart
        weeks = sorted(weekly_commits.keys())
        if not weeks:
            return {'chart': 'No weekly data', 'insights': []}
        
        max_commits = max(weekly_commits.values())
        scale = 50 / max_commits if max_commits > 0 else 1
        
        chart_lines = []
        chart_lines.append("Learning Trajectory (Commits per Week)")
        chart_lines.append("─" * 60)
        
        for week in weeks[-8:]:  # Last 8 weeks
            count = weekly_commits[week]
            bar = "█" * int(count * scale)
            chart_lines.append(f"{week:10} {bar} {count}")
        
        chart_lines.append("─" * 60)
        
        # Calculate insights
        insights = []
        
        # Velocity trend
        if len(weeks) >= 4:
            recent_avg = sum(weekly_commits[w] for w in weeks[-2:]) / 2
            early_avg = sum(weekly_commits[w] for w in weeks[:2]) / 2
            if recent_avg > early_avg * 1.2:
                insights.append(f"📈 Accelerating: {int((recent_avg/early_avg - 1) * 100)}% more commits recently")
            elif recent_avg < early_avg * 0.8:
                insights.append(f"📉 Slowing: {int((1 - recent_avg/early_avg) * 100)}% fewer commits recently")
            else:
                insights.append("➡️  Steady pace maintained")
        
        # Skill diversity
        total_unique_skills = len(set().union(*weekly_skills.values()))
        insights.append(f"🎯 {total_unique_skills} unique concepts across {len(weeks)} weeks")
        
        return {
            'chart': '\n'.join(chart_lines),
            'insights': insights,
            'weeks': len(weeks),
            'total_commits': sum(weekly_commits.values())
        }
    
    def export_analysis(self) -> Dict:
        """Export comprehensive learning analysis."""
        self.load_git_history(days=30)
        self.analyze_skill_mentions()
        self.analyze_cognitive_improvements()
        
        return {
            'skill_acquisition': self.calculate_skill_acquisition_rate(),
            'improvement_velocity': self.calculate_improvement_velocity(),
            'learning_trajectory': self.generate_learning_trajectory(),
            'summary': {
                'total_commits_30d': len(self.git_log),
                'skills_tracked': len(self.skill_usage_history),
                'cognitive_tags_tracked': len(self.cognitive_tags_history)
            }
        }


def main():
    """CLI entry point."""
    import sys
    
    workspace = sys.argv[1] if len(sys.argv) > 1 else Path.cwd()
    tracker = LearningTracker(workspace)
    
    analysis = tracker.export_analysis()
    
    print("\n" + "="*70)
    print("📚 LEARNING PROGRESS TRACKER")
    print("="*70 + "\n")
    
    # Learning Trajectory
    trajectory = analysis['learning_trajectory']
    print(trajectory['chart'])
    print()
    for insight in trajectory['insights']:
        print(f"  {insight}")
    print()
    
    # Skill Acquisition
    print("─" * 70)
    print("🎯 SKILL ACQUISITION RATE")
    print("─" * 70)
    skill_acq = analysis['skill_acquisition']
    print(f"  Average skills used per week: {skill_acq.get('avg_skills_per_week', 0)}")
    print(f"  Total weeks tracked: {skill_acq.get('total_weeks', 0)}")
    print()
    
    # Improvement Velocity
    print("─" * 70)
    print("⚡ IMPROVEMENT VELOCITY")
    print("─" * 70)
    velocity = analysis['improvement_velocity']
    
    if velocity:
        for tag, data in sorted(velocity.items()):
            trend_emoji = "📈" if data['trend'] == 'improving' else "📉" if data['trend'] == 'declining' else "➡️ "
            print(f"  {trend_emoji} {tag:15} {data['occurrences']}x, avg {data['avg_days_between']}d between")
    else:
        print("  No cognitive tag data available yet")
    
    print("\n" + "="*70 + "\n")
    
    # Export JSON
    output_path = Path(workspace) / 'memory' / 'learning-progress.json'
    output_path.parent.mkdir(exist_ok=True)
    output_path.write_text(json.dumps(analysis, indent=2))
    print(f"📄 Exported to: {output_path}")


if __name__ == "__main__":
    main()
