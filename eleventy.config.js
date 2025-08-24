import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default async function (eleventyConfig) {
	eleventyConfig.setServerOptions({
		domDiff: true,
		port: 4321,
		watch: [],
		showAllHosts: false,
	});

	eleventyConfig.addPlugin(EleventyVitePlugin, {
		tempFolderName: ".11ty-vite", // Default name of the temp folder

		// Options passed to the Eleventy Dev Server
		// Defaults
		serverOptions: {
			module: "@11ty/eleventy-dev-server",
			domDiff: false,
		},

		// Defaults
		viteOptions: {
			clearScreen: false,
			appType: "mpa",
			plugins: [svelte()],

			server: {
				middlewareMode: true,
			},

			build: {
				emptyOutDir: true,
			},
		},
	});

	// Static files to pass through
	eleventyConfig.addPassthroughCopy("src/assets");
	eleventyConfig.addPassthroughCopy("src/islands");

	eleventyConfig.setServerPassthroughCopyBehavior("copy");

	// Watch Targets

	return {
		dir: {
			input: "src",
			includes: "_includes",
			data: "_data",
			output: "_site",
		},
	};
}
