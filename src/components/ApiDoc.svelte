<script>
  import { apiDoc } from '../stores/apiDoc.js'
  import { environments } from '../stores/environments.js'
  import { onMount } from 'svelte'
  import { BookOpen, ChevronDown, ChevronRight, Search, Loader, AlertCircle, FileText, ChevronUp } from 'lucide-svelte'

  let url = ''
  let collapsedTags = {}
  let expandedEndpoints = {}
  let searchFilter = ''

  onMount(async () => {
    environments.load()
    const cacheResult = await apiDoc.loadFromCache()
    if (cacheResult.success) {
      url = cacheResult.url
    }
  })

  $: activeEnv = $environments.find(env => env.isActive) || $environments[0]
  $: if (activeEnv?.url_opensapi_doc && !url) {
    url = activeEnv.url_opensapi_doc
  }

  async function loadDoc() {
    if (!url) return
    await apiDoc.loadFromUrl(url)
    collapsedTags = {}
    expandedEndpoints = {}
    searchFilter = ''
  }

  function toggleTag(tagName) {
    collapsedTags[tagName] = !collapsedTags[tagName]
    collapsedTags = collapsedTags
  }

  function toggleEndpoint(endpointId) {
    expandedEndpoints[endpointId] = !expandedEndpoints[endpointId]
    expandedEndpoints = expandedEndpoints
  }

  function getMethodColor(method) {
    const colors = {
      GET: 'bg-green-500 text-white',
      POST: 'bg-blue-500 text-white',
      PUT: 'bg-orange-500 text-white',
      DELETE: 'bg-red-500 text-white',
      PATCH: 'bg-purple-500 text-white',
      OPTIONS: 'bg-gray-500 text-white',
      HEAD: 'bg-gray-500 text-white'
    }
    return colors[method] || colors.GET
  }

  function getStatusColor(code) {
    const num = parseInt(code)
    if (num >= 200 && num < 300) return 'bg-green-100 text-green-700 border border-green-300'
    if (num >= 300 && num < 400) return 'bg-blue-100 text-blue-700 border border-blue-300'
    if (num >= 400 && num < 500) return 'bg-orange-100 text-orange-700 border border-orange-300'
    if (num >= 500) return 'bg-red-100 text-red-700 border border-red-300'
    return 'bg-gray-100 text-gray-700 border border-gray-300'
  }

  function getParamTypeColor(type) {
    const colors = {
      path: 'bg-red-100 text-red-700',
      query: 'bg-blue-100 text-blue-700',
      header: 'bg-purple-100 text-purple-700',
      cookie: 'bg-yellow-100 text-yellow-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  function filterEndpoints(group, filter) {
    if (!filter) return true
    const lowerFilter = filter.toLowerCase()
    if (group.name.toLowerCase().includes(lowerFilter)) return true
    return group.endpoints.some(ep => ep.summary.toLowerCase().includes(lowerFilter))
  }

  function groupParamsByType(params) {
    const grouped = { path: [], query: [], header: [], cookie: [], other: [] }
    for (const param of (params || [])) {
      const type = param.in || 'other'
      if (grouped[type]) {
        grouped[type].push(param)
      } else {
        grouped.other.push(param)
      }
    }
    return grouped
  }

  function renderSchema(schema, depth = 0, maxDepth = 4) {
    if (!schema || depth > maxDepth) return null
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop()
      return `<span class="text-blue-600">${refName}</span>`
    }
    if (schema.type === 'object' && schema.properties) {
      const props = Object.entries(schema.properties).map(([key, value]) => {
        const required = schema.required?.includes(key)
        const nullable = value.nullable ? '?' : ''
        const example = value.example !== undefined ? ` = ${JSON.stringify(value.example)}` : ''
        return `<span class="text-gray-700">${key}${nullable}${required ? '<span class="text-red-500">*</span>' : ''}</span>: ${renderSchema(value, depth + 1, maxDepth)}${example}`
      }).join(', ')
      return `{ ${props} }`
    }
    if (schema.type === 'array' && schema.items) {
      return `array<${renderSchema(schema.items, depth + 1, maxDepth)}>`
    }
    return `<span class="text-gray-500">${schema.type || 'any'}</span>`
  }

  function getSchemaDescription(schema) {
    if (!schema) return ''
    const parts = []
    if (schema.type) parts.push(schema.type)
    if (schema.format) parts.push(schema.format)
    if (schema.example !== undefined) parts.push(`ex: ${JSON.stringify(schema.example)}`)
    if (schema.enum) parts.push(`enum: [${schema.enum.join(', ')}]`)
    if (schema.minLength !== undefined) parts.push(`min: ${schema.minLength}`)
    if (schema.maxLength !== undefined) parts.push(`max: ${schema.maxLength}`)
    return parts.join(', ')
  }

  function extractExample(schema, depth = 0) {
    if (!schema || depth > 3) return null
    if (schema.example !== undefined) return schema.example
    if (schema.$ref) return schema.$ref.split('/').pop()
    if (schema.type === 'object' && schema.properties) {
      const obj = {}
      for (const [key, val] of Object.entries(schema.properties)) {
        const extracted = extractExample(val, depth + 1)
        if (extracted !== null) obj[key] = extracted
      }
      return Object.keys(obj).length > 0 ? obj : null
    }
    if (schema.type === 'array' && schema.items) {
      const item = extractExample(schema.items, depth + 1)
      return item !== null ? [item] : []
    }
    return null
  }

  function formatExample(example) {
    if (example === null || example === undefined) return ''
    return JSON.stringify(example, null, 2)
  }

  $: filteredGroups = $apiDoc.endpoints
    .map(group => ({
      ...group,
      endpoints: group.endpoints.filter(ep => {
        if (!searchFilter) return true
        return ep.summary.toLowerCase().includes(searchFilter.toLowerCase())
      })
    }))
    .filter(group => filterEndpoints(group, searchFilter))
