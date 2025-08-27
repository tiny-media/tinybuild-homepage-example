// Dynamic loader for StateDemo Svelte component
export default async function() {
  console.log('🟦 Loading Svelte runtime for StateDemo component...');
  
  const { default: StateDemo } = await import('./StateDemo.svelte');
  
  console.log('🟦 Svelte runtime loaded, mounting StateDemo component');
  
  return (target, props = {}) => {
    const component = new StateDemo({ target, props });
    return {
      destroy: () => component.$destroy()
    };
  };
}