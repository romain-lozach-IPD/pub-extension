<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { Editor } from '@tiptap/core'
  import StarterKit from '@tiptap/starter-kit'
  import { marked } from 'marked'
  import {
    Bold, Italic, Strikethrough, List, ListOrdered, Code, Quote,
    Heading1, Heading2, Heading3, Undo, Redo
  } from 'lucide-svelte'

  export let value: string = ''
  export let placeholder: string = 'Description…'
  export let minHeight: string = '140px'

  const dispatch = createEventDispatcher<{ change: string }>()

  let editorEl: HTMLDivElement
  let editor: Editor | null = null
  let mounted = false

  function toHtml(content: string): string {
    if (!content) return ''
    // Detect markdown: contains markdown syntax and doesn't start with an HTML tag
    const looksLikeMarkdown = !content.trimStart().startsWith('<') && /[*#`_>\[\]]/.test(content)
    if (looksLikeMarkdown) return marked.parse(content) as string
    return content
  }

  onMount(() => {
    editor = new Editor({
      element: editorEl,
      extensions: [StarterKit],
      content: toHtml(value),
      editorProps: {
        attributes: {
          class: 'tiptap-content outline-none',
          style: `min-height: ${minHeight}; padding: 0.5rem;`
        }
      },
      onUpdate: ({ editor: e }) => {
        const html = e.getHTML()
        dispatch('change', html === '<p></p>' ? '' : html)
      },
    })
    mounted = true
  })

  onDestroy(() => {
    editor?.destroy()
  })

  function cmd(action: () => boolean | void) {
    return (e: MouseEvent) => {
      e.preventDefault()
      action()
      editor?.commands.focus()
    }
  }

  $: isActive = (type: string, attrs?: Record<string, unknown>) =>
    mounted && editor ? editor.isActive(type, attrs) : false
</script>

<div class="border border-gray-300 rounded overflow-hidden focus-within:border-[#1e3a5f] transition-colors">
  <!-- Toolbar -->
  <div class="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 p-1">
    <!-- Headings -->
    <button type="button" title="H1"
      on:mousedown={cmd(() => editor?.chain().toggleHeading({ level: 1 }).run())}
      class="toolbar-btn {isActive('heading', { level: 1 }) ? 'active' : ''}"
    ><Heading1 size={15} /></button>
    <button type="button" title="H2"
      on:mousedown={cmd(() => editor?.chain().toggleHeading({ level: 2 }).run())}
      class="toolbar-btn {isActive('heading', { level: 2 }) ? 'active' : ''}"
    ><Heading2 size={15} /></button>
    <button type="button" title="H3"
      on:mousedown={cmd(() => editor?.chain().toggleHeading({ level: 3 }).run())}
      class="toolbar-btn {isActive('heading', { level: 3 }) ? 'active' : ''}"
    ><Heading3 size={15} /></button>

    <div class="w-px h-5 bg-gray-300 mx-0.5"></div>

    <!-- Text formatting -->
    <button type="button" title="Gras (Ctrl+B)"
      on:mousedown={cmd(() => editor?.chain().toggleBold().run())}
      class="toolbar-btn {isActive('bold') ? 'active' : ''}"
    ><Bold size={15} /></button>
    <button type="button" title="Italique (Ctrl+I)"
      on:mousedown={cmd(() => editor?.chain().toggleItalic().run())}
      class="toolbar-btn {isActive('italic') ? 'active' : ''}"
    ><Italic size={15} /></button>
    <button type="button" title="Barré"
      on:mousedown={cmd(() => editor?.chain().toggleStrike().run())}
      class="toolbar-btn {isActive('strike') ? 'active' : ''}"
    ><Strikethrough size={15} /></button>
    <button type="button" title="Code inline"
      on:mousedown={cmd(() => editor?.chain().toggleCode().run())}
      class="toolbar-btn {isActive('code') ? 'active' : ''}"
    ><Code size={15} /></button>

    <div class="w-px h-5 bg-gray-300 mx-0.5"></div>

    <!-- Lists -->
    <button type="button" title="Liste à puces"
      on:mousedown={cmd(() => editor?.chain().toggleBulletList().run())}
      class="toolbar-btn {isActive('bulletList') ? 'active' : ''}"
    ><List size={15} /></button>
    <button type="button" title="Liste numérotée"
      on:mousedown={cmd(() => editor?.chain().toggleOrderedList().run())}
      class="toolbar-btn {isActive('orderedList') ? 'active' : ''}"
    ><ListOrdered size={15} /></button>
    <button type="button" title="Citation"
      on:mousedown={cmd(() => editor?.chain().toggleBlockquote().run())}
      class="toolbar-btn {isActive('blockquote') ? 'active' : ''}"
    ><Quote size={15} /></button>

    <div class="w-px h-5 bg-gray-300 mx-0.5 ml-auto"></div>

    <!-- History -->
    <button type="button" title="Annuler (Ctrl+Z)"
      on:mousedown={cmd(() => editor?.chain().undo().run())}
      class="toolbar-btn"
    ><Undo size={15} /></button>
    <button type="button" title="Rétablir (Ctrl+Y)"
      on:mousedown={cmd(() => editor?.chain().redo().run())}
      class="toolbar-btn"
    ><Redo size={15} /></button>
  </div>

  <!-- Editor area -->
  <div
    bind:this={editorEl}
    class="bg-white cursor-text"
    role="textbox"
    aria-multiline="true"
    aria-label={placeholder}
    tabindex="0"
  ></div>
</div>

<style>
  :global(.tiptap-content) {
    font-size: 0.875rem;
    color: #374151;
    line-height: 1.5;
  }
  :global(.tiptap-content p.is-editor-empty:first-child::before) {
    color: #9ca3af;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
  :global(.tiptap-content h1) { font-size: 1.25rem; font-weight: 700; margin: 0.5rem 0 0.25rem; }
  :global(.tiptap-content h2) { font-size: 1.1rem; font-weight: 700; margin: 0.5rem 0 0.25rem; }
  :global(.tiptap-content h3) { font-size: 1rem; font-weight: 600; margin: 0.375rem 0 0.25rem; }
  :global(.tiptap-content p) { margin: 0.2rem 0; }
  :global(.tiptap-content ul) { list-style: disc; padding-left: 1.25rem; margin: 0.25rem 0; }
  :global(.tiptap-content ol) { list-style: decimal; padding-left: 1.25rem; margin: 0.25rem 0; }
  :global(.tiptap-content li) { margin: 0.1rem 0; }
  :global(.tiptap-content code) { background: #f3f4f6; padding: 0.1rem 0.3rem; border-radius: 3px; font-family: monospace; font-size: 0.85em; color: #1e3a5f; }
  :global(.tiptap-content pre) { background: #f3f4f6; padding: 0.5rem 0.75rem; border-radius: 4px; overflow-x: auto; margin: 0.25rem 0; }
  :global(.tiptap-content pre code) { background: none; padding: 0; font-size: 0.8rem; color: inherit; }
  :global(.tiptap-content blockquote) { border-left: 3px solid #1e3a5f; padding-left: 0.6rem; margin: 0.25rem 0; color: #6b7280; font-style: italic; }
  :global(.tiptap-content strong) { font-weight: 700; }
  :global(.tiptap-content em) { font-style: italic; }
  :global(.tiptap-content s) { text-decoration: line-through; }
  :global(.tiptap-content hr) { border: none; border-top: 1px solid #e5e7eb; margin: 0.5rem 0; }

  .toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    border-radius: 0.25rem;
    color: #4b5563;
    transition: background-color 0.1s, color 0.1s;
    cursor: pointer;
    border: none;
    background: transparent;
  }
  .toolbar-btn:hover {
    background-color: #e5e7eb;
    color: #1f2937;
  }
  .toolbar-btn.active {
    background-color: #1e3a5f;
    color: white;
  }
</style>
