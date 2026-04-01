<script lang="ts">
  import { tasks, taskFilters, statusLabels, priorityLabels } from '../stores/tasks.ts'
  import { confirm } from '../stores/dialog.ts'
  import { onMount } from 'svelte'
  import { CheckSquare, Plus, Pencil, Trash2, GripVertical, X, List, Circle, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-svelte'
  import TaskComments from './TaskComments.svelte'
  import type { Task, TaskStatus, TaskPriority } from '../types.ts'
  import type { SvelteComponent } from 'svelte'

  let showForm = false
  let editingId: string | null = null
  let formData: { title: string; description: string; priority: TaskPriority } = {
    title: '',
    description: '',
    priority: 'medium'
  }

  let draggedId: string | null = null
  let dragOverId: string | null = null

  let filterStatus = 'all'

  let showCommentsModal = false
  let selectedTaskId: string | null = null
  let expandedDescriptions: Record<string, boolean> = {}
  let showStatusSelect: string | null = null
  let showPrioritySelect: string | null = null

  let sortBy = 'order'

  $: selectedTask = selectedTaskId ? $tasks.find(t => t.id === selectedTaskId) : undefined
  $: canDrag = sortBy === 'order'

  onMount(() => {
    tasks.load()
  })

  $: filteredTasks = $tasks
    .filter(task => {
      if (filterStatus === 'all') return true
      if (filterStatus === 'active') return ['todo', 'in_progress', 'waiting'].includes(task.status)
      if (filterStatus === 'completed') return ['done', 'canceled'].includes(task.status)
      return task.status === filterStatus
    })
    .sort((a, b) => {
      if (sortBy === 'order') {
        return (a.order || 0) - (b.order || 0)
      } else if (sortBy === 'priority') {
        const priorityOrder: Record<TaskPriority, number> = { high: 1, medium: 2, low: 3 }
        return (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0)
      }
      return 0
    })

  function openAddForm() {
    formData = { title: '', description: '', priority: 'medium' }
    editingId = null
    showForm = true
  }

  function edit(task: Task) {
    formData = {
      title: task.title,
      description: task.description || '',
      priority: task.priority
    }
    editingId = task.id
    showForm = true
  }

  function resetForm() {
    formData = { title: '', description: '', priority: 'medium' }
    editingId = null
    showForm = false
  }

  function saveTask() {
    if (!formData.title.trim() || !formData.description.trim()) return

    if (editingId) {
      tasks.update(editingId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority
      })
    } else {
      tasks.add({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority
      })
    }

    resetForm()
  }

  async function remove(id: string) {
    if (await confirm('Supprimer cette tâche ?')) {
      tasks.remove(id)
    }
  }

  function toggleStatus(task: Task) {
    const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done'
    tasks.updateStatus(task.id, nextStatus)
  }

  function setStatus(id: string, status: TaskStatus) {
    tasks.updateStatus(id, status)
  }

  function setPriority(id: string, priority: TaskPriority) {
    tasks.updatePriority(id, priority)
  }

  function openCommentsModal(task: Task) {
    selectedTaskId = task.id
    showCommentsModal = true
  }

  function closeCommentsModal() {
    showCommentsModal = false
    selectedTaskId = null
  }

  function toggleExpandDescription(taskId: string) {
    expandedDescriptions[taskId] = !expandedDescriptions[taskId]
    expandedDescriptions = expandedDescriptions
  }

  function toggleStatusSelect(taskId: string) {
    showStatusSelect = showStatusSelect === taskId ? null : taskId
    showPrioritySelect = null
  }

  function togglePrioritySelect(taskId: string) {
    showPrioritySelect = showPrioritySelect === taskId ? null : taskId
    showStatusSelect = null
  }

  function onStatusChange(e: Event, taskId: string): void {
    setStatus(taskId, (e.target as HTMLSelectElement).value as TaskStatus)
    closeAllSelects()
  }

  function onPriorityChange(e: Event, taskId: string): void {
    setPriority(taskId, (e.target as HTMLSelectElement).value as TaskPriority)
    closeAllSelects()
  }

  function closeAllSelects() {
    showStatusSelect = null
    showPrioritySelect = null
  }

  function getStatusBadgeClasses(status: string): string {
    const classes: Record<string, string> = {
      todo: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      waiting: 'bg-yellow-100 text-yellow-700',
      done: 'bg-green-100 text-green-700',
      canceled: 'bg-red-100 text-red-700'
    }
    return classes[status] ?? classes['todo']
  }

  function getPriorityBadgeClasses(priority: string): string {
    const classes: Record<string, string> = {
      low: 'bg-green-100 text-green-700 border-green-300',
      medium: 'bg-orange-100 text-orange-700 border-orange-300',
      high: 'bg-red-100 text-red-700 border-red-300'
    }
    return classes[priority] ?? classes['medium']
  }

  function getPriorityDot(priority: string): string {
    const colors: Record<string, string> = {
      low: 'bg-green-500',
      medium: 'bg-orange-500',
      high: 'bg-red-500'
    }
    return colors[priority] ?? colors['medium']
  }

  function getStatusFilterClasses(status: string): string {
    const classes: Record<string, string> = {
      all: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
      todo: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      in_progress: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      waiting: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      done: 'bg-green-100 text-green-700 hover:bg-green-200',
      canceled: 'bg-red-100 text-red-700 hover:bg-red-200'
    }
    return classes[status] ?? classes['all']
  }

  function getStatusFilterActiveClasses(status: string): string {
    const classes: Record<string, string> = {
      all: 'bg-[#1e3a5f] text-white',
      todo: 'bg-gray-500 text-white',
      in_progress: 'bg-blue-500 text-white',
      waiting: 'bg-yellow-500 text-white',
      done: 'bg-green-500 text-white',
      canceled: 'bg-red-500 text-white'
    }
    return classes[status] ?? classes['all']
  }

  function getStatusIcon(status: string): typeof SvelteComponent {
    const icons: Record<string, typeof SvelteComponent> = {
      all: List as unknown as typeof SvelteComponent,
      todo: Circle as unknown as typeof SvelteComponent,
      in_progress: Clock as unknown as typeof SvelteComponent,
      waiting: Clock as unknown as typeof SvelteComponent,
      done: CheckCircle as unknown as typeof SvelteComponent,
      canceled: XCircle as unknown as typeof SvelteComponent
    }
    return icons[status] ?? icons['all']
  }

  function handleDragStart(e: DragEvent, id: string) {
    draggedId = id
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', id)
    }
    e.stopPropagation()
  }

  function handleDragOver(e: DragEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    if (id !== draggedId) {
      dragOverId = id
    }
  }

  function handleDragLeave(e: DragEvent) {
    e.stopPropagation()
    dragOverId = null
  }

  function handleDrop(e: DragEvent, targetId: string) {
    e.preventDefault()
    e.stopPropagation()
    if (draggedId) {
      const targetIndex = $tasks.findIndex(t => t.id === targetId)
      if (targetIndex !== -1) {
        tasks.reorder(draggedId, targetIndex)
      }
    }
    draggedId = null
    dragOverId = null
  }

  function handleDragEnd() {
    draggedId = null
    dragOverId = null
  }

  function handleHandleMouseDown(e: MouseEvent) {
    e.stopPropagation()
  }

  function handleHandleClick(e: MouseEvent) {
    e.stopPropagation()
  }

  function handleHandleKeydown(e: KeyboardEvent) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.stopPropagation()
    }
  }

  const statusFilters: Array<{ id: string; label: string; icon: typeof SvelteComponent }> = [
    { id: 'all', label: 'Tous', icon: List as unknown as typeof SvelteComponent },
    { id: 'todo', label: 'À faire', icon: Circle as unknown as typeof SvelteComponent },
    { id: 'in_progress', label: 'En cours', icon: Clock as unknown as typeof SvelteComponent },
    { id: 'waiting', label: 'En attente', icon: Clock as unknown as typeof SvelteComponent },
    { id: 'done', label: 'Terminées', icon: CheckCircle as unknown as typeof SvelteComponent },
    { id: 'canceled', label: 'Annulées', icon: XCircle as unknown as typeof SvelteComponent }
  ]

  // Suppress unused variable warning
  void taskFilters
  void getStatusIcon
