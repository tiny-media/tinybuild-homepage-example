// Dynamic loader for Greeting Svelte component
export default async function() {
  console.log('🟦 Loading Svelte runtime for Greeting component...');
  
  const [{ mount }, { default: Greeting }] = await Promise.all([
    import('svelte'),              // Cached after first Svelte component load
    import('./Greeting.svelte')    // Component code
  ]);
  
  console.log('🟦 Svelte runtime loaded, mounting Greeting component');
  
  return (target, props = {}) => {
    return mount(Greeting, { target, props });
  };
}
