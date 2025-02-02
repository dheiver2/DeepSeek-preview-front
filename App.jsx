import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

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
      const response = await axios.post('http://localhost:10000/api/chat', {
        message: userMessage
      });

      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: response.data.response.message 
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: 'Sorry, there was an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Função auxiliar para formatar código se presente
  const formatMessage = (content) => {
    // Verifica se a mensagem parece conter código (presença de caracteres comuns em código)
    const hasCode = content.includes('{') || content.includes('function') || content.includes('const');
    
    if (hasCode) {
      return <pre className="code-block"><code>{content}</code></pre>;
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
              <p>Thinking...</p>
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
          <button type="submit" disabled={isLoading}>
            Send
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
