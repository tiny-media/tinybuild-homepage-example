# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Progressive island architecture: Eleventy 4.0 + VentoJS + Svelte 5 + is-land.

## Architecture

- **Static pages**: Zero JavaScript
- **Interactive elements**: Vanilla JS components on-demand  
- **Complex UI**: Svelte 5 components with shared runtime
- **CSS**: CUBE methodology with design tokens

## Stack

- **Static Site Generator**: Eleventy 4.0 (alpha)
- **Templates**: VentoJS with unified `{{ }}` syntax
- **Build Tool**: Vite 7+ with LightningCSS
- **Islands**: @11ty/is-land v5 (beta)
- **Components**: Svelte 5 with runes
- **CSS Processing**: LightningCSS (100x faster than PostCSS)
- **Package Manager**: Bun

## Key Files

- `src/assets/main.js` - Island loader and CSS entry point
- `src/assets/js/` - Vanilla JS components
- `src/assets/svelte/` - Svelte 5 components  
- `src/assets/css/` - CUBE CSS architecture
- `eleventy.config.js` - Main configuration
- `eleventyVitePluginConfig.js` - Vite integration

## Development

```bash
bun run dev       # Development server
bun run build     # Production build 
bun run build:dev # Development build
bun run preview   # Preview built site (port 4173)
bun run clean     # Clean build directories
bun run tokens    # Generate CSS from design tokens
```

**Linting**: Biome is configured for JavaScript/TypeScript linting:
```bash
bunx biome check .              # Check code quality
bunx biome check --write .      # Fix issues automatically
```

## Component Registration

**Vanilla JS** (`main.js`):
```js
const vanillaComponents = {
  'component-name': () => import('/src/assets/js/ComponentName.js'),
};
```

**Svelte** (`main.js`):
```js
const svelteComponents = {
  'component-name': () => import('/src/assets/svelte/ComponentName.svelte'),
};
```

**Usage**:
```html
<is-land on:interaction type="vanilla" component="component-name">
  <button>Fallback content</button>
</is-land>
```

## CSS Architecture

**CUBE CSS** structure:
- `0-reset/` - Modern CSS reset
- `1-design-tokens/` - CSS custom properties from JSON
- `2-composition/` - Layout patterns (stack, cluster, container)  
- `3-utilities/` - Single-purpose classes
- `4-blocks/` - Component styles
- `5-exceptions/` - State variations and themes

**Design Tokens** (`src/design-tokens/tokens.json`):
```json
{
  "color": {
    "brand": {
      "primary": { "value": "oklch(50% 0.15 25)" }
    },
    "semantic": {
      "surface": {
        "primary": {
          "light": { "value": "oklch(100% 0 0)" },
          "dark": { "value": "oklch(14% 0.01 240)" }
        }
      }
    }
  },
  "spacing": {
    "scale": {
      "lg": { "value": "1rem" }
    }
  }
}
```

**Token Generation**: CSS files are auto-generated from `tokens.json`:
```bash
bun run tokens  # Generates tokens.css and tokens-themed.css
```

**Component Styling**:
```css
.my-component {
  padding: var(--spacing-md);
  background: var(--color-surface);
  container-type: inline-size;
}

@container (min-width: 300px) {
  .my-component {
    display: grid;
    grid-template-columns: auto 1fr;
  }
}
```

## VentoJS Templates

**Basic Syntax**:
```vento
{{ title }}                    # Variables
{{ user.name || "Anonymous" }} # JavaScript expressions
{{ value |> toUpperCase }}     # Pipes
{{ htmlContent |> safe }}      # Trusted HTML
```

**Layouts**:
```vento
{{ layout "layouts/base.vto" {
  title: "Page Title",
  loadJS: true
} }}

Page content

{{ /layout }}
```

**Loops and Conditionals**:
```vento
{{ if condition }}
  Content
{{ /if }}

{{ for item of items }}
  <li>{{ item.name }}</li>
{{ /for }}
```

**Functions**:
```vento
{{ export function helper(param) }}
  {{ param |> toUpperCase }}
{{ /export }}

{{ import { helper } from "./utils.vto" }}
{{ helper("test") }}
```

## Svelte 5 Components

**Component Structure**:
```svelte
<script>
  import { appState } from './app-state.svelte.js';
  import { onMount } from 'svelte';
  
  let { prop = defaultValue } = $props();
  let state = $state(initialValue);
  
  $effect(() => {
    // Reactive side effects
  });
  
  onMount(() => {
    appState.counters++;
  });
</script>

<div class="component">
  <p>Count: {state}</p>
  <button onclick={() => state++}>+</button>
</div>

<style>
  .component {
    padding: var(--spacing-md);
    background: var(--color-surface);
  }
</style>
```

**Global State** (`app-state.svelte.js`):
```js
export const appState = $state({
  theme: 'light',
  counters: 0
});

export function updateTheme(newTheme) {
  appState.theme = newTheme;
  localStorage.setItem('theme', newTheme);
}
```

## Critical Configuration

**Must include** in `eleventy.config.js`:
```js
// Required for asset loading
eleventyConfig.addPassthroughCopy("src/assets");
```

**Plugin order matters**:
```js
// VentoJS must load before Vite
eleventyConfig.addPlugin(VentoPlugin, { /* config */ });
eleventyConfig.addPlugin(EleventyVitePlugin, { /* config */ });
```

**Module resolution** in `eleventyVitePluginConfig.js`:
```js
resolve: {
  alias: {
    '/src': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src'),
  }
}
```

## Performance

- **Static pages**: 0 KB JavaScript
- **Vanilla components**: ~5 KB total
- **First Svelte component**: ~30 KB (runtime + component)
- **Additional Svelte**: ~1-2 KB each (runtime cached)
- **HTML minification**: ~19% size reduction in production

## File Structure

```
src/
├── assets/
│   ├── css/              # CUBE CSS architecture (0-reset, 1-design-tokens, etc.)
│   ├── js/               # Vanilla JS components
│   ├── svelte/           # Svelte 5 components
│   └── main.js           # Entry point
├── _includes/
│   ├── layouts/          # VentoJS layouts
│   ├── components/       # VentoJS components
│   └── utils/            # VentoJS utilities
├── _data/                # Site data
├── design-tokens/        # Design system tokens (tokens.json)
├── index.vto             # Static homepage
└── demo.vto              # Interactive demo
```