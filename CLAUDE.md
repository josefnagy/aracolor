# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

Aracolor is a flat single-project repo combining a static marketing site with an image management admin.

```
aracolor/
├── public/          # Web root — BrowserSync serves this, deployed to Firebase/VM
├── data/            # Runtime data (images.json) — outside public/, not deployed
├── templates/       # Pug templates → compiled to public/*.html
├── sass/            # Sass source (7-1 pattern) → compiled to public/resources/css/style.css
├── src/             # Express admin backend (server.js, routes/, services/)
├── client/          # Vue 3 admin SPA (own package.json, Vite)
├── dist/            # Built Vue SPA output (gitignored)
├── config/          # Admin config (categories.json, users.json)
├── scripts/         # Admin utility scripts (hashPassword, migrate)
├── js/              # Web image processing scripts
├── bs-config.js     # BrowserSync config — maps /data → data/ (no symlinks)
├── package.json     # Single root package.json with all deps
└── firebase.json    # Firebase Hosting config
```

## Commands

```bash
# Install all dependencies (cascades to client/ via postinstall)
npm install

# Start all dev servers concurrently
npm run dev          # web on :3001, Express on :3000, Vite on :5173

# Start individual servers
npm run dev:web      # BrowserSync + Pug + Sass watchers
npm run dev:server   # Express backend only (nodemon)
npm run dev:client   # Vue SPA only (Vite)

# Build everything
npm run build        # Pug + Sass + Vue SPA

# Deploy
npm run deploy           # Build + rsync web + backend + frontend to VM
npm run deploy:firebase  # Firebase Hosting only
```

## Data Flow

- Admin backend (`src/`) writes image metadata to `data/images.json`
- Admin uploads processed images to `public/resources/img/bs/`
- BrowserSync `routes` config maps `/data` → `data/` for local dev (no symlinks)
- Pug templates in `templates/main/` compile to `public/*.html`
- Sass in `sass/main.scss` compiles to `public/resources/css/style.css`

## Key Architecture Notes

- **No symlinks** — BrowserSync routes handle `/data` mapping
- **`client/` has its own `package.json`** — Vue/Vite tooling stays separate
- **`data/` is outside `public/`** — not deployed to Firebase, not rsynced with web assets
- **`dist/`** — Vue SPA build output, deployed to VM at `/var/www/aracolor/admin/`
