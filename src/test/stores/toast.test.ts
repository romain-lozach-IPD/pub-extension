import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { get } from 'svelte/store'
import { toastStore } from '../../stores/toast.ts'

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllTimers()
})

afterEach(() => {
  vi.advanceTimersByTime(10000)
  vi.useRealTimers()
})

describe('toastStore', () => {
  it('success — ajoute un toast de type success', () => {
    toastStore.success('Opération réussie')
    const items = get(toastStore)
    expect(items).toHaveLength(1)
    expect(items[0].type).toBe('success')
    expect(items[0].message).toBe('Opération réussie')
  })

  it('error — ajoute un toast de type error', () => {
    toastStore.error('Une erreur')
    expect(get(toastStore)[0].type).toBe('error')
  })

  it('auto-dismiss — supprime le toast après la durée spécifiée', () => {
    toastStore.info('Info', 2000)
    expect(get(toastStore)).toHaveLength(1)
    expect(get(toastStore)[0].type).toBe('info')
    vi.advanceTimersByTime(2000)
    expect(get(toastStore)).toHaveLength(0)
  })
})
