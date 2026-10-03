import React, { useEffect, useRef } from 'react';
import './ChatBox.css';
import LoadingSpinner from './LoadingSpinner';

const ChatBox = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="messages-container">
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✨</div>
          <h3>Start a conversation</h3>
          <p>Ask me anything, I'm Gemma 4 running locally!</p>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <div 
            key={msg.id || idx} 
            className={`message-wrapper ${msg.role === 'user' ? 'user-wrapper' : 'ai-wrapper'}`}
          >
            <div className={`message-bubble ${msg.role}`}>
              {msg.content}
            </div>
          </div>
        ))
      )}
      
      {isLoading && (
        <div className="message-wrapper ai-wrapper">
          <LoadingSpinner />
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatBox;
