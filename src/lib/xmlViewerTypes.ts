export interface XmlAttr {
  name: string
  value: string
}

export interface XmlElement {
  type: 'element'
  tagName: string
  attrs: XmlAttr[]
  children: XmlNodeData[]
}

export interface XmlText {
  type: 'text'
  content: string
}

export interface XmlComment {
  type: 'comment'
  content: string
}

export interface XmlCData {
  type: 'cdata'
  content: string
}

export interface XmlPI {
  type: 'pi'
  target: string
  data: string
}

export type XmlNodeData = XmlElement | XmlText | XmlComment | XmlCData | XmlPI

export function nodeSelfMatches(node: XmlNodeData, query: string): boolean {
  if (!query) return false
  const q = query.toLowerCase()
  switch (node.type) {
    case 'element':
      return node.tagName.toLowerCase().includes(q) ||
        node.attrs.some(a => a.name.toLowerCase().includes(q) || a.value.toLowerCase().includes(q))
    case 'text':
    case 'comment':
    case 'cdata':
      return node.content.toLowerCase().includes(q)
    case 'pi':
      return node.target.toLowerCase().includes(q) || node.data.toLowerCase().includes(q)
  }
}

export function nodeDescendantMatches(node: XmlNodeData, query: string): boolean {
  if (node.type !== 'element' || !query) return false
  return node.children.some(c => nodeSelfMatches(c, query) || nodeDescendantMatches(c, query))
}

export function countAllMatches(root: XmlNodeData, query: string): number {
  if (!query) return 0
  let count = nodeSelfMatches(root, query) ? 1 : 0
  if (root.type === 'element') {
    for (const child of root.children) count += countAllMatches(child, query)
  }
  return count
}

export function domToXmlNode(node: Node): XmlNodeData | null {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element
    const children = Array.from(el.childNodes)
      .map(domToXmlNode)
      .filter((n): n is XmlNodeData => n !== null)
    return {
      type: 'element',
      tagName: el.tagName,
      attrs: Array.from(el.attributes).map(a => ({ name: a.name, value: a.value })),
      children
    }
  }
  if (node.nodeType === Node.TEXT_NODE) {
    const content = (node.textContent ?? '').trim()
    return content ? { type: 'text', content } : null
  }
  if (node.nodeType === Node.COMMENT_NODE) {
    return { type: 'comment', content: node.nodeValue ?? '' }
  }
  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return { type: 'cdata', content: node.nodeValue ?? '' }
  }
  if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
    const pi = node as ProcessingInstruction
    return { type: 'pi', target: pi.target, data: pi.data }
  }
  return null
}

export function formatXmlNode(node: Node, indent = 0): string {
  const tab = '  '.repeat(indent)

  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? '').trim()
    return text ? `${tab}${text}` : ''
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return `${tab}<!--${node.nodeValue}-->`
  }

  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return `${tab}<![CDATA[${node.nodeValue}]]>`
  }

  if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
    const pi = node as ProcessingInstruction
    return `${tab}<?${pi.target} ${pi.data}?>`
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element
    const attrs = Array.from(el.attributes)
      .map(a => `${a.name}="${a.value}"`)
      .join(' ')
    const attrStr = attrs ? ` ${attrs}` : ''
    const children = Array.from(el.childNodes)
      .map(c => formatXmlNode(c, indent + 1))
      .filter(s => s !== '')

    if (children.length === 0) {
      return `${tab}<${el.tagName}${attrStr}/>`
    }
    if (children.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
      const text = (el.childNodes[0].textContent ?? '').trim()
      if (text) return `${tab}<${el.tagName}${attrStr}>${text}</${el.tagName}>`
    }
    return `${tab}<${el.tagName}${attrStr}>\n${children.join('\n')}\n${tab}</${el.tagName}>`
  }

  return ''
}
