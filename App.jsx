import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [error, setError] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Teste de conexão com o backend ao carregar
    const testConnection = async () => {
      try {
        await axios.get(`${API_URL}/health`);
        setError(null);
      } catch (err) {
        setError('Unable to connect to the server. Please try again later.');
        console.error('Connection test failed:', err);
      }
    };
    testConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: userMessage
      });

      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: response.data.response.message 
      }]);
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || 'An error occurred. Please try again.');
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: 'Sorry, there was an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const CodeBlock = ({ language, value }) => {
    return (
      <SyntaxHighlighter 
        language={language} 
        style={dracula}
        customStyle={{
          margin: '0.5em 0',
          borderRadius: '5px',
          padding: '1em'
        }}
      >
        {value}
      </SyntaxHighlighter>
    );
  };

  const renderMessage = (content) => {
    return (
      <ReactMarkdown
        components={{
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <CodeBlock
                language={match[1]}
                value={String(children).replace(/\n$/, '')}
                {...props}
              />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>DeepSeek Chat</h1>
        {error && <div className="error-banner">{error}</div>}
      </header>

      <main className="chat-container">
        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.type}`}
            >
              {renderMessage(message.content)}
            </div>
          ))}
          {isLoading && (
            <div className="message assistant loading">
              <div className="typing-indicator">
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
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
