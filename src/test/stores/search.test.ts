import { describe, it, expect, vi, beforeEach } from 'vitest'
import { get } from 'svelte/store'
import { searchStore, filters } from '../../stores/search.ts'
import { environments } from '../../stores/environments.ts'
import type { SearchFilters, Environment } from '../../types.ts'

const emptyFilters: SearchFilters = {
  id: '', abonne_id: '', hcub_id: '', avis_id: '',
  consultation_id: '', reference_technique: '', login: ''
}

function makeEnv(url_api: string): Environment {
  return { id: '1', name: 'Test', url_api, url_front: 'http://front', login: '', password: '' }
}

function mockFetch(data: unknown, ok = true) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Internal Server Error',
    json: async () => data,
    headers: { get: () => 'application/json' }
  }))
}

beforeEach(() => {
  searchStore.clear()
  filters.reset()
  environments._setStore([])
})

describe('searchStore.clear', () => {
  it('réinitialise l\'état complet', () => {
    searchStore.clear()
    const s = get(searchStore)
    expect(s.results).toHaveLength(0)
    expect(s.meta).toBeNull()
    expect(s.isLoading).toBe(false)
    expect(s.error).toBeNull()
  })
})

describe('searchStore.search', () => {
  it('peuple les résultats après succès', async () => {
    const mockResults = [{ id: '1', uuid: 'abc' }]
    mockFetch({ data: mockResults, meta: { current_page: 1, last_page: 1, total: 1, from: 1, to: 1 } })
    environments._setStore([makeEnv('http://api')])
    await searchStore.search(emptyFilters)
    const s = get(searchStore)
    expect(s.results).toHaveLength(1)
    expect(s.isLoading).toBe(false)
    expect(s.error).toBeNull()
  })

  it('définit une erreur si la réponse n\'est pas ok', async () => {
    mockFetch({}, false)
    environments._setStore([makeEnv('http://api')])
    try {
      await searchStore.search(emptyFilters)
    } catch {
      // attendu
    }
    expect(get(searchStore).error).toContain('500')
    expect(get(searchStore).isLoading).toBe(false)
  })

  it('utilise l\'URL de l\'env actif', async () => {
    mockFetch({ data: [], meta: null })
    environments._setStore([makeEnv('http://my-api.com')])
    environments.setActive('1')
    await searchStore.search(emptyFilters)
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.stringContaining('http://my-api.com'),
      expect.any(Object)
    )
  })

  it('annule la requête précédente au lancement d\'une nouvelle', async () => {
    mockFetch({ data: [], meta: null })
    environments._setStore([makeEnv('http://api')])
    const p1 = searchStore.search(emptyFilters)
    const p2 = searchStore.search(emptyFilters)
    await Promise.allSettled([p1, p2])
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2)
  })

  it('n\'inclut pas les champs vides dans FormData', async () => {
    let capturedBody: FormData | undefined
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url: string, opts: RequestInit) => {
      capturedBody = opts.body as FormData
      return Promise.resolve({ ok: true, json: async () => ({ data: [], meta: null }) })
    }))
    environments._setStore([makeEnv('http://api')])
    const filters: SearchFilters = { ...emptyFilters, login: 'alice' }
    await searchStore.search(filters)
    expect(capturedBody?.get('filter[login]')).toBe('alice')
    expect(capturedBody?.has('filter[id]')).toBe(false)
  })

  it('paginationInfo — calcule hasPrevious et hasNext', async () => {
    const { paginationInfo } = await import('../../stores/search.ts')
    mockFetch({ data: [], meta: { current_page: 2, last_page: 5, total: 50, from: 11, to: 20 } })
    environments._setStore([makeEnv('http://api')])
    await searchStore.search(emptyFilters)
    const info = get(paginationInfo)
    expect(info?.hasPrevious).toBe(true)
    expect(info?.hasNext).toBe(true)
    expect(info?.currentPage).toBe(2)
  })
})
