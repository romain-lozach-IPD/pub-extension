<script>
  import { links } from '../stores/links.js'
  import { onMount } from 'svelte'
  import { Pencil, Trash2 } from 'lucide-svelte'

  let newLink = { name: '', url: '', description: '' }
  let editingId = null
  let showForm = false

  onMount(() => {
    links.load()
  })

  function saveLink() {
    if (!newLink.name || !newLink.url) return
    
    // Ajouter https:// si pas de protocole
    if (!newLink.url.match(/^https?:\/\//)) {
      newLink.url = 'https://' + newLink.url
    }
    
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

<div class="space-y-4 max-w-2xl">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-800">Liens utiles</h1>
    <button 
      on:click={() => showForm = !showForm}
      class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
    >
      {showForm ? 'Annuler' : '+ Ajouter'}
    </button>
  </div>

  <!-- Formulaire -->
  {#if showForm}
    <div class="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h3 class="font-semibold text-gray-700 mb-3">
        {editingId ? 'Modifier le lien' : 'Nouveau lien'}
      </h3>
      <div class="space-y-3">
        <input 
          bind:value={newLink.name} 
          placeholder="Nom du lien *" 
          class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
        />
        <input 
          bind:value={newLink.url} 
          placeholder="URL * (ex: exemple.com)" 
          class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
        />
        <input 
          bind:value={newLink.description} 
          placeholder="Description (optionnel)" 
          class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
        />
        <div class="flex gap-2">
          <button 
            on:click={saveLink}
            disabled={!newLink.name || !newLink.url}
            class="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-2 rounded-lg font-medium transition-colors"
          >
            {editingId ? 'Modifier' : 'Ajouter'}
          </button>
          {#if editingId}
            <button 
              on:click={resetForm}
              class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
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
        <div class="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div class="flex-1 min-w-0">
              <button 
                on:click={() => openLink(link.url)}
                class="text-left group"
              >
                <div class="font-semibold text-blue-600 group-hover:underline truncate">
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
                class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Modifier"
              >
                <Pencil size={18} />
              </button>
              <button
                on:click={() => remove(link.id)}
                class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
