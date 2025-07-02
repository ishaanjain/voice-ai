# AI Voice Agent - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key
- Microphone access
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository** (if not already done)
   ```bash
   git clone <your-repo-url>
   cd voice-ai
   ```

2. **Run the installation script**
   ```bash
   ./install.sh
   ```
   
   Or manually install dependencies:
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3001
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `OPENAI_MODEL` | AI model to use | gpt-3.5-turbo |
| `TTS_VOICE` | Default TTS voice | alloy |

### Available AI Models
- `gpt-3.5-turbo` (default, fast, cost-effective)
- `gpt-3.5-turbo-16k` (longer conversations)
- `gpt-4` (more capable, higher cost)
- `gpt-4-turbo` (latest GPT-4 model)

### Available TTS Voices
- `alloy` (neutral, balanced)
- `echo` (male, deep)
- `fable` (male, warm)
- `onyx` (male, authoritative)
- `nova` (female, energetic)
- `shimmer` (female, melodic)

## 🎤 Usage

### Voice Recording
1. Click the microphone button to start recording
2. Speak your question or command
3. Click again to stop recording
4. Wait for AI processing and response

### Text Input
1. Type your message in the chat input
2. Press Enter or click Send
3. Receive AI response with audio playback

### Settings
- Click the settings icon to configure:
  - TTS voice selection
  - AI model selection
  - Temperature (creativity vs focus)
  - Max tokens (response length)

## 🏗️ Project Structure

```
voice-ai/
├── server/                 # Backend server
│   ├── index.js           # Main server file
│   ├── routes/            # API routes
│   │   ├── speech.js      # Speech-to-text endpoints
│   │   ├── chat.js        # AI chat endpoints
│   │   └── tts.js         # Text-to-speech endpoints
│   └── services/          # Business logic
│       ├── speechService.js
│       ├── chatService.js
│       ├── ttsService.js
│       └── audioService.js
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   └── App.js         # Main app component
│   └── public/            # Static files
├── package.json           # Server dependencies
├── client/package.json    # Client dependencies
└── README.md             # Project documentation
```

## 🔌 API Endpoints

### Speech-to-Text
- `POST /api/speech/to-text` - Convert audio file to text
- `POST /api/speech/to-text-base64` - Convert base64 audio to text
- `GET /api/speech/formats` - Get supported audio formats

### AI Chat
- `POST /api/chat/process` - Process text message with AI
- `GET /api/chat/history` - Get chat history
- `DELETE /api/chat/history` - Clear chat history
- `GET /api/chat/model-info` - Get AI model information

### Text-to-Speech
- `POST /api/tts/speak` - Convert text to speech (audio response)
- `POST /api/tts/speak-base64` - Convert text to speech (base64)
- `GET /api/tts/voices` - Get available voices
- `GET /api/tts/status` - Get TTS service status

### Health Check
- `GET /api/health` - Server health status

## 🛠️ Development

### Running in Development
```bash
npm run dev          # Start both server and client
npm run server       # Start server only
npm run client       # Start client only
```

### Building for Production
```bash
npm run build        # Build client for production
npm start           # Start production server
```

### Environment Variables for Development
```bash
NODE_ENV=development
OPENAI_API_KEY=your_key_here
PORT=3001
```

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to access microphone"**
   - Ensure browser has microphone permissions
   - Check if microphone is working in other apps
   - Try refreshing the page

2. **"Not connected to server"**
   - Check if server is running on port 3001
   - Verify firewall settings
   - Check browser console for errors

3. **"Speech-to-text failed"**
   - Verify OpenAI API key is correct
   - Check API key has sufficient credits
   - Ensure audio quality is good

4. **"Text-to-speech failed"**
   - Check OpenAI API key permissions
   - Verify TTS service is available
   - Check network connection

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=voice-ai:*
```

### Logs
- Server logs appear in terminal
- Client logs appear in browser console
- Check both for error details

## 🔒 Security

### API Key Security
- Never commit API keys to version control
- Use environment variables for sensitive data
- Consider using a secrets management service

### CORS Configuration
- Server is configured for localhost development
- Update CORS settings for production deployment

### Rate Limiting
- Consider implementing rate limiting for production
- Monitor API usage to avoid excessive costs

## 📈 Performance

### Optimization Tips
- Use appropriate AI model for your use case
- Adjust max tokens based on response needs
- Consider caching for repeated queries
- Monitor API response times

### Scaling
- The current setup is for single-user development
- For production, consider:
  - Load balancing
  - Database for conversation history
  - Redis for caching
  - Containerization (Docker)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information

---

**Happy voice chatting! 🎤✨** 