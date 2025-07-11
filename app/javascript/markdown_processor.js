// app/javascript/markdown_processor.js
export class MarkdownProcessor {
  constructor() {
    this.rules = {
      // Blocks (process first)
      codeBlock: /```([\w]*)\n([\s\S]*?)```/g,
      blockquote: /^> (.*)$/gm,

      // Headers
      heading1: /^# (.*)$/gm,
      heading2: /^## (.*)$/gm,
      heading3: /^### (.*)$/gm,
      heading4: /^#### (.*)$/gm,

      // Lists
      unorderedList: /^[\*\-\+] (.*)$/gm,
      orderedList: /^\d+\. (.*)$/gm,

      // Inline elements
      bold: /\*\*(.*?)\*\*/g,
      italic: /\*(.*?)\*/g,
      boldItalic: /\*\*\*(.*?)\*\*\*/g,
      code: /`([^`]+)`/g,

      // Links and images
      image: /!\[([^\]]*)\]\(([^)]+)\)/g,
      link: /\[([^\]]+)\]\(([^)]+)\)/g,

      // Other
      horizontalRule: /^[-*_]{3,}$/gm,
      lineBreak: /  $/gm,
      paragraph: /\n\n/g
    }
  }

  processMarkdown(text) {
    if (!text) return ''

    // Escape HTML first
    let processed = this.escapeHtml(text)

    // Process code blocks first (to avoid processing markdown inside them)
    const codeBlocks = []
    processed = processed.replace(this.rules.codeBlock, (match, language, code) => {
      const placeholder = `___CODEBLOCK_${codeBlocks.length}___`
      codeBlocks.push(`<pre><code class="language-${language || 'plaintext'}">${code.trim()}</code></pre>`)
      return placeholder
    })

    // Process block elements
    processed = this.processBlockElements(processed)

    // Process inline elements
    processed = this.processInlineElements(processed)

    // Process lists
    processed = this.processLists(processed)

    // Restore code blocks
    codeBlocks.forEach((block, index) => {
      processed = processed.replace(`___CODEBLOCK_${index}___`, block)
    })

    // Process paragraphs
    processed = this.processParagraphs(processed)

    return processed
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  processBlockElements(text) {
    // Headers
    text = text.replace(this.rules.heading4, '<h4>$1</h4>')
    text = text.replace(this.rules.heading3, '<h3>$1</h3>')
    text = text.replace(this.rules.heading2, '<h2>$1</h2>')
    text = text.replace(this.rules.heading1, '<h1>$1</h1>')

    // Blockquotes
    text = text.replace(this.rules.blockquote, '<blockquote>$1</blockquote>')

    // Horizontal rules
    text = text.replace(this.rules.horizontalRule, '<hr>')

    return text
  }

  processInlineElements(text) {
    // Process bold+italic first
    text = text.replace(this.rules.boldItalic, '<strong><em>$1</em></strong>')

    // Then bold and italic separately
    text = text.replace(this.rules.bold, '<strong>$1</strong>')
    text = text.replace(this.rules.italic, '<em>$1</em>')

    // Inline code
    text = text.replace(this.rules.code, '<code>$1</code>')

    // Images
    text = text.replace(this.rules.image, '<img src="$2" alt="$1" loading="lazy">')

    // Links
    text = text.replace(this.rules.link, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

    // Line breaks
    text = text.replace(this.rules.lineBreak, '<br>')

    return text
  }

  processLists(text) {
    const lines = text.split('\n')
    const processedLines = []
    let inList = null
    let listItems = []

    lines.forEach((line, index) => {
      const unorderedMatch = line.match(/^[\*\-\+] (.*)$/)
      const orderedMatch = line.match(/^\d+\. (.*)$/)

      if (unorderedMatch) {
        if (inList !== 'ul') {
          if (inList) {
            processedLines.push(this.createList(inList, listItems))
            listItems = []
          }
          inList = 'ul'
        }
        listItems.push(unorderedMatch[1])
      } else if (orderedMatch) {
        if (inList !== 'ol') {
          if (inList) {
            processedLines.push(this.createList(inList, listItems))
            listItems = []
          }
          inList = 'ol'
        }
        listItems.push(orderedMatch[1])
      } else {
        if (inList) {
          processedLines.push(this.createList(inList, listItems))
          inList = null
          listItems = []
        }
        processedLines.push(line)
      }
    })

    // Handle list at end of text
    if (inList) {
      processedLines.push(this.createList(inList, listItems))
    }

    return processedLines.join('\n')
  }

  createList(type, items) {
    const listItems = items.map(item => `<li>${item}</li>`).join('')
    return `<${type}>${listItems}</${type}>`
  }

  processParagraphs(text) {
    // Split by double newlines
    const paragraphs = text.split(/\n\n+/)

    // Wrap non-HTML blocks in paragraphs
    const wrapped = paragraphs.map(para => {
      para = para.trim()
      if (!para) return ''

      // Don't wrap if it's already an HTML element
      if (para.match(/^<(?:h[1-6]|ul|ol|blockquote|pre|hr)/)) {
        return para
      }

      return `<p>${para}</p>`
    })

    return wrapped.join('\n')
  }

  // Helper method to extract plain text from markdown
  extractPlainText(markdown) {
    let text = markdown

    // Remove code blocks
    text = text.replace(this.rules.codeBlock, '$2')

    // Remove formatting
    text = text.replace(this.rules.bold, '$1')
    text = text.replace(this.rules.italic, '$1')
    text = text.replace(this.rules.code, '$1')

    // Remove links but keep text
    text = text.replace(this.rules.link, '$1')
    text = text.replace(this.rules.image, '$1')

    // Remove markdown symbols
    text = text.replace(/^#+ /gm, '')
    text = text.replace(/^[\*\-\+] /gm, '')
    text = text.replace(/^\d+\. /gm, '')
    text = text.replace(/^> /gm, '')

    return text.trim()
  }
}
