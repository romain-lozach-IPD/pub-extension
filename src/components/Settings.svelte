<script>
  import { connections } from '../stores/connections.js'
  import { links } from '../stores/links.js'
  import { tasks } from '../stores/tasks.js'
  import { environments } from '../stores/environments.js'
  import { favorites } from '../stores/favorites.js'
  import { onMount } from 'svelte'
  import { AlertTriangle, Plus, Edit2, Trash2, Check, X, Server, Upload, HardDrive } from 'lucide-svelte'

  let showResetConfirm = false
  let fileInput
  let storageUsed = 0
  const STORAGE_MAX = 10 * 1024 * 1024

  function formatBytes(bytes) {
    if (bytes === 0) return '0 o'
    if (bytes < 1024) return bytes + ' o'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' Ko'
    return (bytes / (1024 * 1024)).toFixed(2) + ' Mo'
  }

  async function loadStorageInfo() {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (items) => {
        const jsonString = JSON.stringify(items)
        storageUsed = new Blob([jsonString]).size
        resolve()
      })
    })
  }

  // Environments management
  let showEnvForm = false
  let editingEnvId = null
  let envFormData = {
    name: '',
    url_api: '',
    url_front: '',
    url_opensapi_doc: '',
    login: '',
    password: ''
  }

  onMount(() => {
    environments.load()
    loadStorageInfo()
  })

  async function exportData() {
    // Récupérer toutes les données nécessaires
    const result = await chrome.storage.local.get(['favorites', 'environments', 'links', 'tasks'])
    
    // Préparer les données d'export avec mot de passe vide
    const safeEnvironments = (result.environments || []).map(env => {
      const safeEnv = { ...env }
      safeEnv.password = '' // Toujours vide pour la sécurité
      return safeEnv
    })
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      favorites: result.favorites || [],
      environments: safeEnvironments,
      links: result.links || [],
      tasks: result.tasks || []
    }
    
    // Créer et télécharger le fichier
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-extension-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function importData(file) {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      // Valider la structure minimale
      if (!data || typeof data !== 'object') {
        alert('Format de fichier invalide')
        return
      }
      
      // Confirmer avant d'écraser les données existantes
      if (!confirm('Cette action va remplacer vos données actuelles (favoris, environnements et liens). Continuer ?')) {
        return
      }
      
      // Préparer les données à importer
      const importData = {}
      
      if (data.favorites && Array.isArray(data.favorites)) {
        importData.favorites = data.favorites
      }
      
      if (data.environments && Array.isArray(data.environments)) {
        importData.environments = data.environments
      }
      
      if (data.links && Array.isArray(data.links)) {
        importData.links = data.links
      }

      if (data.tasks && Array.isArray(data.tasks)) {
        importData.tasks = data.tasks
      }
      
      // Sauvegarder dans le storage
      await chrome.storage.local.set(importData)
      
      // Recharger les stores
      await favorites.load()
      await environments.load()
      await links.load()
      await tasks.load()
      
      alert('Données importées avec succès !')
    } catch (e) {
      alert('Erreur lors de l\'import : ' + e.message)
    }
  }

  function handleFileSelect(event) {
    const file = event.target.files[0]
    if (file) {
      importData(file)
    }
    // Réinitialiser l'input pour permettre de sélectionner le même fichier à nouveau
    event.target.value = ''
  }

  function resetAllData() {
    chrome.storage.local.clear(() => {
      connections.load()
      links.load()
      environments.load()
      tasks.load()
      showResetConfirm = false
      alert('Toutes les données ont été effacées')
    })
  }

  // Environment functions
  function resetEnvForm() {
    envFormData = {
      name: '',
      url_api: '',
      url_front: '',
      url_opensapi_doc: '',
      login: '',
      password: ''
    }
    editingEnvId = null
    showEnvForm = false
  }

  function openAddEnvForm() {
    resetEnvForm()
    showEnvForm = true
  }

  function openEditEnvForm(env) {
    envFormData = {
      name: env.name,
      url_api: env.url_api,
      url_front: env.url_front,
      url_opensapi_doc: env.url_opensapi_doc || '',
      login: env.login,
      password: env.password
    }
    editingEnvId = env.id
    showEnvForm = true
  }

  async function saveEnvironment() {
    if (!envFormData.name || !envFormData.url_api) {
      alert('Le nom et l\'URL API sont obligatoires')
      return
    }

    if (editingEnvId) {
      await environments.update(editingEnvId, envFormData)
    } else {
      await environments.add(envFormData)
    }
    
    resetEnvForm()
  }

  async function deleteEnvironment(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet environnement ?')) {
      await environments.remove(id)
    }
  }

  async function setActiveEnvironment(id) {
    await environments.setActive(id)
  }
