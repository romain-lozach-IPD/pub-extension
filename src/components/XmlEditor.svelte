<script>
  import { settings } from '../stores/settings.js'
  import { onMount } from 'svelte'
  import { Download } from 'lucide-svelte'

  let xmlContent = ''
  let fileName = 'connexion.xml'
  let autoSave = true

  onMount(() => {
    settings.load()
    // Charger le contenu sauvegardé
    chrome.storage.local.get(['xmlContent'], (result) => {
      if (result.xmlContent) {
        xmlContent = result.xmlContent
      }
    })
  })

  $: if (autoSave && xmlContent) {
    chrome.storage.local.set({ xmlContent })
  }

  function downloadXml() {
    if (!xmlContent.trim()) return
    
    const blob = new Blob([xmlContent], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function clearXml() {
    if (confirm('Effacer tout le contenu ?')) {
      xmlContent = ''
      chrome.storage.local.remove(['xmlContent'])
    }
  }

  function formatXml() {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlContent, 'application/xml')
      
      // Vérifier les erreurs de parsing
      const parserError = xmlDoc.querySelector('parsererror')
      if (parserError) {
        alert('XML invalide : ' + parserError.textContent)
        return
      }
      
      // Formatter
      const serializer = new XMLSerializer()
      const formatted = serializer.serializeToString(xmlDoc)
      
      // Ajouter indentation basique
      xmlContent = formatWithIndentation(formatted)
    } catch (e) {
      alert('Erreur de formatage XML')
    }
  }

  function formatWithIndentation(xml) {
    let formatted = ''
    let indent = ''
    const tab = '  '
    
    xml = xml.replace(/>\s*</g, '><')
    
    xml.split(/(<[^>]+>)/g).forEach((node) => {
      if (node.match(/^<\//)) {
        indent = indent.substring(tab.length)
      }
      
      if (node.trim()) {
        formatted += indent + node + '\n'
      }
      
      if (node.match(/^<[^/][^>]*>/) && !node.match(/\/>/) && !node.match(/^<[^>]*>/)) {
        indent += tab
      }
    })
    
    return formatted.trim()
  }

  function loadTemplate() {
    xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<connection>
  <name>Nom de la connexion</name>
  <type>ssh</type>
  <host>exemple.com</host>
  <port>22</port>
  <username>utilisateur</username>
  <authentication>
    <method>password</method>
  </authentication>
</connection>`
  }
</script>

<div class="space-y-4 max-w-2xl">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-800">Éditeur XML</h1>
    <div class="flex gap-2">
      <button 
        on:click={loadTemplate}
        class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Template
      </button>
      <button 
        on:click={formatXml}
        class="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Formater
      </button>
      <button 
        on:click={clearXml}
        class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Effacer
      </button>
    </div>
  </div>

  <!-- Options -->
  <div class="bg-white p-3 rounded-lg shadow border border-gray-200">
    <div class="flex items-center gap-4">
      <label class="flex items-center gap-2 text-sm">
        <span>Nom du fichier:</span>
        <input 
          type="text" 
          bind:value={fileName}
          class="px-2 py-1 border rounded text-sm w-40"
        />
      </label>
      <label class="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" bind:checked={autoSave} />
        <span>Auto-sauvegarde</span>
      </label>
    </div>
  </div>

  <!-- Éditeur -->
  <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
    <div class="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
      <span class="text-sm font-medium text-gray-600">Contenu XML</span>
      <span class="text-xs text-gray-400">{xmlContent.length} caractères</span>
    </div>
    <textarea
      bind:value={xmlContent}
      placeholder="Rédigez votre XML ici..."
      class="w-full h-96 p-4 font-mono text-sm resize-none focus:outline-none"
      spellcheck="false"
    ></textarea>
  </div>

  <!-- Bouton téléchargement -->
  <button 
    on:click={downloadXml}
    disabled={!xmlContent.trim()}
    class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
  >
    <Download size={20} />
    Télécharger le fichier XML
  </button>
</div>
