import { describe, it, expect } from 'vitest'
import { chromeMock } from '../chromeMock.ts'
import { get, set, remove } from '../../lib/storage.ts'

describe('storage.get', () => {
  it('résout avec la valeur si la clé existe', async () => {
    chromeMock.storage.local.get.mockImplementation((_keys: string[], callback: (r: Record<string, unknown>) => void) => {
      callback({ myKey: 'hello' })
    })
    const result = await get<string>('myKey')
    expect(result).toBe('hello')
  })

  it('résout avec undefined si la clé est absente', async () => {
    const result = await get<string>('missing')
    expect(result).toBeUndefined()
  })

  it('rejette en cas de lastError', async () => {
    chromeMock.storage.local.get.mockImplementation((_keys: string[], callback: (r: Record<string, unknown>) => void) => {
      chromeMock.runtime.lastError = { message: 'Erreur de lecture' }
      callback({})
      chromeMock.runtime.lastError = undefined
    })
    await expect(get('key')).rejects.toThrow('Erreur de lecture')
  })
})

describe('storage.set', () => {
  it('résout quand la sauvegarde réussit', async () => {
    await expect(set('key', 'value')).resolves.toBeUndefined()
  })

  it('rejette en cas de lastError', async () => {
    chromeMock.storage.local.set.mockImplementation((_items: Record<string, unknown>, callback?: () => void) => {
      chromeMock.runtime.lastError = { message: 'Erreur écriture' }
      callback?.()
      chromeMock.runtime.lastError = undefined
    })
    await expect(set('key', 'value')).rejects.toThrow('Erreur écriture')
  })
})

describe('storage.remove', () => {
  it('résout quand la suppression réussit', async () => {
    await expect(remove('key')).resolves.toBeUndefined()
  })
})