</script>

<div class="space-y-4 max-w-2xl bg-[#f5f5f5] min-h-screen p-4">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-800">Paramètres</h1>
  </div>

  <!-- Environnements -->
  <div class="bg-white border border-gray-200 rounded p-4">
    <div class="bg-gray-50 border-b border-gray-200 p-3 font-semibold text-gray-700 mb-3 -m-4 flex items-center gap-2">
      <Server size={20} />
      Environnements
    </div>
    
    <div class="mt-6">
      {#if showEnvForm}
        <div class="bg-gray-50 border border-gray-200 rounded p-4 mb-4">
          <h4 class="font-medium text-gray-700 mb-3">
            {editingEnvId ? 'Modifier l\'environnement' : 'Nouvel environnement'}
          </h4>
          
          <div class="space-y-3">
            <div>
              <label for="env-name" class="block text-sm text-gray-600 mb-1">Nom *</label>
              <input 
                id="env-name"
                type="text" 
                bind:value={envFormData.name}
                placeholder="Ex: Production, Développement..."
                class="w-full p-2 border border-gray-300 rounded text-sm focus:border-[#1e3a5f] outline-none"
              />
            </div>

            <div>
              <label for="env-api" class="block text-sm text-gray-600 mb-1">URL API *</label>
              <input 
                id="env-api"
                type="url" 
                bind:value={envFormData.url_api}
                placeholder="http://localhost/api"
                class="w-full p-2 border border-gray-300 rounded text-sm focus:border-[#1e3a5f] outline-none"
              />
            </div>

            <div>
              <label for="env-front" class="block text-sm text-gray-600 mb-1">URL Front</label>
              <input 
                id="env-front"
                type="url" 
                bind:value={envFormData.url_front}
                placeholder="http://localhost"
                class="w-full p-2 border border-gray-300 rounded text-sm focus:border-[#1e3a5f] outline-none"
              />
            </div>

            <div>
              <label for="env-opensapi" class="block text-sm text-gray-600 mb-1">URL Documentation OpenAPI</label>
              <input 
                id="env-opensapi"
                type="url" 
                bind:value={envFormData.url_opensapi_doc}
                placeholder="https://api.example.com/docs/openapi.json"
                class="w-full p-2 border border-gray-300 rounded text-sm focus:border-[#1e3a5f] outline-none"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="env-login" class="block text-sm text-gray-600 mb-1">Login</label>
                <input 
                  id="env-login"
                  type="text" 
                  bind:value={envFormData.login}
                  placeholder="Nom d'utilisateur"
                  class="w-full p-2 border border-gray-300 rounded text-sm focus:border-[#1e3a5f] outline-none"
                />
              </div>

              <div>
                <label for="env-password" class="block text-sm text-gray-600 mb-1">Mot de passe</label>
                <input 
                  id="env-password"
                  type="password" 
                  bind:value={envFormData.password}
                  placeholder="Mot de passe"
                  class="w-full p-2 border border-gray-300 rounded text-sm focus:border-[#1e3a5f] outline-none"
                />
              </div>
            </div>
          </div>

          <div class="flex gap-2 mt-4">
            <button 
              on:click={saveEnvironment}
              class="flex-1 bg-[#1e3a5f] hover:bg-[#2a4a73] text-white py-2 rounded font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Check size={18} />
              {editingEnvId ? 'Modifier' : 'Ajouter'}
            </button>
            <button 
              on:click={resetEnvForm}
              class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded font-medium transition-colors flex items-center justify-center gap-2"
            >
              <X size={18} />
              Annuler
            </button>
          </div>
        </div>
      {:else}
        <button 
          on:click={openAddEnvForm}
          class="w-full bg-[#1e3a5f] hover:bg-[#2a4a73] text-white py-2 rounded font-medium transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <Plus size={18} />
          Ajouter un environnement
        </button>
      {/if}

      <!-- Liste des environnements -->
      {#if $environments.length === 0}
        <div class="text-center text-gray-500 py-4">
          <Server size={32} class="mx-auto mb-2 text-gray-300" />
          <p class="text-sm">Aucun environnement configuré</p>
        </div>
      {:else}
        <div class="space-y-2">
          {#each $environments as env (env.id)}
            <div class="bg-white border border-gray-200 rounded p-3 {env.isActive ? 'border-l-4 border-l-[#1e3a5f]' : ''}">
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                  <h4 class="font-medium text-gray-800">{env.name}</h4>
                  {#if env.isActive}
                    <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Actif</span>
                  {/if}
                </div>
                <div class="flex gap-1">
                  {#if !env.isActive}
                    <button 
                      on:click={() => setActiveEnvironment(env.id)}
                      class="p-1.5 text-gray-400 hover:text-[#1e3a5f] hover:bg-gray-100 rounded transition-colors"
                      title="Définir comme actif"
                    >
                      <Check size={14} />
                    </button>
                  {/if}
                  <button 
                    on:click={() => openEditEnvForm(env)}
                    class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Modifier"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    on:click={() => deleteEnvironment(env.id)}
                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div class="text-xs text-gray-600 space-y-0.5">
                <div><span class="text-gray-500">API:</span> {env.url_api}</div>
                {#if env.url_front}
                  <div><span class="text-gray-500">Front:</span> {env.url_front}</div>
                {/if}
                {#if env.login}
                  <div><span class="text-gray-500">Login:</span> {env.login}</div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Actions -->
  <div class="bg-white border border-gray-200 rounded p-4">
    <h3 class="bg-gray-50 border-b border-gray-200 p-3 font-semibold text-gray-700 mb-3 -m-4">Actions</h3>
    <div class="space-y-2 mt-6">
      <button 
        on:click={exportData}
        class="w-full bg-[#1e3a5f] hover:bg-[#2a4a73] text-white py-2 rounded font-medium flex items-center justify-center gap-2"
      >
        <span>📥</span> Exporter toutes les données
      </button>
      <button 
        on:click={() => fileInput.click()}
        class="w-full bg-white border border-[#1e3a5f] text-[#1e3a5f] hover:bg-gray-50 py-2 rounded font-medium flex items-center justify-center gap-2"
      >
        <Upload size={18} />
        Importer depuis un fichier
      </button>
      <input 
        type="file" 
        bind:this={fileInput}
        on:change={handleFileSelect}
        accept=".json"
        class="hidden"
      />
      
      {#if !showResetConfirm}
        <button 
          on:click={() => showResetConfirm = true}
          class="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded font-medium"
        >
          <AlertTriangle size={18} class="inline mr-1" /> Réinitialiser toutes les données
        </button>
      {:else}
        <div class="bg-red-50 border border-red-200 rounded p-3 mt-3">
          <p class="text-red-700 text-sm mb-2">Êtes-vous sûr ? Cette action est irréversible.</p>
          <div class="flex gap-2">
            <button 
              on:click={resetAllData}
              class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded font-medium"
            >
              Oui, tout effacer
            </button>
            <button 
              on:click={() => showResetConfirm = false}
              class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Stockage -->
  <div class="bg-white border border-gray-200 rounded p-4">
    <div class="bg-gray-50 border-b border-gray-200 p-3 font-semibold text-gray-700 mb-3 -m-4 flex items-center gap-2">
      <HardDrive size={20} />
      Stockage
    </div>
    <div class="mt-6">
      <div class="flex justify-between items-center text-sm mb-2">
        <span class="text-gray-600">Espace utilisé</span>
        <span class="font-medium">{formatBytes(storageUsed)}</span>
      </div>
      <div class="flex justify-between items-center text-sm mb-2">
        <span class="text-gray-600">Espace maximum</span>
        <span class="font-medium">{formatBytes(STORAGE_MAX)}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5 mt-3">
        <div 
          class="h-2.5 rounded-full transition-all {storageUsed / STORAGE_MAX > 0.8 ? 'bg-red-500' : 'bg-[#1e3a5f]'}" 
          style="width: {Math.min((storageUsed / STORAGE_MAX) * 100, 100)}%"
        ></div>
      </div>
      <p class="text-xs text-gray-400 mt-2 text-right">
        {((storageUsed / STORAGE_MAX) * 100).toFixed(1)}% utilisé
      </p>
    </div>
  </div>

  <!-- À propos -->
  <div class="bg-white border border-gray-200 rounded p-4">
    <div class="bg-gray-50 border-b border-gray-200 p-3 font-semibold text-gray-700 mb-3 -m-4">
      À propos
    </div>
    <div class="space-y-2 text-sm text-gray-600 mt-6">
      <p><strong>Nom :</strong> Side Panel Extension</p>
      <p><strong>Version :</strong> 1.0.0</p>
      <p><strong>Description :</strong> Extension Chrome avec Side Panel</p>
      <p><strong>Auteur :</strong> Roloza</p>
      <p><strong>Plateforme :</strong> Chrome Extension (Manifest V3)</p>
    </div>
  </div>
</div>
