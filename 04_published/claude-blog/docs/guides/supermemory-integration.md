# SuperMemory Integration for Claude Hours
**AI-Powered Long-Term Memory**

## Overview

Integrate [SuperMemory](https://supermemory.ai) with Claude Hours for:
- Automatic memory recall before every task
- Automatic memory capture after every task
- Semantic search across all memories
- User profile persistence
- Memory that compounds across conversations

Official plugin: [github.com/supermemoryai/clawdbot-supermemory](https://github.com/supermemoryai/clawdbot-supermemory)

## Option 1: Full ClawdBot Plugin (Recommended)

If you have ClawdBot gateway installed:

```bash
# Install the official plugin
npx clawdbot plugins install @supermemoryai/clawdbot-supermemory

# Set API key
export SUPERMEMORY_CLAWDBOT_API_KEY="sm_your_key_here"

# Restart ClawdBot
clawdbot gateway restart
```

### Plugin Features (Official)
- ✅ Auto-recall before every AI turn
- ✅ Auto-capture after every turn
- ✅ `/remember` and `/recall` slash commands
- ✅ AI tools: supermemory_store, supermemory_search, supermemory_forget, supermemory_profile
- ✅ Cross-platform memory (Telegram, WhatsApp, Discord, etc.)

## Option 2: Claude Hours Standalone Integration

For Claude Hours without full ClawdBot gateway:

### Setup

```bash
# 1. Get API key: https://console.supermemory.ai/keys

# 2. Configure
./scripts/claude-hours-supermemory.sh setup

# 3. Test
./scripts/claude-hours-supermemory.sh remember "Test memory"
./scripts/claude-hours-supermemory.sh recall "Test"
```

### Commands

| Command | Description |
|---------|-------------|
| `remember <text> [url]` | Save to memory |
| `recall <query> [limit]` | Search memories |
| `profile` | View user profile |
| `forget <query>` | Delete memories |
| `auto-recall [context]` | For Claude Hours |
| `auto-capture <task> <result>` | After tasks |

### Claude Hours Integration

Add to task rotation (scripts/claude-autonomous-loop-simple.sh):

```bash
6)  # SuperMemory Recall
    CONTEXT=$(./scripts/claude-hours-supermemory.sh auto-recall "recent tasks" 2>/dev/null | head -20)
    PROMPT="Review SuperMemory: $CONTEXT. Apply to current task."
    ;;
```

After task completion:
```bash
./scripts/claude-hours-supermemory.sh auto-capture "$TASK_DESC" "$result"
```

## Memory Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Hours Memory                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │  Three-Layer     │    │   SuperMemory    │              │
│  │  Memory          │    │   (Cloud)        │              │
│  │  (Local)         │    │                  │              │
│  │                  │    │ • Semantic       │              │
│  │ • Facts          │    │ • Cross-platform │              │
│  │ • Entities       │    │ • Profile        │              │
│  │ • Timeline       │    │ • Easy API       │              │
│  └────────┬─────────┘    └────────┬─────────┘              │
│           │                       │                         │
│           └───────────┬───────────┘                         │
│                       ↓                                      │
│           ┌─────────────────────┐                           │
│           │  Claude Hours       │                           │
│           │  Autonomous Loop    │                           │
│           │  (99 cycles/night)  │                           │
│           └─────────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## API Reference

### Environment Variables

```bash
SUPERMEMORY_CLAWDBOT_API_KEY="sm_..."  # In .env.supermemory
```

### Files

```
CLAWD/
├── scripts/
│   ├── claude-hours-supermemory.sh    # CLI tool
│   └── setup-supermemory.sh          # Setup assistant
├── memory/
│   └── supermemory-recall.md        # Auto-recall outputs
└── .env.supermemory                 # API key (gitignored)
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API key not found | Run `./scripts/claude-hours-supermemory.sh setup` |
| No search results | Add more memories first, try different queries |
| Permission denied | `chmod +x scripts/claude-hours-supermemory.sh` |

## Comparison

| Feature | Three-Layer Memory | SuperMemory |
|---------|-------------------|-------------|
| Storage | Local filesystem | Cloud API |
| Search | Simple grep | Semantic/similarity |
| Profile | Manual | Auto-built |
| Cross-platform | No | Yes |
| Cost | Free | Freemium |
| Setup | Complex | Simple |
| Claude Hours | ✅ Native | ✅ CLI integration |

**Recommendation:** Use **both** - Three-Layer for local compound memory, SuperMemory for semantic search and cross-platform context!

## References

- [GitHub: supermemoryai/clawdbot-supermemory](https://github.com/supermemoryai/clawdbot-supermemory)
- [SuperMemory Docs](https://supermemory.ai/docs)
- [ClawdBot Integration](https://supermemory.ai/docs/integrations/clawdbot)
- [API Keys](https://console.supermemory.ai/keys)

---

*Generated for Claude Hours SuperMemory Integration*
