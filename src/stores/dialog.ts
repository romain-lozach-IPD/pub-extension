import { writable } from 'svelte/store'
import type { DialogState } from '../types.ts'

export const dialogState = writable<DialogState | null>(null)

export function confirm(message: string): Promise<boolean> {
  return new Promise(resolve => {
    dialogState.set({
      message,
      onConfirm: () => { dialogState.set(null); resolve(true) },
      onCancel: () => { dialogState.set(null); resolve(false) }
    })
  })
}
