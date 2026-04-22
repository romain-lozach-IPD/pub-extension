<script lang="ts">
  import { toastStore } from '../stores/toast.ts'
  import { AlignLeft, Minimize2, Copy, RotateCcw, Search, X } from 'lucide-svelte'
  import JsonTreeNode from './JsonTreeNode.svelte'

  let input = ''
  let activeView: 'tree' | 'formatted' = 'tree'
  let searchQuery = ''
  let parsedJson: unknown = null
  let parseError: string | null = null
  let formatted = ''

  $: {
    if (input.trim()) {
      try {
        parsedJson = JSON.parse(input)
        parseError = null
        formatted = JSON.stringify(parsedJson, null, 2)
      } catch (e) {
        parsedJson = null
        parseError = (e as Error).message
        formatted = ''
      }
    } else {
      parsedJson = null
      parseError = null
      formatted = ''
    }
  }

  function beautify(): void {
    if (!parsedJson) return
    input = JSON.stringify(parsedJson, null, 2)
  }

  function minify(): void {
    if (!parsedJson) return
    input = JSON.stringify(parsedJson)
  }

  async function copyFormatted(): Promise<void> {
    if (!formatted) return
    await navigator.clipboard.writeText(formatted)
    toastStore.success('JSON copié !')
  }

  function clear(): void {
    input = ''
  }

  function typeLabel(v: unknown): string {
    if (v === null) return 'null'
    if (Array.isArray(v)) return `Array [${(v as unknown[]).length}]`
    if (typeof v === 'object') return `Object {${Object.keys(v as object).length}}`
    return typeof v
  }

  function countMatches(v: unknown, query: string, key: string | number | null = null): number {
    if (!query) return 0
    const q = query.toLowerCase()
    let self = 0
    if (key !== null && String(key).toLowerCase().includes(q)) self = 1
    if (Array.isArray(v)) {
      return self + (v as unknown[]).reduce((acc: number, child, i) => acc + countMatches(child, query, i), 0)
    }
    if (typeof v === 'object' && v !== null) {
      return self + Object.entries(v as Record<string, unknown>)
        .reduce((acc: number, [k, child]) => acc + countMatches(child, query, k), 0)
    }
    const str = v === null ? 'null' : String(v)
    return self + (str.toLowerCase().includes(q) ? 1 : 0)
  }

  $: matchCount = parsedJson !== null && searchQuery ? countMatches(parsedJson, searchQuery) : 0
</script>

<div class="space-y-4 max-w-2xl bg-[#f5f5f5] p-4">
  <h1 class="text-2xl font-bold text-gray-800">JSON Viewer</h1>

  <!-- Input -->
  <div class="bg-white rounded border border-gray-200">
    <div class="bg-gray-50 border-b border-gray-200 px-3 py-2 flex justify-between items-center gap-2">
      <span class="text-sm font-semibold text-gray-700 flex-shrink-0">JSON</span>
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          on:click={beautify}
          disabled={!parsedJson}
          class="flex items-center gap-1 text-xs border border-[#1e3a5f] text-[#1e3a5f] hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
        >
          <AlignLeft size={11} /> Formater
        </button>
        <button
          on:click={minify}
          disabled={!parsedJson}
          class="flex items-center gap-1 text-xs border border-[#1e3a5f] text-[#1e3a5f] hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
        >
          <Minimize2 size={11} /> Minifier
        </button>
        <button
          on:click={copyFormatted}
          disabled={!parsedJson}
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
      placeholder={'Collez votre JSON ici…\n{"key": "value"}'}
      rows={8}
      class="w-full p-3 font-mono text-xs resize-y focus:outline-none border-0 bg-white"
      spellcheck="false"
    />
  </div>

  <!-- Erreur de parsing -->
  {#if parseError}
    <div class="bg-red-50 border border-red-200 p-3 rounded">
      <p class="text-xs font-semibold text-red-600 mb-0.5">JSON invalide</p>
      <p class="text-xs font-mono text-red-700">{parseError}</p>
    </div>
  {/if}

  <!-- Résultat -->
  {#if parsedJson !== null}
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
          <span class="flex-1 text-right text-xs text-gray-400">{typeLabel(parsedJson)}</span>
        {/if}
      </div>

      <div class="p-3 overflow-auto max-h-[480px]">
        {#if activeView === 'tree'}
          <JsonTreeNode value={parsedJson} depth={0} isLast={true} {searchQuery} />
        {:else}
          <pre class="font-mono text-xs text-gray-800 whitespace-pre-wrap break-all leading-relaxed">{formatted}</pre>
        {/if}
      </div>
    </div>
  {:else if !parseError && !input.trim()}
    <div class="text-center py-10 text-gray-400 bg-white rounded border border-gray-200">
      <p class="text-sm">Collez du JSON dans le champ ci-dessus</p>
      <p class="text-xs mt-1">La vue arbre et le formatage apparaîtront ici</p>
    </div>
  {/if}
</div>
