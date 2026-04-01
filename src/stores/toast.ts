import { writable } from 'svelte/store'
import type { ToastItem, ToastType } from '../types.ts'

const toasts = writable<ToastItem[]>([])

function addToast(message: string, type: ToastType, duration: number): void {
  const id = crypto.randomUUID()
  toasts.update(t => [...t, { id, message, type }])
  setTimeout(() => toasts.update(t => t.filter(toast => toast.id !== id)), duration)
}

export const toastStore = {
  subscribe: toasts.subscribe,
  success: (message: string, duration = 3000): void => addToast(message, 'success', duration),
  error: (message: string, duration = 4000): void => addToast(message, 'error', duration),
  info: (message: string, duration = 3000): void => addToast(message, 'info', duration)
}
