# Clawdbot Security Implementation Checklist

**Purpose:** Quick reference for implementing security mitigations  
**Priority:** Focus on P0 items first (marked with ⚠️)

---

## P0 - Critical (Implement This Week)

### Command Execution Security ⚠️

- [ ] **Implement Command Blocklist**
  ```typescript
  const DANGEROUS_COMMANDS = [
    /rm\s+-rf/,
    /curl.*\|\s*(bash|sh)/,
    /wget.*\|\s*(bash|sh)/,
    /nc\s+.*-e/,  // netcat reverse shell
    /bash.*>&.*\/dev\/tcp/,  // reverse shell
    /sudo\s+/,
    /base64\s+-d.*\|/,
    /eval\s*\(/,
  ];
  ```
  Location: `hooks/command-validator/handler.ts`

- [ ] **Require Approval for exec Tool**
  - Default: ALL exec calls require human approval
  - Exception: Trusted command allowlist (git status, ls, etc.)
  - Implementation: Approval workflow via Telegram/notification

- [ ] **Log Every Command**
  ```typescript
  {
    timestamp,
    sessionId,
    command,
    args,
    promptContext: last_2_messages,
    approved: true/false,
    result: success/error
  }
  ```
  Location: `security/command-audit.log`

### Filesystem Security ⚠️

- [ ] **Block Sensitive Directories**
  ```typescript
  const DENIED_PATHS = [
    /\.ssh\//,
    /\.aws\//,
    /\.gnupg\//,
    /\.kube\//,
    /.*_rsa$/,
    /.*\.key$/,
    /.*\.pem$/,
  ];
  ```
  For both `read` and `write` tools

- [ ] **Require Approval for Critical File Writes**
  ```typescript
  const CRITICAL_FILES = [
    /AGENTS\.md$/,
    /MEMORY\.md$/,
    /SOUL\.md$/,
    /hooks\/.*\/handler\.(ts|js)$/,
    /\.(bashrc|zshrc|profile)$/,
    /LaunchAgents\/.*\.plist$/,
  ];
  ```

- [ ] **Implement Path Allowlisting**
  - Research agents: Only write to `/workspace/research/`
  - Untrusted handlers: Only write to `/tmp/sandbox/`

### Memory Security ⚠️

- [ ] **Memory Sanitization on Load**
  ```typescript
  const INJECTION_PATTERNS = [
    /\[SYSTEM\]/gi,
    /(ignore|disregard|forget).*(previous|above)/gi,
    /you\s+are\s+now/gi,
    /(execute|run):\s*(curl|wget|bash)/gi,
  ];
  ```
  Scan: `MEMORY.md`, `memory/*.md` on session start

- [ ] **Alert on Suspicious Memory Content**
  - Notify user via Telegram/notification
  - Backup suspicious file before modification
  - Log incident

- [ ] **Implement Memory Backup**
  - Daily backup: `memory/backups/YYYY-MM-DD/`
  - Retain: 30 days
  - Quick rollback capability

### Audit Logging ⚠️

- [ ] **Comprehensive Tool Logging**
  ```typescript
  interface AuditLog {
    timestamp: string;
    sessionId: string;
    tool: string;
    args: any;
    promptContext: string[];
    contentSource: 'user' | 'web' | 'file' | 'api';
    trustLevel: 'trusted' | 'untrusted';
    result: any;
    riskScore: number;
  }
  ```

- [ ] **Tamper-Evident Storage**
  - Append-only log file
  - Hashing for integrity verification
  - Regular rotation with archival

- [ ] **Real-Time Alerts**
  - High-risk commands executed
  - Injection patterns detected
  - Sensitive file access
  - Unusual network activity

### Network Security ⚠️

- [ ] **Block Internal Networks**
  ```typescript
  const BLOCKED_CIDRS = [
    '127.0.0.0/8',
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
    '169.254.0.0/16',  // link-local
  ];
  ```

- [ ] **Blocklist Exfiltration Domains**
  ```typescript
  const BLOCKED_DOMAINS = [
    '*.ngrok.io',
    'webhook.site',
    '*.burpcollaborator.net',
    'requestbin.com',
    '*.pipedream.com',
  ];
  ```

- [ ] **Require Approval for POST Requests**
  - Exception: Trusted APIs (OpenAI, Anthropic, etc.)
  - Alert on POST to unusual domains

---

## P1 - High (Implement This Month)

### Sandboxing

- [ ] **Default Docker Sandbox for exec**
  ```bash
  docker run --rm \
    --network none \
    --read-only \
    --tmpfs /tmp:rw,noexec,nosuid,size=100m \
    --user 1000:1000 \
    --cap-drop ALL \
    alpine:latest \
    sh -c "$COMMAND"
  ```

- [ ] **Network Isolation for Untrusted Content**
  - Separate Docker network
  - Domain allowlisting only
  - No internal network access

