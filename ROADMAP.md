# Roadmap — Migration TypeScript + Tests + Nommage

> Suite du code review. Trois items `[-]` différés, à traiter dans l'ordre A → B → C.

## Légende

- `[ ]` À faire
- `[x]` Terminé
- `[-]` Abandonné / non applicable

---

## Phase A — TypeScript

### Setup

- [ ] `npm install -D typescript @types/chrome`
- [ ] Créer `tsconfig.json` à la racine
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "module": "ESNext",
      "moduleResolution": "bundler",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "skipLibCheck": true,
      "types": ["chrome"]
    },
    "include": ["src", "background.js"]
  }
  ```
- [ ] Ajouter `"check": "svelte-check --tsconfig ./tsconfig.json"` dans `package.json`

### Couche 1 — Types partagés

- [ ] Créer `src/types.ts` avec les interfaces :
  - `TaskStatus`, `TaskPriority`, `ToastType` (union types)
  - `Environment`, `Task`, `Comment`, `Link`
  - `SearchFilters`, `ToastItem`

### Couche 2 — Infrastructure

- [ ] `src/lib/storage.js` → `.ts` — typer `get<T>`, `set`, `remove`
- [ ] `src/lib/crudStore.js` → `.ts` — générique `createCrudStore<T extends { id: string }>`

### Couche 3 — Stores (ordre croissant de complexité)

- [ ] `toast.js` → `.ts`
- [ ] `dialog.js` → `.ts`
- [ ] `navigation.js` → `.ts`
- [ ] `settings.js` → `.ts`
- [ ] `connections.js` → `.ts`
- [ ] `environments.js` → `.ts`
- [ ] `favorites.js` → `.ts`
- [ ] `links.js` → `.ts`
- [ ] `tasks.js` → `.ts`
- [ ] `search.js` → `.ts`
- [ ] `apiDoc.js` → `.ts` *(le plus complexe — types OpenAPI)*

### Couche 4 — Composants (ajouter `lang="ts"` dans `<script>`)

- [ ] `Toast.svelte`
- [ ] `ConfirmDialog.svelte`
- [ ] `Layout.svelte`
- [ ] `TaskComments.svelte`
- [ ] `XmlEditor.svelte`
- [ ] `TasksManager.svelte`
- [ ] `LinksManager.svelte`
- [ ] `Home.svelte`
- [ ] `ApiDoc.svelte`
- [ ] `Settings.svelte`

### Couche 5 — Root

- [ ] `main.js` → `main.ts`
- [ ] `background.js` → `background.ts`

### Vérification Phase A

```bash
npm run check   # svelte-check sans erreurs
npm run build   # build toujours OK
```

---

## Phase B — Vitest

*Prérequis : Phase A recommandée (pas obligatoire)*

### Setup

- [ ] `npm install -D vitest @testing-library/svelte jsdom`
- [ ] Ajouter section `test` dans `vite.config.js/ts`
  ```js
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts']
  }
  ```
- [ ] Créer `src/test/setup.ts` — mock global Chrome API (`chrome.storage.local`, `chrome.runtime`)
- [ ] Ajouter `"test": "vitest"` dans `package.json`

### Infrastructure

- [ ] `src/test/lib/storage.test.ts` — 6 tests (get/set/remove : resolve + reject sur `lastError`)
- [ ] `src/test/lib/crudStore.test.ts` — 8 tests (UUID, timestamps, persist appelé)

### Stores Tier 1

- [ ] `src/test/stores/tasks.test.ts` — ~15 tests (CRUD + commentaires + reorder + clear)
- [ ] `src/test/stores/environments.test.ts` — 4 tests (setActive toggle, getActive fallback)
- [ ] `src/test/stores/favorites.test.ts` — 4 tests (add dedup, isFavorite, clear)
- [ ] `src/test/stores/links.test.ts` — 3 tests (reorder edge cases)
- [ ] `src/test/stores/connections.test.ts` — 3 tests (search filter case-insensitive)

### Stores Tier 2

- [ ] `src/test/stores/dialog.test.ts` — 2 tests (confirm/cancel promise)
- [ ] `src/test/stores/toast.test.ts` — 3 tests (success/error/info + auto-dismiss timer)
- [ ] `src/test/stores/settings.test.ts` — 3 tests (load/updateSetting/reset)
- [ ] `src/test/stores/search.test.ts` — 6 tests (AbortController, FormData, error state) — mock `fetch`
- [ ] `src/test/stores/apiDoc.test.ts` — 8 tests (HTML detection, YAML/JSON fallback, cache, parseOpenApiSpec)

### Vérification Phase B

```bash
npm test                    # tous les tests passent
npm test -- --coverage      # rapport de couverture
```

---

## Phase C — Nommage

*Prérequis : Phase A obligatoire*

### Incohérences à corriger

| Problème | Actuel | Cible |
|----------|--------|-------|
| State loading | `search.js` : `loading` / `apiDoc.js` : `isLoading` | Uniformiser → `isLoading` |
| Endpoint IDs | `"${method}-${path}-${tag}"` | `crypto.randomUUID()` |

### Actions

- [ ] `npm install -D eslint @typescript-eslint/eslint-plugin eslint-plugin-svelte`
- [ ] Créer `.eslintrc.json` avec règle `@typescript-eslint/naming-convention`
- [ ] `src/stores/search.js/ts` — renommer `loading` → `isLoading` + mettre à jour `Home.svelte`
- [ ] `src/stores/apiDoc.js/ts` — endpoint IDs → `crypto.randomUUID()`

### Vérification Phase C

```bash
npm run lint    # aucune erreur
npm run build   # toujours OK
```

---

## Résumé

| Phase | Effort estimé | Prérequis |
|-------|--------------|-----------|
| **A — TypeScript** | ~15h | `@types/chrome` |
| **B — Vitest** | ~20h | Phase A recommandée |
| **C — Nommage** | ~3h | Phase A obligatoire |

---

## Journal

| Date | Action |
|------|--------|
| 2026-04-01 | Roadmap créée |
