<script>
  import { appState, updateTheme, incrementCounter } from './app-state.svelte.js';
  
  let { } = $props();
  
  // Track when this component mounts
  import { onMount, onDestroy } from 'svelte';
  
  onMount(() => {
    appState.counters++;
    console.log('🟦 Svelte: StateDemo component mounted');
  });
  
  onDestroy(() => {
    appState.counters--;
    console.log('🟦 Svelte: StateDemo component unmounted');
  });
</script>

<div class="island stack" style="--stack-space: var(--spacing-md);">
  <h3>🔗 Shared State Demo</h3>
  
  <div class="stats stack" style="--stack-space: var(--spacing-xs);">
    <p><strong>Active Components:</strong> {appState.counters}</p>
    <p><strong>Total Clicks:</strong> {appState.totalClicks}</p>
    <p><strong>Current Theme:</strong> {appState.theme}</p>
    {#if appState.lastActivity}
      <p><strong>Last Activity:</strong> {new Date(appState.lastActivity).toLocaleTimeString()}</p>
    {/if}
  </div>
  
  <div class="cluster" style="--cluster-space: var(--spacing-sm);">
    <button class="button" onclick={() => incrementCounter()}>
      Increment Global Counter
    </button>
    
    <button class="button" onclick={() => updateTheme(appState.theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme ({appState.theme === 'light' ? 'Switch to Dark' : 'Switch to Light'})
    </button>
  </div>
  
  <div class="visits stack" style="--stack-space: var(--spacing-sm);">
    <h4>Page Visits:</h4>
    {#if appState.pageVisits.length === 0}
      <p><em>No page visits tracked yet</em></p>
    {:else}
      <ul>
        {#each appState.pageVisits.slice(-5) as visit}
          <li>{visit.page} - {new Date(visit.timestamp).toLocaleTimeString()}</li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

