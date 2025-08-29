## Step 2: Create the Token System

Now let's create the proper token files. Create these files:

**`src/assets/css/1-tokens/colors.css`:**

```css
@layer tokens {
  :root {
    /* Enable native theme switching */
    color-scheme: light dark;
    
    /* Brand hues - earthy, sophisticated */
    --hue-warm: 35;   /* Terra cotta */
    --hue-neutral: 85; /* Warm gray */
    --hue-green: 145;  /* Forest */
    --hue-blue: 240;   /* Muted blue */
    --hue-amber: 80;   /* Golden */
    
    /* Primary colors */
    --color-primary: light-dark(
      oklch(62% 0.12 var(--hue-warm)),
      oklch(68% 0.10 var(--hue-warm))
    );
    
    /* Surface hierarchy */
    --color-surface: light-dark(
      oklch(97% 0.01 var(--hue-neutral)),
      oklch(15% 0.01 var(--hue-neutral))
    );
    
    --color-surface-elevated: light-dark(
      oklch(99% 0.005 var(--hue-neutral)),
      oklch(20% 0.01 var(--hue-neutral))
    );
    
    --color-surface-sunken: light-dark(
      oklch(95% 0.01 var(--hue-neutral)),
      oklch(12% 0.01 var(--hue-neutral))
    );
    
    /* Text hierarchy */
    --color-text: light-dark(
      oklch(25% 0.02 var(--hue-neutral)),
      oklch(88% 0.01 var(--hue-neutral))
    );
    
    --color-text-secondary: light-dark(
      oklch(45% 0.02 var(--hue-neutral)),
      oklch(70% 0.01 var(--hue-neutral))
    );
    
    --color-text-tertiary: light-dark(
      oklch(60% 0.01 var(--hue-neutral)),
      oklch(55% 0.01 var(--hue-neutral))
    );
    
    /* UI elements */
    --color-border: light-dark(
      oklch(90% 0.01 var(--hue-neutral)),
      oklch(25% 0.01 var(--hue-neutral))
    );
    
    --color-border-strong: light-dark(
      oklch(80% 0.02 var(--hue-neutral)),
      oklch(35% 0.01 var(--hue-neutral))
    );
    
    /* Semantic colors */
    --color-success: light-dark(
      oklch(65% 0.15 var(--hue-green)),
      oklch(70% 0.12 var(--hue-green))
    );
    
    --color-info: light-dark(
      oklch(60% 0.12 var(--hue-blue)),
      oklch(65% 0.10 var(--hue-blue))
    );
    
    --color-warning: light-dark(
      oklch(70% 0.15 var(--hue-amber)),
      oklch(75% 0.12 var(--hue-amber))
    );
    
    --color-error: light-dark(
      oklch(58% 0.18 25),
      oklch(65% 0.15 25)
    );
  }
  
  /* User preference overrides */
  [data-theme="light"] {
    color-scheme: light;
  }
  
  [data-theme="dark"] {
    color-scheme: dark;
  }
  
  /* Fallback for browsers without light-dark() support */
  @supports not (color: light-dark(white, black)) {
    :root {
      --color-primary: oklch(62% 0.12 var(--hue-warm));
      --color-surface: oklch(97% 0.01 var(--hue-neutral));
      --color-text: oklch(25% 0.02 var(--hue-neutral));
      /* ... other light defaults ... */
    }
    
    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) {
        --color-primary: oklch(68% 0.10 var(--hue-warm));
        --color-surface: oklch(15% 0.01 var(--hue-neutral));
        --color-text: oklch(88% 0.01 var(--hue-neutral));
        /* ... other dark values ... */
      }
    }
  }
}
```

**`src/assets/css/1-tokens/spacing.css`:**

```css
@layer tokens {
  :root {
    /* Fluid spacing that scales with viewport */
    --space-3xs: clamp(0.25rem, 0.23rem + 0.1vw, 0.3125rem);
    --space-2xs: clamp(0.5rem, 0.46rem + 0.2vw, 0.625rem);
    --space-xs: clamp(0.75rem, 0.69rem + 0.3vw, 0.9375rem);
    --space-sm: clamp(1rem, 0.92rem + 0.4vw, 1.25rem);
    --space-md: clamp(1.5rem, 1.38rem + 0.6vw, 1.875rem);
    --space-lg: clamp(2rem, 1.84rem + 0.8vw, 2.5rem);
    --space-xl: clamp(3rem, 2.77rem + 1.2vw, 3.75rem);
    --space-2xl: clamp(4rem, 3.69rem + 1.6vw, 5rem);
    --space-3xl: clamp(6rem, 5.54rem + 2.4vw, 7.5rem);
    
    /* Common space pairs */
    --space-gutter: var(--space-md);
    --space-section: var(--space-xl);
    --space-gap: var(--space-sm);
  }
}
```

