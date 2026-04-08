#!/bin/bash
set -e

git config core.hooksPath hooks
chmod +x hooks/post-commit
chmod +x sync-repos.sh
chmod +x toggle-cloudflare-redirect.sh

echo "✅ Setup complete – hooks active"
