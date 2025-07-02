const speechService = require('./speechService');
const chatService = require('./chatService');
const ttsService = require('./ttsService');

class AudioService {
  constructor() {
    this.isProcessing = false;
    this.audioQueue = [];
    this.processingInterval = null;
  }

  async processAudioStream(audioData) {
    try {
      // Add audio data to queue
      this.audioQueue.push(audioData);
      
      // Start processing if not already running
      if (!this.isProcessing) {
        this.startProcessing();
      }

      return { status: 'queued', queueLength: this.audioQueue.length };
    } catch (error) {
      console.error('Audio stream processing error:', error);
      throw new Error(`Audio stream processing failed: ${error.message}`);
    }
  }

  startProcessing() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.processingInterval = setInterval(async () => {
      await this.processQueue();
    }, 100); // Process every 100ms
  }

  stopProcessing() {
    this.isProcessing = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  async processQueue() {
    if (this.audioQueue.length === 0) {
      this.stopProcessing();
      return;
    }

    const audioData = this.audioQueue.shift();
    
    try {
      // Process the audio data
      const result = await this.processAudioChunk(audioData);
      return result;
    } catch (error) {
      console.error('Queue processing error:', error);
      return { error: error.message };
    }
  }

  async processAudioChunk(audioData) {
    try {
      // Step 1: Convert speech to text
      const text = await speechService.speechToTextFromBase64(
        audioData.data, 
        audioData.format || 'webm'
      );

      if (!text || text.trim().length === 0) {
        return { status: 'no_speech_detected' };
      }

      // Step 2: Process with AI
      const aiResponse = await chatService.processMessage(text);

      // Step 3: Convert AI response to speech
      const audioBuffer = await ttsService.textToSpeech(
        aiResponse.message,
        audioData.voice || 'alloy',
        audioData.format || 'mp3'
      );

      return {
        status: 'success',
        originalText: text,
        aiResponse: aiResponse.message,
        audioData: audioBuffer.toString('base64'),
        format: audioData.format || 'mp3',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Audio chunk processing error:', error);
      throw new Error(`Audio chunk processing failed: ${error.message}`);
    }
  }

  async processCompleteAudio(audioBuffer, options = {}) {
    try {
      // Step 1: Convert speech to text
      const text = await speechService.speechToText(audioBuffer);

      if (!text || text.trim().length === 0) {
        return { status: 'no_speech_detected' };
      }

      // Step 2: Process with AI
      const aiResponse = await chatService.processMessage(text, [], options);

      // Step 3: Convert AI response to speech
      const responseAudio = await ttsService.textToSpeech(
        aiResponse.message,
        options.voice || 'alloy',
        options.format || 'mp3'
      );

      return {
        status: 'success',
        originalText: text,
        aiResponse: aiResponse.message,
        audioBuffer: responseAudio,
        format: options.format || 'mp3',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Complete audio processing error:', error);
      throw new Error(`Complete audio processing failed: ${error.message}`);
    }
  }

  // Get service status
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      queueLength: this.audioQueue.length,
      timestamp: new Date().toISOString()
    };
  }

  // Clear audio queue
  clearQueue() {
    this.audioQueue = [];
    return { status: 'queue_cleared' };
  }

  // Get supported audio formats
  getSupportedFormats() {
    return speechService.getSupportedFormats();
  }

  // Validate audio format
  validateFormat(format) {
    return speechService.validateFormat(format);
  }

  // Get processing statistics
  getStatistics() {
    return {
      queueLength: this.audioQueue.length,
      isProcessing: this.isProcessing,
      supportedFormats: this.getSupportedFormats(),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new AudioService(); 