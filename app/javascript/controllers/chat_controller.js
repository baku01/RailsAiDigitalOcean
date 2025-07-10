
// app/javascript/controllers/chat_controller.js
import { Controller } from "@hotwired/stimulus"


// Connects to data-controller="chat"
export default class extends Controller {
  static targets = [
    "settingsPanel",
    "modelSelect",
    "temperatureInput",
    "temperatureError",
    "maxTokensInput",
    "maxTokensError",
    "themeSwitch",
    "messagesContainer",
    "emptyState",
    "messageInput",
    "sendButton",
    "toast",
    "toastMessage"
  ]

  // Settings keys for localStorage
  static STORAGE_KEY = "ai_chat_settings"

  // Initialize controller
  connect() {
    this.loadSettings()
    this.initializeSpeechRecognition()
    this.setupKeyboardShortcuts()
    this.setupClickOutsideHandler()

    // Remove loading indicator if exists
    const loadingIndicator = document.getElementById('app-loading')
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none'
    }

    // Focus on message input
    this.messageInputTarget.focus()
  }

  // Settings Management
  // ===================

  toggleSettings(event) {
    event.preventDefault()
    const isOpen = this.settingsPanelTarget.getAttribute('aria-hidden') === 'false'
    this.settingsPanelTarget.setAttribute('aria-hidden', isOpen ? 'true' : 'false')
  }

  closeSettings(event) {
    event.preventDefault()
    this.settingsPanelTarget.setAttribute('aria-hidden', 'true')
  }

  saveSettings(event) {
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

    localStorage.setItem(this.constructor.STORAGE_KEY, JSON.stringify(settings))
    this.showToast('Configurações salvas com sucesso!', 'success')
    this.settingsPanelTarget.setAttribute('aria-hidden', 'true')
  }

  loadSettings() {
    const savedSettings = localStorage.getItem(this.constructor.STORAGE_KEY)

    if (savedSettings) {
      const settings = JSON.parse(savedSettings)

      this.modelSelectTarget.value = settings.model || 'gpt-3.5-turbo'
      this.temperatureInputTarget.value = settings.temperature || 0.7
      this.maxTokensInputTarget.value = settings.max_tokens || 1000

      if (settings.dark_theme) {
        this.themeSwitchTarget.checked = true
        document.body.classList.add('dark-theme')
      }
    }
  }

  // Validation
  // ==========

  validateSettings() {
    const tempValid = this.validateTemperature()
    const tokensValid = this.validateMaxTokens()
    return tempValid && tokensValid
  }

  validateTemperature() {
    const value = parseFloat(this.temperatureInputTarget.value)
    const isValid = !isNaN(value) && value >= 0 && value <= 2

    this.temperatureInputTarget.classList.toggle('error', !isValid)
    this.temperatureErrorTarget.classList.toggle('active', !isValid)

    return isValid
  }

  validateMaxTokens() {
    const value = parseInt(this.maxTokensInputTarget.value)
    const isValid = !isNaN(value) && value >= 1 && value <= 4000

    this.maxTokensInputTarget.classList.toggle('error', !isValid)
    this.maxTokensErrorTarget.classList.toggle('active', !isValid)

    return isValid
  }

  // Theme Management
  // ================

  toggleTheme() {
    document.body.classList.toggle('dark-theme', this.themeSwitchTarget.checked)
  }

  // Message Handling
  // ================

  async sendMessage(event) {
    event.preventDefault()

    const message = this.messageInputTarget.value.trim()
    if (!message) return

    // Hide empty state
    if (this.hasEmptyStateTarget) {
      this.emptyStateTarget.style.display = 'none'
    }

    // Add user message
    this.addMessage(message, 'user')

    // Clear input
    this.messageInputTarget.value = ''
    this.adjustTextareaHeight()

    // Disable send button
    this.sendButtonTarget.disabled = true

    // Add loading message
    const loadingId = this.addLoadingMessage()

    try {
      const response = await this.sendMessageToAPI(message)

      // Remove loading message
      this.removeLoadingMessage(loadingId)

      // Add AI response
      if (response.answer) {
        this.addMessageWithTypingEffect(response.answer, 'ai')
      } else {
        this.addMessage('Desculpe, não consegui processar sua solicitação.', 'ai')
      }
    } catch (error) {
      console.error('Erro:', error)
      this.removeLoadingMessage(loadingId)
      this.addMessage('Erro ao processar solicitação. Por favor, tente novamente.', 'ai')
      this.showToast('Erro ao processar solicitação.', 'error')
    } finally {
      this.sendButtonTarget.disabled = false
      this.messageInputTarget.focus()
    }
  }

  async sendMessageToAPI(message) {
    const formData = new FormData()
    formData.append('question', message)

    // Add settings
    const settings = this.getCurrentSettings()
    formData.append('model', settings.model)
    formData.append('temperature', settings.temperature)
    formData.append('max_tokens', settings.max_tokens)

    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content

    const response = await fetch('/ai_api/answer', {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRF-Token': csrfToken
      }
    })

    if (!response.ok) {
      throw new Error('Erro na resposta do servidor')
    }

    return await response.json()
  }

  getCurrentSettings() {
    const savedSettings = localStorage.getItem(this.constructor.STORAGE_KEY)

    if (savedSettings) {
      return JSON.parse(savedSettings)
    }

    return {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1000
    }
  }

  // Message UI
  // ==========

  addMessage(content, role) {
    const messageDiv = document.createElement('div')
    messageDiv.className = 'message'

    const avatar = document.createElement('div')
    avatar.className = `message-avatar ${role}-avatar`
    avatar.textContent = role === 'user' ? 'U' : 'AI'

    const contentDiv = document.createElement('div')
    contentDiv.className = 'message-content'

    const roleDiv = document.createElement('div')
    roleDiv.className = 'message-role'

    if (role === 'user') {
      roleDiv.textContent = 'Você'
    } else {
      const settings = this.getCurrentSettings()
      const model = this.formatModelName(settings.model)
      roleDiv.innerHTML = `Assistente <span class="badge">${model}</span>`
    }

    const textDiv = document.createElement('div')
    textDiv.className = 'message-text'
    textDiv.textContent = content

    contentDiv.appendChild(roleDiv)
    contentDiv.appendChild(textDiv)

    messageDiv.appendChild(avatar)
    messageDiv.appendChild(contentDiv)

    this.messagesContainerTarget.appendChild(messageDiv)
    this.scrollToBottom()

    return messageDiv
  }

  addMessageWithTypingEffect(content, role) {
    const messageDiv = this.addMessage('', role)
    const textDiv = messageDiv.querySelector('.message-text')

    messageDiv.classList.add('typing-animation')
    textDiv.style.opacity = '1'

    let i = 0
    const characters = content.split('')

    const typeNextChar = () => {
      if (i < characters.length) {
        textDiv.textContent += characters[i]
        i++
        this.scrollToBottom()
        requestAnimationFrame(() => setTimeout(typeNextChar, 15))
      } else {
        messageDiv.classList.remove('typing-animation')
      }
    }

    typeNextChar()
  }

  addLoadingMessage() {
    const messageDiv = document.createElement('div')
    messageDiv.className = 'message'
    messageDiv.id = `loading-${Date.now()}`

    const avatar = document.createElement('div')
    avatar.className = 'message-avatar ai-avatar'
    avatar.textContent = 'AI'

    const contentDiv = document.createElement('div')
    contentDiv.className = 'message-content'

    const roleDiv = document.createElement('div')
    roleDiv.className = 'message-role'

    const settings = this.getCurrentSettings()
    const model = this.formatModelName(settings.model)
    roleDiv.innerHTML = `Assistente <span class="badge">${model}</span>`

    const loadingDiv = document.createElement('div')
    loadingDiv.className = 'loading-dots'
    loadingDiv.innerHTML = '<span></span><span></span><span></span>'

    contentDiv.appendChild(roleDiv)
    contentDiv.appendChild(loadingDiv)

    messageDiv.appendChild(avatar)
    messageDiv.appendChild(contentDiv)

    this.messagesContainerTarget.appendChild(messageDiv)
    this.scrollToBottom()

    return messageDiv.id
  }

  removeLoadingMessage(id) {
    const loadingMessage = document.getElementById(id)
    if (loadingMessage) {
      loadingMessage.remove()
    }
  }

  // Utility Methods
  // ===============

  formatModelName(model) {
    return model
      .replace('gpt-', 'GPT-')
      .replace('claude-', 'Claude ')
      .replace('-', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  scrollToBottom() {
    this.messagesContainerTarget.scrollTop = this.messagesContainerTarget.scrollHeight
  }

  adjustTextareaHeight() {
    const textarea = this.messageInputTarget
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }

  // Suggestions
  // ===========

  sendSuggestion(event) {
    const suggestion = event.currentTarget.dataset.suggestion
    this.messageInputTarget.value = suggestion
    this.adjustTextareaHeight()
    this.messageInputTarget.focus()

    // Add visual feedback
    event.currentTarget.style.transform = 'scale(0.98)'
    setTimeout(() => {
      event.currentTarget.style.transform = ''
    }, 200)
  }

  // Toast Notifications
  // ===================

  showToast(message, type = 'default') {
    this.toastTarget.className = 'toast'
    this.toastTarget.classList.add(type)
    this.toastMessageTarget.textContent = message
    this.toastTarget.setAttribute('aria-hidden', 'false')

    clearTimeout(this.toastTimeout)
    this.toastTimeout = setTimeout(() => {
      this.toastTarget.setAttribute('aria-hidden', 'true')
    }, 3000)
  }

  // Keyboard Handling
  // =================

  handleKeydown(event) {
    // Submit on Enter (without Shift)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      const form = event.target.closest('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Ctrl/Cmd + , to open settings
      if ((event.ctrlKey || event.metaKey) && event.key === ',') {
        event.preventDefault()
        this.toggleSettings(event)
      }

      // ESC to close settings
      if (event.key === 'Escape' && this.settingsPanelTarget.getAttribute('aria-hidden') === 'false') {
        this.closeSettings(event)
      }
    })
  }

  // Click Outside Handler
  // ====================

  setupClickOutsideHandler() {
    document.addEventListener('click', (event) => {
      if (!this.settingsPanelTarget.contains(event.target) &&
        !event.target.closest('[data-action*="toggleSettings"]') &&
        this.settingsPanelTarget.getAttribute('aria-hidden') === 'false') {
        this.settingsPanelTarget.setAttribute('aria-hidden', 'true')
      }
    })
  }

  // Speech Recognition
  // ==================

  initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return
    }

    // Create speech button
    const speechButton = document.createElement('button')
    speechButton.type = 'button'
    speechButton.className = 'btn btn-icon speech-button'
    speechButton.setAttribute('aria-label', 'Usar reconhecimento de voz')
    speechButton.innerHTML = `
      <svg class="icon icon-microphone" aria-hidden="true">
        <use href="#icon-microphone"></use>
      </svg>
    `

    // Insert before send button
    const inputGroup = this.sendButtonTarget.parentElement
    inputGroup.insertBefore(speechButton, this.sendButtonTarget)

    // Setup speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognition()
    this.recognition.lang = 'pt-BR'
    this.recognition.interimResults = false
    this.isListening = false

    // Handle click
    speechButton.addEventListener('click', () => {
      this.toggleSpeechRecognition(speechButton)
    })

    // Handle results
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      this.messageInputTarget.value = transcript
      this.adjustTextareaHeight()

      // Auto submit after speech
      setTimeout(() => {
        this.sendMessage(new Event('submit'))
      }, 500)
    }

    // Handle end
    this.recognition.onend = () => {
      this.isListening = false
      speechButton.classList.remove('listening')
    }

    // Handle errors
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      this.showToast('Erro ao reconhecer voz. Tente novamente.', 'error')
      this.isListening = false
      speechButton.classList.remove('listening')
    }
  }

  toggleSpeechRecognition(button) {
    if (this.isListening) {
      this.recognition.stop()
      this.isListening = false
      button.classList.remove('listening')
    } else {
      this.recognition.start()
      this.isListening = true
      button.classList.add('listening')
      this.showToast('Escutando... Fale sua pergunta', 'default')
    }
  }

  // Lifecycle callbacks
  // ===================

  disconnect() {
    // Clean up timeouts
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout)
    }

    // Stop speech recognition if active
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }
}
