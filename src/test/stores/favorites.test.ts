import { describe, it, expect, beforeEach } from 'vitest'
import { get } from 'svelte/store'
import { favorites } from '../../stores/favorites.ts'

function makeResult(id: string | number) {
  return { id, uuid: `uuid-${id}` }
}

beforeEach(() => {
  favorites.clear()
})

describe('favorites', () => {
  it('add — ajoute un résultat', () => {
    favorites.add(makeResult('abc'))
    expect(get(favorites)).toHaveLength(1)
    expect(get(favorites)[0].id).toBe('abc')
  })

  it('add — n\'ajoute pas de doublon (même id)', () => {
    favorites.add(makeResult('abc'))
    favorites.add(makeResult('abc'))
    expect(get(favorites)).toHaveLength(1)
  })

  it('isFavorite — retourne true si présent', () => {
    favorites.add(makeResult('abc'))
    expect(favorites.isFavorite('abc')).toBe(true)
  })

  it('isFavorite — retourne false si absent', () => {
    expect(favorites.isFavorite('xyz')).toBe(false)
  })
})
