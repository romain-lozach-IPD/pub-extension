import { writable } from 'svelte/store'

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
        
        if (contentType.includes('yaml') || url.endsWith('.yaml') || url.endsWith('.yml')) {
          spec = parseYaml(text)
        } else {
          try {
            spec = JSON.parse(text)
          } catch (e) {
            throw new Error('Impossible de parser le document comme JSON')
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
        chrome.storage.local.get(['apiDocUrl', 'apiDocSpec'], async (result) => {
          if (result.apiDocSpec) {
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
          } else {
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

function parseYaml(text) {
  const lines = text.split('\n')
  const result = {}
  const stack = [{ obj: result, indent: -1 }]
  let current = result
  
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    
    const indent = line.search(/\S/)
    const trimmed = line.trim()
    
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop()
    }
    
    current = stack[stack.length - 1].obj
    
    if (trimmed.includes(':')) {
      const colonIndex = trimmed.indexOf(':')
      const key = trimmed.substring(0, colonIndex).trim()
      const value = trimmed.substring(colonIndex + 1).trim()
      
      if (value === '' || value === '|' || value === '>') {
        current[key] = {}
        stack.push({ obj: current[key], indent })
      } else {
        current[key] = parseYamlValue(value)
      }
    }
  }
  
  return result
}

function parseYamlValue(value) {
  if (value === 'null' || value === '') return null
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === '[]') return []
  if (value === '{}') return {}
  if (!isNaN(value) && value !== '') return Number(value)
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  return value
}

export const apiDoc = createApiDocStore()
