// Main entry point for Vite processing
import "/src/assets/css/main.css";
import "@11ty/is-land/is-land.js";

console.log('🟩 Main bundle loaded - is-land initialized');

// Component registry for static analysis
const vanillaComponents = {
	'counter': () => import('/src/assets/js/Counter.js')
};

const svelteComponents = {
	// Add Svelte components here as needed
	// 'example': () => import('/src/assets/svelte/Example.svelte')
};

// Ensure is-land is loaded before registering loaders
await customElements.whenDefined('is-land');

// Vanilla JS component loader
Island.addInitType("vanilla", async (island) => {
	const componentName = island.getAttribute("component");
	const propsAttr = island.getAttribute("props");
	const props = propsAttr ? JSON.parse(propsAttr) : {};
	
	console.log(`🟨 Loading vanilla component: ${componentName}`);
	
	try {
		const importFn = vanillaComponents[componentName];
		if (!importFn) {
			throw new Error(`Unknown vanilla component: ${componentName}`);
		}
		const loader = await importFn();
		island.innerHTML = ''; // Clear placeholder
		return loader.default(island, props);
	} catch (error) {
		console.error(`Failed to load vanilla component ${componentName}:`, error);
	}
});

// Shared Svelte runtime cache
let svelteRuntimePromise = null;

// Svelte component loader  
Island.addInitType("svelte", async (island) => {
	const componentName = island.getAttribute("component");
	const propsAttr = island.getAttribute("props");
	const props = propsAttr ? JSON.parse(propsAttr) : {};
	
	console.log(`🟦 Loading Svelte component: ${componentName}`);
	
	try {
		// Load Svelte runtime once and cache it
		if (!svelteRuntimePromise) {
			console.log('🟦 Loading Svelte runtime for first time...');
			svelteRuntimePromise = import('svelte');
		} else {
			console.log('🟦 Using cached Svelte runtime');
		}
		
		const importFn = svelteComponents[componentName];
		if (!importFn) {
			throw new Error(`Unknown Svelte component: ${componentName}`);
		}
		
		// Load Svelte runtime once and cache it
		const svelte = await svelteRuntimePromise;
		console.log('🟦 Svelte runtime loaded');
		
		// Load component
		const componentModule = await importFn();
		const Component = componentModule.default;
		
		console.log('🟦 Component imported:', Component);
		
		island.innerHTML = ''; // Clear placeholder
		
		// Mount component using Svelte 5 mount API
		const component = svelte.mount(Component, { 
			target: island,
			props: props
		});
		
		console.log(`🟦 ${componentName} mounted successfully`);
		return component;
		
	} catch (error) {
		console.error(`Failed to load Svelte component ${componentName}:`, error);
		island.innerHTML = `<div style="color: red; padding: 1rem;">Error: ${error.message}</div>`;
	}
});

console.log('🟩 Component loaders registered');
