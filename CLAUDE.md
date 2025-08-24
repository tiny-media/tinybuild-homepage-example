# CLAUDE.md

Technical reference for building progressive island-based websites with Eleventy 4.0, Vite 7, and Svelte 5.

## Architecture Overview

Progressive loading system that loads JavaScript only when needed:
- **Static pages**: Zero JavaScript
- **Interactive elements**: Vanilla JS components on-demand
- **Complex UI**: Svelte 5 components with shared runtime
- **State management**: Svelte 5 runes with cross-tab sync

## Technology Stack

- **Static Site Generator**: Eleventy 4.0 (alpha) with VentoJS templates
- **Build Tool**: Vite 7+ with @11ty/eleventy-plugin-vite
- **Island Architecture**: @11ty/is-land v5 (beta)
- **Component Framework**: Svelte 5 with runes
- **Package Manager**: Bun
- **Code Formatting**: Biome

## Configuration

### Eleventy Configuration (`eleventy.config.js`)

```js
import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";
import { eleventyVitePluginConfig } from "./src/_utilities/eleventyVitePluginConfig.js";

export default async function (eleventyConfig) {
  // Server Configuration
  eleventyConfig.setServerOptions({
    domDiff: true,
    port: 4321,
    watch: [],
    showAllHosts: false,
  });

  // Vite Plugin Configuration
  eleventyConfig.addPlugin(EleventyVitePlugin, {
    viteOptions: eleventyVitePluginConfig(),
  });

  // CRITICAL: Static files must be passed through for /assets/ URLs to work
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/islands");

  eleventyConfig.setServerPassthroughCopyBehavior("copy");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
}
```

### Vite Configuration (`src/_utilities/eleventyVitePluginConfig.js`)

```js
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "node:path";
import { fileURLToPath } from "url";

export function eleventyVitePluginConfig() {
  return {
    clearScreen: false,
    appType: "mpa",
    plugins: [svelte()],

    resolve: {
      alias: {
        '/src': path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../')
      }
    },

    server: {
      middlewareMode: true,
    },

    build: {
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: "src/assets/main.js"
        },
        output: {
          manualChunks: {
            svelte: ['svelte']  // Shared Svelte runtime chunk
          }
        },
      }
    },

    optimizeDeps: {
      include: ['svelte']
    },
  };
}
```

## Island Loading System

### Main Entry Point (`src/assets/main.js`)

```js
import "./styles/tokens.css";
import "@11ty/is-land/is-land.js";

// Component registries
const vanillaComponents = {
  'mobile-menu': () => import('/src/components/mobile-menu.js'),
  'search-toggle': () => import('/src/components/search-toggle.js')
};

const svelteComponents = {
  'counter': () => import('/src/islands/Counter.svelte'),
  'greeting': () => import('/src/islands/Greeting.svelte'),
  'statedemo': () => import('/src/islands/StateDemo.svelte')
};

// Wait for is-land custom element
await customElements.whenDefined('is-land');

// Vanilla JS loader
Island.addInitType("vanilla", async (island) => {
  const componentName = island.getAttribute("component");
  const props = JSON.parse(island.getAttribute("props") || "{}");
  
  const importFn = vanillaComponents[componentName];
  if (!importFn) throw new Error(`Unknown vanilla component: ${componentName}`);
  
  const loader = await importFn();
  island.innerHTML = '';
  return loader.default(island, props);
});

// Svelte loader with runtime caching
let svelteRuntimePromise = null;

Island.addInitType("svelte", async (island) => {
  const componentName = island.getAttribute("component");
  const props = JSON.parse(island.getAttribute("props") || "{}");
  
  // Cache Svelte runtime across all components
  if (!svelteRuntimePromise) {
    svelteRuntimePromise = import('svelte');
  }
  
  const [svelte, componentModule] = await Promise.all([
    svelteRuntimePromise,
    svelteComponents[componentName]()
  ]);
  
  island.innerHTML = '';
  return svelte.mount(componentModule.default, { target: island, props });
});
```

## Component Patterns

### Vanilla JS Components

