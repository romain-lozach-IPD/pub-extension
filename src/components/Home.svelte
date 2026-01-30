<script>
  import { filters, searchStore, paginationInfo } from '../stores/search.js'
  import { favorites } from '../stores/favorites.js'
  import { onMount } from 'svelte'
  import { RotateCcw, Loader, Search, AlertTriangle, Star, ExternalLink } from 'lucide-svelte'

  let showFilters = true
  let currentPage = 1
  let hasSearched = false

  onMount(() => {
    // Charger les favoris au démarrage
    favorites.load()
  })

  async function handleSearch() {
    currentPage = 1
    hasSearched = true
    try {
      await searchStore.search($filters, currentPage)
    } catch (err) {
      console.error('Erreur recherche:', err)
    }
  }

  function resetFilters() {
    filters.reset()
    searchStore.clear()
    currentPage = 1
    hasSearched = false
  }

  async function changePage(page) {
    if (page < 1 || ($paginationInfo && page > $paginationInfo.lastPage)) return
    currentPage = page
    try {
      await searchStore.search($filters, currentPage)
    } catch (err) {
      console.error('Erreur pagination:', err)
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  function openConnection(uuid) {
    const url = `http://localhost:3000?key=${uuid}`
    chrome.tabs.create({ url })
  }

  function toggleFavorite(result) {
    const isFav = $favorites.some(f => f.id === result.id)
    if (isFav) {
      favorites.remove(result.id)
    } else {
      favorites.add(result)
    }
  }
</script>

<div class="space-y-4 max-w-2xl">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-800">Recherche Tokens</h1>
    <button 
      on:click={() => showFilters = !showFilters}
      class="text-sm text-blue-600 hover:text-blue-800"
    >
      {showFilters ? 'Masquer filtres' : 'Afficher filtres'}
    </button>
  </div>

  <!-- Formulaire de filtres -->
  {#if showFilters}
    <div class="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h3 class="font-semibold text-gray-700 mb-3">Filtres de recherche</h3>
      
      <div class="grid grid-cols-2 gap-3 mb-3">
        <!-- IDs (type number) -->
        <div>
          <label class="block text-xs text-gray-600 mb-1">ID</label>
          <input 
            type="number" 
            bind:value={$filters.id}
            on:keypress={handleKeyPress}
            placeholder="ID"
            class="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label class="block text-xs text-gray-600 mb-1">Abonné ID</label>
          <input 
            type="number" 
            bind:value={$filters.abonne_id}
            on:keypress={handleKeyPress}
            placeholder="Abonné ID"
            class="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label class="block text-xs text-gray-600 mb-1">Avis ID</label>
          <input 
            type="number" 
            bind:value={$filters.avis_id}
            on:keypress={handleKeyPress}
            placeholder="Avis ID"
            class="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label class="block text-xs text-gray-600 mb-1">Consultation ID</label>
          <input 
            type="number" 
            bind:value={$filters.consultation_id}
            on:keypress={handleKeyPress}
            placeholder="Consultation ID"
            class="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-4">
        <!-- Strings (type text) -->
        <div>
          <label class="block text-xs text-gray-600 mb-1">HCUB ID</label>
          <input 
            type="text" 
            bind:value={$filters.hcub_id}
            on:keypress={handleKeyPress}
            placeholder="HCUB ID"
            class="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label class="block text-xs text-gray-600 mb-1">Réf. Technique</label>
          <input 
            type="text" 
            bind:value={$filters.reference_technique}
            on:keypress={handleKeyPress}
            placeholder="Référence technique"
            class="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-xs text-gray-600 mb-1">Login</label>
        <input 
          type="text" 
          bind:value={$filters.login}
          on:keypress={handleKeyPress}
          placeholder="Login"
          class="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="flex gap-2">
        <button 
          on:click={resetFilters}
          class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} />
          Réinitialiser
        </button>
        <button 
          on:click={handleSearch}
          disabled={$searchStore.loading}
          class="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          {#if $searchStore.loading}
            <Loader size={16} class="animate-spin" />
            Recherche...
          {:else}
            <Search size={16} />
            Rechercher
          {/if}
        </button>
      </div>
    </div>
  {/if}

  <!-- Message d'erreur -->
  {#if $searchStore.error}
    <div class="bg-red-50 border border-red-200 p-4 rounded-lg">
      <div class="flex items-start gap-2">
        <AlertTriangle size={16} class="text-red-500" />
        <div class="flex-1">
          <p class="text-red-700 font-medium">Erreur</p>
          <p class="text-red-600 text-sm">{$searchStore.error}</p>
        </div>
        <button 
          on:click={handleSearch}
          class="text-sm text-red-600 hover:text-red-800 underline"
        >
          Réessayer
        </button>
      </div>
    </div>
  {/if}

  <!-- Résultats -->
  {#if $searchStore.results.length > 0}
    <div class="bg-white rounded-lg shadow border border-gray-200">
      <div class="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <span class="font-medium text-gray-700">
          {$paginationInfo?.total || $searchStore.results.length} résultat{$paginationInfo?.total > 1 ? 's' : ''}
        </span>
        {#if $paginationInfo}
          <span class="text-sm text-gray-500">
            Page {$paginationInfo.currentPage} sur {$paginationInfo.lastPage}
          </span>
        {/if}
      </div>

      <div class="divide-y divide-gray-200">
        {#each $searchStore.results as result (result.id)}
          <div class="p-4 hover:bg-gray-50 transition-colors">
            <div class="flex justify-between items-start mb-3">
              <div class="flex flex-wrap items-center gap-2">
                {#if result.abonne?.id || result.id}
                  <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                    #{result.abonne?.id || result.id}
                  </span>
                {/if}
                {#if result.abonne?.hcub_id || result.hcub?.id || result.hcub_id}
                  <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                    {result.abonne?.hcub_id || result.hcub?.id || result.hcub_id}
                  </span>
                {/if}
                {#if result.consultation_id}
                  <span class="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
                    Consultation: {result.consultation_id}
                  </span>
                {/if}
              </div>
              
              <!-- Picto favori -->
              <button 
                on:click={() => toggleFavorite(result)}
                class="transition-colors"
                title={$favorites.some(f => f.id === result.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Star size={20} fill={$favorites.some(f => f.id === result.id) ? "currentColor" : "none"} class={$favorites.some(f => f.id === result.id) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'} />
              </button>
            </div>
            
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm min-w-0 flex-1">
                <span class="text-gray-500">Login:</span>
                <span 
                  class="font-medium text-gray-800 truncate block" 
                  title={result.abonne?.login || result.login || '-'}
                >
                  {result.abonne?.login || result.login || '-'}
                </span>
              </div>
              
              {#if result.uuid}
                <button 
                  on:click={() => openConnection(result.uuid)}
                  class="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 flex-shrink-0 whitespace-nowrap"
                >
                  <ExternalLink size={16} />
                  Connexion
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <!-- Pagination simple -->
      {#if $paginationInfo && $paginationInfo.lastPage > 1}
        <div class="p-3 border-t border-gray-200 bg-gray-50">
          <div class="flex justify-between items-center">
            <!-- Précédent -->
            <button 
              on:click={() => changePage(currentPage - 1)}
              disabled={!$paginationInfo.hasPrevious || $searchStore.loading}
              class="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              &laquo; Précédent
            </button>

            <!-- Info page -->
            <span class="text-sm text-gray-600 font-medium">
              Page {$paginationInfo.currentPage} / {$paginationInfo.lastPage}
            </span>

            <!-- Suivant -->
            <button 
              on:click={() => changePage(currentPage + 1)}
              disabled={!$paginationInfo.hasNext || $searchStore.loading}
              class="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Suivant &raquo;
            </button>
          </div>
          
          <div class="text-center text-xs text-gray-500 mt-2">
            {$paginationInfo.total} résultats ({$paginationInfo.from}-{$paginationInfo.to})
          </div>
        </div>
      {/if}
    </div>
  {:else if !$searchStore.loading && !$searchStore.error && $searchStore.meta !== null}
    <div class="text-center py-8 text-gray-500 bg-white rounded-lg shadow border border-gray-200">
      <div class="flex justify-center mb-2">
        <Search size={40} class="text-gray-400" />
      </div>
      <p>Aucun résultat trouvé</p>
      <p class="text-sm text-gray-400 mt-1">Essayez avec d'autres filtres</p>
    </div>
  {/if}

  <!-- Favoris (affiché par défaut si pas de recherche) -->
  {#if !hasSearched && $favorites.length > 0}
    <div class="bg-white rounded-lg shadow border border-gray-200">
      <div class="p-3 border-b border-gray-200 bg-yellow-50 flex justify-between items-center">
        <span class="font-medium text-gray-700 flex items-center gap-2">
          <Star size={16} class="text-yellow-500" />
          Mes favoris ({$favorites.length})
        </span>
      </div>

      <div class="divide-y divide-gray-200">
        {#each $favorites as favorite (favorite.id)}
          <div class="p-4 hover:bg-gray-50 transition-colors">
            <div class="flex justify-between items-start mb-3">
              <div class="flex flex-wrap items-center gap-2">
                {#if favorite.abonne?.id || favorite.id}
                  <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                    #{favorite.abonne?.id || favorite.id}
                  </span>
                {/if}
                {#if favorite.abonne?.hcub_id || favorite.hcub?.id || favorite.hcub_id}
                  <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                    {favorite.abonne?.hcub_id || favorite.hcub?.id || favorite.hcub_id}
                  </span>
                {/if}
                {#if favorite.consultation_id}
                  <span class="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
                    Consultation: {favorite.consultation_id}
                  </span>
                {/if}
              </div>
              
              <!-- Picto favori (rempli car c'est un favori) -->
              <button 
                on:click={() => toggleFavorite(favorite)}
                class="text-yellow-400 hover:text-gray-300 transition-colors"
                title="Retirer des favoris"
              >
                <Star size={20} fill="currentColor" />
              </button>
            </div>
            
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm min-w-0 flex-1">
                <span class="text-gray-500">Login:</span>
                <span 
                  class="font-medium text-gray-800 truncate block" 
                  title={favorite.abonne?.login || favorite.login || '-'}
                >
                  {favorite.abonne?.login || favorite.login || '-'}
                </span>
              </div>
              
              {#if favorite.uuid}
                <button 
                  on:click={() => openConnection(favorite.uuid)}
                  class="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 flex-shrink-0 whitespace-nowrap"
                >
                  <ExternalLink size={16} />
                  Connexion
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else if !hasSearched && $favorites.length === 0}
    <div class="text-center py-8 text-gray-500 bg-white rounded-lg shadow border border-gray-200">
      <div class="flex justify-center mb-2">
        <Star size={40} class="text-gray-300" />
      </div>
      <p>Aucun favori</p>
      <p class="text-sm text-gray-400 mt-1">Faites une recherche et ajoutez des éléments aux favoris</p>
    </div>
  {/if}
</div>
