<script lang="ts">
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { editorData } from '../stores/navigation.ts'
  import XmlEditor from './XmlEditor.svelte'
  import MarkdownEditor from './MarkdownEditor.svelte'
  import JsonViewer from './JsonViewer.svelte'
  import Base64Tool from './Base64Tool.svelte'
  import XmlViewer from './XmlViewer.svelte'

  type ToolId = 'xml' | 'markdown' | 'json' | 'base64' | 'xmlviewer'

  const STORAGE_KEY = 'lastActiveTool'
  const tools: { id: ToolId; label: string }[] = [
    { id: 'xml', label: 'Connexion' },
    { id: 'xmlviewer', label: 'XML Viewer' },
    { id: 'markdown', label: 'Éditeur Markdown' },
    { id: 'json', label: 'JSON Viewer' },
    { id: 'base64', label: 'Base64' }
  ]

  let activeTool: ToolId = 'xml'

  onMount(() => {
    const unsubEditorData = editorData.subscribe(data => {
      if (data.xmlToken) activeTool = 'xml'
    })

    if (!get(editorData).xmlToken) {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        const saved = result[STORAGE_KEY] as ToolId | undefined
        if (saved) activeTool = saved
      })
    }

    return unsubEditorData
  })

  function selectTool(tool: ToolId): void {
    activeTool = tool
    chrome.storage.local.set({ [STORAGE_KEY]: tool })
  }
</script>

<div class="flex flex-col h-full">
  <nav class="bg-white border-b border-gray-200 px-3 py-2 flex gap-1 flex-shrink-0">
    {#each tools as tool (tool.id)}
      <button
        on:click={() => selectTool(tool.id)}
        class="text-sm px-3 py-1.5 rounded font-medium transition-colors
               {activeTool === tool.id ? 'bg-[#1e3a5f] text-white' : 'text-gray-600 hover:bg-gray-100'}"
      >
        {tool.label}
      </button>
    {/each}
  </nav>

  <div class="flex-1 overflow-auto">
    {#if activeTool === 'xml'}
      <XmlEditor />
    {:else if activeTool === 'markdown'}
      <MarkdownEditor />
    {:else if activeTool === 'xmlviewer'}
      <XmlViewer />
    {:else if activeTool === 'json'}
      <JsonViewer />
    {:else}
      <Base64Tool />
    {/if}
  </div>
</div>
