import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  // Scroll al final de los mensajes cuando se añade uno nuevo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Mensaje de bienvenida
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        text: `¡Hola ${user?.nombres || 'usuario'}! Soy tu asesor financiero personal. ¿En qué puedo ayudarte hoy?`,
        fromUser: false,
        timestamp: new Date()
      }
    ]);
  }, [user]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const sendMessage = async () => {
    if (!message.trim() || loading) return;
    
    const newMessage = {
      id: Date.now(),
      text: message,
      fromUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setLoading(true);
    
    try {
      const response = await api.sendMessage(message, user.id_usuario);
      
      if (response.success) {
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          text: response.response,
          fromUser: false,
          timestamp: new Date()
        }]);
      } else {
        throw new Error(response.error || 'Error procesando mensaje');
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        text: "Lo siento, ha ocurrido un error. Por favor intenta nuevamente.",
        fromUser: false,
        isError: true,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <div className="chat-page">
      <div className="chat-header">
        <h1>Asesor Financiero IA</h1>
        <div className="user-info">
          <span>{user?.nombres} {user?.apellidos}</span>
          <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </div>
      
      <div className="chat-container">
        <div className="messages-container">
          {messages.map(msg => (
            <div 
              key={msg.id} 
              className={`message ${msg.fromUser ? 'user-message' : 'ai-message'} ${msg.isError ? 'error' : ''}`}
            >
              <div className="message-text">{msg.text}</div>
              <div className="message-time">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="message ai-message typing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="message-input-container">
          <textarea 
            placeholder="Escribe tu mensaje aquí..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button 
            onClick={sendMessage} 
            disabled={!message.trim() || loading}
            className="send-button"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
