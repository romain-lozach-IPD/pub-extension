import { writable } from 'svelte/store'
import { get, set } from './storage.js'

/**
 * Crée un store CRUD générique persisté dans chrome.storage.local.
 * Expose : subscribe, load, add, update, remove
 * Expose _mutate et _setStore pour les stores qui étendent ce pattern.
 */
export function createCrudStore(key) {
  const { subscribe, set: setStore, update } = writable([])

  function persist(items) {
    set(key, items).catch(err => console.error(`Erreur sauvegarde ${key}:`, err))
  }

  function mutate(fn) {
    update(items => {
      const next = fn(items)
      persist(next)
      return next
    })
  }

  return {
    subscribe,
    _mutate: mutate,
    _setStore: setStore,

    load: async () => {
      try {
        const items = await get(key) || []
        setStore(items)
      } catch (err) {
        console.error(`Erreur chargement ${key}:`, err)
        setStore([])
      }
    },

    add: (item) => {
      const newItem = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      }
      mutate(items => [...items, newItem])
      return newItem
    },

    update: (id, updates) => {
      mutate(items =>
        items.map(item =>
          item.id === id
            ? { ...item, ...updates, updatedAt: new Date().toISOString() }
            : item
        )
      )
    },

    remove: (id) => {
      mutate(items => items.filter(item => item.id !== id))
    }
  }
}
