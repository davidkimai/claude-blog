#!/usr/bin/env python3
"""
Claude Introspect - Self-Awareness Dashboard
Analyzes self-review.md to identify cognitive patterns, trends, and blind spots.
"""

import re
import json
from datetime import datetime
from collections import defaultdict, Counter
from pathlib import Path
from typing import Dict, List, Tuple

class CognitiveAnalyzer:
    """Analyzes cognitive patterns from self-review logs."""
    
    def __init__(self, review_path: str):
        self.review_path = Path(review_path)
        self.entries = []
        self.parse_review_file()
    
    def parse_review_file(self):
        """Parse self-review.md into structured entries."""
        if not self.review_path.exists():
            return
        
        content = self.review_path.read_text()
        
        # Parse entries (format: ### [TIME] TAG: category\n**MISS:** ...\n**FIX:** ...)
        entry_pattern = r'###\s+\[(\d{2}:\d{2})\]\s+TAG:\s+(\w+)\s*\n\*\*MISS:\*\*\s+(.+?)\s*\n\*\*FIX:\*\*\s+(.+?)(?=\n\n|\n###|\Z)'
        
        # Extract date from section headers (## YYYY-MM-DD)
        current_date = None
        date_section_pattern = r'##\s+(\d{4}-\d{2}-\d{2})'
        date_matches = re.finditer(date_section_pattern, content)
        
        # Build a map of positions to dates
        pos_to_date = {}
        for match in date_matches:
            pos_to_date[match.start()] = datetime.strptime(match.group(1), '%Y-%m-%d')
        
        matches = re.finditer(entry_pattern, content, re.DOTALL)
        
        for match in matches:
            time_str, tag, miss, fix = match.groups()
            
            # Find the most recent date section before this entry
            entry_pos = match.start()
            relevant_date = None
            for pos, date in sorted(pos_to_date.items()):
                if pos < entry_pos:
                    relevant_date = date
                else:
                    break
            
            if relevant_date:
                # Combine date + time
                try:
                    time_parts = datetime.strptime(time_str, '%H:%M')
                    full_datetime = relevant_date.replace(
                        hour=time_parts.hour,
                        minute=time_parts.minute
                    )
                    
                    self.entries.append({
                        'date': full_datetime,
                        'tag': tag.lower(),
                        'miss': miss.strip(),
                        'fix': fix.strip()
                    })
                except ValueError:
                    continue
    
    def get_tag_distribution(self) -> Dict[str, int]:
        """Count occurrences of each tag."""
        return Counter(entry['tag'] for entry in self.entries)
    
    def get_temporal_trends(self) -> Dict[str, List[Tuple[str, int]]]:
        """Track how often each tag appears over time."""
        tags_by_date = defaultdict(lambda: defaultdict(int))
        
        for entry in self.entries:
            date_key = entry['date'].strftime('%Y-%m-%d')
            tags_by_date[date_key][entry['tag']] += 1
        
        return dict(tags_by_date)
    
    def detect_recurring_patterns(self) -> List[Dict]:
        """Find MISS patterns that repeat across multiple entries."""
        miss_patterns = defaultdict(list)
        
        for entry in self.entries:
            # Extract key phrases from MISS (simple word extraction)
            words = set(re.findall(r'\b\w{4,}\b', entry['miss'].lower()))
            for word in words:
                miss_patterns[word].append({
                    'date': entry['date'],
                    'tag': entry['tag'],
                    'miss': entry['miss']
                })
        
        # Return patterns that appear 2+ times
        recurring = []
        for pattern, occurrences in miss_patterns.items():
            if len(occurrences) >= 2:
                recurring.append({
                    'pattern': pattern,
                    'count': len(occurrences),
                    'occurrences': occurrences
                })
        
        return sorted(recurring, key=lambda x: x['count'], reverse=True)
    
    def calculate_improvement_score(self) -> float:
        """
        Calculate improvement score based on:
        1. Tag diversity (avoiding same mistakes)
        2. Time between similar patterns
        3. Overall entry count trend
        """
        if len(self.entries) < 2:
            return 0.0
        
        # Check if recent entries have different tags than early ones
        recent = self.entries[-5:] if len(self.entries) >= 5 else self.entries
        early = self.entries[:5] if len(self.entries) >= 5 else []
        
        recent_tags = set(e['tag'] for e in recent)
        early_tags = set(e['tag'] for e in early) if early else set()
        
        # Diversity score: new problems > same problems
        diversity = len(recent_tags) / len(set(e['tag'] for e in self.entries))
        
        # Frequency score: fewer recent entries = improvement
        recent_rate = len(recent) / max((recent[-1]['date'] - recent[0]['date']).days, 1) if len(recent) > 1 else 0
        early_rate = len(early) / max((early[-1]['date'] - early[0]['date']).days, 1) if len(early) > 1 else 0
        
        frequency_improvement = max(0, 1 - (recent_rate / max(early_rate, 0.1)))
        
        return (diversity * 0.4 + frequency_improvement * 0.6) * 100
    
    def identify_blind_spots(self) -> List[str]:
        """Identify tags with no FIX strategy diversity."""
        tag_fixes = defaultdict(set)
        
        for entry in self.entries:
            # Extract key words from FIX
            fix_words = set(re.findall(r'\b\w{4,}\b', entry['fix'].lower()))
            tag_fixes[entry['tag']].update(fix_words)
        
        # Blind spots: tags with only 1-2 unique fix strategies
        blind_spots = []
        for tag, fixes in tag_fixes.items():
            if len(fixes) <= 3:
                blind_spots.append(f"{tag} (only {len(fixes)} unique fix strategies)")
        
        return blind_spots
    
    def generate_insights(self) -> Dict:
        """Generate comprehensive self-awareness insights."""
        return {
            'total_entries': len(self.entries),
            'date_range': {
                'first': self.entries[0]['date'].strftime('%Y-%m-%d') if self.entries else None,
                'last': self.entries[-1]['date'].strftime('%Y-%m-%d') if self.entries else None
            },
            'tag_distribution': dict(self.get_tag_distribution()),
            'improvement_score': round(self.calculate_improvement_score(), 1),
            'recurring_patterns': self.detect_recurring_patterns()[:5],  # Top 5
            'blind_spots': self.identify_blind_spots(),
            'temporal_trends': self.get_temporal_trends()
        }


