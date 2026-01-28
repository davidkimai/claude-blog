#!/usr/bin/env node
/**
 * Agent Swarm Orchestrator 🐝
 * 
 * Inspired by Kimi K2.5 PARL (Parallel-Agent Reinforcement Learning)
 * Automatically decomposes tasks into parallelizable subtasks,
 * spawns subagents, and tracks Critical Steps.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const CONFIG = {
    maxSubagents: 10,
    parallelStages: true,
    trackCriticalSteps: true,
    templatesDir: '/Users/jasontang/clawd/skills/agent-swarm/templates',
    metricsFile: '/Users/jasontang/clawd/skills/agent-swarm/memory/swarm-metrics.jsonl',
    stateFile: '/Users/jasontang/clawd/skills/agent-swarm/memory/swarm-state.json',
    clawdRoot: '/Users/jasontang/clawd'
};

// Colors
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const NC = '\x1b[0m';

class AgentSwarm {
    constructor() {
        this.state = {
            task: null,
            subtasks: [],
            running: [],
            completed: [],
            failed: [],
            startTime: null,
            criticalSteps: [],
            stage: 0
        };
        this.templates = {};
        this.metrics = [];
    }

    log(message) {
        console.log(`[${CYAN}${new Date().toLocaleTimeString()}${NC}] [AGENT-SWARM] ${message}`);
    }

    // === PHASE 1: Load Templates ===
    loadTemplates() {
        if (!fs.existsSync(CONFIG.templatesDir)) {
            this.log('No templates directory found');
            return;
        }

        const files = fs.readdirSync(CONFIG.templatesDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
            const template = JSON.parse(
                fs.readFileSync(path.join(CONFIG.templatesDir, file), 'utf8')
            );
            this.templates[template.name] = template;
            this.log(`Loaded template: ${template.name}`);
        }
        this.log(`Total templates loaded: ${Object.keys(this.templates).length}`);
    }

    // === PHASE 2: Intent Detection (Ouroboros-inspired) ===
    analyzeIntent(task) {
        this.log(`Analyzing task intent: "${task.substring(0, 50)}..."`);
        
        // Simple keyword-based intent detection (can integrate Ouroboros)
        const intent = {
            type: 'complex',
            parallelizable: true,
            subtaskCount: 3,
            estimatedCriticalSteps: 3,
            recommendedTemplates: []
        };

        // Detect task type and recommend templates
        if (task.toLowerCase().includes('research') || task.toLowerCase().includes('find')) {
            intent.recommendedTemplates.push('ai-researcher');
        }
        if (task.toLowerCase().includes('code') || task.toLowerCase().includes('build') || task.toLowerCase().includes('write')) {
            intent.recommendedTemplates.push('code-specialist');
        }
        if (task.toLowerCase().includes('document') || task.toLowerCase().includes('write') || task.toLowerCase().includes('note')) {
            intent.recommendedTemplates.push('documenter');
        }
        if (task.toLowerCase().includes('analyze') || task.toLowerCase().includes('check') || task.toLowerCase().includes('verify')) {
            intent.recommendedTemplates.push('analyst');
            intent.recommendedTemplates.push('fact-checker');
        }

        // Default templates if none detected
        if (intent.recommendedTemplates.length === 0) {
            intent.recommendedTemplates = ['ai-researcher', 'code-specialist', 'documenter'];
        }

        // Limit subtasks based on task complexity
        intent.subtaskCount = Math.min(
            intent.recommendedTemplates.length,
            CONFIG.maxSubagents
        );

        this.log(`Intent: ${intent.type} | Parallelizable: ${intent.parallelizable} | Subtasks: ${intent.subtaskCount}`);
        return intent;
    }

    // === PHASE 3: Task Decomposition (Ralph-TUI inspired) ===
    decomposeTask(task, intent) {
        this.log('Decomposing task into parallelizable subtasks...');
        
        const subtasks = [];
        const templates = intent.recommendedTemplates;

        for (let i = 0; i < templates.length; i++) {
            const template = this.templates[templates[i]];
            if (!template) continue;

            const subtask = {
                id: `swarm-${Date.now()}-${i}`,
                name: `${template.role} Task ${i + 1}`,
                template: template.name,
                role: template.role,
                prompt: this.createSubagentPrompt(task, template, i),
                tools: template.tools || [],
                maxSteps: template.max_steps || 50,
                status: 'pending',
                startTime: null,
                endTime: null,
                result: null,
                error: null,
                criticalTime: 0
            };

            subtasks.push(subtask);
            this.log(`Created subtask: ${subtask.name} (${template.role})`);
        }

        this.state.subtasks = subtasks;
        this.log(`Decomposed into ${subtasks.length} subtasks`);
        return subtasks;
    }

    createSubagentPrompt(task, template, index) {
        return `[SWARM SUBAGENT: ${template.role}]
        
Parent Task: ${task}

Your Role: You are a ${template.role}. Complete your specific subtask efficiently.

Instructions:
1. Focus ONLY on your assigned subtask
2. Use tools relevant to your role
3. Report results clearly when complete
4. Maximum ${template.max_steps || 50} steps

Role-Specific Context:
${template.system_prompt || 'Complete the assigned task with expertise.'}

Your Subtask #${index + 1}:
Execute this part of the overall task. When done, report "SUBTASK_COMPLETE" with your findings.

Remember: You're part of a swarm. Complete your part so results can be aggregated.`;
    }

    // === PHASE 4: Subagent Execution ===
    async executeSubtasks() {
        this.log('Starting parallel subagent execution...');
        this.state.startTime = Date.now();
        
        const pending = [...this.state.subtasks];
        const maxParallel = 3; // Limit concurrent subagents
        
        while (pending.length > 0) {
            const batch = pending.splice(0, maxParallel);
            const promises = batch.map(st => this.executeSubagent(st));
            await Promise.all(promises);
        }

        this.log('All subtasks completed');
    }

    async executeSubagent(subtask) {
        this.log(`Executing: ${subtask.name}`);
        subtask.status = 'running';
        subtask.startTime = Date.now();

        // Create subagent session
        const sessionId = `swarm-${subtask.id}`;
        
        // Execute using Claude Code with specialized prompt
        try {
            const result = await this.runSubagent(subtask);
            subtask.status = 'completed';
            subtask.result = result;
            this.log(`✓ ${subtask.name} completed`);
        } catch (error) {
            subtask.status = 'failed';
            subtask.error = error.message;
            this.log(`✗ ${subtask.name} failed: ${error.message}`);
        }

        subtask.endTime = Date.now();
        subtask.criticalTime = subtask.endTime - subtask.startTime;
        
        // Track Critical Steps
        if (CONFIG.trackCriticalSteps) {
            this.state.criticalSteps.push({
                subtask: subtask.name,
                time: subtask.criticalTime,
                stage: this.state.stage++
            });
        }

        this.state.completed.push(subtask);
        return subtask;
    }

    async runSubagent(subtask) {
        // Use Claude Code CLI with specialized prompt
        return new Promise((resolve, reject) => {
            const proc = spawn('claude', [
                '-p',
                subtask.prompt
            ], {
                cwd: CONFIG.clawdRoot,
                stdio: ['pipe', 'pipe', 'pipe'],
                timeout: subtask.maxSteps * 10000 // 10s per step
            });

            let stdout = '';
            let stderr = '';

            proc.stdout.on('data', d => stdout += d.toString());
            proc.stderr.on('data', d => stderr += d.toString());

            proc.on('close', code => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(new Error(`Exit code ${code}: ${stderr}`));
                }
            });

            proc.on('error', err => reject(err));

            // Timeout
            setTimeout(() => {
                proc.kill();
                reject(new Error('Timeout'));
            }, subtask.maxSteps * 10000);
        });
    }

    // === PHASE 5: Result Aggregation ===
    aggregateResults() {
        this.log('Aggregating subagent results...');
        
        const results = {
            task: this.state.task,
            completed: this.state.completed.length,
            failed: this.state.failed.length,
            totalTime: Date.now() - this.state.startTime,
            criticalSteps: this.state.criticalSteps,
            outputs: []
        };

        // Aggregate outputs
        for (const subtask of this.state.completed) {
            results.outputs.push({
                role: subtask.role,
                result: subtask.result
            });
        }

        // Calculate metrics
        const totalSteps = this.state.criticalSteps.length;
        const maxCriticalTime = Math.max(...this.state.criticalSteps.map(s => s.time), 0);
        const totalTime = results.totalTime;
        
        results.metrics = {
            totalSteps,
            criticalSteps: maxCriticalTime,
            parallelismRatio: totalSteps > 0 ? (totalTime / maxCriticalTime).toFixed(2) : 1,
            speedupVsSequential: maxCriticalTime > 0 ? (totalTime / maxCriticalTime).toFixed(2) : 1,
            successRate: (this.state.completed.length / this.state.subtasks.length * 100).toFixed(1)
        };

        this.log(`Aggregation complete: ${results.completed}/${this.state.subtasks.length} successful`);
        this.log(`Speedup: ${results.metrics.speedupVsSequential}x | Success Rate: ${results.metrics.successRate}%`);

        return results;
    }

    // === PHASE 6: Metrics Tracking ===
    trackMetrics(results) {
        const entry = {
            timestamp: new Date().toISOString(),
            task: this.state.task,
            ...results.metrics,
            subtaskCount: this.state.subtasks.length
        };

        this.metrics.push(entry);
        
        // Write to metrics file
        fs.writeFileSync(CONFIG.metricsFile, 
            this.metrics.map(m => JSON.stringify(m)).join('\n') + '\n');

        this.log('Metrics tracked');
    }

    // === MAIN EXECUTION ===
    async run(task) {
        this.state.task = task;
        
        console.log(`\n${MAGENTA}╔════════════════════════════════════════════════════╗${NC}`);
        console.log(`${MAGENTA}║${NC}       ${GREEN}Agent Swarm Orchestrator${NC} 🐝                 ${MAGENTA}║${NC}`);
        console.log(`${MAGENTA}╚════════════════════════════════════════════════════╝${NC}`);
        console.log(`${CYAN}Task:${NC} ${task.substring(0, 60)}...\n`);

        try {
            // Phase 1: Load templates
            this.loadTemplates();

            // Phase 2: Intent detection
            const intent = this.analyzeIntent(task);

            // Phase 3: Task decomposition
            this.decomposeTask(task, intent);

            // Phase 4: Execute subtasks in parallel
            await this.executeSubtasks();

            // Phase 5: Aggregate results
            const results = this.aggregateResults();

            // Phase 6: Track metrics
            this.trackMetrics(results);

            // Output results
            console.log(`\n${GREEN}🐝 Swarm Complete!${NC}`);
            console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`);
            console.log(`Subtasks: ${results.completed}/${this.state.subtasks.length} successful`);
            console.log(`Speedup: ${results.metrics.speedupVsSequential}x`);
            console.log(`Success Rate: ${results.metrics.successRate}%`);
            console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n`);

            return results;

        } catch (error) {
            this.log(`Swarm failed: ${error.message}`);
            throw error;
        }
    }

    // === STATUS ===
    getStatus() {
        return {
            active: this.state.completed.length < this.state.subtasks.length,
            completed: this.state.completed.length,
            total: this.state.subtasks.length,
            failed: this.state.failed.length,
            criticalSteps: this.state.criticalSteps.length
        };
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';

    const swarm = new AgentSwarm();

    switch (command) {
        case 'init':
        case 'run':
            const task = args.slice(1).join(' ');
            if (!task) {
                console.log('Usage: swarm-orchestrator.js init "Your task here"');
                process.exit(1);
            }
            await swarm.run(task);
            break;

        case 'status':
            const status = swarm.getStatus();
            console.log(`Swarm Status: ${status.active ? 'Active' : 'Idle'}`);
            console.log(`Completed: ${status.completed}/${status.total}`);
            console.log(`Failed: ${status.failed}`);
            break;

        case 'templates':
            swarm.loadTemplates();
            console.log('Available templates:', Object.keys(swarm.templates));
            break;

        case 'help':
        default:
            console.log(`
${MAGENTA}Agent Swarm Orchestrator 🐝${NC}

Inspired by Kimi K2.5 PARL

Usage:
  node swarm-orchestrator.js init "task description"
  node swarm-orchestrator.js status
  node swarm-orchestrator.js templates
  node swarm-orchestrator.js help

Commands:
  init/run   - Start a new agent swarm for a task
  status     - Show current swarm status
  templates  - List available subagent templates
  help       - Show this help

Examples:
  node swarm-orchestrator.js init "Research AI safety, write code, and document"
  node swarm-orchestrator.js init "Build a REST API and test it"
`);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { AgentSwarm };
