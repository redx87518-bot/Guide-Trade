#!/bin/bash
DB="guide_trade"
FORCE="--force"

# Function to create an attribute, handling already-exists
make_attr() {
  local attr_type="$1"
  local collection="$2"
  shift 2
  local result=$(npx appwrite-cli databases create-${attr_type}-attribute --database-id "$DB" --collection-id "$collection" $FORCE "$@" 2>&1)
  if echo "$result" | grep -qE '"status"\s*:|\"key\"\s*:'; then
    key=$(echo "$result" | grep -oP '"key"\s*:\s*"\K[^"]+' | head -1)
    echo "  ✓ $key"
  elif echo "$result" | grep -qi "already exists"; then
    echo "  ⚠ already exists"
  else
    echo "  ❌ $result" | head -c 200
    echo ""
  fi
}

make_index() {
  local collection="$1"
  local idx_name="$2"
  local idx_type="$3"
  shift 3
  local attrs=$@
  local result=$(npx appwrite-cli databases create-index --database-id "$DB" --collection-id "$collection" --key "$idx_name" --type "$idx_type" --attributes "$attrs" $FORCE 2>&1)
  if echo "$result" | grep -q '"key"'; then
    echo "  ✓ Index: $idx_name ($idx_type) [$attrs]"
  elif echo "$result" | grep -qi "already exists"; then
    echo "  ⚠ Index: $idx_name (exists)"
  else
    echo "  ⚠ Index: $idx_name — $(echo "$result" | head -c 150)"
  fi
}

echo "=== PROFILES ==="
make_attr string profiles --key userId --size 36 --required
make_attr string profiles --key name --size 255 --required=false
make_attr email profiles --key email --required=false
make_attr url profiles --key avatarUrl --required=false
make_index profiles userId_idx key userId

echo "=== WATCHLISTS ==="
make_attr string watchlists --key userId --size 36 --required
make_attr string watchlists --key name --size 255 --required
make_attr string watchlists --key symbols --size 50 --required=false --array
make_attr datetime watchlists --key createdAt --required
make_index watchlists userId_idx key userId

echo "=== RESEARCH_SESSIONS ==="
make_attr string research_sessions --key userId --size 36 --required
make_attr string research_sessions --key query --size 1000 --required
make_attr string research_sessions --key status --size 50 --required
make_attr datetime research_sessions --key startedAt --required=false
make_attr datetime research_sessions --key completedAt --required=false
make_index research_sessions userId_idx key userId
make_index research_sessions status_idx key status
make_index research_sessions userId_status_idx key userId status

echo "=== RESEARCH_RESULTS ==="
make_attr string research_results --key userId --size 36 --required
make_attr string research_results --key sessionId --size 36 --required=false
make_attr string research_results --key symbol --size 20 --required=false
make_attr string research_results --key title --size 500 --required=false
make_attr text research_results --key summary --required=false
make_attr text research_results --key bullishFactors --required=false --array
make_attr text research_results --key bearishFactors --required=false --array
make_attr text research_results --key risks --required=false --array
make_attr text research_results --key outlook --required=false
make_attr string research_results --key confidence --size 20 --required=false
make_attr text research_results --key sources --required=false
make_attr datetime research_results --key createdAt --required
make_index research_results userId_idx key userId
make_index research_results sessionId_idx key sessionId
make_index research_results symbol_idx key symbol
make_index research_results userId_createdAt_idx key userId createdAt

echo "=== SAVED_REPORTS ==="
make_attr string saved_reports --key userId --size 36 --required
make_attr string saved_reports --key researchId --size 36 --required=false
make_attr string saved_reports --key title --size 500 --required=false
make_attr string saved_reports --key fileId --size 255 --required=false
make_attr datetime saved_reports --key createdAt --required
make_index saved_reports userId_idx key userId
make_index saved_reports researchId_idx key researchId

echo "=== USER_SETTINGS ==="
make_attr string user_settings --key userId --size 36 --required
make_attr boolean user_settings --key voiceEnabled --required=false --xdefault "false"
make_attr boolean user_settings --key autoReadResearch --required=false --xdefault "false"
make_attr string user_settings --key elevenLabsApiKey --size 255 --required=false
make_attr string user_settings --key elevenLabsVoiceId --size 255 --required=false
make_attr boolean user_settings --key telegramEnabled --required=false --xdefault "false"
make_attr string user_settings --key telegramBotToken --size 255 --required=false
make_attr string user_settings --key telegramChatId --size 255 --required=false
make_attr boolean user_settings --key discordEnabled --required=false --xdefault "false"
make_attr string user_settings --key discordWebhookUrl --size 500 --required=false
make_index user_settings userId_idx key userId

echo "=== NOTIFICATIONS ==="
make_attr string notifications --key userId --size 36 --required
make_attr string notifications --key type --size 50 --required
make_attr string notifications --key title --size 255 --required
make_attr text notifications --key message --required
make_attr boolean notifications --key read --required=false --xdefault "false"
make_attr datetime notifications --key createdAt --required
make_index notifications userId_idx key userId
make_index notifications read_idx key read
make_index notifications userId_read_idx key userId read

echo "=== SCHEMA SETUP COMPLETE ==="
