const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class TTSService {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    this.ensureTempDir();
    this.defaultVoice = process.env.TTS_VOICE || 'alloy';
    this.defaultFormat = 'mp3';
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async textToSpeech(text, voice = 'alloy', format = 'mp3') {
    try {
      // Validate input
      if (!text || typeof text !== 'string') {
        throw new Error('Valid text is required');
      }

      if (text.length > 4000) {
        throw new Error('Text too long (max 4000 characters)');
      }

      // Validate voice
      const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
      if (!validVoices.includes(voice)) {
        voice = this.defaultVoice;
      }

      // Validate format
      const validFormats = ['mp3', 'opus', 'aac', 'flac'];
      if (!validFormats.includes(format)) {
        format = this.defaultFormat;
      }

      // Create temporary file path
      const tempFile = path.join(this.tempDir, `${uuidv4()}.${format}`);

      // Generate speech using OpenAI TTS
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: text,
        response_format: format
      });

      // Convert to buffer
      const buffer = Buffer.from(await mp3.arrayBuffer());

      // Write to temporary file
      fs.writeFileSync(tempFile, buffer);

      // Read the file back as buffer
      const audioBuffer = fs.readFileSync(tempFile);

      // Clean up temporary file
      fs.unlinkSync(tempFile);

      return audioBuffer;
    } catch (error) {
      console.error('Text-to-speech error:', error);
      throw new Error(`Text-to-speech failed: ${error.message}`);
    }
  }

  async textToSpeechStream(text, voice = 'alloy', format = 'mp3') {
    try {
      // Validate input
      if (!text || typeof text !== 'string') {
        throw new Error('Valid text is required');
      }

      if (text.length > 4000) {
        throw new Error('Text too long (max 4000 characters)');
      }

      // Validate voice
      const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
      if (!validVoices.includes(voice)) {
        voice = this.defaultVoice;
      }

      // Validate format
      const validFormats = ['mp3', 'opus', 'aac', 'flac'];
      if (!validFormats.includes(format)) {
        format = this.defaultFormat;
      }

      // Generate speech using OpenAI TTS
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: text,
        response_format: format
      });

      // Return as stream
      return mp3.body;
    } catch (error) {
      console.error('Text-to-speech stream error:', error);
      throw new Error(`Text-to-speech failed: ${error.message}`);
    }
  }

  async textToSpeechFile(text, voice = 'alloy', format = 'mp3', outputPath = null) {
    try {
      // Validate input
      if (!text || typeof text !== 'string') {
        throw new Error('Valid text is required');
      }

      if (text.length > 4000) {
        throw new Error('Text too long (max 4000 characters)');
      }

      // Generate file path
      const fileName = outputPath || `${uuidv4()}.${format}`;
      const filePath = path.join(this.tempDir, fileName);

      // Generate speech using OpenAI TTS
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: text,
        response_format: format
      });

      // Convert to buffer
      const buffer = Buffer.from(await mp3.arrayBuffer());

      // Write to file
      fs.writeFileSync(filePath, buffer);

      return {
        filePath: filePath,
        fileName: fileName,
        size: buffer.length,
        format: format
      };
    } catch (error) {
      console.error('Text-to-speech file error:', error);
      throw new Error(`Text-to-speech failed: ${error.message}`);
    }
  }

  // Get available voices
  getAvailableVoices() {
    return [
      { id: 'alloy', name: 'Alloy', gender: 'neutral', description: 'Balanced and versatile' },
      { id: 'echo', name: 'Echo', gender: 'male', description: 'Deep and resonant' },
      { id: 'fable', name: 'Fable', gender: 'male', description: 'Warm and engaging' },
      { id: 'onyx', name: 'Onyx', gender: 'male', description: 'Strong and authoritative' },
      { id: 'nova', name: 'Nova', gender: 'female', description: 'Bright and energetic' },
      { id: 'shimmer', name: 'Shimmer', gender: 'female', description: 'Soft and melodic' }
    ];
  }

  // Get supported formats
  getSupportedFormats() {
    return [
      { id: 'mp3', name: 'MP3', description: 'Compressed audio format' },
      { id: 'opus', name: 'Opus', description: 'High-quality compressed format' },
      { id: 'aac', name: 'AAC', description: 'Advanced audio coding' },
      { id: 'flac', name: 'FLAC', description: 'Lossless audio format' }
    ];
  }

  // Validate voice
  validateVoice(voice) {
    const voices = this.getAvailableVoices();
    return voices.some(v => v.id === voice);
  }

  // Validate format
  validateFormat(format) {
    const formats = this.getSupportedFormats();
    return formats.some(f => f.id === format);
  }

  // Get service status
  getServiceStatus() {
    return {
      status: 'operational',
      service: 'OpenAI TTS',
      defaultVoice: this.defaultVoice,
      defaultFormat: this.defaultFormat,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new TTSService(); 