<script>
  import { onMount } from 'svelte'
  
  export let value = ''
  export let placeholder = ''
  export let spellcheck = false
  export let className = ''
  
  let textarea
  let preElement
  let highlightedContent = ''
  
  // Simple syntax highlighting for XML - just colors the tags
  function highlightXml(xml) {
    if (!xml) return ''
    
    // Escape HTML entities first
    let escaped = xml
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    
    // Simple tag highlighting - just wrap anything between &lt; and &gt; in a span
    escaped = escaped.replace(
      /(&lt;[^&]+&gt;)/g,
      '<span class="xml-tag">$1</span>'
    )
    
    return escaped
  }
  
  function updateHighlight() {
    highlightedContent = highlightXml(value)
    // Add final newline to ensure pre height matches textarea
    if (highlightedContent && !highlightedContent.endsWith('\n')) {
      highlightedContent += '\n'
    }
  }
  
  function handleInput() {
    value = textarea.value
    updateHighlight()
  }
  
  function handleScroll() {
    if (preElement && textarea) {
      preElement.scrollTop = textarea.scrollTop
      preElement.scrollLeft = textarea.scrollLeft
    }
  }
  
  function handleKeydown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const spaces = '  '
      
      if (e.shiftKey) {
        // Shift+Tab: remove indentation
        const lineStart = value.lastIndexOf('\n', start - 1) + 1
        const currentLine = value.substring(lineStart, start)
        const spacesToRemove = currentLine.match(/^[ ]{0,2}/)[0]
        
        textarea.value = value.substring(0, lineStart) + currentLine.substring(spacesToRemove.length) + value.substring(end)
        value = textarea.value
        textarea.selectionStart = textarea.selectionEnd = start - spacesToRemove.length
      } else {
        // Tab: add indentation
        textarea.value = value.substring(0, start) + spaces + value.substring(end)
        value = textarea.value
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length
      }
      updateHighlight()
    }
  }
  
  $: if (value !== undefined) {
    updateHighlight()
  }
  
  onMount(() => {
    updateHighlight()
  })
</script>

<div class="code-editor-container {className}">
  <div class="editor-layer code-highlight" bind:this={preElement} aria-hidden="true">
    <pre><code>{@html highlightedContent}</code></pre>
  </div>
  <textarea
    bind:this={textarea}
    {value}
    {placeholder}
    {spellcheck}
    on:input={handleInput}
    on:scroll={handleScroll}
    on:keydown={handleKeydown}
    class="editor-layer code-input"
  ></textarea>
</div>

<style>
  .code-editor-container {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 200px;
    overflow: hidden;
    font-family: 'Consolas', 'Monaco', 'Courier New', 'Courier', monospace;
    font-size: 13px;
    line-height: 1.5;
  }
  
  .editor-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 16px;
    margin: 0;
    border: none;
    background: transparent;
    overflow: auto;
    /* Critical: ensure identical text rendering */
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    font-weight: normal;
    font-style: normal;
    letter-spacing: normal;
    word-spacing: normal;
    text-transform: none;
    text-indent: 0;
    text-shadow: none;
    text-decoration: none;
    text-align: left;
    white-space: pre;
    word-wrap: normal;
    word-break: normal;
    tab-size: 2;
    -moz-tab-size: 2;
    -o-tab-size: 2;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .code-highlight {
    z-index: 1;
    pointer-events: none;
    color: #333;
  }
  
  .code-highlight pre {
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    white-space: pre;
    word-wrap: normal;
    word-break: normal;
  }
  
  .code-highlight code {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    white-space: pre;
  }
  
  .code-input {
    z-index: 2;
    color: transparent;
    background: transparent;
    caret-color: #1e3a5f;
    resize: none;
    outline: none;
    /* Ensure textarea has same text properties as pre */
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }
  
  .code-input::selection {
    background: rgba(30, 58, 95, 0.3);
    color: transparent;
  }
  
  .code-input::placeholder {
    color: #999;
  }
  
  /* Simple XML tag highlighting */
  :global(.xml-tag) {
    color: #0066cc;
    font-weight: 500;
  }
</style>
