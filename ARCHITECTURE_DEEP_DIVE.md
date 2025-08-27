# Architecture Deep Dive

## Request Flow

```
1. Browser Request → Static HTML (Eleventy + VentoJS)
2. is-land triggers → Component loading (on interaction/visibility)  
3. Vite chunks → Dynamic imports (JS/Svelte)
4. Component mount → Interactive functionality
```

## Component Loading Sequence

### Vanilla JS Component
```js
// main.js registration
const vanillaComponents = {
  'mobile-menu': () => import('/src/assets/js/mobile-menu.js'),
};

// is-land loader
Island.addInitType("vanilla", async (island) => {
  const componentName = island.getAttribute("component");
  const importFn = vanillaComponents[componentName];
  const loader = await importFn();
  return loader.default(island, props);
});
```

### Svelte Component 
```js  
// Shared runtime caching
let svelteRuntimePromise = null;

Island.addInitType("svelte", async (island) => {
  // Load runtime once, cache forever
  if (!svelteRuntimePromise) {
    svelteRuntimePromise = import('svelte');
  }
  
  const svelte = await svelteRuntimePromise;
  const componentModule = await importFn();
  
  return svelte.mount(componentModule.default, { target: island, props });
});
```

## Build Process

### Eleventy (Static Generation)
```bash
1. VentoJS processes templates: *.vto → HTML
2. Generates <is-land> placeholders
3. Static HTML ready for browser
```

### Vite (Asset Processing)  
```bash
1. Entry point: src/assets/main.js
2. CSS processing: LightningCSS transforms
3. Svelte compilation: .svelte → JS modules
4. Chunk generation: Runtime + component splits
```

## Critical Configuration

**eleventy.config.js**:
```js
// REQUIRED: Without this, all JS imports fail
eleventyConfig.addPassthroughCopy("src/assets");

// Order matters: VentoJS before Vite
eleventyConfig.addPlugin(VentoPlugin);
eleventyConfig.addPlugin(EleventyVitePlugin);
```

**eleventyVitePluginConfig.js**:
```js
resolve: {
  alias: {
    '/src': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src'),
  }
},
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        svelte: ['svelte']  // Separate runtime chunk
      }
    }
  }
}
```

## State Management

### Component-Level (Svelte 5)
```js
let count = $state(initialValue);

// Persistence  
$effect(() => {
  localStorage.setItem('key', count.toString());
});
```

### Cross-Tab Sync
```js
const channel = new BroadcastChannel('sync');

channel.addEventListener('message', (event) => {
  if (event.data.type === 'UPDATE') {
    count = event.data.value;
  }
});
```

### Global State
```js
// app-state.svelte.js
export const appState = $state({
  theme: 'light',
  counters: 0
});
```

## Performance Characteristics

| Load Type | JS Bundle | Description |
|-----------|-----------|-------------|
| Static    | 0 KB      | HTML only |
| Vanilla   | ~5 KB     | Component + is-land |
| First Svelte | ~30 KB | Runtime + component |  
| Additional Svelte | ~2 KB | Component only |

## Error Handling

```js
// Component loading
try {
  const loader = await importFn();
  return loader.default(island, props);
} catch (error) {
  console.error(`Failed to load ${componentName}:`, error);
  island.innerHTML = `<div>Error: ${error.message}</div>`;
}

// State fallbacks
let count = $state(
  typeof localStorage !== 'undefined' 
    ? parseInt(localStorage.getItem('key') || '0') 
    : 0
);
```

## Debugging

**Common Issues**:
- 404 on `/assets/main.js` → Missing passthrough copy
- Import failures → Wrong alias paths in Vite config
- Components not loading → Check browser dev tools for errors

**Quick Checks**:
```bash
# Verify assets copied  
ls -la _site/assets/

# Check import paths match
grep -r "import.*assets" src/
```