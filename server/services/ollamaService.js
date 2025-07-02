const { Ollama } = require('ollama');

class OllamaService {
  constructor() {
    this.ollama = new Ollama({
      host: process.env.OLLAMA_HOST || 'http://localhost:11434'
    });
    this.model = process.env.OLLAMA_MODEL || 'qwen2.5:0.5b';
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
        options: {
          num_predict: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 1,
          repeat_penalty: options.frequencyPenalty || 1.1,
          top_k: options.topK || 40
        },
        stream: false
      };

      // Get response from Ollama
      const completion = await this.ollama.chat(requestOptions);
      
      const response = completion.message.content;
      
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
        usage: {
          prompt_tokens: completion.prompt_eval_count || 0,
          completion_tokens: completion.eval_count || 0,
          total_tokens: (completion.prompt_eval_count || 0) + (completion.eval_count || 0)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Ollama chat processing error:', error);
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
    
    // Maintain history length limit
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getHistory() {
    return [...this.conversationHistory];
  }

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

  getModelInfo() {
    return {
      model: this.model,
      maxHistoryLength: this.maxHistoryLength,
      currentHistoryLength: this.conversationHistory.length,
      availableModels: [
        'tinyllama',
        'phi2',
        'qwen2.5:0.5b',
        'llama2',
        'llama2:7b',
        'llama2:13b',
        'mistral',
        'mistral:7b',
        'codellama',
        'codellama:7b'
      ]
    };
  }

  async listModels() {
    try {
      const models = await this.ollama.list();
      return models.models || [];
    } catch (error) {
      console.error('Error listing Ollama models:', error);
      return [];
    }
  }

  async checkModelAvailability(modelName = null) {
    try {
      const model = modelName || this.model;
      const models = await this.listModels();
      return models.some(m => m.name === model);
    } catch (error) {
      console.error('Error checking model availability:', error);
      return false;
    }
  }
}

module.exports = new OllamaService(); 