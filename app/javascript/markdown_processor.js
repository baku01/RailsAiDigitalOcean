// app/javascript/markdown_processor.js
export default class MarkdownProcessor {
  constructor() {
    this.codeBlockCounter = 0
    this.codeBlocks = new Map()

    this.rules = {
      // Code blocks (process first to avoid conflicts)
      codeBlock: /```(\w+)?\n?([\s\S]*?)```/g,
      inlineCode: /`([^`\n]+)`/g,

      // Headers
      heading1: /^# (.+)$/gm,
      heading2: /^## (.+)$/gm,
      heading3: /^### (.+)$/gm,
      heading4: /^#### (.+)$/gm,
      heading5: /^##### (.+)$/gm,
      heading6: /^###### (.+)$/gm,

      // Text formatting
      boldItalic: /\*\*\*(.+?)\*\*\*/g,
      bold: /\*\*(.+?)\*\*/g,
      italic: /\*(.+?)\*/g,
      strikethrough: /~~(.+?)~~/g,

      // Links and images
      image: /!\[([^\]]*)\]\(([^)]+)\)/g,
      link: /\[([^\]]+)\]\(([^)]+)\)/g,

      // Lists
      unorderedList: /^[\s]*[\*\-\+][\s]+(.+)$/gm,
      orderedList: /^[\s]*\d+\.[\s]+(.+)$/gm,

      // Blockquotes
      blockquote: /^>[\s]*(.+)$/gm,

      // Tables
      tableRow: /\|(.+)\|/g,

      // Horizontal rules
      horizontalRule: /^[-*_]{3,}$/gm,

      // Line breaks
      lineBreak: /  $/gm
    }
  }

  processMarkdown(text) {
    if (!text || typeof text !== 'string') return ''

    let processed = text

    // Step 1: Extract and process code blocks first
    processed = this.extractCodeBlocks(processed)

    // Step 2: Process block elements
    processed = this.processHeaders(processed)
    processed = this.processLists(processed)
    processed = this.processBlockquotes(processed)
    processed = this.processTables(processed)

    // Step 3: Process inline elements
    processed = this.processTextFormatting(processed)
    processed = this.processLinks(processed)
    processed = this.processInlineCode(processed)

    // Step 4: Process other elements
    processed = this.processHorizontalRules(processed)
    processed = this.processLineBreaks(processed)

    // Step 5: Process paragraphs
    processed = this.processParagraphs(processed)

    // Step 6: Restore code blocks with syntax highlighting
    processed = this.restoreCodeBlocks(processed)

    return processed
  }

  extractCodeBlocks(text) {
    return text.replace(this.rules.codeBlock, (match, language, code) => {
      const id = `__CODE_BLOCK_${this.codeBlockCounter++}__`

      // Clean up the code
      const cleanCode = code.trim()

      // Store the code block with metadata
      this.codeBlocks.set(id, {
        language: language || 'plaintext',
        code: cleanCode,
        raw: match
      })

      return id
    })
  }

  restoreCodeBlocks(text) {
    let result = text

    this.codeBlocks.forEach((codeData, id) => {
      const codeElement = this.createCodeBlock(codeData.language, codeData.code)
      result = result.replace(id, codeElement)
    })

    // Clear the cache
    this.codeBlocks.clear()
    this.codeBlockCounter = 0

    return result
  }

  createCodeBlock(language, code) {
    const escapedCode = this.escapeHtml(code)
    const languageClass = this.getLanguageClass(language)
    const languageLabel = this.getLanguageLabel(language)

    // Apply syntax highlighting
    const highlightedCode = this.highlightCode(escapedCode, language)

    return `
      <div class="code-block-container">
        <div class="code-block-header">
          <span class="code-language">${languageLabel}</span>
          <button class="copy-code-btn" data-code="${this.escapeAttribute(code)}" title="Copiar código">
            <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15 2 12c0-1.1.9-2 2-2h3"></path>
            </svg>
            <span class="copy-text">Copiar</span>
          </button>
        </div>
        <pre class="code-block ${languageClass}"><code class="language-${language}">${highlightedCode}</code></pre>
      </div>
    `
  }

  highlightCode(code, language) {
    // Syntax highlighting patterns
    const patterns = {
      // Comments
      comment: {
        single: /\/\/.*$/gm,
        multi: /\/\*[\s\S]*?\*\//g,
        hash: /#.*$/gm,
        html: /<!--[\s\S]*?-->/g
      },
      // Strings
      string: {
        double: /"(?:[^"\\]|\\.)*"/g,
        single: /'(?:[^'\\]|\\.)*'/g,
        template: /`(?:[^`\\]|\\.)*`/g
      },
      // Keywords by language
      keywords: {
        js: /\b(const|let|var|function|return|if|else|for|while|do|break|continue|switch|case|default|try|catch|finally|throw|new|this|super|class|extends|export|import|async|await|yield|typeof|instanceof|in|of|void|delete)\b/g,
        python: /\b(def|class|if|elif|else|for|while|break|continue|return|try|except|finally|raise|import|from|as|pass|with|lambda|yield|global|nonlocal|assert|del|in|is|not|and|or|True|False|None)\b/g,
        ruby: /\b(def|class|module|if|elsif|else|unless|for|while|until|break|next|return|begin|rescue|ensure|raise|require|include|attr_reader|attr_writer|attr_accessor|private|public|protected|true|false|nil|self|super|yield|lambda|proc|do|end|case|when|then)\b/g,
        java: /\b(public|private|protected|static|final|abstract|class|interface|extends|implements|new|this|super|return|if|else|for|while|do|break|continue|switch|case|default|try|catch|finally|throw|throws|import|package|void|int|long|double|float|boolean|char|byte|short)\b/g,
        sql: /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DATABASE|DROP|ALTER|ADD|COLUMN|PRIMARY|KEY|FOREIGN|REFERENCES|INDEX|UNIQUE|NOT|NULL|DEFAULT|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|CASE|WHEN|THEN|ELSE|END)\b/gi,
        html: /\b(html|head|body|div|span|a|img|p|h[1-6]|ul|ol|li|table|tr|td|th|form|input|button|script|style|link|meta)\b/gi,
        css: /\b(color|background|margin|padding|border|font|width|height|display|position|top|left|right|bottom|flex|grid|transform|transition|animation)\b/gi
      },
      // Numbers
      number: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g,
      // Functions
      function: /\b([a-zA-Z_]\w*)\s*(?=\()/g,
      // Booleans
      boolean: /\b(true|false|True|False|TRUE|FALSE|null|NULL|nil|None|undefined)\b/g,
      // Operators
      operator: /([+\-*/%=<>!&|^~?:]|&&|\|\||<<|>>|>>>|==|!=|===|!==|<=|>=|\+=|-=|\*=|\/=|%=|&=|\|=|\^=|<<=|>>=|>>>=)/g,
      // Properties/attributes
      property: /\b(\w+)(?=:)/g,
      // Tags (for HTML/XML)
      tag: /<\/?[\w\s="/.':;#-\/\?]+>/gi
    }

    let highlighted = code

    // Apply syntax highlighting based on language
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
      case 'jsx':
        highlighted = this.applyJavaScriptHighlighting(highlighted, patterns)
        break
      case 'typescript':
      case 'ts':
      case 'tsx':
        highlighted = this.applyTypeScriptHighlighting(highlighted, patterns)
        break
      case 'python':
      case 'py':
        highlighted = this.applyPythonHighlighting(highlighted, patterns)
        break
      case 'ruby':
      case 'rb':
        highlighted = this.applyRubyHighlighting(highlighted, patterns)
        break
      case 'java':
        highlighted = this.applyJavaHighlighting(highlighted, patterns)
        break
      case 'sql':
        highlighted = this.applySQLHighlighting(highlighted, patterns)
        break
      case 'html':
      case 'xml':
        highlighted = this.applyHTMLHighlighting(highlighted, patterns)
        break
      case 'css':
      case 'scss':
      case 'sass':
        highlighted = this.applyCSSHighlighting(highlighted, patterns)
        break
      case 'json':
        highlighted = this.applyJSONHighlighting(highlighted, patterns)
        break
      case 'bash':
      case 'shell':
      case 'sh':
        highlighted = this.applyBashHighlighting(highlighted, patterns)
        break
      default:
        // Generic highlighting for other languages
        highlighted = this.applyGenericHighlighting(highlighted, patterns)
    }

