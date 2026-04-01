<script lang="ts">
  import { tasks } from '../stores/tasks.ts'
  import { confirm } from '../stores/dialog.ts'
  import { X, Send, Edit2, Trash2 } from 'lucide-svelte'
  import { createEventDispatcher } from 'svelte'
  import type { Task, Comment } from '../types.ts'

  export let task: Task

  const dispatch = createEventDispatcher<{ close: void }>()

  let newComment = ''
  let editingCommentId: string | null = null
  let editingCommentContent = ''

  function close() {
    dispatch('close')
  }

  function addComment() {
    if (!newComment.trim()) return
    tasks.addComment(task.id, newComment)
    newComment = ''
  }

  function startEditComment(comment: Comment) {
    editingCommentId = comment.id
    editingCommentContent = comment.content
  }

  function cancelEditComment() {
    editingCommentId = null
    editingCommentContent = ''
  }

  function saveEditComment() {
    if (!editingCommentContent.trim() || !editingCommentId) return
    tasks.updateComment(task.id, editingCommentId, editingCommentContent)
    editingCommentId = null
    editingCommentContent = ''
  }

  async function deleteComment(commentId: string) {
    if (!await confirm('Supprimer ce commentaire ?')) return
    tasks.deleteComment(task.id, commentId)
  }
</script>

<div
  class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  role="button"
  tabindex="0"
  on:click={close}
  on:keydown={(e) => e.key === 'Escape' && close()}
>
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div
    class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
    role="dialog"
    aria-modal="true"
    on:click|stopPropagation
    on:keydown|stopPropagation
  >
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <div>
        <h3 class="font-semibold text-gray-800">Commentaires</h3>
        <p class="text-sm text-gray-500 truncate">{task.title}</p>
      </div>
      <button on:click={close} class="text-gray-400 hover:text-gray-600">
        <X size={20} />
      </button>
    </div>

    <div class="p-4 border-b border-gray-200">
      <div class="flex gap-2">
        <input
          type="text"
          bind:value={newComment}
          placeholder="Ajouter un commentaire..."
          class="flex-1 p-2 border border-gray-300 rounded focus:border-[#1e3a5f] focus:outline-none text-sm"
          on:keypress={(e) => e.key === 'Enter' && addComment()}
        />
        <button
          on:click={addComment}
          disabled={!newComment.trim()}
          class="p-2 bg-[#1e3a5f] hover:bg-[#2a4a73] disabled:bg-gray-300 text-white rounded transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      {#if task.comments && task.comments.length > 0}
        {#each task.comments as comment (comment.id)}
          <div class="bg-gray-50 rounded p-3">
            {#if editingCommentId === comment.id}
              <div class="space-y-2">
                <textarea
                  bind:value={editingCommentContent}
                  rows="2"
                  class="w-full p-2 border border-gray-300 rounded focus:border-[#1e3a5f] focus:outline-none text-sm resize-none"
                ></textarea>
                <div class="flex gap-2 justify-end">
                  <button
                    on:click={cancelEditComment}
                    class="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                  >
                    Annuler
                  </button>
                  <button
                    on:click={saveEditComment}
                    disabled={!editingCommentContent.trim()}
                    class="px-2 py-1 text-xs bg-[#1e3a5f] hover:bg-[#2a4a73] disabled:bg-gray-300 text-white rounded"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            {:else}
              <p class="text-sm text-gray-800 whitespace-pre-wrap">{comment.content}</p>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                <div class="flex gap-1">
                  <button
                    on:click={() => startEditComment(comment)}
                    class="p-1 text-gray-400 hover:text-[#1e3a5f] rounded transition-colors"
                    title="Modifier"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    on:click={() => deleteComment(comment.id)}
                    class="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      {:else}
        <p class="text-center text-gray-400 text-sm py-4">Aucun commentaire</p>
      {/if}
    </div>
  </div>
</div>
