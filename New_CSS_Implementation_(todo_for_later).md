Now we use pico classless as a starting point and that works well!

If i want to have a new css system here are strategies provided by claude opus 4.1

I'll analyze current CSS best practices and create a comprehensive solution for your specific requirements.Now I'll analyze the current CSS best practices and create a comprehensive solution tailored to your specific requirements. Based on my research and analysis, I'll recommend a custom CSS architecture that addresses all your priorities.I've created a comprehensive CSS architecture guide tailored specifically to your requirements. This Token-First Architecture addresses all eight of your priorities:

**Key Solutions:**

1. **No Theme Flicker**: Inline blocking script in `<head>` that runs before any rendering, setting theme from localStorage or system preference immediately.

2. **No Layout Shift**: Critical dimensions inlined, aspect ratios for media, skeleton screens for async content, and proper font metrics.

3. **Clear Structure**: Organized by layers (reset → tokens → layout → components → utilities → themes) with CSS cascade layers for specificity control.

4. **Documentation**: Each file has a single purpose, self-documenting through structure and naming.

5. **Project Portability**: Just copy the CSS folder and change token values (colors, spacing, fonts) for new projects.

6. **View Transitions**: Native View Transitions API support with smooth page transitions.

7. **Build Integration**: Complete 11ty + Vite + LightningCSS setup with automatic optimization.

8. **Minified Output**: LightningCSS handles minification, prefixing, and modern CSS transpilation.

**Why This Over Other Approaches:**

- **Simpler than CUBE CSS**: Less conceptual overhead, more straightforward organization
- **More maintainable than Tailwind**: Actual CSS you can read and understand, not utility class soup
- **Better than vanilla CSS**: Structured, scalable, with modern tooling
- **No framework lock-in**: Pure CSS that works anywhere

The architecture uses modern 2025 CSS features like OKLCH colors (better than HSL for consistent lightness), container queries (components respond to their container, not viewport), and cascade layers (solve specificity issues permanently).

The critical innovation is the theme flicker prevention through an inline blocking script that executes before any rendering occurs, combined with CSS custom properties that update instantly. This completely eliminates the flash of incorrect theme that plagues most dark mode implementations.

Ready to implement this? Start with the inline theme script and critical CSS - those give immediate benefits. Then migrate your components gradually to the new structure.

---

## MAIN DOCUMENT

# Modern CSS Architecture Guide for 2025
## Custom Token-First Architecture with Zero Flicker & Zero Layout Shift

---

## Executive Summary

Based on your requirements and 2025 CSS best practices, I recommend a **Token-First CSS Architecture** that's simpler than CUBE CSS but more maintainable than utility-first approaches. This system prioritizes:

1. **Zero theme flicker** via inline blocking scripts
2. **Zero layout shift** through proper sizing and loading strategies  
3. **Modern CSS features** (OKLCH colors, container queries, cascade layers, view transitions)
4. **Clear maintainability** with organized file structure
5. **Easy portability** across projects

---

## Core Architecture Principles

### 1. Token-Driven Design
All values come from design tokens (colors, spacing, typography). No magic numbers, everything references tokens.

### 2. Layer-Based Cascade Control
Use CSS cascade layers (`@layer`) for predictable specificity and override order.

### 3. Progressive Enhancement
Start with CSS that works everywhere, enhance with modern features where supported.

### 4. Component Isolation
Components are self-contained and don't leak styles, using container queries for responsive behavior.

---

## File Structure

```
src/assets/css/
├── 0-critical/
│   ├── reset.css           # Modern CSS reset
│   └── theme-init.css      # Critical theme variables
├── 1-tokens/
│   ├── colors.css          # OKLCH color system
│   ├── spacing.css         # Spacing scale
│   ├── typography.css      # Font system
│   ├── transitions.css     # Motion tokens
│   └── breakpoints.css     # Container query breakpoints
├── 2-layout/
│   ├── containers.css      # Layout containers
│   ├── grid.css           # Grid utilities
│   └── flex.css           # Flexbox utilities
├── 3-components/
│   ├── button.css         # Component styles
│   ├── card.css
│   └── navigation.css
├── 4-utilities/
│   └── utilities.css      # Single-purpose classes
├── 5-themes/
│   ├── light.css         # Light theme overrides
│   └── dark.css          # Dark theme overrides
└── main.css              # Orchestration file
```

---

## Implementation Guide

### Step 1: Preventing Theme Flicker (Critical Inline Script)

Place this inline script in your `<head>` BEFORE any CSS:

```html
<!-- In your 11ty base layout (e.g., _includes/base.njk) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Theme initialization - MUST be first, blocks render -->
  <script>
    (function() {
      // Get stored preference or check system preference
      const stored = localStorage.getItem('theme');
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const theme = stored || 'auto';
      
      // Apply theme immediately
      if (theme === 'auto') {
        document.documentElement.setAttribute('data-theme', systemTheme);
        document.documentElement.classList.add('theme-auto');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.classList.add(`theme-${theme}`);
      }
      
      // Set color-scheme for browser UI
      document.documentElement.style.colorScheme = theme === 'auto' ? systemTheme : theme;
    })();
  </script>
  
  <!-- Critical CSS for layout shift prevention -->
  <style>
    /* Prevent layout shift - inline critical dimensions */
    :root {
      --header-height: 64px;
      --container-max: 1200px;
    }
    
    .header {
      min-height: var(--header-height);
    }
    
    .container {
      max-width: var(--container-max);
      margin: 0 auto;
    }
    
    /* Hide content until fonts load */
    .fonts-loading {
      visibility: hidden;
    }
  </style>
  
  <!-- Rest of your head content -->
</head>
```

### Step 2: Token System Implementation

#### `1-tokens/colors.css` - Modern OKLCH Color System
```css
@layer tokens {
  :root {
    /* Brand color configuration */
    --brand-hue: 250;
    --brand-chroma: 0.15;
    
    /* Light theme (default) */
    --color-primary: oklch(65% var(--brand-chroma) var(--brand-hue));
    --color-surface: oklch(98% 0.01 var(--brand-hue));
    --color-text: oklch(20% 0.02 var(--brand-hue));
    --color-border: oklch(88% 0.02 var(--brand-hue));
    
    /* Semantic colors */
    --color-success: oklch(65% 0.15 145);
    --color-warning: oklch(75% 0.15 60);
    --color-error: oklch(65% 0.2 25);
  }
  
  /* Dark theme overrides */
  [data-theme="dark"] {
    --color-primary: oklch(70% var(--brand-chroma) var(--brand-hue));
    --color-surface: oklch(12% 0.01 var(--brand-hue));
    --color-text: oklch(90% 0.02 var(--brand-hue));
    --color-border: oklch(25% 0.02 var(--brand-hue));
  }
  
  /* System preference support */
  @media (prefers-color-scheme: dark) {
    .theme-auto {
      --color-primary: oklch(70% var(--brand-chroma) var(--brand-hue));
      --color-surface: oklch(12% 0.01 var(--brand-hue));
      --color-text: oklch(90% 0.02 var(--brand-hue));
      --color-border: oklch(25% 0.02 var(--brand-hue));
    }
  }
}
```

#### `1-tokens/spacing.css` - Consistent Spacing Scale
```css
@layer tokens {
  :root {
    /* Fluid spacing scale */
    --space-3xs: clamp(0.25rem, 0.23rem + 0.1vw, 0.3125rem);
    --space-2xs: clamp(0.5rem, 0.46rem + 0.2vw, 0.625rem);
    --space-xs: clamp(0.75rem, 0.69rem + 0.3vw, 0.9375rem);
    --space-sm: clamp(1rem, 0.92rem + 0.4vw, 1.25rem);
    --space-md: clamp(1.5rem, 1.38rem + 0.6vw, 1.875rem);
    --space-lg: clamp(2rem, 1.84rem + 0.8vw, 2.5rem);
    --space-xl: clamp(3rem, 2.77rem + 1.2vw, 3.75rem);
    --space-2xl: clamp(4rem, 3.69rem + 1.6vw, 5rem);
    --space-3xl: clamp(6rem, 5.54rem + 2.4vw, 7.5rem);
  }
}
```

### Step 3: Layout Primitives (Preventing Layout Shift)

#### `2-layout/containers.css` - Container Queries & Stable Layouts
```css
@layer layout {
  .container {
    --padding: var(--space-md);
    width: 100%;
    max-width: var(--container-max, 1200px);
    margin-inline: auto;
    padding-inline: var(--padding);
    
    /* Enable container queries */
    container-type: inline-size;
    container-name: main;
  }
  
  /* Container query responsive adjustments */
  @container main (min-width: 768px) {
    .container {
      --padding: var(--space-lg);
    }
  }
  
  /* Prevent layout shift with aspect ratios */
  .aspect-video {
    aspect-ratio: 16 / 9;
  }
  
  .aspect-square {
    aspect-ratio: 1;
  }
  
  /* Skeleton screens for async content */
  .skeleton {
    background: linear-gradient(
      90deg,
      var(--color-border) 25%,
      var(--color-surface) 50%,
      var(--color-border) 75%
    );
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }
  
  @keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
}
```

#### `2-layout/flex.css` - Flexible Layout Utilities
```css
@layer layout {
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--stack-gap, var(--space-md));
  }
  
  .cluster {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cluster-gap, var(--space-sm));
    align-items: var(--cluster-align, center);
  }
  
  .sidebar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-md);
  }
  
  .sidebar > :first-child {
    flex-basis: var(--sidebar-width, 300px);
    flex-grow: 1;
  }
  
  .sidebar > :last-child {
    flex-basis: 0;
    flex-grow: 999;
    min-inline-size: var(--sidebar-content-min, 50%);
  }
}
```