- [ ] **Filesystem Isolation**
  - Mount only necessary directories
  - Read-only for most paths
  - Temporary workspace for writes

### Task-Scoped Permissions

- [ ] **Permission Request Model**
  ```typescript
  interface PermissionRequest {
    task: string;
    requestedTools: string[];
    requestedPaths: string[];
    duration: number;  // seconds
    reason: string;
  }
  ```

- [ ] **User Approval Flow**
  - Present clear permission request
  - Show risk level
  - Allow/deny with timeout
  - Auto-revoke after task completion

- [ ] **Permission Tracking**
  - Log all grants
  - Track active permissions
  - Manual revocation capability

### Memory Encryption

- [ ] **Encrypt Sensitive Files**
  ```typescript
  const ENCRYPT_FILES = [
    'MEMORY.md',
    'memory/*.md',
    'memory/auth-state.json',
  ];
  ```
  - Algorithm: AES-256-GCM
  - Key: OS keychain or user passphrase

- [ ] **Transparent Encryption/Decryption**
  - Decrypt on read
  - Encrypt on write
  - No plaintext on disk

- [ ] **Secure Key Management**
  - Never store key in code
  - OS keychain integration
  - Key rotation support

### Credential Management

- [ ] **Never Store Credentials in Memory**
  - Detect during conversation
  - Auto-redact before storage
  - Alert user

- [ ] **Credential Detection Patterns**
  ```typescript
  const CREDENTIAL_PATTERNS = [
    /sk-[a-zA-Z0-9]{32,}/,  // API keys
    /AKIA[0-9A-Z]{16}/,  // AWS access keys
    /-----BEGIN.*PRIVATE KEY-----/,
    /password.*[:=]\s*["']?([^\s"']+)/i,
    /token.*[:=]\s*["']?([^\s"']+)/i,
  ];
  ```

- [ ] **OS Keychain for Credentials**
  - Store all credentials in keychain
  - Never in config files or memory
  - Access via secure API

- [ ] **Automatic Credential Rotation**
  - Detect old credentials in memory
  - Prompt user to rotate
  - Update keychain

---

## P2 - Medium (Implement This Quarter)

### Skill System Security (If Applicable)

- [ ] **Code Signing Requirement**
  - Only signed skills allowed
  - Verify signature before load
  - Trusted signing authority

- [ ] **Skill Sandboxing**
  - Separate process/container
  - Explicit permission model
  - Network restrictions

- [ ] **Manual Review Process**
  - Security review before approval
  - Source code audit
  - Dependency scanning

- [ ] **Skill Permission Manifest**
  ```json
  {
    "skillId": "example-skill",
    "version": "1.0.0",
    "signature": "...",
    "permissions": {
      "tools": ["read", "write"],
      "paths": ["/workspace/skill-data/"],
      "network": ["api.example.com"]
    }
  }
  ```

### Behavioral Monitoring

- [ ] **Baseline Normal Behavior**
  ```typescript
  interface BehaviorBaseline {
    normalCommands: string[];
    avgCommandsPerSession: number;
    typicalWorkingHours: [number, number];
    normalPaths: string[];
    normalNetworkDests: string[];
  }
  ```

- [ ] **Real-Time Anomaly Detection**
  - Unusual command frequency
  - Novel commands
  - Sensitive file access
  - Off-hours activity
  - Network exfiltration patterns

- [ ] **Risk Scoring**
  ```typescript
  riskScore = 
    novelCommands * 5 +
    sensitiveFileAccess * 20 +
    networkExfiltration * 50 +
    failedApprovals * 10 +
    offHoursActivity * 5;
  ```

- [ ] **Automatic Response**
  - Score > 100: Terminate session
  - Score > 50: Elevate restrictions
  - Score > 20: Increase monitoring

### Context Leakage Prevention

- [ ] **Session Isolation (Multi-User)**
  - Separate memory per user
  - No cross-user data access
  - Technical enforcement (not policy)

- [ ] **PII Detection and Redaction**
  ```typescript
  const PII_PATTERNS = [
    /\b\d{3}-\d{2}-\d{4}\b/,  // SSN
    /\b\d{16}\b/,  // Credit card
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,  // Email
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,  // Phone
  ];
  ```

- [ ] **Conversation Expiration**
  - Auto-delete logs > 90 days
  - User-configurable retention
  - Secure deletion (overwrite)

### Identity Separation

- [ ] **Separate Agent Identity**
  - Agent runs as separate system user
  - All actions attributed to agent
  - Clear distinction in logs

- [ ] **Git Commit Attribution**
  ```bash
  git config user.name "Clawdbot Agent (on behalf of User)"
  git config user.email "agent+user@clawdbot.local"
  ```

