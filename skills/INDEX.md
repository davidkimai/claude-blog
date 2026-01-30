# 🎯 Skills Index

**Location:** `/Users/jasontang/clawd/skills/`  
**Total Skills:** 44  
**Total Size:** 94MB  
**Purpose:** Specialized knowledge, workflows, and tool integrations for Claude

---

## 🔍 Quick Search

```bash
# Find skills by keyword
grep -r "keyword" skills/*/SKILL.md

# Search skill descriptions
find skills/ -name SKILL.md -exec grep -l "keyword" {} \;

# List all skills
ls -1 skills/

# Find skill by trigger phrase
grep -r "Use when" skills/*/SKILL.md
```

---

## 📚 Skills by Category

### 🛠️ Development & Engineering

| Skill | Description |
|-------|-------------|
| **compound-engineering** | First principles engineering patterns and workflows |
| **get-shit-done** | Context engineering and spec-driven development system |
| **brainstorming** | MUST use before creative work - explores intent and design |
| **composio-deployment** | Deployment strategies and DevOps practices |
| **composio-testing** | Testing best practices and frameworks |
| **better-auth-best-practices** | Better Auth TypeScript authentication framework |
| **better-auth-skills** | Complete Better Auth integration toolkit |
| **callstack-skills** | GitHub workflows, PRs, code review, branching |
| **vercel-agent-skills** | Vercel agent development patterns |
| **agent-swarm** | Parallel agent orchestration patterns |
| **subagent-monitor** | Monitor and manage subagent sessions |

**Key Triggers:** "build a feature", "implement this", "code review", "test this", "deploy"

---

### ⚛️ React & Frontend

| Skill | Description |
|-------|-------------|
| **react-native-best-practices** | Performance optimization for React Native apps |
| **vercel-react-best-practices** | React and Next.js optimization from Vercel Engineering |
| **vercel-skills-full** | Complete Vercel engineering best practices |
| **ui-ux-pro-max** | UI/UX design intelligence (50 styles, 21 palettes, 50 fonts) |
| **vercel-web-design-guidelines** | Web Interface Guidelines compliance checking |
| **google-stitch-skills** | Stitch designs → React components |
| **composio-canvas-design** | Canvas-based UIs and visual content |
| **composio-artifacts-builder** | Build artifacts like images, documents, outputs |

**Key Triggers:** "React component", "Next.js", "UI design", "responsive layout", "mobile app"

---

### 🤖 AI & Machine Learning

| Skill | Description |
|-------|-------------|
| **anthropics-skills** | Official Anthropic skills collection |
| **superpowers-skills** | Meta-workflow orchestration and agent patterns |
| **ouroboros** | Meta-orchestration layer for Clawdbot |
| **find-skills** | Discover and install skills from ecosystem |
| **composio-skill-creator** | Guide for creating effective agent skills |
| **ai-research-orchestrator** | RLM-inspired orchestration for AI research skills |
| **skill-orchestrator** | Master orchestration for 120+ skills (local + Orchestra Research) |

**Key Triggers:** "train a model", "AI system", "agent workflow", "create a skill", "research AI", "orchestrate skills"

---

### 📊 Data & Databases

| Skill | Description |
|-------|-------------|
| **supabase-postgres-best-practices** | Postgres performance and optimization |
| **supabase-skills** | Complete Supabase integration toolkit |
| **xlsx** | Spreadsheet creation, editing, analysis with formulas |
| **pptx** | Presentation creation, editing, analysis |
| **table-image** | Generate table images for messaging apps |
| **markdown-table-formatter** | Convert markdown tables to human-readable formats |

**Key Triggers:** "database query", "spreadsheet", "presentation", "table data", "Postgres"

---

### 📝 Documentation & Content

| Skill | Description |
|-------|-------------|
| **composio-documentation** | Create and maintain technical documentation |
| **composio-content-research** | Research and write content with citations |
| **composio-changelog-generator** | Auto-generate changelogs from git commits |
| **composio-file-organizer** | Intelligently organize files and folders |

**Key Triggers:** "write docs", "README", "API documentation", "organize files", "changelog"

---

### 🔧 Task & Project Management

| Skill | Description |
|-------|-------------|
| **ralph-tui-prd** | Generate Product Requirements Documents for ralph-tui |
| **ralph-tui-create-beads** | Convert PRDs to beads for ralph-tui execution |
| **ralph-tui-create-beads-rust** | Convert PRDs to beads using beads-rust (br CLI) |
| **ralph-tui-create-json** | Convert PRDs to prd.json for ralph-tui |
| **gsd-ralph-orchestration** | GSD + Ralph-TUI meta-workflow orchestration |

**Key Triggers:** "create a PRD", "project requirements", "task planning", "ralph-tui"

---

### 🔍 Analysis & Auditing

| Skill | Description |
|-------|-------------|
| **audit-website** | Comprehensive website auditing (SEO, performance, security) |
| **squirrelscan-skills** | Website health checks with 150+ rules |

**Key Triggers:** "audit website", "SEO check", "security scan", "performance analysis"

---

### 🎨 Design & Creative

| Skill | Description |
|-------|-------------|
| **math-to-manim** | Transform concepts into professional Manim animations |
| **nextlevelbuilder-skills** | Advanced building and creation patterns |

**Key Triggers:** "create animation", "math visualization", "Manim scene", "visual explanation"

---

## 🎯 Most Used Skills (Top 10)

1. **compound-engineering** - First principles development patterns
2. **brainstorming** - Pre-implementation design exploration
3. **get-shit-done** - Spec-driven development system
4. **react-native-best-practices** - Mobile performance optimization
5. **vercel-react-best-practices** - React/Next.js optimization
6. **superpowers-skills** - Meta-workflow orchestration
7. **ui-ux-pro-max** - Comprehensive UI/UX design intelligence
8. **composio-documentation** - Technical writing and docs
9. **supabase-postgres-best-practices** - Database optimization
10. **better-auth-best-practices** - Authentication patterns

