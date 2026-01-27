---
name: markdown-table-formatter
description: Convert markdown tables to human-readable formats for Telegram, WhatsApp, Discord, and other platforms where markdown tables don't render. Use when users ask to format tables for messaging, convert tables to text, or need tables rendered in plain text.
---

# Markdown Table Formatter

**Purpose:** Convert markdown tables to human-readable text formats

## Auto-Preference System

The system automatically uses the best available option:

| Priority | Skill | Output | When Used |
|----------|-------|--------|-----------|
| 1st | `table-image` | PNG image | tablesnap in PATH (automatic) |
| 2nd | `markdown-table-formatter` | Text | tablesnap unavailable (fallback) |

## Automatic Behavior

You don't need to choose—Claude will:
1. **Try table-image first** if `tablesnap` is in PATH
2. **Fall back to text formatter** if tablesnap isn't available

## What This Does

Converts markdown tables like:

```markdown
| File | Purpose | Content Type |
|------|---------|--------------|
| Daily logs | Raw events | What happened |
| MEMORY.md | Curated memory | Lessons learned |
```

Into Telegram-friendly formats like:

```
📋 TABLE

FILE          │ PURPOSE       │ CONTENT TYPE
──────────────┼───────────────┼────────────────
Daily logs    │ Raw events    │ What happened
MEMORY.md     │ Curined memory│ Lessons learned
```

## Supported Platforms

| Platform | Format | Notes |
|----------|--------|-------|
| **Telegram** | Fixed-width ASCII | Clean monospace alignment |
| **WhatsApp** | Fixed-width ASCII | Same as Telegram |
| **Discord** | Block quotes + ASCII | Uses ▸ for bullets |
| **Signal** | Fixed-width | Clean text format |
| **Plain text** | Clean ASCII | Universal readability |

## Alternative: Table Image Generator (Preferred)

For prettier tables, use the `table-image` skill (installed via clawdhub):

**Preference Order:**
1. **table-image** → Generates PNG images (preferred for visual presentation)
2. **markdown-table-formatter** → Text-based conversion (fallback when images unavailable)

### When to Use Each

| Scenario | Use |
|----------|-----|
| Want visual polish, image is fine | `table-image` |
| Quick text-based conversion | `markdown-table-formatter` |
| tablesnap CLI not installed | Fall back to `markdown-table-formatter` |
| Accessibility/screen readers | `markdown-table-formatter` (text) |

## Options

### Output Styles

| Style | Description | Example |
|-------|-------------|---------|
| `grid` | Classic table with box-drawing characters | ┌────┬────┐ |
| `simple` | Simple ASCII with + and - | +----+----+ |
| `compact` | No borders, just spacing | Column values aligned |
| `bulleted` | Each row as a numbered list | 1. Key: Value |

### Usage Examples

**For Telegram (default):**
```bash
scripts/format_table.py --input "$TABLE"
```

**For Discord:**
```bash
scripts/format_table.py --input "$TABLE" --platform discord
```

**As bulleted list:**
```bash
scripts/format_table.py --input "$TABLE" --style bulleted
```

## Inline Usage

For quick conversions without the script, use this pattern:

```markdown
# Convert to text format

**Column 1** | **Column 2**
--- | ---
Value A | Value B
```

Becomes:

```
Column 1  | Column 2
----------|----------
Value A   | Value B
```

## When to Use

**Trigger phrases:**
- "format this table"
- "convert table to text"
- "table doesn't render"
- "make this readable"
- "table for Telegram"

**Use when:**
- Markdown tables won't render properly
- User asks for better table formatting
- Messaging platforms show raw markdown
- Tables need to be mobile-friendly

## Best Practices

1. **Keep columns under 4** - Tables with many columns become unreadable on mobile
2. **Shorten headers** - Use abbreviations if needed
3. **Consider bulleted style** - For 3+ columns, numbered lists often read better
4. **Add emoji prefixes** - Can help distinguish headers (📋, 📁, ⚙️)
