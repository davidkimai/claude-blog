#!/usr/bin/env bash
set -euo pipefail

: "${TELEGRAM_TOKEN:?Set TELEGRAM_TOKEN}"
: "${TELEGRAM_CHAT_ID:?Set TELEGRAM_CHAT_ID}"
: "${GEMINI_API_KEY:?Set GEMINI_API_KEY}"
GEMINI_MODEL="${GEMINI_MODEL:-gemini-2.5-flash}"

PROJECT_DIR="/Users/jasontang/Documents/SecondBrain/Projects/daily-digest"

# Verify node exists
if ! command -v node >/dev/null 2>&1; then
  echo "node not found on PATH" >&2
  exit 1
fi

CRON_LINE="0 7 * * * TELEGRAM_BOT_TOKEN=\"$TELEGRAM_TOKEN\" TELEGRAM_CHAT_ID=\"$TELEGRAM_CHAT_ID\" GEMINI_API_KEY=\"$GEMINI_API_KEY\" GEMINI_MODEL=\"$GEMINI_MODEL\" cd $PROJECT_DIR && /usr/bin/npm run dev >> /tmp/daily_intel.log 2>&1"

( crontab -l 2>/dev/null | grep -v "daily-digest" || true; echo "$CRON_LINE" ) | crontab -

echo "Installed cron:" 
crontab -l | grep "daily-digest" || true
