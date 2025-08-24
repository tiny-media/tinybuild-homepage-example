// Main entry point for Vite processing
import "./styles/tokens.css";
import "@11ty/is-land/is-land.js";

console.log('🟩 Main bundle loaded - is-land initialized');

// Component registry for static analysis
const vanillaComponents = {
	'mobile-menu': () => import('/src/components/mobile-menu.js'),
	'search-toggle': () => import('/src/components/search-toggle.js')
};

const svelteComponents = {
	'counter': () => import('/src/islands/Counter.js'),
	'greeting': () => import('/src/islands/Greeting.js'),
	'statedemo': () => import('/src/islands/StateDemo.js')
};

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

// Svelte component loader  
Island.addInitType("svelte", async (island) => {
	const componentName = island.getAttribute("component");
	const propsAttr = island.getAttribute("props");
	const props = propsAttr ? JSON.parse(propsAttr) : {};
	
	console.log(`🟦 Loading Svelte component: ${componentName}`);
	
	try {
		const importFn = svelteComponents[componentName];
		if (!importFn) {
			throw new Error(`Unknown Svelte component: ${componentName}`);
		}
		const loader = await importFn();
		const mountComponent = await loader.default();
		
		island.innerHTML = ''; // Clear placeholder
		return mountComponent(island, props);
	} catch (error) {
		console.error(`Failed to load Svelte component ${componentName}:`, error);
	}
});

console.log('🟩 Component loaders registered');
