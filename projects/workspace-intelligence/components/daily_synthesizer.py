#!/usr/bin/env python3
"""
Daily Synthesizer
Parses daily memory files and generates weekly synthesis reports.
"""

import json
import re
import sys
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from collections import Counter

sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.dashboard import Dashboard, Colors


class DailyEntry:
    """Represents a single daily memory entry."""
    
    def __init__(self, date: datetime, file_path: Path):
        self.date = date
        self.file_path = file_path
        self.content = ""
        self.events = []
        self.decisions = []
        self.learnings = []
        self.topics = []
        
        self._parse()
    
    def _parse(self):
        """Parse the daily file."""
        if not self.file_path.exists():
            return
        
        with open(self.file_path, 'r', encoding='utf-8') as f:
            self.content = f.read()
        
        # Extract structured data
        self._extract_events()
        self._extract_decisions()
        self._extract_learnings()
        self._extract_topics()
    
    def _extract_events(self):
        """Extract events from content."""
        # Look for bullet points, timestamps, action items
        patterns = [
            r'^[\-\*]\s+(.+)$',  # Bullet points
            r'^\d{1,2}:\d{2}\s+(.+)$',  # Timestamps
            r'(?:Event|Happened|Did):\s*(.+)$'  # Explicit events
        ]
        
        for line in self.content.split('\n'):
            for pattern in patterns:
                match = re.search(pattern, line.strip(), re.IGNORECASE)
                if match:
                    event = match.group(1).strip()
                    if len(event) > 10:  # Filter out too short
                        self.events.append(event)
                    break
    
    def _extract_decisions(self):
        """Extract decisions from content."""
        patterns = [
            r'(?:Decided|Decision|Chose):\s*(.+?)(?:\.|$)',
            r'(?:Will|Going to)\s+(.+?)(?:\.|$)'
        ]
        
        for line in self.content.split('\n'):
            for pattern in patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    decision = match.group(1).strip()
                    if len(decision) > 10:
                        self.decisions.append(decision)
                    break
    
    def _extract_learnings(self):
        """Extract learnings from content."""
        patterns = [
            r'(?:Learned|Learning|Discovered):\s*(.+?)(?:\.|$)',
            r'(?:Insight|Realization):\s*(.+?)(?:\.|$)',
            r'(?:TIL|Today I learned):\s*(.+?)(?:\.|$)'
        ]
        
        for line in self.content.split('\n'):
            for pattern in patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    learning = match.group(1).strip()
                    if len(learning) > 10:
                        self.learnings.append(learning)
                    break
    
    def _extract_topics(self):
        """Extract topics/themes from content."""
        # Extract hashtags
        hashtags = re.findall(r'#(\w+)', self.content)
        self.topics.extend(hashtags)
        
        # Extract common technical terms and concepts
        tech_terms = re.findall(
            r'\b(API|database|server|client|frontend|backend|'
            r'deploy|debug|refactor|optimize|test|bug|feature|'
            r'git|commit|merge|branch|PR|issue)\b',
            self.content,
            re.IGNORECASE
        )
        self.topics.extend([t.lower() for t in tech_terms])
    
    def __repr__(self):
        return f"<DailyEntry {self.date.strftime('%Y-%m-%d')} ({len(self.events)} events)>"


