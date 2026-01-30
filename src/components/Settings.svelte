<script>
  import { settings } from '../stores/settings.js'
  import { connections } from '../stores/connections.js'
  import { links } from '../stores/links.js'
  import { onMount } from 'svelte'
  import { AlertTriangle } from 'lucide-svelte'

  let stats = { connections: 0, links: 0 }
  let showResetConfirm = false

  onMount(async () => {
    settings.load()
    const conn = await chrome.storage.local.get(['connections'])
    const lnk = await chrome.storage.local.get(['links'])
    stats.connections = (conn.connections || []).length
    stats.links = (lnk.links || []).length
  })

  function exportData() {
    chrome.storage.local.get(null, (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-extension-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  function resetAllData() {
    chrome.storage.local.clear(() => {
      connections.load()
      links.load()
      stats = { connections: 0, links: 0 }
      showResetConfirm = false
      alert('Toutes les données ont été effacées')
    })
  }
</script>

<div class="space-y-4 max-w-2xl">
  <h1 class="text-2xl font-bold text-gray-800">Paramètres</h1>

  <!-- Statistiques -->
  <div class="bg-white p-4 rounded-lg shadow border border-gray-200">
    <h3 class="font-semibold text-gray-700 mb-3">Statistiques</h3>
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-blue-50 p-3 rounded-lg text-center">
        <div class="text-2xl font-bold text-blue-600">{stats.connections}</div>
        <div class="text-sm text-gray-600">Connexions</div>
      </div>
      <div class="bg-green-50 p-3 rounded-lg text-center">
        <div class="text-2xl font-bold text-green-600">{stats.links}</div>
        <div class="text-sm text-gray-600">Liens</div>
      </div>
    </div>
  </div>

  <!-- Options -->
  <div class="bg-white p-4 rounded-lg shadow border border-gray-200">
    <h3 class="font-semibold text-gray-700 mb-3">Options</h3>
    <div class="space-y-3">
      <label class="flex items-center justify-between cursor-pointer">
        <span class="text-gray-700">Sauvegarde automatique XML</span>
        <input 
          type="checkbox" 
          checked={$settings.autoSave}
          on:change={(e) => settings.updateSetting('autoSave', e.target.checked)}
          class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
        />
      </label>
      
      <div class="flex items-center justify-between">
        <span class="text-gray-700">Format d'export par défaut</span>
        <select 
          value={$settings.defaultExportFormat}
          on:change={(e) => settings.updateSetting('defaultExportFormat', e.target.value)}
          class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="xml">XML</option>
          <option value="json">JSON</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Actions -->
  <div class="bg-white p-4 rounded-lg shadow border border-gray-200">
    <h3 class="font-semibold text-gray-700 mb-3">Actions</h3>
    <div class="space-y-2">
      <button 
        on:click={exportData}
        class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors"
      >
        📥 Exporter toutes les données
      </button>
      
      {#if !showResetConfirm}
        <button 
          on:click={() => showResetConfirm = true}
          class="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-medium transition-colors"
        >
          <AlertTriangle size={18} class="inline mr-1" /> Réinitialiser toutes les données
        </button>
      {:else}
        <div class="bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-red-700 text-sm mb-2">Êtes-vous sûr ? Cette action est irréversible.</p>
          <div class="flex gap-2">
            <button 
              on:click={resetAllData}
              class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Oui, tout effacer
            </button>
            <button 
              on:click={() => showResetConfirm = false}
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Informations -->
  <div class="bg-gray-100 p-4 rounded-lg text-sm text-gray-600">
    <p><strong>Version :</strong> 1.0.0</p>
    <p class="mt-1">Extension Chrome avec Side Panel</p>
  </div>
</div>
