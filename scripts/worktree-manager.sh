#!/bin/bash
#
# Git Worktree Manager for Multi-Agent Orchestration
# Creates isolated worktrees with shared notes/assets
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAWD_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKTREES_DIR="$CLAWD_DIR/worktrees"
NOTES_DIR="$CLAWD_DIR/01_thinking/notes"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

usage() {
    cat << EOF
Git Worktree Manager for Multi-Agent Orchestration

Usage: $(basename "$0") <command> [options]

Commands:
    list                      List all worktrees with status
    create <name> [--branch]  Create a new worktree (default: main branch)
    remove <name>             Remove a worktree (preserves notes symlink)
    cd <name>                 Output cd command to worktree directory

Options:
    --branch <branch>         Specify branch for create (default: main)

Examples:
    $(basename "$0") list
    $(basename "$0") create ai-research
    $(basename "$0") create ai-research --branch develop
    $(basename "$0") remove ai-research
    cd $(basename "$0") cd ai-research
EOF
    exit 1
}

require_git_repo() {
    if ! git -C "$CLAWD_DIR" rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository: $CLAWD_DIR"
        exit 1
    fi
}

ensure_worktrees_dir() {
    if [[ ! -d "$WORKTREES_DIR" ]]; then
        mkdir -p "$WORKTREES_DIR"
        log_info "Created worktrees directory: $WORKTREES_DIR"
    fi
}

get_worktree_name() {
    local worktree_path="$1"
    basename "$worktree_path"
}

get_worktree_status() {
    local worktree_path="$1"
    local name=$(get_worktree_name "$worktree_path")
    
    # Check if worktree directory exists
    if [[ ! -d "$worktree_path" ]]; then
        echo "missing"
        return
    fi
    
    # Check for uncommitted changes
    cd "$worktree_path"
    if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
        echo "uncommitted"
    elif git remote get-url origin &>/dev/null; then
        echo "clean"
    else
        echo "local"
    fi
}

