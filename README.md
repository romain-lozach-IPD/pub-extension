# Chrome Side Panel Extension

Extension Chrome avec interface Svelte affichée dans le Side Panel.

## Fonctionnalités

- **Accueil** : Gestion des connexions avec recherche
- **XML** : Éditeur XML avec auto-sauvegarde et téléchargement
- **Liens** : Gestionnaire de liens utiles (CRUD complet)
- **Paramètres** : Configuration et export des données

## Installation

```bash
npm install
npm run build
```

## Chargement dans Chrome

1. Ouvrir `chrome://extensions/`
2. Activer le "Mode développeur"
3. Cliquer sur "Charger l'extension non empaquetée"
4. Sélectionner le dossier `dist/`

## Structure

- `src/components/` : Composants Svelte
- `src/stores/` : Stores Svelte (navigation, données)
- `src/lib/` : Utilitaires (storage wrapper)
- `public/` : Ressources statiques et manifest.json
- `background.js` : Service Worker

## Technologies

- Svelte 4
- TailwindCSS 3
- Vite 5
- Chrome Manifest V3
