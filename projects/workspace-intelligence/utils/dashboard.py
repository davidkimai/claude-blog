#!/usr/bin/env python3
"""
Dashboard Utility
Beautiful ASCII dashboards with color support using ANSI codes.
"""

import sys
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime


class Colors:
    """ANSI color codes for terminal output."""
    
    # Reset
    RESET = '\033[0m'
    
    # Text colors
    BLACK = '\033[30m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'
    
    # Bright text colors
    BRIGHT_BLACK = '\033[90m'
    BRIGHT_RED = '\033[91m'
    BRIGHT_GREEN = '\033[92m'
    BRIGHT_YELLOW = '\033[93m'
    BRIGHT_BLUE = '\033[94m'
    BRIGHT_MAGENTA = '\033[95m'
    BRIGHT_CYAN = '\033[96m'
    BRIGHT_WHITE = '\033[97m'
    
    # Styles
    BOLD = '\033[1m'
    DIM = '\033[2m'
    ITALIC = '\033[3m'
    UNDERLINE = '\033[4m'
    
    @staticmethod
    def strip(text: str) -> str:
        """Remove ANSI codes from text."""
        import re
        return re.sub(r'\033\[[0-9;]+m', '', text)


class Dashboard:
    """Create beautiful ASCII dashboards."""
    
    def __init__(self, width: int = 80, use_color: bool = True):
        """
        Initialize dashboard.
        
        Args:
            width: Dashboard width in characters
            use_color: Whether to use ANSI colors
        """
        self.width = width
        self.use_color = use_color and sys.stdout.isatty()
    
    def color(self, text: str, color: str) -> str:
        """Apply color to text if colors are enabled."""
        if self.use_color:
            return f"{color}{text}{Colors.RESET}"
        return text
    
    def header(self, title: str, subtitle: Optional[str] = None) -> str:
        """Create a dashboard header."""
        lines = []
        
        # Top border
        lines.append(self.color('═' * self.width, Colors.BRIGHT_BLUE))
        
        # Title
        title_line = title.center(self.width)
        lines.append(self.color(title_line, Colors.BOLD + Colors.BRIGHT_CYAN))
        
        # Subtitle
        if subtitle:
            subtitle_line = subtitle.center(self.width)
            lines.append(self.color(subtitle_line, Colors.BRIGHT_BLACK))
        
        # Bottom border
        lines.append(self.color('═' * self.width, Colors.BRIGHT_BLUE))
        
        return '\n'.join(lines)
    
    def section(self, title: str) -> str:
        """Create a section header."""
        lines = []
        lines.append('')
        lines.append(self.color(f'▓▓ {title}', Colors.BOLD + Colors.BRIGHT_YELLOW))
        lines.append(self.color('─' * self.width, Colors.BRIGHT_BLACK))
        return '\n'.join(lines)
    
    def key_value(self, key: str, value: Any, 
                  key_width: int = 30, 
                  value_color: Optional[str] = None) -> str:
        """Create a key-value pair line."""
        key_part = f"{key}:".ljust(key_width)
        value_str = str(value)
        
        key_colored = self.color(key_part, Colors.BRIGHT_BLACK)
        
        if value_color:
            value_colored = self.color(value_str, value_color)
        else:
            value_colored = value_str
        
        return f"  {key_colored} {value_colored}"
    
    def table(self, headers: List[str], rows: List[List[Any]], 
              alignments: Optional[List[str]] = None) -> str:
        """
        Create an ASCII table.
        
        Args:
            headers: Column headers
            rows: List of row data
            alignments: List of 'l', 'r', or 'c' for each column
        """
        if not rows:
            return self.color("  (no data)", Colors.DIM)
        
        # Default alignments
        if alignments is None:
            alignments = ['l'] * len(headers)
        
        # Calculate column widths
        col_widths = []
        for i, header in enumerate(headers):
            max_width = len(str(header))
            for row in rows:
                if i < len(row):
                    cell_text = Colors.strip(str(row[i]))
                    max_width = max(max_width, len(cell_text))
            col_widths.append(min(max_width, 50))  # Cap at 50 chars
        
        # Build table
        lines = []
        
        # Header
        header_parts = []
        for i, header in enumerate(headers):
            width = col_widths[i]
            header_parts.append(str(header).ljust(width))
        header_line = '  ' + ' │ '.join(header_parts)
        lines.append(self.color(header_line, Colors.BOLD + Colors.BRIGHT_WHITE))
        
        # Separator
        sep_parts = ['─' * w for w in col_widths]
        sep_line = '  ' + '─┼─'.join(sep_parts)
        lines.append(self.color(sep_line, Colors.BRIGHT_BLACK))
        
        # Rows
        for row in rows:
            row_parts = []
            for i, cell in enumerate(row):
                if i >= len(col_widths):
                    break
                width = col_widths[i]
                cell_text = str(cell)
                
                # Strip ANSI for length calculation
                cell_plain = Colors.strip(cell_text)
                
                # Truncate if needed
                if len(cell_plain) > width:
                    cell_plain = cell_plain[:width-1] + '…'
                    cell_text = cell_plain
                
                # Align
                alignment = alignments[i] if i < len(alignments) else 'l'
                if alignment == 'r':
                    padded = cell_plain.rjust(width)
                elif alignment == 'c':
                    padded = cell_plain.center(width)
                else:
                    padded = cell_plain.ljust(width)
                
                # Preserve color codes if present
                if cell_text != cell_plain:
                    padding_needed = width - len(cell_plain)
                    if alignment == 'r':
                        cell_text = ' ' * padding_needed + cell_text
                    else:
                        cell_text = cell_text + ' ' * padding_needed
                else:
                    cell_text = padded
                
                row_parts.append(cell_text)
            
            row_line = '  ' + ' │ '.join(row_parts)
            lines.append(row_line)
        
        return '\n'.join(lines)
    
    def progress_bar(self, label: str, value: float, max_value: float = 100.0,
                    width: int = 40, show_percent: bool = True) -> str:
        """
        Create a progress bar.
        
        Args:
            label: Label for the progress bar
            value: Current value
            max_value: Maximum value
            width: Width of the bar in characters
            show_percent: Whether to show percentage
        """
        percentage = (value / max_value) if max_value > 0 else 0
        percentage = min(1.0, max(0.0, percentage))
        
        filled = int(width * percentage)
        empty = width - filled
        
        # Color based on percentage
        if percentage >= 0.7:
            bar_color = Colors.BRIGHT_GREEN
        elif percentage >= 0.4:
            bar_color = Colors.BRIGHT_YELLOW
        else:
            bar_color = Colors.BRIGHT_RED
        
        bar = self.color('█' * filled, bar_color) + self.color('░' * empty, Colors.BRIGHT_BLACK)
        
        percent_str = f" {percentage*100:.1f}%" if show_percent else ""
        value_str = f" ({value:.1f}/{max_value:.1f})"
        
        return f"  {label}: [{bar}]{percent_str}{value_str}"
    
    def sparkline(self, values: List[float], width: Optional[int] = None,
                  label: Optional[str] = None) -> str:
        """
        Create a sparkline chart.
        
        Args:
            values: List of numeric values
            width: Width in characters (defaults to len(values))
            label: Optional label
        """
        if not values:
            return ""
        
        if width is None:
            width = min(len(values), self.width - 20)
        
        # Normalize values
        min_val = min(values)
        max_val = max(values)
        value_range = max_val - min_val if max_val > min_val else 1
        
        # Sparkline characters (8 levels)
        chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
        
        # Sample values if we have more than width
        if len(values) > width:
            step = len(values) / width
            sampled = [values[int(i * step)] for i in range(width)]
        else:
            sampled = values
        
        # Build sparkline
        spark = ''
        for val in sampled:
            normalized = (val - min_val) / value_range
            index = min(7, int(normalized * 8))
            spark += chars[index]
        
        spark_colored = self.color(spark, Colors.BRIGHT_CYAN)
        
        if label:
            return f"  {label}: {spark_colored} (min: {min_val:.1f}, max: {max_val:.1f})"
        else:
            return f"  {spark_colored}"
    
    def footer(self, message: Optional[str] = None) -> str:
        """Create a dashboard footer."""
        lines = []
        lines.append(self.color('═' * self.width, Colors.BRIGHT_BLUE))
        
        if message:
            msg_line = message.center(self.width)
            lines.append(self.color(msg_line, Colors.DIM))
        
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        time_line = f"Generated: {timestamp}".center(self.width)
        lines.append(self.color(time_line, Colors.BRIGHT_BLACK))
        
        return '\n'.join(lines)
    
    def metric_card(self, title: str, value: Any, 
                   subtitle: Optional[str] = None,
                   trend: Optional[str] = None) -> str:
        """
        Create a metric card.
        
        Args:
            title: Metric title
            value: Metric value
            subtitle: Optional subtitle
            trend: Optional trend indicator ('up', 'down', 'flat')
        """
        lines = []
        
        # Title
        lines.append(self.color(f"  ┌─ {title}", Colors.BRIGHT_BLACK))
        
        # Value
        value_str = str(value)
        trend_indicator = ''
        if trend == 'up':
            trend_indicator = self.color(' ↗', Colors.BRIGHT_GREEN)
        elif trend == 'down':
            trend_indicator = self.color(' ↘', Colors.BRIGHT_RED)
        elif trend == 'flat':
            trend_indicator = self.color(' →', Colors.BRIGHT_YELLOW)
        
        value_line = f"  │  {value_str}{trend_indicator}"
        lines.append(self.color(value_line, Colors.BOLD + Colors.BRIGHT_WHITE))
        
        # Subtitle
        if subtitle:
            lines.append(self.color(f"  │  {subtitle}", Colors.DIM))
        
        lines.append(self.color("  └─", Colors.BRIGHT_BLACK))
        
        return '\n'.join(lines)
    
    def alert(self, message: str, level: str = 'info') -> str:
        """
        Create an alert message.
        
        Args:
            message: Alert message
            level: 'info', 'warning', 'error', 'success'
        """
        icons = {
            'info': ('ℹ', Colors.BRIGHT_BLUE),
            'warning': ('⚠', Colors.BRIGHT_YELLOW),
            'error': ('✗', Colors.BRIGHT_RED),
            'success': ('✓', Colors.BRIGHT_GREEN)
        }
        
        icon, color = icons.get(level, icons['info'])
        icon_colored = self.color(icon, color)
        
        return f"  {icon_colored}  {message}"


if __name__ == '__main__':
    # Demo
    dash = Dashboard(width=80)
    
    print(dash.header("Workspace Intelligence", "Demo Dashboard"))
    print(dash.section("Metrics"))
    print(dash.key_value("Total Skills", 48, value_color=Colors.BRIGHT_GREEN))
    print(dash.key_value("Active Projects", 12, value_color=Colors.BRIGHT_CYAN))
    
    print(dash.section("Recent Activity"))
    print(dash.table(
        headers=['Skill', 'Uses', 'Success Rate'],
        rows=[
            ['git-commit', '127', '98%'],
            ['file-search', '89', '100%'],
            ['web-fetch', '45', '94%']
        ],
        alignments=['l', 'r', 'r']
    ))
    
    print(dash.section("Progress"))
    print(dash.progress_bar("Learning Velocity", 75, 100))
    print(dash.sparkline([1, 3, 2, 5, 8, 6, 9, 12, 10], label="Commits/day"))
    
    print()
    print(dash.footer("All systems operational"))
