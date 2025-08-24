# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# TinyBuild Homepage - Progressive is-land + Svelte Setup

## Overview

This project demonstrates a progressive loading architecture using @11ty/is-land with Eleventy and Vite. The goal is to load **only the JavaScript needed** based on page complexity:

- **Static pages**: Zero JavaScript
- **Simple interactions**: Vanilla JS components only
- **Complex UI**: Svelte components with shared runtime

## Architecture Strategy

### Progressive Loading Levels

1. **Level 0**: Static HTML - No JS loaded
2. **Level 1**: Vanilla JS components - Minimal JS on interaction
3. **Level 2**: First Svelte component - Svelte runtime loads once
4. **Level 3**: Multiple Svelte components - Reuse cached runtime + shared state

### Technology Stack

- **Static Site Generator**: Eleventy 4.0 (alpha)
- **Build Tool**: Vite 7+ with @11ty/eleventy-plugin-vite
- **Island Architecture**: @11ty/is-land for lazy loading
- **Framework**: Svelte 5 with runes (when needed)
- **State Management**: Svelte runes-based global state
- **Template Engine**: VentoJS (default in Eleventy 4.0)
- **Package Manager**: Bun
- **Code Formatting**: Biome

## Project Structure

```
src/
├── assets/
│   ├── main.js              # is-land core + loaders
│   └── styles/tokens.css    # Global styles
├── components/              # Vanilla JS components
│   ├── mobile-menu.js
│   └── search-toggle.js
├── islands/                 # Svelte components
│   ├── Counter.js          # Dynamic loader
│   ├── Counter.svelte      # Svelte component
│   ├── Greeting.js
│   └── Greeting.svelte
├── state/
│   └── app-state.svelte.js  # Shared state
└── pages/
    ├── index.html           # Level 0: No JS
    ├── simple.html          # Level 1: Vanilla JS only
    ├── interactive.html     # Level 2: First Svelte
    └── complex.html         # Level 3: Multiple Svelte
```

## Key Architecture Notes

### Component Registration System
Components must be registered in `src/assets/main.js` to be available:

```js
const vanillaComponents = {
  'mobile-menu': () => import('/src/components/mobile-menu.js'),
  'search-toggle': () => import('/src/components/search-toggle.js')
};

const svelteComponents = {
  'counter': () => import('/src/islands/Counter.js'),
  'greeting': () => import('/src/islands/Greeting.js'),
  'statedemo': () => import('/src/islands/StateDemo.js')
};
```

### Build Configuration
Vite builds only the main entry point (`src/assets/main.js`) with Svelte runtime as a shared chunk. Components are loaded dynamically via ES modules, not pre-bundled.

### Component Loading Strategy
1. **Vanilla JS**: Loaded on-demand when `<is-land>` triggers
2. **Svelte**: Runtime loaded once, cached for subsequent components
3. **Shared State**: Available across all Svelte components via `app-state.svelte.js`

## Component Patterns

### Vanilla JS Component Pattern
```js
// src/components/mobile-menu.js
export default function(target, props = {}) {
  const button = target.querySelector('button');
  const menu = document.querySelector('.mobile-menu');
  
  button.addEventListener('click', () => {
    menu.classList.toggle('open');
    button.setAttribute('aria-expanded', 
      menu.classList.contains('open')
    );
  });
  
  // Return cleanup function
  return () => {
    button.removeEventListener('click', toggleMenu);
  };
}
```

### Svelte Component Pattern
```js
// src/islands/Counter.js - Dynamic loader
export default async function() {
  const [{ mount }, { default: Counter }] = await Promise.all([
    import('svelte'),              // Cached after first load
    import('./Counter.svelte')     // Component code
  ]);
  
  return (target, props = {}) => {
    return mount(Counter, { target, props });
  };
}
```

```svelte
<!-- src/islands/Counter.svelte -->
<script>
  import { appState } from '../state/app-state.svelte.js';
  
  let { initialCount = 0 } = $props();
  let count = $state(initialCount);
  
  // Sync with global state
  $effect(() => {
    appState.counters = (appState.counters || 0) + 1;
  });
</script>

<div class="counter">
  <h3>Counter Component</h3>
  <p>Count: {count}</p>
  <button onclick={() => count++}>Increment</button>
  <button onclick={() => count--}>Decrement</button>
</div>
```

### Shared State Pattern
```js
// src/state/app-state.svelte.js
export const appState = $state({
  user: null,
  theme: localStorage.getItem('theme') || 'light',
  counters: 0,
  cart: []
});

// Auto-sync to localStorage
$effect(() => {
  localStorage.setItem('theme', appState.theme);
});

export function updateTheme(newTheme) {
  appState.theme = newTheme;
}
```

