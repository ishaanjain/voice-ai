const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class SpeechService {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    this.ensureTempDir();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async speechToText(audioBuffer) {
    try {
      // Create temporary file
      const tempFile = path.join(this.tempDir, `${uuidv4()}.wav`);
      const convertedFile = path.join(this.tempDir, `${uuidv4()}.mp3`);
      
      // Write audio buffer to file
      fs.writeFileSync(tempFile, audioBuffer);

      // Convert to MP3 format that Whisper can handle
      await this.convertToMp3(tempFile, convertedFile);

      // Transcribe using OpenAI Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(convertedFile),
        model: "whisper-1",
        response_format: "text",
        language: "en"
      });

      // Clean up temporary files
      try {
        fs.unlinkSync(tempFile);
        fs.unlinkSync(convertedFile);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp files:', cleanupError);
      }

      return transcription;
    } catch (error) {
      console.error('Speech-to-text error:', error);
      throw new Error(`Speech-to-text failed: ${error.message}`);
    }
  }

  async speechToTextFromBase64(audioData, format = 'webm') {
    try {
      // Decode base64 audio data
      const audioBuffer = Buffer.from(audioData, 'base64');
      
      // Create temporary file with proper extension
      const tempFile = path.join(this.tempDir, `${uuidv4()}.${format}`);
      const convertedFile = path.join(this.tempDir, `${uuidv4()}.mp3`);
      
      // Write audio buffer to file
      fs.writeFileSync(tempFile, audioBuffer);

      // Convert to MP3 format that Whisper can handle
      await this.convertToMp3(tempFile, convertedFile);

      // Transcribe using OpenAI Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(convertedFile),
        model: "whisper-1",
        response_format: "text",
        language: "en"
      });

      // Clean up temporary files
      try {
        fs.unlinkSync(tempFile);
        fs.unlinkSync(convertedFile);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp files:', cleanupError);
      }

      return transcription;
    } catch (error) {
      console.error('Speech-to-text from base64 error:', error);
      throw new Error(`Speech-to-text failed: ${error.message}`);
    }
  }

  async speechToTextFromFile(filePath) {
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
        response_format: "text",
        language: "en"
      });

      return transcription;
    } catch (error) {
      console.error('Speech-to-text from file error:', error);
      throw new Error(`Speech-to-text failed: ${error.message}`);
    }
  }

  // Get supported audio formats
  getSupportedFormats() {
    return [
      'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'
    ];
  }

  // Validate audio format
  validateFormat(format) {
    const supportedFormats = this.getSupportedFormats();
    return supportedFormats.includes(format.toLowerCase());
  }

  // Convert audio to MP3 format
  convertToMp3(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputFile)
        .toFormat('mp3')
        .audioCodec('libmp3lame')
        .audioChannels(1)
        .audioFrequency(16000)
        .on('end', () => {
          console.log('Audio conversion completed');
          resolve();
        })
        .on('error', (err) => {
          console.error('Audio conversion error:', err);
          reject(err);
        })
        .save(outputFile);
    });
  }
}

module.exports = new SpeechService(); 