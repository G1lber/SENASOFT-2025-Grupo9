import { get, post } from './api';

export const getProfile = async (userId) => {
  try {
    const response = await get(`/profile/${userId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const analyzeProfile = async (userId) => {
  try {
    const response = await get(`/profile/${userId}/analyze`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const saveProfile = async (profileData) => {
  try {
    const response = await post('/profile', profileData);
    return response;
  } catch (error) {
    throw error;
  }
};
