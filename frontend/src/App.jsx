import React, { useState } from 'react';
import ChatBox from './components/ChatBox';
import { useGemmaStream } from './hooks/useGemmaStream';
import { useVoice } from './hooks/useVoice';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  
  const handleAIResponseComplete = (finalText) => {
    // Speak the response automatically! (Voice to Voice flow)
    speakText(finalText);
  };

  const { messages, isLoading, error, sendMessage } = useGemmaStream(handleAIResponseComplete);
  
  const handleVoiceRecognized = (transcript) => {
    setInput(transcript);
    // Auto-send immediately after voice recognition
    sendMessage(transcript);
    setInput('');
  };

  const { isListening, toggleListening, speakText, stopSpeaking, isVoiceSupported } = useVoice(handleVoiceRecognized);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Stop any ongoing AI speech if the user sends a new message
    stopSpeaking();
    
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="title">Offline AI</h1>
        <p className="subtitle">Local Gemma 4 • Voice Enabled</p>
      </header>

      <main className="chat-container">
        <ChatBox messages={messages} isLoading={isLoading} />
        
        {error && <div className="error-toast">{error}</div>}

        <div className="input-area">
          <form onSubmit={handleSubmit} className="input-form">
            {isVoiceSupported && (
              <button 
                type="button" 
                className={`voice-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
                title="Voice Input"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="22"></line>
                </svg>
              </button>
            )}

            <textarea
              className="chat-input"
              value={isListening ? "Listening..." : input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Gemma..."
              disabled={isLoading || isListening}
              rows={1}
            />
            
            <button 
              type="submit" 
              className={`send-btn ${isLoading || (!input.trim() && !isListening) ? 'disabled' : ''}`}
              disabled={isLoading || (!input.trim() && !isListening)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
