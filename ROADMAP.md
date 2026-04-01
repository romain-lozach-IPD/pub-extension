# Roadmap — Migration TypeScript + Tests + Nommage

> Suite du code review. Trois items `[-]` différés, à traiter dans l'ordre A → B → C.

## Légende

- `[ ]` À faire
- `[x]` Terminé
- `[-]` Abandonné / non applicable

---

## Phase A — TypeScript

### Setup

- [x] `npm install -D typescript @types/chrome`
- [x] Créer `tsconfig.json` à la racine
- [x] Ajouter `"check": "svelte-check --tsconfig ./tsconfig.json"` dans `package.json`

### Couche 1 — Types partagés

- [x] Créer `src/types.ts` avec les interfaces :
  - `TaskStatus`, `TaskPriority`, `ToastType` (union types)
  - `Environment`, `Task`, `Comment`, `Link`
  - `SearchFilters`, `ToastItem`

### Couche 2 — Infrastructure

- [x] `src/lib/storage.js` → `.ts` — typer `get<T>`, `set`, `remove`
- [x] `src/lib/crudStore.js` → `.ts` — générique `createCrudStore<T extends { id: string }>`

### Couche 3 — Stores (ordre croissant de complexité)

- [x] `toast.js` → `.ts`
- [x] `dialog.js` → `.ts`
- [x] `navigation.js` → `.ts`
- [x] `settings.js` → `.ts`
- [x] `connections.js` → `.ts`
- [x] `environments.js` → `.ts`
- [x] `favorites.js` → `.ts`
- [x] `links.js` → `.ts`
- [x] `tasks.js` → `.ts`
- [x] `search.js` → `.ts`
- [x] `apiDoc.js` → `.ts` *(le plus complexe — types OpenAPI)*

### Couche 4 — Composants (ajouter `lang="ts"` dans `<script>`)

- [x] `Toast.svelte`
- [x] `ConfirmDialog.svelte`
- [x] `Layout.svelte`
- [x] `TaskComments.svelte`
- [x] `XmlEditor.svelte`
- [x] `TasksManager.svelte`
- [x] `LinksManager.svelte`
- [x] `Home.svelte`
- [x] `ApiDoc.svelte`
- [x] `Settings.svelte`

### Couche 5 — Root

- [x] `main.js` → `main.ts`
- [x] `background.js` → `background.ts`

### Vérification Phase A

```bash
npm run check   # svelte-check sans erreurs
npm run build   # build toujours OK
```

---

## Phase B — Vitest

*Prérequis : Phase A recommandée (pas obligatoire)*

### Setup

- [x] `npm install -D vitest @testing-library/svelte jsdom`
- [x] Ajouter section `test` dans `vite.config.js/ts`
- [x] Créer `src/test/setup.ts` — mock global Chrome API (`chrome.storage.local`, `chrome.runtime`)
- [x] Ajouter `"test": "vitest"` dans `package.json`

### Infrastructure

- [x] `src/test/lib/storage.test.ts` — 6 tests (get/set/remove : resolve + reject sur `lastError`)
- [x] `src/test/lib/crudStore.test.ts` — 8 tests (UUID, timestamps, persist appelé)

### Stores Tier 1

- [x] `src/test/stores/tasks.test.ts` — 14 tests (CRUD + commentaires + reorder + clear)
- [x] `src/test/stores/environments.test.ts` — 4 tests (setActive toggle, getActive fallback)
- [x] `src/test/stores/favorites.test.ts` — 4 tests (add dedup, isFavorite, clear)
- [x] `src/test/stores/links.test.ts` — 3 tests (reorder edge cases)
- [x] `src/test/stores/connections.test.ts` — 3 tests (search filter case-insensitive)

### Stores Tier 2

- [x] `src/test/stores/dialog.test.ts` — 2 tests (confirm/cancel promise)
- [x] `src/test/stores/toast.test.ts` — 3 tests (success/error/info + auto-dismiss timer)
- [x] `src/test/stores/settings.test.ts` — 3 tests (load/updateSetting/reset)
- [x] `src/test/stores/search.test.ts` — 7 tests (AbortController, FormData, error state, paginationInfo) — mock `fetch`
- [x] `src/test/stores/apiDoc.test.ts` — 9 tests (HTML detection, YAML/JSON fallback, cache, parseOpenApiSpec)

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

- [x] `npm install -D eslint @typescript-eslint/eslint-plugin eslint-plugin-svelte`
- [x] Créer `eslint.config.js` avec règle `@typescript-eslint/naming-convention`
- [x] `src/stores/search.ts` — renommer `loading` → `isLoading` + mettre à jour `Home.svelte`
- [x] `src/stores/apiDoc.ts` — endpoint IDs → `crypto.randomUUID()`

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
| 2026-04-01 | Phase A terminée — `npm run check` 0 erreur, `npm run build` OK |
| 2026-04-01 | Phase B terminée — 66/66 tests vitest, `npm run build` OK |
| 2026-04-01 | Phase C terminée — `npm run lint` 0 erreur, `loading` → `isLoading`, endpoint IDs → randomUUID |
| 2026-04-01 | Phase B terminée — 66/66 tests vitest, `npm run build` OK |
