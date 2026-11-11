import { Platform } from 'react-native';

const TOKEN_KEY = 'admin_jwt_token';
const USER_KEY = 'admin_user_data';

let memoryToken: string | null = null;
let memoryUser: string | null = null;

export const storage = {
  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(TOKEN_KEY);
      } catch {
        return memoryToken;
      }
    }
    return memoryToken;
  },

  async setToken(token: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(TOKEN_KEY, token);
      } catch {}
    }
    memoryToken = token;
  },

  async removeToken(): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(TOKEN_KEY);
      } catch {}
    }
    memoryToken = null;
  },

  async getUser(): Promise<any | null> {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        const data = window.localStorage.getItem(USER_KEY);
        return data ? JSON.parse(data) : null;
      } catch {
        return memoryUser ? JSON.parse(memoryUser) : null;
      }
    }
    return memoryUser ? JSON.parse(memoryUser) : null;
  },

  async setUser(user: any): Promise<void> {
    const serialized = JSON.stringify(user);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(USER_KEY, serialized);
      } catch {}
    }
    memoryUser = serialized;
  },

  async clear(): Promise<void> {
    await this.removeToken();
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(USER_KEY);
      } catch {}
    }
    memoryUser = null;
  }
};

