const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');

// Process text message with AI
router.post('/process', async (req, res) => {
  try {
    const { message, context = [], options = {} } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Valid message is required' });
    }

    const response = await chatService.processMessage(message, context, options);
    
    res.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({
      error: 'Chat processing failed',
      details: error.message
    });
  }
});

// Get chat history
router.get('/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const history = await chatService.getChatHistory(parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      history: history,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      error: 'Failed to retrieve chat history',
      details: error.message
    });
  }
});

// Clear chat history
router.delete('/history', async (req, res) => {
  try {
    await chatService.clearChatHistory();
    
    res.json({
      success: true,
      message: 'Chat history cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({
      error: 'Failed to clear chat history',
      details: error.message
    });
  }
});

// Get AI model information
router.get('/model-info', (req, res) => {
  res.json({
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: 4096,
    temperature: 0.7,
    availableModels: [
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'gpt-4',
      'gpt-4-turbo'
    ]
  });
});

module.exports = router; 