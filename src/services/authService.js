import api from './api';

export const login = async (credentials) => {
  console.log('Enviando login:', credentials);
  try {
    const response = await api.post('/users/login', credentials);
    console.log('Respuesta login:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error login:', error);
    console.log('Detalles:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const registerUser = async (userData) => {
  console.log('Enviando registro:', userData);
  try {
    const response = await api.post('/users/register', userData);
    console.log('Respuesta registro:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error registro:', error);
    console.log('Detalles:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};