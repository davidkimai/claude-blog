#!/bin/bash
#
# Claude Feedback - Self-Improvement Tracking
# Inspired by Ouroboros Phase 4
#
# Usage: ./claude-feedback.sh <decision-id> <rating> [notes]
#        ./claude-feedback.sh --stats
#        ./claude-feedback.sh --recent
#

FEEDBACK_FILE="$HOME/.claude/logs/feedback.jsonl"
EFFECTIVENESS_FILE="$HOME/.claude/logs/effectiveness.jsonl"

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

case "${1:-}" in
    --stats)
        echo -e "${CYAN}📊 Claude Self-Improvement Stats${NC}"
        echo ""
        
        if [ -f "$FEEDBACK_FILE" ]; then
            TOTAL=$(wc -l < "$FEEDBACK_FILE")
            AVG=$(awk -F'|' '{sum+=$2; count++} END {if(count>0) printf "%.2f", sum/count; else print "N/A"}' "$FEEDBACK_FILE")
            
            echo "Total Feedback: $TOTAL"
            echo "Average Rating: $AVG/5"
            echo ""
            
            echo -e "${CYAN}Rating Distribution:${NC}"
            echo "5 (Excellent): $(grep -c '|5|' "$FEEDBACK_FILE" 2>/dev/null || echo 0)"
            echo "4 (Good):      $(grep -c '|4|' "$FEEDBACK_FILE" 2>/dev/null || echo 0)"
            echo "3 (Acceptable): $(grep -c '|3|' "$FEEDBACK_FILE" 2>/dev/null || echo 0)"
            echo "2 (Poor):      $(grep -c '|2|' "$FEEDBACK_FILE" 2>/dev/null || echo 0)"
            echo "1 (Failed):    $(grep -c '|1|' "$FEEDBACK_FILE" 2>/dev/null || echo 0)"
        else
            echo "No feedback recorded yet."
        fi
        ;;
        
    --recent)
        echo -e "${CYAN}Recent Feedback${NC}"
        echo ""
        if [ -f "$FEEDBACK_FILE" ]; then
            tail -10 "$FEEDBACK_FILE" | while read line; do
                TIMESTAMP=$(echo "$line" | cut -d'|' -f1)
                RATING=$(echo "$line" | cut -d'|' -f2)
                NOTES=$(echo "$line" | cut -d'|' -f3-)
                echo "[$TIMESTAMP] Rating: $RATING - $NOTES"
            done
        else
            echo "No feedback recorded yet."
        fi
        ;;
        
    *)
        if [ -z "${1:-}" ] || [ -z "${2:-}" ]; then
            echo -e "${CYAN}Claude Feedback - Self-Improvement System${NC}"
            echo ""
            echo "Usage:"
            echo "  $0 <decision-id> <rating> [notes]"
            echo "  $0 --stats"
            echo "  $0 --recent"
            echo ""
            echo "Rating Scale:"
            echo "  5 - Excellent (worked perfectly)"
            echo "  4 - Good (worked well)"
            echo "  3 - Acceptable (minor issues)"
            echo "  2 - Poor (significant issues)"
            echo "  1 - Failed (didn't work)"
            echo ""
            echo "Examples:"
            echo "  $0 \"2026-01-27T22:00:00Z\" 4 \"Good workflow selection\""
            echo "  $0 \"2026-01-27T22:05:00Z\" 2 \"Wrong intent detected\""
        else
            DECISION_ID="$1"
            RATING="$2"
            NOTES="${3:-No notes}"
            TIMESTAMP=$(date -Iseconds)
            
            if [ "$RATING" -ge 1 ] && [ "$RATING" -le 5 ]; then
                mkdir -p "$HOME/.claude/logs"
                echo "$TIMESTAMP|$RATING|$DECISION_ID|$NOTES" >> "$FEEDBACK_FILE"
                echo -e "${GREEN}✓${NC} Feedback recorded: $RATING/5"
            else
                echo -e "${RED}✗${NC] Rating must be 1-5"
            fi
        fi
        ;;
esac
