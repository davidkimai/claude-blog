# Voice Notification System
**Build Date:** 2026-01-28 (Tonight!)
**Purpose:** Claude Hours speaks when important events happen

## Features
1. **Morning Intel Briefing (7 AM)**
   - "Good morning! Here's your daily intel..."
   - Reads top news from HN, GitHub, X

2. **Cycle Completion Alerts**
   - After each successful cycle: "Cycle X complete"

3. **System Health Reports**
   - "Memory at 85%, cycles at 116..."
   - Only report if attention needed

4. **Nightly Summary**
   - "You ran 116 cycles tonight..."

## TTS Options
1. macOS `say` (free, built-in)
2. ElevenLabs `sag` (high quality, needs API)
3. Clawdbot `tts` tool (if available)

## Implementation Plan
- [ ] Detect available TTS
- [ ] Create voice.sh integration script
- [ ] Add to claude-hours-notifier.sh
- [ ] Test at 7 AM tomorrow
