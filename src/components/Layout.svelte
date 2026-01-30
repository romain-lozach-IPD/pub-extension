<script>
  import { currentPage, pages } from '../stores/navigation.js'
</script>

<div class="flex h-screen bg-gray-50">
  <!-- Menu vertical -->
  <nav class="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2 flex-shrink-0">
    {#each pages as page}
      <button
        on:click={() => currentPage.set(page.id)}
        class="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200
               {$currentPage === page.id ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}"
        title={page.label}
      >
        <svelte:component this={page.icon} size={20} />
      </button>
    {/each}
  </nav>
  
  <!-- Contenu -->
  <main class="flex-1 overflow-auto p-4">
    <slot />
  </main>
</div>
