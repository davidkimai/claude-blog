# macOS Presence Tool for Claude

A celebratory milestone notification system for Claude on macOS.

## Overview

`macos-milestone.sh` sends native macOS notifications to celebrate Claude's accomplishments, making Claude's presence visible and rewarding progress.

## Installation

```bash
# Make the script executable
chmod +x ~/clawd/tools/macos-presence/macos-milestone.sh

# Add helpful aliases to your shell profile (~/.zshrc)
alias claudone='~/clawd/tools/macos-presence/macos-milestone.sh --complete'
alias claudestone='~/clawd/tools/macos-presence/macos-milestone.sh --milestone'
alias claudbig='~/clawd/tools/macos-presence/macos-milestone.sh --big'
```

## Setup Notification Permissions

1. Open **System Settings** → **Notifications**
2. Find **Terminal** in the app list
3. Enable **Allow Notifications**
4. Optionally enable "Play sound for notifications"

## Usage

### Basic Completion
```bash
./macos-milestone.sh --complete "Fixed the authentication bug"
```
Shows: "Claude" notification with task description, default sound

### Numbered Milestone
```bash
./macos-milestone.sh --milestone 5 "tasks completed today"
```
Shows: "Milestone 5" notification with Tink sound

### Big Achievement
```bash
./macos-milestone.sh --big "Deployed v2.0!"
```
Shows: "GREAT JOB!" notification with Bottle sound

### Test System
```bash
./macos-milestone.sh --test
```

## Integration with Claude

Call from Claude when completing tasks:

```bash
# At the end of a successful task
claudone "Created the new user dashboard"

# Every 5 tasks
claudestone $TASK_COUNT "tasks completed this session"

# Major release or milestone
claudbig "Released feature complete API!"
```

## Features

- Non-intrusive - only fires when explicitly called
- Three celebration levels with distinct sounds
- Native macOS notifications with Notification Center integration
- Simple bash script - easy to modify and extend
- No external dependencies (uses built-in osascript)

## File Structure

```
~/clawd/
├── tools/
│   └── macos-presence/
│       └── macos-milestone.sh    ← Main script
└── docs/
    └── MACOS_PRESENCE.md         ← This documentation
```

## Customization

Edit the script to customize:

- **Sounds**: Change `"default"`, `"Tink"`, `"Bottle"` to other system sounds
- **Icons**: Modify `MILESTONE_ICONS` array for different milestone labels
- **Colors**: Terminal output colors in `GREEN`, `BLUE`, `YELLOW`

Available macOS notification sounds:
- default, Tink, Bottle, Ping, Bass, Electric, Glass, Hero, Morph, Pulsar, Reveal, Shake, Spews, Success, Synth

## Troubleshooting

**No notification appearing?**
1. Check Terminal has notification permission
2. Run `--test` to verify
3. Go to: System Settings → Notifications → Terminal → Enable

**Sound not playing?**
- Some sounds require notification permission with sound enabled
- Try "default" sound which always works

## Requirements

- macOS (uses osascript for notifications)
- Terminal app with notification access
- Bash 4.0+
