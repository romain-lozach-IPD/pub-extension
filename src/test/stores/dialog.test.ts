import { describe, it, expect } from 'vitest'
import { get } from 'svelte/store'
import { confirm, dialogState } from '../../stores/dialog.ts'

describe('dialog.confirm', () => {
  it('résout true quand onConfirm est appelé', async () => {
    const promise = confirm('Supprimer ?')
    get(dialogState)?.onConfirm()
    await expect(promise).resolves.toBe(true)
  })

  it('résout false quand onCancel est appelé', async () => {
    const promise = confirm('Supprimer ?')
    get(dialogState)?.onCancel()
    await expect(promise).resolves.toBe(false)
  })
})
