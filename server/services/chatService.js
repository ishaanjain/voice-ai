const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class ChatService {
  constructor() {
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.conversationHistory = [];
    this.maxHistoryLength = 100;
  }

  async processMessage(message, context = [], options = {}) {
    try {
      // Build conversation context
      const messages = this.buildConversationContext(message, context);
      
      // Prepare API request
      const requestOptions = {
        model: this.model,
        messages: messages,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 1,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0,
        stream: false
      };

      // Get response from OpenAI
      const completion = await openai.chat.completions.create(requestOptions);
      
      const response = completion.choices[0].message.content;
      
      // Add to conversation history
      this.addToHistory({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });
      
      this.addToHistory({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      });

      return {
        message: response,
        model: this.model,
        usage: completion.usage,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Chat processing error:', error);
      throw new Error(`Chat processing failed: ${error.message}`);
    }
  }

  buildConversationContext(message, context = []) {
    const messages = [
      {
        role: 'system',
        content: this.getSystemPrompt()
      }
    ];

    // Add context messages if provided
    if (context.length > 0) {
      messages.push(...context);
    }

    // Add recent conversation history
    const recentHistory = this.conversationHistory.slice(-10);
    messages.push(...recentHistory.map(item => ({
      role: item.role,
      content: item.content
    })));

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    return messages;
  }

  getSystemPrompt() {
    return `You are a helpful AI voice assistant. You should:

1. Provide clear, concise, and helpful responses
2. Be conversational and natural in your tone
3. Keep responses reasonably short for voice interaction
4. Be informative and accurate
5. Show empathy and understanding
6. Ask clarifying questions when needed
7. Provide actionable advice when appropriate

Remember that users are interacting with you through voice, so keep responses conversational and easy to understand when spoken aloud.`;
  }

  addToHistory(message) {
    this.conversationHistory.push(message);
    
    // Keep history within limits
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  getChatHistory(limit = 50, offset = 0) {
    const start = Math.max(0, this.conversationHistory.length - limit - offset);
    const end = this.conversationHistory.length - offset;
    return this.conversationHistory.slice(start, end);
  }

  clearChatHistory() {
    this.conversationHistory = [];
    return true;
  }

  // Get conversation summary
  async getConversationSummary() {
    if (this.conversationHistory.length === 0) {
      return "No conversation history available.";
    }

    try {
      const summary = await this.processMessage(
        "Please provide a brief summary of our conversation so far.",
        [],
        { maxTokens: 200, temperature: 0.3 }
      );
      
      return summary.message;
    } catch (error) {
      console.error('Summary generation error:', error);
      return "Unable to generate conversation summary.";
    }
  }

  // Get model information
  getModelInfo() {
    return {
      model: this.model,
      maxHistoryLength: this.maxHistoryLength,
      currentHistoryLength: this.conversationHistory.length,
      availableModels: [
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k',
        'gpt-4',
        'gpt-4-turbo'
      ]
    };
  }

  // Change model
  setModel(model) {
    const availableModels = this.getModelInfo().availableModels;
    if (availableModels.includes(model)) {
      this.model = model;
      return true;
    }
    throw new Error(`Unsupported model: ${model}`);
  }
}

module.exports = new ChatService(); 