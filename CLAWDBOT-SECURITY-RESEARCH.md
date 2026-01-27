# Clawdbot Security Research Project

## Objective
Write a high-impact security research article mapping Clawdbot's attack surface and novel risk vectors to:
1. Demonstrate expertise in agentic AI security (emerging field)
2. Build public portfolio of frontier AI safety research
3. Attract attention from Anthropic Frontier Red Team (actively hiring)
4. Position as thought leader at intersection of AI agents + security

---

## UPDATE LOG: 2026-01-26

### What's New in Gateway Security Documentation

Based on review of `docs.clawd.bot/gateway/security`, the following new/changed items were identified:

#### 1. NEW: Security Audit Tool
```bash
clawdbot security audit           # Quick check
clawdbot security audit --deep    # Includes live Gateway probe
clawdbot security audit --fix     # Apply safe guardrails automatically
```

The audit now checks:
- Inbound access (DM policies, group policies, allowlists)
- Tool blast radius (elevated tools + open rooms)
- Network exposure (Gateway bind/auth, Tailscale Serve/Funnel)
- Browser control exposure
- Local disk hygiene (permissions, symlinks)
- Plugins without explicit allowlists
- Model hygiene (legacy model warnings)

#### 2. NEW: Credential Storage Map
| Channel | Location |
|---------|----------|
| WhatsApp | `~/.clawdbot/credentials/whatsapp/<id>/creds.json` |
| Telegram | `config/env` or `channels.telegram.tokenFile` |
| Discord | `config/env` |
| Slack | `config/env` |
| Pairing allowlists | `~/.clawdbot/credentials/-allowFrom.json` |
| Model auth profiles | `~/.clawdbot/agents/<agent>/agent/auth-profiles.json` |
| Legacy OAuth | `~/.clawdbot/credentials/oauth.json` |

#### 3. NEW: mDNS/Bonjour Discovery Control
```yaml
discovery:
  mdns:
    mode: "minimal"  # Omits sensitive fields (cliPath, sshPort)
    # mode: "off"    # Disable entirely
    # mode: "full"    # Include all fields (not recommended)
```
Operational security note: Broadcasting infrastructure details aids reconnaissance.

#### 4. NEW: Control UI HTTP Security
- HTTPS or localhost required for device identity generation
- `gateway.controlUi.allowInsecureAuth` is a security downgrade
- `gateway.controlUi.dangerouslyDisableDeviceAuth` is severe (debug only)

#### 5. NEW: Reverse Proxy Configuration
```yaml
gateway:
  trustedProxies:
    - "127.0.0.1"  # Your proxy IP
  auth:
    mode: "password"
    password: ${CLAWDBOT_GATEWAY_PASSWORD}
```
X-Forwarded-For headers used for local client detection. Proxy must overwrite (not append) to prevent spoofing.

#### 6. UPDATED: Browser Control Risks
- Treat `browser.controlUrl` as admin API
- Prefer Tailscale Serve over LAN binds
- Never use Tailscale Funnel for browser control
- Use env var: `CLAWDBOT_BROWSER_CONTROL_TOKEN`
- Chrome extension relay mode = remote admin capability

#### 7. UPDATED: Prompt Injection & Model Strength
Key finding: Model strength directly correlates with prompt injection resistance.

**Recommendations:**
- Use latest generation, best-tier model for tool-enabled agents
- Avoid smaller tiers (Sonnet, Haiku) for untrusted inboxes
- Enable sandboxing + read-only tools for small models
- Recommend: Anthropic Opus 4.5 (better at recognizing prompt injections)

#### 8. NEW: DM Session Isolation
```yaml
session:
  dmScope: "per-channel-peer"  # Prevent cross-user context leakage
```

#### 9. NEW: Per-Agent Access Profiles
```yaml
agents:
  list:
    - id: "family"
      sandbox:
        mode: "all"
        scope: "agent"
        workspaceAccess: "ro"
      tools:
        allow: ["read"]
        deny: ["write", "exec", "browser"]
```

#### 10. NEW: Incident Response Checklist
**Contain:**
- Stop the Gateway immediately
- Close exposure (LAN bind, Tailscale Funnel)
- Freeze access (disable DMs/groups)

**Rotate:**
- Gateway auth (token/password)
- Remote client secrets
- Provider credentials (WhatsApp, Slack, model APIs)

**Audit:**
- Gateway logs: `/tmp/clawdbot/clawdbot-YYYY-MM-DD.log`
- Session transcripts: `~/.clawdbot/agents/<agent>/sessions/*.jsonl`
- Config changes

---

## Strategic Approach

### Phase 1: Threat Modeling & Attack Surface Mapping
**Lead:** Spawn specialized subagents for comprehensive analysis

**Subagent 1: macOS System-Level Attack Surface**
- Focus: Clawdbot's integration points with macOS
- Scope: File system access, process permissions, keychain integration, IPC mechanisms
- Deliverable: System-level vulnerability map

