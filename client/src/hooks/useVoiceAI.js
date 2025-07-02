import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

export const useVoiceAI = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [isRecording, setIsRecording] = useState(false);
  
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    socketRef.current = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setConnectionStatus('Connected');
      console.log('Connected to server');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      setConnectionStatus('Disconnected');
      console.log('Disconnected from server');
    });

    socketRef.current.on('connect_error', (error) => {
      setIsConnected(false);
      setConnectionStatus('Connection failed');
      console.error('Connection error:', error);
      toast.error('Failed to connect to server');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];

      // Create MediaRecorder with fallback for unsupported formats
      let mediaRecorder;
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav'
      ];
      
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          console.log('Using MIME type:', mimeType);
          mediaRecorder = new MediaRecorder(stream, { mimeType });
          break;
        }
      }
      
      if (!mediaRecorder) {
        console.log('No supported MIME type found, using default');
        mediaRecorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          console.log('MediaRecorder stopped, processing audio...');
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
          console.log('Audio blob created:', audioBlob.size, 'bytes, type:', audioBlob.type);
          const result = await processAudioBlob(audioBlob);
          // Store the result so it can be returned by stopRecording
          audioChunksRef.current.result = result;
        } catch (error) {
          console.error('Error in mediaRecorder.onstop:', error);
          audioChunksRef.current.result = { error: error.message };
        }
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to access microphone');
      throw error;
    }
  };

  const stopRecording = async () => {
    try {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        console.log('Recording stopped');
        
        // Wait for the onstop event to complete and return the result
        return new Promise((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = 50; // 5 seconds timeout
          
          const checkResult = () => {
            attempts++;
            if (audioChunksRef.current.result) {
              const result = audioChunksRef.current.result;
              audioChunksRef.current.result = null; // Clear the result
              resolve(result);
            } else if (attempts >= maxAttempts) {
              reject(new Error('Audio processing timeout'));
            } else {
              setTimeout(checkResult, 100); // Check again in 100ms
            }
          };
          checkResult();
        });
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      throw error;
    }
  };

  const processAudioBlob = async (audioBlob) => {
    try {
      console.log('Processing audio blob:', audioBlob.size, 'bytes');
      
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      console.log('Converted to base64, length:', base64Audio.length);

      // Determine the format from the blob
      const format = audioBlob.type.split('/')[1]?.split(';')[0] || 'webm';
      console.log('Audio format detected:', format);
      
      // Send to server for speech-to-text
      const response = await fetch('/api/speech/to-text-base64', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: base64Audio,
          format: format
        })
      });

      console.log('Speech-to-text response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Speech-to-text failed:', errorText);
        throw new Error(`Speech-to-text failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Speech-to-text result:', result);
      return result;
    } catch (error) {
      console.error('Audio processing error:', error);
      toast.error('Failed to process audio');
      throw error;
    }
  };

  const sendMessage = async (message) => {
    try {
      // Get user settings
      const settings = JSON.parse(localStorage.getItem('voiceAI-settings') || '{}');
      
      // Send message to AI
      const chatResponse = await fetch('/api/chat/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          options: {
            maxTokens: settings.maxTokens || 1000,
            temperature: settings.temperature || 0.7
          }
        })
      });

      if (!chatResponse.ok) {
        throw new Error('Chat processing failed');
      }

      const chatResult = await chatResponse.json();

      // Convert AI response to speech
      const ttsResponse = await fetch('/api/tts/speak-base64', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: chatResult.response.message,
          voice: settings.voice || 'alloy',
          format: 'mp3'
        })
      });

      if (!ttsResponse.ok) {
        throw new Error('Text-to-speech failed');
      }

      const ttsResult = await ttsResponse.json();

      return {
        message: chatResult.response.message,
        audioUrl: ttsResult.audioData,
        format: ttsResult.format
      };
    } catch (error) {
      console.error('Message processing error:', error);
      toast.error('Failed to process message');
      throw error;
    }
  };

  const sendAudioStream = async (audioData) => {
    try {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('audio-stream', audioData);
      }
    } catch (error) {
      console.error('Audio stream error:', error);
      throw error;
    }
  };

  const sendChatMessage = async (message) => {
    try {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('chat-message', message);
      }
    } catch (error) {
      console.error('Chat message error:', error);
      throw error;
    }
  };

  return {
    isConnected,
    connectionStatus,
    isRecording,
    startRecording,
    stopRecording,
    sendMessage,
    sendAudioStream,
    sendChatMessage
  };
}; 