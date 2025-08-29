import browserslist from 'browserslist';
import { browserslistToTargets, Features } from 'lightningcss';
import { svelte } from "@sveltejs/vite-plugin-svelte";
import simpleHtml from "vite-plugin-simple-html";
import path from "node:path";
import { fileURLToPath } from "node:url";


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
        '/src': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src'),
      }
    },

    server: {
      middlewareMode: true,
    },

    build: {
      emptyOutDir: true,
      // Production-only minification settings
      minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false, // JS minification
      cssMinify: 'lightningcss',
      cssCodeSplit: false, // Single CSS file
      assetsInlineLimit: 10240, // Inline small assets
      rollupOptions: {
        input: {
          main: "src/assets/main.js"
        },
        output: {
          manualChunks: {
            svelte: ['svelte']
          }
        },
      }
    },
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        targets: browserslistToTargets(
          browserslist('defaults and supports es6-module')
        ),
        include:
          Features.Nesting |
          Features.CustomMediaQueries |
          Features.LightDark |
          Features.ContainerQueries |
          Features.Has |
          Features.LogicalProperties,
        drafts: {
          nesting: true,
          customMedia: true
        },
        // NO cssModules - using @scope instead
      }
    },

    // Ensure Svelte runtime is properly split in dev mode too
    optimizeDeps: {
      include: ['svelte']
    },
  };
}