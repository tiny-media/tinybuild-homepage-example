// Vanilla JS mobile menu component
export default function(target, props = {}) {
  console.log('🟨 Vanilla JS: Mobile menu component loaded');
  
  const button = target.querySelector('button');
  if (!button) return;

  let isOpen = false;
  
  function toggleMenu() {
    isOpen = !isOpen;
    button.textContent = isOpen ? '✕ Close' : '☰ Menu';
    button.setAttribute('aria-expanded', isOpen);
    
    // Toggle menu visibility
    const menu = document.querySelector('.mobile-menu');
    if (menu) {
      menu.style.display = isOpen ? 'block' : 'none';
    } else {
      // Create menu if it doesn't exist
      const menuElement = document.createElement('div');
      menuElement.className = 'mobile-menu';
      menuElement.style.cssText = `
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ccc;
        padding: 1rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        display: ${isOpen ? 'block' : 'none'};
      `;
      menuElement.innerHTML = `
        <nav>
          <a href="/" style="display: block; padding: 0.5rem 0;">Home</a>
          <a href="/simple.html" style="display: block; padding: 0.5rem 0;">Simple Page</a>
          <a href="/interactive.html" style="display: block; padding: 0.5rem 0;">Interactive Page</a>
          <a href="/complex.html" style="display: block; padding: 0.5rem 0;">Complex Page</a>
        </nav>
      `;
      document.body.appendChild(menuElement);
    }
    
    console.log(`📱 Mobile menu ${isOpen ? 'opened' : 'closed'}`);
  }

  button.addEventListener('click', toggleMenu);

  // Return cleanup function
  return () => {
    button.removeEventListener('click', toggleMenu);
    const menu = document.querySelector('.mobile-menu');
    if (menu) {
      menu.remove();
    }
  };
}