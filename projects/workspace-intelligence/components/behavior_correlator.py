#!/usr/bin/env python3
"""
Behavior Correlator
Cross-references self-review patterns with git commits to measure learning effectiveness.
"""

import json
import re
import sys
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from collections import defaultdict

sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.git_parser import GitParser
from utils.dashboard import Dashboard, Colors


class Pattern:
    """Represents a MISS or FIX pattern from self-review."""
    
    def __init__(self, pattern_type: str, date: datetime, 
                 category: str, description: str, context: str = ""):
        self.pattern_type = pattern_type  # 'MISS' or 'FIX'
        self.date = date
        self.category = category
        self.description = description
        self.context = context
    
    def __repr__(self):
        return f"<Pattern {self.pattern_type}:{self.category} @ {self.date}>"


class BehaviorCorrelator:
    """Correlate self-review patterns with actual behavior in git history."""
    
    def __init__(self, workspace_path: str):
        """Initialize behavior correlator."""
        self.workspace_path = Path(workspace_path)
        self.git_parser = GitParser(str(workspace_path))
        self.dashboard = Dashboard(width=90)
        self.self_review_path = self.workspace_path / 'memory' / 'self-review.md'
    
    def parse_self_review(self) -> List[Pattern]:
        """Parse self-review.md for MISS and FIX patterns."""
        if not self.self_review_path.exists():
            return []
        
        patterns = []
        
        with open(self.self_review_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Parse patterns
        # Format: ## MISS: Category - Description
        # or:     ## FIX: Category - Description
        pattern_regex = r'^##\s+(MISS|FIX):\s*([^-]+?)\s*-\s*(.+?)$'
        
        lines = content.split('\n')
        current_pattern = None
        current_context = []
        current_date = None
        
        for line in lines:
            # Check for date markers (e.g., "### 2024-01-15")
            date_match = re.match(r'^###\s+(\d{4}-\d{2}-\d{2})', line)
            if date_match:
                current_date = datetime.strptime(date_match.group(1), '%Y-%m-%d')
                continue
            
            # Check for MISS/FIX patterns
            match = re.match(pattern_regex, line, re.MULTILINE)
            if match:
                # Save previous pattern if exists
                if current_pattern:
                    current_pattern.context = '\n'.join(current_context)
                    patterns.append(current_pattern)
                
                pattern_type = match.group(1)
                category = match.group(2).strip()
                description = match.group(3).strip()
                
                pattern_date = current_date or datetime.now()
                current_pattern = Pattern(pattern_type, pattern_date, category, description)
                current_context = []
            
            elif current_pattern and line.strip():
                # Accumulate context lines
                if not line.startswith('#'):
                    current_context.append(line)
        
        # Save last pattern
        if current_pattern:
            current_pattern.context = '\n'.join(current_context)
            patterns.append(current_pattern)
        
        return patterns
    
    def find_recurrence(self, patterns: List[Pattern]) -> Dict[str, List[Pattern]]:
        """Find recurring MISS patterns."""
        by_category = defaultdict(list)
        
        for pattern in patterns:
            if pattern.pattern_type == 'MISS':
                # Normalize category for grouping
                normalized = pattern.category.lower().strip()
                by_category[normalized].append(pattern)
        
        # Only return categories with multiple occurrences
        return {cat: pats for cat, pats in by_category.items() if len(pats) > 1}
    
    def measure_time_to_fix(self, patterns: List[Pattern]) -> List[Dict]:
        """Measure time between MISS and corresponding FIX."""
        results = []
        
        # Group by category
        misses = defaultdict(list)
        fixes = defaultdict(list)
        
        for pattern in patterns:
            normalized_cat = pattern.category.lower().strip()
            if pattern.pattern_type == 'MISS':
                misses[normalized_cat].append(pattern)
            else:
                fixes[normalized_cat].append(pattern)
        
        # Match MISS to FIX
        for category in misses.keys():
            miss_list = sorted(misses[category], key=lambda p: p.date)
            fix_list = sorted(fixes.get(category, []), key=lambda p: p.date)
            
            for miss in miss_list:
                # Find next FIX after this MISS
                matching_fix = None
                for fix in fix_list:
                    if fix.date > miss.date:
                        matching_fix = fix
                        break
                
                if matching_fix:
                    time_to_fix = (matching_fix.date - miss.date).days
                    results.append({
                        'category': category,
                        'miss_date': miss.date.isoformat(),
                        'fix_date': matching_fix.date.isoformat(),
                        'time_to_fix_days': time_to_fix,
                        'miss_description': miss.description,
                        'fix_description': matching_fix.description
                    })
                else:
                    # MISS without a FIX yet
                    days_since = (datetime.now() - miss.date).days
                    results.append({
                        'category': category,
                        'miss_date': miss.date.isoformat(),
                        'fix_date': None,
                        'time_to_fix_days': None,
                        'days_unfixed': days_since,
                        'miss_description': miss.description,
                        'fix_description': None
                    })
        
        return results
    
    def check_fix_effectiveness(self, patterns: List[Pattern]) -> Dict[str, Dict]:
        """Check if FIX strategies actually prevent recurrence."""
        effectiveness = {}
        
        # Group by category
        by_category = defaultdict(lambda: {'misses': [], 'fixes': []})
        
        for pattern in patterns:
            normalized_cat = pattern.category.lower().strip()
            if pattern.pattern_type == 'MISS':
                by_category[normalized_cat]['misses'].append(pattern)
            else:
                by_category[normalized_cat]['fixes'].append(pattern)
        
        # Analyze each category
        for category, data in by_category.items():
            misses = sorted(data['misses'], key=lambda p: p.date)
            fixes = sorted(data['fixes'], key=lambda p: p.date)
            
            if not fixes:
                continue
            
            # Check if misses stopped after fix
            last_fix_date = fixes[-1].date
            misses_after_fix = [m for m in misses if m.date > last_fix_date]
            
            effectiveness[category] = {
                'total_misses': len(misses),
                'total_fixes': len(fixes),
                'last_fix_date': last_fix_date.isoformat(),
                'misses_after_last_fix': len(misses_after_fix),
                'days_since_last_fix': (datetime.now() - last_fix_date).days,
                'effectiveness': 'effective' if len(misses_after_fix) == 0 else 'ineffective',
                'fix_descriptions': [f.description for f in fixes]
            }
        
        return effectiveness
    
    def correlate_with_commits(self, patterns: List[Pattern], days: int = 90) -> Dict:
        """Correlate patterns with git commit messages."""
        commits = self.git_parser.get_commits(max_count=500)
        
        correlations = []
        
        for pattern in patterns:
            # Search commits for keywords from pattern
            keywords = self._extract_keywords(pattern.description)
            
            matching_commits = []
            for commit in commits:
                # Check if commit is within 7 days of pattern
                days_diff = abs((commit.date - pattern.date).days)
                if days_diff > 7:
                    continue
                
                # Check for keyword matches
                commit_text = f"{commit.message} {' '.join(commit.files_changed)}"
                if any(keyword.lower() in commit_text.lower() for keyword in keywords):
                    matching_commits.append({
                        'hash': commit.hash[:7],
                        'message': commit.message,
                        'date': commit.date.isoformat(),
                        'days_diff': days_diff
                    })
            
            if matching_commits:
                correlations.append({
                    'pattern': {
                        'type': pattern.pattern_type,
                        'category': pattern.category,
                        'description': pattern.description,
                        'date': pattern.date.isoformat()
                    },
                    'matching_commits': matching_commits
                })
        
        return {'correlations': correlations, 'total_patterns': len(patterns)}
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract meaningful keywords from text."""
        # Remove common words
        stopwords = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'}
        
        # Extract words
        words = re.findall(r'\b[a-z]{4,}\b', text.lower())
        keywords = [w for w in words if w not in stopwords]
        
        return keywords[:5]  # Top 5 keywords
    
    def render_dashboard(self) -> str:
        """Render behavior correlation dashboard."""
        patterns = self.parse_self_review()
        
        lines = []
        
        # Header
        lines.append(self.dashboard.header(
            "🧠 Behavior Correlator",
            "Self-review patterns vs. actual behavior"
        ))
        
        # Summary
        lines.append(self.dashboard.section("Pattern Summary"))
        
        miss_count = len([p for p in patterns if p.pattern_type == 'MISS'])
        fix_count = len([p for p in patterns if p.pattern_type == 'FIX'])
        
        lines.append(self.dashboard.key_value(
            "Total Patterns Tracked", 
            len(patterns),
            value_color=Colors.BRIGHT_WHITE
        ))
        lines.append(self.dashboard.key_value(
            "MISS Patterns", 
            miss_count,
            value_color=Colors.BRIGHT_RED
        ))
        lines.append(self.dashboard.key_value(
            "FIX Strategies", 
            fix_count,
            value_color=Colors.BRIGHT_GREEN
        ))
        
        if len(patterns) > 0:
            lines.append(self.dashboard.key_value(
                "Fix Rate", 
                f"{(fix_count / len(patterns) * 100):.1f}%",
                value_color=Colors.BRIGHT_CYAN
            ))
        
        # Time to fix
        time_to_fix = self.measure_time_to_fix(patterns)
        if time_to_fix:
            lines.append(self.dashboard.section("⏱️  Time to Fix"))
            
            fixed = [t for t in time_to_fix if t['fix_date'] is not None]
            unfixed = [t for t in time_to_fix if t['fix_date'] is None]
            
            if fixed:
                avg_time = sum(t['time_to_fix_days'] for t in fixed) / len(fixed)
                lines.append(self.dashboard.key_value(
                    "Average Time to Fix", 
                    f"{avg_time:.1f} days",
                    value_color=Colors.BRIGHT_YELLOW
                ))
                
                # Show fastest and slowest
                fastest = min(fixed, key=lambda x: x['time_to_fix_days'])
                slowest = max(fixed, key=lambda x: x['time_to_fix_days'])
                
                lines.append(self.dashboard.key_value(
                    "Fastest Fix", 
                    f"{fastest['time_to_fix_days']} days ({fastest['category']})",
                    value_color=Colors.BRIGHT_GREEN
                ))
                lines.append(self.dashboard.key_value(
                    "Slowest Fix", 
                    f"{slowest['time_to_fix_days']} days ({slowest['category']})",
                    value_color=Colors.BRIGHT_RED
                ))
            
            if unfixed:
                lines.append("")
                lines.append(self.dashboard.alert(
                    f"{len(unfixed)} issues still unfixed",
                    level='warning'
                ))
                
                for issue in unfixed[:5]:
                    days_unfixed = issue['days_unfixed']
                    lines.append(f"    • {issue['category']}: {days_unfixed} days ago")
        
        # Recurrence analysis
        recurring = self.find_recurrence(patterns)
        if recurring:
            lines.append(self.dashboard.section("🔄 Recurring Issues"))
            lines.append(self.dashboard.alert(
                f"Found {len(recurring)} categories with recurring MISS patterns",
                level='error'
            ))
            
            rows = []
            for category, instances in sorted(recurring.items(), key=lambda x: len(x[1]), reverse=True):
                recurrence_count = len(instances)
                first_date = min(p.date for p in instances)
                last_date = max(p.date for p in instances)
                span_days = (last_date - first_date).days
                
                rows.append([
                    category,
                    recurrence_count,
                    f"{span_days}d",
                    last_date.strftime('%Y-%m-%d')
                ])
            
            lines.append(self.dashboard.table(
                headers=['Category', 'Count', 'Span', 'Last Seen'],
                rows=rows[:10],
                alignments=['l', 'r', 'r', 'r']
            ))
        
        # Fix effectiveness
        effectiveness = self.check_fix_effectiveness(patterns)
        if effectiveness:
            lines.append(self.dashboard.section("✅ Fix Effectiveness"))
            
            effective = [cat for cat, data in effectiveness.items() if data['effectiveness'] == 'effective']
            ineffective = [cat for cat, data in effectiveness.items() if data['effectiveness'] == 'ineffective']
            
            total = len(effectiveness)
            effective_rate = len(effective) / total * 100 if total > 0 else 0
            
            lines.append(self.dashboard.key_value(
                "Effective Fixes", 
                f"{len(effective)}/{total} ({effective_rate:.0f}%)",
                value_color=Colors.BRIGHT_GREEN if effective_rate > 70 else Colors.BRIGHT_YELLOW
            ))
            
            if ineffective:
                lines.append("")
                lines.append(self.dashboard.alert(
                    f"{len(ineffective)} categories still having issues despite fixes:",
                    level='warning'
                ))
                for cat in ineffective[:5]:
                    data = effectiveness[cat]
                    lines.append(f"    • {cat}: {data['misses_after_last_fix']} misses after fix")
        
        # Footer
        lines.append("")
        lines.append(self.dashboard.footer("Behavior correlation analysis complete"))
        
        return '\n'.join(lines)
    
    def export_json(self, output_file: Optional[str] = None) -> str:
        """Export correlation data as JSON."""
        patterns = self.parse_self_review()
        
        data = {
            'timestamp': datetime.now().isoformat(),
            'total_patterns': len(patterns),
            'patterns': [
                {
                    'type': p.pattern_type,
                    'date': p.date.isoformat(),
                    'category': p.category,
                    'description': p.description
                }
                for p in patterns
            ],
            'time_to_fix': self.measure_time_to_fix(patterns),
            'effectiveness': self.check_fix_effectiveness(patterns),
            'recurring': {
                cat: len(instances)
                for cat, instances in self.find_recurrence(patterns).items()
            }
        }
        
        json_str = json.dumps(data, indent=2)
        
        if output_file:
            with open(output_file, 'w') as f:
                f.write(json_str)
        
        return json_str


def main():
    """CLI entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Correlate self-review with behavior')
    parser.add_argument('--workspace', default='/Users/jasontang/clawd',
                       help='Workspace directory path')
    parser.add_argument('--json', action='store_true',
                       help='Output as JSON')
    parser.add_argument('--output', help='Output file for JSON export')
    
    args = parser.parse_args()
    
    correlator = BehaviorCorrelator(args.workspace)
    
    if args.json:
        print(correlator.export_json(output_file=args.output))
    else:
        print(correlator.render_dashboard())


if __name__ == '__main__':
    main()
