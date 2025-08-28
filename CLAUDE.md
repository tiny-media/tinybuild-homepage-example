# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Progressive Islands Template**: Clean starting point with Eleventy 4.0 + VentoJS + modern web standards.

## Quick Start

```bash
bun run dev       # Development server (localhost:4321)
bun run build     # Production build 
bun run preview   # Preview built site (localhost:4173)
bun run clean     # Clean build directories
```

**Linting**: `bunx biome check . --write`

## Architecture Overview

- **Static-First Architecture**: HTML delivered first, JavaScript islands load progressively
- **Progressive Islands**: Add interactivity only where needed
- **Zero JavaScript Landing**: Landing page uses pure HTML for maximum performance
- **Theme System**: Basic light/dark/auto theme switching without complex dependencies
- **Developer Experience**: Hot reload, fast builds, simplified architecture

## Tech Stack

- **SSG**: Eleventy 4.0 (alpha) with VentoJS templates
- **Bundling**: Vite 7+ for JavaScript processing
- **Components**: Vanilla JS + Svelte 5 islands
- **Runtime**: Bun for fast package management and builds

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
- `*.vto` files use `{{ }}` syntax

## Performance Strategy

| Page Type | JavaScript | Performance |
|-----------|------------|-------------|
| Landing (/) | 0 KB | Perfect 100/100 Lighthouse |
| Other Pages | ~5 KB islands | Fast progressive loading |
| Enhanced | ~30 KB first Svelte + runtime | Rich interactivity |
| Complex | +2 KB each component | Full app experience |

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

- `src/assets/main.js` - Islands loader (non-landing pages only)
- `src/_includes/layouts/base.vto` - Base HTML template
- `src/_includes/partials/head-adaptive.vto` - Basic head section with theme system
- `eleventy.config.js` - Main SSG configuration + navigation plugin
- `eleventyVitePluginConfig.js` - Vite configuration for JavaScript bundling

## Performance Optimizations

**Static-First Strategy**:
- Landing page: Pure HTML for instant rendering
- Zero JavaScript on landing page for perfect static performance
- Progressive enhancement with islands only where needed

**Navigation**:
- `@11ty/eleventy-navigation` plugin for structured navigation
- VentoJS syntax: `collections.all |> eleventyNavigation` (note: `|>` not `|`)
- Front matter: `eleventyNavigation: { key: "Home", order: 1 }`

## Template Structure

**Modular Partials**:
- `partials/head-adaptive.vto` - Basic head section with theme system
- `partials/header.vto` - Site header with logo and navigation
- `partials/nav.vto` - Navigation menu using eleventy-navigation
- `partials/footer.vto` - Site footer with attribution

## Additional Documentation

- `COMPONENT_PATTERNS.md` - Component examples and patterns
- `ARCHITECTURE_DEEP_DIVE.md` - Detailed technical implementation

## Common Tasks

**Add Component**: Create in `src/assets/js/`, register in `main.js`, use with `<is-land>` (non-landing pages only)
**New Page**: Create `*.vto` file with `eleventyNavigation` front matter
**Debug Performance**: Landing page = pure HTML, other pages = check islands loading
**Add Navigation**: Add `eleventyNavigation` to page front matter, auto-renders in nav partial