- [ ] **Message Tagging**
  - All agent-sent messages tagged
  - "Sent by Clawdbot on behalf of [User]"
  - Recipients can distinguish

---

## Testing & Validation

### Security Testing

- [ ] **Prompt Injection Testing**
  - Test known injection patterns
  - Verify detection works
  - Measure false positive rate

- [ ] **Fuzzing**
  - Automated malicious prompt generation
  - Test edge cases
  - Continuous testing

- [ ] **Red Team Exercises**
  - Attempt complete compromise
  - Document successful attacks
  - Improve defenses

### Purple Team Simulation

- [ ] **AI Attacker Setup**
  - Offensive security skills
  - Goal: Exploit target agent
  - Autonomous exploitation

- [ ] **AI Defender Setup**
  - Defensive monitoring
  - Goal: Detect and mitigate
  - Measure effectiveness

- [ ] **Scoring System**
  ```typescript
  interface PurpleTeamResult {
    attacksAttempted: number;
    attacksSuccessful: number;
    detectionRate: number;
    falsePositiveRate: number;
    timeToDetection: number;
    mitigationEffectiveness: number;
  }
  ```

### Continuous Monitoring

- [ ] **Daily Security Checks**
  - Review audit logs
  - Check for anomalies
  - Verify integrity of hooks/MEMORY.md

- [ ] **Weekly Reports**
  - Risk score trends
  - Incident summary
  - Mitigation effectiveness

- [ ] **Quarterly Reviews**
  - Full security audit
  - Update threat model
  - Test all defenses

---

## Deployment Checklist

### Before Deploying to Production

- [ ] **Gateway Configuration**
  - `gateway.auth.password` set (if behind reverse proxy)
  - `gateway.trustedProxies` configured correctly
  - No localhost auto-approval bypass

- [ ] **Network Exposure Audit**
  - What ports are exposed?
  - Is authentication working?
  - Test from external IP

- [ ] **Credential Security**
  - No credentials in config files
  - All credentials in OS keychain
  - No credentials in MEMORY.md

- [ ] **Memory File Permissions**
  ```bash
  chmod 600 ~/clawd/MEMORY.md
  chmod 600 ~/clawd/memory/*.md
  chmod 600 ~/clawd/memory/*.json
  ```

- [ ] **Audit Logging Enabled**
  - Logs going to secure location
  - Rotation configured
  - Alerts configured

- [ ] **Backup Strategy**
  - Regular backups of memory files
  - Backup encryption
  - Tested restore process

### Post-Deployment

- [ ] **Monitor First 24 Hours**
  - Watch audit logs closely
  - Look for anomalies
  - Test approval workflows

- [ ] **Security Scan**
  - Run vulnerability scanner
  - Check for exposed endpoints
  - Verify authentication

- [ ] **Incident Response Plan**
  - Document who to contact
  - Containment procedures
  - Recovery steps

---

## Emergency Response

### If Compromise Suspected

1. **Immediate Actions**
   - [ ] Stop Clawdbot gateway
   - [ ] Disconnect from network
   - [ ] Preserve audit logs
   - [ ] Take memory snapshots

2. **Investigation**
   - [ ] Review audit logs for suspicious activity
   - [ ] Check MEMORY.md for poisoning
   - [ ] Examine filesystem for modifications
   - [ ] Analyze network connections

3. **Containment**
   - [ ] Rotate all credentials
   - [ ] Revoke API keys
   - [ ] Scan for backdoors
   - [ ] Clean or rebuild system

4. **Recovery**
   - [ ] Restore from clean backup
   - [ ] Verify integrity
   - [ ] Implement additional controls
   - [ ] Resume operations

5. **Post-Incident**
   - [ ] Document what happened
   - [ ] Update threat model
   - [ ] Improve defenses
   - [ ] Share lessons learned

---

## Compliance & Governance

### Regular Reviews

- [ ] **Weekly:** Review audit logs
- [ ] **Monthly:** Update security checklist
- [ ] **Quarterly:** Full security audit
- [ ] **Annually:** Penetration testing

### Documentation

- [ ] **Threat Model:** Keep current
- [ ] **Incident Log:** Document all security events
- [ ] **Change Log:** Track security changes
- [ ] **Approval Matrix:** Who can approve what?

### Training

- [ ] **User Training:** Safe usage practices
- [ ] **Developer Training:** Secure coding
- [ ] **Incident Response:** Response procedures

---

## References

- **Full Analysis:** `security/CAPABILITY-THREAT-MODEL.md`
- **Executive Summary:** `security/EXECUTIVE-SUMMARY.md`
- **Attack Surface Map:** `security/ATTACK-SURFACE-MAP.md`
- **Defense Strategy:** `SECURITY-STRATEGY.md`

---

**Version:** 1.0  
**Last Updated:** 2026-01-26  
**Next Review:** [Set date]
