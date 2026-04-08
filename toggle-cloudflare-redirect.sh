#!/bin/bash
set -e

MODE=$1

if [[ "$MODE" != "enable" && "$MODE" != "disable" ]]; then
  echo "Usage: $0 enable|disable"
  exit 1
fi

API_TOKEN=$CLOUDFLARE_API_TOKEN
ZONE_ID=$CLOUDFLARE_ZONE_ID

if [ -z "$API_TOKEN" ]; then echo "❌ Missing CLOUDFLARE_API_TOKEN"; exit 1; fi
if [ -z "$ZONE_ID" ]; then echo "❌ Missing CLOUDFLARE_ZONE_ID"; exit 1; fi

HEADERS=(
  -H "Authorization: Bearer $API_TOKEN"
  -H "Content-Type: application/json"
)

echo "🔍 Fetching rulesets..."
RULESETS=$(curl -sf "${HEADERS[@]}" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets")

RULESET_ID=$(echo "$RULESETS" | jq -r \
  '.result[] | select(.phase=="http_request_dynamic_redirect") | .id')

if [ -z "$RULESET_ID" ]; then
  echo "❌ Ruleset not found"
  exit 1
fi

echo "📋 Fetching ruleset $RULESET_ID..."
RULESET=$(curl -sf "${HEADERS[@]}" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets/$RULESET_ID")

ENABLED_BOOL=$([ "$MODE" == "enable" ] && echo "true" || echo "false")

UPDATED=$(echo "$RULESET" | jq \
  ".result.rules |= map(
    if .description == \"manuel-app.dev -> ieeks.github.io\"
    then .enabled = $ENABLED_BOOL
    else .
    end
  )")

echo "⚙️  Setting redirect: $MODE..."
RESULT=$(curl -sf -X PUT "${HEADERS[@]}" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets/$RULESET_ID" \
  -d "$UPDATED")

SUCCESS=$(echo "$RESULT" | jq -r '.success')
if [ "$SUCCESS" != "true" ]; then
  echo "❌ Cloudflare API error:"
  echo "$RESULT" | jq '.errors'
  exit 1
fi

echo "✅ Redirect $MODE"
echo "   Redirect state: $MODE"
