import { writable } from 'svelte/store'

function createEnvironmentsStore() {
  const { subscribe, set, update } = writable([])

  return {
    subscribe,
    set,
    update,

    // Charger les environnements depuis le storage
    load: async () => {
      try {
        const result = await chrome.storage.local.get(['environments'])
        if (result.environments) {
          set(result.environments)
        }
      } catch (e) {
        console.error('Erreur lors du chargement des environnements:', e)
      }
    },

    // Ajouter un nouvel environnement
    add: async (environment) => {
      const newEnv = {
        ...environment,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }
      
      update(envs => {
        const updated = [...envs, newEnv]
        chrome.storage.local.set({ environments: updated })
        return updated
      })
      
      return newEnv
    },

    // Modifier un environnement existant
    update: async (id, updates) => {
      update(envs => {
        const updated = envs.map(env => 
          env.id === id ? { ...env, ...updates, updatedAt: new Date().toISOString() } : env
        )
        chrome.storage.local.set({ environments: updated })
        return updated
      })
    },

    // Supprimer un environnement
    remove: async (id) => {
      update(envs => {
        const updated = envs.filter(env => env.id !== id)
        chrome.storage.local.set({ environments: updated })
        return updated
      })
    },

    // Définir l'environnement actif
    setActive: async (id) => {
      update(envs => {
        const updated = envs.map(env => ({
          ...env,
          isActive: env.id === id
        }))
        chrome.storage.local.set({ environments: updated })
        return updated
      })
    },

    // Obtenir l'environnement actif
    getActive: () => {
      let activeEnv = null
      subscribe(envs => {
        activeEnv = envs.find(env => env.isActive) || envs[0] || null
      })()
      return activeEnv
    }
  }
}

export const environments = createEnvironmentsStore()
