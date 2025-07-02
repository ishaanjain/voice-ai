const express = require('express');
const multer = require('multer');
const router = express.Router();
const speechService = require('../services/speechService');

// Configure multer for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

// Convert speech to text from audio file
router.post('/to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioBuffer = req.file.buffer;
    const text = await speechService.speechToText(audioBuffer);
    
    res.json({ 
      success: true, 
      text: text,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({ 
      error: 'Speech-to-text processing failed',
      details: error.message 
    });
  }
});

// Convert speech to text from base64 audio data
router.post('/to-text-base64', async (req, res) => {
  try {
    const { audioData, format = 'webm' } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ error: 'No audio data provided' });
    }

    const text = await speechService.speechToTextFromBase64(audioData, format);
    
    res.json({ 
      success: true, 
      text: text,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({ 
      error: 'Speech-to-text processing failed',
      details: error.message 
    });
  }
});

// Get supported audio formats
router.get('/formats', (req, res) => {
  res.json({
    supportedFormats: [
      'mp3', 'wav', 'webm', 'ogg', 'm4a', 'flac'
    ],
    maxFileSize: '10MB',
    sampleRates: [8000, 16000, 22050, 44100, 48000]
  });
});

module.exports = router; 