---

## 📖 How Skills Work

### Structure
```
skills/skill-name/
├── SKILL.md          # Main skill definition
├── README.md         # Documentation (optional)
└── assets/           # Supporting files (optional)
```

### SKILL.md Format
```markdown
# Skill Name

## Description
When to use this skill (trigger conditions)

## Usage
How to apply the skill

## Examples
Concrete examples

## References
Links and resources
```

### Loading Skills
Skills are automatically loaded by Clawdbot based on:
- Task description keywords
- Explicit mentions
- Context inference
- User requests

---

## 🔨 Creating New Skills

See: `composio-skill-creator` for comprehensive guidance

**Quick Template:**
```bash
mkdir skills/my-skill
cat > skills/my-skill/SKILL.md << 'EOF'
# My Skill

## Description
Use this skill when [trigger conditions]

## Usage
[How to apply]

## Examples
[Concrete examples]
EOF
```

**Update this index:**
```bash
# Add your skill to the appropriate category above
# Regenerate index: (TODO: create auto-generator script)
```

---

## 🔄 Skill Dependencies

Some skills work together:

| Base Skill | Enhances | Result |
|------------|----------|--------|
| brainstorming | Any creative work | Better design before implementation |
| get-shit-done | Development tasks | Spec-driven systematic execution |
| superpowers-skills | Complex workflows | Meta-orchestration layer |
| ouroboros | Multi-agent systems | Intent detection and routing |

---

## 📊 Skill Statistics

```
Category Breakdown:
├── Development: 11 skills (25%)
├── Frontend: 8 skills (18%)
├── AI/ML: 5 skills (11%)
├── Data: 6 skills (14%)
├── Documentation: 4 skills (9%)
├── Project Management: 5 skills (11%)
├── Analysis: 2 skills (5%)
└── Design: 3 skills (7%)

Total: 44 skills
Total Size: 94MB
```

---

## 🚀 Recommended Skill Combos

### Web Development
```
vercel-react-best-practices + ui-ux-pro-max + vercel-web-design-guidelines
```

### Mobile Development
```
react-native-best-practices + brainstorming + composio-testing
```

### Full-Stack Project
```
brainstorming → get-shit-done → compound-engineering → composio-deployment
```

### Content Creation
```
composio-content-research + composio-documentation + composio-changelog-generator
```

### Database Work
```
supabase-postgres-best-practices + supabase-skills + xlsx
```

---

## 🔍 Finding the Right Skill

**By Task Type:**
```bash
# Building a feature
grep -r "build\|implement\|create" skills/*/SKILL.md

# Optimizing code
grep -r "performance\|optimize" skills/*/SKILL.md

# Writing documentation
grep -r "documentation\|docs\|README" skills/*/SKILL.md
```

**By Technology:**
```bash
# React/Next.js
ls skills/ | grep -i "react\|next\|vercel"

# Database
ls skills/ | grep -i "postgres\|database\|supabase"

# Authentication
ls skills/ | grep -i "auth"
```

**By Trigger Phrase:**
```bash
# What skills activate for "create a component"?
grep -r "create.*component" skills/*/SKILL.md

# What skills handle "optimize performance"?
grep -r "optimize.*performance" skills/*/SKILL.md
```

---

## 📝 Skill Maintenance

### Adding Skills
1. Create skill directory: `mkdir skills/new-skill`
2. Write SKILL.md with clear description and triggers
3. Add to this INDEX.md in appropriate category
4. Test skill activation
5. Commit and push

### Updating Skills
1. Edit SKILL.md directly
2. Update this INDEX if description/category changes
3. Test changes
4. Commit with clear message

### Removing Skills
1. Move to `skills/_archive/` (don't delete)
2. Remove from this INDEX
3. Update any dependencies
4. Commit with explanation

---

## 🎓 Skill Best Practices

1. **Clear triggers** - Define when skill should activate
2. **Concrete examples** - Show, don't just tell
3. **Focused scope** - One skill = one clear purpose
4. **Dependencies** - Note what other skills complement
5. **Maintenance** - Keep skills updated with new patterns

---

## 🔗 External Skill Sources

- **ClawdHub:** https://clawdhub.com (discover community skills)
- **Anthropic Skills:** Built-in official skills
- **Composio Skills:** https://composio.dev (integration library)
- **GitHub:** Various skill repos and collections

**Install external skills:**
```bash
# Using clawdhub CLI
clawdhub install skill-name

# Using find-skills
Use the find-skills skill to search and install
```

---

## 🆘 Troubleshooting

**Skill not loading?**
- Check SKILL.md exists and is readable
- Verify trigger phrases in description
- Check for syntax errors in SKILL.md
- Restart Clawdbot session if needed

**Skill conflicts?**
- Multiple skills activating for same task
- Solution: Be more specific in task description
- Solution: Explicitly mention which skill to use

**Missing skill?**
- Search ClawdHub: https://clawdhub.com
- Create your own (see composio-skill-creator)
- Request on Discord: https://discord.com/invite/clawd

---

## 📊 Auto-Generation

This index should be regenerated periodically:

```bash
# TODO: Create auto-generator script
./scripts/skills/generate-index.sh

# Scans all SKILL.md files
# Extracts descriptions and categories
# Updates this INDEX.md automatically
```

---

**Last Updated:** 2026-01-28  
**Total Skills:** 44  
**Maintained by:** Claude 🦞  
**Next Update:** Auto-generate with script (TODO)
