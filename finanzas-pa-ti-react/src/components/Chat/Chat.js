import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sendMessage } from '../../services/chatService';
import './Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Mensaje de bienvenida inicial
    setMessages([
      {
        text: `¡Hola! Soy tu asesor financiero virtual. ¿En qué puedo ayudarte hoy?`,
        isUser: false,
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || loading) return;

    const userId = user?.id_usuario.toString() || '1';
    const messageToSend = currentMessage;

    // Añadir mensaje del usuario al chat
    setMessages(prev => [...prev, {
      text: messageToSend,
      isUser: true,
      timestamp: new Date()
    }]);

    setCurrentMessage('');
    setLoading(true);

    try {
      // Enviar mensaje al backend
      const response = await sendMessage(messageToSend, userId);
      
      if (response.success) {
        // Añadir respuesta del asistente al chat
        setMessages(prev => [...prev, {
          text: response.response,
          isUser: false,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setMessages(prev => [...prev, {
        text: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
        isUser: false,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Asesor Financiero IA</h2>
        {user && <p>Hola, {user.nombres}!</p>}
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`message ${msg.isUser ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">{msg.text}</div>
            <div className="message-time">
              {msg.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="loading">
            <p>Pensando...</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Escribe tu pregunta sobre inversiones..."
          disabled={loading}
        />
        <button onClick={handleSendMessage} disabled={!currentMessage || loading}>
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Chat;
