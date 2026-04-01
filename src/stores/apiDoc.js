import { writable } from 'svelte/store'
import jsYaml from 'js-yaml'

function createApiDocStore() {
  const { subscribe, set, update } = writable({
    endpoints: [],
    selectedId: null,
    filter: '',
    isLoading: false,
    error: null,
    isLoaded: false
  })

  function parseOpenApiSpec(spec) {
    const endpoints = []
    const paths = spec.paths || {}
    const tags = spec.tags || []

    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, details] of Object.entries(methods)) {
        if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
          const endpointTags = details.tags || ['Untagged']
          
          for (const tag of endpointTags) {
            endpoints.push({
              id: `${method}-${path}-${tag}`,
              method: method.toUpperCase(),
              path,
              summary: details.summary || '',
              description: details.description || '',
              parameters: details.parameters || [],
              requestBody: details.requestBody || null,
              responses: details.responses || {},
              tags: endpointTags,
              tag
            })
          }
        }
      }
    }

    return endpoints
  }

  function groupByTag(endpoints) {
    const groups = {}
    
    for (const endpoint of endpoints) {
      const tag = endpoint.tag
      if (!groups[tag]) {
        groups[tag] = {
          name: tag,
          endpoints: []
        }
      }
      groups[tag].endpoints.push(endpoint)
    }

    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name))
  }

  return {
    subscribe,

    loadFromUrl: async (url) => {
      update(state => ({ ...state, isLoading: true, error: null }))
      
      try {
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`)
        }
        
        const contentType = response.headers.get('content-type') || ''
        const text = await response.text()
        
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          throw new Error('La réponse n\'est pas un document JSON/YAML valide (HTML reçu)')
        }
        
        let spec
        
        const isYaml = contentType.includes('yaml') || url.endsWith('.yaml') || url.endsWith('.yml')
        if (isYaml) {
          spec = jsYaml.load(text)
        } else {
          try {
            spec = JSON.parse(text)
          } catch {
            // Tentative de parsing YAML en fallback (certains serveurs ne définissent pas le content-type)
            try {
              spec = jsYaml.load(text)
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
          error: err.message
        }))
        return { success: false, error: err.message }
      }
    },

    loadFromCache: async () => {
      return new Promise((resolve) => {
        chrome.storage.local.get(['apiDocUrl', 'apiDocSpec'], (result) => {
          if (chrome.runtime.lastError) {
            console.error('Erreur chargement cache API doc:', chrome.runtime.lastError.message)
            return resolve({ success: false })
          }
          if (!result.apiDocSpec) {
            return resolve({ success: false })
          }
          try {
            const endpoints = parseOpenApiSpec(result.apiDocSpec)
            const grouped = groupByTag(endpoints)
            update(state => ({
              ...state,
              endpoints: grouped,
              isLoading: false,
              isLoaded: true,
              error: null
            }))
            resolve({ success: true, url: result.apiDocUrl })
          } catch (err) {
            console.error('Erreur parsing cache API doc:', err)
            resolve({ success: false })
          }
        })
      })
    },

    select: (id) => {
      update(state => ({
        ...state,
        selectedId: state.selectedId === id ? null : id
      }))
    },

    setFilter: (filter) => {
      update(state => ({ ...state, filter }))
    },

    reset: () => {
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
