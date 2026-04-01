import { describe, it, expect, beforeEach } from 'vitest'
import { get } from 'svelte/store'
import { chromeMock } from '../chromeMock.ts'
import { settings } from '../../stores/settings.ts'

beforeEach(() => {
  settings.reset()
})

describe('settings', () => {
  it('load — charge les paramètres depuis le storage', async () => {
    chromeMock.storage.local.get.mockImplementation((_keys: string[], callback: (r: Record<string, unknown>) => void) => {
      callback({ settings: { theme: 'dark', autoSave: false, defaultExportFormat: 'json' } })
    })
    await settings.load()
    const s = get(settings)
    expect(s.theme).toBe('dark')
    expect(s.autoSave).toBe(false)
    expect(s.defaultExportFormat).toBe('json')
  })

  it('updateSetting — met à jour une clé et persiste', () => {
    settings.updateSetting('theme', 'dark')
    expect(get(settings).theme).toBe('dark')
    expect(chromeMock.storage.local.set).toHaveBeenCalled()
  })

  it('reset — restaure les valeurs par défaut', () => {
    settings.updateSetting('theme', 'dark')
    settings.updateSetting('autoSave', false)
    settings.reset()
    const s = get(settings)
    expect(s.theme).toBe('light')
    expect(s.autoSave).toBe(true)
    expect(s.defaultExportFormat).toBe('xml')
  })
})
