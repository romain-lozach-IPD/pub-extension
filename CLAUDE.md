# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Chrome Side Panel Extension (Manifest V3) built with Svelte 4, TailwindCSS 3, and Vite 5. It provides tools for managing API tokens/connections, XML editing, saved links, task tracking, and OpenAPI documentation browsing.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server with hot reload
npm run build        # Production build to dist/
npm run preview      # Preview production build
```

No test framework or linter is configured.

### Loading in Chrome

After `npm run build`, go to `chrome://extensions/`, enable Developer Mode, click "Load unpacked", and select the `dist/` folder.

## Architecture

**Entry points:**
- `src/main.js` → mounts `src/App.svelte` (the page router)
- `background.js` → Service Worker that handles side panel toggle on icon click

**Routing:** `App.svelte` reads `$currentPage` from `src/stores/navigation.js` to swap between page components. There is no URL-based router.

**State management:** Each feature has a dedicated store in `src/stores/` that wraps `chrome.storage.local` for persistence. Stores expose async methods (`load`, `add`, `update`, `remove`) and are initialized via `onMount` in the relevant component.

```javascript
// Standard store pattern
function createFooStore() {
  const { subscribe, set, update } = writable([])
  return {
    subscribe,
    load: async () => { const data = await get('foo') || []; set(data) },
    add: async (item) => { /* update + persist */ },
  }
}
export const foo = createFooStore()
```

**Storage:** All persistence goes through `src/lib/storage.js`, which wraps `chrome.storage.local` in Promises.

**Styling:** Global CSS variables for brand colors (`--color-primary: #1e3a5f`) are defined in `src/app.css` under `@layer base`. Reusable component classes (`.card-mo`, `.btn-primary`, `.input-mo`) are defined under `@layer components`. Use Tailwind utilities for everything else.

## Code Conventions

- **Comments**: Write in French throughout the codebase
- **Components**: PascalCase (e.g., `LinksManager.svelte`)
- **Stores/functions/variables**: camelCase
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Imports**: external libraries first, then internal modules; use `.js` extension for JS imports, no extension for Svelte

**Svelte specifics:**
- Use `on:click` (not `onclick`) for event handlers
- Always key `{#each}` iterations: `{#each items as item (item.id)}`
- Initialize stores in `onMount`; return cleanup functions

## Git Policy

**NEVER** commit or push without an explicit user request. Always wait for the user to ask before running `git commit` or `git push`.

## Adding a New Page

1. Create `src/components/NewPage.svelte`
2. Create `src/stores/newPage.js` for its state
3. Register the route in `src/stores/navigation.js`
4. Import and add a `{#if $currentPage === 'new-page'}` branch in `App.svelte`