```js
// src/components/ComponentName.js
export default function(target, props = {}) {
  const element = target.querySelector('selector');
  
  function handleEvent() {
    // Component logic
  }
  
  element.addEventListener('event', handleEvent);
  
  // Return cleanup function
  return () => {
    element.removeEventListener('event', handleEvent);
  };
}
```

### Svelte 5 Components

```svelte
<!-- src/islands/ComponentName.svelte -->
<script>
  import { appState } from './app-state.svelte.js';
  import { onMount, onDestroy } from 'svelte';
  
  let { propName = defaultValue } = $props();
  let localState = $state(initialValue);
  
  // Lifecycle management
  onMount(() => {
    appState.counters++;
  });
  
  onDestroy(() => {
    appState.counters--;
  });
  
  // Reactive effects
  $effect(() => {
    // Side effects based on state changes
  });
</script>

<div class="component">
  <!-- Component template -->
</div>

<style>
  /* Component styles */
</style>
```

## Svelte 5 State Management

### Global State (`src/islands/app-state.svelte.js`)

```js
// Svelte 5 runes-based global state
export const appState = $state({
  user: null,
  theme: (typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null) || 'light',
  counters: 0,
  totalClicks: parseInt(localStorage.getItem('totalClicks') || '0'),
  pageVisits: JSON.parse(localStorage.getItem('pageVisits') || '[]'),
  lastActivity: localStorage.getItem('lastActivity') || null
});

// Cross-tab synchronization
let broadcastChannel;
if (typeof window !== 'undefined') {
  broadcastChannel = new BroadcastChannel('app-state-sync');
  
  broadcastChannel.addEventListener('message', (event) => {
    if (event.data.type === 'STATE_UPDATE') {
      Object.assign(appState, event.data.data);
    }
  });
}

// State mutation functions
export function updateTheme(newTheme) {
  appState.theme = newTheme;
  syncToStorage();
}

function syncToStorage() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', appState.theme);
    localStorage.setItem('totalClicks', appState.totalClicks.toString());
    document.documentElement.setAttribute('data-theme', appState.theme);
    
    broadcastChannel?.postMessage({
      type: 'STATE_UPDATE',
      data: { theme: appState.theme, totalClicks: appState.totalClicks }
    });
  }
}
```

### Component State Patterns

```svelte
<script>
  import { appState } from './app-state.svelte.js';
  
  // Props (immutable from parent)
  let { initialValue = 0 } = $props();
  
  // Local state with runes
  let count = $state(initialValue);
  
  // Persistent state with localStorage
  let persistentValue = $state(
    typeof localStorage !== 'undefined' 
      ? parseInt(localStorage.getItem('key') || '0') 
      : 0
  );
  
  // Cross-tab sync for specific values
  let channel;
  let isReceivingUpdate = false;
  
  onMount(() => {
    channel = new BroadcastChannel('component-sync');
    channel.addEventListener('message', (event) => {
      if (event.data.type === 'VALUE_UPDATE' && !isReceivingUpdate) {
        isReceivingUpdate = true;
        persistentValue = event.data.value;
        isReceivingUpdate = false;
      }
    });
  });
  
  onDestroy(() => {
    channel?.close();
  });
  
  // Reactive persistence
  $effect(() => {
    if (typeof localStorage !== 'undefined' && !isReceivingUpdate) {
      localStorage.setItem('key', persistentValue.toString());
      channel?.postMessage({ type: 'VALUE_UPDATE', value: persistentValue });
    }
  });
</script>
```

## HTML Integration

### Page Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script type="module" src="/assets/main.js"></script>
  <title>Page Title</title>
</head>
<body>
  <!-- Static content works without JavaScript -->
  
  <!-- Vanilla JS islands -->
  <is-land on:interaction type="vanilla" component="mobile-menu">
    <button>☰ Menu</button>
  </is-land>
  
  <!-- Svelte islands -->
  <is-land on:visible type="svelte" component="counter" props='{"initialCount": 5}'>
    <div>Loading counter...</div>
  </is-land>
