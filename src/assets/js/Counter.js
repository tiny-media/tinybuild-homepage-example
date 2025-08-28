// Minimal counter component with persistence
export default function(target, props = {}) {
  const { initialCount = 0 } = props;
  const storageKey = 'counter';
  const channelName = 'counter-sync';
  
  // Get persisted count or use initial value
  let count = typeof localStorage !== 'undefined' 
    ? parseInt(localStorage.getItem(storageKey) || initialCount.toString())
    : initialCount;
  
  // Cross-tab synchronization
  const channel = typeof BroadcastChannel !== 'undefined' 
    ? new BroadcastChannel(channelName) 
    : null;
  
  // Update count and sync across tabs
  function updateCount(newCount) {
    count = newCount;
    localStorage.setItem(storageKey, count.toString());
    render();
    
    if (channel) {
      channel.postMessage({ type: 'UPDATE_COUNTER', value: count });
    }
  }
  
  // Listen for cross-tab updates
  if (channel) {
    channel.addEventListener('message', (event) => {
      if (event.data.type === 'UPDATE_COUNTER') {
        count = event.data.value;
        render();
      }
    });
  }
  
  // Render the component
  function render() {
    target.innerHTML = `
      <div class="counter island stack"">
        <h3>Counter: ${count}</h3>
        <div>
          <button data-action="decrement">-</button>
          <button data-action="increment">+</button>
          <button data-action="reset">Reset</button>
        </div>
      </div>
    `;
    
    // Add event listeners
    target.querySelector('[data-action="increment"]').addEventListener('click', () => updateCount(count + 1));
    target.querySelector('[data-action="decrement"]').addEventListener('click', () => updateCount(count - 1));
    target.querySelector('[data-action="reset"]').addEventListener('click', () => updateCount(0));
  }
  
  // Initial render
  render();
  
  // Cleanup function
  return () => {
    if (channel) {
      channel.close();
    }
  };
}