import { writable } from 'svelte/store'

export const dialogState = writable(null)

export function confirm(message) {
  return new Promise(resolve => {
    dialogState.set({
      message,
      onConfirm: () => { dialogState.set(null); resolve(true) },
      onCancel: () => { dialogState.set(null); resolve(false) }
    })
  })
}
