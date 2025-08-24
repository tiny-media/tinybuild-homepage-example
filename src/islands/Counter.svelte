<script>
  import { appState, incrementCounter } from './app-state.svelte.js';
  
  let { initialCount = 0 } = $props();
  let count = $state(initialCount);
  
  // Track when this component mounts
  $effect(() => {
    appState.update(state => ({
      ...state,
      counters: state.counters + 1
    }));
    console.log('🟦 Svelte: Counter component mounted');
    
    return () => {
      appState.update(state => ({
        ...state,
        counters: state.counters - 1
      }));
      console.log('🟦 Svelte: Counter component unmounted');
    };
  });
  
  function increment() {
    count++;
    incrementCounter(); // Update global state
  }
  
  function decrement() {
    count--;
    incrementCounter(); // Update global state
  }
</script>

<div class="counter">
  <h3>Counter Island</h3>
  <p>Count: {count}</p>
  <button onclick={decrement}>-</button>
  <button onclick={increment}>+</button>
</div>

<style>
  .counter {
    padding: 1rem;
    border: 2px solid var(--border, #ddd);
    border-radius: 8px;
    background: var(--surface, white);
  }
  
  .counter h3 {
    margin-top: 0;
  }
  
  .counter button {
    padding: 0.5rem 1rem;
    margin: 0 0.25rem;
    border: 1px solid var(--border, #ddd);
    border-radius: 4px;
    background: var(--surface-secondary, #f5f5f5);
    cursor: pointer;
  }
  
  .counter button:hover {
    background: var(--color-primary-500, #007acc);
    color: white;
  }
</style>