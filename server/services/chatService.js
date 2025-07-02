const ollamaService = require('./ollamaService');

class ChatService {
  constructor() {
    this.model = process.env.OLLAMA_MODEL || 'qwen2.5:0.5b';
  }

  async processMessage(message, context = [], options = {}) {
    try {
      // Delegate to Ollama service
      return await ollamaService.processMessage(message, context, options);
    } catch (error) {
      console.error('Chat processing error:', error);
      throw new Error(`Chat processing failed: ${error.message}`);
    }
  }

  // Get conversation summary
  async getConversationSummary() {
    return await ollamaService.getConversationSummary();
  }

  // Get model information
  getModelInfo() {
    return ollamaService.getModelInfo();
  }

  // Change model
  setModel(model) {
    const availableModels = this.getModelInfo().availableModels;
    if (availableModels.includes(model)) {
      this.model = model;
      ollamaService.model = model;
      return true;
    }
    throw new Error(`Unsupported model: ${model}`);
  }

  // History management - delegate to Ollama service
  getChatHistory(limit = 50, offset = 0) {
    const history = ollamaService.getHistory();
    const start = Math.max(0, history.length - limit - offset);
    const end = history.length - offset;
    return history.slice(start, end);
  }

  clearChatHistory() {
    ollamaService.clearHistory();
    return true;
  }
}

module.exports = new ChatService(); 