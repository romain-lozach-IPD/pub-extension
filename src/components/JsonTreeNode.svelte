<script lang="ts">
  import { ChevronRight, ChevronDown } from 'lucide-svelte'

  export let nodeKey: string | number | null = null
  export let value: unknown
  export let depth: number = 0
  export let isLast: boolean = true
  export let searchQuery: string = ''

  let isExpanded = depth < 2

  function getType(v: unknown): string {
    if (v === null) return 'null'
    if (Array.isArray(v)) return 'array'
    return typeof v
  }

  $: valueType = getType(value)
  $: isExpandable = valueType === 'object' || valueType === 'array'
  $: entries = (() => {
    if (!isExpandable || value === null) return []
    if (valueType === 'array') {
      return (value as unknown[]).map((v, i): [string | number, unknown] => [i, v])
    }
    return Object.entries(value as Record<string, unknown>) as [string, unknown][]
  })() as [string | number, unknown][]
  $: count = entries.length
  $: bracketOpen = valueType === 'array' ? '[' : '{'
  $: bracketClose = valueType === 'array' ? ']' : '}'
  $: keyIsNumber = typeof nodeKey === 'number'
  $: keyLabel = nodeKey === null ? null : keyIsNumber ? String(nodeKey) : String(nodeKey)

  function valueClass(type: string): string {
    if (type === 'string') return 'text-green-700'
    if (type === 'number') return 'text-blue-600'
    if (type === 'boolean') return 'text-orange-600'
    if (type === 'null') return 'text-gray-400 italic'
    return 'text-gray-800'
  }

  function leafValueStr(v: unknown, type: string): string {
    if (type === 'null') return 'null'
    if (type === 'string') return String(v)
    return String(v)
  }

  // Search helpers
  function jsonSelfMatch(k: string | number | null, v: unknown, query: string): boolean {
    if (!query) return false
    const q = query.toLowerCase()
    if (k !== null && String(k).toLowerCase().includes(q)) return true
    const t = getType(v)
    if (t === 'string') return (v as string).toLowerCase().includes(q)
    if (t === 'number' || t === 'boolean') return String(v).toLowerCase().includes(q)
    if (t === 'null') return 'null'.includes(q)
    return false
  }

  function jsonDescendantMatch(v: unknown, query: string): boolean {
    if (!query) return false
    const t = getType(v)
    if (t === 'array') {
      return (v as unknown[]).some((child, i) =>
        jsonSelfMatch(i, child, query) || jsonDescendantMatch(child, query)
      )
    }
    if (t === 'object' && v !== null) {
      return Object.entries(v as Record<string, unknown>).some(
        ([k, child]) => jsonSelfMatch(k, child, query) || jsonDescendantMatch(child, query)
      )
    }
    return false
  }

  $: selfMatch = jsonSelfMatch(nodeKey, value, searchQuery)
  $: descendantMatch = jsonDescendantMatch(value, searchQuery)
  $: effectiveExpanded = searchQuery ? descendantMatch : isExpanded
  $: dimmed = searchQuery ? (!selfMatch && !descendantMatch) : false

  // Pure hl function — query passed explicitly so Svelte tracks it as a template dependency
  function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  function hl(text: string, query: string): string {
    const escaped = escapeHtml(text)
    if (!query) return escaped
    const escapedQuery = escapeHtml(query)
    if (!escaped.toLowerCase().includes(escapedQuery.toLowerCase())) return escaped
    const regex = new RegExp(`(${escapeRegex(escapedQuery)})`, 'gi')
    return escaped.replace(regex, '<mark class="bg-yellow-200 rounded-sm px-0.5">$1</mark>')
  }
</script>

<div class="font-mono text-xs leading-relaxed" class:opacity-30={dimmed}>
  {#if isExpandable}
    <div class="flex items-center min-h-[20px]">
      <button
        on:click={() => (isExpanded = !effectiveExpanded)}
        class="text-gray-400 hover:text-gray-600 flex-shrink-0 focus:outline-none w-4 flex items-center justify-center"
      >
        {#if effectiveExpanded}<ChevronDown size={11} />{:else}<ChevronRight size={11} />{/if}
      </button>
      {#if keyLabel !== null}
        {#if keyIsNumber}
          <span class="text-[#1e3a5f] font-semibold mr-0.5">{@html hl(keyLabel, searchQuery)}</span>
        {:else}
          <span class="text-[#1e3a5f] font-semibold mr-0.5">"</span><span class="text-[#1e3a5f] font-semibold">{@html hl(keyLabel, searchQuery)}</span><span class="text-[#1e3a5f] font-semibold mr-0.5">"</span>
        {/if}
        <span class="text-gray-400 mr-0.5">: </span>
      {/if}
      <span class="text-gray-500">{bracketOpen}</span>
      {#if !effectiveExpanded}
        <button
          on:click={() => (isExpanded = true)}
          class="text-gray-400 hover:text-[#1e3a5f] mx-0.5 underline decoration-dotted"
        >
          {count} {valueType === 'array' ? (count > 1 ? 'éléments' : 'élément') : (count > 1 ? 'propriétés' : 'propriété')}
        </button>
        <span class="text-gray-500">{bracketClose}</span>
        {#if !isLast}<span class="text-gray-400">,</span>{/if}
      {/if}
    </div>
    {#if effectiveExpanded}
      <div class="pl-3 border-l border-gray-100 ml-[7px]">
        {#each entries as [k, v], i (i)}
          <svelte:self nodeKey={k} value={v} depth={depth + 1} isLast={i === entries.length - 1} {searchQuery} />
        {/each}
      </div>
      <div class="ml-4">
        <span class="text-gray-500">{bracketClose}</span>
        {#if !isLast}<span class="text-gray-400">,</span>{/if}
      </div>
    {/if}
  {:else}
    <div class="ml-4 flex items-center flex-wrap gap-0 min-h-[20px]">
      {#if keyLabel !== null}
        {#if keyIsNumber}
          <span class="text-[#1e3a5f] font-semibold mr-0.5">{@html hl(keyLabel, searchQuery)}</span>
        {:else}
          <span class="text-[#1e3a5f] font-semibold">"</span><span class="text-[#1e3a5f] font-semibold">{@html hl(keyLabel, searchQuery)}</span><span class="text-[#1e3a5f] font-semibold mr-0.5">"</span>
        {/if}
        <span class="text-gray-400 mr-0.5">: </span>
      {/if}
      {#if valueType === 'string'}
        <span class={valueClass(valueType)}>"</span><span class={valueClass(valueType)}>{@html hl(leafValueStr(value, valueType), searchQuery)}</span><span class={valueClass(valueType)}>"</span>
      {:else}
        <span class={valueClass(valueType)}>{@html hl(leafValueStr(value, valueType), searchQuery)}</span>
      {/if}
      {#if !isLast}<span class="text-gray-400">,</span>{/if}
    </div>
  {/if}
</div>
