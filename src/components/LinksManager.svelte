<script>
  import { links } from '../stores/links.js'
  import { environments } from '../stores/environments.js'
  import { onMount } from 'svelte'
  import { Pencil, Trash2 } from 'lucide-svelte'

  let newLink = { name: '', url: '', description: '' }
  let editingId = null
  let showForm = false

  onMount(() => {
    links.load()
    environments.load()
  })

  function getApiBase() {
    const activeEnv = environments.getActive()
    return activeEnv?.url_api?.replace(/\/$/, '') || ''
  }

  function resolveUrl(url) {
    // Si l'URL commence par http, la retourner telle quelle
    if (url.match(/^https?:\/\//)) {
      return url
    }
    
    // Sinon, ajouter l'URL de l'API active comme base
    const apiBase = getApiBase()
    if (apiBase) {
      // Ajouter un / au début de l'URL si elle n'en a pas
      const cleanUrl = url.startsWith('/') ? url : '/' + url
      return apiBase + cleanUrl
    }
    
    // Fallback sur https si pas d'environnement actif
    return 'https://' + url
  }

  function saveLink() {
    if (!newLink.name || !newLink.url) return
    
    // Résoudre l'URL (ajouter le domaine API si besoin)
    newLink.url = resolveUrl(newLink.url)
    
    if (editingId) {
      links.update(editingId, newLink)
    } else {
      links.add(newLink)
    }
    
    resetForm()
  }

  function edit(link) {
    newLink = { 
      name: link.name, 
      url: link.url, 
      description: link.description || '' 
    }
    editingId = link.id
    showForm = true
  }

  function remove(id) {
    if (confirm('Supprimer ce lien ?')) {
      links.remove(id)
    }
  }

  function resetForm() {
    newLink = { name: '', url: '', description: '' }
    editingId = null
    showForm = false
  }

  function openLink(url) {
    chrome.tabs.create({ url })
  }
</script>

<div class="space-y-4 max-w-2xl bg-[#f5f5f5] min-h-screen p-4">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-800">Liens utiles</h1>
    <button 
      on:click={() => showForm = !showForm}
      class="bg-[#1e3a5f] hover:bg-[#2a4a73] text-white px-4 py-2 rounded font-medium transition-colors"
    >
      {showForm ? 'Annuler' : '+ Ajouter'}
    </button>
  </div>

  <!-- Formulaire -->
  {#if showForm}
    <div class="bg-white border border-gray-200 rounded p-4">
      <h3 class="font-semibold text-gray-700 mb-3 bg-gray-50 border-b border-gray-200 px-3 py-2 -mx-4 -mt-4 mb-3">
        {editingId ? 'Modifier le lien' : 'Nouveau lien'}
      </h3>
      <div class="space-y-3">
        <input 
          bind:value={newLink.name} 
          placeholder="Nom du lien *" 
          class="w-full p-2 border border-gray-300 rounded focus:border-[#1e3a5f]" 
        />
        <input 
          bind:value={newLink.url} 
          placeholder="URL * (ex: /api/endpoint ou http://...)" 
          class="w-full p-2 border border-gray-300 rounded focus:border-[#1e3a5f]" 
        />
        <p class="text-xs text-gray-500">
          Sans http, l'URL sera préfixée avec l'API active : {getApiBase() || 'https://...'}
        </p>
        <input 
          bind:value={newLink.description} 
          placeholder="Description (optionnel)" 
          class="w-full p-2 border border-gray-300 rounded focus:border-[#1e3a5f]" 
        />
        <div class="flex gap-2">
          <button 
            on:click={saveLink}
            disabled={!newLink.name || !newLink.url}
            class="flex-1 bg-[#1e3a5f] hover:bg-[#2a4a73] disabled:bg-gray-300 text-white py-2 rounded font-medium transition-colors"
          >
            {editingId ? 'Modifier' : 'Ajouter'}
          </button>
          {#if editingId}
            <button 
              on:click={resetForm}
              class="px-4 py-2 bg-white border border-[#1e3a5f] text-[#1e3a5f] rounded transition-colors"
            >
              Annuler
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Liste des liens -->
  <div class="space-y-2">
    {#if $links.length === 0}
      <div class="text-center py-8 text-gray-500">
        Aucun lien enregistré
      </div>
    {:else}
      {#each $links as link (link.id)}
        <div class="bg-white border border-gray-200 rounded p-4">
          <div class="flex justify-between items-start">
            <div class="flex-1 min-w-0">
              <button 
                on:click={() => openLink(link.url)}
                class="text-left group"
              >
                <div class="font-semibold text-[#1e3a5f] group-hover:underline truncate">
                  {link.name}
                </div>
                <div class="text-sm text-gray-500 truncate">{link.url}</div>
              </button>
              {#if link.description}
                <div class="text-sm text-gray-600 mt-1">{link.description}</div>
              {/if}
            </div>
            <div class="flex gap-1 ml-2">
              <button
                on:click={() => edit(link)}
                class="p-2 text-gray-600 hover:text-[#1e3a5f] rounded transition-colors"
                title="Modifier"
              >
                <Pencil size={18} />
              </button>
              <button
                on:click={() => remove(link.id)}
                class="p-2 text-red-600 hover:text-red-800 rounded transition-colors"
                title="Supprimer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
