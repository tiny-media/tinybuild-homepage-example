Yes, integrating classless base styles into a modern CSS system is not only modern but recommended - it's exactly what modern CSS frameworks like Open Props and Tailwind's typography plugin do. You get semantic HTML that looks good by default, then layer classes for specific needs.

Let's build this step-by-step, starting with the foundation and checking each piece as we go.

## Step 1: Create the Reset + Base Styles

First, let's create a combined reset and base typography file that gives you Pico-like defaults:

**Create `src/assets/css/0-critical/reset-and-base.css`:**

```css
/* Modern reset + classless base styles */
@layer reset {

    /* Prevent scrollbar layout shift */
    html {
      overflow-y: scroll; /* Fallback */
    }
    
    @supports (scrollbar-gutter: stable) {
      html {
        overflow-y: auto;
        scrollbar-gutter: stable;
      }
    }
    
    /* Prevent font loading layout shift */
    @font-face {
      font-family: 'system-ui-fallback';
      src: local('system-ui'), local('-apple-system'), local('Segoe UI');
      font-display: swap;
      size-adjust: 100%;
      ascent-override: 90%;
      descent-override: 10%;
      line-gap-override: 0%;
    }
    
    /* Reserve space for images */
    img:not([width]):not([height]) {
      aspect-ratio: 16/9; /* Default aspect ratio */
    }

    /* Box sizing */
    *, *::before, *::after {
      box-sizing: border-box;
    }
    
    /* Remove margins */
    * {
      margin: 0;
    }
    
    /* Baseline styles */
    html {
      -webkit-text-size-adjust: 100%;
      tab-size: 4;
      font-family: var(--font-sans, system-ui, sans-serif);
      line-height: 1.5;
    }
    
    body {
      min-height: 100vh;
      line-height: inherit;
      background: var(--color-surface);
      color: var(--color-text);
    }
    
    /* Typography defaults */
    h1, h2, h3, h4, h5, h6 {
      font-size: inherit;
      font-weight: inherit;
      line-height: 1.2;
      margin-block: 0 0.5em;
      color: var(--color-text);
    }
    
    h1 { font-size: var(--text-3xl, 2.5rem); font-weight: 700; }
    h2 { font-size: var(--text-2xl, 2rem); font-weight: 600; }
    h3 { font-size: var(--text-xl, 1.5rem); font-weight: 600; }
    h4 { font-size: var(--text-lg, 1.25rem); font-weight: 500; }
    h5 { font-size: var(--text-base, 1rem); font-weight: 500; }
    h6 { font-size: var(--text-sm, 0.875rem); font-weight: 500; }
    
    p {
      margin-block-end: 1em;
      line-height: var(--leading-normal, 1.6);
    }
    
    /* Links */
    a {
      color: var(--color-primary);
      text-decoration: underline;
      text-underline-offset: 2px;
      transition: color 0.2s;
    }
    
    a:hover {
      color: oklch(from var(--color-primary) calc(l * 1.1) c h);
    }
    
    /* Lists */
    ul, ol {
      padding-inline-start: 1.5em;
      margin-block-end: 1em;
    }
    
    li {
      margin-block: 0.25em;
    }
    
    /* Semantic HTML elements */
    main {
      max-width: var(--container-max, 65ch);
      margin-inline: auto;
      padding: var(--space-md);
    }
    
    article {
      margin-block: var(--space-xl);
    }
    
    section {
      margin-block: var(--space-lg);
    }
    
    nav ul {
      list-style: none;
      padding: 0;
      display: flex;
      gap: var(--space-md);
    }
    
    nav a {
      text-decoration: none;
      font-weight: 500;
    }
    
    /* Images */
    img, picture, video, canvas, svg {
      display: block;
      max-width: 100%;
      height: auto;
    }
    
    /* Forms */
    input, button, textarea, select {
      font: inherit;
      color: inherit;
    }
    
    button {
      cursor: pointer;
      padding: var(--space-xs) var(--space-md);
      background: var(--color-primary);
      color: var(--color-surface);
      border: none;
      border-radius: 6px;
      font-weight: 500;
      transition: transform 0.2s;
    }
    
    button:hover {
      transform: translateY(-1px);
    }
    
    /* Code blocks */
    pre, code, kbd, samp {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 0.95em;
    }
    
    code {
      background: light-dark(
        oklch(95% 0.01 85),
        oklch(20% 0.01 85)
      );
      padding: 0.125em 0.25em;
      border-radius: 3px;
    }
    
    pre {
      background: light-dark(
        oklch(96% 0.01 85),
        oklch(18% 0.01 85)
      );
      padding: var(--space-md);
      border-radius: 6px;
      overflow-x: auto;
      margin-block: var(--space-md);
    }
    
    pre code {
      background: none;
      padding: 0;
    }
    
    /* Quotes */
    blockquote {
      border-inline-start: 4px solid var(--color-primary);
      padding-inline-start: var(--space-md);
      margin-block: var(--space-md);
      margin-inline: 0;
      font-style: italic;
      color: var(--color-text-secondary);
    }
    
    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-block: var(--space-md);
    }
    
    th, td {
      padding: var(--space-xs) var(--space-sm);
      text-align: start;
      border-bottom: 1px solid var(--color-border);
    }
    
    th {
      font-weight: 600;
      background: light-dark(
        oklch(96% 0.01 85),
        oklch(18% 0.01 85)
      );
    }
    
    /* Horizontal rule */
    hr {
      border: none;
      border-top: 1px solid var(--color-border);
      margin-block: var(--space-xl);
    }
    
    /* Details/Summary */
    details {
      margin-block: var(--space-md);
      padding: var(--space-sm);
      border: 1px solid var(--color-border);
      border-radius: 6px;
    }
    
    summary {
      font-weight: 600;
      cursor: pointer;
    }
    
    /* Dialog */
    dialog {
      max-width: min(90vw, 600px);
      padding: var(--space-lg);
      border: none;
      border-radius: 12px;
      background: var(--color-surface-elevated);
      color: var(--color-text);
      box-shadow: 0 10px 40px oklch(0% 0 0 / 0.2);
    }
    
    dialog::backdrop {
      background: oklch(0% 0 0 / 0.5);
    }
  }
```

