import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "node:path";
import { fileURLToPath } from "url";

export function eleventyVitePluginConfig() {
  return {
    clearScreen: false,
    appType: "mpa",
    plugins: [svelte()],

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