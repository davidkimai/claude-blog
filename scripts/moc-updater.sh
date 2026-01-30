#!/bin/bash
#===============================================================================
# moc-updater.sh - Automatic MOC (Map of Content) Link Updater
#===============================================================================
# Scans notes for updates and links them to relevant MOCs
#
# Usage:
#   ./moc-updater.sh --update        Scan and update all MOCs
#   ./moc-updater.sh --check         Show what would change
#   ./moc-updater.sh --moc <name>    Update specific MOC only
#   ./moc-updater.sh --help          Show this help message
#
# Dependencies:
#   - qmd: for searching and finding relevant MOCs
#   - grep/jq: for parsing frontmatter
#   - bash 4.0+: for associative arrays
#===============================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAWD_DIR="$(dirname "$SCRIPT_DIR")"
NOTES_DIR="$CLAWD_DIR/01_thinking/notes"
MOC_DIR="$CLAWD_DIR/01_thinking/mocs"
LOG_FILE="$CLAWD_DIR/memory/moc-updates.log"
QMD_BIN="/Users/jasontang/.bun/bin/qmd"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

#-------------------------------------------------------------------------------
# Helper Functions
#-------------------------------------------------------------------------------

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $*" >&2
}

error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2
}

success() {
    echo -e "${GREEN}[OK]${NC} $*"
}

show_help() {
    cat << 'EOF'
moc-updater.sh - Automatic MOC Link Updater

USAGE:
    ./moc-updater.sh --update        Scan and update all MOCs
    ./moc-updater.sh --check         Show what would change
    ./moc-updater.sh --moc <name>    Update specific MOC only
    ./moc-updater.sh --help          Show this help message

DESCRIPTION:
    This script scans the 01_thinking/notes/ directory for new or updated
    notes, analyzes their content (title, tags, topics), and automatically
    links them to relevant MOCs (Maps of Content) in 01_thinking/mocs/.

    It uses qmd search to find the most relevant MOCs for each note based
    on topic similarity and keyword matching.

OPTIONS:
    --update     Actually perform the updates (modifies MOC files)
    --check      Preview what changes would be made (dry-run)
    --moc <name> Update only the specified MOC (e.g., "ai-security")
    --help       Show this help message

EXAMPLES:
    # Preview all changes without modifying anything
    ./moc-updater.sh --check

    # Apply all updates
    ./moc-updater.sh --update

    # Update only ai-security MOC
    ./moc-updater.sh --moc ai-security

SAFETY:
    - All MOC modifications are logged to memory/moc-updates.log
    - Backups are created before modifying any MOC file
    - Use --check first to preview changes before --update

EOF
}

#-------------------------------------------------------------------------------
# Core Functions
#-------------------------------------------------------------------------------

ensure_directories() {
    if [[ ! -d "$NOTES_DIR" ]]; then
        info "Creating notes directory: $NOTES_DIR"
        mkdir -p "$NOTES_DIR"
    fi
    
    if [[ ! -d "$MOC_DIR" ]]; then
        info "Creating MOC directory: $MOC_DIR"
        mkdir -p "$MOC_DIR"
    fi
    
    if [[ ! -d "$(dirname "$LOG_FILE")" ]]; then
        mkdir -p "$(dirname "$LOG_FILE")"
    fi
    
    if [[ ! -f "$LOG_FILE" ]]; then
        touch "$LOG_FILE"
    fi
}

# Extract title from note (first H1 or from frontmatter)
get_note_title() {
    local note_file="$1"
    local title=""
    
    # Try frontmatter title first
    title=$(grep -E '^title:' "$note_file" 2>/dev/null | sed 's/^title:[[:space:]]*//i' | sed 's/^"//;s/"$//' || true)
    
    if [[ -z "$title" ]]; then
        # Fall back to first H1
        title=$(grep -E '^# ' "$note_file" 2>/dev/null | head -1 | sed 's/^# //' || true)
    fi
    
    # If still empty, use filename
    if [[ -z "$title" ]]; then
        title=$(basename "$note_file" .md)
        title=$(echo "$title" | tr '-' ' ' | sed 's/\b\(.\)/\U\1/g')
    fi
    
    echo "$title"
}

