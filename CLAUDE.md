# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aracolor is a static website for a Czech house painting and decorating company. It uses Pug templates, Sass for styling, and jQuery for interactivity.

## Development Commands

```bash
# Start development server (compiles Pug + Sass with live reload)
npm run dev

# Build CSS only (with watch)
npm run build:css

# Build HTML only (with watch)
npm run build:html

# Deploy to Firebase hosting
npm run deploy
```

## Architecture

### Build Pipeline
- **Pug templates** (`templates/`) → compiled to HTML in `public/`
- **Sass** (`sass/main.scss`) → compiled to `public/resources/css/style.css`
- Static assets served from `public/`

### Template Structure
- `templates/layout.pug` - Base layout with head, analytics, SVG icons, and block placeholders
- `templates/navigation.pug` - Site navigation component
- `templates/footer.pug` - Footer component
- `templates/main/*.pug` - Individual pages (index, cisteni, dekoracni-sterky, ref-*.pug for references, etc.)

### Sass Organization (7-1 pattern)
- `sass/abstract/` - Variables, mixins, grid, featherlight config
- `sass/base/` - Base styles, typography, animations, utilities
- `sass/components/` - Reusable components (back-to-top, scrolldown buttons)
- `sass/layout/` - Header, navigation, footer
- `sass/pages/` - Page-specific styles

### Key Vendor Libraries
- jQuery 3.2.1
- Featherlight (lightbox gallery)
- Masonry (grid layout)
- Ionicons (icon font)
- Animate.css
- Node 12 for builds and development

## Deployment

Hosted on Firebase. The `public/` directory is deployed; `cleanUrls: true` strips .html extensions.
