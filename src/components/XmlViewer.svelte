<script lang="ts">
  import { toastStore } from '../stores/toast.ts'
  import { AlignLeft, Minimize2, Copy, RotateCcw } from 'lucide-svelte'
  import XmlTreeNode from './XmlTreeNode.svelte'
  import { domToXmlNode, formatXmlNode, countAllMatches } from '../lib/xmlViewerTypes.ts'
  import type { XmlNodeData } from '../lib/xmlViewerTypes.ts'
  import { Search, X } from 'lucide-svelte'

  let input = ''
  let activeView: 'tree' | 'formatted' = 'tree'
  let searchQuery = ''
  let rootNode: XmlNodeData | null = null
  let piNodes: XmlNodeData[] = []
  let parseError: string | null = null
  let formatted = ''

  $: {
    if (input.trim()) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(input, 'application/xml')
      const parserError = doc.querySelector('parsererror')
      if (parserError) {
        rootNode = null
        piNodes = []
        parseError = parserError.textContent?.split('\n')[0] ?? 'XML invalide'
        formatted = ''
      } else {
        parseError = null
        rootNode = domToXmlNode(doc.documentElement)
        piNodes = Array.from(doc.childNodes)
          .filter(n => n.nodeType === Node.PROCESSING_INSTRUCTION_NODE)
          .map(n => domToXmlNode(n))
          .filter((n): n is XmlNodeData => n !== null)
        const lines = Array.from(doc.childNodes)
          .map(n => n.nodeType === Node.ELEMENT_NODE ? formatXmlNode(n, 0) : formatXmlNode(n, 0))
          .filter(s => s !== '')
        formatted = lines.join('\n')
      }
    } else {
      rootNode = null
      piNodes = []
      parseError = null
      formatted = ''
    }
  }

  function beautify(): void {
    if (!formatted) return
    input = formatted
  }

  function minify(): void {
    if (!rootNode) return
    input = input.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim()
  }

  async function copyFormatted(): Promise<void> {
    if (!formatted) return
    await navigator.clipboard.writeText(formatted)
    toastStore.success('XML copié !')
  }

  function clear(): void {
    input = ''
  }

  function nodeCountLabel(): string {
    if (!rootNode || rootNode.type !== 'element') return ''
    const count = rootNode.children.length
    return `${rootNode.tagName} · ${count} enfant${count > 1 ? 's' : ''}`
  }

  $: matchCount = rootNode && searchQuery ? countAllMatches(rootNode, searchQuery) : 0
</script>

<div class="space-y-4 max-w-2xl bg-[#f5f5f5] p-4">
  <h1 class="text-2xl font-bold text-gray-800">XML Viewer</h1>

  <!-- Input -->
  <div class="bg-white rounded border border-gray-200">
    <div class="bg-gray-50 border-b border-gray-200 px-3 py-2 flex justify-between items-center gap-2">
      <span class="text-sm font-semibold text-gray-700 flex-shrink-0">XML</span>
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          on:click={beautify}
          disabled={!rootNode}
          class="flex items-center gap-1 text-xs border border-[#1e3a5f] text-[#1e3a5f] hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
        >
          <AlignLeft size={11} /> Formater
        </button>
        <button
          on:click={minify}
          disabled={!rootNode}
          class="flex items-center gap-1 text-xs border border-[#1e3a5f] text-[#1e3a5f] hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
        >
          <Minimize2 size={11} /> Minifier
        </button>
        <button
          on:click={copyFormatted}
          disabled={!rootNode}
          class="flex items-center gap-1 text-xs border border-[#1e3a5f] text-[#1e3a5f] hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
        >
          <Copy size={11} /> Copier
        </button>
        <button
          on:click={clear}
          class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors px-1"
          title="Effacer"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
    <textarea
      bind:value={input}
      placeholder={'Collez votre XML ici…\n<root><item>value</item></root>'}
      rows={8}
      class="w-full p-3 font-mono text-xs resize-y focus:outline-none border-0 bg-white"
      spellcheck="false"
    />
  </div>

  <!-- Erreur -->
  {#if parseError}
    <div class="bg-red-50 border border-red-200 p-3 rounded">
      <p class="text-xs font-semibold text-red-600 mb-0.5">XML invalide</p>
      <p class="text-xs font-mono text-red-700">{parseError}</p>
    </div>
  {/if}

  <!-- Résultat -->
  {#if rootNode}
    <div class="bg-white rounded border border-gray-200">
      <div class="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2">
        <div class="flex items-center gap-1 flex-shrink-0">
          <button
            on:click={() => (activeView = 'tree')}
            class="text-xs px-2.5 py-1 rounded font-medium transition-colors
                   {activeView === 'tree' ? 'bg-[#1e3a5f] text-white' : 'text-gray-600 hover:bg-gray-200'}"
          >
            Arbre
          </button>
          <button
            on:click={() => (activeView = 'formatted')}
            class="text-xs px-2.5 py-1 rounded font-medium transition-colors
                   {activeView === 'formatted' ? 'bg-[#1e3a5f] text-white' : 'text-gray-600 hover:bg-gray-200'}"
          >
            Formaté
          </button>
        </div>

        {#if activeView === 'tree'}
          <div class="flex-1 relative">
            <Search size={11} class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Rechercher…"
              class="w-full text-xs border border-gray-300 rounded pl-6 pr-6 py-1 focus:border-[#1e3a5f] outline-none bg-white"
            />
            {#if searchQuery}
              <button
                on:click={() => (searchQuery = '')}
                class="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={11} />
              </button>
            {/if}
          </div>
          {#if searchQuery}
            <span class="flex-shrink-0 text-xs font-medium {matchCount > 0 ? 'text-[#1e3a5f]' : 'text-red-500'}">
              {matchCount > 0 ? `${matchCount} résultat${matchCount > 1 ? 's' : ''}` : 'Aucun résultat'}
            </span>
          {/if}
        {:else}
          <span class="flex-1 text-right text-xs text-gray-400 font-mono">{nodeCountLabel()}</span>
        {/if}
      </div>

      <div class="p-3 overflow-auto max-h-[480px]">
        {#if activeView === 'tree'}
          {#each piNodes as pi, i (i)}
            <XmlTreeNode node={pi} depth={0} {searchQuery} />
          {/each}
          <XmlTreeNode node={rootNode} depth={0} {searchQuery} />
        {:else}
          <pre class="font-mono text-xs text-gray-800 whitespace-pre-wrap break-all leading-relaxed">{formatted}</pre>
        {/if}
      </div>
    </div>
  {:else if !parseError && !input.trim()}
    <div class="text-center py-10 text-gray-400 bg-white rounded border border-gray-200">
      <p class="text-sm">Collez du XML dans le champ ci-dessus</p>
      <p class="text-xs mt-1">La vue arbre et le formatage apparaîtront ici</p>
    </div>
  {/if}
</div>
