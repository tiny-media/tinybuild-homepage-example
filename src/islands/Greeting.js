// Dynamic loader for Greeting Svelte component
export default async function() {
  console.log('🟦 Loading Svelte runtime for Greeting component...');
  
  const { default: Greeting } = await import('./Greeting.svelte');
  
  console.log('🟦 Svelte runtime loaded, mounting Greeting component');
  
  return (target, props = {}) => {
    const component = new Greeting({ target, props });
    return {
      destroy: () => component.$destroy()
    };
  };
}
