import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = {
  // Autenticación
  login: async (email, cedula) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, cedula });
      return response.data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },
  
  // Chat
  sendMessage: async (message, userId) => {
    try {
      const response = await axios.post(`${API_URL}/chat`, { 
        message, 
        userId: userId.toString() 
      });
      return response.data;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    }
  },
  
  // Perfil de usuario
  getUserProfile: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/profile/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw error;
    }
  }
};

export default api;
