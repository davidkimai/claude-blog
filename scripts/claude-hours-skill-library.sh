#!/bin/bash
# Claude Hours Skill Library - Persistent Skill Acquisition System
# Stores and manages learned skills for reuse across nights

CLAWD="/Users/jasontang/clawd"
SKILL_LIB="$CLAWD/.claude/state/skill_library.json"
SKILL_DIR="$CLAWD/.claude/skills"

mkdir -p "$SKILL_DIR"

# Colors
GREEN='\033[0;32m' BLUE='\033[0;34m' NC='\033[0m'

log() { echo "[$(date '+%H:%M:%S')] [SKILL-LIB] $1"; }

# === DATA STRUCTURE ===
# {
#   "skills": [
#     {
#       "id": "skill-001",
#       "name": "parse-json-config",
#       "description": "Parse and validate JSON configuration files",
#       "command": "./scripts/parse-json-config.sh",
#       "category": "data-processing",
#       "tags": ["json", "config", "validation"],
#       "created_at": "2026-01-30T08:00:00Z",
#       "last_used": "2026-01-30T10:30:00Z",
#       "use_count": 5,
#       "success_rate": 1.0,
#       "contexts": ["config", "setup", "validation"],
#       "dependencies": ["jq"],
#       "code": "#!/bin/bash\n..."
#     }
#   ],
#   "version": "1.0",
#   "last_updated": "2026-01-30T08:00:00Z"
# }

# === INITIALIZE LIBRARY ===
init_library() {
    if [ ! -f "$SKILL_LIB" ]; then
        cat > "$SKILL_LIB" << 'EOF'
{
  "skills": [],
  "version": "1.0",
  "last_updated": "NOW"
}
EOF
        # Replace NOW with timestamp
        now=$(date -Iseconds)
        sed -i "s/NOW/$now/" "$SKILL_LIB"
        log "Created skill library: $SKILL_LIB"
    else
        log "Skill library exists: $SKILL_LIB"
    fi
}

# === ADD A SKILL ===
add_skill() {
    local name="$1"
    local description="$2"
    local command="$3"
    local category="$4"
    local code="$5"
    
    init_library
    
    local id="skill-$(date +%Y%m%d)-$(printf '%03d' $(jq '.skills | length' "$SKILL_LIB" 2>/dev/null || echo 0))"
    local now=$(date -Iseconds)
    
    # Build skill JSON
    local skill_json=$(cat << EOF
{
  "id": "$id",
  "name": "$name",
  "description": "$description",
  "command": "$command",
  "category": "$category",
  "tags": [],
  "created_at": "$now",
  "last_used": "$now",
  "use_count": 1,
  "success_rate": 1.0,
  "contexts": [],
  "dependencies": [],
  "code": "$(echo "$code" | head -20 | tr '\n' '|' | sed 's/"/\\"/g')"
}
EOF
)
    
    # Add to library using jq
    jq --argjson skill "$skill_json" '.skills += [$skill] | .last_updated = "'"$now"'"' "$SKILL_LIB" > "$SKILL_LIB.tmp" 2>/dev/null
    
    if [ -f "$SKILL_LIB.tmp" ]; then
        mv "$SKILL_LIB.tmp" "$SKILL_LIB"
        log "Added skill: $name (ID: $id)"
    else
        log "ERROR: Failed to add skill"
        return 1
    fi
}

# === FIND SKILLS ===
find_skills() {
    local query="$1"
    local context="${2:-}"
    
    init_library
    
    if [ -n "$context" ]; then
        jq -r ".skills[] | select(.contexts | contains([\"$context\"]) or .category == \"$context\") | \"\(.name) [\(.category)] - \(.description)\"" "$SKILL_LIB" 2>/dev/null
    elif [ -n "$query" ]; then
        jq -r ".skills[] | select(.name | contains(\"$query\") or .description | contains(\"$query\") or (.tags | contains([\"$query\"]))) | \"\(.name) [\(.category)] - \(.description)\"" "$SKILL_LIB" 2>/dev/null
    else
        jq -r '.skills[] | "\(.name) [\(.category)] - \(.description) (used: \(.use_count), success: \(.success_rate))"' "$SKILL_LIB" 2>/dev/null
    fi
}

# === USE A SKILL ===
use_skill() {
    local skill_id="$1"
    local success="${2:-true}"
    
    init_library
    
    local now=$(date -Iseconds)
    local use_count=$(jq -r ".skills[] | select(.id == \"$skill_id\") | .use_count" "$SKILL_LIB" 2>/dev/null || echo 0)
    local success_count=$(jq -r ".skills[] | select(.id == \"$skill_id\") | (.success_rate * .use_count)" "$SKILL_LIB" 2>/dev/null || echo 0)
    
    local new_use_count=$((use_count + 1))
    local new_success_count
    if [ "$success" = "true" ]; then
        new_success_count=$(echo "$success_count + 1" | bc)
    else
        new_success_count=$success_count
    fi
    
    local new_rate=$(echo "scale=2; $new_success_count / $new_use_count" | bc)
    
    jq --arg id "$skill_id" --arg used "$now" --arg count "$new_use_count" --arg rate "$new_rate" \
        '.skills |= map(if .id == $id then .last_used = $used | .use_count = ($count | tonumber) | .success_rate = ($rate | tonumber) else . end)' \
        "$SKILL_LIB" > "$SKILL_LIB.tmp" 2>/dev/null
    
    if [ -f "$SKILL_LIB.tmp" ]; then
        mv "$SKILL_LIB.tmp" "$SKILL_LIB"
        log "Updated skill: $skill_id (count: $new_use_count, rate: $new_rate)"
    fi
}

