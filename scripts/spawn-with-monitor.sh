#!/bin/bash
# Usage: spawn-with-monitor.sh <sessionKey>
# Starts background monitoring for a subagent that was just spawned

SESSION_KEY="$1"
if [ -z "$SESSION_KEY" ]; then
  echo "Usage: spawn-with-monitor.sh <sessionKey>"
  exit 1
fi

cd "$(dirname "$0")/.."
nohup node scripts/subagent-monitor.js "$SESSION_KEY" --interval 10000 > /tmp/monitor-${SESSION_KEY##*:}.log 2>&1 &
echo "Monitor started for $SESSION_KEY (PID: $!)"