</script>

<div class="space-y-4 max-w-2xl bg-[#f5f5f5] min-h-screen p-4">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
      <BookOpen size={24} />
      Documentation API
    </h1>
  </div>

  <div class="bg-white border border-gray-200 rounded p-4">
    <div class="flex gap-2">
      <input
        type="url"
        bind:value={url}
        placeholder="URL de la documentation OpenAPI (JSON ou YAML)"
        class="flex-1 p-2 border border-gray-300 rounded text-sm focus:border-[#1e3a5f] outline-none"
        on:keypress={(e) => e.key === 'Enter' && loadDoc()}
      />
      <button
        on:click={loadDoc}
        disabled={!url || $apiDoc.isLoading}
        class="bg-[#1e3a5f] hover:bg-[#2a4a73] disabled:bg-gray-300 text-white px-4 py-2 rounded font-medium transition-colors flex items-center gap-2"
      >
        {#if $apiDoc.isLoading}
          <Loader size={18} class="animate-spin" />
        {:else}
          Charger
        {/if}
      </button>
    </div>
    {#if $apiDoc.isLoaded}
      <p class="text-xs text-green-600 mt-2 flex items-center gap-1">
        <span>✓</span> Documentation chargée
      </p>
    {/if}
    {#if $apiDoc.error}
      <p class="text-xs text-red-600 mt-2 flex items-center gap-1">
        <AlertCircle size={14} />
        {$apiDoc.error}
      </p>
    {/if}
  </div>

  {#if $apiDoc.isLoaded}
    <div class="bg-white border border-gray-200 rounded p-3">
      <div class="flex items-center gap-2">
        <Search size={16} class="text-gray-400" />
        <input
          type="text"
          placeholder="Filtrer par catégorie ou endpoint..."
          class="flex-1 text-sm outline-none"
          bind:value={searchFilter}
        />
      </div>
    </div>

    <div class="space-y-1">
      {#each filteredGroups as group (group.name)}
        <div class="bg-white border border-gray-200 rounded">
          <button
            on:click={() => toggleTag(group.name)}
            class="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-gray-50 rounded-t transition-colors"
          >
            <div class="flex items-center gap-2">
              {#if collapsedTags[group.name]}
                <ChevronRight size={18} class="text-gray-400" />
              {:else}
                <ChevronDown size={18} class="text-gray-400" />
              {/if}
              <span class="font-semibold text-gray-800">{group.name}</span>
            </div>
            <span class="text-xs bg-[#1e3a5f] text-white px-2 py-0.5 rounded-full">
              {group.endpoints.length}
            </span>
          </button>

          {#if !collapsedTags[group.name]}
            <div class="border-t border-gray-200">
              {#each group.endpoints as endpoint (endpoint.id)}
                {@const isExpanded = expandedEndpoints[endpoint.id]}
                {@const groupedParams = groupParamsByType(endpoint.parameters)}
                <div class="border-b border-gray-100 last:border-b-0">
                  <button
                    on:click={() => toggleEndpoint(endpoint.id)}
                    class="w-full px-3 py-2.5 flex items-center gap-2 hover:bg-gray-50 text-left transition-colors"
                  >
                    {#if isExpanded}
                      <ChevronDown size={16} class="text-gray-400 flex-shrink-0" />
                    {:else}
                      <ChevronRight size={16} class="text-gray-400 flex-shrink-0" />
                    {/if}
                    <span class="text-xs font-bold px-2 py-0.5 rounded {getMethodColor(endpoint.method)}">
                      {endpoint.method}
                    </span>
                    <span class="text-sm text-gray-800 font-mono truncate">{endpoint.path}</span>
                  </button>

                  {#if isExpanded}
                    <div class="px-3 pb-4 pt-2 ml-6 border-l-2 border-[#1e3a5f] space-y-4 bg-gray-50 -mt-0.5">
                      {#if endpoint.summary}
                        <div>
                          <p class="text-base font-semibold text-gray-900">{endpoint.summary}</p>
                        </div>
                      {/if}

                      {#if endpoint.description}
                        <div>
                          <p class="text-sm text-gray-600 leading-relaxed">{endpoint.description}</p>
                        </div>
                      {/if}

                      {#if endpoint.operationId}
                        <div class="text-xs">
                          <span class="text-gray-500">Operation ID:</span>
                          <code class="ml-1 bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">{endpoint.operationId}</code>
                        </div>
                      {/if}

                      {#if endpoint.parameters && endpoint.parameters.length > 0}
                        <div>
                          <div class="flex items-center gap-2 mb-2">
                            <span class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Paramètres</span>
                            {#if endpoint.parameters.some(p => p.required)}
                              <span class="text-xs text-red-500">* requis</span>
                            {/if}
                          </div>
                          
                          <div class="space-y-3">
                            {#if groupedParams.path.length > 0}
                              <div>
                                <div class="flex items-center gap-2 mb-1">
                                  <span class="text-xs font-medium px-2 py-0.5 rounded bg-red-100 text-red-700">Path</span>
                                </div>
                                <div class="space-y-1 pl-2">
                                  {#each groupedParams.path as param}
                                    <div class="flex items-start gap-3 bg-white p-2 rounded border border-gray-200">
                                      <code class="text-sm text-[#1e3a5f] font-semibold min-w-[100px]">{param.name}</code>
                                      <div class="flex-1 text-xs">
                                        <span class="text-gray-600">{param.schema?.type || 'string'}</span>
                                        {#if param.required}
                                          <span class="ml-2 text-red-500 font-medium">requis</span>
                                        {/if}
                                        {#if param.description}
                                          <p class="text-gray-500 mt-0.5">{param.description}</p>
                                        {/if}
                                        {#if param.schema?.example !== undefined}
                                          <code class="block text-gray-400 mt-1 bg-gray-50 px-1 py-0.5 rounded text-xs">{JSON.stringify(param.schema.example)}</code>
                                        {/if}
                                      </div>
                                    </div>
                                  {/each}
                                </div>
                              </div>
                            {/if}

                            {#if groupedParams.query.length > 0}
                              <div>
                                <div class="flex items-center gap-2 mb-1">
                                  <span class="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">Query</span>
                                </div>
                                <div class="space-y-1 pl-2">
                                  {#each groupedParams.query as param}
                                    <div class="flex items-start gap-3 bg-white p-2 rounded border border-gray-200">
                                      <code class="text-sm text-[#1e3a5f] font-semibold min-w-[100px]">{param.name}</code>
                                      <div class="flex-1 text-xs">
                                        <span class="text-gray-600">{param.schema?.type || 'string'}</span>
                                        {#if param.required}
                                          <span class="ml-2 text-red-500 font-medium">requis</span>
                                        {/if}
                                        {#if param.description}
                                          <p class="text-gray-500 mt-0.5">{param.description}</p>
                                        {/if}
                                        {#if param.schema?.enum}
                                          <p class="text-gray-400 mt-0.5">Valeurs: [{param.schema.enum.join(', ')}]</p>
                                        {/if}
                                        {#if param.schema?.example !== undefined}
                                          <code class="block text-gray-400 mt-1 bg-gray-50 px-1 py-0.5 rounded text-xs">{JSON.stringify(param.schema.example)}</code>
                                        {/if}
                                      </div>
                                    </div>
                                  {/each}
                                </div>
                              </div>
                            {/if}

                            {#if groupedParams.header.length > 0}
                              <div>
                                <div class="flex items-center gap-2 mb-1">
                                  <span class="text-xs font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-700">Header</span>
                                </div>
                                <div class="space-y-1 pl-2">
                                  {#each groupedParams.header as param}
                                    <div class="flex items-start gap-3 bg-white p-2 rounded border border-gray-200">
                                      <code class="text-sm text-[#1e3a5f] font-semibold min-w-[100px]">{param.name}</code>
                                      <div class="flex-1 text-xs">
                                        <span class="text-gray-600">{param.schema?.type || 'string'}</span>
                                        {#if param.description}
                                          <p class="text-gray-500 mt-0.5">{param.description}</p>
                                        {/if}
                                      </div>
                                    </div>
                                  {/each}
                                </div>
                              </div>
                            {/if}
                          </div>
                        </div>
                      {/if}

                      {#if endpoint.requestBody}
                        <div>
                          <div class="flex items-center gap-2 mb-2">
                            <span class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Body</span>
                            {#if endpoint.requestBody.required}
                              <span class="text-xs text-red-500">requis</span>
                            {/if}
                          </div>
                          <div class="bg-white rounded border border-gray-200 overflow-hidden">
                            {#if endpoint.requestBody.content}
                              {#each Object.entries(endpoint.requestBody.content) as [contentType, content], idx}
                                {#if idx > 0}
                                  <div class="border-t border-gray-100"></div>
                                {/if}
                                <div class="px-3 py-2 bg-gray-50 border-b border-gray-200">
                                  <span class="text-xs font-medium text-gray-600">{contentType}</span>
                                </div>
                                {#if content.schema}
                                  <div class="p-3 space-y-2">
                                    {#if content.schema.required}
                                      <p class="text-xs text-red-500 mb-2">Champs requis: {content.schema.required.join(', ')}</p>
                                    {/if}
                                    {#if content.schema.properties}
                                      <div class="space-y-1.5">
                                        {#each Object.entries(content.schema.properties) as [propName, propSchema]}
                                          <div class="flex items-start gap-2 text-xs">
                                            <code class="text-[#1e3a5f] font-semibold min-w-[120px] shrink-0">{propName}</code>
                                            <div class="flex-1">
                                              <span class="text-gray-500">{getSchemaDescription(propSchema)}</span>
                                              {#if propSchema.description}
                                                <p class="text-gray-600 mt-0.5">{propSchema.description}</p>
                                              {/if}
                                              {#if propSchema.nullable}
                                                <span class="inline-block mt-1 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">nullable</span>
                                              {/if}
                                              {#if propSchema.$ref}
                                                <span class="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{propSchema.$ref.split('/').pop()}</span>
                                              {/if}
                                            </div>
                                          </div>
                                        {/each}
                                      </div>
                                    {:else}
                                      <code class="text-xs text-gray-600">{@html renderSchema(content.schema)}</code>
                                    {/if}
                                  </div>
                                {/if}
                              {/each}
                            {/if}
                          </div>
                        </div>
                      {/if}

                      {#if endpoint.responses && Object.keys(endpoint.responses).length > 0}
                        <div>
                          <span class="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">Réponses</span>
                          <div class="space-y-2">
                            {#each Object.entries(endpoint.responses) as [code, response]}
                              {@const example = response.content ? Object.values(response.content).find(c => c.schema)?.schema : null}
                              {@const extractedExample = example ? extractExample(example) : null}
                              <div class="bg-white rounded border border-gray-200 overflow-hidden">
                                <div class="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2 flex-wrap">
                                  <span class="text-xs font-bold px-2 py-0.5 rounded {getStatusColor(code)}">{code}</span>
                                  <span class="text-sm text-gray-700">{response.description || ''}</span>
                                </div>
                                {#if response.content}
                                  <div class="p-3 space-y-3">
                                    {#each Object.entries(response.content) as [contentType, content]}
                                      <div>
                                        <span class="text-xs text-gray-500 font-medium">{contentType}</span>
                                        {#if content.schema}
                                          <div class="mt-2 space-y-1">
                                            {#if content.schema.properties}
                                              {#each Object.entries(content.schema.properties) as [propName, propSchema]}
                                                {@const propExample = extractExample(propSchema)}
                                                <div class="flex items-start gap-2 text-xs">
                                                  <code class="text-[#1e3a5f] font-semibold min-w-[100px] shrink-0">{propName}</code>
                                                  <div class="flex-1">
                                                    <span class="text-gray-500">{getSchemaDescription(propSchema)}</span>
                                                    {#if propSchema.description}
                                                      <p class="text-gray-600 mt-0.5">{propSchema.description}</p>
                                                    {/if}
                                                    {#if propSchema.$ref}
                                                      <span class="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{propSchema.$ref.split('/').pop()}</span>
                                                    {/if}
                                                  </div>
                                                </div>
                                              {/each}
                                            {:else if content.schema.$ref}
                                              <div class="flex items-center gap-2">
                                                <span class="text-xs text-gray-500">Type:</span>
                                                <span class="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{content.schema.$ref.split('/').pop()}</span>
                                              </div>
                                            {:else}
                                              <code class="text-xs text-gray-600">{@html renderSchema(content.schema)}</code>
                                            {/if}
                                          </div>
                                        {/if}
                                      </div>
                                    {/each}

                                    {#if extractedExample}
                                      <div class="mt-3 pt-3 border-t border-gray-200">
                                        <div class="flex items-center gap-2 mb-2">
                                          <span class="text-xs font-semibold text-gray-700">Exemple de réponse</span>
                                        </div>
                                        <pre class="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto leading-relaxed">{formatExample(extractedExample)}</pre>
                                      </div>
                                    {/if}
                                  </div>
                                {/if}
                              </div>
                            {/each}
                          </div>
                        </div>
                      {/if}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}

      {#if filteredGroups.length === 0}
        <div class="bg-white border border-gray-200 rounded p-8 text-center">
          <FileText size={40} class="mx-auto mb-2 text-gray-300" />
          <p class="text-gray-500">Aucun endpoint trouvé</p>
          <p class="text-xs text-gray-400 mt-1">Essayez de modifier votre filtre</p>
        </div>
      {/if}
    </div>
  {:else if !$apiDoc.isLoading}
    <div class="bg-white border border-gray-200 rounded p-8 text-center">
      <BookOpen size={40} class="mx-auto mb-2 text-gray-300" />
      <p class="text-gray-500">Aucune documentation chargée</p>
      <p class="text-xs text-gray-400 mt-1">Entrez l'URL de votre documentation OpenAPI</p>
    </div>
  {/if}
</div>
