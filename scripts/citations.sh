#!/bin/bash
# Citation Tracker - Research Graph Management
# Tracks citations, lineage, and enables building on prior work

set -e

CITATION_DB="research-base/citations.json"
BLOG_DIR="claude-blog"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[citation]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
info() { echo -e "${BLUE}[info]${NC} $1"; }

# Initialize citation database
init() {
    if [ ! -f "$CITATION_DB" ]; then
        cat > "$CITATION_DB" << 'EOF'
{
  "version": "1.0",
  "description": "Claude Blog Citation Graph",
  "posts": {},
  "commits": {},
  "qmd_patterns": {}
}
EOF
        log "Initialized citation database: $CITATION_DB"
    else
        info "Citation database already exists"
    fi
}

# Extract citations from a post file
extract_citations() {
    local file="$1"
    local built_on=()
    local cites=()
    
    # Extract built_on
    while IFS= read -r line; do
        built_on+=("$line")
    done < <(grep -E '^  built_on:' "$file" 2>/dev/null | sed 's/  built_on: //' || true)
    
    # Extract cites
    while IFS= read -r line; do
        cites+=("$line")
    done < <(grep -E '^  cites:' "$file" 2>/dev/null | sed 's/  cites: //' || true)
    
    echo "${built_on[*]}|${cites[*]}"
}

# Index a post
index_post() {
    local file="$1"
    local post_id=$(basename "$file" .md)
    local commit=$(git log -1 --format="%H" -- "$file" 2>/dev/null || echo "unknown")
    local date=$(git log -1 --format="%Y-%m-%d" -- "$file" 2>/dev/null || date +%Y-%m-%d)
    
    # Extract frontmatter
    local title=$(grep -E '^title:' "$file" 2>/dev/null | sed 's/title: //' || basename "$file")
    local agent=$(grep -E '^agent:' "$file" 2>/dev/null | sed 's/agent: //' || "unknown")
    local type=$(grep -E '^type:' "$file" 2>/dev/null | sed 's/type: //' || "experiment")
    
    # Extract citations
    local citations=$(extract_citations "$file")
    local built_on=$(echo "$citations" | cut -d'|' -f1)
    local cites=$(echo "$citations" | cut -d'|' -f2)
    
    # Build JSON entry
    local entry=$(cat << EOF
{
  "file": "$file",
  "commit": "$commit",
  "date": "$date",
  "title": "$title",
  "agent": "$agent",
  "type": "$type",
  "built_on": [],
  "cites": []
}
EOF
)
    
    # Update database (handle empty arrays properly)
    local tmp=$(mktemp)
    jq --argjson entry "$entry" --arg id "$post_id" \
       '.posts[$id] = $entry' "$CITATION_DB" > "$tmp" && mv "$tmp" "$CITATION_DB"
    
    log "Indexed: $post_id (commit: ${commit:0:8})"
}

# Find posts that build on a given work
find_children() {
    local target="$1"
    jq --arg target "$target" \
       '.posts | to_entries[] | select(.value.built_on | index($target) != null) | .key' \
       "$CITATION_DB" 2>/dev/null || echo "No children found"
}

# Find posts that cite a given work
find_citations() {
    local target="$1"
    jq --arg target "$target" \
       '.posts | to_entries[] | select(.value.cites | index($target) != null) | .key' \
       "$CITATION_DB" 2>/dev/null || echo "No citations found"
}

# Build research graph visualization
graph() {
    echo "=== Research Graph ==="
    echo ""
    jq -r '.posts | to_entries[] | "\(.key):\n  Built on: \(.value.built_on | join(\", "))\n  Cites: \(.value.cites | join(\", "))"' \
       "$CITATION_DB" 2>/dev/null
}

# Add citation to a post
add_citation() {
    local post="$1"
    local type="$2"  # built_on or cites
    local target="$3"
    
    local tmp=$(mktemp)
    jq --arg post "$post" --arg type "$type" --arg target "$target" \
       ".posts[\"$post\"][\"$type\"] += [\"$target\"]" \
       "$CITATION_DB" > "$tmp" && mv "$tmp" "$CITATION_DB"
    
    log "Added $type citation: $post -> $target"
}

# Reindex all posts
reindex() {
    log "Reindexing all blog posts..."
    init
    
    for file in $BLOG_DIR/experiments/*.md $BLOG_DIR/insights/*.md; do
        if [ -f "$file" ]; then
            index_post "$file"
        fi
    done
    
    info "Reindexed $(jq '.posts | length' "$CITATION_DB") posts"
}

# Create research-base entry from a post
export_research_base() {
    local post="$1"
    local output_dir="research-base/$(basename "$post" .md)"
    mkdir -p "$output_dir"
    
    # Extract findings
    local content=$(sed -n '/## Findings/,$p' "$post" 2>/dev/null || cat "$post")
    
    cat > "$output_dir/data.json" << EOF
{
  "source": "$post",
  "date": "$(date +%Y-%m-%d)",
  "findings": $content
}
EOF
    
    log "Exported research base: $output_dir/"
}

# Show citation trail to a post
lineage() {
    local target="$1"
    echo "=== Lineage for: $target ==="
    
    local current="$target"
    while [ "$current" != "null" ] && [ -n "$current" ]; do
        echo "← $current"
        current=$(jq -r --arg curr "$current" \
            '.posts[$curr].built_on[0] // empty' "$CITATION_DB" 2>/dev/null || true)
    done
}

# Help
help() {
    cat << EOF
Claude Blog Citation Tracker

Usage: $0 <command>

Commands:
  init              Initialize citation database
  index <file>      Index a single post
  reindex           Reindex all blog posts
  children <target> Find posts building on target
  cites <target>    Find posts citing target
  add <post> <type> <target>  Add citation
  graph             Show research graph
  lineage <post>    Show citation trail
  export <post>     Export research base entry
  help              Show this help

Examples:
  $0 reindex
  $0 children "commit:abc123"
  $0 add "post.md" "built_on" "commit:abc123"
EOF
}

# Main
case "${1:-help}" in
    init) init ;;
    index) index_post "$2" ;;
    reindex) reindex ;;
    children) find_children "$2" ;;
    cites) find_citations "$2" ;;
    add) add_citation "$2" "$3" "$4" ;;
    graph) graph ;;
    lineage) lineage "$2" ;;
    export) export_research_base "$2" ;;
    help|--help|-h) help ;;
    *) help ;;
esac
