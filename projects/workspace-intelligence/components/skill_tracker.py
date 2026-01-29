#!/usr/bin/env python3
"""
Skill Usage Tracker
Tracks skill invocations, usage patterns, and identifies underutilized skills.
"""

import json
import sys
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.log_parser import LogParser
from utils.dashboard import Dashboard, Colors


class SkillTracker:
    """Track and analyze skill usage patterns."""
    
    def __init__(self, workspace_path: str):
        """Initialize skill tracker."""
        self.workspace_path = Path(workspace_path)
        self.parser = LogParser(str(workspace_path))
        self.dashboard = Dashboard(width=90)
    
    def get_usage_summary(self, days: int = 30) -> Dict:
        """Get comprehensive skill usage summary."""
        usage_stats = self.parser.get_skill_usage_stats(days=days)
        installed_skills = self.parser.find_installed_skills()
        underutilized = self.parser.get_underutilized_skills(days=days)
        
        # Calculate summary metrics
        total_installed = len(installed_skills)
        total_used = len(usage_stats)
        total_invocations = sum(s['count'] for s in usage_stats.values())
        never_used = [s for s, ts in underutilized if ts is None]
        rarely_used = [s for s, ts in underutilized if ts is not None]
        
        # Calculate average success rate
        avg_success_rate = 0
        if usage_stats:
            avg_success_rate = sum(s['success_rate'] for s in usage_stats.values()) / len(usage_stats)
        
        # Find most/least used
        if usage_stats:
            most_used = max(usage_stats.items(), key=lambda x: x[1]['count'])
            least_used = min(usage_stats.items(), key=lambda x: x[1]['count'])
        else:
            most_used = (None, None)
            least_used = (None, None)
        
        return {
            'period_days': days,
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_installed': total_installed,
                'total_used': total_used,
                'total_invocations': total_invocations,
                'never_used_count': len(never_used),
                'rarely_used_count': len(rarely_used),
                'usage_rate': (total_used / total_installed * 100) if total_installed > 0 else 0,
                'avg_success_rate': avg_success_rate * 100
            },
            'most_used': {
                'skill': most_used[0],
                'count': most_used[1]['count'] if most_used[1] else 0,
                'success_rate': most_used[1]['success_rate'] * 100 if most_used[1] else 0
            } if most_used[0] else None,
            'least_used': {
                'skill': least_used[0],
                'count': least_used[1]['count'] if least_used[1] else 0
            } if least_used[0] else None,
            'usage_stats': usage_stats,
            'underutilized': {
                'never_used': sorted(never_used),
                'rarely_used': sorted(rarely_used)
            }
        }
    
    def get_daily_activity(self, days: int = 14) -> List[Tuple[str, int]]:
        """Get daily skill invocation counts."""
        invocations = self.parser.get_all_skill_invocations(days=days)
        
        # Group by date
        by_date = {}
        for inv in invocations:
            date_key = inv.timestamp.strftime('%Y-%m-%d')
            by_date[date_key] = by_date.get(date_key, 0) + 1
        
        # Fill in missing dates with 0
        start_date = datetime.now() - timedelta(days=days)
        result = []
        
        for i in range(days):
            date = start_date + timedelta(days=i)
            date_key = date.strftime('%Y-%m-%d')
            count = by_date.get(date_key, 0)
            result.append((date_key, count))
        
        return result
    
    def render_dashboard(self, days: int = 30) -> str:
        """Render skill usage dashboard."""
        summary = self.get_usage_summary(days=days)
        daily_activity = self.get_daily_activity(days=14)
        
        lines = []
        
        # Header
        lines.append(self.dashboard.header(
            "🎯 Skill Usage Tracker",
            f"Analysis period: Past {days} days"
        ))
        
        # Summary metrics
        lines.append(self.dashboard.section("Overview"))
        s = summary['summary']
        
        lines.append(self.dashboard.key_value(
            "Total Skills Installed", 
            s['total_installed'],
            value_color=Colors.BRIGHT_WHITE
        ))
        lines.append(self.dashboard.key_value(
            "Skills Actually Used", 
            f"{s['total_used']} ({s['usage_rate']:.1f}%)",
            value_color=Colors.BRIGHT_GREEN if s['usage_rate'] > 50 else Colors.BRIGHT_YELLOW
        ))
        lines.append(self.dashboard.key_value(
            "Total Invocations", 
            s['total_invocations'],
            value_color=Colors.BRIGHT_CYAN
        ))
        lines.append(self.dashboard.key_value(
            "Average Success Rate", 
            f"{s['avg_success_rate']:.1f}%",
            value_color=Colors.BRIGHT_GREEN if s['avg_success_rate'] > 90 else Colors.BRIGHT_YELLOW
        ))
        lines.append(self.dashboard.key_value(
            "Never Used", 
            s['never_used_count'],
            value_color=Colors.BRIGHT_RED if s['never_used_count'] > 10 else Colors.YELLOW
        ))
        lines.append(self.dashboard.key_value(
            "Rarely Used (<3 times)", 
            s['rarely_used_count'],
            value_color=Colors.YELLOW
        ))
        
        # Top skills
        if summary['usage_stats']:
            lines.append(self.dashboard.section("Top 10 Most Used Skills"))
            
            top_skills = sorted(
                summary['usage_stats'].items(), 
                key=lambda x: x[1]['count'], 
                reverse=True
            )[:10]
            
            rows = []
            for skill_name, stats in top_skills:
                last_used = stats['last_used']
                if last_used:
                    last_used_dt = datetime.fromisoformat(last_used)
                    days_ago = (datetime.now() - last_used_dt).days
                    last_used_str = f"{days_ago}d ago" if days_ago > 0 else "today"
                else:
                    last_used_str = "never"
                
                success_rate = f"{stats['success_rate']*100:.0f}%"
                
                # Color code success rate
                if stats['success_rate'] >= 0.95:
                    success_colored = self.dashboard.color(success_rate, Colors.BRIGHT_GREEN)
                elif stats['success_rate'] >= 0.80:
                    success_colored = self.dashboard.color(success_rate, Colors.BRIGHT_YELLOW)
                else:
                    success_colored = self.dashboard.color(success_rate, Colors.BRIGHT_RED)
                
                rows.append([
                    skill_name,
                    stats['count'],
                    success_colored,
                    last_used_str,
                    stats['session_count']
                ])
            
            lines.append(self.dashboard.table(
                headers=['Skill', 'Uses', 'Success', 'Last Used', 'Sessions'],
                rows=rows,
                alignments=['l', 'r', 'r', 'r', 'r']
            ))
        
        # Daily activity
        lines.append(self.dashboard.section("Recent Activity (Past 14 Days)"))
        activity_values = [count for _, count in daily_activity]
        lines.append(self.dashboard.sparkline(
            activity_values,
            label="Daily invocations",
            width=70
        ))
        
        # Underutilized skills
        never_used = summary['underutilized']['never_used']
        rarely_used = summary['underutilized']['rarely_used']
        
        if never_used:
            lines.append(self.dashboard.section("⚠️  Never Used Skills"))
            lines.append(self.dashboard.alert(
                f"These {len(never_used)} skills are installed but have never been invoked:",
                level='warning'
            ))
            
            # Show in columns
            col_width = 25
            cols = 3
            for i in range(0, len(never_used), cols):
                row_skills = never_used[i:i+cols]
                row_str = "    " + "  ".join(s.ljust(col_width) for s in row_skills)
                lines.append(self.dashboard.color(row_str, Colors.DIM))
        
        if rarely_used:
            lines.append(self.dashboard.section("📊 Rarely Used Skills"))
            lines.append(self.dashboard.alert(
                f"These {len(rarely_used)} skills have been used fewer than 3 times:",
                level='info'
            ))
            
            # Show with counts
            for skill in rarely_used[:15]:  # Limit to 15
                if skill in summary['usage_stats']:
                    count = summary['usage_stats'][skill]['count']
                    lines.append(f"    • {skill} ({count} uses)")
        
        # Footer
        lines.append("")
        lines.append(self.dashboard.footer("Skill usage tracking complete"))
        
        return '\n'.join(lines)
    
    def export_json(self, days: int = 30, output_file: Optional[str] = None) -> str:
        """Export skill usage data as JSON."""
        summary = self.get_usage_summary(days=days)
        daily_activity = self.get_daily_activity(days=14)
        
        data = {
            **summary,
            'daily_activity': [
                {'date': date, 'count': count}
                for date, count in daily_activity
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
    
    parser = argparse.ArgumentParser(description='Track skill usage patterns')
    parser.add_argument('--workspace', default='/Users/jasontang/clawd',
                       help='Workspace directory path')
    parser.add_argument('--days', type=int, default=30,
                       help='Number of days to analyze')
    parser.add_argument('--json', action='store_true',
                       help='Output as JSON')
    parser.add_argument('--output', help='Output file for JSON export')
    
    args = parser.parse_args()
    
    tracker = SkillTracker(args.workspace)
    
    if args.json:
        print(tracker.export_json(days=args.days, output_file=args.output))
    else:
        print(tracker.render_dashboard(days=args.days))


if __name__ == '__main__':
    main()
