<script lang="ts">
  import { toastStore } from '../stores/toast.ts'
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none">
  {#each $toastStore as toast (toast.id)}
    <div
      class="px-4 py-3 rounded shadow-lg text-sm text-white pointer-events-auto {
        toast.type === 'success' ? 'bg-green-600' :
        toast.type === 'error'   ? 'bg-red-600' :
                                   'bg-[#1e3a5f]'
      }"
    >
      {toast.message}
    </div>
  {/each}
</div>
