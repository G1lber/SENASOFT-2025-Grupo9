import axios from 'axios';

// Usar variable de entorno o fallback a localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = {
  // Login
  async login(username, password) {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en el login');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Send message to chat
  async sendMessage(message, userId, conversationHistory = []) {
    try {
      console.log('📤 Sending message:', { message, userId, historyLength: conversationHistory.length });
      
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message, 
          userId,
          conversationHistory 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || 'Error enviando mensaje');
      }
      
      const data = await response.json();
      console.log('📥 Received response:', { success: data.success, hasHistory: !!data.conversationHistory });
      return data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const response = await fetch(`${API_URL}/api/profile/${userId}`);
      
      if (!response.ok) {
        throw new Error('Error obteniendo perfil');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }
};

export default api;
