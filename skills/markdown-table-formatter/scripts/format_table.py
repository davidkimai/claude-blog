#!/usr/bin/env python3
"""
Markdown Table Formatter

Converts markdown tables to human-readable formats for messaging platforms
where markdown tables don't render properly (Telegram, WhatsApp, Discord, etc.)
"""

import argparse
import sys
import re
from typing import List, Tuple, Optional


def parse_markdown_table(markdown_table: str) -> Tuple[List[str], List[List[str]]]:
    """
    Parse a markdown table into headers and rows.
    
    Returns:
        Tuple of (headers, rows) where headers is list of column names
        and rows is list of lists containing cell values
    """
    lines = [line.strip() for line in markdown_table.strip().split('\n') if line.strip()]
    
    if len(lines) < 2:
        raise ValueError("Table must have at least a header row and separator row")
    
    headers = []
    rows = []
    
    for i, line in enumerate(lines):
        # Skip separator row (contains only -, :, |)
        if i == 1 and re.match(r'^[\s\|:\-\+]+$', line.replace('|', '')):
            continue
            
        # Parse cells (split by |, ignore leading/trailing |)
        cells = [cell.strip() for cell in line.strip('|').split('|')]
        
        if i == 0:
            headers = cells
        else:
            rows.append(cells)
    
    return headers, rows


def calculate_column_widths(headers: List[str], rows: List[List[str]]) -> List[int]:
    """Calculate maximum width needed for each column."""
    widths = [len(h) for h in headers]
    for row in rows:
        for i, cell in enumerate(row):
            widths[i] = max(widths[i], len(cell))
    return widths


def format_simple(headers: List[str], rows: List[List[str]], widths: List[int]) -> str:
    """Format as simple ASCII table with +---+ borders."""
    lines = []
    
    # Header separator
    sep = '+' + '+'.join('-' * (w + 2) for w in widths) + '+'
    
    # Header row
    header_row = '| ' + ' | '.join(h.ljust(w) for h, w in zip(headers, widths)) + ' |'
    
    lines.append(header_row)
    lines.append(sep)
    
    # Data rows
    for row in rows:
        # Pad row to match header count
        padded_row = row + [''] * (len(headers) - len(row))
        data_row = '| ' + ' | '.join(str(c).ljust(w) for c, w in zip(padded_row, widths)) + ' |'
        lines.append(data_row)
    
    return '\n'.join(lines)


def format_grid(headers: List[str], rows: List[List[str]], widths: List[int]) -> str:
    """Format with box-drawing characters (┌─┬┐)."""
    lines = []
    
    # Top border
    top = '┌' + '┬'.join('─' * (w + 2) for w in widths) + '┐'
    
    # Header row with borders
    header_row = '│ ' + ' │ '.join(h.ljust(w) for h, w in zip(headers, widths)) + ' │'
    
    # Separator
    sep = '├' + '┼'.join('─' * (w + 2) for w in widths) + '┤'
    
    # Bottom border
    bottom = '└' + '┴'.join('─' * (w + 2) for w in widths) + '┘'
    
    lines.extend([top, header_row, sep])
    
    for row in rows:
        padded_row = row + [''] * (len(headers) - len(row))
        data_row = '│ ' + ' │ '.join(str(c).ljust(w) for c, w in zip(padded_row, widths)) + ' │'
        lines.append(data_row)
    
    lines.append(bottom)
    return '\n'.join(lines)


def format_compact(headers: List[str], rows: List[List[str]], widths: List[int]) -> str:
    """Format without borders, just aligned text."""
    lines = []
    lines.append('  '.join(h.ljust(w) for h, w in zip(headers, widths)))
    lines.append('  '.join('─' * w for w in widths))
    for row in rows:
        padded_row = row + [''] * (len(headers) - len(row))
        lines.append('  '.join(str(c).ljust(w) for c, w in zip(padded_row, widths)))
    return '\n'.join(lines)


def format_bulleted(headers: List[str], rows: List[List[str]]) -> str:
    """Format as numbered list with key-value pairs."""
    lines = []
    lines.append("📋 TABLE")
    lines.append("")
    
    # Headers as column headers
    header_line = '  ' + ' | '.join(headers)
    lines.append(header_line)
    lines.append('  ' + '---' * len(headers))
    
    for i, row in enumerate(rows, 1):
        padded_row = row + [''] * (len(headers) - len(row))
        line = f"{i}.  " + ' | '.join(str(c) for c in padded_row)
        lines.append(line)
    
    return '\n'.join(lines)


def format_telegram(headers: List[str], rows: List[List[str]], widths: List[int]) -> str:
    """Telegram-optimized format with clean alignment."""
    lines = []
    lines.append("📋 TABLE")
    lines.append("")
    
    # Header
    header = '  ' + '  '.join(h.ljust(w) for h, w in zip(headers, widths))
    lines.append(header)
    
    # Separator
    sep = '  ' + '  '.join('─' * w for w in widths)
    lines.append(sep)
    
    # Rows
    for row in rows:
        padded_row = row + [''] * (len(headers) - len(row))
        data = '  ' + '  '.join(str(c).ljust(w) for c, w in zip(padded_row, widths))
        lines.append(data)
    
    return '\n'.join(lines)


def format_discord(headers: List[str], rows: List[List[str]]) -> str:
    """Discord-optimized format with block quotes."""
    lines = []
    lines.append("📋 **TABLE**")
    lines.append("")
    
    for i, row in enumerate(rows):
        padded_row = row + [''] * (len(headers) - len(row))
        line = f"▸  **{headers[0]}**: {padded_row[0]}"
        if len(padded_row) > 1:
            for j, cell in enumerate(padded_row[1:], 1):
                line += f" | {headers[j]}: {cell}"
        lines.append(line)
    
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Convert markdown tables to human-readable formats"
    )
    parser.add_argument('--input', '-i', required=True, help="Markdown table input")
    parser.add_argument('--platform', '-p', default='telegram',
                        choices=['telegram', 'whatsapp', 'discord', 'signal', 'plain'],
                        help='Target platform')
    parser.add_argument('--style', '-s', default='telegram',
                        choices=['grid', 'simple', 'compact', 'bulleted', 'telegram', 'discord'],
                        help='Output style')
    
    args = parser.parse_args()
    
    try:
        headers, rows = parse_markdown_table(args.input)
        widths = calculate_column_widths(headers, rows)
        
        if args.style == 'grid':
            result = format_grid(headers, rows, widths)
        elif args.style == 'simple':
            result = format_simple(headers, rows, widths)
        elif args.style == 'compact':
            result = format_compact(headers, rows, widths)
        elif args.style == 'bulleted':
            result = format_bulleted(headers, rows)
        elif args.style == 'discord':
            result = format_discord(headers, rows)
        else:
            # Default to telegram style
            result = format_telegram(headers, rows, widths)
        
        print(result)
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
