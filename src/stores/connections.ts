import { writable } from 'svelte/store'
import { createCrudStore } from '../lib/crudStore.ts'
import type { Connection } from '../types.ts'

const base = createCrudStore<Connection>('connections')

export const connections = {
  ...base,
  search: (query: string) => (items: Connection[]): Connection[] => {
    if (!query) return items
    const lower = query.toLowerCase()
    return items.filter(c =>
      c.name.toLowerCase().includes(lower) ||
      c.host.toLowerCase().includes(lower) ||
      c.username.toLowerCase().includes(lower)
    )
  }
}

export const searchQuery = writable<string>('')
