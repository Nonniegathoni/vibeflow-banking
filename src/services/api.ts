import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const login = (email: string, password: string) => 
  api.post('/auth/login', { email, password });

export const register = (name: string, email: string, password: string, phone: string) => 
  api.post('/auth/register', { name, email, password, phone });

export const getTransactions = () => 
  api.get('/transactions');

export const createTransaction = (amount: number, type: 'deposit' | 'withdrawal', description: string) => 
  api.post('/transactions', { amount, type, description });

export const getUserProfile = () => 
  api.get('/users/profile');

export const updateUserProfile = (data: any) => 
  api.put('/users/profile', data);

export default api;

