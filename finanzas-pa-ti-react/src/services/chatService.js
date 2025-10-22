import { post } from './api';

export const sendMessage = async (message, userId, context) => {
  try {
    const response = await post('/chat', { message, userId, context });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getInvestmentAdvice = async (userId, amount, riskLevel) => {
  try {
    const response = await post('/chat/investment-advice', { userId, amount, riskLevel });
    return response;
  } catch (error) {
    throw error;
  }
};
