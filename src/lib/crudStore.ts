import { writable } from 'svelte/store'
import { get, set } from './storage.ts'

export interface CrudStore<T extends { id: string | number }> {
  subscribe: ReturnType<typeof writable<T[]>>['subscribe']
  _mutate: (fn: (items: T[]) => T[]) => void
  _setStore: (value: T[]) => void
  load: () => Promise<void>
  add: (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => T
  update: (id: string | number, updates: Partial<Omit<T, 'id'>>) => void
  remove: (id: string | number) => void
}

export function createCrudStore<T extends { id: string | number }>(key: string): CrudStore<T> {
  const { subscribe, set: setStore, update } = writable<T[]>([])

  function persist(items: T[]): void {
    set(key, items).catch(err => console.error(`Erreur sauvegarde ${key}:`, err))
  }

  function mutate(fn: (items: T[]) => T[]): void {
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

    load: async (): Promise<void> => {
      try {
        const items = await get<T[]>(key) ?? []
        setStore(items)
      } catch (err) {
        console.error(`Erreur chargement ${key}:`, err)
        setStore([])
      }
    },

    add: (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T => {
      const newItem = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      } as unknown as T
      mutate(items => [...items, newItem])
      return newItem
    },

    update: (id: string | number, updates: Partial<Omit<T, 'id'>>): void => {
      mutate(items =>
        items.map(item =>
          item.id === id
            ? { ...item, ...updates, updatedAt: new Date().toISOString() }
            : item
        )
      )
    },

    remove: (id: string | number): void => {
      mutate(items => items.filter(item => item.id !== id))
    }
  }
}