    return highlighted
  }

  // Helper method to apply highlighting with proper order
  applyHighlighting(code, rules) {
    let result = code

    // Store placeholders to avoid re-highlighting
    const placeholders = new Map()
    let placeholderIndex = 0

    // Helper function to create placeholder
    const createPlaceholder = (content) => {
      const placeholder = `__HIGHLIGHT_${placeholderIndex++}__`
      placeholders.set(placeholder, content)
      return placeholder
    }

    // Apply rules in specific order
    for (const [tokenType, pattern] of Object.entries(rules)) {
      if (pattern instanceof RegExp) {
        result = result.replace(pattern, (match) => {
          const highlighted = `<span class="token ${tokenType}">${match}</span>`
          return createPlaceholder(highlighted)
        })
      }
    }

    // Restore placeholders
    placeholders.forEach((content, placeholder) => {
      result = result.replace(placeholder, content)
    })

    return result
  }

  // Language-specific highlighting methods
  applyJavaScriptHighlighting(code, patterns) {
    const rules = {
      comment: patterns.comment.single,
      'comment multi': patterns.comment.multi,
      string: patterns.string.double,
      'string single': patterns.string.single,
      'string template': patterns.string.template,
      keyword: patterns.keywords.js,
      boolean: patterns.boolean,
      number: patterns.number,
      function: patterns.function,
      operator: patterns.operator
    }

    return this.applyHighlighting(code, rules)
  }

  applyTypeScriptHighlighting(code, patterns) {
    // TypeScript includes JS patterns plus types
    const tsKeywords = /\b(const|let|var|function|return|if|else|for|while|do|break|continue|switch|case|default|try|catch|finally|throw|new|this|super|class|extends|export|import|async|await|yield|typeof|instanceof|in|of|void|delete|interface|type|enum|namespace|module|declare|abstract|as|implements|from|keyof|readonly|required)\b/g

    const rules = {
      comment: patterns.comment.single,
      'comment multi': patterns.comment.multi,
      string: patterns.string.double,
      'string single': patterns.string.single,
      'string template': patterns.string.template,
      keyword: tsKeywords,
      boolean: patterns.boolean,
      number: patterns.number,
      function: patterns.function,
      operator: patterns.operator
    }

    return this.applyHighlighting(code, rules)
  }

  applyPythonHighlighting(code, patterns) {
    const rules = {
      comment: patterns.comment.hash,
      'string triple': /"""[\s\S]*?"""|'''[\s\S]*?'''/g,
      string: patterns.string.double,
      'string single': patterns.string.single,
      keyword: patterns.keywords.python,
      boolean: patterns.boolean,
      number: patterns.number,
      function: patterns.function,
      decorator: /@\w+/g,
      operator: patterns.operator
    }

    return this.applyHighlighting(code, rules)
  }

  applyRubyHighlighting(code, patterns) {
    const rules = {
      comment: patterns.comment.hash,
      string: patterns.string.double,
      'string single': patterns.string.single,
      symbol: /:\w+/g,
      keyword: patterns.keywords.ruby,
      boolean: patterns.boolean,
      number: patterns.number,
      function: patterns.function,
      operator: patterns.operator,
      variable: /@\w+|\$\w+/g
    }

    return this.applyHighlighting(code, rules)
  }

  applyJavaHighlighting(code, patterns) {
    const rules = {
      comment: patterns.comment.single,
      'comment multi': patterns.comment.multi,
      string: patterns.string.double,
      keyword: patterns.keywords.java,
      boolean: patterns.boolean,
      number: patterns.number,
      function: patterns.function,
      annotation: /@\w+/g,
      operator: patterns.operator
    }

    return this.applyHighlighting(code, rules)
  }

  applySQLHighlighting(code, patterns) {
    const rules = {
      comment: /--.*$/gm,
      'comment multi': patterns.comment.multi,
      string: patterns.string.single,
      keyword: patterns.keywords.sql,
      function: /\b(COUNT|SUM|AVG|MIN|MAX|ROUND|LENGTH|SUBSTR|CONCAT|NOW|DATE|YEAR|MONTH|DAY)\b/gi,
      number: patterns.number,
      operator: patterns.operator
    }

    return this.applyHighlighting(code, rules)
  }

  applyHTMLHighlighting(code, patterns) {
    const rules = {
      comment: patterns.comment.html,
      tag: patterns.tag,
      'attr-name': /\b(\w+)(?==)/g,
      'attr-value': /=["']([^"']+)["']/g,
      string: patterns.string.double
    }

    return this.applyHighlighting(code, rules)
  }

  applyCSSHighlighting(code, patterns) {
    const rules = {
      comment: patterns.comment.multi,
      selector: /[^{]+(?={)/g,
      property: /[\w-]+(?=:)/g,
      value: /:\s*([^;]+)/g,
      keyword: patterns.keywords.css,
      number: patterns.number,
      unit: /\b(\d+)(px|em|rem|%|vh|vw|deg|s|ms)/g,
      color: /#[0-9a-fA-F]{3,6}\b/g
    }

    return this.applyHighlighting(code, rules)
  }

  applyJSONHighlighting(code, patterns) {
    const rules = {
      property: /"([^"]+)"(?=:)/g,
      string: patterns.string.double,
      number: patterns.number,
      boolean: /\b(true|false|null)\b/g
    }

    return this.applyHighlighting(code, rules)
  }

  applyBashHighlighting(code, patterns) {
    const rules = {
      comment: patterns.comment.hash,
      string: patterns.string.double,
      'string single': patterns.string.single,
      keyword: /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|in|break|continue)\b/g,
      builtin: /\b(echo|cd|ls|mkdir|rm|cp|mv|touch|cat|grep|sed|awk|find|chmod|chown|sudo|apt|yum|npm|git)\b/g,
      variable: /\$\w+|\$\{[^}]+\}/g,
      operator: patterns.operator
    }

    return this.applyHighlighting(code, rules)
  }

  applyGenericHighlighting(code, patterns) {
    const rules = {
      comment: patterns.comment.single,
      string: patterns.string.double,
      number: patterns.number,
      boolean: patterns.boolean,
      operator: patterns.operator
    }

    return this.applyHighlighting(code, rules)
  }

  processInlineCode(text) {
    return text.replace(this.rules.inlineCode, (match, code) => {
      return `<code class="inline-code">${this.escapeHtml(code)}</code>`
    })
  }

  processHeaders(text) {
    text = text.replace(this.rules.heading6, '<h6>$1</h6>')
    text = text.replace(this.rules.heading5, '<h5>$1</h5>')
    text = text.replace(this.rules.heading4, '<h4>$1</h4>')
    text = text.replace(this.rules.heading3, '<h3>$1</h3>')
    text = text.replace(this.rules.heading2, '<h2>$1</h2>')
    text = text.replace(this.rules.heading1, '<h1>$1</h1>')
    return text
  }

  processTextFormatting(text) {
    // Process bold+italic first to avoid conflicts
    text = text.replace(this.rules.boldItalic, '<strong><em>$1</em></strong>')
    text = text.replace(this.rules.bold, '<strong>$1</strong>')
    text = text.replace(this.rules.italic, '<em>$1</em>')
    text = text.replace(this.rules.strikethrough, '<del>$1</del>')
    return text
  }

  processLinks(text) {
    // Process images first (they also use [alt](url) syntax)
    text = text.replace(this.rules.image, '<img src="$2" alt="$1" loading="lazy" class="markdown-image">')
    text = text.replace(this.rules.link, '<a href="$2" target="_blank" rel="noopener noreferrer" class="markdown-link">$1</a>')
    return text
  }

  processLists(text) {
    const lines = text.split('\n')
    const result = []
    let currentList = null
    let listItems = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const unorderedMatch = line.match(/^(\s*)[\*\-\+]\s+(.+)$/)
      const orderedMatch = line.match(/^(\s*)\d+\.\s+(.+)$/)

      if (unorderedMatch) {
        const indent = unorderedMatch[1].length
        const content = unorderedMatch[2]

        if (currentList !== 'ul' || listItems.length === 0) {
          this.flushList(result, currentList, listItems)
          currentList = 'ul'
          listItems = []
        }

        listItems.push({ content, indent })
      } else if (orderedMatch) {
        const indent = orderedMatch[1].length
        const content = orderedMatch[2]

        if (currentList !== 'ol' || listItems.length === 0) {
          this.flushList(result, currentList, listItems)
          currentList = 'ol'
          listItems = []
        }

        listItems.push({ content, indent })
      } else {
        this.flushList(result, currentList, listItems)
        currentList = null
        listItems = []
        result.push(line)
      }
    }

    // Handle remaining list
    this.flushList(result, currentList, listItems)

    return result.join('\n')
  }

  flushList(result, listType, items) {
    if (!listType || items.length === 0) return

    const listItems = items.map(item => `<li>${item.content}</li>`).join('')
    result.push(`<${listType}>${listItems}</${listType}>`)
  }

  processBlockquotes(text) {
    const lines = text.split('\n')
    const result = []
    let inBlockquote = false
    let blockquoteLines = []

    for (const line of lines) {
      const match = line.match(/^>\s*(.*)$/)

      if (match) {
        if (!inBlockquote) {
          inBlockquote = true
          blockquoteLines = []
        }
        blockquoteLines.push(match[1])
      } else {
        if (inBlockquote) {
          result.push(`<blockquote>${blockquoteLines.join('<br>')}</blockquote>`)
          inBlockquote = false
          blockquoteLines = []
        }
        result.push(line)
      }
    }

    // Handle remaining blockquote
    if (inBlockquote) {
      result.push(`<blockquote>${blockquoteLines.join('<br>')}</blockquote>`)
    }

    return result.join('\n')
  }

  processTables(text) {
    const lines = text.split('\n')
    const result = []
    let inTable = false
    let tableRows = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const isTableRow = /\|(.+)\|/.test(line)
      const isSeparator = /^\s*\|[\s\-:]+\|\s*$/.test(line)

      if (isTableRow && !isSeparator) {
        if (!inTable) {
          inTable = true
          tableRows = []
        }

        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell)
        const isHeader = tableRows.length === 0
        const tag = isHeader ? 'th' : 'td'
        const row = `<tr>${cells.map(cell => `<${tag}>${cell}</${tag}>`).join('')}</tr>`

        tableRows.push(row)
      } else if (isSeparator) {
        // Skip separator line
        continue
      } else {
        if (inTable) {
          result.push(`<table class="markdown-table">${tableRows.join('')}</table>`)
          inTable = false
          tableRows = []
        }
        result.push(line)
      }
    }

    // Handle remaining table
    if (inTable) {
      result.push(`<table class="markdown-table">${tableRows.join('')}</table>`)
    }

    return result.join('\n')
  }

  processHorizontalRules(text) {
    return text.replace(this.rules.horizontalRule, '<hr class="markdown-hr">')
  }

  processLineBreaks(text) {
    return text.replace(this.rules.lineBreak, '<br>')
  }

  processParagraphs(text) {
    // Split by double newlines but preserve existing HTML elements
    const paragraphs = text.split(/\n\s*\n/)

    return paragraphs.map(paragraph => {
      paragraph = paragraph.trim()
      if (!paragraph) return ''

      // Don't wrap if it's already HTML or a list/heading/blockquote/table/hr/code
      if (this.isAlreadyFormatted(paragraph)) {
        return paragraph
      }

      return `<p>${paragraph}</p>`
    }).filter(p => p).join('\n\n')
  }

  isAlreadyFormatted(text) {
    const htmlElements = /^<(h[1-6]|ul|ol|blockquote|table|hr|div|pre)/i
    const markdownElements = /^(#{1,6}\s|[\*\-\+]\s|\d+\.\s|>\s|\|.*\|)/

    return htmlElements.test(text) || markdownElements.test(text)
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  escapeAttribute(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/'/g, '&#39;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  getLanguageClass(language) {
    const languageMap = {
      'javascript': 'lang-js',
      'js': 'lang-js',
      'jsx': 'lang-jsx',
      'typescript': 'lang-ts',
      'ts': 'lang-ts',
      'tsx': 'lang-tsx',
      'python': 'lang-py',
      'py': 'lang-py',
      'ruby': 'lang-rb',
      'rb': 'lang-rb',
      'java': 'lang-java',
      'cpp': 'lang-cpp',
      'c++': 'lang-cpp',
      'csharp': 'lang-cs',
      'c#': 'lang-cs',
      'php': 'lang-php',
      'go': 'lang-go',
      'rust': 'lang-rust',
      'html': 'lang-html',
      'css': 'lang-css',
      'scss': 'lang-scss',
      'sass': 'lang-sass',
      'sql': 'lang-sql',
      'json': 'lang-json',
      'xml': 'lang-xml',
      'yaml': 'lang-yaml',
      'yml': 'lang-yaml',
      'bash': 'lang-bash',
      'shell': 'lang-bash',
      'sh': 'lang-bash',
      'powershell': 'lang-powershell',
      'dockerfile': 'lang-dockerfile',
      'markdown': 'lang-md',
      'md': 'lang-md'
    }

    return languageMap[language.toLowerCase()] || 'lang-plaintext'
  }

  getLanguageLabel(language) {
    const labelMap = {
      'javascript': 'JavaScript',
      'js': 'JavaScript',
      'jsx': 'JSX',
      'typescript': 'TypeScript',
      'ts': 'TypeScript',
      'tsx': 'TSX',
      'python': 'Python',
      'py': 'Python',
      'ruby': 'Ruby',
      'rb': 'Ruby',
      'java': 'Java',
      'cpp': 'C++',
      'c++': 'C++',
      'csharp': 'C#',
      'c#': 'C#',
      'php': 'PHP',
      'go': 'Go',
      'rust': 'Rust',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'sass': 'Sass',
      'sql': 'SQL',
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'yml': 'YAML',
      'bash': 'Bash',
      'shell': 'Shell',
      'sh': 'Shell',
      'powershell': 'PowerShell',
      'dockerfile': 'Dockerfile',
      'markdown': 'Markdown',
      'md': 'Markdown',
      'plaintext': 'Text'
    }

    return labelMap[language.toLowerCase()] || language.toUpperCase()
  }

  // Utility method to extract plain text (useful for search, etc.)
  extractPlainText(markdown) {
    let text = markdown

    // Remove code blocks
    text = text.replace(this.rules.codeBlock, '')

    // Remove inline code
    text = text.replace(this.rules.inlineCode, '$1')

    // Remove formatting
    text = text.replace(this.rules.bold, '$1')
    text = text.replace(this.rules.italic, '$1')
    text = text.replace(this.rules.strikethrough, '$1')

    // Remove links but keep text
    text = text.replace(this.rules.link, '$1')
    text = text.replace(this.rules.image, '$1')

    // Remove markdown symbols
    text = text.replace(/^#{1,6}\s+/gm, '')
    text = text.replace(/^[\*\-\+]\s+/gm, '')
    text = text.replace(/^\d+\.\s+/gm, '')
    text = text.replace(/^>\s*/gm, '')

    return text.trim()
  }
}
