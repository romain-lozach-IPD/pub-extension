import { describe, it, expect } from 'vitest'
import { get } from 'svelte/store'
import { chromeMock } from '../chromeMock.ts'
import { createCrudStore } from '../../lib/crudStore.ts'

interface Item {
  id: string
  name: string
  createdAt?: string
  updatedAt?: string
}

describe('createCrudStore', () => {
  it('load — charge les données depuis le storage', async () => {
    chromeMock.storage.local.get.mockImplementation((_keys: string[], callback: (r: Record<string, unknown>) => void) => {
      callback({ items: [{ id: '1', name: 'A' }] })
    })
    const store = createCrudStore<Item>('items')
    await store.load()
    expect(get(store)).toEqual([{ id: '1', name: 'A' }])
  })

  it('load — initialise avec [] en cas d\'erreur storage', async () => {
    chromeMock.storage.local.get.mockImplementation((_keys: string[], callback: (r: Record<string, unknown>) => void) => {
      chromeMock.runtime.lastError = { message: 'err' }
      callback({})
      chromeMock.runtime.lastError = undefined
    })
    const store = createCrudStore<Item>('items')
    await store.load()
    expect(get(store)).toEqual([])
  })

  it('add — génère un UUID', () => {
    const store = createCrudStore<Item>('items')
    const item = store.add({ name: 'test' })
    expect(item.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('add — génère createdAt en ISO', () => {
    const store = createCrudStore<Item>('items')
    const item = store.add({ name: 'test' })
    expect(item.createdAt).toBeDefined()
    expect(new Date(item.createdAt!).getTime()).not.toBeNaN()
  })

  it('add — appelle persist (storage.set)', () => {
    const store = createCrudStore<Item>('items')
    store.add({ name: 'test' })
    expect(chromeMock.storage.local.set).toHaveBeenCalled()
  })

  it('update — met à jour l\'item avec updatedAt', () => {
    const store = createCrudStore<Item>('items')
    const item = store.add({ name: 'avant' })
    store.update(item.id, { name: 'après' })
    const items = get(store)
    expect(items[0].name).toBe('après')
    expect(items[0].updatedAt).toBeDefined()
  })

  it('remove — supprime l\'item', () => {
    const store = createCrudStore<Item>('items')
    const item = store.add({ name: 'à supprimer' })
    store.remove(item.id)
    expect(get(store)).toHaveLength(0)
  })

  it('subscribe — notifie les abonnés lors des changements', () => {
    const store = createCrudStore<Item>('items')
    const snapshots: Item[][] = []
    store.subscribe(v => snapshots.push([...v]))
    store.add({ name: 'a' })
    store.add({ name: 'b' })
    // initial [] + 2 mutations
    expect(snapshots.length).toBeGreaterThanOrEqual(3)
    expect(snapshots[snapshots.length - 1]).toHaveLength(2)
  })
})
