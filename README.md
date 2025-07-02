# AI Voice Agent

A comprehensive real-time AI voice agent that can listen, process, and respond to your voice commands using cutting-edge AI technology.

## Features

- 🎤 **Real-time Speech Recognition** - Convert speech to text instantly
- 🤖 **AI Processing** - Powered by Ollama (local LLM) for intelligent responses
- 🔊 **Text-to-Speech** - Natural-sounding voice responses
- 🌐 **Web Interface** - Modern, responsive UI for easy interaction
- ⚡ **Real-time Communication** - WebSocket-based live audio streaming
- 🎯 **Voice Commands** - Support for various voice commands and queries

## Tech Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: React, Web Audio API
- **AI**: Ollama (Local LLM) for chat completion, OpenAI for speech processing
- **Speech**: Web Speech API, OpenAI Whisper
- **Audio**: WebRTC, MediaRecorder API

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (for speech-to-text and text-to-speech)
- Ollama installed and running locally
- Microphone access
- Speakers/headphones

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd voice-ai
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your configuration:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   OLLAMA_HOST=http://localhost:11434
   OLLAMA_MODEL=qwen2.5:0.5b
   PORT=3001
   ```

4. **Install and start Ollama**
   ```bash
   # Install Ollama (macOS/Linux)
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Start Ollama service
   ollama serve
   
   # Pull a model (in a new terminal)
   ollama pull qwen2.5:0.5b
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

1. **Grant microphone permissions** when prompted
2. **Click the microphone button** to start recording
3. **Speak your question or command**
4. **Listen to the AI response**

## Voice Commands Examples

- "What's the weather like today?"
- "Tell me a joke"
- "What time is it?"
- "Search for information about AI"
- "Set a reminder for tomorrow"

## Project Structure

```
voice-ai/
├── server/           # Backend server
│   ├── index.js     # Main server file
│   ├── routes/      # API routes
│   └── services/    # AI and audio services
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   └── public/
├── package.json
└── README.md
```

## API Endpoints

- `POST /api/speech-to-text` - Convert audio to text
- `POST /api/chat` - Process text with AI
- `POST /api/text-to-speech` - Convert text to speech
- `GET /api/health` - Health check

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub. 