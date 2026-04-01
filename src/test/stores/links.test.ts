import { describe, it, expect, beforeEach } from 'vitest'
import { get } from 'svelte/store'
import { links } from '../../stores/links.ts'

beforeEach(() => {
  links._setStore([])
})

describe('links.reorder', () => {
  it('déplace un item vers la fin', () => {
    links._setStore([
      { id: '1', name: 'A', url: 'a' },
      { id: '2', name: 'B', url: 'b' },
      { id: '3', name: 'C', url: 'c' }
    ])
    links.reorder('1', 2)
    expect(get(links).map(l => l.id)).toEqual(['2', '3', '1'])
  })

  it('déplace un item vers le début', () => {
    links._setStore([
      { id: '1', name: 'A', url: 'a' },
      { id: '2', name: 'B', url: 'b' },
      { id: '3', name: 'C', url: 'c' }
    ])
    links.reorder('3', 0)
    expect(get(links).map(l => l.id)).toEqual(['3', '1', '2'])
  })

  it('no-op si l\'id est introuvable', () => {
    links._setStore([{ id: '1', name: 'A', url: 'a' }])
    links.reorder('inexistant', 0)
    expect(get(links)).toHaveLength(1)
    expect(get(links)[0].id).toBe('1')
  })
})
