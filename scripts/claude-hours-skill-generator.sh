
# === INGEST LINK FOR SKILL RESEARCH ===
ingest_link() {
    local url="$1"
    local skill_name="${2:-research}"
    
    log "Ingesting link for skill: $skill_name"
    echo "Ingesting: $url"
    
    if [ -x "$CLAWD/scripts/claude-hours-link-ingestor.sh" ]; then
        $CLAWD/scripts/claude-hours-link-ingestor.sh "$url" "medium" > /dev/null 2>&1
        echo "Link ingested and saved"
        log "Link ingested: $url"
    else
        echo "Warning: Link ingestor not found"
    fi
}

# === UPDATED MAIN FUNCTION ===
main() {
    echo "=============================================="
    echo "   Claude Hours Skill Generator"
    echo "=============================================="
    
    case "${1:-help}" in
        analyze)
            echo "=== Context Analysis ==="
            analyze_context
            ;;
        gaps)
            echo "=== Skill Gaps ==="
            identify_skill_gaps
            ;;
        generate)
            shift
            [ -z "$1" ] && echo "Usage: $0 generate <skill-name>" && exit 1
            generate_skill "$1"
            ;;
        swarm)
            shift
            [ -z "$1" ] && echo "Usage: $0 swarm <skill-name> <description>" && exit 1
            create_skill_via_swarm "$1" "$2"
            ;;
        auto)
            echo "=== Auto-Discover ==="
            auto_discover
            ;;
        track)
            shift
            track_skill "$1" "$2" "$3"
            ;;
        list)
            echo "=== Existing Skills ==="
            ls "$SKILLS_DIR" 2>/dev/null | grep -v "^_\|^system" | head -10 || echo "No skills found"
            ;;
        stats)
            echo "=== Skill Statistics ==="
            if [ -f "$TRACKING_FILE" ]; then
                jq '.' "$TRACKING_FILE" 2>/dev/null || cat "$TRACKING_FILE"
            else
                echo "No tracking data yet"
            fi
            ;;
        ingest)
            shift
            if [ -z "$1" ]; then
                echo "Usage: $0 ingest <url> <skill-name>"
                echo "  Ingest a link for skill research"
            else
                ingest_link "$1" "${2:-research}"
            fi
            ;;
        help|*)
            echo "Usage: $0 <command> [args]"
            echo ""
            echo "Commands:"
            echo "  analyze              - Analyze context for skill needs"
            echo "  gaps                 - Identify missing skill gaps"
            echo "  generate <name>      - Generate new skill"
            echo "  swarm <name> <desc>  - Create skill via swarm"
            echo "  auto                 - Auto-discover and create skills"
            echo "  track <name> <event> - Track skill usage"
            echo "  list                 - List existing skills"
            echo "  stats                - Show skill statistics"
            echo "  ingest <url> <name>  - Ingest link for skill research"
            echo ""
            echo "Examples:"
            echo "  $0 auto"
            echo "  $0 generate 'Web Scraper'"
            echo "  $0 ingest 'https://github.com/user/repo' 'Web Scraping'"
            ;;
    esac
}

main "$@"
