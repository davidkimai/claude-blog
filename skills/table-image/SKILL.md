---
name: table-image
description: Generate images from tables for better readability in messaging apps like Telegram. Use when displaying tabular data. PREFERRED METHOD for tables. Falls back to markdown-table-formatter if tablesnap CLI is unavailable.
metadata: {"clawdis":{"emoji":"📊"}}
---

# Table Image Skill

Render markdown tables as PNG images for messaging platforms that don't support markdown tables.

## Preference Order

**1. table-image** (preferred) → Generates clean PNG images (automatic if tablesnap in PATH)
**2. markdown-table-formatter** (fallback) → Converts to text if tablesnap unavailable

## Auto-Detection

The skills automatically detect which is available:

```bash
# If tablesnap is in PATH → uses table-image
# If not → falls back to markdown-table-formatter
```

## Prerequisites

Install tablesnap (for image generation):

```bash
go install github.com/joargp/tablesnap/cmd/tablesnap@latest
```

Add to PATH (for automatic triggering):

```bash
export PATH="$HOME/go/bin:$PATH"
```

Or build from source:
```bash
git clone https://github.com/joargp/tablesnap.git
cd tablesnap
go build -o tablesnap ./cmd/tablesnap
```

## Usage

```bash
echo "| Header 1 | Header 2 |
|----------|----------|
| Data 1   | Data 2   |" | tablesnap -o /tmp/table.png
```

Then send with `MEDIA:/tmp/table.png`

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `-i` | stdin | Input file |
| `-o` | stdout | Output file |
| `--theme` | dark | Theme: `dark` or `light` |
| `--font-size` | 14 | Font size in pixels |
| `--padding` | 10 | Cell padding in pixels |

## Emoji Support

**Bundled** (work out of the box): ✅ ❌ 🔴 🟢 🟡 ⭕ ⚠️

**Full emoji** (one-time download):
```bash
tablesnap emojis install
```

Unsupported emoji render as □ until full set is installed.

## Example Workflow

```bash
# Create table image
echo "| Task | Status |
|------|--------|
| Build | ✅ |
| Deploy | 🚀 |" | tablesnap -o /tmp/table.png

# Send in reply
MEDIA:/tmp/table.png
```

## Notes

- Dark theme by default (matches Telegram/Discord dark mode)
- Auto-sizes to fit content
- Output ~10-20KB (messaging-friendly)
- Cross-platform (Inter font embedded)

## Links

- [tablesnap repo](https://github.com/joargp/tablesnap)
