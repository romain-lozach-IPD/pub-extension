<script lang="ts">
  import { currentPage, pages } from '../stores/navigation.ts'
  import Toast from './Toast.svelte'
  import ConfirmDialog from './ConfirmDialog.svelte'
</script>

<Toast />
<ConfirmDialog />

<div class="flex h-screen bg-[#f5f5f5]">
  <!-- Menu vertical -->
  <nav class="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2 flex-shrink-0">
    {#each pages as page (page.id)}
      <div class="relative group">
        <button
          on:click={() => currentPage.set(page.id)}
          class="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200
                 {$currentPage === page.id ? 'bg-[#1e3a5f] text-white' : 'text-gray-600 hover:bg-gray-100'}"
        >
          <svelte:component this={page.icon} size={20} />
        </button>
        <span class="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2
                     bg-[#1e3a5f] text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap
                     opacity-0 group-hover:opacity-100 transition-opacity duration-100 z-50">
          {page.label}
        </span>
      </div>
    {/each}
  </nav>

  <!-- Contenu -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Header avec logo -->
    <header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
      <img src="https://www.marchesonline.com/_nuxt/Logo.9eb82cb7.svg" alt="Marchés Online" class="h-8" />
    </header>

    <main class="flex-1 overflow-auto p-4">
      <slot />
    </main>
  </div>
</div>
