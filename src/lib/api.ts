import axios, { type AxiosRequestHeaders } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://imovel-certo-backend-production.up.railway.app/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    const headers = (config.headers ?? {}) as AxiosRequestHeaders;
    if (typeof (headers as Record<string, unknown>).set === 'function') {
      (headers as Record<string, unknown>).set('Authorization', `Bearer ${token}`);
    } else {
      (headers as Record<string, unknown>).Authorization = `Bearer ${token}`;
    }
    config.headers = headers;
  }
  return config;
});

// Trata 401 globalmente
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
    return Promise.reject(err);
  }
);

export default api;


