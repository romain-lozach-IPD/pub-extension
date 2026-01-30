import { writable } from 'svelte/store'
import { get, set } from '../lib/storage.js'

function createConnectionsStore() {
  const { subscribe, set: setStore, update } = writable([])

  return {
    subscribe,
    load: async () => {
      const connections = await get('connections') || []
      setStore(connections)
    },
    add: async (connection) => {
      const newConnection = {
        ...connection,
        id: Date.now(),
        createdAt: new Date().toISOString()
      }
      update(connections => {
        const newConnections = [...connections, newConnection]
        set('connections', newConnections)
        return newConnections
      })
    },
    remove: async (id) => {
      update(connections => {
        const newConnections = connections.filter(c => c.id !== id)
        set('connections', newConnections)
        return newConnections
      })
    },
    search: (query) => {
      // Retourne une fonction de filtrage
      return (connections) => {
        if (!query) return connections
        const lowerQuery = query.toLowerCase()
        return connections.filter(c => 
          c.name.toLowerCase().includes(lowerQuery) ||
          c.host.toLowerCase().includes(lowerQuery) ||
          c.username.toLowerCase().includes(lowerQuery)
        )
      }
    }
  }
}

export const connections = createConnectionsStore()
export const searchQuery = writable('')
