# CSS Architecture

CUBE CSS methodology with design tokens and modern CSS features.

## Structure

```
src/assets/css/
├── 0-reset/          # Modern CSS reset
├── 1-design-tokens/  # CSS custom properties
├── 2-composition/    # Layout patterns (stack, cluster, container)
├── 3-utilities/      # Single-purpose classes  
├── 4-blocks/         # Component styles
├── 5-exceptions/     # State variations and themes
└── main.css          # Import entry point
```

## Design Tokens

**Source**: `src/design-tokens/tokens.json`
```json
{
  "color": {
    "brand": {
      "primary": { "value": "oklch(65% 0.20 280)" }
    }
  },
  "spacing": {
    "scale": {
      "md": { "value": "1rem" }
    }
  }
}
```

**Generated**: `src/assets/css/1-design-tokens/tokens.css`
```css
:root {
  --color-brand-primary: oklch(65% 0.20 280);
  --spacing-md: 1rem;
}
```

## CUBE CSS Layers

**Composition** - Layout patterns:
```css
@layer composition {
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--stack-space, var(--spacing-md));
  }
  
  .cluster {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cluster-space, var(--spacing-sm));
  }
}
```

**Utilities** - Single-purpose classes:
```css
@layer utilities {
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
}
```

**Blocks** - Component styles:
```css
@layer blocks {
  .button {
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-brand-primary);
    border: none;
    border-radius: var(--border-radius-md);
  }
}
```

**Exceptions** - State variations:
```css
@layer exceptions {
  .button:hover {
    opacity: 0.9;
  }
  
  @media (prefers-reduced-motion: reduce) {
    .button {
      transition: none;
    }
  }
}
```

## Modern CSS Features

**Container Queries**:
```css
.card {
  container-type: inline-size;
}

@container (min-width: 300px) {
  .card {
    display: grid;
    grid-template-columns: auto 1fr;
  }
}
```

**Cascade Layers**:
```css
@layer reset, tokens, composition, utilities, blocks, exceptions;
```

**OKLCH Colors**:
```css
--color-primary: oklch(65% 0.20 280); /* Lightness, Chroma, Hue */
```

## Build Integration

**LightningCSS** (100x faster than PostCSS):
- Automatic browser compatibility
- Container queries and cascade layers support  
- OKLCH colors with fallbacks
- CSS nesting without preprocessors

**Import order** in `main.css`:
```css
@import "./0-reset/modern-reset.css";
@import "./1-design-tokens/tokens.css";
@import "./2-composition/stack.css";
/* etc */
```

## Component Integration

**Svelte components**:
```svelte
<div class="my-component">
  <p>Content</p>
</div>

<style>
  .my-component {
    padding: var(--spacing-md);
    background: var(--color-surface);
    container-type: inline-size;
  }
  
  @container (min-width: 300px) {
    .my-component {
      display: grid;
    }
  }
</style>
```

**VentoJS templates**:
```vento
<div class="container">
  <main class="stack">
    <nav class="cluster">
      {{ for item of navigation }}
        <a href="{{ item.url }}" class="button">{{ item.label }}</a>
      {{ /for }}
    </nav>
  </main>
</div>
```

## Adding New Styles

1. **Update tokens first**: `design-tokens/tokens.json`
2. **Choose layer**: composition/utilities/blocks/exceptions
3. **Use design tokens**: `var(--spacing-md)` not `1rem`
4. **Add container queries**: for responsive components
5. **Import in main.css**: maintain layer order