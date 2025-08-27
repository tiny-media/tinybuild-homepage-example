<script>
  import { onMount } from 'svelte';
  
  let theme = $state('auto');
  let mounted = $state(false);
  
  // Theme options
  const themes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'auto', label: 'Auto', icon: '💻' }
  ];
  
  onMount(() => {
    // Get theme from localStorage or default to 'auto'
    const stored = localStorage.getItem('theme');
    theme = stored || 'auto';
    applyTheme(theme);
    mounted = true;
    
    // Listen for system theme changes when in auto mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'auto') {
        applyTheme('auto');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  });
  
  function applyTheme(newTheme) {
    const html = document.documentElement;
    
    if (newTheme === 'auto') {
      html.removeAttribute('data-theme');
      html.style.colorScheme = '';
    } else {
      html.setAttribute('data-theme', newTheme);
      html.style.colorScheme = newTheme;
    }
    
    // Store preference
    localStorage.setItem('theme', newTheme);
  }
  
  function handleThemeChange(newTheme) {
    theme = newTheme;
    applyTheme(newTheme);
  }
</script>

<div class="theme-toggle">
  <button
    class="theme-button"
    aria-label="Toggle theme"
    onclick={() => {
      const currentIndex = themes.findIndex(t => t.value === theme);
      const nextIndex = (currentIndex + 1) % themes.length;
      handleThemeChange(themes[nextIndex].value);
    }}
  >
    <span class="theme-icon">
      {themes.find(t => t.value === theme)?.icon || '💻'}
    </span>
    <span class="theme-label">
      {themes.find(t => t.value === theme)?.label || 'Auto'}
    </span>
  </button>
</div>

<style>
  .theme-toggle {
    display: flex;
    align-items: center;
  }
  
  .theme-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-scale-xs);
    padding: var(--spacing-scale-xs) var(--spacing-scale-sm);
    background: var(--color-interactive-hover);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-size: var(--typography-scale-sm);
    font-family: var(--typography-family-sans);
    font-weight: var(--typography-weight-medium);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  
  .theme-button:hover {
    background: var(--color-interactive-active);
    border-color: var(--color-border-medium);
    color: var(--color-text-primary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  
  .theme-button:active {
    transform: translateY(0);
    box-shadow: none;
  }
  
  .theme-icon {
    font-size: 1em;
    line-height: 1;
  }
  
  .theme-label {
    font-size: var(--typography-scale-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  /* Focus styles for accessibility */
  .theme-button:focus-visible {
    outline: 2px solid var(--color-brand-accent);
    outline-offset: 2px;
  }
</style>