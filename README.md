# Chrome Side Panel Extension

Extension Chrome Manifest V3 avec interface Svelte affichée dans le Side Panel.

## Fonctionnalités

### Pages principales

- **Accueil** : Recherche de comptes par ID, login, HCUB, consultation, référence technique — résultats paginés, favoris
- **Tools** : Suite d'outils de développement (voir ci-dessous)
- **Liens** : Gestionnaire de liens utiles (CRUD complet)
- **Tâches** : Gestionnaire de tâches avec commentaires, priorités et drag-drop
- **API Doc** : Documentation des endpoints API
- **Paramètres** : Configuration des environnements, export/import des données

### Tools

| Outil | Description |
|---|---|
| **Éditeur XML** | Décode/encode un token XML Base64, ouvre la page de connexion |
| **XML Viewer** | Visualise un XML en arbre interactif ou formaté, avec recherche dans l'arbre |
| **Éditeur Markdown** | Rendu HTML live d'un markdown collé |
| **JSON Viewer** | Visualise un JSON en arbre interactif ou formaté, avec recherche dans l'arbre |
| **Base64** | Encode/décode en Base64 avec détection automatique de l'encodage (UTF-8 / Latin-1) |

Le dernier outil utilisé est mémorisé et restauré à la prochaine ouverture.

## Installation

```bash
npm install
npm run build
```

## Développement

```bash
npm run dev            # serveur de dev Vite
npm run check          # vérification TypeScript (0 erreur attendu)
npm run test           # tests Vitest
npm run lint           # ESLint (0 erreur attendu)
```

## Chargement dans Chrome

1. Ouvrir `chrome://extensions/`
2. Activer le "Mode développeur"
3. Cliquer sur "Charger l'extension non empaquetée"
4. Sélectionner le dossier `dist/`

## Structure

```
src/
├── components/     # Composants Svelte (PascalCase)
├── stores/         # Stores Svelte (navigation, données)
├── lib/            # Utilitaires (storage, crudStore, xmlViewerTypes)
├── types.ts        # Types partagés (source de vérité)
public/             # manifest.json + icônes
background.ts       # Service Worker
```

## Technologies

- Svelte 4 + TypeScript
- TailwindCSS 3
- Vite 5
- Chrome Manifest V3
- marked (rendu Markdown)
- lucide-svelte (icônes)
