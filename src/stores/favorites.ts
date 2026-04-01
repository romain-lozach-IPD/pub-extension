import { createCrudStore } from '../lib/crudStore.ts'
import type { SearchResult } from '../types.ts'

const base = createCrudStore<SearchResult>('favorites')

let currentFavorites: SearchResult[] = []
base.subscribe(favs => { currentFavorites = favs })

export const favorites = {
  ...base,

  add: (item: SearchResult): void => {
    if (currentFavorites.some(f => f.id === item.id)) return
    base._mutate(favs => [...favs, { ...item, addedAt: new Date().toISOString() }])
  },

  isFavorite: (id: string | number): boolean => currentFavorites.some(f => f.id === id),

  clear: (): void => base._setStore([])
}
