# CLAUDE.md — Chrome Side Panel Extension

Extension Chrome Manifest V3 : side panel Svelte 4 + TypeScript + TailwindCSS 3 + Vite 5.

## Commandes

```bash
npm run dev            # serveur de dev Vite
npm run build          # build prod → dist/
npm run check          # svelte-check TypeScript (doit retourner 0 erreur)
npm run test           # vitest (66 tests, doit tous passer)
npm run test:coverage  # couverture de code
npm run lint           # ESLint (0 erreur attendu)
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
│   │   ├── Layout.svelte         # Sidebar nav + header + slot contenu
│   │   ├── Home.svelte           # Recherche de comptes (filtres + résultats + favoris)
│   │   ├── Tools.svelte          # Page Tools : onglets internes, dernier outil mémorisé
│   │   ├── XmlEditor.svelte      # Connexion XML token (Base64)
│   │   ├── XmlViewer.svelte      # Visualiseur XML (arbre + formaté + recherche)
│   │   ├── XmlTreeNode.svelte    # Nœud récursif pour XmlViewer
│   │   ├── JsonViewer.svelte     # Visualiseur JSON (arbre + formaté + recherche)
│   │   ├── JsonTreeNode.svelte   # Nœud récursif pour JsonViewer
│   │   ├── MarkdownEditor.svelte # Éditeur Markdown → rendu HTML live
│   │   ├── Base64Tool.svelte     # Encode/décode Base64 (détection UTF-8/Latin-1 auto)
│   │   ├── LinksManager.svelte
│   │   ├── TasksManager.svelte
│   │   ├── TaskComments.svelte
│   │   ├── ApiDoc.svelte
│   │   ├── Settings.svelte
│   │   ├── CodeEditor.svelte
│   │   ├── ConfirmDialog.svelte
│   │   └── Toast.svelte
│   ├── stores/                   # camelCase.ts
│   └── lib/
│       ├── storage.ts            # wrapper chrome.storage.local
│       ├── crudStore.ts          # générique createCrudStore<T>
│       └── xmlViewerTypes.ts     # Types XmlNodeData + helpers parse/format/search XML
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

## Navigation

La navigation est gérée par `src/stores/navigation.ts` :

- `currentPage` : store writable du nom de page active
- `pages[]` : tableau des entrées sidebar (id, label, icône lucide-svelte)
- `openEditorWithData(xmlToken)` : navigue vers `tools` et active l'onglet XML

Pages disponibles : `home` | `tools` | `links` | `tasks` | `apidoc` | `settings`

### Page Tools

`Tools.svelte` regroupe 5 outils dans un menu d'onglets interne. Le dernier outil actif est mémorisé dans `chrome.storage.local` (clé `lastActiveTool`).

| Onglet | Composant | Description |
|---|---|---|
| Connexion XML | `XmlEditor.svelte` | Décode/encode token Base64 XML, ouvre la page de connexion |
| XML Viewer | `XmlViewer.svelte` | Arbre interactif + formatage + recherche dans l'arbre |
| Éditeur Markdown | `MarkdownEditor.svelte` | Rendu HTML live via `marked` |
| JSON Viewer | `JsonViewer.svelte` | Arbre interactif + formatage + recherche dans l'arbre |
| Base64 | `Base64Tool.svelte` | Encode/décode avec détection auto UTF-8 / Latin-1 |

## Arbre interactif (XML et JSON)

Les composants `XmlTreeNode` et `JsonTreeNode` sont récursifs (`<svelte:self>`).

**Règle critique — réactivité Svelte 4 :** les fonctions appelées dans les templates ne tracent que les variables passées en argument explicite. Pour que `{@html hl(text, searchQuery)}` se rende à jour à chaque frappe, `searchQuery` **doit** être passé en paramètre :

```typescript
// ✅ Svelte trace searchQuery comme dépendance
function hl(text: string, query: string): string { ... }
// template : {@html hl(tagName, searchQuery)}

// ❌ Svelte ne re-rend pas quand searchQuery change
function hl(text: string): string { /* lit searchQuery via closure */ }
// template : {@html hl(tagName)}
```

**Comportement recherche :**
- `selfMatch` / `descendantMatch` : calculés en `$:` (réactifs)
- `effectiveExpanded = searchQuery ? descendantMatch : isExpanded` — auto-expand si descendant matche
- `dimmed = searchQuery && !selfMatch && !descendantMatch` — opacity-30 si hors résultats

## TypeScript — règles Svelte 4

Le compilateur Svelte 4 parse les templates HTML **avant** TypeScript. Deux contraintes importantes :

1. **Pas de `as Type` dans les templates** — cause des erreurs de parsing Svelte. Extraire la logique dans une fonction typée dans `<script lang="ts">`.

2. **Pas de types objets inline dans les templates** — extraire en helper.

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
- **Phase C — Nommage** : ✅ terminée (`loading` → `isLoading`, endpoint IDs → randomUUID, ESLint configuré)
- **Phase D — Tools** : ✅ terminée (XML Viewer, JSON Viewer, Markdown, Base64, regroupement Tools)
