import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [cedula, setCedula] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !cedula) {
      setError('Por favor ingrese email y cédula');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await api.login(email, cedula);
      
      if (response.success && response.user) {
        // Guardar información del usuario en el contexto
        login(response.user);
        navigate('/chat');
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error en el servidor');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🏦 Finanzas Pa' Ti</h2>
        <p className="subtitle">Asesor Financiero Inteligente</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">📧 Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="cedula">🆔 Cédula</label>
            <input
              type="text"
              id="cedula"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="Número de documento"
              required
            />
          </div>
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="demo-credentials">
          <p><strong>Credenciales de prueba:</strong></p>
          <p>Email: santiago.torres52@gmail.com</p>
          <p>Cédula: 71070189</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
