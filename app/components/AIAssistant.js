import AIAssistantService from '../services/AIAssistantService.js';

class YuukiAssistant {
  constructor() {
    this.aiService = new AIAssistantService();
    this.aiButton = document.getElementById('ai-assistant-btn');
    this.aiWindow = null;
    this.aiChatMessages = null;
    this.aiInput = null;
    this.aiSendBtn = null;
    this.suggestionBtns = null;
    
    // Check if required DOM elements are present
    if (!this.aiButton) {
      console.error('Yuuki Assistant button not found!');
      return;
    }

    // Initialize the assistant
    this.initialize();
  }

  initialize() {
    // Set up event listeners
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Open window when AI button is clicked
    this.aiButton.addEventListener('click', () => {
      this.openAssistantWindow();
    });
  }
  
  openAssistantWindow() {
    // Check if window is already open
    if (this.aiWindow && !this.aiWindow.closed) {
      this.aiWindow.focus();
      return;
    }
    
    // Get the current window position to position the new window nearby
    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;
    
    // Position window to the right of the extension popup
    const width = 400;
    const height = 600;
    const left = Math.min(window.screenX + 300, screenWidth - width);
    const top = Math.max(window.screenY - 100, 0);
    
    // Open a new window
    this.aiWindow = window.open('', 'aiAssistant', 
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,menubar=no,toolbar=no`);
    
    if (!this.aiWindow) {
      alert('Please allow popups for this extension to use the AI assistant.');
      return;
    }
    
    // Apply styles and content to the new window
    this.setupAssistantWindow();
  }
  
  setupAssistantWindow() {
    // Get reference to the window document
    const doc = this.aiWindow.document;
    
    // Add styles
    const styleEl = doc.createElement('style');
    styleEl.textContent = this.getAssistantStyles();
    doc.head.appendChild(styleEl);
    
    // Set title
    doc.title = 'Yuuki Assistant';
    
    // Create content
    doc.body.innerHTML = `
      <div class="ai-container">
        <div class="ai-header">
          <h2><span class="ai-icon"><i class="material-icons">assistant</i></span> Yuuki</h2>
          <div class="ai-header-actions">
            <button id="ai-clear-history" title="Clear Chat History"><span class="material-icons">delete_outline</span></button>
          </div>
        </div>
        <div class="ai-chat-container">
          <div id="ai-chat-messages" class="ai-chat-messages">
            <div class="ai-message">
              <div class="ai-message-icon"><i class="material-icons">smart_toy</i></div>
              <div class="message-content">
                <p>Hello! I'm Yuuki, your professional assistant dedicated to supporting your virtual assistant work. I'm here to help with task management, email replies, research, scheduling, client communication, and other admin tasks. How can I assist you today?</p>
              </div>
            </div>
          </div>
          <div class="ai-input-container">
            <input type="text" id="ai-input" placeholder="Ask Yuuki anything...">
            <button id="ai-send-btn"><span class="material-icons">send</span></button>
          </div>
          <div class="ai-suggestions">
            <button class="suggestion-btn">📝 Suggest tasks</button>
            <button class="suggestion-btn">⭐ Help me prioritize</button>
            <button class="suggestion-btn">⏱️ Time management tips</button>
          </div>
        </div>
      </div>
    `;
    
    // Get references to elements
    this.aiChatMessages = doc.getElementById('ai-chat-messages');
    this.aiInput = doc.getElementById('ai-input');
    this.aiSendBtn = doc.getElementById('ai-send-btn');
    this.suggestionBtns = doc.querySelectorAll('.suggestion-btn');
    
    // Set up event listeners in the new window
    this.setupWindowEventListeners(doc);
    
    // Load chat history
    this.loadChatHistory();
    
    // Auto focus input
    this.aiInput.focus();
    
    // Add window close handler
    this.aiWindow.addEventListener('beforeunload', () => {
      // Clean up
      this.aiChatMessages = null;
      this.aiInput = null;
      this.aiSendBtn = null;
      this.suggestionBtns = null;
    });
  }
  
  setupWindowEventListeners(doc) {
    // Send message when send button is clicked
    this.aiSendBtn.addEventListener('click', () => {
      this.handleUserMessage();
    });
    
    // Send message when Enter key is pressed
    this.aiInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        this.handleUserMessage();
      }
    });
    
    // Handle suggestion button clicks
    this.suggestionBtns.forEach((btn, index) => {
      btn.addEventListener('click', async () => {
        let query;
        
        if (index === 0) {
          // Suggest tasks
          query = "Suggest tasks for today";
        } else if (index === 1) {
          // Help prioritize
          query = "Help me prioritize";
        } else if (index === 2) {
          // Time management tips
          query = "Time management tips";
        }
        
        this.addUserMessage(query);
        await this.getAIResponse(query);
      });

    });
    
    // Add clear history button listener
    const clearHistoryBtn = doc.getElementById('ai-clear-history');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => {
        this.clearChatHistory();
      });
    }
  }
  
  async handleUserMessage() {
    const message = this.aiInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    this.addUserMessage(message);
    
    // Clear input
    this.aiInput.value = '';
    
    // Get AI response
    await this.getAIResponse(message);
  }
  
  async getAIResponse(message) {
    // Show typing indicator
    this.showTypingIndicator();
    
    try {
      // Process query and get response
      const responses = await this.aiService.processQuery(message);
      
      // Remove typing indicator
      this.removeTypingIndicator();
      
      // Add AI response
      this.addAIMessage(responses[0]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Remove typing indicator
      this.removeTypingIndicator();
      
      // Add error message with useful information
      let errorMessage = "Thank you for your question. I apologize, but I'm encountering a technical issue. ";
      
      if (error.message.includes('API key')) {
        errorMessage += "It seems there's a temporary service interruption. Please try again in a few moments.";
      } else if (error.message.includes('Rate limit')) {
        errorMessage += "We've reached the usage limit for requests at the moment. This is temporary - please try again in a few minutes. Is there anything else I can assist you with in the meantime?";
      } else if (error.message.includes('Network error')) {
        errorMessage += "I'm having trouble connecting to the server. Could you please check your internet connection and try again? I'm ready to help as soon as the connection is restored.";
      } else {
        errorMessage += "I'm unable to process your request at the moment. Please try again shortly. Is there anything else I can help you with in the meantime?";
      }
      
      this.addAIMessage(errorMessage, true);
    }
  }
  
  showTypingIndicator() {
    if (!this.aiChatMessages) return;
    
    const indicatorDiv = this.aiWindow.document.createElement('div');
    indicatorDiv.className = 'ai-message typing-indicator';
    indicatorDiv.innerHTML = `
      <div class="ai-message-icon"><i class="material-icons">smart_toy</i></div>
      <div class="message-content">
        <p><span class="typing-dot">.</span><span class="typing-dot">.</span><span class="typing-dot">.</span></p>
      </div>
    `;
    this.aiChatMessages.appendChild(indicatorDiv);
    this.scrollToBottom();
  }
  
  removeTypingIndicator() {
    if (!this.aiChatMessages) return;
    
    const indicator = this.aiChatMessages.querySelector('.typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }
  
  addUserMessage(message) {
    if (!this.aiChatMessages) return;
    
    const messageDiv = this.aiWindow.document.createElement('div');
    messageDiv.className = 'ai-message user-message';
    messageDiv.innerHTML = `
      <div class="ai-message-icon"><i class="material-icons">person</i></div>
      <div class="message-content">
        <p>${this.escapeHtml(message)}</p>
      </div>
    `;
    this.aiChatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }
  
  addAIMessage(message, isError = false) {
    if (!this.aiChatMessages) return;
    
    const messageDiv = this.aiWindow.document.createElement('div');
    messageDiv.className = 'ai-message';
    
    if (isError) {
      messageDiv.className += ' error-message';
    }
    
    messageDiv.innerHTML = `
      <div class="ai-message-icon"><i class="material-icons">smart_toy</i></div>
      <div class="message-content">
        <p>${this.formatMessage(message)}</p>
      </div>
    `;
    this.aiChatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }
  
  formatMessage(message) {
    // Replace newlines with <br> tags
    return this.escapeHtml(message).replace(/\n/g, '<br>');
  }
  
  escapeHtml(text) {
    const div = this.aiWindow.document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  scrollToBottom() {
    if (this.aiChatMessages) {
      this.aiChatMessages.scrollTop = this.aiChatMessages.scrollHeight;
    }
  }
  
  loadChatHistory() {
    if (!this.aiChatMessages) return;
    
    // Get chat history from service
    const history = this.aiService.getChatHistory();
    
    // Clear chat messages
    this.aiChatMessages.innerHTML = '';
    
    // Add each message to the chat
    history.forEach(message => {
      if (message.role === 'user') {
        this.addUserMessage(message.content);
      } else if (message.role === 'assistant') {
        this.addAIMessage(message.content);
      }
    });
    
    // If no history, add default welcome message
    if (history.length === 0) {
      this.addAIMessage("Hello! I'm Yuuki, your professional assistant dedicated to supporting your virtual assistant work. I'm here to help with task management, email replies, research, scheduling, client communication, and other admin tasks. How can I assist you today?");
    }
  }
  
  clearChatHistory() {
    if (!this.aiChatMessages) return;
    
    // Clear chat history in service
    this.aiService.clearChatHistory();
    
    // Clear chat messages
    this.aiChatMessages.innerHTML = '';
    
    // Add default welcome message
    this.addAIMessage("Chat history has been cleared. I'm Yuuki, your professional assistant ready to support your virtual assistant work. What can I help you with today?");
  }
  
  showApiKeySetup(doc) {
    // Create a dialog for API key setup
    const setupDialog = doc.createElement('div');
    setupDialog.className = 'ai-setup-dialog';
    setupDialog.innerHTML = `
      <div class="ai-setup-content">
        <h3>OpenAI API Setup</h3>
        <p>To use the AI assistant with OpenAI, please enter your API key below:</p>
        <input type="password" id="api-key-input" placeholder="Enter your OpenAI API key" />
        <div class="ai-setup-actions">
          <button id="save-api-key">Save API Key</button>
          <button id="cancel-api-key">Cancel</button>
        </div>
        <p class="api-note">Your API key is stored locally in your browser and is not shared with anyone.</p>
      </div>
    `;
    
    // Add dialog to the window
    doc.body.appendChild(setupDialog);
    
    // Focus on input
    setTimeout(() => {
      const apiKeyInput = doc.getElementById('api-key-input');
      if (apiKeyInput) {
        apiKeyInput.focus();
      }
    }, 100);
    
    // Add event listeners for the dialog buttons
    const saveButton = doc.getElementById('save-api-key');
    const cancelButton = doc.getElementById('cancel-api-key');
    const apiKeyInput = doc.getElementById('api-key-input');
    
    saveButton.addEventListener('click', () => {
      const apiKey = apiKeyInput.value.trim();
      if (apiKey) {
        this.aiService.saveApiKey(apiKey);
        this.removeApiKeySetup(doc);
        this.addAIMessage("API key saved successfully! Now I can provide more intelligent responses.");
      } else {
        apiKeyInput.placeholder = "API key cannot be empty";
        apiKeyInput.classList.add('input-error');
      }
    });
    
    cancelButton.addEventListener('click', () => {
      this.removeApiKeySetup(doc);
    });
    
    // Allow pressing Enter to save
    apiKeyInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        saveButton.click();
      }
    });
  }
  
  removeApiKeySetup(doc) {
    const setupDialog = doc.querySelector('.ai-setup-dialog');
    if (setupDialog) {
      setupDialog.remove();
    }
  }
  
  getAssistantStyles() {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
      @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', sans-serif;
        background-color: #f0f2f5;
        color: #333;
        margin: 0;
        padding: 0;
        line-height: 1.5;
      }
      
      .ai-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        padding: 0;
        overflow: hidden;
      }
      
      .ai-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background-color: #7c4dff;
        color: white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
      }
      
      .ai-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        letter-spacing: -0.5px;
      }
      
      .ai-icon {
        margin-right: 8px;
        font-style: normal;
        display: flex;
        align-items: center;
      }
      
      .ai-header-actions {
        display: flex;
        gap: 10px;
      }
      
      .ai-header-actions button {
        background: rgba(255,255,255,0.15);
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        color: white;
      }
      
      .ai-header-actions button:hover {
        background-color: rgba(255,255,255,0.25);
      }
      
      .material-icons {
        font-size: 20px;
      }
      
      .ai-chat-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }
      
      .ai-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background-color: #f0f2f5;
        scrollbar-width: thin;
      }
      
      .ai-chat-messages::-webkit-scrollbar {
        width: 6px;
      }
      
      .ai-chat-messages::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      
      .ai-chat-messages::-webkit-scrollbar-thumb {
        background: #c5c5c5;
        border-radius: 10px;
      }
      
      .ai-message {
        display: flex;
        margin-bottom: 20px;
        align-items: flex-start;
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .ai-message-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        margin-right: 12px;
        background-color: #7c4dff;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        flex-shrink: 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .message-content {
        background-color: #fff;
        padding: 12px 16px;
        border-radius: 16px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        max-width: 80%;
        border-top-left-radius: 4px;
        color: #2c3e50;
      }
      
      .message-content p {
        margin: 0;
        word-wrap: break-word;
        font-size: 14px;
      }
      
      .user-message {
        flex-direction: row-reverse;
      }
      
      .user-message .ai-message-icon {
        margin-right: 0;
        margin-left: 12px;
        background-color: #3f51b5;
      }
      
      .user-message .message-content {
        background-color: #e7f0ff;
        border-top-left-radius: 16px;
        border-top-right-radius: 4px;
        color: #1a365d;
      }
      
      /* Typing indicator */
      .typing-indicator .typing-dot {
        display: inline-block;
        animation: typingDot 1.4s infinite;
        font-size: 1.2rem;
        line-height: 0.1;
      }
      
      .typing-indicator .typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      .typing-indicator .typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }
      
      @keyframes typingDot {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-5px); }
      }
      
      .ai-input-container {
        display: flex;
        padding: 15px;
        background-color: #fff;
        border-top: 1px solid #e0e0e0;
      }
      
      .ai-input-container input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid #e0e0e0;
        border-radius: 24px;
        font-size: 14px;
        background-color: #f5f5f5;
        transition: all 0.2s ease;
        color: #333;
      }
      
      .ai-input-container input:focus {
        outline: none;
        border-color: #7c4dff;
        background-color: #fff;
        box-shadow: 0 0 0 2px rgba(124, 77, 255, 0.1);
      }
      
      .ai-input-container button {
        background-color: #7c4dff;
        color: white;
        border: none;
        border-radius: 50%;
        width: 42px;
        height: 42px;
        margin-left: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .ai-input-container button:hover {
        background-color: #6945d8;
        transform: scale(1.05);
      }
      
      .ai-suggestions {
        display: flex;
        flex-wrap: nowrap;
        gap: 8px;
        padding: 0 15px 15px;
        background-color: #fff;
        overflow-x: auto;
        scrollbar-width: none;
      }
      
      .ai-suggestions::-webkit-scrollbar {
        display: none;
      }
      
      .suggestion-btn {
        background-color: #f0f0f0;
        color: #555;
        border: none;
        border-radius: 18px;
        padding: 8px 14px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        font-weight: 500;
      }
      
      .suggestion-btn:hover {
        background-color: #e0e0e0;
      }
      
      /* Error message styles */
      .error-message .message-content {
        background-color: #ffefef;
        border-left: 3px solid #ff5252;
        color: #9b2c2c;
      }
      
      .error-message .ai-message-icon {
        background-color: #ff5252;
      }
    `;
  }
}

export default YuukiAssistant; 
