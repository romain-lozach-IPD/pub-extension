# CLAUDE.md — Chrome Side Panel Extension

Extension Chrome Manifest V3 : side panel Svelte 4 + TypeScript + TailwindCSS 3 + Vite 5.

## Commandes

```bash
npm run dev            # serveur de dev Vite
npm run build          # build prod → dist/
npm run check          # svelte-check TypeScript (doit retourner 0 erreur)
npm run test           # vitest (66 tests, doit tous passer)
npm run test:coverage  # couverture de code
```

## Structure

```
pub/
├── public/manifest.json          # Manifest V3
├── src/
│   ├── types.ts                  # Tous les types partagés (source de vérité)
│   ├── App.svelte
│   ├── main.ts
│   ├── index.html
│   ├── app.css
│   ├── vite-env.d.ts
│   ├── components/               # PascalCase.svelte
│   ├── stores/                   # camelCase.ts
│   └── lib/
│       ├── storage.ts            # wrapper chrome.storage.local
│       └── crudStore.ts          # générique createCrudStore<T>
├── background.ts                 # Service Worker
├── tsconfig.json
├── vite.config.js
├── src/test/
│   ├── chromeMock.ts             # mock chrome API (storageData + vi.fn())
│   ├── setup.ts                  # vi.stubGlobal('chrome') + beforeEach reset
│   ├── lib/                      # tests infrastructure
│   └── stores/                   # tests stores
└── dist/                         # sortie build
```

## TypeScript — règles Svelte 4

Le compilateur Svelte 4 parse les templates HTML **avant** TypeScript. Deux contraintes importantes :

1. **Pas de `as Type` dans les templates** — cause des erreurs de parsing Svelte (ex: `(e.target as HTMLSelectElement).value` dans `on:change`). Extraire la logique dans une fonction typée dans `<script lang="ts">`.

2. **Pas de types objets inline dans les templates** — `(obj as { type?: string })?.type` provoque une confusion du parser sur les accolades. Même règle : extraire en helper.

```typescript
// ❌ cassé dans le template
on:change={(e) => tasks.updateStatus(id, (e.target as HTMLSelectElement).value as TaskStatus)}

// ✅ helper dans <script lang="ts">
function onStatusChange(e: Event, id: string) {
  tasks.updateStatus(id, (e.target as HTMLSelectElement).value as TaskStatus)
}
```

## Imports TypeScript

Toujours utiliser l'extension `.ts` explicite dans les imports (requis par `allowImportingTsExtensions: true`) :

```typescript
import { tasks } from '../stores/tasks.ts'
import type { Task } from '../types.ts'
```

## Pattern store CRUD

```typescript
// Store simple : étend createCrudStore
const base = createCrudStore<MyType>('key')
export const myStore = {
  ...base,
  customMethod: (): void => { base._mutate(items => ...) }
}

// Store complexe : writable directement (tasks, search, apiDoc)
function createMyStore() {
  const { subscribe, set, update } = writable<State>(initialState)
  return { subscribe, myMethod: (): void => { update(...) } }
}
export const myStore = createMyStore()
```

## Tests Vitest

- **Setup** : `src/test/setup.ts` — stub `chrome` global via `chromeMock.ts`, reset avant chaque test
- **Chrome mock** : importer `chromeMock` depuis `../chromeMock.ts` pour accéder aux `vi.fn()` typés
- **Isolation stores** : appeler `store.clear()` / `store._setStore([])` dans `beforeEach`
- **Fetch mock** : `vi.stubGlobal('fetch', vi.fn().mockResolvedValue(...))` dans chaque test
- **Timers** : `vi.useFakeTimers()` + `vi.clearAllTimers()` dans `beforeEach` pour les tests toast

```typescript
// Exemple test store
import { chromeMock } from '../chromeMock.ts'

it('load depuis storage', async () => {
  chromeMock.storage.local.get.mockImplementation((_keys, callback) => {
    callback({ key: [{ id: '1' }] })
  })
  await myStore.load()
  expect(get(myStore)).toHaveLength(1)
})
```

## Chrome Extension

- `chrome.storage.local` — via le wrapper `src/lib/storage.ts` (callback) ou direct (await, MV3)
- `chrome.tabs.create()` — ouverture d'onglets
- `chrome.runtime.lastError` — vérifier dans chaque callback storage

## Couleurs projet

- Primary : `#1e3a5f` / hover `#2a4a73`
- Background page : `bg-[#f5f5f5]`
- Cards : `bg-white border border-gray-200 rounded`

## Git

- Utiliser `/branch` et `/commit` pour les opérations git
- **NEVER** commit ou push sans demande explicite

## Roadmap

- **Phase A — TypeScript** : ✅ terminée
- **Phase B — Vitest** : ✅ terminée (66 tests)
- **Phase C — Nommage** : à faire (`loading` → `isLoading` dans search, endpoint IDs → randomUUID)
