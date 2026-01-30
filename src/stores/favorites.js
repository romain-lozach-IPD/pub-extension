import { writable } from 'svelte/store'

// Store pour les favoris
function createFavoritesStore() {
  const { subscribe, set, update } = writable([])

  return {
    subscribe,
    
    // Charger les favoris depuis le storage
    load: async () => {
      try {
        const result = await chrome.storage.local.get(['favorites'])
        set(result.favorites || [])
      } catch (err) {
        console.error('Erreur chargement favoris:', err)
        set([])
      }
    },

    // Ajouter un favori
    add: async (item) => {
      try {
        const result = await chrome.storage.local.get(['favorites'])
        const favorites = result.favorites || []
        
        // Vérifier si déjà présent
        const exists = favorites.some(f => f.id === item.id)
        if (exists) return
        
        const newFavorites = [...favorites, {
          ...item,
          addedAt: new Date().toISOString()
        }]
        
        await chrome.storage.local.set({ favorites: newFavorites })
        set(newFavorites)
      } catch (err) {
        console.error('Erreur ajout favori:', err)
      }
    },

    // Supprimer un favori
    remove: async (id) => {
      try {
        const result = await chrome.storage.local.get(['favorites'])
        const favorites = result.favorites || []
        
        const newFavorites = favorites.filter(f => f.id !== id)
        
        await chrome.storage.local.set({ favorites: newFavorites })
        set(newFavorites)
      } catch (err) {
        console.error('Erreur suppression favori:', err)
      }
    },

    // Vérifier si un item est en favori
    isFavorite: (id) => {
      let isFav = false
      const unsubscribe = subscribe(favorites => {
        isFav = favorites.some(f => f.id === id)
      })
      unsubscribe()
      return isFav
    },

    clear: () => set([])
  }
}

export const favorites = createFavoritesStore()
