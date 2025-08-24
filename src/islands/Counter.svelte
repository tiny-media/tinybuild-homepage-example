<script>
  let { initialCount = 0 } = $props();
  
  let count = $state(initialCount);
  
  function increment() {
    count++;
  }
  
  function decrement() {
    count--;
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