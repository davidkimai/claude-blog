#!/usr/bin/env python3
"""
Workspace Intelligence - Master Dashboard
Unified intelligence system combining all analytics components.
"""

import sys
import json
from pathlib import Path
from datetime import datetime

# Add components to path
sys.path.insert(0, str(Path(__file__).parent))

from components.skill_tracker import SkillTracker
from components.behavior_correlator import BehaviorCorrelator
from components.daily_synthesizer import DailySynthesizer
from components.health_monitor import HealthMonitor
from components.learning_tracker import LearningTracker


class WorkspaceIntelligence:
    """Master intelligence coordinator."""
    
    def __init__(self, workspace_root: str = None):
        if workspace_root is None:
            workspace_root = Path(__file__).parent.parent.parent
        
        self.workspace_root = Path(workspace_root)
        self.components = {
            'skill_tracker': SkillTracker(str(self.workspace_root)),
            'behavior_correlator': BehaviorCorrelator(str(self.workspace_root)),
            'daily_synthesizer': DailySynthesizer(str(self.workspace_root)),
            'health_monitor': HealthMonitor(str(self.workspace_root)),
            'learning_tracker': LearningTracker(self.workspace_root)
        }
    
    def run_full_analysis(self) -> dict:
        """Run all components and gather results."""
        results = {}
        
        print("\n🔍 Running Workspace Intelligence Analysis...")
        print("="*90 + "\n")
        
        # Skill Usage Tracking
        print("📊 Analyzing skill usage...")
        try:
            skill_data = self.components['skill_tracker'].get_usage_summary(days=30)
            results['skills'] = skill_data
            print(f"   ✓ Tracked {skill_data.get('total_skills', 0)} skills\n")
        except Exception as e:
            print(f"   ✗ Skill tracking failed: {e}\n")
            results['skills'] = {'error': str(e)}
        
        # Behavior Correlation
        print("🔗 Correlating behavior patterns...")
        try:
            correlator = self.components['behavior_correlator']
            patterns = correlator.parse_self_review()
            recurrence = correlator.find_recurrence(patterns)
            time_to_fix = correlator.measure_time_to_fix(patterns)
            effectiveness = correlator.check_fix_effectiveness(patterns)
            
            behavior_data = {
                'patterns': [{'category': p.category, 'pattern_type': p.pattern_type, 
                            'date': p.date.isoformat(), 'description': p.description} 
                           for p in patterns],
                'recurrence': recurrence,
                'time_to_fix': time_to_fix,
                'effectiveness': effectiveness
            }
            results['behavior'] = behavior_data
            print(f"   ✓ Analyzed {len(patterns)} patterns\n")
        except Exception as e:
            print(f"   ✗ Behavior correlation failed: {e}\n")
            results['behavior'] = {'error': str(e)}
        
        # Daily Synthesis
        print("📝 Synthesizing daily notes...")
        try:
            synthesis_data = self.components['daily_synthesizer'].generate_synthesis(days=7)
            results['synthesis'] = synthesis_data
            print(f"   ✓ Synthesized {len(synthesis_data.get('events', []))} events\n")
        except Exception as e:
            print(f"   ✗ Daily synthesis failed: {e}\n")
            results['synthesis'] = {'error': str(e)}
        
        # Workspace Health
        print("💊 Checking workspace health...")
        try:
            monitor = self.components['health_monitor']
            projects = monitor.find_projects()
            metrics = monitor.calculate_workspace_metrics(projects)
            stale = monitor.identify_stale_projects(projects)
            
            health_data = {
                'projects': [{'name': p.name, 'status': p.get_status(), 
                            'health_score': p.health_score} for p in projects],
                'metrics': metrics,
                'stale_projects': stale
            }
            results['health'] = health_data
            print(f"   ✓ Monitored {len(projects)} projects\n")
        except Exception as e:
            print(f"   ✗ Health monitoring failed: {e}\n")
            results['health'] = {'error': str(e)}
        
        # Learning Progress
        print("📚 Tracking learning progress...")
        try:
            learning_data = self.components['learning_tracker'].export_analysis()
            results['learning'] = learning_data
            print(f"   ✓ Analyzed {learning_data.get('summary', {}).get('total_commits_30d', 0)} commits\n")
        except Exception as e:
            print(f"   ✗ Learning tracking failed: {e}\n")
            results['learning'] = {'error': str(e)}
        
        return results
    
    def print_executive_summary(self, results: dict):
        """Print executive summary of all findings."""
        print("\n" + "="*90)
        print("🧠 WORKSPACE INTELLIGENCE - EXECUTIVE SUMMARY")
        print("="*90 + "\n")
        
        # Skills Summary
        if 'skills' in results and 'error' not in results['skills']:
            skills = results['skills']
            print("📊 Skill Usage:")
            print(f"   • Total Skills: {len(skills.get('all_skills', []))}")
            print(f"   • Recently Used: {len(skills.get('recently_used', []))}")
            print(f"   • Underutilized: {len(skills.get('underutilized', []))}")
            if skills.get('top_skills'):
                top = skills['top_skills'][0] if skills['top_skills'] else None
                if top:
                    print(f"   • Most Used: {top.get('skill', 'N/A')} ({top.get('count', 0)}x)")
            print()
        
        # Behavior Summary
        if 'behavior' in results and 'error' not in results['behavior']:
            behavior = results['behavior']
            print("🔗 Behavior Patterns:")
            patterns = behavior.get('patterns', [])
            if patterns:
                print(f"   • Patterns Tracked: {len(patterns)}")
                # Find most common tag
                tags = [p.get('category') for p in patterns if 'category' in p]
                if tags:
                    from collections import Counter
                    most_common = Counter(tags).most_common(1)[0]
                    print(f"   • Most Common Tag: {most_common[0]} ({most_common[1]}x)")
            print()
        
        # Synthesis Summary
        if 'synthesis' in results and 'error' not in results['synthesis']:
            synthesis = results['synthesis']
            print("📝 Weekly Synthesis:")
            print(f"   • Events Captured: {len(synthesis.get('events', []))}")
            print(f"   • Decisions Made: {len(synthesis.get('decisions', []))}")
            if synthesis.get('themes'):
                print(f"   • Key Themes: {', '.join(synthesis['themes'][:3])}")
            print()
        
        # Health Summary
        if 'health' in results and 'error' not in results['health']:
            health = results['health']
            projects = health.get('projects', [])
            if projects:
                print("💊 Workspace Health:")
                print(f"   • Total Projects: {len(projects)}")
                active = [p for p in projects if p.get('status') == 'active']
                stale = [p for p in projects if p.get('status') == 'stale']
                print(f"   • Active: {len(active)}")
                print(f"   • Stale: {len(stale)}")
                print()
        
        # Learning Summary
        if 'learning' in results and 'error' not in results['learning']:
            learning = results['learning']
            summary = learning.get('summary', {})
            print("📚 Learning Progress:")
            print(f"   • Commits (30d): {summary.get('total_commits_30d', 0)}")
            print(f"   • Skills Tracked: {summary.get('skills_tracked', 0)}")
            velocity = learning.get('improvement_velocity', {})
            if velocity:
                improving = [k for k, v in velocity.items() if v.get('trend') == 'improving']
                if improving:
                    print(f"   • Improving Tags: {', '.join(improving)}")
            print()
        
        print("="*90 + "\n")
        
        # Recommendations
        print("💡 KEY RECOMMENDATIONS\n")
        recommendations = []
        
        # From skills
        if 'skills' in results and results['skills'].get('underutilized'):
            count = len(results['skills']['underutilized'])
            recommendations.append(f"Explore {count} underutilized skills to expand capabilities")
        
        # From behavior
        if 'behavior' in results:
            patterns = results['behavior'].get('patterns', [])
            recurring = [p for p in patterns if p.get('pattern_type') == 'MISS']
            if len(recurring) > 1:
                recommendations.append(f"Address {len(recurring)} recurring MISS patterns")
        
        # From health
        if 'health' in results:
            stale = [p for p in results['health'].get('projects', []) 
                    if p.get('status') == 'stale']
            if stale:
                recommendations.append(f"Review {len(stale)} stale projects for archival or revival")
        
        if recommendations:
            for i, rec in enumerate(recommendations[:5], 1):
                print(f"   {i}. {rec}")
        else:
            print("   No critical issues detected - workspace is healthy!")
        
        print("\n" + "="*90 + "\n")
    
    def export_json(self, results: dict, output_path: str = None):
        """Export results as JSON."""
        if output_path is None:
            output_path = self.workspace_root / 'memory' / 'workspace-intelligence.json'
        else:
            output_path = Path(output_path)
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Add metadata
        export_data = {
            'generated_at': datetime.now().isoformat(),
            'workspace': str(self.workspace_root),
            'version': '1.0.0',
            'results': results
        }
        
        output_path.write_text(json.dumps(export_data, indent=2, default=str))
        print(f"📄 Full report exported to: {output_path}\n")


