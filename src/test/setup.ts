import { vi, beforeEach } from 'vitest'
import { chromeMock, resetMocks } from './chromeMock.ts'

vi.stubGlobal('chrome', chromeMock)

beforeEach(() => {
  resetMocks()
})
