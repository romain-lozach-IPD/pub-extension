import { writable } from 'svelte/store'
import { createCrudStore } from '../lib/crudStore.js'

const base = createCrudStore('connections')

export const connections = {
  ...base,
  search: (query) => (items) => {
    if (!query) return items
    const lower = query.toLowerCase()
    return items.filter(c =>
      c.name.toLowerCase().includes(lower) ||
      c.host.toLowerCase().includes(lower) ||
      c.username.toLowerCase().includes(lower)
    )
  }
}

export const searchQuery = writable('')
