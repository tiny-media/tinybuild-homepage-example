#!/usr/bin/env bun

import { join } from 'node:path';

// Use Bun's optimized file API for better performance
const tokensPath = join(import.meta.dirname, 'tokens.json');
const tokens = await Bun.file(tokensPath).json();

// Helper function to flatten nested objects
function flattenTokens(obj, prefix = '', separator = '-') {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}${separator}${key}` : key;
    
    if (value && typeof value === 'object' && !value.value) {
      // Recursively flatten nested objects
      Object.assign(result, flattenTokens(value, newKey, separator));
    } else if (value && value.value) {
      // This is a token with a value
      result[newKey] = value.value;
    }
  }
  
  return result;
}

// Generate CSS custom properties
function generateCSS() {
  const flatTokens = flattenTokens(tokens);
  
  let css = `/* Auto-generated design tokens from tokens.json */\n`;
  css += `/* DO NOT EDIT - Run 'node generate-tokens.js' to regenerate */\n\n`;
  css += `@layer tokens {\n`;
  css += `  :root {\n`;
  
  // Group tokens by category for better organization
  const categories = {
    color: [],
    spacing: [],
    typography: [],
    container: [],
    radius: [],
    shadow: [],
    other: []
  };
  
  // Sort tokens into categories
  Object.entries(flatTokens).forEach(([key, value]) => {
    const cssVar = `--${key.replace(/_/g, '-')}`;
    const declaration = `    ${cssVar}: ${value};`;
    
    if (key.startsWith('color-')) {
      categories.color.push(declaration);
    } else if (key.startsWith('spacing-')) {
      categories.spacing.push(declaration);
    } else if (key.startsWith('typography-')) {
      categories.typography.push(declaration);
    } else if (key.startsWith('container-')) {
      categories.container.push(declaration);
    } else if (key.startsWith('radius-')) {
      categories.radius.push(declaration);
    } else if (key.startsWith('shadow-')) {
      categories.shadow.push(declaration);
    } else {
      categories.other.push(declaration);
    }
  });
  
  // Add categories with comments
  if (categories.color.length > 0) {
    css += `\n    /* Colors */\n`;
    css += categories.color.join('\n') + '\n';
  }
  
  if (categories.spacing.length > 0) {
    css += `\n    /* Spacing */\n`;
    css += categories.spacing.join('\n') + '\n';
  }
  
  if (categories.typography.length > 0) {
    css += `\n    /* Typography */\n`;
    css += categories.typography.join('\n') + '\n';
  }
  
  if (categories.container.length > 0) {
    css += `\n    /* Container */\n`;
    css += categories.container.join('\n') + '\n';
  }
  
  if (categories.radius.length > 0) {
    css += `\n    /* Border Radius */\n`;
    css += categories.radius.join('\n') + '\n';
  }
  
  if (categories.shadow.length > 0) {
    css += `\n    /* Shadows */\n`;
    css += categories.shadow.join('\n') + '\n';
  }
  
  if (categories.other.length > 0) {
    css += `\n    /* Other */\n`;
    css += categories.other.join('\n') + '\n';
  }
  
  css += `  }\n`;
  css += `}\n`;
  
  return css;
}

// Generate themed CSS with light-dark() functions
function generateThemedCSS() {
  let css = `/* Auto-generated themed design tokens from tokens.json */\n`;
  css += `/* DO NOT EDIT - Run 'node generate-tokens.js' to regenerate */\n\n`;
  css += `@layer tokens {\n`;
  css += `  :root {\n`;
  
  // Handle semantic colors with light/dark variants
  if (tokens.color && tokens.color.semantic) {
    css += `\n    /* Semantic Colors with Theme Support */\n`;
    
    Object.entries(tokens.color.semantic).forEach(([category, variants]) => {
      Object.entries(variants).forEach(([name, values]) => {
        if (values.light && values.dark) {
          const cssVar = `--color-${category}-${name}`;
          css += `    ${cssVar}: light-dark(${values.light.value}, ${values.dark.value});\n`;
        }
      });
    });
  }
  
  // Handle brand colors (no theming needed)
  if (tokens.color && tokens.color.brand) {
    css += `\n    /* Brand Colors */\n`;
    Object.entries(tokens.color.brand).forEach(([name, token]) => {
      css += `    --color-brand-${name}: ${token.value};\n`;
    });
  }
  
  // Handle other non-color tokens
  const nonColorCategories = ['spacing', 'typography', 'container', 'radius', 'shadow'];
  
  nonColorCategories.forEach(category => {
    if (tokens[category]) {
      css += `\n    /* ${category.charAt(0).toUpperCase() + category.slice(1)} */\n`;
      const flatCategory = flattenTokens({ [category]: tokens[category] });
      
      Object.entries(flatCategory).forEach(([key, value]) => {
        const cssVar = `--${key.replace(/_/g, '-')}`;
        css += `    ${cssVar}: ${value};\n`;
      });
    }
  });
  
  css += `  }\n\n`;
  
  // Add color scheme preferences
  css += `  /* Theme Support */\n`;
  css += `  @media (prefers-color-scheme: light) {\n`;
  css += `    :root {\n`;
  css += `      color-scheme: light;\n`;
  css += `    }\n`;
  css += `  }\n\n`;
  
  css += `  @media (prefers-color-scheme: dark) {\n`;
  css += `    :root {\n`;
  css += `      color-scheme: dark;\n`;
  css += `    }\n`;
  css += `  }\n\n`;
  
  // Manual theme overrides
  css += `  /* Manual Theme Classes */\n`;
  css += `  [data-theme="light"] {\n`;
  css += `    color-scheme: light;\n`;
  css += `  }\n\n`;
  
  css += `  [data-theme="dark"] {\n`;
  css += `    color-scheme: dark;\n`;
  css += `  }\n`;
  
  css += `}\n`;
  
  return css;
}

// Generate and write files using Bun's optimized APIs
try {
  const basicCSS = generateCSS();
  const themedCSS = generateThemedCSS();
  
  // Use Bun.write for better performance - writes both files concurrently
  const basicPath = join(import.meta.dirname, '../assets/css/1-design-tokens/tokens.css');
  const themedPath = join(import.meta.dirname, '../assets/css/1-design-tokens/tokens-themed.css');
  
  await Promise.all([
    Bun.write(basicPath, basicCSS),
    Bun.write(themedPath, themedCSS)
  ]);
  
  console.log('✅ Generated basic tokens.css');
  console.log('✅ Generated tokens-themed.css');
  console.log('\n🎨 Token generation complete!');
  console.log('📁 Files generated:');
  console.log(`   - ${basicPath}`);
  console.log(`   - ${themedPath}`);
  
} catch (error) {
  console.error('❌ Error generating tokens:', error);
  process.exit(1);
}