cmd_list() {
    require_git_repo
    ensure_worktrees_dir
    
    echo -e "${BLUE}=== Git Worktrees ===${NC}"
    echo ""
    
    local found=false
    local wt_path=""
    local wt_branch=""
    
    # Parse git worktree list --porcelain output
    # Format: worktree <path>\nHEAD <hash>\nbranch <ref>\n...
    while IFS= read -r line; do
        if [[ "$line" =~ ^worktree[[:space:]]+(.*)$ ]]; then
            wt_path="${BASH_REMATCH[1]}"
        elif [[ "$line" =~ ^branch[[:space:]]+refs/heads/(.*)$ ]]; then
            wt_branch="${BASH_REMATCH[1]}"
            
            # Only show worktrees in our worktrees directory
            if [[ -n "$wt_path" && "$wt_path" == "$WORKTREES_DIR"/* ]]; then
                found=true
                local name=$(get_worktree_name "$wt_path")
                local status=$(get_worktree_status "$wt_path")
                
                case "$status" in
                    clean)
                        echo -e "  ${GREEN}●${NC} $name ($wt_branch) - clean"
                        ;;
                    uncommitted)
                        echo -e "  ${YELLOW}●${NC} $name ($wt_branch) - uncommitted changes"
                        ;;
                    local)
                        echo -e "  ${BLUE}●${NC} $name ($wt_branch) - local only"
                        ;;
                    missing)
                        echo -e "  ${RED}●${NC} $name ($wt_branch) - missing"
                        ;;
                esac
            fi
            
            wt_path=""
            wt_branch=""
        fi
    done < <(git -C "$CLAWD_DIR" worktree list --porcelain 2>/dev/null)
    
    if [[ "$found" == "false" ]]; then
        echo "  No worktrees found in $WORKTREES_DIR"
    fi
    
    echo ""
    echo "Usage: $(basename "$0") cd <name>  # Navigate to worktree"
}

generate_claude_md() {
    local name="$1"
    local branch="$2"
    
    cat << EOF
# Worktree: $name

extends: ../CLAUDE.md

## Worktree-Specific Context

**Purpose:** [Describe the purpose of this worktree]
**Scope:** [What this worktree focuses on]
**MOCs:** [[../../01_thinking/mocs/<topic>.md]]

## Agent Instructions

- Start at: [[MOC-name]]
- When done: Commit and sync back to main
- Don't modify: System files, root CLAUDE.md

## Current Branch

\`$branch\`
EOF
}

cmd_create() {
    local name=""
    local branch="main"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --branch)
                branch="$2"
                shift 2
                ;;
            -*)
                log_error "Unknown option: $1"
                usage
                ;;
            *)
                name="$1"
                shift
                ;;
        esac
    done
    
    if [[ -z "$name" ]]; then
        log_error "Worktree name required"
        usage
    fi
    
    # Validate name (no spaces, no special chars except - and _)
    if ! [[ "$name" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        log_error "Invalid worktree name. Use only letters, numbers, hyphens, and underscores"
        exit 1
    fi
    
    require_git_repo
    ensure_worktrees_dir
    
    local worktree_path="$WORKTREES_DIR/$name"
    
    # Check if worktree already exists
    if [[ -d "$worktree_path" ]]; then
        log_error "Worktree already exists: $name"
        exit 1
    fi
    
    log_info "Creating worktree '$name'..."
    
    # Check if branch exists, if not create it
    if git -C "$CLAWD_DIR" rev-parse --verify "$branch" >/dev/null 2>&1; then
        # Branch exists, check it out in the worktree
        git -C "$CLAWD_DIR" worktree add "$worktree_path" "$branch"
    else
        # Branch doesn't exist, create from current HEAD
        git -C "$CLAWD_DIR" worktree add -b "$branch" "$worktree_path"
    fi
    
    # Generate CLAUDE.md for this worktree
    generate_claude_md "$name" "$branch" > "$worktree_path/CLAUDE.md"
    log_info "Created CLAUDE.md for worktree"
    
    # Create notes symlink (shared with main repo)
    if [[ -d "$NOTES_DIR" ]]; then
        ln -sf "$NOTES_DIR" "$worktree_path/notes"
        log_info "Created notes symlink"
    else
        log_warn "Notes directory not found: $NOTES_DIR"
    fi
    
    # Remove .git from worktree directory (it's in .git/worktrees/<name>)
    # Git worktree manages its own .git as a file pointing to the parent
    
    log_success "Worktree created: $worktree_path"
    echo ""
    echo "Next steps:"
    echo "  1. cd $worktree_path"
    echo "  2. Edit CLAUDE.md to customize for this worktree"
    echo "  3. Start working!"
}

cmd_remove() {
    local name="$1"
    
    if [[ -z "$name" ]]; then
        log_error "Worktree name required"
        usage
    fi
    
    require_git_repo
    
    local worktree_path="$WORKTREES_DIR/$name"
    
    # Check if worktree exists
    if [[ ! -d "$worktree_path" ]]; then
        log_error "Worktree not found: $name"
        exit 1
    fi
    
    # Check for uncommitted changes
    cd "$worktree_path"
    if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
        log_warn "Worktree has uncommitted changes:"
        git -C "$worktree_path" status --short
        echo ""
        read -p "Remove anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Aborted"
            exit 0
        fi
    fi
    
    # Remove the worktree (preserves the notes symlink target)
    log_info "Removing worktree: $name"
    git -C "$CLAWD_DIR" worktree remove "$worktree_path" --force 2>/dev/null || {
        # Fallback: manual removal if git worktree remove fails
        rm -rf "$worktree_path"
    }
    
    log_success "Worktree removed: $name"
    echo ""
    echo "Note: Notes are stored in $NOTES_DIR and were preserved."
}

cmd_cd() {
    local name="$1"
    
    if [[ -z "$name" ]]; then
        log_error "Worktree name required"
        usage
    fi
    
    local worktree_path="$WORKTREES_DIR/$name"
    
    if [[ ! -d "$worktree_path" ]]; then
        log_error "Worktree not found: $name"
        echo "Run '$(basename "$0") list' to see available worktrees"
        exit 1
    fi
    
    echo "$worktree_path"
}

# Main command dispatcher
main() {
    if [[ $# -eq 0 ]]; then
        usage
    fi
    
    local command="$1"
    shift
    
    case "$command" in
        list|--list|-l)
            cmd_list
            ;;
        create|--create|-c)
            cmd_create "$@"
            ;;
        remove|--remove|-r)
            cmd_remove "$@"
            ;;
        cd)
            cmd_cd "$@"
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            log_error "Unknown command: $command"
            usage
            ;;
    esac
}

main "$@"
