import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, logout } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const storedUser = getCurrentUser();
      setUser(storedUser);
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const logoutUser = () => {
    logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout: logoutUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
