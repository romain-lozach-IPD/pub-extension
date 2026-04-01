import { createCrudStore } from '../lib/crudStore.js'

const base = createCrudStore('favorites')

let currentFavorites = []
base.subscribe(favs => { currentFavorites = favs })

export const favorites = {
  ...base,

  // Override : conserve l'id existant de l'item et vérifie les doublons
  add: (item) => {
    if (currentFavorites.some(f => f.id === item.id)) return
    base._mutate(favs => [...favs, { ...item, addedAt: new Date().toISOString() }])
  },

  isFavorite: (id) => currentFavorites.some(f => f.id === id),

  clear: () => base._setStore([])
}
