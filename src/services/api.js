import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'https://psn-backend-3dut.onrender.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    console.log('Token obtenido de cookies:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Header Authorization añadido:', config.headers.Authorization);
    } else {
      console.log('No se encontró token en cookies');
    }
    console.log('Solicitud enviada:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
      baseURL: config.baseURL
    });
    return config;
  },
  (error) => {
    console.error('Error en la solicitud:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Respuesta recibida:', response.data);
    return response;
  },
  (error) => {
    console.error('Error en la respuesta:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

export default api;