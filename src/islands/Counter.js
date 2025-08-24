// Dynamic loader for Counter Svelte component
export default async function() {
  console.log('🟦 Loading Svelte runtime for Counter component...');
  
  const [{ mount }, { default: Counter }] = await Promise.all([
    import('svelte'),              // Cached after first Svelte component load
    import('./Counter.svelte')     // Component code
  ]);
  
  console.log('🟦 Svelte runtime loaded, mounting Counter component');
  
  return (target, props = {}) => {
    return mount(Counter, { target, props });
  };
}