# === AUTO-LEARN FROM SUCCESS ===
autolearn() {
    local task="$1"
    local solution="$2"
    
    log "Auto-learning from successful task: $task"
    
    # Check if already known
    existing=$(jq -r ".skills[] | select(.name | contains(\"$task\")) | .id" "$SKILL_LIB" 2>/dev/null | head -1)
    
    if [ -n "$existing" ]; then
        log "Skill already exists: $existing"
        use_skill "$existing" "true"
    else
        # Extract category from task name
        category="general"
        echo "$task" | grep -qi "config\|json\|yaml" && category="data-processing"
        echo "$task" | grep -qi "build\|compile\|test" && category="development"
        echo "$task" | grep -qi "search\|find\|query" && category="search"
        echo "$task" | grep -qi "deploy\|install\|setup" && category="devops"
        
        add_skill "$task" "Auto-learned from successful completion" "" "$category" "$solution"
        log "New skill created: $task"
    fi
}

# === LIST POPULAR SKILLS ===
popular_skills() {
    init_library
    echo "═══ Top Skills (by use count) ═══"
    jq -r '.skills | sort_by(-.use_count) | .[0:10][] | "\(.name) - \(.use_count) uses, \(.success_rate) success"' "$SKILL_LIB" 2>/dev/null
}

# === SUGGEST SKILLS FOR TASK ===
suggest_skills() {
    local task="$1"
    
    init_library
    
    echo "═══ Skill Suggestions for: $task ═══"
    
    # Extract keywords
    local keywords=$(echo "$task" | tr ' ' '\n' | tr '[:upper:]' '[:lower:]' | grep -E '^[a-z]{3,}$' | tr '\n' ' ')
    
    # Find matching skills
    local matches=0
    for word in $keywords; do
        local found=$(jq -r ".skills[] | select(.name | contains(\"$word\") or .tags[]? | contains(\"$word\")) | \"  - \(.name) [\(%.success_rate) success]\"" "$SKILL_LIB" 2>/dev/null)
        if [ -n "$found" ]; then
            echo "$found"
            matches=$((matches + 1))
        fi
    done
    
    if [ "$matches" -eq 0 ]; then
        echo "  No matching skills found. Consider creating one!"
    fi
}

# === COMPOSE SKILLS ===
compose_skills() {
    local task="$1"
    
    init_library
    
    echo "═══ Skill Composition for: $task ═══"
    
    # Decompose task into sub-skills
    local subskills=""
    
    echo "$task" | grep -qi "config\|parse\|validate" && subskills="$subskills config-parser"
    echo "$task" | grep -qi "build\|compile" && subskills="$subskills build-tool"
    echo "$task" | grep -qi "test\|verify" && subskills="$subskills test-runner"
    echo "$task" | grep -qi "deploy\|push" && subskills="$subskills deploy-tool"
    echo "$task" | grep -qi "search\|find" && subskills="$subskills search-tool"
    echo "$task" | grep -qi "report\|summary" && subskills="$subskills report-generator"
    
    if [ -n "$subskills" ]; then
        echo "Recommended skill composition:"
        for skill in $subskills; do
            echo "  • $skill"
        done
    else
        echo "  Complex task - consider breaking into smaller subtasks"
    fi
}

# === STATS ===
stats() {
    init_library
    
    local total=$(jq '.skills | length' "$SKILL_LIB" 2>/dev/null || echo 0)
    local total_uses=$(jq '[.skills[].use_count] | add' "$SKILL_LIB" 2>/dev/null || echo 0)
    local avg_rate=$(jq '[.skills[].success_rate] | add / (.skills | length) // 1' "$SKILL_LIB" 2>/dev/null || echo 1.0)
    
    echo "╔═══════════════════════════════════╗"
    echo "║     Skill Library Statistics      ║"
    echo "╠═══════════════════════════════════╣"
    echo "║ Total Skills:    $total               ║"
    echo "║ Total Uses:      $total_uses           ║"
    echo "║ Avg Success:     $avg_rate            ║"
    echo "╚═══════════════════════════════════╝"
}

# === MAIN ===
case "${1:-status}" in
    init)
        init_library
        ;;
    add)
        add_skill "$2" "$3" "$4" "$5" "${6:-}"
        ;;
    find|search)
        find_skills "$2" "$3"
        ;;
    use)
        use_skill "$2" "${3:-true}"
        ;;
    autolearn)
        autolearn "$2" "$3"
        ;;
    popular)
        popular_skills
        ;;
    suggest)
        suggest_skills "$2"
        ;;
    compose)
        compose_skills "$2"
        ;;
    stats)
        stats
        ;;
    list)
        find_skills
        ;;
    help|*)
        echo "Claude Hours Skill Library"
        echo ""
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  init          Initialize library"
        echo "  add <n> <d> <c> <cat> [code]  Add new skill"
        echo "  find [query] [context]       Find skills"
        echo "  use <skill_id> [success]     Record skill usage"
        echo "  autolearn <task> <solution>  Auto-learn from success"
        echo "  popular                        Show top skills"
        echo "  suggest <task>                 Suggest skills for task"
        echo "  compose <task>                 Compose skills for task"
        echo "  stats                          Library statistics"
        echo "  list                           List all skills"
        ;;
esac
