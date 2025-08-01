// app/javascript/controllers/chat_controller.js
import { Controller } from "@hotwired/stimulus"
import MarkdownProcessor from "javascript/markdown_processor"

export default class extends Controller {

  static targets = [
    "messagesContainer",
    "messageInput",
    "sendButton",
    "settingsPanel",
    "modelSelect",
    "temperatureInput",
    "temperatureValue",
    "maxTokensValue",
    "maxTokensInput",
    "temperatureError",
    "maxTokensError",
    "themeSwitch",
    "emptyState",
    "toast",
    "toastMessage"
  ]

  static values = {
    storageKey: { type: String, default: 'ai-chat-settings' },
    apiEndpoint: { type: String, default: '/ai_api/answer' },
    modelsEndpoint: { type: String, default: '/ai_api/list_models' }
  }

  connect() {
    this.markdownProcessor = new MarkdownProcessor()
    this.setupEventListeners()
    this.initializeSpeechRecognition()
    this.loadSettings()
    this.loadAvailableModels()
    this.hideLoadingIndicator()
    this.setupCodeCopyHandlers()

    // Verificação e correção de tema para mobile
    this.initializeThemeCorrection()
  }

  disconnect() {
    this.cleanup()
  }

  // ==================
  // Theme Correction for Mobile
  // ==================