class DailySynthesizer:
    """Synthesize daily memory files into weekly insights."""
    
    def __init__(self, workspace_path: str):
        """Initialize daily synthesizer."""
        self.workspace_path = Path(workspace_path)
        self.memory_dir = self.workspace_path / 'memory'
        self.dashboard = Dashboard(width=90)
    
    def find_daily_files(self, days: int = 7) -> List[Path]:
        """Find daily memory files for the past N days."""
        if not self.memory_dir.exists():
            return []
        
        files = []
        
        for i in range(days):
            date = datetime.now() - timedelta(days=i)
            filename = f"{date.strftime('%Y-%m-%d')}.md"
            filepath = self.memory_dir / filename
            
            if filepath.exists():
                files.append(filepath)
        
        return sorted(files, reverse=True)
    
    def parse_daily_files(self, days: int = 7) -> List[DailyEntry]:
        """Parse daily files into structured entries."""
        files = self.find_daily_files(days=days)
        
        entries = []
        for filepath in files:
            try:
                # Extract date from filename
                date_str = filepath.stem
                date = datetime.strptime(date_str, '%Y-%m-%d')
                entry = DailyEntry(date, filepath)
                entries.append(entry)
            except (ValueError, IOError):
                continue
        
        return entries
    
    def generate_synthesis(self, days: int = 7) -> Dict:
        """Generate weekly synthesis report."""
        entries = self.parse_daily_files(days=days)
        
        # Aggregate data
        all_events = []
        all_decisions = []
        all_learnings = []
        all_topics = []
        
        for entry in entries:
            all_events.extend(entry.events)
            all_decisions.extend(entry.decisions)
            all_learnings.extend(entry.learnings)
            all_topics.extend(entry.topics)
        
        # Count topics/themes
        topic_counts = Counter(all_topics)
        top_topics = topic_counts.most_common(10)
        
        # Identify trending topics (appeared in multiple days)
        topic_by_day = {}
        for entry in entries:
            for topic in set(entry.topics):
                if topic not in topic_by_day:
                    topic_by_day[topic] = []
                topic_by_day[topic].append(entry.date)
        
        trending_topics = [
            (topic, len(dates))
            for topic, dates in topic_by_day.items()
            if len(dates) >= 3  # Appeared in 3+ days
        ]
        trending_topics.sort(key=lambda x: x[1], reverse=True)
        
        # Calculate activity metrics
        total_entries = len(entries)
        avg_events_per_day = len(all_events) / total_entries if total_entries > 0 else 0
        
        return {
            'period': {
                'days': days,
                'start_date': entries[-1].date.isoformat() if entries else None,
                'end_date': entries[0].date.isoformat() if entries else None,
                'entries_found': total_entries
            },
            'summary': {
                'total_events': len(all_events),
                'total_decisions': len(all_decisions),
                'total_learnings': len(all_learnings),
                'avg_events_per_day': avg_events_per_day,
                'unique_topics': len(set(all_topics))
            },
            'top_events': all_events[:15],
            'key_decisions': all_decisions[:10],
            'key_learnings': all_learnings[:10],
            'top_topics': [{'topic': t, 'count': c} for t, c in top_topics],
            'trending_topics': [{'topic': t, 'days': d} for t, d in trending_topics],
            'entries': [
                {
                    'date': e.date.isoformat(),
                    'events_count': len(e.events),
                    'decisions_count': len(e.decisions),
                    'learnings_count': len(e.learnings)
                }
                for e in entries
            ]
        }
    
    def render_dashboard(self, days: int = 7) -> str:
        """Render weekly synthesis dashboard."""
        synthesis = self.generate_synthesis(days=days)
        
        lines = []
        
        # Header
        period = synthesis['period']
        subtitle = f"{period['start_date']} to {period['end_date']}" if period['start_date'] else f"Past {days} days"
        lines.append(self.dashboard.header(
            "📅 Weekly Synthesis",
            subtitle
        ))
        
        # Summary
        lines.append(self.dashboard.section("Overview"))
        s = synthesis['summary']
        
        lines.append(self.dashboard.key_value(
            "Days Analyzed", 
            period['entries_found'],
            value_color=Colors.BRIGHT_WHITE
        ))
        lines.append(self.dashboard.key_value(
            "Total Events Captured", 
            s['total_events'],
            value_color=Colors.BRIGHT_CYAN
        ))
        lines.append(self.dashboard.key_value(
            "Key Decisions Made", 
            s['total_decisions'],
            value_color=Colors.BRIGHT_YELLOW
        ))
        lines.append(self.dashboard.key_value(
            "Learnings Documented", 
            s['total_learnings'],
            value_color=Colors.BRIGHT_GREEN
        ))
        lines.append(self.dashboard.key_value(
            "Average Events/Day", 
            f"{s['avg_events_per_day']:.1f}",
            value_color=Colors.BRIGHT_MAGENTA
        ))
        lines.append(self.dashboard.key_value(
            "Unique Topics", 
            s['unique_topics'],
            value_color=Colors.BRIGHT_BLUE
        ))
        
        # Daily activity
        if synthesis['entries']:
            lines.append(self.dashboard.section("Daily Activity"))
            
            activity_values = [e['events_count'] for e in reversed(synthesis['entries'])]
            lines.append(self.dashboard.sparkline(
                activity_values,
                label="Events per day",
                width=70
            ))
        
        # Trending topics
        if synthesis['trending_topics']:
            lines.append(self.dashboard.section("🔥 Trending Topics"))
            lines.append(self.dashboard.alert(
                f"Topics that appeared across multiple days:",
                level='info'
            ))
            
            rows = []
            for item in synthesis['trending_topics'][:10]:
                topic = item['topic']
                days_count = item['days']
                bar_width = int(days_count / period['entries_found'] * 20)
                bar = '█' * bar_width
                
                rows.append([
                    topic,
                    days_count,
                    self.dashboard.color(bar, Colors.BRIGHT_CYAN)
                ])
            
            lines.append(self.dashboard.table(
                headers=['Topic', 'Days', 'Frequency'],
                rows=rows,
                alignments=['l', 'r', 'l']
            ))
        
        # Top topics overall
        if synthesis['top_topics']:
            lines.append(self.dashboard.section("📊 Most Mentioned Topics"))
            
            rows = []
            for item in synthesis['top_topics'][:10]:
                topic = item['topic']
                count = item['count']
                
                rows.append([topic, count])
            
            lines.append(self.dashboard.table(
                headers=['Topic', 'Mentions'],
                rows=rows,
                alignments=['l', 'r']
            ))
        
        # Key decisions
        if synthesis['key_decisions']:
            lines.append(self.dashboard.section("🎯 Key Decisions"))
            for i, decision in enumerate(synthesis['key_decisions'][:5], 1):
                lines.append(f"  {i}. {decision[:80]}")
        
        # Key learnings
        if synthesis['key_learnings']:
            lines.append(self.dashboard.section("💡 Key Learnings"))
            for i, learning in enumerate(synthesis['key_learnings'][:5], 1):
                lines.append(f"  {i}. {learning[:80]}")
        
        # Footer
        lines.append("")
        lines.append(self.dashboard.footer("Weekly synthesis complete"))
        
        return '\n'.join(lines)
    
    def export_json(self, days: int = 7, output_file: Optional[str] = None) -> str:
        """Export synthesis data as JSON."""
        synthesis = self.generate_synthesis(days=days)
        synthesis['timestamp'] = datetime.now().isoformat()
        
        json_str = json.dumps(synthesis, indent=2)
        
        if output_file:
            with open(output_file, 'w') as f:
                f.write(json_str)
        
        return json_str


def main():
    """CLI entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Synthesize daily memory files')
    parser.add_argument('--workspace', default='/Users/jasontang/clawd',
                       help='Workspace directory path')
    parser.add_argument('--days', type=int, default=7,
                       help='Number of days to analyze')
    parser.add_argument('--json', action='store_true',
                       help='Output as JSON')
    parser.add_argument('--output', help='Output file for JSON export')
    
    args = parser.parse_args()
    
    synthesizer = DailySynthesizer(args.workspace)
    
    if args.json:
        print(synthesizer.export_json(days=args.days, output_file=args.output))
    else:
        print(synthesizer.render_dashboard(days=args.days))


if __name__ == '__main__':
    main()
