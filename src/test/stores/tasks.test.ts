import { describe, it, expect, beforeEach } from 'vitest'
import { get } from 'svelte/store'
import { tasks } from '../../stores/tasks.ts'

beforeEach(() => {
  tasks.clear()
})

describe('tasks.add', () => {
  it('crée une tâche avec les valeurs par défaut', () => {
    tasks.add({ title: 'Test' })
    const items = get(tasks)
    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('Test')
    expect(items[0].status).toBe('todo')
    expect(items[0].priority).toBe('medium')
    expect(items[0].comments).toEqual([])
    expect(items[0].order).toBe(1)
  })

  it('incrémente l\'ordre à chaque ajout', () => {
    tasks.add({ title: 'A' })
    tasks.add({ title: 'B' })
    const items = get(tasks)
    expect(items[0].order).toBe(1)
    expect(items[1].order).toBe(2)
  })
})

describe('tasks.update', () => {
  it('modifie les champs et met à jour updatedAt', () => {
    tasks.add({ title: 'Avant' })
    const id = get(tasks)[0].id
    tasks.update(id, { title: 'Après' })
    const updated = get(tasks)[0]
    expect(updated.title).toBe('Après')
    expect(updated.updatedAt).toBeDefined()
  })
})

describe('tasks.remove', () => {
  it('supprime la tâche', () => {
    tasks.add({ title: 'À supprimer' })
    const id = get(tasks)[0].id
    tasks.remove(id)
    expect(get(tasks)).toHaveLength(0)
  })
})

describe('tasks.updateStatus / updatePriority', () => {
  it('change le statut', () => {
    tasks.add({ title: 'T' })
    const id = get(tasks)[0].id
    tasks.updateStatus(id, 'done')
    expect(get(tasks)[0].status).toBe('done')
  })

  it('change la priorité', () => {
    tasks.add({ title: 'T' })
    const id = get(tasks)[0].id
    tasks.updatePriority(id, 'high')
    expect(get(tasks)[0].priority).toBe('high')
  })
})

describe('tasks.reorder', () => {
  it('déplace un item vers le début', () => {
    tasks.add({ title: 'A' })
    tasks.add({ title: 'B' })
    tasks.add({ title: 'C' })
    const id = get(tasks)[2].id
    tasks.reorder(id, 0)
    const titles = get(tasks).map(t => t.title)
    expect(titles).toEqual(['C', 'A', 'B'])
  })

  it('recalcule les ordres après réorganisation', () => {
    tasks.add({ title: 'A' })
    tasks.add({ title: 'B' })
    const id = get(tasks)[1].id
    tasks.reorder(id, 0)
    const orders = get(tasks).map(t => t.order)
    expect(orders).toEqual([1, 2])
  })

  it('no-op si l\'id est introuvable', () => {
    tasks.add({ title: 'A' })
    tasks.reorder('inexistant', 0)
    expect(get(tasks)).toHaveLength(1)
  })
})

describe('tasks comments', () => {
  it('addComment — ajoute un commentaire', () => {
    tasks.add({ title: 'T' })
    const id = get(tasks)[0].id
    tasks.addComment(id, 'Mon commentaire')
    expect(get(tasks)[0].comments).toHaveLength(1)
    expect(get(tasks)[0].comments[0].content).toBe('Mon commentaire')
  })

  it('addComment — trim le contenu', () => {
    tasks.add({ title: 'T' })
    const id = get(tasks)[0].id
    tasks.addComment(id, '  espaces  ')
    expect(get(tasks)[0].comments[0].content).toBe('espaces')
  })

  it('updateComment — met à jour le contenu', () => {
    tasks.add({ title: 'T' })
    const taskId = get(tasks)[0].id
    tasks.addComment(taskId, 'Avant')
    const commentId = get(tasks)[0].comments[0].id
    tasks.updateComment(taskId, commentId, 'Après')
    expect(get(tasks)[0].comments[0].content).toBe('Après')
  })

  it('deleteComment — supprime le commentaire', () => {
    tasks.add({ title: 'T' })
    const taskId = get(tasks)[0].id
    tasks.addComment(taskId, 'À supprimer')
    const commentId = get(tasks)[0].comments[0].id
    tasks.deleteComment(taskId, commentId)
    expect(get(tasks)[0].comments).toHaveLength(0)
  })
})

describe('tasks.clear', () => {
  it('vide toutes les tâches', () => {
    tasks.add({ title: 'A' })
    tasks.add({ title: 'B' })
    tasks.clear()
    expect(get(tasks)).toHaveLength(0)
  })
})
