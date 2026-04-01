# Code Review — Correctifs

> Extension Chrome (Svelte + Vite)  
> Généré le 2026-04-01

---

## Légende

- `[ ]` À faire
- `[x]` Terminé
- `[-]` Abandonné / non applicable

---

## P0 — Critiques

- [x] **Supprimer `/src/stores/components/`** — dossier orphelin, aucun import, doublon complet de `/src/components/`
- [x] **Corriger `tasks.js` — `clear()`** — appelle `set([])` sans clé de storage, invalide
- [x] **Corriger `favorites.js` — `isFavorite()`** — subscribe/unsubscribe immédiat remplacé par variable locale `currentFavorites`
- [x] **Corriger `storage.js`** — le wrapper `get()` ne rejette jamais la Promise, `chrome.runtime.lastError` ignoré

---

## P1 — Élevés

- [x] **Nettoyer les subscriptions sans unsubscribe** — `Home.svelte` : `environments.subscribe()` remplacé par `$:` réactif ; `ApiDoc.svelte` et `LinksManager.svelte` n'avaient pas de subscription manuelle
- [x] **Corriger le manifest** — `default_path: "src/index.html"` est correct (Vite génère `dist/src/index.html`) ; `host_permissions` `localhost` → `<all_urls>` (URLs configurables par l'utilisateur)
- [x] **Remplacer le YAML parser artisanal** (`apiDoc.js`) — supprimé, remplacé par `js-yaml@4.1.1` avec fallback JSON→YAML
- [x] **Gestion d'erreurs incohérente** — `links.js` : try/catch sur `load()`, `.catch()` sur les appels storage dans les callbacks ; `apiDoc.js` : `loadFromCache()` vérifie `lastError` et wrappe le parsing ; `search.js` : déjà correct
- [x] **Race condition `search.js`** — `AbortController` : chaque nouvel appel annule le précédent, `AbortError` ignoré silencieusement

---

## P2 — Moyens

- [x] **Refactoriser les stores avec un pattern factory** — `createCrudStore(key)` dans `src/lib/crudStore.js` ; `connections`, `links`, `environments`, `favorites` migrés ; `.catch()` ajouté sur tous les appels storage de `tasks.js`
- [x] **Décomposer les composants volumineux** — modale commentaires extraite de `TasksManager.svelte` → `TaskComments.svelte` ; `ApiDoc` et `Settings` maintenus (décomposition sans valeur ajoutée nette)
- [x] **Validation des inputs** — `trim()` sur `name`/`url_api` dans `saveEnvironment()` ; validation URL via `new URL()` ; IDs migrés vers `crypto.randomUUID()` via factory (`connections`, `links`, `environments`)
- [x] **Sécurité — import de données** — `validateImportShape()` vérifie la structure de chaque item (environments, links, tasks, favorites) avant import

---

## P3 — Bas

- [-] **Ajouter TypeScript** — migration trop volumineuse pour ce cycle, à planifier séparément
- [-] **Ajouter Vitest** — idem, nécessite mocks Chrome API, à planifier séparément
- [x] **Remplacer `alert()` / `confirm()`** — `toastStore` (success/error/info) + `ConfirmDialog` async ; 17 occurrences remplacées dans 5 fichiers ; montés dans `Layout.svelte`
- [-] **Uniformiser le nommage** — cosmétique, risque de régression, à traiter lors d'une refonte TS
- [x] **Mots de passe en clair** — avertissement visible dans le formulaire environnement (`Settings.svelte`)

---

## Journal des modifications

| Date | Correctif | Fichiers modifiés |
|---|---|---|
| 2026-04-01 | Suppression de `/src/stores/components/` (dossier orphelin) | `/src/stores/components/*` |
| 2026-04-01 | Correction `clear()` : `set([])` → `setStore([])` + IDs `crypto.randomUUID()` | `tasks.js` |
| 2026-04-01 | Refactor `isFavorite()` : subscribe/unsubscribe → variable locale `currentFavorites` | `favorites.js` |
| 2026-04-01 | Correction `storage.js` : ajout `chrome.runtime.lastError` + `reject` sur `get`, `set`, `remove` | `storage.js` |
| 2026-04-01 | Suppression subscription manuelle `environments.subscribe()` → syntaxe réactive `$:` | `Home.svelte` |
| 2026-04-01 | Manifest : `host_permissions` `localhost` → `<all_urls>` | `public/manifest.json` |
| 2026-04-01 | Parser YAML artisanal supprimé → `js-yaml@4.1.1` + fallback JSON→YAML | `apiDoc.js` |
| 2026-04-01 | Gestion d'erreurs : try/catch sur `load()`, `.catch()` sur storage callbacks | `links.js` |
| 2026-04-01 | `loadFromCache()` : ajout `lastError` + try/catch sur parsing | `apiDoc.js` |
| 2026-04-01 | Race condition : `AbortController` sur `search()`, annulation requête précédente | `search.js` |
| 2026-04-01 | Factory `createCrudStore(key)` ; migration `connections`, `links`, `environments`, `favorites` | `src/lib/crudStore.js`, stores |
| 2026-04-01 | `.catch()` sur tous les appels storage dans les callbacks `update()` | `tasks.js` |
| 2026-04-01 | Extraction modale commentaires | `TaskComments.svelte` |
| 2026-04-01 | Validation URL (`new URL()`) + `trim()` dans `saveEnvironment()` | `Settings.svelte` |
| 2026-04-01 | Validation de forme complète dans `importData()` | `Settings.svelte` |
| 2026-04-01 | `alert()`/`confirm()` → `toastStore` + `ConfirmDialog` async (17 occurrences, 5 fichiers) | `toast.js`, `dialog.js`, `Toast.svelte`, `ConfirmDialog.svelte`, `Layout.svelte` |
| 2026-04-01 | Avertissement mot de passe en clair dans le formulaire environnement | `Settings.svelte` |
| 2026-04-01 | Leak `environments.subscribe` → `$:` réactif | `XmlEditor.svelte` |
