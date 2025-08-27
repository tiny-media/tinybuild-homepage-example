# Component Patterns & Examples

This document contains code patterns and examples for building components in the progressive island architecture.

## Island Usage Patterns

### Basic Island Setup
```html
<is-land on:visible type="svelte" component="counter">
  <div>Loading counter component...</div>
</is-land>

<is-land on:interaction type="vanilla" component="mobile-menu">
  <button>Open Menu</button>
</is-land>
```

### With Props
```html
<is-land on:visible type="svelte" component="counter" props='{"initialCount": 10}'>
  <div>Loading counter with initial value 10...</div>
</is-land>
```

## Vanilla JS Component Pattern

```javascript
// src/assets/js/ComponentName.js
export default function(target, props = {}) {
  const element = target.querySelector('selector');
  
  function handleEvent() {
    // Component logic here
    console.log('Component interaction');
  }
  
  element.addEventListener('event', handleEvent);
  
  // Return cleanup function
  return () => {
    element.removeEventListener('event', handleEvent);
  };
}
```

## Svelte 5 Component Pattern

```svelte
<!-- src/assets/svelte/ComponentName.svelte -->
<script>
  import { appState } from './app-state.svelte.js';
  import { onMount, onDestroy } from 'svelte';
  
  let { propName = defaultValue } = $props();
  let localState = $state(initialValue);
  
  onMount(() => {
    appState.counters++;
  });
  
  onDestroy(() => {
    appState.counters--;
  });
  
  $effect(() => {
    // Reactive side effects
  });
</script>

<div class="component">
  <p>Value: {localState}</p>
  <button onclick={() => localState++}>Increment</button>
</div>

<style>
  .component {
    padding: var(--spacing-md);
    background: var(--color-surface);
  }
</style>
```

## Cross-Tab Persistence Pattern

```javascript
// Cross-tab synchronization
const channel = new BroadcastChannel('app-sync');

channel.addEventListener('message', (event) => {
  if (event.data.type === 'UPDATE_COUNTER') {
    count = event.data.value;
  }
});

function updateCounter(newValue) {
  count = newValue;
  localStorage.setItem('counter', newValue.toString());
  channel.postMessage({ type: 'UPDATE_COUNTER', value: newValue });
}
```

## Performance Metrics Helper

```javascript
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
}

export function createPerformanceMetrics(bundleSize = 0) {
  const bundleSizeFormatted = formatFileSize(bundleSize);
  
  return {
    'Time to Interactive': '< 50ms',
    'First Contentful Paint': '< 100ms', 
    'Cumulative Layout Shift': '0.001',
    'JavaScript Bundle': bundleSizeFormatted
  };
}
```

## VentoJS Template Patterns

### Component Functions
```vento
{{ export function performanceStats(level, jsSize, frameworkSize, componentSize) }}
  {{ set totalSize = jsSize + frameworkSize + componentSize }}
  {{ set statusLevel = totalSize < 5000 ? 'success' : totalSize < 20000 ? 'warning' : 'info' }}
  
  <div class="performance-stats island stack" style="--stack-space: var(--spacing-md);">
    <h4>📊 Performance Level {{ level }}</h4>
    <div class="performance-grid">
      <div class="performance-metric text-center">
        <div class="font-semibold text-secondary">Total</div>
        <div class="text-xl font-bold">{{ formatFileSize(totalSize) }}</div>
      </div>
    </div>
  </div>
{{ /export }}
```

### Loading Sequence
```vento
{{ export function loadingSequence(steps) }}
  <div class="loading-sequence island stack" style="--stack-space: var(--spacing-sm);">
    <h5>⚡ Loading Sequence</h5>
    <ol class="sequence-list">
      {{ for step of steps }}
        <li class="sequence-item">
          <strong>{{ step.name }}:</strong> {{ step.description }}
          {{ if step.size }}
            <span class="sequence-size">({{ formatFileSize(step.size) }})</span>
          {{ /if }}
        </li>
      {{ /for }}
    </ol>
  </div>
{{ /export }}
```

## State Management Patterns

### Global App State
```javascript
// app-state.svelte.js
export const appState = $state({
  theme: 'light',
  counters: 0,
  totalClicks: 0,
  lastActivity: null,
  pageVisits: []
});

export function updateTheme(newTheme) {
  appState.theme = newTheme;
  localStorage.setItem('theme', newTheme);
}

export function incrementCounter() {
  appState.totalClicks++;
  appState.lastActivity = Date.now();
  localStorage.setItem('totalClicks', appState.totalClicks.toString());
}
```

### Theme Toggle Implementation
```javascript
function applyTheme(newTheme) {
  const html = document.documentElement;
  
  if (newTheme === 'auto') {
    html.removeAttribute('data-theme');
    html.style.colorScheme = '';
  } else {
    html.setAttribute('data-theme', newTheme);
    html.style.colorScheme = newTheme;
  }
  
  localStorage.setItem('theme', newTheme);
}

// Listen for system theme changes when in auto mode
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
const handleChange = () => {
  if (theme === 'auto') {
    applyTheme('auto');
  }
};

mediaQuery.addEventListener('change', handleChange);
```

## Component Registration

### main.js Pattern
```javascript
// Vanilla JS Components
const vanillaComponents = {
  'mobile-menu': () => import('/src/assets/js/mobile-menu.js'),
  'form-validator': () => import('/src/assets/js/form-validator.js'),
};

// Svelte Components  
const svelteComponents = {
  'counter': () => import('/src/assets/svelte/Counter.svelte'),
  'theme-toggle': () => import('/src/assets/svelte/ThemeToggle.svelte'),
};

// Register loaders
Island.addInitType("vanilla", async (island) => {
  const componentName = island.getAttribute("component");
  const importFn = vanillaComponents[componentName];
  if (!importFn) throw new Error(`Unknown vanilla component: ${componentName}`);
  
  const loader = await importFn();
  const props = island.getAttribute("props") ? JSON.parse(island.getAttribute("props")) : {};
  return loader.default(island, props);
});
```

## Error Handling Patterns

```javascript
// Component Loading with Error Handling
export default async function() {
  try {
    const { default: Component } = await import('./Component.svelte');
    
    return (target, props = {}) => {
      const component = new Component({ target, props });
      return {
        destroy: () => component.$destroy()
      };
    };
  } catch (error) {
    console.error('Component failed:', error);
    target.innerHTML = `<p style="color: red;">Component Error: ${error.message}</p>`;
    throw error;
  }
}
```