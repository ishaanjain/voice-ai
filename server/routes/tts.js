const express = require('express');
const router = express.Router();
const ttsService = require('../services/ttsService');

// Convert text to speech
router.post('/speak', async (req, res) => {
  try {
    const { text, voice = 'alloy', format = 'mp3' } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Valid text is required' });
    }

    if (text.length > 4000) {
      return res.status(400).json({ error: 'Text too long (max 4000 characters)' });
    }

    const audioBuffer = await ttsService.textToSpeech(text, voice, format);
    
    // Set appropriate headers for audio response
    res.set({
      'Content-Type': `audio/${format}`,
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'no-cache'
    });
    
    res.send(audioBuffer);
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({
      error: 'Text-to-speech processing failed',
      details: error.message
    });
  }
});

// Convert text to speech and return base64
router.post('/speak-base64', async (req, res) => {
  try {
    const { text, voice = 'alloy', format = 'mp3' } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Valid text is required' });
    }

    if (text.length > 4000) {
      return res.status(400).json({ error: 'Text too long (max 4000 characters)' });
    }

    const audioBuffer = await ttsService.textToSpeech(text, voice, format);
    const base64Audio = audioBuffer.toString('base64');
    
    res.json({
      success: true,
      audioData: base64Audio,
      format: format,
      size: audioBuffer.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({
      error: 'Text-to-speech processing failed',
      details: error.message
    });
  }
});

// Get available voices
router.get('/voices', (req, res) => {
  res.json({
    voices: [
      { id: 'alloy', name: 'Alloy', gender: 'neutral' },
      { id: 'echo', name: 'Echo', gender: 'male' },
      { id: 'fable', name: 'Fable', gender: 'male' },
      { id: 'onyx', name: 'Onyx', gender: 'male' },
      { id: 'nova', name: 'Nova', gender: 'female' },
      { id: 'shimmer', name: 'Shimmer', gender: 'female' }
    ],
    defaultVoice: 'alloy',
    supportedFormats: ['mp3', 'opus', 'aac', 'flac']
  });
});

// Get TTS service status
router.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    service: 'OpenAI TTS',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 