## is-land Integration

### Main Entry Point
```js
// src/assets/main.js
import "./styles/tokens.css";
import "@11ty/is-land/is-land.js";

// Vanilla JS loader
Island.addInitType("vanilla", async (island) => {
  const componentName = island.getAttribute("component");
  const props = JSON.parse(island.getAttribute("props") || "{}");
  
  const loader = await import(`/components/${componentName}.js`);
  island.innerHTML = ''; // Clear placeholder
  return loader.default(island, props);
});

// Svelte component loader
Island.addInitType("svelte", async (island) => {
  const componentName = island.getAttribute("component");
  const props = JSON.parse(island.getAttribute("props") || "{}");
  
  const loader = await import(`/islands/${componentName}.js`);
  const mountComponent = await loader.default();
  
  island.innerHTML = ''; // Clear placeholder
  return mountComponent(island, props);
});
```

### HTML Usage
```html
<!-- Vanilla JS component -->
<is-land on:interaction type="vanilla" component="mobile-menu">
  <button>☰ Menu</button>
</is-land>

<!-- Svelte component -->
<is-land on:visible type="svelte" component="counter" props='{"initialCount": 5}'>
  <div>Loading counter...</div>
</is-land>
```

## Test Pages Structure

### Level 0: Static Homepage (index.html)
- **JavaScript Loaded**: None
- **Purpose**: Baseline performance measurement
- **Content**: Static HTML only

### Level 1: Simple Interactions (simple.html)  
- **JavaScript Loaded**: main.js + vanilla components on demand
- **Components**: Mobile menu, search toggle
- **Bundle Size**: ~5KB total

### Level 2: First Svelte Component (interactive.html)
- **JavaScript Loaded**: main.js + svelte.js + one component
- **Components**: One counter component
- **Bundle Size**: ~25KB total (includes Svelte runtime)

### Level 3: Multiple Svelte Components (complex.html)
- **JavaScript Loaded**: main.js + svelte.js (cached) + multiple components
- **Components**: Counter, greeting, shared state demo
- **Bundle Size**: ~30KB total (runtime cached, only component code loads)

## Common Development Commands

### Development Server
```bash
bun run dev
```
Starts Eleventy with live reload, incremental building, and Vite integration on port 4321.

### Production Build
```bash
bun run build
```
Creates optimized production build in `_site/` directory.

### Preview Production Build
```bash
bun run preview
```
Serves the production build on port 4173 for testing.

### Clean Build Directory
```bash
bun run clean
```
Removes the `_site/` build directory.

### Code Formatting (Biome)
```bash
bunx @biomejs/biome format --write .
bunx @biomejs/biome check --write .
```

### Creating New Svelte Component
```bash
bun scripts/new-component.js ComponentName
```
Generates both `.svelte` and `.js` loader files in `src/islands/` with proper templates.

## Performance Expectations

| Page Level | Initial JS | Additional JS | Total JS |
|------------|------------|---------------|----------|
| Static     | 0 KB       | 0 KB          | 0 KB     |
| Simple     | 3 KB       | 2 KB          | 5 KB     |
| Interactive| 3 KB       | 22 KB         | 25 KB    |
| Complex    | 3 KB       | 5 KB          | 30 KB*   |

*Svelte runtime cached from previous page

## Key Benefits

1. **Zero JavaScript** on static pages
2. **Minimal JavaScript** for simple interactions
3. **Shared runtime** across Svelte components
4. **Progressive enhancement** - works without JS
5. **Optimal caching** - components cached individually
6. **Shared state** across all Svelte islands

## Browser Support

- **Modern Browsers**: Full support with ES modules
- **Older Browsers**: Graceful degradation (static content works)
- **No JavaScript**: All content accessible without JS

## Adding New Components

### For Vanilla JS Components:
1. Create component file in `src/components/ComponentName.js`
2. Register in `src/assets/main.js` vanillaComponents object
3. Use in HTML: `<is-land on:interaction type="vanilla" component="component-name">`

### For Svelte Components:
1. Use script: `bun scripts/new-component.js ComponentName`
2. Register in `src/assets/main.js` svelteComponents object  
3. Use in HTML: `<is-land on:visible type="svelte" component="componentname">`

### Important Notes:
- Component names in HTML use kebab-case for vanilla, lowercase for Svelte
- All new Svelte components automatically get access to shared state via `app-state.svelte.js`
- Svelte runtime is cached after first component load
- Components are loaded only when their `<is-land>` trigger condition is met