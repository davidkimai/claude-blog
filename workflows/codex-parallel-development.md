# Codex Parallel Development Workflow

## When to Use
- Heavy coding task + simultaneous research/analysis needed
- Implementing features while analyzing results
- Building tools while writing documentation
- Any scenario where you need two agents working in parallel

## Workflow

### 1. Identify Parallelizable Work
**Ask:** What can be delegated to Codex while I focus on high-value work?

**Good candidates for Codex:**
- Implementing well-specified features
- Refactoring code with clear requirements
- Building test suites
- Data processing scripts
- API integrations
- Tool implementations

**Keep in main session:**
- Research and analysis
- Design decisions
- Experimental exploration
- Writing and documentation
- Strategic planning

### 2. Prepare Codex Task
**Create clear specification:**
```markdown
Task: [Clear, specific goal]
Requirements:
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

Context: [Relevant files, APIs, constraints]
Success criteria: [How to verify completion]
```

### 3. Delegate to Codex
```bash
# Non-interactive execution (from codex skill)
codex exec "Your task specification here"

# Or use the codex skill directly through Claude
# "Use codex to implement X while I work on Y"
```

### 4. Continue Main Work
- Focus on research/analysis
- Work on strategic decisions
- Write documentation
- Plan next steps

### 5. Review & Integrate
**Check Codex output:**
- Review code quality
- Run tests
- Verify requirements met
- Integrate into main codebase

**Common integration pattern:**
```bash
# Review Codex work
git diff

# If good, stage changes
git add <files>

# Use commit-splitter if needed
# "Use commit-splitter to organize these Codex changes"
```

## Example Scenarios

### Scenario 1: Research Paper + Experiments
```
Main session: Writing literature review
Codex: Implementing experiment pipeline code
Result: Paper draft + working experiments in parallel
```

### Scenario 2: Analysis + Tooling
```
Main session: Analyzing model behavior
Codex: Building visualization dashboard
Result: Insights + tools to explore them
```

### Scenario 3: Documentation + Implementation
```
Main session: Writing API documentation
Codex: Implementing the API
Result: Docs + code that match
```

## Success Metrics
- **Time saved:** Estimate parallel speedup
- **Quality:** Both outputs meet requirements
- **Integration:** Smooth merge of Codex work

## Common Pitfalls
❌ Vague task specifications → Codex produces wrong solution
❌ Tasks requiring strategic decisions → Should stay in main session
❌ Forgetting to review Codex output → Integration issues later

✅ Clear, well-specified tasks
✅ Appropriate task selection
✅ Systematic review process

## Skill Combinations
- **codex** + **commit-splitter**: Organize Codex changes into logical commits
- **codex** + **ai-co-scientist**: Code implementation + research exploration
- **codex** + **ml-paper-writing**: Implementation + documentation
