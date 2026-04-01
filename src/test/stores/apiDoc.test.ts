import { describe, it, expect, vi, beforeEach } from 'vitest'
import { get } from 'svelte/store'
import { chromeMock } from '../chromeMock.ts'
import { apiDoc } from '../../stores/apiDoc.ts'
import type { OpenApiSpec } from '../../types.ts'

const minimalSpec: OpenApiSpec = {
  openapi: '3.0.0',
  paths: {
    '/users': {
      get: {
        summary: 'Liste des utilisateurs',
        tags: ['Users'],
        parameters: [],
        responses: {}
      }
    }
  }
}

function mockFetch(body: string, ok = true, contentType = 'application/json') {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Server Error',
    headers: { get: (h: string) => h === 'content-type' ? contentType : null },
    text: async () => body
  }))
}

beforeEach(() => {
  apiDoc.reset()
})

describe('apiDoc.loadFromUrl', () => {
  it('retourne success:false si la réponse est du HTML', async () => {
    mockFetch('<!DOCTYPE html><html></html>')
    const result = await apiDoc.loadFromUrl('http://api/doc')
    expect(result.success).toBe(false)
    expect(result.error).toContain('HTML')
  })

  it('parse le JSON correctement', async () => {
    mockFetch(JSON.stringify(minimalSpec))
    const result = await apiDoc.loadFromUrl('http://api/doc.json')
    expect(result.success).toBe(true)
    expect(get(apiDoc).endpoints.length).toBeGreaterThan(0)
    expect(get(apiDoc).isLoaded).toBe(true)
  })

  it('parse le YAML via content-type yaml', async () => {
    const yaml = 'openapi: "3.0.0"\npaths:\n  /test:\n    get:\n      summary: test\n      tags: [Tag]\n      parameters: []\n      responses: {}'
    mockFetch(yaml, true, 'application/yaml')
    const result = await apiDoc.loadFromUrl('http://api/doc')
    expect(result.success).toBe(true)
  })

  it('fallback YAML quand JSON échoue', async () => {
    const yaml = 'openapi: "3.0.0"\npaths:\n  /test:\n    get:\n      summary: test\n      tags: [Tag]\n      parameters: []\n      responses: {}'
    mockFetch(yaml, true, 'text/plain')
    const result = await apiDoc.loadFromUrl('http://api/doc')
    expect(result.success).toBe(true)
  })

  it('retourne success:false si la spec est invalide', async () => {
    mockFetch(JSON.stringify({ info: { title: 'sans openapi' } }))
    const result = await apiDoc.loadFromUrl('http://api/doc.json')
    expect(result.success).toBe(false)
    expect(result.error).toContain('invalide')
  })
})

describe('apiDoc — parsing', () => {
  it('structure correcte de l\'endpoint parsé', async () => {
    mockFetch(JSON.stringify(minimalSpec))
    await apiDoc.loadFromUrl('http://api/doc.json')
    const groups = get(apiDoc).endpoints
    expect(groups).toHaveLength(1)
    expect(groups[0].name).toBe('Users')
    expect(groups[0].endpoints[0].method).toBe('GET')
    expect(groups[0].endpoints[0].path).toBe('/users')
  })

  it('groupByTag — trie les groupes par ordre alphabétique', async () => {
    const spec: OpenApiSpec = {
      openapi: '3.0.0',
      paths: {
        '/z': { get: { tags: ['Zebra'], summary: '', parameters: [], responses: {} } },
        '/a': { get: { tags: ['Alpha'], summary: '', parameters: [], responses: {} } }
      }
    }
    mockFetch(JSON.stringify(spec))
    await apiDoc.loadFromUrl('http://api/doc.json')
    const names = get(apiDoc).endpoints.map(g => g.name)
    expect(names).toEqual([...names].sort())
  })
})

describe('apiDoc.loadFromCache', () => {
  it('charge et parse la spec depuis chrome.storage', async () => {
    chromeMock.storage.local.get.mockImplementation((_keys: string[], callback: (r: Record<string, unknown>) => void) => {
      callback({ apiDocUrl: 'http://api/doc', apiDocSpec: minimalSpec })
    })
    const result = await apiDoc.loadFromCache()
    expect(result.success).toBe(true)
    expect(result.url).toBe('http://api/doc')
    expect(get(apiDoc).isLoaded).toBe(true)
    expect(get(apiDoc).endpoints.length).toBeGreaterThan(0)
  })

  it('retourne success:false si le cache est vide', async () => {
    const result = await apiDoc.loadFromCache()
    expect(result.success).toBe(false)
  })
})
