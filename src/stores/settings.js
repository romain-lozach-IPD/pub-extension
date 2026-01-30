import { writable } from 'svelte/store'
import { get, set } from '../lib/storage.js'

function createSettingsStore() {
  const { subscribe, set: setStore, update } = writable({
    theme: 'light',
    autoSave: true,
    defaultExportFormat: 'xml'
  })

  return {
    subscribe,
    load: async () => {
      const settings = await get('settings')
      if (settings) {
        setStore(settings)
      }
    },
    updateSetting: async (key, value) => {
      update(settings => {
        const newSettings = { ...settings, [key]: value }
        set('settings', newSettings)
        return newSettings
      })
    },
    reset: async () => {
      const defaultSettings = {
        theme: 'light',
        autoSave: true,
        defaultExportFormat: 'xml'
      }
      setStore(defaultSettings)
      set('settings', defaultSettings)
    }
  }
}

export const settings = createSettingsStore()