# Extract tags from note
get_note_tags() {
    local note_file="$1"
    grep -E 'tags:' "$note_file" 2>/dev/null | \
        sed -E 's/.*tags: *\[//;s/\].*//' | tr ',' '\n' | tr -d ' #' | tr '[:upper:]' '[:lower:]' || true
}

# Extract key topics from note content (simplified)
get_note_topics() {
    local note_file="$1"
    # Extract words after # (hashtags) and key phrases
    grep -E '^#+ ' "$note_file" 2>/dev/null | sed 's/^#+ //' | tr '[:upper:]' '[:lower:]' | head -5 || true
}

# Generate brief description from note content
get_note_description() {
    local note_file="$1"
    local title=$(get_note_title "$note_file")
    # Get first paragraph (non-empty, non-header line)
    sed -n '/^#/d;/^$/d;/^---$/,/^---$/d;p' "$note_file" 2>/dev/null | head -2 | tr '\n' ' ' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | cut -c1-150 || echo "$title"
}

# Find relevant MOCs for a note using qmd search
find_relevant_mocs() {
    local note_file="$1"
    local title=$(get_note_title "$note_file")
    local topics=$(get_note_topics "$note_file" | tr '\n' ' ')
    local query="${title} ${topics}"
    
    # Also search by tags
    local tags=$(get_note_tags "$note_file" | tr '\n' ' ')
    query="${query} ${tags}"
    
    # Use qmd search to find relevant MOC files
    local results=()
    
    if [[ -d "$MOC_DIR" ]]; then
        # Search for MOCs related to this note using qmd
        local qmd_results
        qmd_results=$("$QMD_BIN" search "$query" --files --all 2>/dev/null | grep -E '\.md' || true)
        
        while IFS= read -r line; do
            if [[ -n "$line" ]]; then
                # Extract filename from line
                local moc_file
                moc_file=$(echo "$line" | grep -oE '[a-zA-Z0-9_-]+\.md' | head -1 || true)
                if [[ -n "$moc_file" && -f "$MOC_DIR/$moc_file" ]]; then
                    results+=("$moc_file")
                fi
            fi
        done <<< "$qmd_results"
    fi
    
    # If no qmd results, try keyword matching against MOC filenames
    if [[ ${#results[@]} -eq 0 ]]; then
        for moc_file in "$MOC_DIR"/*.md; do
            [[ -f "$moc_file" ]] || continue
            local moc_name
            moc_name=$(basename "$moc_file" .md)
            local moc_name_lc=$(echo "$moc_name" | tr '[:upper:]' '[:lower:]')
            
            # Check if any topic or tag matches MOC name
            for topic in $topics; do
                local topic_lc=$(echo "$topic" | tr '[:upper:]' '[:lower:]')
                if [[ "$moc_name_lc" == *"$topic_lc"* ]]; then
                    results+=("$(basename "$moc_file")")
                    break
                fi
            done
        done 2>/dev/null
    fi
    
    # Remove duplicates and output
    if [[ ${#results[@]} -gt 0 ]]; then
        printf '%s\n' "${results[@]}" | sort -u
    fi
}

# Check if note is already linked in MOC
is_note_linked_in_moc() {
    local note_file="$1"
    local moc_file="$2"
    local note_basename=$(basename "$note_file")
    
    grep -qE "\[\[${note_basename}\]\]" "$moc_file" 2>/dev/null || \
    grep -qE "\[\[.*${note_basename}\]\]" "$moc_file" 2>/dev/null
}

# Create backup of MOC file
backup_moc() {
    local moc_file="$1"
    local backup="${moc_file}.bak.$(date +%Y%m%d_%H%M%S)"
    cp "$moc_file" "$backup"
    info "Backed up MOC to: $backup"
}

# Add note link to MOC
add_to_moc() {
    local note_file="$1"
    local moc_file="$2"
    local mode="${3:-update}"  # update or check
    
    local note_basename=$(basename "$note_file")
    local note_title=$(get_note_title "$note_file")
    local note_description=$(get_note_description "$note_file")
    local today=$(date '+%Y-%m-%d')
    
    # Determine relevance based on topics/tags match
    local relevance="General topic connection"
    local topics=$(get_note_topics "$note_file" | head -3 | tr '\n' ', ')
    if [[ -n "$topics" ]]; then
        relevance="Related to: ${topics%,}"
    fi
    
    local link_entry="- [[${note_basename}]] - ${note_description}
  - Discovered: ${today}
  - Relevance: ${relevance}"
    
    if [[ "$mode" == "check" ]]; then
        echo "Would add to $moc_file:"
        echo "  [[${note_basename}]] - ${note_description}"
        return 0
    fi
    
    # Create backup before modifying
    backup_moc "$moc_file"
    
    # Use temp file for modifications
    local temp_file="${moc_file}.tmp.$$"
    
    # Find the "Recently Added" section or create one
    if grep -qE "^## Recently Added" "$moc_file"; then
        # Insert after "## Recently Added" header
        local insert_marker="^## Recently Added$"
        local after_line=$(grep -n "$insert_marker" "$moc_file" | cut -d: -f1 | head -1)
        if [[ -n "$after_line" ]]; then
            local head_lines=$((after_line + 1))
            local tail_lines=$(($(wc -l < "$moc_file") - head_lines + 1))
            head -n "$head_lines" "$moc_file" > "$temp_file"
            echo "" >> "$temp_file"
            echo "$link_entry" >> "$temp_file"
            tail -n "+$tail_lines" "$moc_file" >> "$temp_file" 2>/dev/null || true
            mv "$temp_file" "$moc_file"
        fi
    elif grep -qE "^## Links" "$moc_file"; then
        # Insert before "## Links" section
        local before_line=$(grep -n "^## Links$" "$moc_file" | cut -d: -f1 | head -1)
        if [[ -n "$before_line" ]]; then
            head -n $((before_line - 1)) "$moc_file" > "$temp_file"
            echo "## Recently Added" >> "$temp_file"
            echo "" >> "$temp_file"
            echo "$link_entry" >> "$temp_file"
            echo "" >> "$temp_file"
            tail -n "+$before_line" "$moc_file" >> "$temp_file"
            mv "$temp_file" "$moc_file"
        fi
    elif grep -qE "^## Related" "$moc_file"; then
        # Insert before "## Related" section
        local before_line=$(grep -n "^## Related$" "$moc_file" | cut -d: -f1 | head -1)
        if [[ -n "$before_line" ]]; then
            head -n $((before_line - 1)) "$moc_file" > "$temp_file"
            echo "## Recently Added" >> "$temp_file"
            echo "" >> "$temp_file"
            echo "$link_entry" >> "$temp_file"
            echo "" >> "$temp_file"
            tail -n "+$before_line" "$moc_file" >> "$temp_file"
            mv "$temp_file" "$moc_file"
        fi
    else
        # Append to end with section header
        echo "" >> "$moc_file"
        echo "## Recently Added" >> "$moc_file"
        echo "" >> "$moc_file"
        echo "$link_entry" >> "$moc_file"
    fi
    
    log "INFO" "Added [[${note_basename}]] to ${moc_file}"
    success "Added [[${note_basename}]] to $(basename "$moc_file")"
}

# Scan notes and find those needing MOC updates
scan_notes_for_mocs() {
    local mode="${1:-check}"
    local specific_moc="${2:-}"
    
    local update_count=0
    local notes_scanned=0
    local notes_linked=0
    
    info "Scanning notes in: $NOTES_DIR"
    
    if [[ ! -d "$NOTES_DIR" ]]; then
        warn "Notes directory does not exist: $NOTES_DIR"
        return 0
    fi
    
    # Find all markdown notes
    local notes=()
    while IFS= read -r -d '' note_file; do
        notes+=("$note_file")
    done < <(find "$NOTES_DIR" -name "*.md" -type f -print0 2>/dev/null)
    
    info "Found ${#notes[@]} notes to process"
    
    for note_file in "${notes[@]}"; do
        notes_scanned=$((notes_scanned + 1))
        
        # Find relevant MOCs
        local relevant_mocs=()
        while read -r moc; do
            [[ -n "$moc" ]] && relevant_mocs+=("$moc")
        done < <(find_relevant_mocs "$note_file")
        
        if [[ ${#relevant_mocs[@]} -eq 0 ]]; then
            # No relevant MOC found, check if there's a general one or skip
            if [[ -n "$specific_moc" && -f "$MOC_DIR/${specific_moc}.md" ]]; then
                relevant_mocs=("${specific_moc}.md")
            else
                continue
            fi
        fi
        
        # Filter by specific MOC if provided
        if [[ -n "$specific_moc" ]]; then
            local filtered=()
            for moc in "${relevant_mocs[@]}"; do
                if [[ "$moc" == "${specific_moc}.md" ]]; then
                    filtered+=("$moc")
                fi
            done
            relevant_mocs=("${filtered[@]:-}")
        fi
        
        # Check if already linked
        local needs_link=false
        for moc_file in "${relevant_mocs[@]}"; do
            local full_moc_path="$MOC_DIR/$moc_file"
            if [[ -f "$full_moc_path" ]]; then
                if ! is_note_linked_in_moc "$note_file" "$full_moc_path"; then
                    needs_link=true
                    break
                else
                    notes_linked=$((notes_linked + 1))
                fi
            fi
        done
        
        if [[ "$needs_link" == "true" ]]; then
            local note_basename=$(basename "$note_file")
            
            if [[ "$mode" == "check" ]]; then
                echo ""
                echo "=== $(get_note_title "$note_file") ==="
                echo "File: $note_basename"
                for moc_file in "${relevant_mocs[@]}"; do
                    if [[ -f "$MOC_DIR/$moc_file" ]]; then
                        echo "  → Would link to: $moc_file"
                    fi
                done
            else
                for moc_file in "${relevant_mocs[@]}"; do
                    local full_moc_path="$MOC_DIR/$moc_file"
                    if [[ -f "$full_moc_path" ]]; then
                        add_to_moc "$note_file" "$full_moc_path" "update"
                        update_count=$((update_count + 1))
                    fi
                done
            fi
        fi
    done
    
    echo ""
    if [[ "$mode" == "check" ]]; then
        info "Scan complete. Found $(($notes_scanned - $notes_linked)) notes needing MOC updates"
    else
        success "Updated $update_count MOC entries"
    fi
    
    log "INFO" "Mode: $mode, Scanned: $notes_scanned, Updated: $update_count"
}

# Ensure qmd collection is set up for notes
ensure_qmd_collection() {
    if ! command -v "$QMD_BIN" &> /dev/null; then
        warn "qmd not found at $QMD_BIN"
        return 1
    fi
    
    # Check if notes are indexed
    if [[ -d "$NOTES_DIR" ]]; then
        # Ensure notes are indexed in qmd context
        "$QMD_BIN" context add "$NOTES_DIR" --name "notes" 2>/dev/null || :
        "$QMD_BIN" context add "$NOTES_DIR" 2>/dev/null || :
    fi
}

#-------------------------------------------------------------------------------
# Main
#-------------------------------------------------------------------------------

main() {
    local mode="check"
    local specific_moc=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --update)
                mode="update"
                shift
                ;;
            --check)
                mode="check"
                shift
                ;;
            --moc)
                if [[ -z "${2:-}" ]]; then
                    error "--moc requires a name argument"
                    exit 1
                fi
                specific_moc="$2"
                shift 2
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo "=============================================="
    echo "  MOC Auto-Updater"
    echo "=============================================="
    echo ""
    
    # Ensure required directories exist
    ensure_directories
    
    # Ensure qmd is ready
    ensure_qmd_collection
    
    # Log operation
    log "INFO" "Starting MOC update (mode: $mode, moc: ${specific_moc:-all})"
    
    # Run the scan/update
    if [[ "$mode" == "check" ]]; then
        echo "MODE: Check (preview only, no changes will be made)"
        echo ""
        scan_notes_for_mocs "check" "$specific_moc"
        echo ""
        info "Use --update to apply these changes"
    else
        echo "MODE: Update (modifying MOC files)"
        echo ""
        scan_notes_for_mocs "update" "$specific_moc"
        echo ""
        success "MOC update complete"
        log "INFO" "MOC update completed"
    fi
    
    echo ""
    echo "Full log: $LOG_FILE"
}

# Run main with all arguments
main "$@"
