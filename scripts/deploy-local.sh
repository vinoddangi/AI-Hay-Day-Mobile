#!/usr/bin/env bash
set -euo pipefail

# Deploy script: builds the SPA, copies `dist` into the Apps Script webapp folder,
# logs in clasp (interactive or via base64 service-account), pushes, creates a
# version, and deploys the webapp.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Building app"
npm run build

echo "==> Copying dist into apps-script webapp"
node scripts/copy-dist-to-webapp.js

WEBAPP_DIR="$ROOT/scripts/apps-script/webapp"
if [ ! -d "$WEBAPP_DIR" ]; then
  echo "webapp folder not found: $WEBAPP_DIR"
  exit 1
fi
cd "$WEBAPP_DIR"

if ! command -v clasp >/dev/null 2>&1; then
  echo "clasp not found. Install with: npm install -g @google/clasp"
  exit 1
fi

# Login
TMPCREDS=""
if [ -n "${GOOGLE_SERVICE_ACCOUNT_B64-}" ]; then
  echo "Decoding GOOGLE_SERVICE_ACCOUNT_B64 to temporary creds"
  TMPCREDS="$(mktemp)"
  # Portable decode: try common base64 flags, fallback to python
  if base64 --help >/dev/null 2>&1 && base64 --help 2>&1 | grep -q -- '--decode'; then
    printf '%s' "$GOOGLE_SERVICE_ACCOUNT_B64" | base64 --decode > "$TMPCREDS"
  elif base64 --help >/dev/null 2>&1 && base64 --help 2>&1 | grep -q -- '-d'; then
    printf '%s' "$GOOGLE_SERVICE_ACCOUNT_B64" | base64 -d > "$TMPCREDS"
  else
    python - <<PY > "$TMPCREDS"
import sys,base64
sys.stdout.buffer.write(base64.b64decode(sys.stdin.read()))
PY
  fi
  echo "Logging in clasp with service account creds (non-interactive)"
  clasp login --creds "$TMPCREDS"
  CLEAN_CREDS=1
elif [ -f "$HOME/.clasprc.json" ] || [ -f "$ROOT/.clasprc.json" ]; then
  echo "Found existing clasp login, continuing"
else
  echo "No clasp auth found. Run 'clasp login' interactively or set GOOGLE_SERVICE_ACCOUNT_B64 env."
  exit 1
fi

echo "==> Pushing project files to Apps Script"
clasp push

VERSION_MSG="ci: deploy $(date -u +%Y%m%dT%H%M%SZ)"
echo "==> Creating version: $VERSION_MSG"
clasp version "$VERSION_MSG"

echo "==> Deploying webapp"
clasp deploy --description "$VERSION_MSG"

echo "==> Deployment finished"

if [ -n "${CLEAN_CREDS-}" ] && [ "$CLEAN_CREDS" = "1" ] && [ -n "$TMPCREDS" ]; then
  rm -f "$TMPCREDS"
fi

exit 0