def print_dashboard(insights: Dict):
    """Print a beautiful ASCII dashboard."""
    print("\n" + "="*70)
    print("🧠  CLAUDE INTROSPECTION DASHBOARD")
    print("="*70 + "\n")
    
    print(f"📊 Analysis Period: {insights['date_range']['first']} → {insights['date_range']['last']}")
    print(f"📝 Total Self-Review Entries: {insights['total_entries']}\n")
    
    print("─" * 70)
    print("🏷️  COGNITIVE TAG DISTRIBUTION")
    print("─" * 70)
    for tag, count in sorted(insights['tag_distribution'].items(), key=lambda x: x[1], reverse=True):
        bar = "█" * (count * 2)
        print(f"  {tag:15} {bar} {count}")
    
    print("\n" + "─" * 70)
    print(f"📈 IMPROVEMENT SCORE: {insights['improvement_score']}/100")
    print("─" * 70)
    if insights['improvement_score'] >= 70:
        print("✅ Strong improvement trajectory - diverse issues, decreasing frequency")
    elif insights['improvement_score'] >= 40:
        print("⚠️  Moderate progress - some patterns still recurring")
    else:
        print("❌ Limited improvement - recurring patterns detected")
    
    if insights['recurring_patterns']:
        print("\n" + "─" * 70)
        print("🔁 RECURRING PATTERNS (Top 5)")
        print("─" * 70)
        for pattern in insights['recurring_patterns']:
            print(f"\n  Pattern: '{pattern['pattern']}' (appears {pattern['count']}x)")
            print(f"  Tags: {set(occ['tag'] for occ in pattern['occurrences'])}")
            latest = pattern['occurrences'][-1]
            print(f"  Latest: {latest['date'].strftime('%Y-%m-%d')} - {latest['miss'][:60]}...")
    
    if insights['blind_spots']:
        print("\n" + "─" * 70)
        print("🚨 COGNITIVE BLIND SPOTS")
        print("─" * 70)
        for spot in insights['blind_spots']:
            print(f"  ⚠️  {spot}")
        print("\n  → Need more diverse FIX strategies for these tags")
    
    print("\n" + "─" * 70)
    print("💡 RECOMMENDATIONS")
    print("─" * 70)
    
    if insights['recurring_patterns']:
        top_pattern = insights['recurring_patterns'][0]
        print(f"  1. Focus on: '{top_pattern['pattern']}' (repeats {top_pattern['count']}x)")
    
    if insights['blind_spots']:
        print(f"  2. Develop new FIX strategies for: {insights['blind_spots'][0].split(' (')[0]}")
    
    tag_dist = insights['tag_distribution']
    if tag_dist:
        most_common = max(tag_dist.items(), key=lambda x: x[1])
        print(f"  3. Most common tag is '{most_common[0]}' - consider meta-pattern")
    
    print("\n" + "="*70 + "\n")


def export_json(insights: Dict, output_path: str):
    """Export insights as JSON for programmatic access."""
    # Convert datetime objects to strings for JSON serialization
    def serialize(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return obj
    
    # Deep copy and serialize
    export_data = json.loads(
        json.dumps(insights, default=serialize)
    )
    
    Path(output_path).write_text(json.dumps(export_data, indent=2))
    print(f"📄 Exported insights to: {output_path}")


if __name__ == "__main__":
    import sys
    
    # Default to workspace memory/self-review.md
    review_path = sys.argv[1] if len(sys.argv) > 1 else "memory/self-review.md"
    
    analyzer = CognitiveAnalyzer(review_path)
    insights = analyzer.generate_insights()
    
    # Print dashboard
    print_dashboard(insights)
    
    # Export JSON
    output_dir = Path("memory")
    output_dir.mkdir(exist_ok=True)
    export_json(insights, str(output_dir / "introspection-latest.json"))
