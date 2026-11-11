import { Platform } from 'react-native';

// IPv4 của máy tính trên mạng Wi-Fi (dùng cho Mobile Android kết nối cùng mạng)
export const LAN_HOST = '192.168.1.5';
export const PORT = 5000;

// Tự động chọn URL phù hợp: Web dùng localhost, Mobile dùng LAN IPv4
export const BASE_URL = Platform.OS === 'web' 
  ? `http://localhost:${PORT}` 
  : `http://${LAN_HOST}:${PORT}`;

export const API_BASE_URL = `${BASE_URL}/api`;

export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  ME: `${API_BASE_URL}/auth/me`,
  PRODUCTS: `${API_BASE_URL}/products`,
  UPLOAD: `${API_BASE_URL}/upload`,
  EXPORT: `${API_BASE_URL}/products/export`,
};

