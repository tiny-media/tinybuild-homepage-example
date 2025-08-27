export default function(target, props = {}) {
  const button = target.querySelector('button');
  
  function showModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex; align-items: center;
      justify-content: center; z-index: 1000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white; padding: 2rem; border-radius: 8px;
      max-width: 400px; margin: 1rem;
    `;
    content.innerHTML = `
      <h3>Vanilla JS Modal</h3>
      <p>This modal loads ~2KB of JavaScript on demand.</p>
      <button style="padding: 0.5rem 1rem; margin-top: 1rem;">Close</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    const closeBtn = content.querySelector('button');
    const closeModal = () => document.body.removeChild(modal);
    
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
  
  button.addEventListener('click', showModal);
  
  return () => {
    button.removeEventListener('click', showModal);
  };
}