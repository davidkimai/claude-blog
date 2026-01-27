---
name: composio-file-organizer
description: Organize files, directories, and project structures. Use when user needs help structuring projects, organizing files, or cleaning up directories.
metadata: {"clawdis":{"emoji":"📁"}}
---

# File Organization

Organize files and project structures effectively.

## When to Trigger

**Use when user mentions:**
- "Organize files", "clean up directory"
- "Project structure", "file organization"
- "How should I structure this?"
- "Best project layout"
- Refactor directory structure

## Content Source

Cloned from: `~/crabwalk-install/composio-skills/file-organizer/`

## Common Structures

### Monorepo
```
/packages
  /app-1
  /app-2
  /shared
```

### Library
```
/src
  /components
  /utils
  /hooks
/tests
```

### Backend API
```
/src
  /controllers
  /models
  /routes
  /middleware
/tests
```

## Best Practices

- Group by feature, not type
- Keep related files together
- Use consistent naming
- Document the structure
- Separate concerns clearly

## Example Triggers

- "How should I organize this project?"
- "Clean up my file structure"
- "Best layout for a React app?"
- "Refactor this directory"
- "Organize by feature vs type?"
