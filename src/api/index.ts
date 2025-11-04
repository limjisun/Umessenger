import axios from 'axios';
import type { LoginCredentials, User, Message, Notice } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

// Messages API
export const messagesAPI = {
  getMessages: async (): Promise<Message[]> => {
    const response = await api.get('/messages');
    return response.data;
  },
  sendMessage: async (message: Partial<Message>): Promise<Message> => {
    const response = await api.post('/messages', message);
    return response.data;
  },
  deleteMessage: async (id: string): Promise<void> => {
    await api.delete(`/messages/${id}`);
  },
};

// Notices API
export const noticesAPI = {
  getNotices: async (): Promise<Notice[]> => {
    const response = await api.get('/notices');
    return response.data;
  },
};

export default api;
