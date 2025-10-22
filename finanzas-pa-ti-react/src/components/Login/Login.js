import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [cedula, setCedula] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await login(email, cedula);
      
      if (response.success) {
        setSuccess('¡Login exitoso! Redirigiendo...');
        updateUser(response.user);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🏦 Finanzas Pa' Ti</h2>
        <p className="subtitle">Asesor Financiero Inteligente</p>
        
        {error && <div className="error-message">❌ {error}</div>}
        {success && <div className="success-message">✅ {success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">📧 Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cedula">🆔 Cédula</label>
            <input
              type="text"
              id="cedula"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              required
              placeholder="1234567890"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? '⏳ Iniciando...' : '🚀 Iniciar Sesión'}
          </button>
        </form>

        <div className="demo-credentials">
          <p><strong>Credenciales de prueba:</strong></p>
          <p>📧 Email: santiago.torres52@gmail.com</p>
          <p>🆔 Cédula: 71070189</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
