#!/usr/bin/env bash
set -euo pipefail

# ─── Config ──────────────────────────────────────────────────────────────────
SERVER="jnagy@84.247.162.208"
WEB_ROOT="/var/www/aracolor"
ADMIN_ROOT="/var/www/aracolor-admin"

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

step()    { echo -e "${BLUE}▸ $1${NC}"; }
success() { echo -e "${GREEN}✓ $1${NC}"; }
warn()    { echo -e "${YELLOW}⚠ $1${NC}"; }
error()   { echo -e "${RED}✗ $1${NC}" >&2; }

# ─── Defaults ────────────────────────────────────────────────────────────────
DO_WEB=false
DO_DATA=false
DO_BACKEND=false
DO_FRONTEND=false
SKIP_BUILD=false

# ─── Parse flags ─────────────────────────────────────────────────────────────
show_help() {
  cat <<EOF
Usage: ./deploy.sh [flags]

Flags:
  --all          Deploy everything (default if no target flags given)
  --web          Deploy public/ to $WEB_ROOT/
  --data         Deploy data/ to $WEB_ROOT/data/
  --backend      Deploy backend to $ADMIN_ROOT/
  --frontend     Deploy Vue SPA dist/ to $ADMIN_ROOT/dist/
  --skip-build   Skip npm run build before deploying
  -h, --help     Show this help

Examples:
  ./deploy.sh                    # build + deploy all
  ./deploy.sh --web              # build + deploy web only
  ./deploy.sh --web --skip-build # deploy web without building
  ./deploy.sh --all --skip-build # deploy everything without building
EOF
  exit 0
}

ANY_TARGET=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --all)       DO_WEB=true; DO_DATA=true; DO_BACKEND=true; DO_FRONTEND=true; ANY_TARGET=true ;;
    --web)       DO_WEB=true; ANY_TARGET=true ;;
    --data)      DO_DATA=true; ANY_TARGET=true ;;
    --backend)   DO_BACKEND=true; ANY_TARGET=true ;;
    --frontend)  DO_FRONTEND=true; ANY_TARGET=true ;;
    --skip-build) SKIP_BUILD=true ;;
    -h|--help)   show_help ;;
    *)           error "Unknown flag: $1"; show_help ;;
  esac
  shift
done

# Default to --all when no target flags given
if [[ "$ANY_TARGET" == false ]]; then
  DO_WEB=true
  DO_DATA=true
  DO_BACKEND=true
  DO_FRONTEND=true
fi

# ─── Helper: fix permissions via SSH ─────────────────────────────────────────
fix_permissions() {
  local remote_path="$1"
  step "Fixing ownership, permissions & SELinux on $remote_path"
  ssh "$SERVER" bash -s <<REMOTE
    sudo chown -R jnagy:nginx "$remote_path"
    sudo find "$remote_path" -type d -exec chmod 755 {} \;
    sudo find "$remote_path" -type f -exec chmod 644 {} \;
    sudo restorecon -R "$remote_path"
REMOTE
  success "Permissions fixed for $remote_path"
}

# ─── Build ───────────────────────────────────────────────────────────────────
if [[ "$SKIP_BUILD" == true ]]; then
  warn "Skipping build (--skip-build)"
else
  step "Building project..."
  npm run build
  success "Build complete"
fi

echo ""

# ─── Deploy: web ─────────────────────────────────────────────────────────────
if [[ "$DO_WEB" == true ]]; then
  step "Deploying web (public/ → $WEB_ROOT/)"
  rsync -avz --delete \
    --exclude='data' \
    --exclude='archive' \
    --exclude='admin' \
    public/ "$SERVER:$WEB_ROOT/"
  fix_permissions "$WEB_ROOT"
  success "Web deployed"
  echo ""
fi

# ─── Deploy: data ────────────────────────────────────────────────────────────
if [[ "$DO_DATA" == true ]]; then
  step "Deploying data (data/ → $WEB_ROOT/data/)"
  rsync -avz data/ "$SERVER:$WEB_ROOT/data/"
  fix_permissions "$WEB_ROOT/data"
  success "Data deployed"
  echo ""
fi

# ─── Deploy: backend ────────────────────────────────────────────────────────
if [[ "$DO_BACKEND" == true ]]; then
  step "Deploying backend → $ADMIN_ROOT/"
  rsync -avz --delete \
    --exclude='.env' \
    --exclude='node_modules' \
    --exclude='dist' \
    package.json package-lock.json src config scripts \
    "$SERVER:$ADMIN_ROOT/"

  step "Installing production deps & restarting service"
  ssh "$SERVER" bash -s <<REMOTE
    cd "$ADMIN_ROOT" && npm install --production
    sudo systemctl restart aracolor-admin
REMOTE

  fix_permissions "$ADMIN_ROOT"
  success "Backend deployed"
  echo ""
fi

# ─── Deploy: frontend ───────────────────────────────────────────────────────
if [[ "$DO_FRONTEND" == true ]]; then
  step "Deploying frontend (dist/ → $ADMIN_ROOT/dist/)"
  rsync -avz --delete dist/ "$SERVER:$ADMIN_ROOT/dist/"
  fix_permissions "$ADMIN_ROOT/dist"
  success "Frontend deployed"
  echo ""
fi

# ─── Done ────────────────────────────────────────────────────────────────────
success "All done!"
