# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- **HTML Minification**: vite-plugin-simple-html with @swc/html
- **Island Architecture**: @11ty/is-land v5 (beta)
- **Component Framework**: Svelte 5 with runes
- **Package Manager**: Bun
- **Code Formatting**: Biome

## Configuration

### Eleventy Configuration (`eleventy.config.js`)

```js
import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";
import { VentoPlugin } from "eleventy-plugin-vento";
import { eleventyVitePluginConfig } from "./src/_utilities/eleventyVitePluginConfig.js";

export default async function (eleventyConfig) {
  // Server Configuration
  eleventyConfig.setServerOptions({
    domDiff: true,
    port: 4321,
    watch: [],
    showAllHosts: false,
  });

  // VentoJS Plugin Configuration (must be loaded before Vite)
  eleventyConfig.addPlugin(VentoPlugin, {
    shortcodes: true,
    pairedShortcodes: true,
    filters: true,
    autotrim: false,
    ventoOptions: {
      includes: "src/_includes",
    },
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
import simpleHtml from "vite-plugin-simple-html";
import path from "node:path";
import { fileURLToPath } from "url";

export function eleventyVitePluginConfig() {
  return {
    clearScreen: false,
    appType: "mpa",
    plugins: [
      svelte(),
      // HTML minification only in production
      ...(process.env.NODE_ENV === 'production' ? [
        simpleHtml({
          minify: {
            collapseWhitespaces: 'all',        // Maximum whitespace removal
            minifyCss: true,                   // Minify inline CSS
            minifyJs: false,                   // Let Vite handle JS minification
            minifyJson: true,                  // Minify JSON in HTML
            quotes: true,                      // Optimize quote usage
            removeComments: true,              // Remove HTML comments
            removeEmptyAttributes: true,       // Remove empty attributes
            removeRedundantAttributes: 'all',  // Remove redundant attributes
            tagOmission: false                 // Keep closing tags for is-land compatibility
          }
        })
      ] : [])
    ],

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

console.log('🟩 Main bundle loaded - is-land initialized');

// Component registries for static analysis
const vanillaComponents = {
  'mobile-menu': () => import('/src/components/mobile-menu.js'),
  'search-toggle': () => import('/src/components/search-toggle.js')
};

const svelteComponents = {
  'counter': () => import('/src/islands/Counter.svelte'),
  'greeting': () => import('/src/islands/Greeting.svelte'),
  'statedemo': () => import('/src/islands/StateDemo.svelte')
};

// Ensure is-land is loaded before registering loaders
await customElements.whenDefined('is-land');

// Vanilla JS component loader
Island.addInitType("vanilla", async (island) => {
  const componentName = island.getAttribute("component");
  const propsAttr = island.getAttribute("props");
  const props = propsAttr ? JSON.parse(propsAttr) : {};
  
  console.log(`🟨 Loading vanilla component: ${componentName}`);
  
  try {
    const importFn = vanillaComponents[componentName];
    if (!importFn) {
      throw new Error(`Unknown vanilla component: ${componentName}`);
    }
    const loader = await importFn();
    island.innerHTML = ''; // Clear placeholder
    return loader.default(island, props);
  } catch (error) {
    console.error(`Failed to load vanilla component ${componentName}:`, error);
  }
});

// Shared Svelte runtime cache
let svelteRuntimePromise = null;

// Svelte component loader  
Island.addInitType("svelte", async (island) => {
  const componentName = island.getAttribute("component");
  const propsAttr = island.getAttribute("props");
  const props = propsAttr ? JSON.parse(propsAttr) : {};
  
  console.log(`🟦 Loading Svelte component: ${componentName}`);
  
  try {
    // Load Svelte runtime once and cache it
    if (!svelteRuntimePromise) {
      console.log('🟦 Loading Svelte runtime for first time...');
      svelteRuntimePromise = import('svelte');
    } else {
      console.log('🟦 Using cached Svelte runtime');
    }
    
    const importFn = svelteComponents[componentName];
    if (!importFn) {
      throw new Error(`Unknown Svelte component: ${componentName}`);
    }
    
    // Load both runtime and component
    const svelte = await svelteRuntimePromise;
    const componentModule = await importFn();
    
    island.innerHTML = ''; // Clear placeholder
    
    // Mount component using Svelte 5 mount API
    const component = svelte.mount(componentModule.default, { 
      target: island,
      props: props
    });
    
    console.log(`🟦 ${componentName} mounted successfully`);
    return component;
    
  } catch (error) {
    console.error(`Failed to load Svelte component ${componentName}:`, error);
    island.innerHTML = `<div style="color: red; padding: 1rem;">Error: ${error.message}</div>`;
  }
});

console.log('🟩 Component loaders registered');
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

# Production build with automatic cleanup and HTML minification
bun run build

# Preview production build
bun run preview

# Clean build directories (both _site and .11ty-vite)
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
│   ├── Counter.svelte       # Interactive counter component
│   ├── Greeting.svelte      # Simple greeting component
│   ├── StateDemo.svelte     # Cross-tab state demo
│   ├── app-state.svelte.js  # Global state with cross-tab sync
│   └── *.js                 # Legacy loaders (being phased out)
├── _includes/
│   ├── layouts/
│   │   └── base.vto         # Main layout template
│   ├── components/          # Reusable VentoJS components
│   │   ├── island-showcase.vto
│   │   └── performance-stats.vto
│   ├── fragments/           # Template fragments
│   │   └── code-examples.vto
│   └── utils/               # VentoJS utility functions
│       └── formatters.vto   # Formatters and helpers
├── _utilities/
│   └── eleventyVitePluginConfig.js  # Vite configuration
├── _data/                   # Eleventy data files
│   ├── site.js              # Site-wide data
│   └── navigation.js        # Navigation structure
├── content/                 # Content pages
│   └── pages/
└── *.vto                    # VentoJS page templates
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

Component sizes are tracked in `src/_includes/components/island-showcase.vto` as `estimatedSize` values:
- **Svelte Runtime Cost**: 26,580 bytes (shared across all components)
- **Component Sizes**: counter: 1,380b, greeting: 1,220b, statedemo: 2,140b
- **Vanilla Components**: mobile-menu: 1,330b, search-toggle: 1,720b

| Page Type | Initial JS | Framework JS | Component JS | Total JS |
|-----------|------------|--------------|--------------|----------|
| Static    | 0 KB       | 0 KB         | 0 KB         | 0 KB     |
| Vanilla   | 3 KB       | 0 KB         | 1-2 KB       | 4-5 KB   |
| First Svelte | 3 KB    | 26 KB        | 1-2 KB       | 30-31 KB |
| Additional Svelte | 3 KB | 0 KB (cached) | 1-2 KB    | 4-5 KB   |

### HTML Minification Results

HTML minification is handled by `vite-plugin-simple-html` with optimal compression:

| Page | Unminified | Minified | Savings | Gzipped |
|------|------------|----------|---------|---------|
| **index.html** | 7.64 KB | **6.19 KB** | **19.0%** | 1.77 KB |
| **simple.html** | 8.85 KB | **7.24 KB** | **18.2%** | 2.18 KB |
| **interactive.html** | 11.44 KB | **9.19 KB** | **19.7%** | 2.63 KB |
| **complex.html** | 11.52 KB | **9.76 KB** | **15.3%** | 2.68 KB |

**Minification Features:**
- ✅ **Template-safe**: Processes after VentoJS compilation
- ✅ **is-land compatible**: Preserves custom elements and attributes  
- ✅ **Production-only**: No impact on development workflow
- ✅ **@swc/html powered**: Fast Rust-based HTML processing
- ✅ **Comprehensive**: Minifies HTML, inline CSS, and optionally inline JS

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

## VentoJS Template System

### Core Syntax
VentoJS uses unified `{{ }}` syntax for all operations:

```vento
{{ title }}                          # Variables
{{ user.name || "Anonymous" }}       # JavaScript expressions  
{{ await api.getData() }}            # Async operations
{{ value |> toUpperCase }}           # Pipes (filters)
{{ "<em>text</em>" |> safe }}        # Trusted HTML
```

### Layouts and Data Passing
```vento
{{ layout "layouts/base.vto" {
  title: "Page Title",
  loadJS: true,
  navigation: [
    { url: "/", label: "Home", current: true }
  ]
} }}

