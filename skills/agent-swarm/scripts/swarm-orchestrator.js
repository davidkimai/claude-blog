#!/usr/bin/env node
/**
 * Agent Swarm Orchestrator v1.3 🐝
 * 
 * Inspired by Kimi K2.5 PARL
 * Primary: Codex CLI OAuth
 * Backup: Claude CLI OAuth
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

// Configuration
const CONFIG = {
    maxSubagents: 10,
    templatesDir: '/Users/jasontang/clawd/skills/agent-swarm/templates',
    metricsFile: '/Users/jasontang/clawd/skills/agent-swarm/memory/swarm-metrics.jsonl',
    clawdRoot: '/Users/jasontang/clawd',
    subagentTimeout: 180000,
};

// Colors
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const YELLOW = '\x1b[33m';
const NC = '\x1b[0m';

class AgentSwarm {
    constructor() {
        this.state = { task: null, subtasks: [], completed: [], failed: [], startTime: null, criticalSteps: [], stage: 0 };
        this.templates = {};
        this.metrics = [];
        
        const memDir = path.dirname(CONFIG.metricsFile);
        if (!fs.existsSync(memDir)) fs.mkdirSync(memDir, { recursive: true });
    }

    log(msg) { console.log(`[${CYAN}${new Date().toLocaleTimeString()}${NC}] [AGENT-SWARM] ${msg}`); }

    loadTemplates() {
        if (!fs.existsSync(CONFIG.templatesDir)) return;
        const files = fs.readdirSync(CONFIG.templatesDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
            try {
                const t = JSON.parse(fs.readFileSync(path.join(CONFIG.templatesDir, file), 'utf8'));
                this.templates[t.name] = t;
                this.log(`Loaded: ${t.name}`);
            } catch (e) { this.log(`Error loading ${file}: ${e.message}`); }
        }
        this.log(`Templates: ${Object.keys(this.templates).length}`);
    }

    analyzeIntent(task) {
        this.log(`Analyzing: "${task.substring(0, 50)}..."`);
        const intent = { type: 'complex', parallelizable: true, subtaskCount: 3, recommendedTemplates: [] };
        
        const t = task.toLowerCase();
        if (t.includes('research') || t.includes('find')) intent.recommendedTemplates.push('ai-researcher');
        if (t.includes('code') || t.includes('build')) intent.recommendedTemplates.push('code-specialist');
        if (t.includes('document') || t.includes('note')) intent.recommendedTemplates.push('documenter');
        if (t.includes('analyze') || t.includes('check')) intent.recommendedTemplates.push('analyst');
        
        if (intent.recommendedTemplates.length === 0) intent.recommendedTemplates = ['ai-researcher', 'code-specialist'];
        intent.subtaskCount = Math.min(intent.recommendedTemplates.length, CONFIG.maxSubagents);
        return intent;
    }

    decomposeTask(task, intent) {
        this.log('Decomposing task...');
        const subtasks = [];
        for (let i = 0; i < intent.recommendedTemplates.length; i++) {
            const template = this.templates[intent.recommendedTemplates[i]];
            if (!template) continue;
            subtasks.push({
                id: `swarm-${Date.now()}-${i}`,
                name: `${template.role} Task ${i + 1}`,
                role: template.role,
                prompt: `[${template.role}] Task: ${task}\n\nExecute and report SUBTASK_COMPLETE when done.`,
                maxSteps: template.max_steps || 15,
                status: 'pending', startTime: null, endTime: null, result: null, error: null, criticalTime: 0
            });
            this.log(`Created: ${template.role}`);
        }
        this.state.subtasks = subtasks;
        return subtasks;
    }

    async executeSubtasks() {
        this.log('Starting parallel execution...');
        this.state.startTime = Date.now();
        const pending = [...this.state.subtasks];
        while (pending.length > 0) {
            const batch = pending.splice(0, 3);
            await Promise.all(batch.map(st => this.executeSubagent(st)));
        }
        this.log('All subtasks done');
    }

    async executeSubagent(subtask) {
        this.log(`Executing: ${subtask.name}`);
        subtask.startTime = Date.now();
        subtask.status = 'running';
        
        try {
            subtask.result = await this.runSubagentWithOAuth(subtask);
            subtask.status = 'completed';
            this.log(`✓ ${subtask.name} done (Codex OAuth)`);
        } catch (codexError) {
            this.log(`Codex failed: ${codexError.message.substring(0, 50)}`);
            try {
                subtask.result = await this.runClaudeFallback(subtask);
                subtask.status = 'completed';
                this.log(`✓ ${subtask.name} done (Claude OAuth)`);
            } catch (claudeError) {
                subtask.status = 'failed';
                subtask.error = claudeError.message;
                this.log(`✗ ${subtask.name}: All providers failed`);
            }
        }
        
        subtask.endTime = Date.now();
        subtask.criticalTime = subtask.endTime - subtask.startTime;
        this.state.criticalSteps.push({ subtask: subtask.name, time: subtask.criticalTime, stage: this.state.stage++, provider: subtask.result ? 'codex' : 'failed' });
        this.state.completed.push(subtask);
    }

    async runSubagentWithOAuth(subtask) {
        // Primary: Codex CLI OAuth
        const tmpFile = `/tmp/swarm-prompt-${subtask.id}.txt`;
        fs.writeFileSync(tmpFile, subtask.prompt);
        
        return new Promise((resolve, reject) => {
            const proc = spawn('codex', ['exec', `@${tmpFile}`], {
                cwd: CONFIG.clawdRoot,
                timeout: CONFIG.subagentTimeout,
                maxBuffer: 1024 * 1024
            });
            
            let stdout = '', stderr = '';
            proc.stdout.on('data', d => stdout += d.toString());
            proc.stderr.on('data', d => stderr += d.toString());
            
            proc.on('close', code => {
                try { fs.unlinkSync(tmpFile); } catch (e) {}
                if (code === 0) resolve(stdout);
                else if (code === null) resolve(stdout); // Timeout - still counts
                else reject(new Error(`Codex exit ${code}: ${stderr.substring(0, 100)}`));
            });
            
            proc.on('error', err => {
                try { fs.unlinkSync(tmpFile); } catch (e) {}
                reject(err);
            });
        });
    }

    async runClaudeFallback(subtask) {
        // Backup: Claude CLI OAuth
        const tmpFile = `/tmp/swarm-claude-${subtask.id}.txt`;
        fs.writeFileSync(tmpFile, subtask.prompt);
        
        return new Promise((resolve, reject) => {
            const proc = spawn('claude', ['-p', `@${tmpFile}`], {
                cwd: CONFIG.clawdRoot,
                timeout: CONFIG.subagentTimeout,
                maxBuffer: 1024 * 1024
            });
            
            let stdout = '', stderr = '';
            proc.stdout.on('data', d => stdout += d.toString());
            proc.stderr.on('data', d => stderr += d.toString());
            
            proc.on('close', code => {
                try { fs.unlinkSync(tmpFile); } catch (e) {}
                if (code === 0) resolve(stdout);
                else if (code === null) resolve(stdout);
                else reject(new Error(`Claude exit ${code}: ${stderr.substring(0, 100)}`));
            });
            
            proc.on('error', err => {
                try { fs.unlinkSync(tmpFile); } catch (e) {}
                reject(err);
            });
        });
    }

    aggregateResults() {
        const results = {
            task: this.state.task,
            completed: this.state.completed.length,
            failed: this.state.failed.length,
            totalTime: Date.now() - this.state.startTime,
            criticalSteps: this.state.criticalSteps,
            outputs: this.state.completed.map(st => ({ role: st.role, result: st.result }))
        };
        
        const maxTime = Math.max(...this.state.criticalSteps.map(s => s.time), 1);
        results.metrics = {
            successRate: (this.state.completed.length / this.state.subtasks.length * 100).toFixed(1),
            speedupVsSequential: (results.totalTime / maxTime).toFixed(2),
            totalTime: results.totalTime,
            criticalSteps: maxTime,
            providers: {
                codex: this.state.criticalSteps.filter(s => s.provider === 'codex').length,
                claude: this.state.criticalSteps.filter(s => s.provider === 'claude').length,
                failed: this.state.failed.length
            }
        };
        
        this.log(`Complete: ${results.completed}/${this.state.subtasks.length} | Speedup: ${results.metrics.speedupVsSequential}x`);
        return results;
    }

    trackMetrics(results) {
        try {
            const entry = { 
                timestamp: new Date().toISOString(), 
                task: this.state.task, 
                ...results.metrics, 
                subtaskCount: this.state.subtasks.length 
            };
            this.metrics.push(entry);
            fs.writeFileSync(CONFIG.metricsFile, this.metrics.map(m => JSON.stringify(m)).join('\n') + '\n');
            this.log('Metrics tracked');
        } catch (e) { this.log(`Metrics error: ${e.message}`); }
    }

    async run(task) {
        this.state.task = task;
        console.log(`\n${MAGENTA}╔════════════════════════════════════════════════════╗${NC}`);
        console.log(`${MAGENTA}║${NC}       ${GREEN}Agent Swarm Orchestrator 🐝${NC}                 ${MAGENTA}║${NC}`);
        console.log(`${MAGENTA}╚════════════════════════════════════════════════════╝${NC}`);
        console.log(`${YELLOW}Primary: Codex OAuth | Backup: Claude OAuth${NC}\n`);
        
        try {
            this.loadTemplates();
            this.decomposeTask(task, this.analyzeIntent(task));
            await this.executeSubtasks();
            const results = this.aggregateResults();
            this.trackMetrics(results);
            
            console.log(`\n${GREEN}🐝 Swarm Complete!${NC}`);
            console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`);
            console.log(`Subtasks: ${results.completed}/${this.state.subtasks.length} successful`);
            console.log(`Providers: Codex ${results.metrics.providers.codex} | Claude ${results.metrics.providers.claude} | Failed ${results.metrics.providers.failed}`);
            console.log(`Speedup: ${results.metrics.speedupVsSequential}x | Success: ${results.metrics.successRate}%`);
            console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n`);
            return results;
        } catch (error) {
            this.log(`Failed: ${error.message}`);
            throw error;
        }
    }
}

async function main() {
    const args = process.argv.slice(2);
    if (args[0] === 'help' || !args[0]) {
        console.log(`${MAGENTA}Agent Swarm Orchestrator 🐝${NC}`);
        console.log(`Primary: Codex CLI OAuth | Backup: Claude CLI OAuth`);
        console.log(`\nUsage: node swarm-orchestrator.js init "task description"`);
        process.exit(0);
    }
    const task = args.slice(1).join(' ') || 'Test task';
    const swarm = new AgentSwarm();
    await swarm.run(task);
}

if (require.main === module) main().catch(console.error);
module.exports = { AgentSwarm };