</body>
</html>
```

### Island Triggers

- `on:visible` - Load when element enters viewport
- `on:interaction` - Load on first user interaction
- `on:media` - Load based on media query
- `on:idle` - Load when browser is idle
- `on:save-data` - Respect user's data preferences

## Development Commands

```bash
# Development server with hot reload
bun run dev

# Production build
bun run build

# Preview production build
bun run preview

# Clean build directory
bun run clean

# Code formatting
bunx @biomejs/biome format --write .
bunx @biomejs/biome check --write .
```

## Project Structure

```
src/
├── assets/
│   ├── main.js              # Island loader entry point
│   └── styles/tokens.css    # Global CSS
├── components/              # Vanilla JS components
│   ├── mobile-menu.js
│   └── search-toggle.js
├── islands/                 # Svelte components
│   ├── Counter.svelte       # Component
│   ├── Counter.js          # Loader (legacy, can be removed)
│   └── app-state.svelte.js  # Global state
├── _utilities/
│   └── eleventyVitePluginConfig.js  # Vite configuration
├── _data/                   # Eleventy data files
├── _includes/               # Eleventy templates
└── *.html                   # Page templates
```

## Adding New Components

### Vanilla JS Component

1. Create `src/components/ComponentName.js`:
```js
export default function(target, props = {}) {
  // Component logic
  return () => {
    // Cleanup function
  };
}
```

2. Register in `src/assets/main.js`:
```js
const vanillaComponents = {
  'component-name': () => import('/src/components/ComponentName.js'),
};
```

3. Use in HTML:
```html
<is-land on:interaction type="vanilla" component="component-name">
  <button>Click me</button>
</is-land>
```

### Svelte Component

1. Create `src/islands/ComponentName.svelte`:
```svelte
<script>
  import { appState } from './app-state.svelte.js';
  let { prop = defaultValue } = $props();
  let state = $state(initialValue);
</script>

<div>Component template</div>
```

2. Register in `src/assets/main.js`:
```js
const svelteComponents = {
  'componentname': () => import('/src/islands/ComponentName.svelte'),
};
```

3. Use in HTML:
```html
<is-land on:visible type="svelte" component="componentname" props='{"prop": "value"}'>
  <div>Loading...</div>
</is-land>
```

## Performance Characteristics

| Page Type | Initial JS | Framework JS | Component JS | Total JS |
|-----------|------------|--------------|--------------|----------|
| Static    | 0 KB       | 0 KB         | 0 KB         | 0 KB     |
| Vanilla   | 3 KB       | 0 KB         | 2 KB         | 5 KB     |
| First Svelte | 3 KB    | 22 KB        | 3 KB         | 28 KB    |
| Additional Svelte | 3 KB | 0 KB (cached) | 3 KB      | 6 KB     |

## Key Implementation Details

### Critical Configuration Points

1. **Passthrough Copy**: `addPassthroughCopy("src/assets")` required for `/assets/` URLs
2. **Svelte Plugin**: Must be configured in Vite, not Eleventy
3. **Module Resolution**: `/src` alias enables absolute imports
4. **Runtime Caching**: Single Svelte import cached across all components
5. **Manual Chunks**: Svelte runtime split into separate chunk for optimal caching

### Svelte 5 Specifics

- **Runes**: Use `$state()`, `$props()`, `$effect()` for reactivity
- **Mount API**: Use `svelte.mount(Component, { target, props })` for island mounting
- **Lifecycle**: `onMount`/`onDestroy` instead of old lifecycle functions
- **State Management**: Global `$state()` objects for shared state

### Island Loading Sequence

1. HTML loads with placeholder content
2. `is-land` triggers based on condition (`on:visible`, `on:interaction`, etc.)
3. Component loader imports and initializes component
4. Placeholder content replaced with active component
5. Cleanup function returned for proper unmounting

### Build Optimization

- **Development**: All modules loaded via ES imports
- **Production**: Svelte runtime chunked separately for caching
- **Code Splitting**: Each component loads independently
- **Tree Shaking**: Unused components never loaded

This setup provides optimal performance scaling from static content to complex interactive applications while maintaining excellent developer experience and build performance.