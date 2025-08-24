// Vanilla JS search toggle component
export default function(target, props = {}) {
  console.log('🟨 Vanilla JS: Search toggle component loaded');
  
  const button = target.querySelector('button');
  if (!button) return;

  let isVisible = false;
  
  function toggleSearch() {
    isVisible = !isVisible;
    button.textContent = isVisible ? 'Close Search' : 'Search';
    
    let searchBox = document.querySelector('.search-box');
    
    if (!searchBox) {
      searchBox = document.createElement('div');
      searchBox.className = 'search-box';
      searchBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border: 2px solid #007acc;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 2000;
        min-width: 300px;
        display: none;
      `;
      
      searchBox.innerHTML = `
        <h3 style="margin-top: 0;">Search</h3>
        <input type="search" placeholder="Search..." style="
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 1rem;
        ">
        <div style="text-align: right;">
          <button class="search-close" style="
            padding: 0.5rem 1rem;
            background: #007acc;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          ">Close</button>
        </div>
      `;
      
      document.body.appendChild(searchBox);
      
      // Add close button functionality
      const closeBtn = searchBox.querySelector('.search-close');
      closeBtn.addEventListener('click', () => {
        isVisible = false;
        button.textContent = 'Search';
        searchBox.style.display = 'none';
      });
    }
    
    searchBox.style.display = isVisible ? 'block' : 'none';
    
    if (isVisible) {
      const input = searchBox.querySelector('input');
      setTimeout(() => input.focus(), 100);
    }
    
    console.log(`🔍 Search ${isVisible ? 'opened' : 'closed'}`);
  }

  button.addEventListener('click', toggleSearch);

  // Return cleanup function
  return () => {
    button.removeEventListener('click', toggleSearch);
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
      searchBox.remove();
    }
  };
}