def main():
    """CLI entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Workspace Intelligence - Comprehensive self-improvement analytics'
    )
    parser.add_argument(
        '--workspace', '-w',
        default=None,
        help='Workspace root path (default: auto-detect)'
    )
    parser.add_argument(
        '--component', '-c',
        choices=['skills', 'behavior', 'synthesis', 'health', 'learning', 'all'],
        default='all',
        help='Run specific component (default: all)'
    )
    parser.add_argument(
        '--json', '-j',
        action='store_true',
        help='Export JSON only (no dashboard)'
    )
    parser.add_argument(
        '--output', '-o',
        help='JSON output path (default: memory/workspace-intelligence.json)'
    )
    
    args = parser.parse_args()
    
    # Initialize intelligence system
    wi = WorkspaceIntelligence(args.workspace)
    
    # Run analysis
    if args.component == 'all':
        results = wi.run_full_analysis()
        if not args.json:
            wi.print_executive_summary(results)
        wi.export_json(results, args.output)
    else:
        # Run single component
        component_name = args.component
        component_map = {
            'skills': 'skill_tracker',
            'behavior': 'behavior_correlator',
            'synthesis': 'daily_synthesizer',
            'health': 'health_monitor',
            'learning': 'learning_tracker'
        }
        
        component = wi.components[component_map[component_name]]
        
        # Run component-specific method
        if component_name == 'skills':
            result = component.get_usage_summary(days=30)
        elif component_name == 'behavior':
            patterns = component.parse_self_review()
            result = {
                'patterns': [{'category': p.category, 'type': p.pattern_type} for p in patterns],
                'recurrence': component.find_recurrence(patterns),
                'time_to_fix': component.measure_time_to_fix(patterns)
            }
        elif component_name == 'synthesis':
            result = component.generate_synthesis(days=7)
        elif component_name == 'health':
            projects = component.find_projects()
            result = {
                'projects': [{'name': p.name, 'status': p.get_status()} for p in projects],
                'metrics': component.calculate_workspace_metrics(projects)
            }
        elif component_name == 'learning':
            result = component.export_analysis()
        
        if not args.json:
            print(json.dumps(result, indent=2, default=str))
        
        if args.output:
            Path(args.output).write_text(json.dumps(result, indent=2, default=str))


if __name__ == "__main__":
    main()