## Step 2: Test the Base Setup

Create a simple HTML file to test:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <title>CSS Test</title>
  
  <script>
    const t = localStorage.getItem('theme');
    if (t) document.documentElement.dataset.theme = t;
  </script>
  
  <style>
    /* Inline tokens for testing */
    :root {
      color-scheme: light dark;
      
      /* Colors */
      --color-primary: light-dark(
        oklch(62% 0.12 35),
        oklch(68% 0.10 35)
      );
      --color-surface: light-dark(
        oklch(97% 0.01 85),
        oklch(15% 0.01 85)
      );
      --color-text: light-dark(
        oklch(25% 0.02 85),
        oklch(88% 0.01 85)
      );
      --color-text-secondary: light-dark(
        oklch(45% 0.02 85),
        oklch(70% 0.01 85)
      );
      --color-border: light-dark(
        oklch(90% 0.01 85),
        oklch(25% 0.01 85)
      );
      
      /* Spacing */
      --space-xs: 0.5rem;
      --space-sm: 0.75rem;
      --space-md: 1rem;
      --space-lg: 1.5rem;
      --space-xl: 2rem;
    }
  </style>
  
  <link rel="stylesheet" href="/assets/css/0-critical/reset-and-base.css">
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
    <h1>Heading 1</h1>
    <p>This is a paragraph with a <a href="#">link</a> and some <code>inline code</code>.</p>
    
    <h2>Heading 2</h2>
    <p>Another paragraph with text.</p>
    
    <blockquote>
      This is a blockquote with some thoughtful text.
    </blockquote>
    
    <h3>Lists</h3>
    <ul>
      <li>First item</li>
      <li>Second item</li>
      <li>Third item</li>
    </ul>
    
    <button>Click me</button>
    
    <pre><code>const example = "code block";
console.log(example);</code></pre>
    
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Item 1</td>
          <td>100</td>
        </tr>
        <tr>
          <td>Item 2</td>
          <td>200</td>
        </tr>
      </tbody>
    </table>
  </main>
</body>
</html>
```

Test this first - you should see:
- Clean typography with good spacing
- Proper link colors from your tokens
- Code blocks with subtle backgrounds
- Everything responsive and readable

Does this base look good? Once you confirm, we'll add:
1. The full token system
2. Layout utilities
3. Component classes that enhance (not replace) the base styles
4. The build system

This approach gives you the best of both worlds - semantic HTML that looks good without classes (like Pico), plus the power to add classes when needed for specific designs.