<script lang="ts">
  import { toastStore } from '../stores/toast.ts'
  import { Copy, RotateCcw, ArrowDown, ArrowUp } from 'lucide-svelte'

  let input = ''
  let output = ''
  let error: string | null = null
  let detectedEncoding: string | null = null

  function encode(): void {
    error = null
    detectedEncoding = null
    try {
      output = btoa(unescape(encodeURIComponent(input)))
    } catch (e) {
      error = (e as Error).message
      output = ''
    }
  }

  function decode(): void {
    error = null
    detectedEncoding = null
    try {
      const raw = atob(input.trim())
      try {
        output = decodeURIComponent(escape(raw))
        detectedEncoding = 'UTF-8'
      } catch {
        output = raw
        detectedEncoding = 'Latin-1'
      }
    } catch {
      error = 'Entrée Base64 invalide'
      output = ''
    }
  }

  async function copyOutput(): Promise<void> {
    if (!output) return
    await navigator.clipboard.writeText(output)
    toastStore.success('Copié !')
  }

  function clear(): void {
    input = ''
    output = ''
    error = null
  }

  function swapInputOutput(): void {
    input = output
    output = ''
    error = null
  }
</script>

<div class="space-y-4 max-w-2xl bg-[#f5f5f5] p-4">
  <h1 class="text-2xl font-bold text-gray-800">Base64</h1>

  <!-- Input -->
  <div class="bg-white rounded border border-gray-200">
    <div class="bg-gray-50 border-b border-gray-200 px-3 py-2 flex justify-between items-center">
      <span class="text-sm font-semibold text-gray-700">Entrée</span>
      <button
        on:click={clear}
        class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        title="Effacer"
      >
        <RotateCcw size={12} /> Effacer
      </button>
    </div>
    <textarea
      bind:value={input}
      placeholder="Collez votre texte ou votre Base64 ici…"
      rows={6}
      class="w-full p-3 font-mono text-xs resize-y focus:outline-none border-0 bg-white"
      spellcheck="false"
    />
  </div>

  <!-- Actions -->
  <div class="flex gap-2">
    <button
      on:click={encode}
      disabled={!input.trim()}
      class="flex-1 flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#2a4a73] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded text-sm font-medium transition-colors"
    >
      <ArrowDown size={15} /> Encoder
    </button>
    <button
      on:click={decode}
      disabled={!input.trim()}
      class="flex-1 flex items-center justify-center gap-2 bg-white border border-[#1e3a5f] hover:bg-gray-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed text-[#1e3a5f] py-2 rounded text-sm font-medium transition-colors"
    >
      <ArrowUp size={15} /> Décoder
    </button>
  </div>

  <!-- Erreur -->
  {#if error}
    <div class="bg-red-50 border border-red-200 p-3 rounded text-xs text-red-700 font-mono">
      ⚠ {error}
    </div>
  {/if}

  <!-- Output -->
  {#if output}
    <div class="bg-white rounded border border-gray-200">
      <div class="bg-gray-50 border-b border-gray-200 px-3 py-2 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-gray-700">Résultat</span>
          {#if detectedEncoding}
            <span class="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded font-mono">
              {detectedEncoding}
            </span>
          {/if}
        </div>
        <div class="flex items-center gap-2">
          <button
            on:click={swapInputOutput}
            class="flex items-center gap-1 text-xs text-gray-500 hover:text-[#1e3a5f] transition-colors"
            title="Utiliser comme entrée"
          >
            Utiliser comme entrée
          </button>
          <button
            on:click={copyOutput}
            class="flex items-center gap-1 text-xs border border-[#1e3a5f] text-[#1e3a5f] hover:bg-blue-50 px-2 py-1 rounded transition-colors"
          >
            <Copy size={11} /> Copier
          </button>
        </div>
      </div>
      <pre class="w-full p-3 font-mono text-xs whitespace-pre-wrap break-all leading-relaxed text-gray-800">{output}</pre>
    </div>
  {/if}
</div>
