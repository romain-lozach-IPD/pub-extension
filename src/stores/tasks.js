import { writable } from 'svelte/store'
import { get, set } from '../lib/storage.js'

function createTasksStore() {
  const { subscribe, set: setStore, update } = writable([])

  return {
    subscribe,

    load: async () => {
      try {
        const tasks = await get('tasks') || []
        setStore(tasks)
      } catch (err) {
        console.error('Erreur chargement tâches:', err)
        setStore([])
      }
    },

    add: async (task) => {
      update(tasks => {
        const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order || 0)) : 0
        const newTask = {
          ...task,
          id: Date.now(),
          status: task.status || 'todo',
          priority: task.priority || 'medium',
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          order: maxOrder + 1
        }
        const newTasks = [...tasks, newTask]
        set('tasks', newTasks)
        return newTasks
      })
    },

    update: async (id, updates) => {
      update(tasks => {
        const newTasks = tasks.map(task =>
          task.id === id
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        )
        set('tasks', newTasks)
        return newTasks
      })
    },

    remove: async (id) => {
      update(tasks => {
        const newTasks = tasks.filter(task => task.id !== id)
        set('tasks', newTasks)
        return newTasks
      })
    },

    updateStatus: async (id, status) => {
      update(tasks => {
        const newTasks = tasks.map(task =>
          task.id === id
            ? { ...task, status, updatedAt: new Date().toISOString() }
            : task
        )
        set('tasks', newTasks)
        return newTasks
      })
    },

    updatePriority: async (id, priority) => {
      update(tasks => {
        const newTasks = tasks.map(task =>
          task.id === id
            ? { ...task, priority, updatedAt: new Date().toISOString() }
            : task
        )
        set('tasks', newTasks)
        return newTasks
      })
    },

    reorder: async (draggedId, targetIndex) => {
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

        set('tasks', reorderedTasks)
        return reorderedTasks
      })
    },

    addComment: async (taskId, content) => {
      const newComment = {
        id: Date.now(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      update(tasks => {
        const newTasks = tasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              comments: [newComment, ...(task.comments || [])],
              updatedAt: new Date().toISOString()
            }
          }
          return task
        })
        set('tasks', newTasks)
        return newTasks
      })
    },

    updateComment: async (taskId, commentId, content) => {
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
        set('tasks', newTasks)
        return newTasks
      })
    },

    deleteComment: async (taskId, commentId) => {
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
        set('tasks', newTasks)
        return newTasks
      })
    },

    clear: () => {
      set([])
      set('tasks', [])
    }
  }
}

export const tasks = createTasksStore()

export const taskFilters = writable({
  status: 'all'
})

export const statusLabels = {
  todo: 'À faire',
  in_progress: 'En cours',
  waiting: 'En attente',
  done: 'Terminé',
  canceled: 'Annulé'
}

export const priorityLabels = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute'
}
