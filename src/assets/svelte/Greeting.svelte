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

  <div class="island stack" style="--stack-space: var(--spacing-md);">
    <h2>Hello, {name}! 👋</h2>

    {#if showTime}
      <p class="time">Current time: {currentTime}</p>
    {/if}

    <div class="cluster">
      <button class="button" onclick={toggleTime}>
        {showTime ? 'Hide' : 'Show'} Time
      </button>
      <button class="button" onclick={toggleVisibility}>
        {isVisible ? 'Hide' : 'Show'} Message
      </button>
    </div>

    {#if isVisible}
      <p class="message">This is a Svelte island! 🏝️</p>
    {/if}
  </div>

