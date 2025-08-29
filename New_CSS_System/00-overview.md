# Modern CSS Architecture Guide for 2025 (Production Edition)
## Token-First Architecture with Zero Flicker & Zero Layout Shift

---

## Executive Summary

A production-ready CSS architecture for solo developers that combines cutting-edge 2025 features with bulletproof progressive enhancement. This system uses native `light-dark()` for theme switching, `@scope` for component isolation, and includes all critical syntax fixes from comprehensive technical review.

**Design Language**: Earthy, sophisticated tones inspired by Claude.ai's aesthetic - warm grays, muted earth tones, and accent colors that are vibrant but refined.

---

## Core Architecture Principles

1. **Token-Driven Design**: All values reference tokens - no magic numbers
2. **CSS-First Philosophy**: Minimize JavaScript, leverage native CSS features
3. **Layer-Based Cascade**: Use `@layer` for predictable specificity
4. **Progressive Enhancement**: Core experience works everywhere, enhancements where supported
5. **Component Isolation**: Use `@scope` instead of CSS Modules

---

## File Structure

```
src/assets/css/
├── 0-critical/
│   ├── reset.css           # Modern CSS reset
│   └── theme-init.css      # Critical inline styles
├── 1-tokens/
│   ├── colors.css          # OKLCH with light-dark()
│   ├── spacing.css         # Fluid spacing scale
│   ├── typography.css      # Font system
│   └── motion.css          # Transitions & animations
├── 2-layout/
│   ├── containers.css      # Container queries
│   ├── grid.css           # Grid with subgrid
│   ├── flex.css           # Flexbox utilities
│   └── anchored.css       # Anchor positioning
├── 3-components/
│   ├── button.css         # Scoped components
│   ├── card.css
│   ├── navigation.css
│   ├── tooltip.css
│   └── dialog.css
├── 4-utilities/
│   └── utilities.css      # Single-purpose classes
├── 5-themes/
│   └── accessibility.css  # High contrast support
└── main.css              # Orchestration file
```

---

## Implementation Guide

