// Dynamic loader for StateDemo Svelte component
export default async function() {
  console.log('🟦 Loading Svelte runtime for StateDemo component...');
  
  const [{ mount }, { default: StateDemo }] = await Promise.all([
    import('svelte'),              // Cached after first Svelte component load
    import('./StateDemo.svelte')   // Component code
  ]);
  
  console.log('🟦 Svelte runtime loaded, mounting StateDemo component');
  
  return (target, props = {}) => {
    return mount(StateDemo, { target, props });
  };
}