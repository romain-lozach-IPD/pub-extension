import { vi } from 'vitest'

export let storageData: Record<string, unknown> = {}

export const mockGet = vi.fn()
export const mockSet = vi.fn()
export const mockRemove = vi.fn()

export const chromeMock = {
  storage: {
    local: {
      get: mockGet,
      set: mockSet,
      remove: mockRemove
    }
  },
  runtime: {
    lastError: undefined as { message: string } | undefined,
    onMessage: { addListener: vi.fn() }
  },
  tabs: { create: vi.fn() },
  sidePanel: { setPanelBehavior: vi.fn() },
  action: { onClicked: { addListener: vi.fn() } }
}

export function resetMocks(): void {
  storageData = {}
  chromeMock.runtime.lastError = undefined

  mockGet.mockImplementation((keys: string[], callback: (result: Record<string, unknown>) => void) => {
    const result: Record<string, unknown> = {}
    const keyArr = Array.isArray(keys) ? keys : [keys]
    for (const key of keyArr) {
      if (key in storageData) result[key] = storageData[key]
    }
    if (callback) {
      callback(result)
      return undefined
    }
    return Promise.resolve(result)
  })

  mockSet.mockImplementation((items: Record<string, unknown>, callback?: () => void) => {
    Object.assign(storageData, items)
    if (callback) {
      callback()
      return undefined
    }
    return Promise.resolve()
  })

  mockRemove.mockImplementation((keys: string | string[], callback?: () => void) => {
    const keyArr = Array.isArray(keys) ? keys : [keys]
    for (const key of keyArr) delete storageData[key]
    if (callback) {
      callback()
      return undefined
    }
    return Promise.resolve()
  })
}