Page content goes here

{{ /layout }}
```

### Layout Template (`src/_includes/layouts/base.vto`)
```vento
{{ import { formatDate, generateId } from "../utils/formatters.vto" }}

{{ set buildTime = new Date().toISOString() }}
{{ set pageId = title |> generateId }}

<!DOCTYPE html>
<html lang="en" data-page="{{ pageId }}" data-build="{{ buildTime }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  {{ if loadJS }}
  <script type="module" src="/assets/main.js"></script>
  {{ /if }}
  <title>{{ title || "Eleventy + VentoJS + Islands" }}</title>
  <meta name="description" content="{{ description || 'Progressive island architecture with Eleventy, VentoJS, and Svelte 5' }}">
  <meta name="build-time" content="{{ buildTime }}">
  <style>
    /* Inline critical CSS for immediate rendering */
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    .nav { background: #f8fafc; padding: 1rem; border-radius: 6px; margin: 2rem 0; }
    .nav a { display: inline-block; padding: 0.5rem 1rem; margin: 0.25rem; 
             text-decoration: none; background: #e2e8f0; border-radius: 4px; }
    .nav a.current { background: #3b82f6; color: white; }
  </style>
</head>
<body>
  <main>
    <div class="nav">
      {{ for navItem of navigation }}
        <a href="{{ navItem.url }}"{{ if navItem.current }} class="current"{{ /if }}>{{ navItem.label }}</a>
      {{ /for }}
    </div>
    {{ content }}
  </main>
</body>
</html>
```

### Conditionals and Loops
```vento
{{ if condition }}
  Content when true
{{ else }}
  Alternative content
{{ /if }}

{{ for item of items }}
  <li>{{ item.name }}</li>
{{ /for }}

{{ for key, value of object }}
  {{ key }}: {{ value }}
{{ /for }}
```

### Template Features
- **File Extension**: Use `.vto` for VentoJS templates
- **Data Access**: Default `it` variable or custom data variable
- **JavaScript Integration**: Full JS expressions and async/await support
- **Pipe Filters**: Transform data with `|>` operator
- **Automatic Escaping**: Disabled by default, use `|> safe` for trusted HTML
- **Whitespace Control**: `{{- }}` and `{{ -}}` for trimming

### VentoJS Components and Utilities

The project includes modular VentoJS components and utilities:

#### Utility Functions (`src/_includes/utils/formatters.vto`)
Real examples from the codebase:

```vento
{{# Import utility functions - VentoJS supports destructuring imports #}}
{{ import { formatDate, formatFileSize, generateId, createStatusBadge } from "../utils/formatters.vto" }}

{{# Function examples with complex logic #}}
{{ formatDate("2024-01-01") }}        # Human-readable date formatting
{{ formatFileSize(25600) }}           # File size in appropriate units (25.0 KB)
{{ generateId("Page Title") }}        # URL-safe ID generation (page-title)

{{# Advanced: Exported function with complex object and conditional logic #}}
{{ export function createStatusBadge(level, text) }}
  {{ set colors = {
    info: { bg: '#f0f9ff', border: '#0ea5e9', icon: 'ℹ️' },
    success: { bg: '#dcfce7', border: '#16a34a', icon: '✅' },
    warning: { bg: '#fef3c7', border: '#f59e0b', icon: '⚠️' },
    error: { bg: '#fee2e2', border: '#dc2626', icon: '❌' },
    excellent: { bg: '#dcfce7', border: '#16a34a', icon: '🚀' }
  } }}
  {{ set color = colors[level] || colors.info }}
  <span style="background: {{ color.bg }}; color: {{ color.border }}; border: 1px solid {{ color.border }}; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
    {{ color.icon }} {{ text }}
  </span>
{{ /export }}
```

#### Template Components (`src/_includes/components/`)
Real examples from the codebase showing advanced VentoJS techniques:

```vento
{{# Complex exported function with default parameters and object manipulation #}}
{{ export function islandDemo(component, type, props = {}, trigger = "visible") }}
  {{# Advanced: Object literal with nested data structures #}}
  {{ set triggerIcons = {
    visible: '👁️',
    interaction: '👆', 
    idle: '⏱️',
    media: '📱'
  } }}
  
  {{# Complex object with multiple component configurations #}}
  {{ set componentData = {
    counter: { 
      title: 'Interactive Counter',
      description: 'Reactive state with localStorage persistence and cross-tab sync',
      estimatedSize: 1380,
      features: ['Svelte 5 runes', 'Global state', 'Cross-tab sync', 'Persistence']
    },
    greeting: {
      title: 'Dynamic Greeting', 
      description: 'Time-aware greeting with personalized messages',
      estimatedSize: 1220,
      features: ['Async operations', 'Date formatting', 'Props handling']
    }
  } }}
  
  {{# Advanced: Conditional assignment with fallback and property access #}}
  {{ set data = componentData[component] || { title: component, description: 'Component', estimatedSize: 1000, features: [] } }}
  
  {{# JavaScript integration: Object.keys and JSON.stringify in templates #}}
  {{ set propsJson = Object.keys(props).length > 0 ? ` props='${JSON.stringify(props)}'` : '' }}
  
  {{# Conditional rendering with array length check #}}
  {{ if data.features.length > 0 }}
    <div style="margin: 1rem 0;">
      <div style="font-size: 0.75rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">FEATURES:</div>
      <div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">
        {{# VentoJS for loop with array iteration #}}
        {{ for feature of data.features }}
          <span style="background: #e0e7ff; color: #3730a3; padding: 0.125rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">{{ feature }}</span>
        {{ /for }}
      </div>
    </div>
  {{ /if }}
  
  {{# Echo tag for preventing VentoJS processing of is-land syntax #}}
  {{ echo }}
<is-land on:{{ trigger }} type="{{ type }}" component="{{ component }}"{{ propsJson |> safe }}>
  {{ islandPlaceholder(type, `Loading ${data.title}...`) }}
</is-land>
  {{ /echo }}
{{ /export }}

{{# Usage: Import and call with parameters #}}
{{ import { islandDemo } from "./_includes/components/island-showcase.vto" }}
{{ islandDemo('counter', 'svelte', { initialCount: 10 }, 'visible') }}
```

#### Advanced Mathematical Operations in Templates
Real performance calculation examples:

```vento
{{# Complex mathematical expressions with reduce and object methods #}}
{{ set componentSizes = { counter: 1380, greeting: 1220, statedemo: 2140 } }}
{{ set totalComponentSize = Object.values(componentSizes).reduce((sum, size) => sum + size, 0) }}

{{# Performance calculations with conditional logic #}}
{{ for scenario of scenarios }}
  {{ set efficiency = scenario.frameworkSize > 0 ? 
       ((scenario.componentSize / (scenario.jsSize + scenario.frameworkSize + scenario.componentSize)) * 100).toFixed(1) 
       : 100 }}
  {{# Complex conditional styling based on calculated values #}}
  <span style="background: {{ efficiency > 80 ? '#dcfce7' : efficiency > 50 ? '#fef3c7' : '#fee2e2' }}; padding: 0.125rem 0.5rem;">
    {{ efficiency }}%
  </span>
{{ /for }}
```

### Advanced VentoJS Techniques Used in This Project

#### 1. **Function Exports with Default Parameters**
```vento
{{ export function islandDemo(component, type, props = {}, trigger = "visible") }}
  {{# Function body with complex logic #}}
{{ /export }}
```

**CRITICAL**: VentoJS export syntax must use `{{ export function name() }}`, NOT `{{ export name = function() }}`. The latter causes parsing errors.

#### 2. **Complex Object Manipulation**
```vento
{{# Object literal with method calls and conditional expressions #}}
{{ set propsJson = Object.keys(props).length > 0 ? ` props='${JSON.stringify(props)}'` : '' }}
{{ set data = componentData[component] || fallbackData }}
```

**Performance Calculations**: VentoJS handles complex mathematical expressions with array methods:
```vento
{{ set totalComponentSize = Object.values(componentSizes).reduce((sum, size) => sum + size, 0) }}
{{ set efficiency = frameworkSize > 0 ? 
     ((componentSize / (jsSize + frameworkSize + componentSize)) * 100).toFixed(1) 
     : 100 }}
```

#### 3. **Mathematical Operations in Templates**
```vento
{{# Array reduce operations #}}
{{ set totalSize = Object.values(sizes).reduce((sum, size) => sum + size, 0) }}

{{# Complex percentage calculations #}}
{{ set efficiency = frameworkSize > 0 ? 
     ((componentSize / (jsSize + frameworkSize + componentSize)) * 100).toFixed(1) 
     : 100 }}
```

#### 4. **Conditional Rendering and Styling**
```vento
{{# Conditional CSS classes based on calculated values #}}
<span style="background: {{ efficiency > 80 ? '#dcfce7' : efficiency > 50 ? '#fef3c7' : '#fee2e2' }};">
  {{ efficiency }}%
</span>

{{# Array length conditional checks #}}
{{ if data.features.length > 0 }}
  {{# Render feature list #}}
{{ /if }}
```

#### 5. **Echo Tag for Mixed Syntax**
```vento
{{# Prevent VentoJS from processing specific HTML syntax #}}
{{ echo }}
<is-land on:{{ trigger }} type="{{ type }}" component="{{ component }}"{{ propsJson |> safe }}>
  {{ islandPlaceholder(type, `Loading ${data.title}...`) }}
</is-land>
{{ /echo }}
```

#### 6. **Template Import/Export System**
```vento
{{# Export multiple functions from utility files #}}
{{ export function formatDate(dateString) }}
  {{ set date = new Date(dateString) }}
  {{ date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
{{ /export }}

{{# Import specific functions with destructuring #}}
{{ import { formatDate, formatFileSize, generateId } from "../utils/formatters.vto" }}
```

#### 7. **Pipe vs Function Call Patterns**
```vento
{{# Safe filter for HTML content #}}
{{ htmlContent |> safe }}

{{# IMPORTANT: Use function calls, NOT pipes for custom functions #}}
{{ generateId(title) }}  {{# CORRECT #}}
{{ title |> generateId }}  {{# WRONG - causes errors #}}

{{# JavaScript string methods as filters work fine #}}
{{ "hello world" |> toUpperCase }}
```

**CRITICAL**: Custom utility functions must be called as functions `generateId(value)`, not as pipes `value |> generateId`. Only built-in filters work with pipe syntax.

### Plugin Integration Benefits
- Eleventy filters automatically available in VentoJS templates
- Shortcodes and paired shortcodes work seamlessly
- Template inheritance and partial includes
- Hot reload support in development
- Production build optimization
- Import/export system for modular template organization
- JavaScript integration for complex calculations
- Conditional rendering with template functions

This setup provides optimal performance scaling from static content to complex interactive applications while maintaining excellent developer experience and modern templating capabilities with advanced VentoJS features.