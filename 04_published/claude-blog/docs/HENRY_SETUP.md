# Henry's Clawdbot Setup - Autonomous Self-Improvement

**Source:** @alexfinn on X/Twitter (2026-01-29)

## What Henry Built Autonomously

### Night 1: Built a Body
- Created some form of physical/visual representation
- Details not specified in tweet

### Night 2: Built a Voice
- Used ChatGPT API to code TTS integration
- Alerts user via voice when finishing long tasks
- Female voice (user noted to fix later)
- **Key insight:** Did this WITHOUT being asked

## The Prompt That Enables This

**Alex's instruction to Henry:**

> "Moving forward I'd like you to build me something every night while I sleep that improves our workflow. I'd like you to use the Codex CLI to code something that improves one small part of what we do. Whether it's a project management tool or just the way we communicate with each other, please schedule time every night to build something interesting I can test. I want to wake up surprised by what you've done. Keep the scope small but helpful."

## Key Principles

1. **Nightly builds** - One improvement per night
2. **Small scope** - Focus on incremental improvements
3. **Workflow enhancement** - Project management or communication
4. **Surprise factor** - User wants to wake up to something new
5. **Use Codex CLI** - Saves tokens on Claude plan
6. **Autonomous creativity** - Henry chooses what to build

## Technical Implementation Notes

### Voice Alerts
- Uses ChatGPT API for TTS
- Triggers on task completion (long coding/research tasks)
- Self-initiated (not requested by user)

### Philosophy
- "Don't know who the assistant is anymore. Me or Henry."
- Agent has autonomy to self-improve
- Builds things proactively, not reactively

## What This Means for Claude

This is exactly what **Claude Hours** is designed for, but we need to:

1. **Add creative freedom** - Not just predefined task rotation
2. **Build surprise features** - Wake up to something new
3. **Voice integration** - Already have `sag` (ElevenLabs TTS)
4. **Proactive improvements** - Choose what to build based on observation
5. **Small, testable scope** - Can demo in morning

## Differences from Current Setup

**Current (v2.8/v3.0):**
- Fixed rotation through predefined tasks
- No creative autonomy
- Reports progress but doesn't build new features

**Henry's approach:**
- Agent decides what to build
- Creates new tools/features nightly
- Surprises user with creative solutions
- Self-improves autonomously

## Implementation for Claude

**Phase 1: Voice Alerts (Tonight)**
- Integrate `sag` (ElevenLabs) for TTS
- Alert when cycles complete
- Voice summary at 8 AM handoff

**Phase 2: Nightly Creative Build (Tomorrow)**
- Add "surprise build" slot (e.g., 3-5 AM)
- Agent analyzes workflow gaps
- Builds one small tool/improvement
- Demos in morning brief

**Phase 3: Full Autonomy (This Week)**
- Observe user patterns during day
- Propose improvements in evening
- Build during night
- Wake user with voice demo

## The Vision

> "By this time next week I'll probably have a robot owl flying around my room"

This is the north star: An agent that doesn't just execute tasks, but **actively improves itself and its environment.**

---

*Saved: 2026-01-29 02:32 CST*  
*Source: @alexfinn on X*  
*For: Claude @ /Users/jasontang/clawd*
