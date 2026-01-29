#!/usr/bin/env python3
"""
Log Parser Utility
Parses Claude session logs and extracts skill usage, patterns, and metrics.
"""

import json
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Set, Tuple
from collections import defaultdict


class SkillInvocation:
    """Represents a single skill invocation."""
    
    def __init__(self, skill_name: str, timestamp: datetime, 
                 session_id: Optional[str] = None,
                 success: bool = True, context: Optional[str] = None):
        self.skill_name = skill_name
        self.timestamp = timestamp
        self.session_id = session_id
        self.success = success
        self.context = context
    
    def __repr__(self):
        return f"<SkillInvocation {self.skill_name} @ {self.timestamp}>"


class LogParser:
    """Parse Claude logs and session files for intelligence extraction."""
    
    def __init__(self, workspace_path: str):
        """Initialize with workspace path."""
        self.workspace_path = Path(workspace_path)
        self.claude_dir = self.workspace_path / '.claude'
        self.sessions_dir = self.claude_dir / 'sessions'
        self.logs_dir = self.claude_dir / 'logs'
    
    def find_session_files(self, days: Optional[int] = None) -> List[Path]:
        """Find all session files, optionally filtered by age."""
        if not self.sessions_dir.exists():
            return []
        
        files = []
        cutoff_time = None
        
        if days:
            from datetime import timedelta
            cutoff_time = datetime.now().timestamp() - (days * 86400)
        
        for file in self.sessions_dir.rglob('*.json'):
            if cutoff_time and file.stat().st_mtime < cutoff_time:
                continue
            files.append(file)
        
        return sorted(files, key=lambda f: f.stat().st_mtime, reverse=True)
    
    def find_log_files(self, days: Optional[int] = None) -> List[Path]:
        """Find all log files, optionally filtered by age."""
        if not self.logs_dir.exists():
            return []
        
        files = []
        cutoff_time = None
        
        if days:
            from datetime import timedelta
            cutoff_time = datetime.now().timestamp() - (days * 86400)
        
        for file in self.logs_dir.rglob('*.log'):
            if cutoff_time and file.stat().st_mtime < cutoff_time:
                continue
            files.append(file)
        
        return sorted(files, key=lambda f: f.stat().st_mtime, reverse=True)
    
    def parse_session_file(self, file_path: Path) -> List[SkillInvocation]:
        """Parse a single session file for skill invocations."""
        invocations = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            session_id = file_path.stem
            
            # Look for skill invocations in various formats
            # This is a flexible parser that adapts to different log structures
            
            if isinstance(data, dict):
                # Extract from messages or events
                messages = data.get('messages', [])
                events = data.get('events', [])
                
                for msg in messages:
                    invocations.extend(self._extract_skills_from_message(msg, session_id))
                
                for event in events:
                    invocations.extend(self._extract_skills_from_event(event, session_id))
            
            elif isinstance(data, list):
                # Array of messages/events
                for item in data:
                    invocations.extend(self._extract_skills_from_message(item, session_id))
        
        except (json.JSONDecodeError, IOError, KeyError):
            # Silently skip malformed files
            pass
        
        return invocations
    
    def _extract_skills_from_message(self, msg: Dict, session_id: str) -> List[SkillInvocation]:
        """Extract skill invocations from a message object."""
        invocations = []
        
        # Look for tool calls, function calls, skill references
        content = msg.get('content', '')
        timestamp_str = msg.get('timestamp', msg.get('created_at'))
        
        if timestamp_str:
            try:
                timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            except:
                timestamp = datetime.now()
        else:
            timestamp = datetime.now()
        
        # Check for tool_calls field
        tool_calls = msg.get('tool_calls', [])
        for call in tool_calls:
            skill_name = call.get('name', call.get('function', {}).get('name'))
            if skill_name:
                invocations.append(SkillInvocation(
                    skill_name=skill_name,
                    timestamp=timestamp,
                    session_id=session_id,
                    context=str(content)[:200]
                ))
        
        # Parse content for skill mentions
        if isinstance(content, str):
            # Look for patterns like "Using skill: X" or "Invoking X"
            patterns = [
                r'skill[:\s]+([a-z_-]+)',
                r'invoke[d]?\s+([a-z_-]+)',
                r'using\s+([a-z_-]+)\s+skill',
                r'@([a-z_-]+)\s+skill'
            ]
            
            for pattern in patterns:
                matches = re.finditer(pattern, content, re.IGNORECASE)
                for match in matches:
                    skill_name = match.group(1)
                    invocations.append(SkillInvocation(
                        skill_name=skill_name,
                        timestamp=timestamp,
                        session_id=session_id,
                        context=content[:200]
                    ))
        
        return invocations
    
    def _extract_skills_from_event(self, event: Dict, session_id: str) -> List[SkillInvocation]:
        """Extract skill invocations from an event object."""
        invocations = []
        
        event_type = event.get('type', '')
        timestamp_str = event.get('timestamp')
        
        if timestamp_str:
            try:
                timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            except:
                timestamp = datetime.now()
        else:
            timestamp = datetime.now()
        
        if 'skill' in event_type.lower():
            skill_name = event.get('skill', event.get('name'))
            if skill_name:
                invocations.append(SkillInvocation(
                    skill_name=skill_name,
                    timestamp=timestamp,
                    session_id=session_id,
                    success=event.get('success', True)
                ))
        
        return invocations
    
    def get_all_skill_invocations(self, days: Optional[int] = None) -> List[SkillInvocation]:
        """Get all skill invocations from session files."""
        invocations = []
        
        session_files = self.find_session_files(days=days)
        
        for file in session_files:
            invocations.extend(self.parse_session_file(file))
        
        return invocations
    
    def get_skill_usage_stats(self, days: Optional[int] = None) -> Dict[str, Dict]:
        """
        Get aggregated skill usage statistics.
        
        Returns:
            Dict mapping skill_name to stats (count, last_used, success_rate)
        """
        invocations = self.get_all_skill_invocations(days=days)
        
        stats = defaultdict(lambda: {
            'count': 0,
            'last_used': None,
            'first_used': None,
            'success_count': 0,
            'failure_count': 0,
            'sessions': set()
        })
        
        for inv in invocations:
            skill = stats[inv.skill_name]
            skill['count'] += 1
            
            if inv.success:
                skill['success_count'] += 1
            else:
                skill['failure_count'] += 1
            
            if skill['last_used'] is None or inv.timestamp > skill['last_used']:
                skill['last_used'] = inv.timestamp
            
            if skill['first_used'] is None or inv.timestamp < skill['first_used']:
                skill['first_used'] = inv.timestamp
            
            if inv.session_id:
                skill['sessions'].add(inv.session_id)
        
        # Convert sets to counts and datetimes to ISO strings
        result = {}
        for skill_name, data in stats.items():
            result[skill_name] = {
                'count': data['count'],
                'last_used': data['last_used'].isoformat() if data['last_used'] else None,
                'first_used': data['first_used'].isoformat() if data['first_used'] else None,
                'success_rate': data['success_count'] / data['count'] if data['count'] > 0 else 0,
                'session_count': len(data['sessions'])
            }
        
        return result
    
    def find_installed_skills(self) -> Set[str]:
        """Find all installed skills in the workspace."""
        skills = set()
        
        skills_dir = self.workspace_path / 'skills'
        if not skills_dir.exists():
            return skills
        
        # Each skill is a directory with a SKILL.md file
        for item in skills_dir.iterdir():
            if item.is_dir():
                skill_file = item / 'SKILL.md'
                if skill_file.exists():
                    skills.add(item.name)
        
        return skills
    
    def get_underutilized_skills(self, days: int = 30) -> List[Tuple[str, Optional[datetime]]]:
        """
        Find skills that are installed but rarely/never used.
        
        Returns:
            List of (skill_name, last_used_timestamp) tuples
        """
        installed = self.find_installed_skills()
        usage_stats = self.get_skill_usage_stats(days=days)
        
        underutilized = []
        
        for skill in installed:
            if skill not in usage_stats:
                # Never used
                underutilized.append((skill, None))
            else:
                stats = usage_stats[skill]
                if stats['count'] < 3:  # Used fewer than 3 times
                    last_used_str = stats.get('last_used')
                    last_used = datetime.fromisoformat(last_used_str) if last_used_str else None
                    underutilized.append((skill, last_used))
        
        return sorted(underutilized, key=lambda x: x[1] if x[1] else datetime.min)


if __name__ == '__main__':
    # Quick test
    import sys
    workspace = sys.argv[1] if len(sys.argv) > 1 else '/Users/jasontang/clawd'
    
    parser = LogParser(workspace)
    stats = parser.get_skill_usage_stats(days=30)
    
    print(f"Skill usage stats (past 30 days):")
    for skill, data in sorted(stats.items(), key=lambda x: x[1]['count'], reverse=True)[:10]:
        print(f"  {skill}: {data['count']} uses, {data['success_rate']:.0%} success")
