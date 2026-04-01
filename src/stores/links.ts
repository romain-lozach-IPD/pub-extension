import { createCrudStore } from '../lib/crudStore.ts'
import type { Link } from '../types.ts'

const base = createCrudStore<Link>('links')

export const links = {
  ...base,
  reorder: (draggedId: string, targetIndex: number): void => {
    base._mutate(items => {
      const draggedIndex = items.findIndex(l => l.id === draggedId)
      if (draggedIndex === -1 || draggedIndex === targetIndex) return items
      const next = [...items]
      const [item] = next.splice(draggedIndex, 1)
      next.splice(targetIndex, 0, item)
      return next
    })
  }
}