### Step 4: View Transitions API Support

#### `1-tokens/transitions.css` - Modern View Transitions
```css
@layer tokens {
  /* Enable view transitions */
  @view-transition {
    navigation: auto;
  }
  
  /* Define persistent elements */
  .page-header {
    view-transition-name: header;
  }
  
  .page-title {
    view-transition-name: page-title;
  }
  
  .main-content {
    view-transition-name: main;
  }
  
  /* Customize transition animations */
  ::view-transition-old(main),
  ::view-transition-new(main) {
    animation-duration: 0.3s;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* Reduce motion support */
  @media (prefers-reduced-motion: reduce) {
    ::view-transition-group(*),
    ::view-transition-old(*),
    ::view-transition-new(*) {
      animation: none !important;
    }
  }
}
```

### Step 5: Build Integration

#### 11ty + Vite + LightningCSS Configuration

**`.eleventy.js`** - 11ty Configuration
```javascript
const eleventyVitePlugin = require("@11ty/eleventy-plugin-vite");

module.exports = function(eleventyConfig) {
  // Add Vite plugin
  eleventyConfig.addPlugin(eleventyVitePlugin, {
    tempFolderName: ".11ty-vite",
    viteOptions: {
      // Vite config will be in separate file
      configFile: "vite.config.js"
    }
  });
  
  // Watch CSS files
  eleventyConfig.addWatchTarget("./src/assets/css/**/*.css");
  
  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
```

**`vite.config.js`** - Vite with LightningCSS
```javascript
import { defineConfig } from 'vite';
import browserslist from 'browserslist';
import { browserslistToTargets, Features } from 'lightningcss';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../_site',
    cssMinify: 'lightningcss'
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: browserslistToTargets(browserslist('>= 0.25%')),
      include: Features.Nesting | Features.CustomMediaQueries | Features.LightDark,
      drafts: {
        nesting: true
      }
    }
  }
});
```

### Step 6: Main CSS Orchestration

#### `main.css` - Layer Order & Imports
```css
/* Define cascade layers in priority order */
@layer reset, tokens, layout, components, utilities, themes;

/* Import all CSS modules */
@import "0-critical/reset.css" layer(reset);
@import "1-tokens/colors.css" layer(tokens);
@import "1-tokens/spacing.css" layer(tokens);
@import "1-tokens/typography.css" layer(tokens);
@import "1-tokens/transitions.css" layer(tokens);
@import "2-layout/containers.css" layer(layout);
@import "2-layout/flex.css" layer(layout);
@import "2-layout/grid.css" layer(layout);
@import "3-components/button.css" layer(components);
@import "3-components/card.css" layer(components);
@import "4-utilities/utilities.css" layer(utilities);
@import "5-themes/light.css" layer(themes);
@import "5-themes/dark.css" layer(themes);
```

---

## Theme Switcher Implementation (No Flicker)

```javascript
// theme-switcher.js - Progressively enhanced theme switcher
class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'auto';
    this.init();
  }
  
  init() {
    // Set up theme toggle buttons
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => this.toggleTheme());
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.theme === 'auto') {
        this.applyTheme('auto');
      }
    });
  }
  
  toggleTheme() {
    const themes = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(this.theme);
    this.theme = themes[(currentIndex + 1) % themes.length];
    
    this.applyTheme(this.theme);
    localStorage.setItem('theme', this.theme);
  }
  
  applyTheme(theme) {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    // Remove all theme classes
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-auto');
    
    if (theme === 'auto') {
      document.documentElement.setAttribute('data-theme', systemTheme);
      document.documentElement.classList.add('theme-auto');
      document.documentElement.style.colorScheme = systemTheme;
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.classList.add(`theme-${theme}`);
      document.documentElement.style.colorScheme = theme;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ThemeManager());
} else {
  new ThemeManager();
}
```

---

## Project Portability Guide

### Making This System Reusable

1. **Extract Core Files**
   ```bash
   # Create a CSS starter template
   mkdir my-css-starter
   cp -r src/assets/css/* my-css-starter/
   cp vite.config.js my-css-starter/
   ```

2. **Customize Tokens Per Project**
   ```css
   /* Just change these values in 1-tokens/colors.css */
   :root {
     --brand-hue: 280;  /* Change to your brand color */
     --brand-chroma: 0.2;  /* Adjust saturation */
   }
   ```

3. **Add to New Project**
   ```bash
   # Copy to new project
   cp -r my-css-starter/* new-project/src/assets/css/
   
   # Install dependencies
   npm install -D vite lightningcss browserslist
   
   # Start building
   ```

---

## Component Example

