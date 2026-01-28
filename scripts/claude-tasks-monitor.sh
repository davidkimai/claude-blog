#!/bin/bash
#
# Claude Tasks Monitor
# Watches for Claude Code native Tasks integration
# Migrates from custom bead system when Tasks API is available
#

set -euo pipefail

CLAWD="/Users/jasontang/clawd"
TASK_DIR="$CLAWD/.claude/tasks"
STATE_DIR="$CLAWD/.claude/state"
TODOS_DIR="$HOME/.claude/todos"

log() { echo "[$(date '+%H:%M:%S')] [Tasks-Monitor] $1"; }

# Check if Claude Code Tasks directory exists
check_tasks_dir() {
    if [ -d "$TASK_DIR" ]; then
        log "Tasks directory found: $TASK_DIR"
        ls -la "$TASK_DIR" 2>/dev/null || true
        return 0
    else
        log "Tasks directory not yet created by Claude Code"
        return 1
    fi
}

# Check if Claude Code is using Tasks or Todos
check_current_system() {
    if [ -d "$TODOS_DIR" ]; then
        log "Claude Code currently using: TODOS ($TODOS_DIR)"
        TODOS_COUNT=$(find "$TODOS_DIR" -name "*.json" 2>/dev/null | wc -l)
        log "Active todo files: $TODOS_COUNT"
    fi
    
    if [ -d "$TASK_DIR" ]; then
        log "Claude Code currently using: TASKS ($TASK_DIR)"
        TASK_COUNT=$(find "$TASK_DIR" -name "*.json" 2>/dev/null | wc -l)
        log "Active task files: $TASK_COUNT"
    fi
}

# Create placeholder structure for future Tasks integration
setup_tasks_structure() {
    mkdir -p "$TASK_DIR"
    
    # Create metadata placeholder
    cat > "$TASK_DIR/.claude-tasks-metadata.json" << 'EOF'
{
    "version": "1.0",
    "created": "2026-01-27T",
    "note": "Structure ready for Claude Code Tasks integration",
    "status": "waiting_for_native_tasks"
}
EOF
    
    log "Created Tasks directory structure: $TASK_DIR"
}

# Migrate from bead system to Tasks (when available)
migrate_from_beads() {
    local beads_file="$STATE_DIR/beads.jsonl"
    
    if [ -f "$beads_file" ]; then
        log "Found existing bead system at $beads_file"
        log "Beads will be migrated to native Tasks when API is available"
        
        # Count pending beads
        PENDING=$(grep -c '"status":"pending"' "$beads_file" 2>/dev/null || echo 0)
        COMPLETED=$(grep -c '"status":"completed"' "$beads_file" 2>/dev/null || echo 0)
        
        log "Pending beads: $PENDING, Completed: $COMPLETED"
        
        # Keep bead file as backup until migration
        cp "$beads_file" "$STATE_DIR/beads.backup.jsonl"
        log "Backed up beads to beads.backup.jsonl"
    fi
}

# Create migration script for future use
create_migration_script() {
    cat > "$STATE_DIR/migrate-beads-to-tasks.sh" << 'MIGRATE'
#!/bin/bash
# Migration script: Beads → Claude Code Tasks
# Run this when Tasks API becomes available to scripts

BEADS_FILE="$HOME/.claude/state/beads.jsonl"
OUTPUT_DIR="$HOME/.claude/tasks"

echo "Migration: Beads → Native Tasks"
echo "Beads file: $BEADS_FILE"
echo "Output dir: $OUTPUT_DIR"

# This script will be populated when Tasks API is documented
# Expected: Some way to call TaskWrite or similar from CLI

echo "Migration script ready - awaiting Claude Code Tasks API documentation"
MIGRATE

chmod +x "$STATE_DIR/migrate-beads-to-tasks.sh"
log "Created migration script: $STATE_DIR/migrate-beads-to-tasks.sh"
}

# Main monitor loop
main() {
    log "Starting Claude Tasks Monitor"
    
    # Setup if first run
    if [ ! -d "$TASK_DIR" ]; then
        setup_tasks_structure
    fi
    
    # Check current system
    check_current_system
    
    # Check for migration readiness
    migrate_from_beads
    create_migration_script
    
    log "Monitor ready. Run 'check' to inspect current state."
    log "Run 'watch' to continuously monitor for Tasks directory creation."
}

# Commands
case "${1:-check}" in
    check)
        check_tasks_dir || log "Tasks not yet available"
        check_current_system
        ;;
    watch)
        log "Watching for Tasks directory... (Ctrl+C to stop)"
        while true; do
            if check_tasks_dir; then
                log "Tasks detected! Integration ready."
                break
            fi
            sleep 30
        done
        ;;
    status)
        echo "=== Claude Tasks Status ==="
        echo "Tasks directory: $TASK_DIR"
        echo "Todos directory: $TODOS_DIR"
        echo "Beads file: $STATE_DIR/beads.jsonl"
        echo "Migration script: $STATE_DIR/migrate-beads-to-tasks.sh"
        ;;
    migrate)
        migrate_from_beads
        create_migration_script
        log "Migration preparation complete"
        ;;
    *)
        echo "Usage: $0 [check|watch|status|migrate]"
        echo ""
        echo "Commands:"
        echo "  check   - Inspect current state"
        echo "  watch   - Wait for Tasks directory creation"
        echo "  status  - Show status of all systems"
        echo "  migrate - Prepare migration from beads"
        ;;
esac
