<script lang="ts">
  import { dialogState } from '../stores/dialog.ts'
</script>

{#if $dialogState}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    role="button"
    tabindex="0"
    on:click={$dialogState.onCancel}
    on:keydown={(e) => e.key === 'Escape' && $dialogState.onCancel()}
  >
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div
      class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4"
      role="dialog"
      aria-modal="true"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <p class="text-gray-800 mb-5">{$dialogState.message}</p>
      <div class="flex gap-3 justify-end">
        <button
          on:click={$dialogState.onCancel}
          class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition-colors"
        >
          Annuler
        </button>
        <button
          on:click={$dialogState.onConfirm}
          class="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors"
        >
          Confirmer
        </button>
      </div>
    </div>
  </div>
{/if}
