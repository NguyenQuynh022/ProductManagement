import axios from 'axios';
import { API_BASE_URL } from '../constants/api';
import { storage } from './storage';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Thêm Bearer JWT Token vào header
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Bắt các lỗi chung
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[API Client] Phiên đăng nhập đã hết hạn hoặc không có quyền.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

