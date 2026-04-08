#!/bin/bash
set -e

PRIMARY="$HOME/Developer/reihengeschaeft-rechner"
DEPLOY="$HOME/Developer/eu-vat-reihengeschaeftrechner-deploy"
MSG=${1:-"sync"}

if [ ! -d "$PRIMARY/.git" ]; then echo "❌ Primary repo not found: $PRIMARY"; exit 1; fi
if [ ! -d "$DEPLOY/.git" ]; then echo "❌ Deploy repo not found: $DEPLOY"; exit 1; fi

echo "📦 Committing & pushing PRIMARY..."
cd "$PRIMARY"
git add .
if ! git diff --cached --quiet; then
  git commit -m "$MSG"
else
  echo "   (nothing to commit in primary)"
fi
git push || { echo "❌ Primary push failed"; exit 1; }

echo "🔄 Syncing PRIMARY → DEPLOY..."
rsync -av --delete \
  --exclude ".git" \
  --exclude "CNAME" \
  --exclude "*.deploy-config" \
  "$PRIMARY/" "$DEPLOY/"

echo "🚀 Committing & pushing DEPLOY..."
cd "$DEPLOY"
git add .
if ! git diff --cached --quiet; then
  git commit -m "$MSG"
else
  echo "   (nothing to commit in deploy)"
fi
git push || { echo "❌ Deploy push failed"; exit 1; }

echo ""
echo "✅ Sync complete"
echo "   Primary repo updated:  yes"
echo "   Deploy repo updated:   yes"
echo "   Deploy repo pushed:    yes"
