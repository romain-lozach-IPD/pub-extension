import { writable, derived } from 'svelte/store'

// Store pour les filtres
function createFiltersStore() {
  const { subscribe, set, update } = writable({
    id: '',
    abonne_id: '',
    hcub_id: '',
    avis_id: '',
    consultation_id: '',
    reference_technique: '',
    login: ''
  })

  return {
    subscribe,
    set,
    update,
    reset: () => set({
      id: '',
      abonne_id: '',
      hcub_id: '',
      avis_id: '',
      consultation_id: '',
      reference_technique: '',
      login: ''
    }),
    setField: (field, value) => {
      update(f => ({ ...f, [field]: value }))
    }
  }
}

export const filters = createFiltersStore()

// Store pour les résultats de recherche
function createSearchStore() {
  const { subscribe, set, update } = writable({
    results: [],
    meta: null,
    loading: false,
    error: null
  })

  return {
    subscribe,
    set,
    update,
    
    // Fonction de recherche
    search: async (filtersData, page = 1) => {
      update(s => ({ ...s, loading: true, error: null }))
      
      try {
        // Construction du FormData avec syntaxe Spatie Query Builder
        const formData = new FormData()
        Object.entries(filtersData).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            // Convertir en nombre si c'est un ID
            if (['id', 'abonne_id', 'avis_id', 'consultation_id'].includes(key)) {
              formData.append(`filter[${key}]`, parseInt(value, 10))
            } else {
              formData.append(`filter[${key}]`, value)
            }
          }
        })

        const response = await fetch(`http://localhost/api/v1/extension/get-token?page=${page}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          body: formData
        })

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        
        update(s => ({
          ...s,
          results: data.data || [],
          meta: data.meta || null,
          loading: false,
          error: null
        }))

        return data
      } catch (err) {
        update(s => ({
          ...s,
          results: [],
          meta: null,
          loading: false,
          error: err.message || 'Erreur de connexion au serveur'
        }))
        throw err
      }
    },

    clear: () => {
      set({
        results: [],
        meta: null,
        loading: false,
        error: null
      })
    }
  }
}

export const searchStore = createSearchStore()

// Store dérivé pour la pagination
export const paginationInfo = derived(searchStore, $search => {
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
})
