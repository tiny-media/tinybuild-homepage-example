// Dynamic loader for Counter Svelte component
export default async function() {
  console.log('🟦 Counter.js loader called');
  
  try {
    // Import Svelte and component separately for debugging
    const [svelte, counterModule] = await Promise.all([
      import('svelte'),
      import('./Counter.svelte')
    ]);
    
    console.log('🟦 Svelte runtime loaded:', svelte);
    console.log('🟦 Counter component loaded:', counterModule.default);
    
    const Counter = counterModule.default;
    
    return (target, props = {}) => {
      console.log('🟦 Mounting Counter with props:', props);
      
      target.innerHTML = '';
      
      // Use Svelte 5 mount function
      const component = new Counter({ 
        target,
        props
      });
      
      console.log('🟦 Counter mounted successfully');
      return component;
    };
  } catch (error) {
    console.error('🟥 Counter failed:', error);
    target.innerHTML = `<p style="color: red;">Counter Error: ${error.message}</p>`;
    throw error;
  }
}