 <script>
    let { name = "World", showTime = false } = $props();

    let currentTime = $state(new Date().toLocaleTimeString());
    let isVisible = $state(false);

    function toggleTime() {
      showTime = !showTime;
      if (showTime) {
        currentTime = new Date().toLocaleTimeString();
      }
    }

    function toggleVisibility() {
      isVisible = !isVisible;
    }
  </script>

  <div class="greeting-card">
    <h2>Hello, {name}! 👋</h2>

    {#if showTime}
      <p class="time">Current time: {currentTime}</p>
    {/if}

    <div class="buttons">
      <button onclick={toggleTime}>
        {showTime ? 'Hide' : 'Show'} Time
      </button>
      <button onclick={toggleVisibility}>
        {isVisible ? 'Hide' : 'Show'} Message
      </button>
    </div>

    {#if isVisible}
      <p class="message">This is a Svelte island! 🏝️</p>
    {/if}
  </div>

  <style>
    .greeting-card {
      padding: 1.5rem;
      border: 2px solid #4ade80;
      border-radius: 12px;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      max-width: 400px;
      margin: 1rem 0;
    }

    .greeting-card h2 {
      margin: 0 0 1rem 0;
      color: #166534;
    }

    .time {
      font-family: monospace;
      background: #ffffff;
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid #d1d5db;
    }

    .buttons {
      display: flex;
      gap: 0.5rem;
      margin: 1rem 0;
    }

    .buttons button {
      padding: 0.5rem 1rem;
      border: 1px solid #16a34a;
      border-radius: 6px;
      background: #22c55e;
      color: white;
      cursor: pointer;
      font-weight: 500;
    }

    .buttons button:hover {
      background: #16a34a;
    }

    .message {
      padding: 0.75rem;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 6px;
      color: #92400e;
      margin: 0;
    }
  </style>