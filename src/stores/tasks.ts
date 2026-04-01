import { writable } from 'svelte/store'
import { get, set } from '../lib/storage.ts'
import type { Task, TaskStatus, TaskPriority, Comment } from '../types.ts'

function createTasksStore() {
  const { subscribe, set: setStore, update } = writable<Task[]>([])

  return {
    subscribe,

    load: async (): Promise<void> => {
      try {
        const tasks = await get<Task[]>('tasks') ?? []
        setStore(tasks)
      } catch (err) {
        console.error('Erreur chargement tâches:', err)
        setStore([])
      }
    },

    add: (task: Partial<Task>): void => {
      update(tasks => {
        const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order || 0)) : 0
        const newTask: Task = {
          ...task,
          id: crypto.randomUUID(),
          title: task.title ?? '',
          description: task.description ?? '',
          status: task.status ?? 'todo',
          priority: task.priority ?? 'medium',
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          order: maxOrder + 1
        }
        const newTasks = [...tasks, newTask]
        set('tasks', newTasks).catch(err => console.error('Erreur sauvegarde tasks:', err))
        return newTasks
      })
    },

    update: (id: string, updates: Partial<Task>): void => {
      update(tasks => {
        const newTasks = tasks.map(task =>
          task.id === id
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        )
        set('tasks', newTasks).catch(err => console.error('Erreur sauvegarde tasks:', err))
        return newTasks
      })
    },

    remove: (id: string): void => {
      update(tasks => {
        const newTasks = tasks.filter(task => task.id !== id)
        set('tasks', newTasks).catch(err => console.error('Erreur sauvegarde tasks:', err))
        return newTasks
      })
    },

    updateStatus: (id: string, status: TaskStatus): void => {
      update(tasks => {
        const newTasks = tasks.map(task =>
          task.id === id
            ? { ...task, status, updatedAt: new Date().toISOString() }
            : task
        )
        set('tasks', newTasks).catch(err => console.error('Erreur sauvegarde tasks:', err))
        return newTasks
      })
    },

    updatePriority: (id: string, priority: TaskPriority): void => {
      update(tasks => {
        const newTasks = tasks.map(task =>
          task.id === id
            ? { ...task, priority, updatedAt: new Date().toISOString() }
            : task
        )
        set('tasks', newTasks).catch(err => console.error('Erreur sauvegarde tasks:', err))
        return newTasks
      })
    },

    reorder: (draggedId: string, targetIndex: number): void => {
      update(tasks => {
        const newTasks = [...tasks]
        const draggedIndex = newTasks.findIndex(t => t.id === draggedId)
        if (draggedIndex === -1) return tasks

        const [draggedItem] = newTasks.splice(draggedIndex, 1)
        newTasks.splice(targetIndex, 0, draggedItem)

        const reorderedTasks = newTasks.map((task, index) => ({
          ...task,
          order: index + 1
        }))

        set('tasks', reorderedTasks).catch(err => console.error('Erreur sauvegarde tasks:', err))
        return reorderedTasks
      })
    },

    addComment: (taskId: string, content: string): void => {
      const newComment: Comment = {
        id: crypto.randomUUID(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      update(tasks => {
        const newTasks = tasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              comments: [newComment, ...(task.comments ?? [])],
              updatedAt: new Date().toISOString()
            }
          }
          return task
        })
        set('tasks', newTasks).catch(err => console.error('Erreur sauvegarde tasks:', err))
        return newTasks
      })
    },

    updateComment: (taskId: string, commentId: string, content: string): void => {
      update(tasks => {
        const newTasks = tasks.map(task => {
          if (task.id === taskId && task.comments) {
            return {
              ...task,
              comments: task.comments.map(c =>
                c.id === commentId
                  ? { ...c, content: content.trim(), updatedAt: new Date().toISOString() }
                  : c
              ),
              updatedAt: new Date().toISOString()
            }
          }
          return task
        })
        set('tasks', newTasks).catch(err => console.error('Erreur sauvegarde tasks:', err))
        return newTasks
      })
    },

    deleteComment: (taskId: string, commentId: string): void => {
      update(tasks => {
        const newTasks = tasks.map(task => {
          if (task.id === taskId && task.comments) {
            return {
              ...task,
              comments: task.comments.filter(c => c.id !== commentId),
              updatedAt: new Date().toISOString()
            }
          }
          return task
        })
        set('tasks', newTasks).catch(err => console.error('Erreur sauvegarde tasks:', err))
        return newTasks
      })
    },

    clear: (): void => {
      setStore([])
      set('tasks', []).catch(err => console.error('Erreur sauvegarde tasks:', err))
    }
  }
}

export const tasks = createTasksStore()

export const taskFilters = writable<{ status: string }>({
  status: 'all'
})

export const statusLabels: Record<TaskStatus, string> = {
  todo: 'À faire',
  in_progress: 'En cours',
  waiting: 'En attente',
  done: 'Terminé',
  canceled: 'Annulé'
}

export const priorityLabels: Record<TaskPriority, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute'
}
