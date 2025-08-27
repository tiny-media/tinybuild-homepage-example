# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Progressive Islands Template**: Clean starting point with Eleventy 4.0 + VentoJS + modern web standards.

## Quick Start

```bash
bun run dev       # Development server (localhost:8080)
bun run build     # Production build 
bun run preview   # Preview built site (localhost:4173)
bun run clean     # Clean build directories
bun run tokens    # Generate CSS from design tokens
```

**Linting**: `bunx biome check . --write`

## Architecture Overview

- **Static-first**: Zero JavaScript by default, fastest possible loading
- **Progressive Islands**: Add interactivity only where needed with @11ty/is-land
- **Modern CSS**: CUBE methodology with design tokens and container queries
- **FOUC Prevention**: Critical CSS inlined, non-critical loaded via is-land
- **View Transitions**: Native CSS View Transitions API for smooth navigation
- **Developer Experience**: Hot reload, fast builds, type safety

## Tech Stack

- **SSG**: Eleventy 4.0 (alpha) with VentoJS templates
- **Bundling**: Vite 7+ with LightningCSS (100x faster than PostCSS)
- **Components**: Vanilla JS + Svelte 5 islands
- **Styling**: CUBE CSS with cascade layers and modern features
- **Runtime**: Bun for fast package management and builds

## CUBE CSS Methodology

**Structure**: `0-reset/` → `1-design-tokens/` → `2-composition/` → `3-utilities/` → `4-blocks/` → `5-exceptions/`

**Class Grouping Pattern**:
```html
<article class="[ card ] [ flow flow--lg ] [ bg-surface ]" data-state="featured">
```

**Design Tokens** (auto-generated from `src/design-tokens/tokens.json`):
```css
--color-brand-primary: oklch(50% 0.15 25);
--spacing-scale-lg: 1rem;
--typography-scale-xl: 1.5rem;
```

**Key Utilities**:
- `.flow` - Vertical rhythm with `--flow-space` override
- `.wrapper` - Centered container with responsive padding
- `.stack` / `.cluster` - Layout composition patterns

## Islands Architecture

**Registration** (`src/assets/main.js`):
```js
const vanillaComponents = {
  'counter': () => import('/src/assets/js/Counter.js'),
};
```

**Usage**:
```html
<is-land on:visible type="vanilla" component="counter" props='{"initialCount": 0}'>
  <div>Loading counter...</div>
</is-land>
```

**Loading Strategy**:
- `on:visible` - Load when scrolled into view
- `on:interaction` - Load on first click/focus
- `on:idle` - Load when browser is idle

## VentoJS Templates

**Key Patterns**:
```vento
{{ layout "layouts/base.vto" { title: "Page Title" } }}
{{ if condition }}...{{ /if }}
{{ for item of items }}...{{ /for }}
{{ import { helper } from "./utils.vto" }}
```

**Template Structure**:
- `src/_includes/layouts/` - Page layouts
- `src/_includes/components/` - Reusable components
- `*.vto` files use `{{ }}` syntax (unified with design tokens)

## Performance Characteristics

| Level | JavaScript | Description |
|-------|------------|-------------|
| Static | 0 KB | Pure HTML/CSS (this template) |
| Interactive | ~5 KB | Vanilla JS components |
| Enhanced | ~30 KB | First Svelte component + runtime |
| Complex | +2 KB each | Additional Svelte components |

## Critical Configuration

**Required** in `eleventy.config.js`:
```js
eleventyConfig.addPassthroughCopy("src/assets"); // Asset loading
eleventyConfig.addPlugin(VentoPlugin);            // Order matters!
eleventyConfig.addPlugin(EleventyVitePlugin);
```

**Module Resolution** (`eleventyVitePluginConfig.js`):
```js
resolve: {
  alias: { '/src': path.resolve('./src') }
}
```

## Key Files

- `src/assets/main.js` - Islands loader + CSS entry
- `src/assets/css/main.css` - CSS imports with cascade layers
- `src/assets/css/critical.css` - Inlined critical CSS (FOUC prevention)
- `src/_includes/layouts/base.vto` - Base HTML template with partials
- `src/_includes/partials/` - Modular template components (head, header, nav, footer)
- `src/design-tokens/tokens.json` - Single source of design truth
- `eleventy.config.js` - Main SSG configuration + navigation plugin

## Performance Optimizations

**FOUC Prevention**:
- Critical CSS inlined in `<head>` (reset, tokens, layout utilities, navigation)
- Non-critical CSS loaded via `<is-land on:idle>` with `<template data-island>`
- Progressive enhancement with `<noscript>` fallback

**Navigation**:
- `@11ty/eleventy-navigation` plugin for structured navigation
- VentoJS syntax: `collections.all |> eleventyNavigation` (note: `|>` not `|`)
- Front matter: `eleventyNavigation: { key: "Home", order: 1 }`

**View Transitions** (Progressive Enhancement):
```css
@media not (prefers-reduced-motion: reduce) {
  @view-transition { navigation: auto; }
  .site-main { view-transition-name: main-content; }
  .hero__title { view-transition-name: page-title; }
}
```

## Template Structure

**Modular Partials**:
- `partials/head.vto` - Critical CSS, theme init, progressive CSS loading
- `partials/header.vto` - Site header with logo and navigation
- `partials/nav.vto` - Navigation menu using eleventy-navigation
- `partials/footer.vto` - Site footer with attribution

## Additional Documentation

- `COMPONENT_PATTERNS.md` - Component examples and patterns
- `ARCHITECTURE_DEEP_DIVE.md` - Detailed technical implementation
- `CSS_SETUP.md` - Complete CUBE CSS setup and methodology
- `docs/theme-system-implementation.md` - Theme system with OKLCH colors

## Common Tasks

**Add Component**: Create in `src/assets/js/`, register in `main.js`, use with `<is-land>`  
**Update Styling**: Modify `tokens.json`, run `bun run tokens`, add CSS blocks  
**New Page**: Create `*.vto` file with `eleventyNavigation` front matter  
**Debug Islands**: Check browser console for component loading errors
**Add Navigation**: Add `eleventyNavigation` to page front matter, auto-renders in nav partial