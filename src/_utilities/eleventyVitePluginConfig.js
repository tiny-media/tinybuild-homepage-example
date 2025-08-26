import { svelte } from "@sveltejs/vite-plugin-svelte";
import simpleHtml from "vite-plugin-simple-html";
import path from "node:path";
import { fileURLToPath } from "url";

export function eleventyVitePluginConfig() {
  return {
    clearScreen: false,
    appType: "mpa",
    plugins: [
      svelte(),
      // HTML minification only in production
      ...(process.env.NODE_ENV === 'production' ? [
        simpleHtml({
          minify: {
            collapseWhitespaces: 'all',        // Maximum whitespace removal
            minifyCss: true,                   // Minify inline CSS
            minifyJs: false,                   // Let Vite handle JS minification
            minifyJson: true,                  // Minify JSON in HTML
            quotes: true,                      // Optimize quote usage
            removeComments: true,              // Remove HTML comments
            removeEmptyAttributes: true,       // Remove empty attributes
            removeRedundantAttributes: 'all',  // Remove redundant attributes
            tagOmission: false                 // Keep closing tags for is-land compatibility
          }
        })
      ] : [])
    ],

    resolve: {
      alias: {
        '/src': path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../')
      }
    },

    server: {
      middlewareMode: true,
    },


    build: {
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: "src/assets/main.js"
        },
        output: {
          manualChunks: {
            // Shared Svelte runtime chunk
            svelte: ['svelte']
          }
        },
      }
    },

    // Ensure Svelte runtime is properly split in dev mode too
    optimizeDeps: {
      include: ['svelte']
    },
  };
}