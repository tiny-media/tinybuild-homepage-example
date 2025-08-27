export default function(target, props = {}) {
  // Create theme toggle button
  const button = document.createElement('button');
  button.className = 'theme-toggle';
  button.setAttribute('aria-label', 'Toggle theme');
  
  // Get current theme or default to light
  let currentTheme = localStorage.getItem('theme') || 'light';
  
  // Apply initial theme
  applyTheme(currentTheme);
  updateButton();
  
  function applyTheme(theme) {
    const html = document.documentElement;
    
    // Always set explicit theme class for consistent behavior
    if (theme === 'auto') {
      html.removeAttribute('data-theme');
      // Use system preference for auto mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      html.style.colorScheme = prefersDark ? 'dark' : 'light';
    } else {
      // Explicit theme choice overrides system preference
      html.setAttribute('data-theme', theme);
      html.style.colorScheme = theme;
    }
    
    localStorage.setItem('theme', theme);
  }
  
  function updateButton() {
    const themes = {
      light: { icon: '☀', label: 'Light theme' },
      dark: { icon: '☽', label: 'Dark theme' },
      auto: { icon: '⚙', label: 'Auto theme' }
    };
    
    const theme = themes[currentTheme];
    button.innerHTML = theme.icon;
    button.setAttribute('aria-label', `Switch to next theme (current: ${theme.label})`);
  }
  
  function cycleTheme() {
    const themes = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    currentTheme = themes[nextIndex];
    
    applyTheme(currentTheme);
    updateButton();
  }
  
  // Listen for system theme changes when in auto mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemChange = () => {
    if (currentTheme === 'auto') {
      applyTheme('auto');
    }
  };
  
  button.addEventListener('click', cycleTheme);
  mediaQuery.addEventListener('change', handleSystemChange);
  
  // Mount button
  target.innerHTML = '';
  target.appendChild(button);
  
  // Return cleanup function
  return () => {
    button.removeEventListener('click', cycleTheme);
    mediaQuery.removeEventListener('change', handleSystemChange);
  };
}