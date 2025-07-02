import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const VoiceRecorder = ({ 
  isRecording, 
  isProcessing, 
  onStartRecording, 
  onStopRecording, 
  isConnected 
}) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecordingToggle = async () => {
    if (!isConnected) {
      toast.error('Not connected to server');
      return;
    }

    if (isRecording) {
      await onStopRecording();
    } else {
      await onStartRecording();
    }
  };

  const getButtonColor = () => {
    if (isProcessing) return 'bg-yellow-500';
    if (isRecording) return 'bg-red-500';
    return 'bg-blue-500';
  };

  const getButtonIcon = () => {
    if (isProcessing) return <Loader2 className="w-8 h-8 animate-spin" />;
    if (isRecording) return <MicOff className="w-8 h-8" />;
    return <Mic className="w-8 h-8" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Voice Recorder
        </h2>
        
        {/* Recording Status */}
        <div className="mb-6">
          {isRecording && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center space-x-2 bg-red-500/20 text-red-200 px-4 py-2 rounded-full"
            >
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Recording</span>
              <span className="text-sm">({formatTime(recordingTime)})</span>
            </motion.div>
          )}
          
          {isProcessing && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center space-x-2 bg-yellow-500/20 text-yellow-200 px-4 py-2 rounded-full"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="font-medium">Processing...</span>
            </motion.div>
          )}
        </div>

        {/* Audio Visualization */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center space-x-1 mb-6"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [20, 40, 20],
                  backgroundColor: ['#3b82f6', '#8b5cf6', '#3b82f6']
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
                className="w-1 bg-blue-400 rounded-full"
                style={{ height: '20px' }}
              />
            ))}
          </motion.div>
        )}

        {/* Main Recording Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRecordingToggle}
          disabled={!isConnected || isProcessing}
          className={`
            relative w-24 h-24 rounded-full ${getButtonColor()} 
            hover:shadow-lg transition-all duration-200 flex items-center justify-center
            ${!isConnected || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${isRecording ? 'pulse-recording' : ''}
          `}
        >
          {getButtonIcon()}
          
          {/* Ripple effect */}
          {isRecording && (
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
              className="absolute inset-0 border-2 border-white/30 rounded-full"
            />
          )}
        </motion.button>

        {/* Instructions */}
        <div className="mt-6 text-white/70">
          {!isConnected ? (
            <p>Connecting to server...</p>
          ) : isRecording ? (
            <p>Click to stop recording</p>
          ) : isProcessing ? (
            <p>Processing your voice...</p>
          ) : (
            <p>Click to start recording</p>
          )}
        </div>

        {/* Connection Status */}
        <div className="mt-4">
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            isConnected 
              ? 'bg-green-500/20 text-green-200' 
              : 'bg-red-500/20 text-red-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VoiceRecorder; 