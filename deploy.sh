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
MODE="code"       # code | all | pull
SKIP_BUILD=false

# ─── Parse flags ─────────────────────────────────────────────────────────────
show_help() {
  cat <<EOF
Usage: ./deploy.sh [flags]

Modes (mutually exclusive):
  (default)        Code-only deploy — HTML/CSS/JS, backend code, frontend SPA.
                   Skips images, data, and runtime configs.
  --all            Full deploy — everything including images, data, and configs.
                   Use for initial setup or to overwrite production state.
  --pull           Pull production runtime data back to local.

Options:
  --skip-build     Skip npm run build before deploying
  -h, --help       Show this help

Examples:
  ./deploy.sh                     # build + code-only deploy
  ./deploy.sh --all               # build + full deploy (images, data, configs)
  ./deploy.sh --skip-build        # code-only deploy, skip build
  ./deploy.sh --pull              # pull production data to local (no build)
EOF
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --all)         MODE="all" ;;
    --pull)        MODE="pull" ;;
    --skip-build)  SKIP_BUILD=true ;;
    -h|--help)     show_help ;;
    *)             error "Unknown flag: $1"; show_help ;;
  esac
  shift
done

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

# ─── Pull: production → local ────────────────────────────────────────────────
if [[ "$MODE" == "pull" ]]; then
  step "Pulling production data to local"

  step "  data/ <- $WEB_ROOT/data/"
  rsync -avz "$SERVER:$WEB_ROOT/data/" data/

  step "  config/users.json <- $ADMIN_ROOT/config/users.json"
  rsync -avz "$SERVER:$ADMIN_ROOT/config/users.json" config/users.json

  step "  config/categories.json <- $ADMIN_ROOT/config/categories.json"
  rsync -avz "$SERVER:$ADMIN_ROOT/config/categories.json" config/categories.json

  step "  config/ref-categories.json <- $ADMIN_ROOT/config/ref-categories.json"
  rsync -avz "$SERVER:$ADMIN_ROOT/config/ref-categories.json" config/ref-categories.json

  step "  public/resources/img/bs/ <- $WEB_ROOT/resources/img/bs/"
  rsync -avz "$SERVER:$WEB_ROOT/resources/img/bs/" public/resources/img/bs/

  step "  public/resources/img/ref/ <- $WEB_ROOT/resources/img/ref/"
  rsync -avz "$SERVER:$WEB_ROOT/resources/img/ref/" public/resources/img/ref/

  success "Pull complete"
  exit 0
fi

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
step "Deploying web (public/ -> $WEB_ROOT/)"

WEB_EXCLUDES=(
  --exclude='data'
  --exclude='archive'
  --exclude='admin'
)

if [[ "$MODE" == "code" ]]; then
  # Code-only: also exclude uploaded image dirs
  WEB_EXCLUDES+=(
    --exclude='resources/img/bs'
    --exclude='resources/img/ref'
  )
fi

rsync -avz --delete "${WEB_EXCLUDES[@]}" public/ "$SERVER:$WEB_ROOT/"
fix_permissions "$WEB_ROOT"
success "Web deployed"
echo ""

# ─── Deploy: data (--all only) ───────────────────────────────────────────────
if [[ "$MODE" == "all" ]]; then
  step "Deploying data (data/ -> $WEB_ROOT/data/)"
  rsync -avz data/ "$SERVER:$WEB_ROOT/data/"
  fix_permissions "$WEB_ROOT/data"
  success "Data deployed"
  echo ""
fi

# ─── Deploy: backend ─────────────────────────────────────────────────────────
step "Deploying backend -> $ADMIN_ROOT/"

BACKEND_EXCLUDES=(
  --exclude='.env'
  --exclude='node_modules'
  --exclude='dist'
)

if [[ "$MODE" == "code" ]]; then
  # Code-only: also exclude runtime configs
  BACKEND_EXCLUDES+=(
    --exclude='config/users.json'
    --exclude='config/categories.json'
    --exclude='config/ref-categories.json'
  )
fi

rsync -avz --delete "${BACKEND_EXCLUDES[@]}" \
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

# ─── Deploy: frontend ───────────────────────────────────────────────────────
step "Deploying frontend (dist/ -> $ADMIN_ROOT/dist/)"
rsync -avz --delete dist/ "$SERVER:$ADMIN_ROOT/dist/"
fix_permissions "$ADMIN_ROOT/dist"
success "Frontend deployed"
echo ""

# ─── Done ────────────────────────────────────────────────────────────────────
success "All done!"
