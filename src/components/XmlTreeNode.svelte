<script lang="ts">
  import type { XmlNodeData } from '../lib/xmlViewerTypes.ts'
  import { nodeSelfMatches, nodeDescendantMatches } from '../lib/xmlViewerTypes.ts'
  import { ChevronRight, ChevronDown } from 'lucide-svelte'

  export let node: XmlNodeData
  export let depth: number = 0
  export let searchQuery: string = ''

  let isExpanded = depth < 2

  $: isElement = node.type === 'element'
  $: tagName = node.type === 'element' ? node.tagName : ''
  $: attrs = node.type === 'element' ? node.attrs : []
  $: children = node.type === 'element' ? node.children : []
  $: childCount = children.length

  $: inlineText = (
    node.type === 'element' &&
    node.children.length === 1 &&
    node.children[0].type === 'text'
  ) ? node.children[0].content : null

  $: isExpandable = isElement && childCount > 0 && inlineText === null

  $: textContent = node.type === 'text' ? node.content : ''
  $: commentContent = node.type === 'comment' ? node.content : ''
  $: cdataContent = node.type === 'cdata' ? node.content : ''
  $: piTarget = node.type === 'pi' ? node.target : ''
  $: piData = node.type === 'pi' ? node.data : ''

  $: selfMatch = nodeSelfMatches(node, searchQuery)
  $: descendantMatch = nodeDescendantMatches(node, searchQuery)
  $: effectiveExpanded = searchQuery ? descendantMatch : isExpanded
  $: dimmed = searchQuery && !selfMatch && !descendantMatch

  function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // Pure function — query passed explicitly so Svelte tracks it as a template dependency
  function hl(text: string, query: string): string {
    const escaped = escapeHtml(text)
    if (!query) return escaped
    const escapedQuery = escapeHtml(query)
    if (!escaped.toLowerCase().includes(escapedQuery.toLowerCase())) return escaped
    const regex = new RegExp(`(${escapeRegex(escapedQuery)})`, 'gi')
    return escaped.replace(regex, '<mark class="bg-yellow-200 rounded-sm px-0.5 not-italic">$1</mark>')
  }

  function attrPreview(maxAttrs = 2): string {
    if (attrs.length === 0) return ''
    const shown = attrs.slice(0, maxAttrs).map(a => `${a.name}="${a.value}"`).join(' ')
    return ' ' + shown + (attrs.length > maxAttrs ? ' …' : '')
  }
</script>

<div class="font-mono text-xs leading-relaxed" class:opacity-30={dimmed}>

  <!-- Processing instruction -->
  {#if node.type === 'pi'}
    <div class="ml-4 text-gray-400 italic">&lt;?{@html hl(piTarget, searchQuery)} {@html hl(piData, searchQuery)}?&gt;</div>

  <!-- Comment -->
  {:else if node.type === 'comment'}
    <div class="ml-4 text-gray-400 italic">&lt;!-- {@html hl(commentContent, searchQuery)} --&gt;</div>

  <!-- CDATA -->
  {:else if node.type === 'cdata'}
    <div class="ml-4 text-gray-500">&lt;![CDATA[<span class="text-green-700">{@html hl(cdataContent, searchQuery)}</span>]]&gt;</div>

  <!-- Text node -->
  {:else if node.type === 'text'}
    <div class="ml-4 text-green-700">{@html hl(textContent, searchQuery)}</div>

  <!-- Inline element (single text child) -->
  {:else if isElement && inlineText !== null}
    <div class="ml-4 flex flex-wrap items-baseline gap-0 min-h-[20px]">
      <span class="text-gray-400">&lt;</span>
      <span class="text-[#1e3a5f] font-semibold">{@html hl(tagName, searchQuery)}</span>
      {#each attrs as attr (attr.name)}
        <span class="ml-1 text-amber-600">{@html hl(attr.name, searchQuery)}</span>
        <span class="text-gray-400">=</span>
        <span class="text-green-700">"{@html hl(attr.value, searchQuery)}"</span>
      {/each}
      <span class="text-gray-400">&gt;</span>
      <span class="text-green-700 mx-0.5">{@html hl(inlineText, searchQuery)}</span>
      <span class="text-gray-400">&lt;/</span>
      <span class="text-[#1e3a5f] font-semibold">{@html hl(tagName, searchQuery)}</span>
      <span class="text-gray-400">&gt;</span>
    </div>

  <!-- Empty element -->
  {:else if isElement && childCount === 0}
    <div class="ml-4 flex flex-wrap items-baseline gap-0 min-h-[20px]">
      <span class="text-gray-400">&lt;</span>
      <span class="text-[#1e3a5f] font-semibold">{@html hl(tagName, searchQuery)}</span>
      {#each attrs as attr (attr.name)}
        <span class="ml-1 text-amber-600">{@html hl(attr.name, searchQuery)}</span>
        <span class="text-gray-400">=</span>
        <span class="text-green-700">"{@html hl(attr.value, searchQuery)}"</span>
      {/each}
      <span class="text-gray-400">/&gt;</span>
    </div>

  <!-- Expandable element -->
  {:else if isExpandable}
    <div class="flex items-center min-h-[20px]">
      <button
        on:click={() => (isExpanded = !effectiveExpanded)}
        class="text-gray-400 hover:text-gray-600 flex-shrink-0 focus:outline-none w-4 flex items-center justify-center"
      >
        {#if effectiveExpanded}<ChevronDown size={11} />{:else}<ChevronRight size={11} />{/if}
      </button>
      <span class="text-gray-400">&lt;</span>
      <span class="text-[#1e3a5f] font-semibold">{@html hl(tagName, searchQuery)}</span>
      {#if effectiveExpanded}
        {#each attrs as attr (attr.name)}
          <span class="ml-1 text-amber-600">{@html hl(attr.name, searchQuery)}</span>
          <span class="text-gray-400">=</span>
          <span class="text-green-700">"{@html hl(attr.value, searchQuery)}"</span>
        {/each}
        <span class="text-gray-400">&gt;</span>
      {:else}
        <span class="text-gray-400 text-xs">{attrPreview()}</span>
        <span class="text-gray-400">&gt;</span>
        <button
          on:click={() => (isExpanded = true)}
          class="text-gray-400 hover:text-[#1e3a5f] mx-1 underline decoration-dotted"
        >
          {childCount} {childCount > 1 ? 'enfants' : 'enfant'}
        </button>
        <span class="text-gray-400">&lt;/</span>
        <span class="text-[#1e3a5f] font-semibold">{@html hl(tagName, searchQuery)}</span>
        <span class="text-gray-400">&gt;</span>
      {/if}
    </div>
    {#if effectiveExpanded}
      <div class="pl-3 border-l border-gray-100 ml-[7px]">
        {#each children as child, i (i)}
          <svelte:self node={child} depth={depth + 1} {searchQuery} />
        {/each}
      </div>
      <div class="ml-4">
        <span class="text-gray-400">&lt;/</span>
        <span class="text-[#1e3a5f] font-semibold">{@html hl(tagName, searchQuery)}</span>
        <span class="text-gray-400">&gt;</span>
      </div>
    {/if}
  {/if}

</div>
