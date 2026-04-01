import { writable } from 'svelte/store'

const toasts = writable([])

function addToast(message, type, duration) {
  const id = crypto.randomUUID()
  toasts.update(t => [...t, { id, message, type }])
  setTimeout(() => toasts.update(t => t.filter(toast => toast.id !== id)), duration)
}

export const toastStore = {
  subscribe: toasts.subscribe,
  success: (message, duration = 3000) => addToast(message, 'success', duration),
  error: (message, duration = 4000) => addToast(message, 'error', duration),
  info: (message, duration = 3000) => addToast(message, 'info', duration)
}