</script>

<div class="space-y-4 max-w-2xl bg-[#f5f5f5] min-h-screen p-4">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-800">Tâches</h1>
    <button
      on:click={openAddForm}
      class="bg-[#1e3a5f] hover:bg-[#2a4a73] text-white px-4 py-2 rounded font-medium transition-colors flex items-center gap-2"
    >
      <Plus size={18} />
      Nouvelle tâche
    </button>
  </div>

  {#if showForm}
    <div class="bg-white border border-gray-200 rounded p-4">
      <h3 class="font-semibold text-gray-700 mb-3 bg-gray-50 border-b border-gray-200 px-3 py-2 -mx-4 -mt-4 mb-3 flex items-center justify-between">
        <span>{editingId ? 'Modifier la tâche' : 'Nouvelle tâche'}</span>
        <button on:click={resetForm} class="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </h3>
      <div class="space-y-3">
        <div>
          <label for="task-title" class="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
          <input
            id="task-title"
            bind:value={formData.title}
            placeholder="Titre de la tâche *"
            class="w-full p-2 border border-gray-300 rounded focus:border-[#1e3a5f] focus:outline-none"
          />
        </div>
        <div>
          <label for="task-description" class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            id="task-description"
            bind:value={formData.description}
            placeholder="Description de la tâche *"
            rows="3"
            class="w-full p-2 border border-gray-300 rounded focus:border-[#1e3a5f] focus:outline-none resize-none"
          ></textarea>
        </div>
        <div>
          <label for="task-priority" class="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
          <select
            id="task-priority"
            bind:value={formData.priority}
            class="w-full p-2 border border-gray-300 rounded focus:border-[#1e3a5f] focus:outline-none bg-white"
          >
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
        </div>
        <button
          on:click={saveTask}
          disabled={!formData.title.trim() || !formData.description.trim()}
          class="w-full bg-[#1e3a5f] hover:bg-[#2a4a73] disabled:bg-gray-300 text-white py-2 rounded font-medium transition-colors"
        >
          {editingId ? 'Modifier' : 'Créer la tâche'}
        </button>
      </div>
    </div>
  {/if}

  <div class="bg-white border border-gray-200 rounded p-2 flex flex-wrap gap-1 items-center">
    {#each statusFilters as filter}
      <button
        on:click={() => filterStatus = filter.id}
        class="p-2 rounded transition-colors {filterStatus === filter.id ? getStatusFilterActiveClasses(filter.id) : getStatusFilterClasses(filter.id)}"
        title={filter.label}
      >
        <svelte:component this={filter.icon} size={16} />
      </button>
    {/each}

    <div class="flex items-center gap-1 ml-auto">
      <span class="text-xs text-gray-500">Tri:</span>
      <select
        bind:value={sortBy}
        class="text-xs p-1 border border-gray-200 rounded bg-white text-gray-600 focus:border-[#1e3a5f] focus:outline-none"
      >
        <option value="order">Personnalisé</option>
        <option value="priority">Priorité</option>
      </select>
    </div>
  </div>

  <div class="space-y-2">
    {#if filteredTasks.length === 0}
      <div class="text-center py-12 text-gray-500 bg-white rounded border border-gray-200">
        <CheckSquare size={40} class="mx-auto mb-2 text-gray-300" />
        <p>Aucune tâche</p>
        <p class="text-sm text-gray-400 mt-1">Cliquez sur "Nouvelle tâche" pour commencer</p>
      </div>
    {:else}
      {#each filteredTasks as task (task.id)}
        <div
          class="bg-white border border-gray-200 rounded p-4 relative group transition-all {dragOverId === task.id ? 'border-t-4 border-t-[#1e3a5f]' : ''} {draggedId === task.id ? 'opacity-50' : ''}"
          role="listitem"
          on:dragover={canDrag ? (e) => handleDragOver(e, task.id) : undefined}
          on:dragleave={canDrag ? handleDragLeave : undefined}
          on:drop={canDrag ? (e) => handleDrop(e, task.id) : undefined}
        >
          {#if canDrag}
            <div
              class="absolute -top-[7px] left-1/2 transform -translate-x-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-20"
              draggable="true"
              role="button"
              tabindex="0"
              aria-label="Déplacer la tâche"
              on:dragstart={(e) => handleDragStart(e, task.id)}
              on:dragend={handleDragEnd}
              on:mousedown={handleHandleMouseDown}
              on:click={handleHandleClick}
              on:keydown={handleHandleKeydown}
              title="Déplacer (glisser-déposer)"
            >
              <div class="w-3.5 h-3.5 bg-[#1e3a5f] hover:bg-[#2a4a73] active:bg-[#1a2a4a] text-white rounded shadow-lg border-2 border-[#1e3a5f] hover:border-[#2a4a73] flex items-center justify-center transition-all">
                <GripVertical size={14} />
              </div>
            </div>
          {/if}

          <div class="flex items-start gap-3">
            <button
              on:click={() => toggleStatus(task)}
              class="mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 {task.status === 'done' ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-[#1e3a5f]'}"
              title={task.status === 'done' ? 'Marquer comme non terminée' : 'Marquer comme terminée'}
            >
              {#if task.status === 'done'}
                <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              {/if}
            </button>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 mb-1">
                <div class="flex items-center gap-2 flex-wrap">
                  {#if showStatusSelect === task.id}
                    <select
                      value={task.status}
                      on:change={(e) => onStatusChange(e, task.id)}
                      on:blur={closeAllSelects}
                      class="text-xs px-2 py-0.5 rounded border {getStatusBadgeClasses(task.status)} bg-transparent cursor-pointer focus:outline-none"
                    >
                      {#each Object.entries(statusLabels) as [value, label]}
                        <option value={value} class="bg-white text-gray-800">{label}</option>
                      {/each}
                    </select>
                  {:else}
                    <button
                      on:click={() => toggleStatusSelect(task.id)}
                      class="text-xs px-2 py-0.5 rounded border {getStatusBadgeClasses(task.status)} cursor-pointer"
                    >
                      {statusLabels[task.status]}
                    </button>
                  {/if}
                  {#if showPrioritySelect === task.id}
                    <select
                      value={task.priority}
                      on:change={(e) => onPriorityChange(e, task.id)}
                      on:blur={closeAllSelects}
                      class="text-xs px-2 py-0.5 rounded border {getPriorityBadgeClasses(task.priority)} bg-transparent cursor-pointer focus:outline-none"
                    >
                      {#each Object.entries(priorityLabels) as [value, label]}
                        <option value={value} class="bg-white text-gray-800">{label}</option>
                      {/each}
                    </select>
                  {:else}
                    <button
                      on:click={() => togglePrioritySelect(task.id)}
                      class="text-xs px-2 py-0.5 rounded border flex items-center gap-1 {getPriorityBadgeClasses(task.priority)} cursor-pointer"
                    >
                      <span class="w-2 h-2 rounded-full {getPriorityDot(task.priority)}"></span>
                      {priorityLabels[task.priority]}
                    </button>
                  {/if}
                </div>

                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    on:click={() => openCommentsModal(task)}
                    class="p-1.5 text-gray-400 hover:text-[#1e3a5f] rounded transition-colors relative"
                    title="Commentaires"
                  >
                    <MessageSquare size={16} />
                    {#if (task.comments || []).length > 0}
                      <span class="absolute -top-1 -right-1 bg-[#1e3a5f] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                        {task.comments.length}
                      </span>
                    {/if}
                  </button>
                  <button
                    on:click={() => edit(task)}
                    class="p-1.5 text-gray-400 hover:text-[#1e3a5f] rounded transition-colors"
                    title="Modifier"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    on:click={() => remove(task.id)}
                    class="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 class="text-base font-semibold text-gray-800 {task.status === 'done' ? 'line-through text-gray-400' : ''}">
                {task.title}
              </h3>
              <div class="text-sm text-gray-600 mt-1 {task.status === 'done' ? 'line-through text-gray-400' : ''}">
                {#if expandedDescriptions[task.id] || task.description.length <= 150}
                  <p class="whitespace-pre-wrap">{task.description}</p>
                  {#if expandedDescriptions[task.id] && task.description.length > 150}
                    <button
                      on:click={() => toggleExpandDescription(task.id)}
                      class="text-xs text-[#1e3a5f] hover:text-[#2a4a73] mt-1"
                    >
                      Réduire...
                    </button>
                  {/if}
                {:else}
                  <p class="line-clamp-3 whitespace-pre-wrap">{task.description}</p>
                  <button
                    on:click={() => toggleExpandDescription(task.id)}
                    class="text-xs text-[#1e3a5f] hover:text-[#2a4a73] mt-1"
                  >
                    Afficher tout...
                  </button>
                {/if}
              </div>
              <p class="text-xs text-gray-400 mt-2">
                Créée le {new Date(task.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

{#if showCommentsModal && selectedTask}
  <TaskComments task={selectedTask} on:close={closeCommentsModal} />
{/if}
