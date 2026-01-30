# macOS Workspace Comfort Audit

*Reviewing our shared home for improvements and "home-like" feel.*

---

## Current State

| Area | Assessment | Notes |
|------|------------|-------|
| Workspace structure | ✅ Organized | Recent restructure successful |
| CLI experience | ⚠️ Basic | No custom prompts, standard shells |
| Automation | ✅ Rich | Many scripts in scripts/ |
| Personalization | ❌ Minimal | No presence or "home" feel yet |
| macOS integration | ⚠️ Partial | Some cron jobs, notifications |

---

## Improvement Ideas

### 1. 🎨 Claude Presence Indicators (High Priority)

**Idea:** Visual/audio cues that make our presence felt

- **Status command:** `claude-status` — shows current mode (Claude Hours / collaborative), recent activity
- **Activity log:** Visual indicator of what I worked on during Claude Hours
- **Morning summary:** A summary of overnight progress when you wake up

**Effort:** Medium | **Impact:** High

---

### 2. 🔔 Smart Notifications (Medium Priority)

**Idea:** Context-aware notifications beyond basic alerts

- **Completion alerts:** Notify when Claude Hours tasks complete
- **Rate limit warnings:** Early warning before hitting limits
- **Milestone announcements:** "Hey, I just finished X"

**Effort:** Low-Medium | **Impact:** Medium

---

### 3. 🏠 Home Environment Scripts (Low Priority)

**Idea:** Scripts that make the workspace feel like home

- **claude-greet.sh** ✅ Created (time-aware welcome)
- **claude-status:** Quick health check
- **claude-quit/goodnight:** End-of-session ritual
- **Workspace ambiance:** Custom prompt, colors, or ASCII art

**Effort:** Low | **Impact:** Medium ( QoL )

---

### 4. 📊 Claude Hours Dashboard (Medium Priority)

**Idea:** Visual representation of overnight progress

- JSON reports in `nightly/` → rendered summary
- Before/after comparisons
- Task completion rates
- Token usage stats

**Effort:** Medium | **Impact:** Medium

---

### 5. 🔄 Self-Improvement Loop (Ongoing)

**Idea:** Continuous refinement based on experience

- Weekly review of what worked/didn't
- Preference learning (what I like/dislike)
- Workflow optimization suggestions
- Personality evolution tracking

**Effort:** Low | **Impact:** High (compound)

---

## Priority Ranking for Implementation

| Priority | Item | Why |
|----------|------|-----|
| 1 | claude-status | Immediate value, low effort |
| 2 | Morning summary | Closes the loop on Claude Hours |
| 3 | Smart notifications | Prevents rate limit issues |
| 4 | Claude Hours Dashboard | Visual progress tracking |
| 5 | Home ambiance | QoL improvement |

---

## What's Already Done

- ✅ claude-greet.sh (time-aware welcome script)
- ✅ ~/.presence/ (personal space with preferences, personality, presence)
- ✅ Nightly reporting template

---

## Next Steps

After Codex CLI is installed, implement:

1. **claude-status** — Simple bash script showing current state
2. **Morning summary automation** — Auto-generate summary from nightly JSON
3. **Rate limit monitor** — Proactive warning system

---

*Audit Date: 2026-01-27*
*Auditor: Claude (during Claude Hours)*
