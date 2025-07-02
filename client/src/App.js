import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import VoiceRecorder from './components/VoiceRecorder';
import ChatInterface from './components/ChatInterface';
import Settings from './components/Settings';
import Header from './components/Header';
import { useVoiceAI } from './hooks/useVoiceAI';
import { motion } from 'framer-motion';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAwaitingChatCompletion, setIsAwaitingChatCompletion] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [conversation, setConversation] = useState([]);
  
  const {
    startRecording,
    stopRecording,
    sendMessage,
    isConnected,
    connectionStatus
  } = useVoiceAI();

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      console.log('Stopping recording...');
      setIsRecording(false);
      setIsProcessing(true);
      const result = await stopRecording();
      
      setIsProcessing(false);
      
      console.log('Recording stopped, result:', result);
      
      if (result && result.error) {
        console.error('Audio processing error:', result.error);
        toast.error('Failed to process audio: ' + result.error);
      } else if (result && result.text) {
        console.log('Adding user message to conversation:', result.text);
        const userMessage = {
          id: Date.now(),
          type: 'user',
          content: result.text,
          timestamp: new Date().toISOString()
        };
        
        setConversation(prev => [...prev, userMessage]);
        
        setIsAwaitingChatCompletion(true);
        console.log('Sending message to AI...');
        const aiResponse = await sendMessage(result.text);
        
        if (aiResponse) {
          console.log('AI response received:', aiResponse);
          const aiMessage = {
            id: Date.now() + 1,
            type: 'assistant',
            content: aiResponse.message,
            audioUrl: aiResponse.audioUrl,
            timestamp: new Date().toISOString()
          };
          
          setConversation(prev => [...prev, aiMessage]);
        }
        setIsAwaitingChatCompletion(false);
      } else {
        console.log('No text result from speech-to-text');
        toast.error('No speech detected. Please try again.');
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      toast.error('Failed to process recording');
      setIsAwaitingChatCompletion(false);
    }
  };

  const handleTextMessage = async (message) => {
    try {
      setIsAwaitingChatCompletion(true);
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => [...prev, userMessage]);
      
      const aiResponse = await sendMessage(message);
      
      if (aiResponse) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: aiResponse.message,
          audioUrl: aiResponse.audioUrl,
          timestamp: new Date().toISOString()
        };
        
        setConversation(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsAwaitingChatCompletion(false);
    }
  };

  const clearConversation = () => {
    setConversation([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      <Toaster position="top-right" />
      
      <Header 
        onSettingsClick={() => setShowSettings(true)}
        connectionStatus={connectionStatus}
        isConnected={isConnected}
      />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <VoiceRecorder
            isRecording={isRecording}
            isProcessing={isProcessing}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            isConnected={isConnected}
          />
          
          <ChatInterface
            conversation={conversation}
            onSendMessage={handleTextMessage}
            onClearConversation={clearConversation}
            isProcessing={isAwaitingChatCompletion}
          />
        </motion.div>
      </main>
      
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App; 