  initializeThemeCorrection() {
    // Aplicar correções de tema ao conectar
    this.applyThemeCorrectly()

    // Configurar observer para mudanças de tema
    this.setupThemeObserver()

    // Adicionar listeners para mudanças de orientação
    this.setupOrientationHandler()

    // Debug inicial se for dispositivo móvel
    if (this.isMobileDevice()) {
      console.log('Dispositivo móvel detectado. Aplicando correções de cor...')
      this.fixMobileInputs()
    }
  }

  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || window.innerWidth <= 768
  }

  applyThemeCorrectly() {
    const body = document.body
    const savedSettings = this.getSavedSettings()
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    // Limpar classes de tema existentes
    body.classList.remove('dark-theme', 'light-theme', 'theme-undefined')

    // Determinar qual tema usar
    let themeToApply = 'light' // Padrão

    if (savedSettings?.dark_theme !== undefined) {
      themeToApply = savedSettings.dark_theme ? 'dark' : 'light'
    } else if (prefersDark) {
      themeToApply = 'dark'
    }

    // Aplicar tema
    if (themeToApply === 'dark') {
      body.classList.add('dark-theme')
    } else {
      body.classList.add('light-theme')
    }

    // Adicionar classe específica para mobile
    if (this.isMobileDevice()) {
      body.classList.add('is-mobile-device')
    }

    // Forçar recálculo de estilos em mobile
    if (this.isMobileDevice()) {
      this.forceStyleRecalculation()
    }
  }

  forceStyleRecalculation() {
    // Forçar reflow do navegador
    const body = document.body
    body.style.display = 'none'
    body.offsetHeight // Trigger reflow
    body.style.display = ''

    // Aplicar correções específicas de input
    this.fixMobileInputs()
  }

  fixMobileInputs() {
    // Corrigir todos os inputs de texto
    const inputs = document.querySelectorAll('.chat-input, input[type="text"], textarea')
    const isDarkTheme = document.body.classList.contains('dark-theme')

    inputs.forEach(input => {
      // Remover estilos problemáticos inline
      input.style.removeProperty('-webkit-text-fill-color')
      input.style.removeProperty('color')

      // Aplicar estilos corretos baseados no tema
      if (this.isMobileDevice()) {
        // Forçar cor baseada no tema
        if (isDarkTheme) {
          input.style.setProperty('color', '#f9fafb', 'important')
          input.style.setProperty('-webkit-text-fill-color', 'initial', 'important')
        } else {
          input.style.setProperty('color', '#111827', 'important')
          input.style.setProperty('-webkit-text-fill-color', 'initial', 'important')
        }
      }
    })

    // Corrigir especificamente o input de mensagem
    if (this.hasMessageInputTarget && this.isMobileDevice()) {
      this.fixMessageInput()
    }
  }

  fixMessageInput() {
    const input = this.messageInputTarget
    const isDarkTheme = document.body.classList.contains('dark-theme')

    // Remover classes problemáticas
    input.classList.remove('text-fill-transparent')

    // Aplicar correções específicas
    input.style.setProperty('-webkit-text-fill-color', 'initial', 'important')

    if (isDarkTheme) {
      input.style.setProperty('color', '#f9fafb', 'important')
      input.style.setProperty('background-color', '#1f2937', 'important')
    } else {
      input.style.setProperty('color', '#111827', 'important')
      input.style.setProperty('background-color', '#ffffff', 'important')
    }
  }

  setupThemeObserver() {
    // Observar mudanças na classe do body
    this.themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (this.isMobileDevice()) {
            // Reaplicar correções quando o tema mudar
            setTimeout(() => {
              this.fixMobileInputs()
            }, 10)
          }
        }
      })
    })

    this.themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    })
  }

  setupOrientationHandler() {
    this.orientationHandler = () => {
      if (this.isMobileDevice()) {
        setTimeout(() => {
          this.applyThemeCorrectly()
        }, 100)
      }
    }

    window.addEventListener('orientationchange', this.orientationHandler)
  }

  // Debug helper para troubleshooting
  debugMobileColors() {
    if (!this.isMobileDevice()) {
      console.log('Não é um dispositivo móvel')
      return
    }

    console.log('=== Debug de Cores Mobile ===')
    console.log('User Agent:', navigator.userAgent)
    console.log('Largura da tela:', window.innerWidth)
    console.log('Classes do body:', document.body.className)
    console.log('LocalStorage theme:', localStorage.getItem(this.storageKeyValue))
    console.log('Prefers dark mode:', window.matchMedia('(prefers-color-scheme: dark)').matches)

    // Verificar computed styles do input
    if (this.hasMessageInputTarget) {
      const styles = window.getComputedStyle(this.messageInputTarget)
      console.log('Chat Input - Computed Styles:')
      console.log('  color:', styles.color)
      console.log('  -webkit-text-fill-color:', styles.webkitTextFillColor)
      console.log('  background-color:', styles.backgroundColor)
      console.log('  caret-color:', styles.caretColor)
    }
  }

  // ==================
  // Initialization
  // ==================

  hideLoadingIndicator() {
    const loadingEl = document.getElementById('app-loading')
    if (loadingEl) {
      loadingEl.style.display = 'none'
    }

    // Mostrar o container principal do chat
    this.element.classList.add('loaded')
  }

  setupCodeCopyHandlers() {
    // Set up global event delegation for copy buttons
    document.addEventListener('click', (event) => {
      if (event.target.closest('.copy-code-btn')) {
        this.handleCodeCopy(event)
      }
    })
  }

  setupEventListeners() {
    this.setupKeyboardShortcuts()
    this.setupClickOutsideHandler()
  }

  handleCodeCopy(event) {
    event.preventDefault()
    const button = event.target.closest('.copy-code-btn')
    const code = button.dataset.code

    if (navigator.clipboard && code) {
      navigator.clipboard.writeText(code).then(() => {
        this.showCopySuccess(button)
      }).catch(() => {
        this.fallbackCopyToClipboard(code, button)
      })
    } else {
      this.fallbackCopyToClipboard(code, button)
    }
  }

  showCopySuccess(button) {
    const originalText = button.innerHTML
    button.classList.add('copied')
    button.innerHTML = `
      <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5"></path>
      </svg>
      Copiado!
    `

    setTimeout(() => {
      button.classList.remove('copied')
      button.innerHTML = originalText
    }, 2000)

    this.showToast('Código copiado para a área de transferência!', 'success')
  }

  fallbackCopyToClipboard(text, button) {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
      this.showCopySuccess(button)
    } catch (err) {
      console.error('Fallback copy failed:', err)
      this.showToast('Erro ao copiar código', 'error')
    }

    document.body.removeChild(textArea)
  }

  updateTemperature() {
    if (this.hasTemperatureInputTarget && this.hasTemperatureValueTarget) {
      this.temperatureValueTarget.textContent = this.temperatureInputTarget.value;
    }
  }

  updateMaxTokens() {
    if (this.hasMaxTokensInputTarget && this.hasMaxTokensValueTarget) {
      this.maxTokensValueTarget.textContent = this.maxTokensInputTarget.value;
    }
  }

  // ==================
  // Model Management
  // ==================

  async loadAvailableModels() {
    try {
      this.setModelLoadingState(true)

      const response = await fetch(this.modelsEndpointValue, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.models && Array.isArray(data.models)) {
        this.populateModelSelect(data.models)

        if (!data.success) {
          this.showToast('Usando modelos padrão devido a erro na API', 'warning')
        }
      } else {
        throw new Error('Invalid response format')
      }

    } catch (error) {
      console.error('Error loading models:', error)
      this.populateModelSelect(this.getFallbackModels())
      this.showToast('Erro ao carregar modelos. Usando modelos padrão.', 'error')
    } finally {
      this.setModelLoadingState(false)
    }
  }

  setModelLoadingState(loading) {
    if (loading) {
      this.modelSelectTarget.innerHTML = '<option value="">Carregando modelos...</option>'
      this.modelSelectTarget.disabled = true
    } else {
      this.modelSelectTarget.disabled = false
    }
  }

  populateModelSelect(models) {
    this.modelSelectTarget.innerHTML = ''

    models.forEach(model => {
      const option = document.createElement('option')
      option.value = model.id
      option.textContent = model.name || this.formatModelName(model.id)
      this.modelSelectTarget.appendChild(option)
    })

    this.restoreSavedModelSelection(models)
  }

  restoreSavedModelSelection(models) {
    const savedSettings = this.getSavedSettings()
    if (savedSettings?.model) {
      const modelExists = models.find(m => m.id === savedSettings.model)
      if (modelExists) {
        this.modelSelectTarget.value = savedSettings.model
      }
    }
  }

  getFallbackModels() {
    return [
      { id: "meta-llama/Meta-Llama-3.1-8B-Instruct", name: "Llama 3.1 8B" },
      { id: "meta-llama/Meta-Llama-3.1-70B-Instruct", name: "Llama 3.1 70B" },
      { id: "meta-llama/Meta-Llama-3.1-405B-Instruct", name: "Llama 3.1 405B" },
      { id: "mistralai/Mistral-7B-Instruct-v0.3", name: "Mistral 7B" },
      { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", name: "Mixtral 8x7B" }
    ]
  }

  formatModelName(modelId) {
    const formatMap = {
      'meta-llama/Meta-Llama-': 'Llama ',
      'mistralai/': '',
      '-Instruct': '',
      '-v0.3': '',
      '-v0.1': '',
      'Mistral-': 'Mistral ',
      'Mixtral-': 'Mixtral '
    }

    let name = modelId
    Object.entries(formatMap).forEach(([pattern, replacement]) => {
      name = name.replace(pattern, replacement)
    })

    return name
  }

  async refreshModels() {
    await this.loadAvailableModels()
    this.showToast('Modelos atualizados!', 'success')
  }

  // ==================
  // Settings Management
  // ==================

  toggleSettings(event) {
    event?.preventDefault()
    const isOpen = this.settingsPanelTarget.getAttribute('aria-hidden') === 'false'
    this.settingsPanelTarget.setAttribute('aria-hidden', isOpen ? 'true' : 'false')
  }

  closeSettings(event) {
    event?.preventDefault()
    this.settingsPanelTarget.setAttribute('aria-hidden', 'true')
  }

  async saveSettings(event) {
    event.preventDefault()

    if (!this.validateSettings()) {
      return
    }

    const settings = {
      model: this.modelSelectTarget.value,
      temperature: parseFloat(this.temperatureInputTarget.value),
      max_tokens: parseInt(this.maxTokensInputTarget.value),
      dark_theme: this.themeSwitchTarget.checked
    }

    localStorage.setItem(this.storageKeyValue, JSON.stringify(settings))
    this.showToast('Configurações salvas com sucesso!', 'success')
    this.closeSettings()
  }

  loadSettings() {
    const savedSettings = this.getSavedSettings()

    if (savedSettings) {
      this.applySettings(savedSettings)
    }
  }

  applySettings(settings) {
    if (settings.model) this.modelSelectTarget.value = settings.model
    if (settings.temperature !== undefined) this.temperatureInputTarget.value = settings.temperature
    if (settings.max_tokens !== undefined) this.maxTokensInputTarget.value = settings.max_tokens

    if (settings.dark_theme) {
      this.themeSwitchTarget.checked = true
      document.body.classList.add('dark-theme')
    }

    // Aplicar correções de tema mobile após carregar configurações
    if (this.isMobileDevice()) {
      setTimeout(() => {
        this.fixMobileInputs()
      }, 100)
    }
  }

  getSavedSettings() {
    try {
      const savedSettings = localStorage.getItem(this.storageKeyValue)
      return savedSettings ? JSON.parse(savedSettings) : null
    } catch (error) {
      console.error('Error parsing saved settings:', error)
      return null
    }
  }

  getCurrentSettings() {
    // Pega o valor atual do select e dos inputs, se disponíveis
    const model = this.modelSelectTarget?.value
      || this.getSavedSettings()?.model
      || 'meta-llama/Meta-Llama-3.1-70B-Instruct';

    const temperature = this.temperatureInputTarget?.value !== undefined
      ? parseFloat(this.temperatureInputTarget.value)
      : (this.getSavedSettings()?.temperature ?? 0.7);

    const max_tokens = this.maxTokensInputTarget?.value !== undefined
      ? parseInt(this.maxTokensInputTarget.value)
      : (this.getSavedSettings()?.max_tokens ?? 1000);

    return {
      model,
      temperature,
      max_tokens
    }
  }

  // ==================
  // Validation
  // ==================

  validateSettings() {
    const tempValid = this.validateTemperature()
    const tokensValid = this.validateMaxTokens()
    return tempValid && tokensValid
  }

  validateTemperature() {
    const value = parseFloat(this.temperatureInputTarget.value)
    const isValid = !isNaN(value) && value >= 0 && value <= 2

    this.toggleValidationState(
      this.temperatureInputTarget,
      this.temperatureErrorTarget,
      isValid
    )

    return isValid
  }

  validateMaxTokens() {
    const value = parseInt(this.maxTokensInputTarget.value)
    const isValid = !isNaN(value) && value >= 1 && value <= 4000

    this.toggleValidationState(
      this.maxTokensInputTarget,
      this.maxTokensErrorTarget,
      isValid
    )

    return isValid
  }

  toggleValidationState(input, error, isValid) {
    input.classList.toggle('error', !isValid)
    error.classList.toggle('active', !isValid)
  }

  // ==================
  // Theme Management
  // ==================

  toggleTheme() {
    document.body.classList.toggle('dark-theme')

    // Aplicar correções para mobile ao trocar tema
    if (this.isMobileDevice()) {
      this.applyThemeCorrectly()
    }

    // Atualizar ícones se existirem
    if (this.hasSunIconTarget && this.hasMoonIconTarget) {
      this.sunIconTarget.style.display = document.body.classList.contains('dark-theme') ? 'none' : ''
      this.moonIconTarget.style.display = document.body.classList.contains('dark-theme') ? '' : 'none'
    }
  }

  // ==================
  // Message Handling
  // ==================

  async sendMessage(event) {
    event?.preventDefault()

    const message = this.messageInputTarget.value.trim()
    if (!message) return

    this.hideEmptyState()
    this.addMessage(message, 'user')
    this.clearInput()
    this.setInputState(false)

    const loadingId = this.addLoadingMessage()

    try {
      const response = await this.sendMessageToAPI(message)
      this.removeLoadingMessage(loadingId)

      if (response.answer) {
        this.addMessage(response.answer, 'ai')
      } else {
        throw new Error('Empty response from API')
      }
    } catch (error) {
      console.error('Error:', error)
      this.removeLoadingMessage(loadingId)
      this.addMessage('Erro ao processar solicitação. Por favor, tente novamente.', 'ai', 'error')
      this.showToast('Erro ao processar solicitação.', 'error')
    } finally {
      this.setInputState(true)
      this.messageInputTarget.focus()

      // Reaplicar correções mobile após enviar mensagem
      if (this.isMobileDevice()) {
        this.fixMessageInput()
      }
    }
  }

  async sendMessageToAPI(message) {
    const formData = new FormData()
    formData.append('question', message)

    const settings = this.getCurrentSettings()
    Object.entries(settings).forEach(([key, value]) => {
      formData.append(key, value)
    })

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content

    const response = await fetch(this.apiEndpointValue, {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRF-Token': csrfToken
      }
    })

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`)
    }

    return await response.json()
  }

  // ==================
  // Message UI
  // ==================

  addMessage(content, role, type = 'normal') {
    const messageEl = this.createMessageElement(content, role, type)
    this.messagesContainerTarget.appendChild(messageEl)
    this.scrollToBottom()
    return messageEl
  }

  createMessageElement(content, role, type) {
    const messageDiv = document.createElement('div')
    messageDiv.className = `message ${type === 'error' ? 'message-error' : ''}`

    const avatar = this.createAvatar(role)
    const contentDiv = this.createMessageContent(content, role)

    messageDiv.appendChild(avatar)
    messageDiv.appendChild(contentDiv)

    return messageDiv
  }

  createAvatar(role) {
    const avatar = document.createElement('div')
    avatar.className = `message-avatar ${role}-avatar`
    avatar.textContent = role === 'user' ? 'U' : 'AI'
    return avatar
  }

  createMessageContent(content, role) {
    const contentDiv = document.createElement('div')
    contentDiv.className = 'message-content'

    const roleDiv = this.createRoleElement(role)
    const textDiv = this.createTextElement(content, role)

    contentDiv.appendChild(roleDiv)
    contentDiv.appendChild(textDiv)

    return contentDiv
  }

  createRoleElement(role) {
    const roleDiv = document.createElement('div')
    roleDiv.className = 'message-role'

    if (role === 'user') {
      roleDiv.textContent = 'Você'
    } else {
      const settings = this.getCurrentSettings()
      const modelName = this.formatModelName(settings.model)
      roleDiv.innerHTML = `Assistente <span class="badge">${modelName}</span>`
    }

    return roleDiv
  }

  createTextElement(content, role) {
    const textDiv = document.createElement('div')
    textDiv.className = 'message-text'

    if (role === 'ai' && this.markdownProcessor) {
      try {
        const processedContent = this.markdownProcessor.processMarkdown(content)
        textDiv.innerHTML = processedContent
        this.enhanceCodeBlocks(textDiv)
      } catch (error) {
        console.error('Error processing markdown:', error)
        textDiv.textContent = content
      }
    } else {
      textDiv.textContent = content
    }

    return textDiv
  }

  enhanceCodeBlocks(element) {
    // Add copy functionality to code blocks
    const codeBlocks = element.querySelectorAll('.code-block-container')
    codeBlocks.forEach(container => {
      const copyBtn = container.querySelector('.copy-code-btn')
      if (copyBtn && !copyBtn.dataset.code) {
        const codeElement = container.querySelector('code')
        if (codeElement) {
          copyBtn.dataset.code = codeElement.textContent
        }
      }
    })

    // Add syntax highlighting classes
    const inlineCode = element.querySelectorAll('code:not(.language-)')
    inlineCode.forEach(code => {
      if (!code.parentElement.classList.contains('code-block')) {
        code.classList.add('inline-code')
      }
    })
  }

  addLoadingMessage() {
    const messageDiv = document.createElement('div')
    messageDiv.className = 'message'
    messageDiv.id = `loading-${Date.now()}`

    const avatar = this.createAvatar('ai')
    const contentDiv = this.createLoadingContent()

    messageDiv.appendChild(avatar)
    messageDiv.appendChild(contentDiv)

    this.messagesContainerTarget.appendChild(messageDiv)
    this.scrollToBottom()

    return messageDiv.id
  }

  createLoadingContent() {
    const contentDiv = document.createElement('div')
    contentDiv.className = 'message-content'

    const roleDiv = this.createRoleElement('ai')
    const loadingDiv = document.createElement('div')
    loadingDiv.className = 'loading-dots'
    loadingDiv.innerHTML = '<span></span><span></span><span></span>'

    contentDiv.appendChild(roleDiv)
    contentDiv.appendChild(loadingDiv)

    return contentDiv
  }

  removeLoadingMessage(id) {
    const loadingMessage = document.getElementById(id)
    loadingMessage?.remove()
  }

  // ==================
  // UI Helpers
  // ==================

  hideEmptyState() {
    if (this.hasEmptyStateTarget) {
      this.emptyStateTarget.style.display = 'none'
    }
  }

  clearInput() {
    this.messageInputTarget.value = ''
    this.adjustTextareaHeight()

    // Garantir que a cor do texto permaneça correta após limpar
    if (this.isMobileDevice()) {
      this.fixMessageInput()
    }
  }

  setInputState(enabled) {
    this.sendButtonTarget.disabled = !enabled
    this.messageInputTarget.disabled = !enabled
  }

  scrollToBottom() {
    requestAnimationFrame(() => {
      this.messagesContainerTarget.scrollTop = this.messagesContainerTarget.scrollHeight
    })
  }

  adjustTextareaHeight() {
    const textarea = this.messageInputTarget
    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, 200)
    textarea.style.height = `${newHeight}px`
  }

  // ==================
  // Suggestions
  // ==================

  sendSuggestion(event) {
    const suggestion = event.currentTarget.dataset.suggestion
    this.messageInputTarget.value = suggestion
    this.adjustTextareaHeight()
    this.messageInputTarget.focus()

    this.animateButton(event.currentTarget)

    // Garantir cor correta após inserir sugestão
    if (this.isMobileDevice()) {
      this.fixMessageInput()
    }
  }

  animateButton(button) {
    button.style.transform = 'scale(0.98)'
    setTimeout(() => {
      button.style.transform = ''
    }, 200)
  }

  // ==================
  // Toast Notifications
  // ==================

  showToast(message, type = 'default') {
    clearTimeout(this.toastTimeout)

    this.toastTarget.className = `toast ${type}`
    this.toastMessageTarget.textContent = message
    this.toastTarget.setAttribute('aria-hidden', 'false')

    this.toastTimeout = setTimeout(() => {
      this.hideToast()
    }, 3000)
  }

  hideToast() {
    this.toastTarget.setAttribute('aria-hidden', 'true')
  }

  // ==================
  // Keyboard Handling
  // ==================

  handleKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      this.sendMessage()
    }
  }

  setupKeyboardShortcuts() {
    this.keyboardHandler = (event) => {
      // Ctrl/Cmd + , to open settings
      if ((event.ctrlKey || event.metaKey) && event.key === ',') {
        event.preventDefault()
        this.toggleSettings()
      }

      // ESC to close settings
      if (event.key === 'Escape' &&
        this.settingsPanelTarget.getAttribute('aria-hidden') === 'false') {
        this.closeSettings()
      }
    }

    document.addEventListener('keydown', this.keyboardHandler)
  }

  // ==================
  // Click Outside
  // ==================

  setupClickOutsideHandler() {
    this.clickOutsideHandler = (event) => {
      const isSettingsOpen = this.settingsPanelTarget.getAttribute('aria-hidden') === 'false'
      const clickedOutside = !this.settingsPanelTarget.contains(event.target) &&
        !event.target.closest('[data-action*="toggleSettings"]')

      if (isSettingsOpen && clickedOutside) {
        this.closeSettings()
      }
    }

    document.addEventListener('click', this.clickOutsideHandler)
  }

  // ==================
  // Speech Recognition
  // ==================

  initializeSpeechRecognition() {
    if (!this.isSpeechRecognitionSupported()) return

    this.createSpeechButton()
    this.setupSpeechRecognition()
  }

  isSpeechRecognitionSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  }

  createSpeechButton() {
    const speechButton = document.createElement('button')
    speechButton.type = 'button'
    speechButton.className = 'btn btn-icon speech-button'
    speechButton.setAttribute('aria-label', 'Usar reconhecimento de voz')
    speechButton.innerHTML = `
      <svg class="icon icon-microphone" aria-hidden="true">
        <use href="#icon-microphone"></use>
      </svg>
    `

    const inputGroup = this.sendButtonTarget.parentElement
    inputGroup.insertBefore(speechButton, this.sendButtonTarget)

    speechButton.addEventListener('click', () => {
      this.toggleSpeechRecognition(speechButton)
    })

    this.speechButton = speechButton
  }

  setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognition()
    this.recognition.lang = 'pt-BR'
    this.recognition.interimResults = false
    this.recognition.maxAlternatives = 1

    this.isListening = false

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      this.messageInputTarget.value = transcript
      this.adjustTextareaHeight()

      // Corrigir cor após inserir texto via voz
      if (this.isMobileDevice()) {
        this.fixMessageInput()
      }

      setTimeout(() => {
        this.sendMessage()
      }, 500)
    }

    this.recognition.onend = () => {
      this.stopListening()
    }

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      this.showToast('Erro ao reconhecer voz. Tente novamente.', 'error')
      this.stopListening()
    }
  }

  toggleSpeechRecognition(button) {
    if (this.isListening) {
      this.recognition.stop()
    } else {
      this.startListening(button)
    }
  }

  startListening(button) {
    try {
      this.recognition.start()
      this.isListening = true
      button.classList.add('listening')
      this.showToast('Escutando... Fale sua pergunta', 'default')
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      this.showToast('Erro ao iniciar reconhecimento de voz', 'error')
    }
  }

  stopListening() {
    this.isListening = false
    if (this.speechButton) {
      this.speechButton.classList.remove('listening')
    }
  }

  // ==================
  // Cleanup
  // ==================

  cleanup() {
    // Clear timeouts
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout)
    }

    // Stop speech recognition
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }

    // Remove event listeners
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler)
    }

    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler)
    }

    // Remove theme observer
    if (this.themeObserver) {
      this.themeObserver.disconnect()
    }

    // Remove orientation handler
    if (this.orientationHandler) {
      window.removeEventListener('orientationchange', this.orientationHandler)
    }
  }
}

// Adicionar helper global para debug (disponível no console)
window.debugChatMobileColors = function() {
  const controller = document.querySelector('[data-controller="chat"]')
  if (controller && controller._stimulus) {
    const chatController = controller._stimulus.getControllerForElementAndIdentifier(controller, 'chat')
    if (chatController) {
      chatController.debugMobileColors()
    }
  }
}
