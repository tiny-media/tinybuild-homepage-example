import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";
import { VentoPlugin } from "eleventy-plugin-vento";
import EleventyNavigationPlugin from "@11ty/eleventy-navigation";
import { eleventyVitePluginConfig } from "./eleventyVitePluginConfig.js";

export default async function (eleventyConfig) {
	// Server Configuration
	eleventyConfig.setServerOptions({
		domDiff: true,
		port: 4321,
		watch: [],
		showAllHosts: false,
	});

	// Navigation Plugin Configuration
	eleventyConfig.addPlugin(EleventyNavigationPlugin);

	// VentoJS Plugin Configuration
	eleventyConfig.addPlugin(VentoPlugin, {
		shortcodes: true,
		pairedShortcodes: true,
		filters: true,
		autotrim: false,
		ventoOptions: {
			includes: "src/_includes",
		},
	});

	// Vite Plugin Configuration
	eleventyConfig.addPlugin(EleventyVitePlugin, {
		viteOptions: eleventyVitePluginConfig(),
	});

	// Static files to pass through
	eleventyConfig.addPassthroughCopy("src/assets");


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
