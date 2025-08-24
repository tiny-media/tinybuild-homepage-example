import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";
import { eleventyVitePluginConfig } from "./src/_utilities/eleventyVitePluginConfig.js";

export default async function (eleventyConfig) {
	// Server Configuration
	eleventyConfig.setServerOptions({
		domDiff: true,
		port: 4321,
		watch: [],
		showAllHosts: false,
	});

	// Vite Plugin Configuration
	eleventyConfig.addPlugin(EleventyVitePlugin, {
		viteOptions: eleventyVitePluginConfig(),
	});

	// Static files to pass through
	// eleventyConfig.addPassthroughCopy("src/assets");

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
