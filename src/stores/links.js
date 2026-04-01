import { createCrudStore } from '../lib/crudStore.js'

const base = createCrudStore('links')

export const links = {
  ...base,
  reorder: (draggedId, targetIndex) => {
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
