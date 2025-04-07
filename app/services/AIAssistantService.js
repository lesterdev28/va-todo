class AIAssistantService {
  constructor() {
    // Default API key
    this.apiKey = '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';
    
    this.suggestions = {
      tasks: [
        "Review client emails",
        "Schedule social media posts",
        "Organize virtual meeting",
        "Update client database",
        "Research industry trends",
        "Prepare weekly report",
        "Follow up with clients",
        "Update task tracking sheet"
      ],
      priorities: [
        "Focus on urgent client deadlines first",
        "Group similar tasks together for efficiency",
        "Schedule complex tasks during your peak productivity hours",
        "Break large projects into smaller, manageable tasks",
        "Use the 1-3-5 rule: 1 big thing, 3 medium things, 5 small things"
      ],
      timeManagement: [
        "Use the Pomodoro technique: 25 minutes of focused work, then a 5-minute break",
        "Block time on your calendar for focused work",
        "Process emails in batches rather than continuously",
        "Set clear boundaries for client communication hours",
        "Plan tomorrow's tasks at the end of each day"
      ]
    };
    
    // Load API key from storage if available, but keep default if none stored
    this.loadApiKey();
    
    // Chat history storage
    this.chatHistory = [];
    this.loadChatHistory();
  }
  
  loadApiKey() {
    // Try to get API key from local storage, but only if it exists
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey && savedApiKey !== 'null' && savedApiKey !== 'undefined') {
      this.apiKey = savedApiKey;
      console.log('API key loaded from storage');
    } else {
      // If no valid key in storage, save the default key
      localStorage.setItem('openai_api_key', this.apiKey);
      console.log('Default API key saved to storage');
    }
  }
  
  saveApiKey(apiKey) {
    this.apiKey = apiKey;
    localStorage.setItem('openai_api_key', apiKey);
    console.log('API key saved to storage');
    return true;
  }
  
  hasApiKey() {
    return !!this.apiKey;
  }
  
  loadChatHistory() {
    const savedHistory = localStorage.getItem('ai_chat_history');
    if (savedHistory) {
      try {
        this.chatHistory = JSON.parse(savedHistory);
        console.log('Chat history loaded from storage');
      } catch (e) {
        console.error('Failed to parse chat history', e);
        this.chatHistory = [];
      }
    }
  }
  
  saveChatHistory() {
    // Keep only the last 20 messages to avoid storage limits
    if (this.chatHistory.length > 20) {
      this.chatHistory = this.chatHistory.slice(-20);
    }
    localStorage.setItem('ai_chat_history', JSON.stringify(this.chatHistory));
  }
  
  addMessageToHistory(role, content) {
    this.chatHistory.push({ role, content, timestamp: new Date().toISOString() });
    this.saveChatHistory();
  }
  
  getChatHistory() {
    return this.chatHistory;
  }
  
  clearChatHistory() {
    this.chatHistory = [];
    localStorage.removeItem('ai_chat_history');
    return true;
  }

  async processQuery(query) {
    // Add user message to history
    this.addMessageToHistory('user', query);
    
    if (!this.hasApiKey()) {
      // If no API key, use fallback responses
      return this.processQueryWithFallback(query);
    }
    
    try {
      const response = await this.callOpenAIAPI(query);
      // Add AI response to history
      this.addMessageToHistory('assistant', response);
      return [response];
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      // Fallback to predefined responses on error
      const fallbackResponse = "I'm having trouble connecting to OpenAI. Here's a helpful tip: " + 
        this.getRandomSuggestions(this.suggestions.timeManagement, 1)[0];
      this.addMessageToHistory('assistant', fallbackResponse);
      return [fallbackResponse];
    }
  }
  
  processQueryWithFallback(query) {
    query = query.toLowerCase().trim();
    
    let response;
    
    // Check for task suggestions
    if (query.includes("suggest task") || query.includes("task idea") || query.includes("what should i do")) {
      response = "I understand you're looking for task suggestions. Here are some ideas that might be helpful for your workflow:\n\n" + 
        this.getRandomSuggestions(this.suggestions.tasks, 3).join('\n\n') + 
        "\n\nWould you like me to suggest any specific types of tasks, or can I help with anything else?";
    }
    // Check for prioritization help
    else if (query.includes("prioritize") || query.includes("what first") || query.includes("most important")) {
      response = "Got it! You're asking about prioritization. Here are some effective strategies that many VAs find helpful:\n\n" + 
        this.getRandomSuggestions(this.suggestions.priorities, 2).join('\n\n') + 
        "\n\nIs there a specific project or task list you're working on that I can help you prioritize? Or anything else you'd like assistance with?";
    }
    // Check for time management tips
    else if (query.includes("time management") || query.includes("productivity") || query.includes("efficient")) {
      response = "Let me help you with that. These time management techniques have proven effective for many professionals:\n\n" + 
        this.getRandomSuggestions(this.suggestions.timeManagement, 2).join('\n\n') + 
        "\n\nWould you like more specific advice for your particular workflow, or can I help with something else?";
    }
    // Default response
    else {
      const defaultResponses = [
        "I understand you reached out for assistance. I'm here to help with your virtual assistant work, including task management, email writing, scheduling, client communications, and more. What specific aspect can I assist you with today?",
        "Got it! I'm ready to support you with anything from task tracking to client communications and scheduling. What kind of assistance do you need right now?",
        "Let me help you with that. I can assist with email drafting, task organization, scheduling, light research, or any other administrative needs. What would you like help with specifically?"
      ];
      response = this.getRandomSuggestions(defaultResponses, 1)[0];
    }
    
    // Add AI response to history
    this.addMessageToHistory('assistant', response);
    return [response];
  }
  
  async callOpenAIAPI(query) {
    const systemMessage = `You are a professional and human-like AI assistant named Yuuki that supports virtual assistants in managing day-to-day tasks efficiently. 

IMPORTANT: You must ALWAYS acknowledge EVERY question or request first before providing any answer, just as a real person would. Start each response with a natural acknowledgment such as "I understand,' 'Got it,' or 'Let me help you with that. and etc...". Your tone should be helpful, respectful, and supportive, just like a reliable teammate. You can assist with task management, email replies, research, scheduling, client communication, and other admin tasks.

After acknowledging, provide thoughtful, clear, and efficient solutions, and always close by asking if they need anything else or would like another opinion.`;

    const messages = [
      { role: 'system', content: systemMessage }
    ];
    
    // Include the entire chat history for better context
    // Previously limited to only 5 messages
    messages.push(...this.chatHistory.map(msg => ({ role: msg.role, content: msg.content })));
    
    // Add the current query
    messages.push({ role: 'user', content: query });
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 1024, // Updated to 1024 tokens for more comprehensive responses
          temperature: 0.7
        }),
        mode: 'cors' // Enable CORS for browser extension
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        console.error('OpenAI API error:', errorData);
        
        // Handle specific error codes
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your API key and try again.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 500) {
          throw new Error('OpenAI server error. Please try again later.');
        } else {
          throw new Error(errorData.error?.message || 'Failed to get response from OpenAI');
        }
      }
      
      const data = await response.json();
      
      if (!data.choices || !data.choices.length) {
        throw new Error('Invalid response from OpenAI API');
      }
      
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error in OpenAI API call:', error);
      
      // Check if it's a network error (CORS or connection issue)
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      throw error; // Re-throw for handling in the calling code
    }
  }
  
  getRandomSuggestions(array, count) {
    if (array.length <= count) {
      return array;
    }
    
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  getSuggestedTasks() {
    return this.getRandomSuggestions(this.suggestions.tasks, 3);
  }
  
  getPrioritizationTips() {
    return this.getRandomSuggestions(this.suggestions.priorities, 2);
  }
  
  getTimeManagementTips() {
    return this.getRandomSuggestions(this.suggestions.timeManagement, 2);
  }
}

export default AIAssistantService; 