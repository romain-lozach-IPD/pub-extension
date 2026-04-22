<script lang="ts">
  import { marked } from 'marked'
  import { RotateCcw } from 'lucide-svelte'

  let input = ''

  $: renderedHtml = input.trim() ? (marked.parse(input) as string) : ''
</script>

<div class="space-y-4 max-w-2xl bg-[#f5f5f5] p-4">
  <h1 class="text-2xl font-bold text-gray-800">Éditeur Markdown</h1>

  <div class="bg-white p-4 rounded border border-gray-200">
    <div class="flex justify-between items-center mb-2">
      <label for="md-input" class="text-sm font-semibold text-gray-700">Markdown</label>
      <button
        on:click={() => (input = '')}
        class="flex items-center gap-1 text-xs text-[#1e3a5f] hover:text-[#2a4a73]"
      >
        <RotateCcw size={13} />
        Effacer
      </button>
    </div>
    <textarea
      id="md-input"
      bind:value={input}
      placeholder="Collez votre markdown ici…"
      rows={10}
      class="w-full p-2 border border-gray-300 rounded text-sm font-mono focus:border-[#1e3a5f] outline-none resize-y"
    />
  </div>

  <div class="bg-white p-4 rounded border border-gray-200">
    <p class="text-sm font-semibold text-gray-700 mb-3">Rendu HTML</p>
    {#if renderedHtml}
      <div class="md-preview text-sm text-gray-800">
        {@html renderedHtml}
      </div>
    {:else}
      <p class="text-sm text-gray-400 italic">Le rendu apparaîtra ici.</p>
    {/if}
  </div>
</div>

<style>
  .md-preview :global(h1) { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; }
  .md-preview :global(h2) { font-size: 1.25rem; font-weight: 700; margin: 0.875rem 0 0.5rem; }
  .md-preview :global(h3) { font-size: 1.1rem; font-weight: 600; margin: 0.75rem 0 0.375rem; }
  .md-preview :global(h4) { font-size: 1rem; font-weight: 600; margin: 0.625rem 0 0.25rem; }
  .md-preview :global(p) { margin: 0.5rem 0; line-height: 1.6; }
  .md-preview :global(ul) { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
  .md-preview :global(ol) { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
  .md-preview :global(li) { margin: 0.2rem 0; line-height: 1.5; }
  .md-preview :global(code) { background: #f3f4f6; padding: 0.1rem 0.35rem; border-radius: 3px; font-family: monospace; font-size: 0.85em; color: #1e3a5f; }
  .md-preview :global(pre) { background: #f3f4f6; padding: 0.75rem 1rem; border-radius: 6px; overflow-x: auto; margin: 0.5rem 0; }
  .md-preview :global(pre code) { background: none; padding: 0; color: inherit; font-size: 0.85rem; }
  .md-preview :global(blockquote) { border-left: 3px solid #1e3a5f; padding-left: 0.75rem; margin: 0.5rem 0; color: #6b7280; font-style: italic; }
  .md-preview :global(a) { color: #1e3a5f; text-decoration: underline; }
  .md-preview :global(a:hover) { color: #2a4a73; }
  .md-preview :global(strong) { font-weight: 700; }
  .md-preview :global(em) { font-style: italic; }
  .md-preview :global(hr) { border: none; border-top: 1px solid #e5e7eb; margin: 0.75rem 0; }
  .md-preview :global(table) { border-collapse: collapse; width: 100%; margin: 0.5rem 0; }
  .md-preview :global(th) { background: #f3f4f6; padding: 0.4rem 0.75rem; border: 1px solid #d1d5db; font-weight: 600; text-align: left; }
  .md-preview :global(td) { padding: 0.4rem 0.75rem; border: 1px solid #d1d5db; }
</style>
