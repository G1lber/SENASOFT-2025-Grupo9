import { post, get } from './api';

export const login = async (email, cedula) => {
  try {
    const response = await post('/auth/login', { email, cedula });
    if (response.success && response.user) {
      localStorage.setItem('currentUser', JSON.stringify(response.user));
    }
    return response;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('currentUser');
};

export const verifySession = async (userId) => {
  try {
    return await get(`/auth/verify/${userId}`);
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    logout();
    return null;
  }
};

export const isLoggedIn = () => {
  return !!getCurrentUser();
};
