#!/usr/bin/env bun

const componentName = Bun.argv[2];
if (!componentName) {
	console.log("Usage: bun scripts/new-component.js ComponentName");
	process.exit(1);
}

const svelteTemplate = `<script>
    let { } = $props();

    let count = $state(0);
  </script>

  <div class="${componentName.toLowerCase()}-component">
    <h3>${componentName}</h3>
    <button onclick={() => count++}>
      Clicks: {count}
    </button>
  </div>

  <style>
    .${componentName.toLowerCase()}-component {
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  </style>`;

const jsTemplate = `// Dynamic loader for ${componentName} Svelte component
export default async function() {
  console.log('🟦 Loading Svelte runtime for ${componentName} component...');
  
  const [{ mount }, { default: ${componentName} }] = await Promise.all([
    import('svelte'),              // Cached after first Svelte component load
    import('./${componentName}.svelte')    // Component code
  ]);
  
  console.log('🟦 Svelte runtime loaded, mounting ${componentName} component');
  
  return (target, props = {}) => {
    return mount(${componentName}, { target, props });
  };
}`;

// Write files using Bun's native file system API
await Bun.write(`src/islands/${componentName}.svelte`, svelteTemplate);
await Bun.write(`src/islands/${componentName}.js`, jsTemplate);

console.log(`✅ Created ${componentName} component files`);
console.log(`\n📝 Next steps:`);
console.log(`\n1. Add to main.js:`);
console.log(
	`   import ${componentName.toLowerCase()}Init from "../islands/${componentName}.js";`,
);
console.log(`\n2. Register in the component registry:`);
console.log(
	`   ${componentName.toLowerCase()}: ${componentName.toLowerCase()}Init,`,
);
console.log(`\n3. Add to eleventy.config.js viteOptions.build.rollupOptions.input:`);
console.log(`   "${componentName.toLowerCase()}": "src/islands/${componentName}.js",`);
console.log(`\n4. Use in HTML:`);
console.log(`   <is-land on:visible type="svelte" component="${componentName.toLowerCase()}">...</is-land>`);
