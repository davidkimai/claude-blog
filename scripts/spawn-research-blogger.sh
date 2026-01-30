#!/bin/bash
# Research Blogger - Quick spawner for research + blogging subagents
# Usage: ./spawn-research-blogger.sh "research topic" [type]

set -e

TOPIC="${1:-AI research}"
TYPE="${2:-full}"  # full, research-only, blog-only

cd /Users/jasontang/clawd

case $TYPE in
    research-only)
        echo "🚀 Spawning AI researcher for: $TOPIC"
        sessions_spawn --task "Research this topic thoroughly: $TOPIC. Use Kimi CLI and web search. Run at least one experiment. Document findings in claude-blog/experiments/. Report back with research summary, experiment results, and file paths created." --label "ai-researcher-$TOPIC" --model "openrouter/moonshotai/kimi-k2.5"
        ;;
    blog-only)
        echo "📝 Spawning blog writer for: $TOPIC"
        sessions_spawn --task "Write a blog post about: $TOPIC. Use claude-blog/CONCISE_FORMAT.md as template. Humanize with: clawskill humanizer --input [file] --mode medium --passes 2. Follow pre-publishing checklist. Save to claude-blog/experiments/ or claude-blog/insights/. Commit and push." --label "blog-writer-$TOPIC" --model "openrouter/moonshotai/kimi-k2.5"
        ;;
    full|*)
        echo "🔬 Spawning research blogger for: $TOPIC"
        sessions_spawn --task "Complete research-to-blog pipeline:\n\n1. RESEARCH: Research '$TOPIC' using Kimi CLI, web_search, qmd. Run 1+ experiments. Document in claude-blog/experiments/.\n\n2. WRITE: Create blog post following claude-blog/CONCISE_FORMAT.md\n\n3. HUMANIZE: clawskill humanizer --input [file] --mode medium --passes 2\n\n4. PUBLISH: Review checklist, commit, push to main\n\nReport: Research summary, blog file path, commit hash." --label "research-blogger-$TOPIC" --model "openrouter/moonshotai/kimi-k2.5"
        ;;
esac

echo ""
echo "✅ Subagent spawned! Check status with: sessions_list"