### Step 1: Zero-Flicker Theme Setup

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Tells browser about theme support immediately -->
  <meta name="color-scheme" content="light dark">
  
  <!-- Minimal script for user preference only -->
  <script>
    const t = localStorage.getItem('theme');
    if (t) document.documentElement.dataset.theme = t;
  </script>
  
  <!-- Critical inline CSS -->
  <style>
    :root {
      color-scheme: light dark;
      --header-height: 64px;
      --container-max: 1200px;
    }
    
    /* Instant theme with native light-dark() */
    body {
      background: light-dark(#fdfcfa, #1a1816);
      color: light-dark(#3d3935, #e8e2da);
    }
    
    /* Layout stability */
    .header { min-height: var(--header-height); }
    .container { max-width: var(--container-max); margin: 0 auto; }
  </style>
  
  <!-- Your CSS files load here -->
</head>
```

### Step 2: Design Tokens - Claude.ai Inspired Colors

```css
@layer tokens {
  :root {
    color-scheme: light dark;
    
    /* Earthy, sophisticated color palette */
    /* Using warm grays and natural tones */
    
    /* Primary - Warm terra cotta */
    --color-primary: light-dark(
      oklch(62% 0.12 35),  /* Light: warm terracotta */
      oklch(68% 0.10 35)   /* Dark: softer terracotta */
    );
    
    /* Surface - Warm off-whites and deep browns */
    --color-surface: light-dark(
      oklch(97% 0.01 85),  /* Light: warm off-white */
      oklch(15% 0.01 85)   /* Dark: deep warm brown */
    );
    
    /* Surface elevated (cards, dialogs) */
    --color-surface-elevated: light-dark(
      oklch(99% 0.005 85), /* Light: brighter */
      oklch(20% 0.01 85)   /* Dark: slightly lifted */
    );
    
    /* Text - Balanced contrast, never pure black/white */
    --color-text: light-dark(
      oklch(25% 0.02 85),  /* Light: warm dark gray */
      oklch(88% 0.01 85)   /* Dark: warm light gray */
    );
    
    --color-text-secondary: light-dark(
      oklch(45% 0.02 85),  /* Light: medium gray */
      oklch(70% 0.01 85)   /* Dark: softer gray */
    );
    
    /* Borders - Subtle definition */
    --color-border: light-dark(
      oklch(90% 0.01 85),  /* Light: soft border */
      oklch(25% 0.01 85)   /* Dark: subtle border */
    );
    
    /* Accent colors - Vibrant but refined */
    --color-accent-green: light-dark(
      oklch(65% 0.15 145), /* Light: forest green */
      oklch(70% 0.12 145)  /* Dark: sage green */
    );
    
    --color-accent-blue: light-dark(
      oklch(60% 0.12 240), /* Light: muted blue */
      oklch(65% 0.10 240)  /* Dark: soft blue */
    );
    
    --color-accent-amber: light-dark(
      oklch(70% 0.15 80),  /* Light: warm amber */
      oklch(75% 0.12 80)   /* Dark: golden amber */
    );
    
    /* Semantic colors */
    --color-success: var(--color-accent-green);
    --color-warning: var(--color-accent-amber);
    --color-error: light-dark(
      oklch(58% 0.18 25),  /* Light: muted red */
      oklch(65% 0.15 25)   /* Dark: soft coral */
    );
  }
  
  /* User preference overrides */
  [data-theme="light"] { color-scheme: light; }
  [data-theme="dark"] { color-scheme: dark; }
  
  /* Fallback for older browsers */
  @supports not (color: light-dark(white, black)) {
    :root {
      --color-primary: oklch(62% 0.12 35);
      --color-surface: oklch(97% 0.01 85);
      --color-text: oklch(25% 0.02 85);
    }
    
    @media (prefers-color-scheme: dark) {
      :root {
        --color-primary: oklch(68% 0.10 35);
        --color-surface: oklch(15% 0.01 85);
        --color-text: oklch(88% 0.01 85);
      }
    }
  }
}
```

### Step 3: Spacing & Typography

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
    
    /* Typography - Clean, readable */
    --font-sans: system-ui, -apple-system, sans-serif;
    --font-mono: ui-monospace, monospace;
    
    --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
    --text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
    --text-base: clamp(1rem, 0.925rem + 0.375vw, 1.125rem);
    --text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
    --text-xl: clamp(1.25rem, 1.125rem + 0.625vw, 1.5rem);
    --text-2xl: clamp(1.5rem, 1.25rem + 1.25vw, 2rem);
    --text-3xl: clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem);
    
    /* Line heights */
    --leading-tight: 1.25;
    --leading-normal: 1.5;
    --leading-relaxed: 1.75;
  }
}
```

### Step 4: Anchor Positioning (Corrected Syntax)

```css
@layer layout {
  @supports (anchor-name: --anchor) {
    /* Define anchors - MUST have anchor-name */
    .anchor-trigger {
      anchor-name: --trigger;
    }
    
    .dropdown-trigger {
      anchor-name: --dropdown-trigger;
    }
    
    /* Positioned elements */
    .tooltip {
      position: absolute;
      position-anchor: --trigger;
      position-area: top;
      /* Use shorthand position-try, not position-try-fallbacks */
      position-try: bottom, left, right;
      
      padding: var(--space-xs) var(--space-sm);
      background: var(--color-surface-elevated);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      box-shadow: 0 2px 8px oklch(0% 0 0 / 0.08);
    }
    
    .dropdown-menu {
      position: fixed;
      position-anchor: --dropdown-trigger;
      position-area: bottom center;
      /* Correct shorthand syntax */
      position-try: most-height, top center;
      
      min-width: 200px;
      background: var(--color-surface-elevated);
      border: 1px solid var(--color-border);
      border-radius: 8px;
    }
    
    /* Custom position try options */
    @position-try --top-scroll {
      position-area: top;
      max-height: 50vh;
      overflow-y: auto;
    }
    
    /* Guard experimental features */
    @supports (position-visibility: anchors-visible) {
      .tooltip {
        position-visibility: anchors-visible;
      }
      .dropdown-menu {
        position-visibility: no-overflow;
      }
    }
  }
  
  /* Fallback for non-supporting browsers */
  @supports not (anchor-name: --anchor) {
    .tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: var(--space-xs);
    }
    
    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: var(--space-xs);
    }
  }
}
```

### Step 5: Component Patterns with @scope

```css
@layer components {
  /* Use @scope for isolation - NO CSS Modules needed */
  @scope (.card) {
    :scope {
      container: card / inline-size;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: var(--space-md);
      /* Subtle shadow for depth */
      box-shadow: 0 1px 3px oklch(0% 0 0 / 0.04);
    }
    
    .title {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--color-text);
      text-wrap: balance;
      margin-block-end: var(--space-sm);
    }
    
    .content {
      color: var(--color-text-secondary);
      line-height: var(--leading-normal);
    }
    
    /* Container query for responsive layout */
    @container card (width > 400px) {
      :scope {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: var(--space-lg);
      }
    }
  }
  
  @scope (.button) {
    :scope {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-xs) var(--space-md);
      background: var(--color-primary);
      color: var(--color-surface);
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    :scope:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px oklch(from var(--color-primary) l c h / 0.2);
    }
    
    :scope:active {
      transform: translateY(0);
    }
  }
}
```

### Step 6: Animations (Fixed - No 'overlay' Property)

```css
@layer utilities {
  /* Entry animations with @starting-style */
  .fade-in {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.3s, transform 0.3s;
    
    @starting-style {
      opacity: 0;
      transform: translateY(20px);
    }
  }
  
  /* Dialog/popover animations - FIXED */
  dialog, [popover] {
    opacity: 1;
    transform: scale(1);
    transition:
      opacity 0.3s,
      transform 0.3s,
      /* Only real properties with allow-discrete */
      display 0.3s allow-discrete,
      content-visibility 0.3s allow-discrete;
      /* NO 'overlay' - it doesn't exist */
    
    @starting-style {
      opacity: 0;
      transform: scale(0.95);
    }
  }
  
  /* Scroll-driven animations */
  @supports (animation-timeline: scroll()) {
    .scroll-reveal {
      animation: reveal linear;
      animation-timeline: view();
      animation-range: entry 0% entry 100%;
    }
    
    @keyframes reveal {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
}
```

### Step 7: Layout Utilities

```css
@layer layout {
  .container {
    --padding: var(--space-md);
    width: 100%;
    max-width: var(--container-max, 1200px);
    margin-inline: auto;
    padding-inline: var(--padding);
    container-type: inline-size;
  }
  
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--stack-gap, var(--space-md));
  }
  
  .cluster {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cluster-gap, var(--space-sm));
    align-items: center;
  }
  
  /* Subgrid support with fallback */
  @supports (grid-template-columns: subgrid) {
    .grid-item {
      display: grid;
      grid-template-columns: subgrid;
    }
  }
}
```

### Step 8: Performance & Accessibility

```css
@layer utilities {
  /* Defensive aspect-ratio with typed attr() */
  img, video {
    /* Safe fallback */
    aspect-ratio: 16 / 9;
    width: 100%;
    height: auto;
  }
  
  /* Progressive enhancement only */
  @supports (aspect-ratio: attr(width number) / attr(height number)) {
    img[width][height] {
      aspect-ratio: attr(width number) / attr(height number);
    }
  }
  
  /* Shallow :has() selectors for performance */
  .form:has(input:invalid) {
    border-color: var(--color-error);
  }
  /* Avoid deep :has() chains */
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  
  /* High contrast support */
  @media (prefers-contrast: high) {
    :root {
      --color-text: CanvasText;
      --color-surface: Canvas;
    }
  }
  
  /* Reduced transparency */
  @media (prefers-reduced-transparency: reduce) {
    .glass {
      backdrop-filter: none;
      background: var(--color-surface);
    }
  }
}
```

### Step 9: Build Configuration (Final)

```javascript
import { defineConfig } from 'vite';
import browserslist from 'browserslist';
import { browserslistToTargets, Features } from 'lightningcss';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../_site',
    cssMinify: 'lightningcss',
    cssCodeSplit: false, // Single CSS file
    assetsInlineLimit: 10240 // Inline small assets
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
      }
      // NO cssModules - using @scope instead
    }
  }
});
```

### Step 10: Main CSS Orchestration

```css
/* main.css */
@layer reset, tokens, layout, components, utilities, themes;

@import "0-critical/reset.css" layer(reset);
@import "1-tokens/colors.css" layer(tokens);
@import "1-tokens/spacing.css" layer(tokens);
@import "1-tokens/typography.css" layer(tokens);
@import "1-tokens/motion.css" layer(tokens);
@import "2-layout/containers.css" layer(layout);
@import "2-layout/flex.css" layer(layout);
@import "2-layout/grid.css" layer(layout);
@import "2-layout/anchored.css" layer(layout);
@import "3-components/button.css" layer(components);
@import "3-components/card.css" layer(components);
@import "3-components/tooltip.css" layer(components);
@import "3-components/dialog.css" layer(components);
@import "4-utilities/utilities.css" layer(utilities);
@import "5-themes/accessibility.css" layer(themes);
```

---

## Simple Theme Switcher

```javascript
// Minimal theme manager
class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'auto';
    this.init();
  }
  
  init() {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => this.cycle());
    });
  }
  
  cycle() {
    const themes = ['light', 'dark', 'auto'];
    const current = themes.indexOf(this.theme);
    this.theme = themes[(current + 1) % themes.length];
    
    if (this.theme === 'auto') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    } else {
      document.documentElement.dataset.theme = this.theme;
      localStorage.setItem('theme', this.theme);
    }
  }
}

// Initialize
new ThemeManager();
```

---

## Quick Reference: What Changed

### Critical Fixes Applied
- ✅ Removed non-existent `overlay` from transitions
- ✅ Added missing `anchor-name` declarations
- ✅ Used correct `position-try` shorthand (not `position-try-fallbacks`)
- ✅ Wrapped typed `attr()` in `@supports`
- ✅ Guarded `position-visibility` with `@supports`
- ✅ No CSS Modules - using `@scope` instead

### Design System Applied
- ✅ Earthy, warm color palette inspired by Claude.ai
- ✅ Sophisticated tones - never pure black/white
- ✅ Refined accent colors - vibrant but not candy-colored
- ✅ Subtle shadows and borders for depth
- ✅ Balanced contrast for comfortable reading

---

## Component Starter Template

```css
/* Copy-paste starter for new components */
@scope (.new-component) {
  :scope {
    container: component / inline-size;
    background: var(--color-surface);
    padding: var(--space-md);
    border-radius: 8px;
  }
  
  @container component (width > 400px) {
    :scope {
      /* Responsive changes */
    }
  }
}
```

---

## Browser Support Strategy

### Tier 1: Full Experience (90%+ browsers)
- OKLCH colors, Container queries, Cascade layers
- CSS nesting, `light-dark()` function, `:has()` selector

### Tier 2: Enhanced (Chrome/Edge/Safari latest)
- Anchor positioning, `@scope`, Scroll-driven animations
- `@starting-style`, View Transitions

### Tier 3: Baseline (100% browsers)
- CSS custom properties, Flexbox/Grid
- Standard transitions, Media queries

---

## Implementation Checklist

1. **Immediate**
   - [ ] Copy HTML head template
   - [ ] Set up color tokens with `light-dark()`
   - [ ] Configure Vite with LightningCSS

2. **Foundation**
   - [ ] Create file structure
   - [ ] Import cascade layers in main.css
   - [ ] Build first component with `@scope`

3. **Progressive**
   - [ ] Add anchor positioning for tooltips
   - [ ] Implement scroll animations
   - [ ] Test in multiple browsers

4. **Polish**
   - [ ] Validate accessibility
   - [ ] Optimize performance
   - [ ] Document patterns

---

## Summary

This production-ready CSS architecture combines:
- **Zero flicker** through native `light-dark()` and minimal JavaScript
- **Zero layout shift** via defensive CSS and proper dimensions
- **Modern 2025 features** with complete progressive enhancement
- **Claude.ai aesthetic** with warm, sophisticated earth tones
- **All critical fixes** from technical review incorporated

The system is optimized for solo development - simple enough to maintain alone, sophisticated enough for production applications.