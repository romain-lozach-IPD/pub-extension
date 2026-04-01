import { writable, derived } from 'svelte/store'
import { environments } from './environments.ts'
import type { SearchFilters, SearchMeta, SearchResult } from '../types.ts'

const EMPTY_FILTERS: SearchFilters = {
  id: '',
  abonne_id: '',
  hcub_id: '',
  avis_id: '',
  consultation_id: '',
  reference_technique: '',
  login: ''
}

function createFiltersStore() {
  const { subscribe, set, update } = writable<SearchFilters>({ ...EMPTY_FILTERS })

  return {
    subscribe,
    set,
    update,
    reset: (): void => set({ ...EMPTY_FILTERS }),
    setField: (field: keyof SearchFilters, value: string): void => {
      update(f => ({ ...f, [field]: value }))
    }
  }
}

export const filters = createFiltersStore()

interface SearchState {
  results: SearchResult[]
  meta: SearchMeta | null
  isLoading: boolean
  error: string | null
}

function createSearchStore() {
  const { subscribe, set, update } = writable<SearchState>({
    results: [],
    meta: null,
    isLoading: false,
    error: null
  })

  let currentAbortController: AbortController | null = null

  return {
    subscribe,
    set,
    update,

    search: async (filtersData: SearchFilters, page = 1): Promise<unknown> => {
      if (currentAbortController) {
        currentAbortController.abort()
      }
      currentAbortController = new AbortController()
      const signal = currentAbortController.signal

      update(s => ({ ...s, isLoading: true, error: null }))

      try {
        const activeEnv = environments.getActive()
        const apiBase = activeEnv?.url_api ?? 'http://localhost'

        const formData = new FormData()
        const numericKeys = ['id', 'abonne_id', 'avis_id', 'consultation_id'] as const
        Object.entries(filtersData).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            if ((numericKeys as readonly string[]).includes(key)) {
              formData.append(`filter[${key}]`, String(parseInt(value, 10)))
            } else {
              formData.append(`filter[${key}]`, value)
            }
          }
        })

        const headers: Record<string, string> = {
          'Accept': 'application/json'
        }

        if (activeEnv?.login && activeEnv?.password) {
          const credentials = btoa(`${activeEnv.login}:${activeEnv.password}`)
          headers['Authorization'] = `Basic ${credentials}`
        }

        const response = await fetch(`${apiBase}/api/v1/extension/get-token?page=${page}`, {
          method: 'POST',
          headers,
          body: formData,
          signal
        })

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`)
        }

        const data = await response.json() as { data?: SearchResult[]; meta?: SearchMeta }

        update(s => ({
          ...s,
          results: data.data ?? [],
          meta: data.meta ?? null,
          isLoading: false,
          error: null
        }))

        return data
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return
        }
        update(s => ({
          ...s,
          results: [],
          meta: null,
          isLoading: false,
          error: (err as Error).message || 'Erreur de connexion au serveur'
        }))
        throw err
      }
    },

    clear: (): void => {
      set({
        results: [],
        meta: null,
        isLoading: false,
        error: null
      })
    }
  }
}

export const searchStore = createSearchStore()

interface PaginationInfo {
  currentPage: number
  lastPage: number
  total: number
  from: number
  to: number
  hasPrevious: boolean
  hasNext: boolean
}

export const paginationInfo = derived<typeof searchStore, PaginationInfo | null>(
  searchStore,
  $search => {
    if (!$search.meta) return null

    return {
      currentPage: $search.meta.current_page,
      lastPage: $search.meta.last_page,
      total: $search.meta.total,
      from: $search.meta.from,
      to: $search.meta.to,
      hasPrevious: $search.meta.current_page > 1,
      hasNext: $search.meta.current_page < $search.meta.last_page
    }
  }
)
