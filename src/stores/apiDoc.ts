import { writable } from 'svelte/store'
import jsYaml from 'js-yaml'
import type { OpenApiEndpoint, ApiDocGroup, OpenApiSpec } from '../types.ts'

interface ApiDocState {
  endpoints: ApiDocGroup[]
  selectedId: string | null
  filter: string
  isLoading: boolean
  error: string | null
  isLoaded: boolean
}

function createApiDocStore() {
  const { subscribe, set, update } = writable<ApiDocState>({
    endpoints: [],
    selectedId: null,
    filter: '',
    isLoading: false,
    error: null,
    isLoaded: false
  })

  function parseOpenApiSpec(spec: OpenApiSpec): OpenApiEndpoint[] {
    const endpoints: OpenApiEndpoint[] = []
    const paths = spec.paths ?? {}
    const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head']

    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, details] of Object.entries(methods)) {
        if (HTTP_METHODS.includes(method)) {
          const d = details as Record<string, unknown>
          const endpointTags = (d.tags as string[] | undefined) ?? ['Untagged']

          for (const tag of endpointTags) {
            endpoints.push({
              id: `${method}-${path}-${tag}`,
              method: method.toUpperCase(),
              path,
              summary: (d.summary as string | undefined) ?? '',
              description: (d.description as string | undefined) ?? '',
              parameters: (d.parameters as OpenApiEndpoint['parameters'] | undefined) ?? [],
              requestBody: (d.requestBody as OpenApiEndpoint['requestBody'] | undefined) ?? null,
              responses: (d.responses as OpenApiEndpoint['responses'] | undefined) ?? {},
              tags: endpointTags,
              tag,
              operationId: d.operationId as string | undefined
            })
          }
        }
      }
    }

    return endpoints
  }

  function groupByTag(endpoints: OpenApiEndpoint[]): ApiDocGroup[] {
    const groups: Record<string, ApiDocGroup> = {}

    for (const endpoint of endpoints) {
      const { tag } = endpoint
      if (!groups[tag]) {
        groups[tag] = { name: tag, endpoints: [] }
      }
      groups[tag].endpoints.push(endpoint)
    }

    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name))
  }

  return {
    subscribe,

    loadFromUrl: async (url: string): Promise<{ success: boolean; error?: string }> => {
      update(state => ({ ...state, isLoading: true, error: null }))

      try {
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`)
        }

        const contentType = response.headers.get('content-type') ?? ''
        const text = await response.text()

        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          throw new Error('La réponse n\'est pas un document JSON/YAML valide (HTML reçu)')
        }

        let spec: OpenApiSpec

        const isYaml = contentType.includes('yaml') || url.endsWith('.yaml') || url.endsWith('.yml')
        if (isYaml) {
          spec = jsYaml.load(text) as OpenApiSpec
        } else {
          try {
            spec = JSON.parse(text) as OpenApiSpec
          } catch {
            try {
              spec = jsYaml.load(text) as OpenApiSpec
            } catch {
              throw new Error('Impossible de parser le document comme JSON ou YAML')
            }
          }
        }

        if (!spec.openapi && !spec.swagger) {
          throw new Error('Document OpenAPI/Swagger invalide')
        }

        const endpoints = parseOpenApiSpec(spec)
        const grouped = groupByTag(endpoints)

        await chrome.storage.local.set({
          apiDocUrl: url,
          apiDocSpec: spec
        })

        update(state => ({
          ...state,
          endpoints: grouped,
          isLoading: false,
          isLoaded: true,
          error: null
        }))

        return { success: true }
      } catch (err) {
        update(state => ({
          ...state,
          isLoading: false,
          error: (err as Error).message
        }))
        return { success: false, error: (err as Error).message }
      }
    },

    loadFromCache: (): Promise<{ success: boolean; url?: string }> => {
      return new Promise(resolve => {
        chrome.storage.local.get(['apiDocUrl', 'apiDocSpec'], result => {
          if (chrome.runtime.lastError) {
            console.error('Erreur chargement cache API doc:', chrome.runtime.lastError.message)
            return resolve({ success: false })
          }
          if (!result['apiDocSpec']) {
            return resolve({ success: false })
          }
          try {
            const endpoints = parseOpenApiSpec(result['apiDocSpec'] as OpenApiSpec)
            const grouped = groupByTag(endpoints)
            update(state => ({
              ...state,
              endpoints: grouped,
              isLoading: false,
              isLoaded: true,
              error: null
            }))
            resolve({ success: true, url: result['apiDocUrl'] as string | undefined })
          } catch (err) {
            console.error('Erreur parsing cache API doc:', err)
            resolve({ success: false })
          }
        })
      })
    },

    select: (id: string): void => {
      update(state => ({
        ...state,
        selectedId: state.selectedId === id ? null : id
      }))
    },

    setFilter: (filter: string): void => {
      update(state => ({ ...state, filter }))
    },

    reset: (): void => {
      set({
        endpoints: [],
        selectedId: null,
        filter: '',
        isLoading: false,
        error: null,
        isLoaded: false
      })
    }
  }
}

export const apiDoc = createApiDocStore()
