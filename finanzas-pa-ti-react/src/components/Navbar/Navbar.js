import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null; // No mostrar navbar si no hay usuario logueado

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">🏦 Finanzas Pa' Ti</Link>
      </div>
      
      <ul className="navbar-menu">
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/chat">Chat IA</Link>
        </li>
      </ul>
      
      <div className="navbar-profile">
        <span className="user-name">{user.nombres}</span>
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