### Modern Component with Container Queries
```css
/* 3-components/card.css */
@layer components {
  .card {
    container: card / inline-size;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: var(--space-md);
  }
  
  .card__title {
    font-size: clamp(1.25rem, 2vw + 1rem, 1.75rem);
    margin-block-end: var(--space-sm);
    text-wrap: balance; /* Prevent orphaned words */
  }
  
  /* Container query responsive design */
  @container card (min-width: 400px) {
    .card {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: var(--space-lg);
    }
  }
  
  /* Dark mode with OKLCH */
  [data-theme="dark"] .card {
    background: oklch(from var(--color-surface) l c h / 0.05);
    backdrop-filter: blur(10px);
  }
}
```

---

## Performance Optimizations

### 1. Font Loading Strategy (No Layout Shift)
```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>

<!-- Font loading CSS -->
<style>
  @font-face {
    font-family: 'Inter';
    src: url('/fonts/inter-var.woff2') format('woff2-variations');
    font-weight: 100 900;
    font-display: swap;
    size-adjust: 100%; /* Prevent layout shift */
    ascent-override: 95%;
    descent-override: 25%;
    line-gap-override: 0%;
  }
</style>
```

### 2. Critical CSS Inlining
```javascript
// 11ty critical CSS plugin
eleventyConfig.addTransform("critical-css", async (content, outputPath) => {
  if (outputPath && outputPath.endsWith(".html")) {
    // Inline critical CSS for above-the-fold content
    const critical = await getCriticalCSS(content);
    return content.replace('</head>', `<style>${critical}</style></head>`);
  }
  return content;
});
```

---

## Advantages of This System

### ✅ No Theme Flicker
- Inline blocking script sets theme before render
- CSS variables update instantly
- System preference detection works immediately

### ✅ No Layout Shift
- Critical dimensions inline in HTML
- Container queries prevent reflow
- Aspect ratios maintain space
- Font metrics prevent text shift

### ✅ Maintainable Structure
- Clear file organization by purpose
- Cascade layers prevent specificity wars
- Token-first approach for consistency
- Self-documenting component structure

### ✅ Easy Documentation
- Each file has single responsibility
- Tokens are self-explanatory
- Components follow consistent patterns
- Clear naming conventions

### ✅ Project Portability
- Change tokens, keep structure
- Copy folder to new project
- Minimal configuration needed
- Works with any build tool

### ✅ Modern CSS Features
- OKLCH for better color manipulation
- Container queries for true component responsiveness  
- View transitions for smooth navigation
- Cascade layers for specificity control

### ✅ Build Integration
- LightningCSS for modern CSS transpilation
- Automatic vendor prefixing
- CSS minification built-in
- Future CSS features today

---

## Migration Checklist

### From Your Current System

1. **Backup Current CSS**
   ```bash
   mv src/assets/css src/assets/css-backup
   ```

2. **Create New Structure**
   ```bash
   mkdir -p src/assets/css/{0-critical,1-tokens,2-layout,3-components,4-utilities,5-themes}
   ```

3. **Add Inline Theme Script** (in base layout)

4. **Create Token Files** (colors, spacing, typography)

5. **Build Core Components** (start with most used)

6. **Configure Build Tools** (Vite + LightningCSS)

7. **Test Theme Switching** (verify no flicker)

8. **Optimize Performance** (critical CSS, font loading)

---

## Troubleshooting Guide

### Issue: Theme Still Flickers
**Solution**: Ensure inline script is FIRST in `<head>`, before any CSS links.

### Issue: Layout Shift on Load
**Solution**: Add critical dimensions inline, use aspect-ratios, implement skeleton screens.

### Issue: Build Not Processing CSS
**Solution**: Check Vite config, ensure LightningCSS is installed, verify import paths.

### Issue: Container Queries Not Working
**Solution**: Add `container-type: inline-size` to parent, check browser support.

### Issue: Cascade Layers Conflicting
**Solution**: Define layer order explicitly at top of main.css.

---

## Resources & References

- [LightningCSS Documentation](https://lightningcss.dev/docs.html)
- [Container Queries Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)
- [OKLCH Color Space](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch)
- [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [CSS Cascade Layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)

---

## Summary

This Token-First CSS Architecture provides a production-ready, maintainable, and modern CSS system that:

1. **Eliminates theme flicker** through inline blocking scripts
2. **Prevents layout shift** with proper sizing strategies
3. **Stays maintainable** through clear organization and cascade layers
4. **Documents itself** through semantic naming and structure
5. **Ports easily** between projects with token customization
6. **Embraces modern CSS** with 2025 best practices
7. **Integrates smoothly** with 11ty + Vite + LightningCSS
8. **Delivers minified CSS** automatically through build pipeline

The system is simpler than CUBE CSS, more maintainable than utility-first approaches, and perfect for a solo developer who values clarity and modern standards.