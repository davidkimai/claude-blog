# SuperMemory Integration for Claude Hours
**AI-Powered Long-Term Memory**

## Overview

Integrate [SuperMemory](https://supermemory.ai) with Claude Hours for:
- Automatic memory recall before every task
- Automatic memory capture after every task
- Semantic search across all memories
- User profile persistence
- Memory that compounds across conversations

## Setup

### 1. Get API Key

```bash
# Get your free API key from:
https://console.supermemory.ai/keys
```

### 2. Configure API Key

```bash
# Run the setup script
./scripts/claude-hours-supermemory.sh setup

# Or manually create the config
echo 'SUPERMEMORY_CLAWDBOT_API_KEY="sm_your_key_here"' > .env.supermemory
```

### 3. Test Integration

```bash
# Remember something
./scripts/claude-hours-supermemory.sh remember "I prefer async communication over calls"

# Search memories
./scripts/claude-hours-supermemory.sh recall "communication preferences"

# View profile
./scripts/claude-hours-supermemory.sh profile
```

## Claude Hours Integration

### Task Rotation (Updated - Cycle 6)

Add SuperMemory recall to Claude Hours task rotation:

```bash
# In scripts/claude-autonomous-loop-simple.sh, add:

6)  # SuperMemory Recall
    CONTEXT=$(./scripts/claude-hours-supermemory.sh auto-recall "Claude Hours recent tasks" 2>/dev/null | head -20)
    PROMPT="Review SuperMemory recall: $CONTEXT. How does this relate to current tasks? Any relevant context?"
    TASK_TYPE="SuperMemory Recall"
    OUTPUT_FILE="memory/supermemory-recall.md"
    ;;
```

### Automatic Capture

After each task completes:

```bash
# In the task completion section:
if [ "$result" = "success" ]; then
    # Capture to SuperMemory
    ./scripts/claude-hours-supermemory.sh auto-capture "$TASK_DESC" "Completed successfully" 2>/dev/null || true
fi
```

## API Reference

### Commands

| Command | Description |
|---------|-------------|
| `./scripts/claude-hours-supermemory.sh remember <text> [url]` | Save to memory |
| `./scripts/claude-hours-supermemory.sh recall <query> [limit]` | Search memories |
| `./scripts/claude-hours-supermemory.sh profile` | View user profile |
| `./scripts/claude-hours-supermemory.sh forget <query>` | Delete memories |
| `./scripts/claude-hours-supermemory.sh auto-recall [context]` | For Claude Hours |
| `./scripts/claude-hours-supermemory.sh auto-capture <task> <result>` | After tasks |

### Configuration

| Env Variable | Location |
|--------------|----------|
| `SUPERMEMORY_CLAWDBOT_API_KEY` | `.env.supermemory` |

## File Structure

```
CLAWD/
├── scripts/
│   ├── claude-hours-supermemory.sh    # Main integration script
│   └── setup-supermemory.sh          # Setup assistant
├── memory/
│   └── supermemory-recall.md        # Auto-recall outputs
└── .env.supermemory                 # API key (gitignored)
```

## Benefits for Claude Hours

### Before Each Task
- Recall relevant context from SuperMemory
- User preferences
- Past task outcomes
- Project context

### After Each Task  
- Automatically capture task outcome
- Store learnings
- Build compound memory

### Weekly Synthesis
- SuperMemory provides semantic search
- Find patterns across conversations
- Extract persistent facts

## Comparison: Three-Layer Memory vs SuperMemory

| Feature | Three-Layer Memory | SuperMemory |
|---------|-------------------|-------------|
| Storage | Local filesystem | Cloud API |
| Search | Simple grep | Semantic/similarity |
| Profile | Manual | Auto-built |
| Deduplication | Basic | Advanced |
| Cross-platform | No | Yes |
| Cost | Free | Freemium |
| Setup | Complex | Simple |

**Recommendation:** Use **both!**
- Three-Layer: Local, compound, free
- SuperMemory: Cloud, semantic, easy

## Troubleshooting

### "API key not configured"
```bash
./scripts/claude-hours-supermemory.sh setup
```

### "No results"
- Check API key is valid
- Try different search terms
- Add more memories first

### Permission denied
```bash
chmod +x scripts/claude-hours-supermemory.sh
```

## Next Steps

1. ✅ Run setup: `./scripts/claude-hours-supermemory.sh setup`
2. ✅ Test recall: `./scripts/claude-hours-supermemory.sh recall "test"`
3. 🔄 Integrate with Claude Hours (optional)
4. 📊 Monitor memory growth

## References

- [SuperMemory Docs](https://supermemory.ai/docs)
- [ClawdBot Integration](https://supermemory.ai/docs/integrations/clawdbot)
- [API Keys](https://console.supermemory.ai/keys)

---

*Generated for Claude Hours SuperMemory Integration*
*Timestamp: $(date '+%Y-%m-%d %H:%M:%S')*
