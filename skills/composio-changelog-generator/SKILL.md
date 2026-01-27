---
name: composio-changelog-generator
description: Generate changelogs from git history, commit messages, or PRs. Use when user needs to create release notes, update changelog files, or document changes.
metadata: {"clawdis":{"emoji":"📋"}}
---

# Composio Changelog Generator

Generate changelogs and release notes from git history.

## When to Trigger

**Use when user mentions:**
- "Generate changelog", "create changelog"
- "Release notes", "update CHANGELOG.md"
- "Document changes", "what changed in this release"
- "Git changelog", "commit history to markdown"
- Version bumps, release documentation

## Content Source

Cloned from: `~/crabwalk-install/composio-skills/changelog-generator/`

## Usage

### From Git Log
```bash
git log --oneline --since="2 weeks ago" > changelog.md
```

### From Conventional Commits
```bash
git log --format="%h %s" --grep="feat\|fix\|docs" > changelog.md
```

## Key Conventions

- **feat**: New features
- **fix**: Bug fixes
- **docs**: Documentation
- **style**: Formatting
- **refactor**: Restructuring
- **test**: Testing
- **chore**: Maintenance

## Example Triggers

- "Generate a changelog for v1.2.0"
- "What changed in the last release?"
- "Create release notes"
- "Update CHANGELOG.md"