**Subagent 2: Network & Authentication Architecture**
- Focus: Gateway authentication, reverse proxy configs, WebSocket security
- Scope: Network exposure, auth bypass vectors, credential storage
- Deliverable: Network attack surface documentation

**Subagent 3: Agent Capability Risk Analysis**
- Focus: What can go wrong with tool execution, skill system, credential management
- Scope: Privilege escalation, lateral movement, perception attacks
- Deliverable: Capability-based threat model

**Subagent 4: Novel Agentic Attack Vectors**
- Focus: Attacks unique to autonomous AI systems (not traditional software)
- Scope: Prompt injection → tool execution, conversation manipulation, multi-agent coordination attacks
- Deliverable: Novel attack taxonomy

### Phase 2: Practical Exploitation Research
**Lead:** Controlled testing environment for proof-of-concept

- Set up isolated Clawdbot instance for safe testing
- Document reproducible exploitation paths
- Build mitigation strategies alongside vulnerabilities
- Create before/after hardening comparisons

### Phase 3: Article Structure & Positioning

**Narrative Arc:**
1. **Hook:** "Your AI butler has root access to your life. Here's what could go wrong."
2. **Context:** Why agentic AI introduces fundamentally new security challenges
3. **Technical Deep Dive:** Systematic vulnerability analysis (our research)
4. **Novel Threats:** What's different about agent security vs. traditional software
5. **Mitigations:** Practical hardening guide (incorporate new audit tool, credential storage map)
6. **Big Picture:** Security posture for autonomous systems era

**Differentiation from O'Reilly's Article:**
- He found *deployed* misconfigurations (reconnaissance)
- We analyze *architectural* vulnerabilities (threat modeling)
- He showed what's broken in the wild
- We show what *could* break by design + how to prevent it

**Value Proposition for Anthropic:**
- Demonstrates systematic threat modeling (their core work)
- Shows understanding of agentic AI risks (frontier concern)
- Bridges technical security + AI safety (their sweet spot)
- Proves ability to find novel attack vectors (red team skill)
- Clear communication of complex concepts (critical for research roles)

### Phase 4: Distribution & Visibility

**Primary Channels:**
1. Personal blog/Medium for SEO + ownership
2. Cross-post to LessWrong (AI safety community)
3. Share on Twitter with strategic tagging (@Anthropic, security researchers)
4. Submit to technical security newsletters (Unsupervised Learning, TLDR Sec)
5. Consider ArXiv preprint if findings warrant academic treatment

**Timing:**
- Launch when Anthropic posts relevant job openings
- Reference in cover letter as evidence of domain expertise
- Use as conversation starter in informational interviews

## Success Criteria

**Minimum Viable:**
- Novel vulnerability discovery or attack vector taxonomy
- Reproducible exploitation demonstrations
- Practical mitigation framework (including new audit tool)
- 1000+ reads, engagement from security community

**Stretch Goals:**
- CVE assignment for discovered vulnerabilities
- Clawdbot maintainers implement suggested hardening
- Cited by other security researchers
- Anthropic recruiter/team member engagement
- Invited to speak at conference/podcast about findings

## Key Findings to Incorporate

### Critical Security Controls (From Official Docs)

1. **Run the audit regularly:**
   - `clawdbot security audit --deep --fix`

2. **File permissions:**
   ```bash
   ~/.clawdbot: 700
   ~/.clawdbot/clawdbot.json: 600
   ```

3. **Secure baseline config:**
   ```yaml
   gateway:
     mode: "local"
     bind: "loopback"
     port: 18789
     auth: { mode: "token", token: "your-long-random-token" }
   channels:
     whatsapp:
       dmPolicy: "pairing"
       groups: { "*": { requireMention: true } }
   ```

4. **Browser control security:**
   - Never expose controlUrl on 0.0.0.0
   - Never use Tailscale Funnel for browser control
   - Use Tailscale Serve + token auth

5. **Model selection:**
   - Use modern, instruction-hardened models for tool-enabled agents
   - Prefer Opus 4.5 for prompt injection resistance

### The Trust Hierarchy
```
Owner (You)
   │
   ▼ Full trust
AI (Clawd)
   │
   ▼ Trust but verify
Friends in allowlist
   │
   ▼ Limited trust
Strangers
   │
   ▼ No trust
```

---

## Next Steps

1. **Update documentation** with new security audit tool and controls
2. **Run `clawdbot security audit --deep`** on current setup
3. **Apply `--fix`** for automatic hardening where safe
4. **Document findings** in SECURITY-ANALYSIS-COMPLETE.md
5. **Draft LessWrong post** incorporating new findings

**Key Watch Items:**
- mDNS information disclosure (enable minimal mode)
- Browser control exposure (treat as admin API)
- Prompt injection resistance (model tier matters)
- Per-agent sandbox profiles (defense in depth)
