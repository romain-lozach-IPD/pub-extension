<script>
  import { currentPage, pages } from '../stores/navigation.js'
</script>

<div class="flex h-screen bg-[#f5f5f5]">
  <!-- Menu vertical -->
  <nav class="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2 flex-shrink-0">
    {#each pages as page}
      <button
        on:click={() => currentPage.set(page.id)}
        class="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200
               {$currentPage === page.id ? 'bg-[#1e3a5f] text-white' : 'text-gray-600 hover:bg-gray-100'}"
        title={page.label}
      >
        <svelte:component this={page.icon} size={20} />
      </button>
    {/each}
  </nav>
  
  <!-- Contenu -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Header avec logo -->
    <header class="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between flex-shrink-0">
      <img src="https://www.marchesonline.com/_nuxt/Logo.9eb82cb7.svg" alt="Marchés Online" class="h-6" />
    </header>
    
    <main class="flex-1 overflow-auto p-4">
      <slot />
    </main>
  </div>
</div>
