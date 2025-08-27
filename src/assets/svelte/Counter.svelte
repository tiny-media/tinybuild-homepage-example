<script>
  import { appState, incrementCounter } from './app-state.svelte.js';
  
  let { initialCount = 0 } = $props();
  
  // Load persisted count from localStorage or use initialCount
  let count = $state(
    typeof localStorage !== 'undefined' 
      ? parseInt(localStorage.getItem('counterValue') || initialCount.toString(), 10) 
      : initialCount
  );
  
  // Cross-tab sync and persistence using proper Svelte 5 patterns
  let channel;
  let isReceivingUpdate = false;
  
  onMount(() => {
    if (typeof window !== 'undefined') {
      channel = new BroadcastChannel('counter-sync');
      
      // Listen for updates from other tabs
      const handleMessage = (event) => {
        if (event.data.type === 'COUNTER_UPDATE' && !isReceivingUpdate) {
          isReceivingUpdate = true;
          count = parseInt(event.data.value, 10);
          isReceivingUpdate = false;
        }
      };
      
      channel.addEventListener('message', handleMessage);
    }
  });
  
  onDestroy(() => {
    if (channel) {
      channel.close();
    }
  });
  
  // Persist and sync on count changes
  $effect(() => {
    if (typeof localStorage !== 'undefined' && !isReceivingUpdate) {
      localStorage.setItem('counterValue', count.toString());
      
      if (channel) {
        channel.postMessage({
          type: 'COUNTER_UPDATE',
          value: count.toString()
        });
      }
    }
  });
  
  // Track when this component mounts - use onMount to avoid reactivity loops
  import { onMount, onDestroy } from 'svelte';
  
  onMount(() => {
    appState.counters++;
    console.log('🟦 Svelte: Counter component mounted');
  });
  
  onDestroy(() => {
    appState.counters--;
    console.log('🟦 Svelte: Counter component unmounted');
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

<div class="island stack" style="--stack-space: var(--spacing-sm);">
  <h3>Counter Island</h3>
  <p>Count: {count}</p>
  <div class="cluster">
    <button class="button" onclick={decrement}>-</button>
    <button class="button" onclick={increment}>+</button>
  </div>
</div>

