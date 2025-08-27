import { svelte } from "@sveltejs/vite-plugin-svelte";
import simpleHtml from "vite-plugin-simple-html";
import path from "node:path";
import { fileURLToPath } from "node:url";
import browserslist from 'browserslist';
import { browserslistToTargets, Features } from 'lightningcss';

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

    css: {
      // Use LightningCSS instead of PostCSS
      transformer: 'lightningcss',
      lightningcss: {
        // Browser targets from browserslist
        targets: browserslistToTargets(browserslist('>= 0.25%')),
        // Enable modern CSS features
        include: Features.Nesting | Features.CustomMediaQueries,
        // Enable draft features for cutting-edge CSS
        drafts: {
          customMedia: true,
          nesting: true
        },
        // Only minify CSS in production
        minify: process.env.NODE_ENV === 'production',
      },
      devSourcemap: true,
    },

    resolve: {
      alias: {
        '/src': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src'),
        '@styles': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src/assets/css'),
      }
    },

    server: {
      middlewareMode: true,
    },


    build: {
      emptyOutDir: true,
      cssCodeSplit: true, // Enable CSS code splitting
      // Production-only minification settings
      cssMinify: process.env.NODE_ENV === 'production' ? 'lightningcss' : false,
      minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false, // JS minification
      rollupOptions: {
        input: {
          main: "src/assets/main.js"
        },
        output: {
          manualChunks: {
            svelte: ['svelte'],
            // Separate chunk for design system CSS
            'design-system': ['@styles/main.css']
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