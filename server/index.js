const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const speechRoutes = require('./routes/speech');
const chatRoutes = require('./routes/chat');
const ttsRoutes = require('./routes/tts');

// API Routes
app.use('/api/speech', speechRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tts', ttsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle audio stream
  socket.on('audio-stream', async (data) => {
    try {
      // Process audio data
      const audioService = require('./services/audioService');
      const result = await audioService.processAudioStream(data);
      
      // Send processed result back to client
      socket.emit('audio-processed', result);
    } catch (error) {
      console.error('Audio processing error:', error);
      socket.emit('error', { message: 'Audio processing failed' });
    }
  });

  // Handle chat messages
  socket.on('chat-message', async (message) => {
    try {
      const chatService = require('./services/chatService');
      const response = await chatService.processMessage(message);
      
      socket.emit('chat-response', response);
    } catch (error) {
      console.error('Chat processing error:', error);
      socket.emit('error', { message: 'Chat processing failed' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = { app, server, io }; 