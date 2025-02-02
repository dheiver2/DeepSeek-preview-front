import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Configuração base do axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000'
});

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.post('/api/chat', {
        message: userMessage
      });

      if (response.data && response.data.response) {
        setMessages(prev => [...prev, { 
          type: 'assistant', 
          content: response.data.response.message 
        }]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'An unexpected error occurred';
      
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: `Error: ${errorMessage}. Please try again.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content) => {
    if (!content) return '';
    
    // Detecta se o conteúdo parece ser código
    const hasCode = content.includes('{') || 
                   content.includes('function') || 
                   content.includes('const') ||
                   content.includes('let') ||
                   content.includes('var');
    
    if (hasCode) {
      return (
        <pre className="code-block">
          <code>{content}</code>
        </pre>
      );
    }
    return <p>{content}</p>;
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>DeepSeek Chat</h1>
      </header>

      <main className="chat-container">
        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.type}`}
            >
              {formatMessage(message.content)}
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="loading-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
