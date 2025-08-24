<script>
  import { appState, updateTheme, incrementCounter } from './app-state.svelte.js';
  
  let { } = $props();
  let stateValue = $state();
  
  // Track when this component mounts
  $effect(() => {
    appState.update(state => ({
      ...state,
      counters: state.counters + 1
    }));
    console.log('🟦 Svelte: StateDemo component mounted');
    
    return () => {
      appState.update(state => ({
        ...state,
        counters: state.counters - 1
      }));
      console.log('🟦 Svelte: StateDemo component unmounted');
    };
  });
  
  // Subscribe to store changes
  $effect(() => {
    const unsubscribe = appState.subscribe(value => {
      stateValue = value;
    });
    return unsubscribe;
  });
</script>

<div class="state-demo">
  <h3>🔗 Shared State Demo</h3>
  
  {#if stateValue}
  <div class="stats">
    <p><strong>Active Components:</strong> {stateValue.counters}</p>
    <p><strong>Total Clicks:</strong> {stateValue.totalClicks}</p>
    <p><strong>Current Theme:</strong> {stateValue.theme}</p>
    {#if stateValue.lastActivity}
      <p><strong>Last Activity:</strong> {new Date(stateValue.lastActivity).toLocaleTimeString()}</p>
    {/if}
  </div>
  
  <div class="actions">
    <button onclick={() => incrementCounter()}>
      Increment Global Counter
    </button>
    
    <button onclick={() => updateTheme(stateValue.theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme ({stateValue.theme === 'light' ? 'Switch to Dark' : 'Switch to Light'})
    </button>
  </div>
  
  <div class="visits">
    <h4>Page Visits:</h4>
    {#if stateValue.pageVisits.length === 0}
      <p><em>No page visits tracked yet</em></p>
    {:else}
      <ul>
        {#each stateValue.pageVisits.slice(-5) as visit}
          <li>{visit.page} - {new Date(visit.timestamp).toLocaleTimeString()}</li>
        {/each}
      </ul>
    {/if}
  </div>
  {/if}
</div>

<style>
  .state-demo {
    padding: 1.5rem;
    border: 2px solid #16a34a;
    border-radius: 12px;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    margin: 1rem 0;
    font-family: system-ui, sans-serif;
  }
  
  .state-demo h3 {
    margin: 0 0 1rem 0;
    color: #166534;
  }
  
  .stats {
    background: white;
    padding: 1rem;
    border-radius: 6px;
    margin: 1rem 0;
    border: 1px solid #d1fae5;
  }
  
  .stats p {
    margin: 0.25rem 0;
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
    margin: 1rem 0;
    flex-wrap: wrap;
  }
  
  .actions button {
    padding: 0.5rem 1rem;
    background: #16a34a;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .actions button:hover {
    background: #15803d;
  }
  
  .visits {
    background: #fef3c7;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid #fbbf24;
  }
  
  .visits h4 {
    margin: 0 0 0.5rem 0;
    color: #92400e;
  }
  
  .visits ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .visits li {
    padding: 0.25rem 0;
    color: #78350f;
    font-size: 0.875rem;
  }
</style>