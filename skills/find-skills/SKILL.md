---
name: find-skills
description: Discover and install skills from the open agent skills ecosystem using the Skills CLI (npx skills). Use when users ask "how do I do X", "find a skill for X", "can you do X", or express interest in extending agent capabilities with specialized tools.
---

# Find Skills

Discover and install skills from the open agent skills ecosystem.

## What This Does

Uses the **Skills CLI** (`npx skills`) to search for and install modular skills that extend agent capabilities.

## Key Commands

| Command | Purpose |
|---------|---------|
| `npx skills find [query]` | Search for skills interactively |
| `npx skills add <owner/repo@skill>` | Install a specific skill |
| `npx skills check` | Check for skill updates |
| `npx skills update` | Update all installed skills |
| `npx skills init` | Create a new skill |

## When to Trigger

**Use when user says:**
- "How do I do X?" (X might have an existing skill)
- "Find a skill for X"
- "Is there a skill for X?"
- "Can you do X?" (X is a specialized capability)
- "I wish I had help with [domain]"
- "Extend agent capabilities"

## Usage Patterns

### Step 1: Search for Skills
```bash
npx skills find [keywords]

# Examples:
npx skills find react performance
npx skills find pr review
npx skills find changelog
npx skills find testing jest
```

### Step 2: Present Results
Found skills show install commands like:
```
Install with: npx skills add <owner/repo@skill>

Example:
vercel-labs/agent-skills@vercel-react-best-practices
└ https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices
```

### Step 3: Install for User
```bash
npx skills add <owner/repo@skill> -g -y
# -g = global (user-level) install
# -y = skip confirmation
```

## Common Search Categories

| Category | Example Queries |
|----------|----------------|
| **Web Dev** | react, nextjs, typescript, tailwind |
| **Testing** | testing, jest, playwright, e2e |
| **DevOps** | deploy, docker, kubernetes, ci-cd |
| **Docs** | docs, readme, changelog, api-docs |
| **Quality** | review, lint, refactor, best-practices |
| **Design** | ui, ux, design-system, a11y |
| **Productivity** | workflow, automation, git |

## Tips

- **Be specific:** "react testing" > "testing"
- **Try alternatives:** If "deploy" fails, try "deployment" or "ci-cd"
- **Popular sources:** vercel-labs/agent-skills, ComposioHQ/awesome-claude-skills

## If No Skills Found

```bash
# Acknowledge and offer alternatives
I searched for skills related to "[query]" but didn't find matches.

I can still help you directly! Or you could create a custom skill:
npx skills init my-custom-skill
```

## Browse All Skills

Visit: https://skills.sh/

## Example Workflow

1. User: "How do I make my React app faster?"
2. You: `npx skills find react performance`
3. Results show: `vercel-react-best-practices`
4. You: Present the skill with install command
5. User: "Install it"
6. You: `npx skills add vercel-labs/agent-skills@vercel-react-best-practices -g -y`
