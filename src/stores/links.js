import { writable } from 'svelte/store'
import { get, set } from '../lib/storage.js'

function createLinksStore() {
  const { subscribe, set: setStore, update } = writable([])

  return {
    subscribe,
    load: async () => {
      const links = await get('links') || []
      setStore(links)
    },
    add: async (link) => {
      const newLink = {
        ...link,
        id: Date.now(),
        createdAt: new Date().toISOString()
      }
      update(links => {
        const newLinks = [...links, newLink]
        set('links', newLinks)
        return newLinks
      })
    },
    update: async (id, updates) => {
      update(links => {
        const newLinks = links.map(l => 
          l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
        )
        set('links', newLinks)
        return newLinks
      })
    },
    remove: async (id) => {
      update(links => {
        const newLinks = links.filter(l => l.id !== id)
        set('links', newLinks)
        return newLinks
      })
    }
  }
}

export const links = createLinksStore()
