# AGENTS.md - Chrome Side Panel Extension

## Overview

This is a Chrome Side Panel Extension built with Svelte 4, TailwindCSS 3, and Vite 5. The extension provides tools for managing API tokens, XML editing, and managing saved links.

## Project Structure

```
pub/
├── public/              # Static assets and manifest.json
├── src/
│   ├── components/      # Svelte components (PascalCase)
│   ├── stores/          # Svelte stores (camelCase .js files)
│   │   └── components/ # Component-specific stores
│   ├── lib/             # Utilities (storage wrapper)
│   ├── App.svelte       # Root component
│   ├── main.js          # Entry point
│   ├── index.html       # HTML template
│   └── app.css          # Global styles with Tailwind
├── background.js        # Chrome Service Worker
└── dist/                # Build output
```

## Build Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server with hot reload
npm run build        # Production build to dist/
npm run preview      # Preview production build
```

### Loading in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder

## Code Style Guidelines

### File Naming

- **Svelte components**: `PascalCase.svelte` (e.g., `LinksManager.svelte`)
- **JavaScript modules**: `camelCase.js` (e.g., `links.js`)
- **Config files**: `kebab-case.js` (e.g., `vite.config.js`)

### Imports

- Use relative imports with `.js` extension for JS files
- Use relative imports without extension for Svelte files
- Group imports: external libraries first, then internal modules

```javascript
// External
import { writable } from 'svelte/store'
import { Plus, Edit2 } from 'lucide-svelte'

// Internal
import { links } from '../stores/links.js'
import Layout from './components/Layout.svelte'
```

### Svelte Components

- Use `<script>`, `<template>` (or HTML directly), and `<style>` blocks
- Prefer `on:click` over `onclick` for event handlers
- Use `$` prefix for store subscriptions in templates
- Use `{#if}`, `{#each}`, `{#await}` for control flow
- Always use `{#each items as item (item.id)}` with keyed iterations

```svelte
<script>
  import { onMount } from 'svelte'
  import { currentPage } from './stores/navigation.js'

  let loading = false

  onMount(() => {
    // Cleanup in returned function
    return () => {}
  })

  async function handleClick() {
    loading = true
    try {
      await doSomething()
    } finally {
      loading = false
    }
  }
</script>

<button on:click={handleClick} disabled={loading}>
  {$currentPage === 'home' ? 'Active' : 'Inactive'}
</button>
```

### JavaScript Patterns

- Use ES6+ features (const/let, arrow functions, template literals)
- Use async/await for asynchronous operations
- Wrap chrome.storage callbacks in Promises
- Use early returns to reduce nesting

```javascript
// Promise wrapper for chrome.storage
export const get = (key) => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key])
    })
  })
}

// Store pattern
function createLinksStore() {
  const { subscribe, set: setStore, update } = writable([])

  return {
    subscribe,
    load: async () => {
      const links = await get('links') || []
      setStore(links)
    },
    // ... other methods
  }
}

export const links = createLinksStore()
```

### CSS and Tailwind

- Use Tailwind utility classes for most styling
- Use CSS custom properties (variables) for theme colors
- Avoid arbitrary values; use Tailwind's scale when possible
- Use `@layer components` for reusable component styles

```css
@layer base {
  :root {
    --color-primary: #1e3a5f;
    --color-primary-hover: #2a4a73;
  }
}

@layer components {
  .card-mo {
    @apply bg-white border border-gray-200 rounded p-4;
  }
}
```

### Error Handling

- Use try/catch for async operations
- Log errors with `console.error` including context
- Show user-friendly error messages in the UI
- Use `throw` for unrecoverable errors

```javascript
try {
  await searchStore.search(filters)
} catch (err) {
  console.error('Erreur recherche:', err)
  // Show error in UI
}
```

### State Management

- Use Svelte stores for shared state
- Keep stores focused (one responsibility per store)
- Use derived stores for computed values
- Initialize stores in `onMount` hooks

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `LinksManager`, `XmlEditor` |
| Store functions | camelCase | `createLinksStore`, `createSearchStore` |
| Store exports | camelCase | `links`, `searchStore`, `filters` |
| Functions | camelCase | `handleSearch`, `openEditorWithData` |
| Variables | camelCase | `currentPage`, `showFilters` |
| Constants | SCREAMING_SNAKE | `MAX_ITEMS`, `API_BASE` |
| CSS classes | kebab-case | `bg-gray-50`, `text-red-600` |
| HTML attributes | kebab-case | `on:click`, `className` |

### Comments

- Use French comments throughout the codebase
- Keep comments concise and in present tense
- Document "why" not "what"

```javascript
// Wrapper pour chrome.storage.local avec Promises
export const get = (key) => { ... }

// Charger les favoris au démarrage
onMount(() => { ... })
```

## Chrome Extension Specific

### Manifest V3

- Uses `side_panel` permission for the main UI
- Background script runs as Service Worker
- Permissions: `sidePanel`, `storage`, `scripting`, `activeTab`

### Chrome APIs

- `chrome.storage.local` for persistent storage
- `chrome.tabs.create()` for opening tabs
- `chrome.scripting.executeScript()` for content injection
- `chrome.sidePanel.open()` for toggling the side panel

### Best Practices

- Always handle Chrome API errors gracefully
- Use `async/await` with try/catch for all async operations
- Clean up subscriptions in `onMount` return functions
- Use `chrome.runtime.lastError` for callback-based APIs

## Development Notes

- No test framework is currently configured
- No linting (ESLint/Prettier) is currently configured
- Build output goes to `dist/` directory
- The `type: "module"` in package.json enables ES modules
- Uses `vitePreprocess()` for Svelte preprocessing

## Adding New Components

1. Create `src/components/NewComponent.svelte`
2. Add store logic in `src/stores/newComponent.js`
3. Import and use in `src/App.svelte` or parent component
4. Use Tailwind for styling, follow naming conventions
5. Handle loading/error states in UI