**`src/assets/css/1-tokens/typography.css`:**

```css
@layer tokens {
  :root {
    /* Font stacks */
    --font-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
    --font-serif: 'Iowan Old Style', 'Georgia', serif;
    --font-mono: ui-monospace, 'Cascadia Mono', 'Consolas', monospace;
    
    /* Fluid type scale */
    --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
    --text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
    --text-base: clamp(1rem, 0.925rem + 0.375vw, 1.125rem);
    --text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
    --text-xl: clamp(1.25rem, 1.125rem + 0.625vw, 1.5rem);
    --text-2xl: clamp(1.5rem, 1.25rem + 1.25vw, 2rem);
    --text-3xl: clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem);
    --text-4xl: clamp(2.25rem, 1.75rem + 2.5vw, 3rem);
    
    /* Line heights */
    --leading-tight: 1.25;
    --leading-snug: 1.375;
    --leading-normal: 1.6;
    --leading-relaxed: 1.75;
    --leading-loose: 2;
    
    /* Letter spacing */
    --tracking-tight: -0.025em;
    --tracking-normal: 0;
    --tracking-wide: 0.025em;
    --tracking-wider: 0.05em;
    
    /* Font weights */
    --font-light: 300;
    --font-normal: 400;
    --font-medium: 500;
    --font-semibold: 600;
    --font-bold: 700;
  }
}
```

## Updated Test HTML

Create `src/test.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <title>CSS System Test</title>
  
  <script>
    const t = localStorage.getItem('theme');
    if (t) document.documentElement.dataset.theme = t;
  </script>
  
  <!-- Import your CSS files -->
  <link rel="stylesheet" href="/assets/css/0-critical/reset-and-base.css">
  <link rel="stylesheet" href="/assets/css/1-tokens/colors.css">
  <link rel="stylesheet" href="/assets/css/1-tokens/spacing.css">
  <link rel="stylesheet" href="/assets/css/1-tokens/typography.css">
</head>
<body>
  <nav>
    <ul>
      <li><a href="#">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
  </nav>
  
  <main>
    <article>
      <h1>Your CSS System</h1>
      <p>This is using the classless base styles with your token system. Everything should look good without any classes.</p>
      
      <h2>Typography Test</h2>
      <p>Regular paragraph with a <a href="#">link</a>, some <code>inline code</code>, and <strong>bold text</strong>.</p>
      
      <blockquote>
        "A thoughtful quote that should have nice styling and proper contrast."
      </blockquote>
      
      <h3>Code Example</h3>
      <pre><code>const theme = localStorage.getItem('theme');
if (theme) {
  document.documentElement.dataset.theme = theme;
}</code></pre>
      
      <h3>Interactive Elements</h3>
      <button>Primary Button</button>
      
      <details>
        <summary>Expandable Section</summary>
        <p>Hidden content that appears when expanded.</p>
      </details>
    </article>
  </main>
  
  <script>
    // Simple theme toggle for testing
    document.querySelector('button').addEventListener('click', () => {
      const current = document.documentElement.dataset.theme || 'auto';
      const themes = ['light', 'dark', 'auto'];
      const next = themes[(themes.indexOf(current) + 1) % 3];
      
      if (next === 'auto') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.removeItem('theme');
      } else {
        document.documentElement.dataset.theme = next;
        localStorage.setItem('theme', next);
      }
    });
  </script>
</body>
</html>
```

Test this setup with `npm run dev` (or however you run your 11ty + Vite setup). You should see:
- Classless HTML that looks polished
- Smooth theme switching via the button
- Earthy, sophisticated colors
- Proper spacing and typography

Once you confirm this works, send it to Perplexity for verification, then I'll provide Step 3: Layout utilities and components.

The key points:
1. Fixed anchor positioning syntax
2. Corrected Vite paths
3. Classless base + token system working together
4. Everything progressively enhanced