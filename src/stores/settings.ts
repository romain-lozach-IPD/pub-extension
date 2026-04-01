import { writable } from 'svelte/store'
import { get, set } from '../lib/storage.ts'
import type { Settings } from '../types.ts'

const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  autoSave: true,
  defaultExportFormat: 'xml'
}

function createSettingsStore() {
  const { subscribe, set: setStore, update } = writable<Settings>({ ...DEFAULT_SETTINGS })

  return {
    subscribe,
    load: async (): Promise<void> => {
      const stored = await get<Settings>('settings')
      if (stored) {
        setStore(stored)
      }
    },
    updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]): void => {
      update(settings => {
        const newSettings = { ...settings, [key]: value }
        set('settings', newSettings)
        return newSettings
      })
    },
    reset: (): void => {
      const defaultSettings = { ...DEFAULT_SETTINGS }
      setStore(defaultSettings)
      set('settings', defaultSettings)
    }
  }
}

export const settings = createSettingsStore()
