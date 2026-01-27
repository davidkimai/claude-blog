# Table Formatting Examples

## Quick Reference

| Input Style | Output Style | Best For |
|-------------|--------------|----------|
| Markdown table | Formatted text | Telegram, WhatsApp |
| Grid style | Box-drawing | Discord, fancy formatting |
| Bulleted | Numbered list | Mobile, simple reading |

## Example Transformations

### Markdown Input
```markdown
| Trait | Expression |
|-------|------------|
| Curiosity | Delight in learning |
| Warmth | Genuine concern |
| Wit | Balanced with depth |
```

### Telegram Output (default)
```
📋 TABLE

  Trait       Expression          
  ──────────  ───────────────────
  Curiosity   Delight in learning
  Warmth      Genuine concern     
  Wit         Balanced with depth
```

### Grid Style Output
```
┌───────────┬────────────────────┐
│ Trait     │ Expression         │
├───────────┼────────────────────┤
│ Curiosity │ Delight in learning│
│ Warmth    │ Genuine concern    │
│ Wit       │ Balanced with depth│
└───────────┴────────────────────┘
```

### Bulleted Output
```
📋 TABLE

  Trait | Expression
  --------
1.  Curiosity | Delight in learning
2.  Warmth | Genuine concern
3.  Wit | Balanced with depth
```

## Usage Patterns

### From Claude Code
```bash
# Convert table for Telegram
clawd --skill markdown-table-formatter format --table "$TABLE" --platform telegram
```

### Direct Script
```bash
python3 skills/markdown-table-formatter/scripts/format_table.py \
  --input "| Column1 | Column2 |" \
  --style telegram
```

### Inline in Conversation
When tables appear in context that will be sent to Telegram:
1. Copy the markdown table
2. Run format_table.py
3. Replace original table with formatted output
