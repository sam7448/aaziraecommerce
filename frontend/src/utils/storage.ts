import { User } from '../types/auth.types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const storage = {
  getToken: (): string | null => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      return token && token !== 'undefined' && token !== 'null' ? token : null;
    } catch {
      return null;
    }
  },
  setToken: (token: string): void => {
    if (token && token !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
  removeToken: (): void => localStorage.removeItem(TOKEN_KEY),

  getUser: (): User | null => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw || raw === 'undefined' || raw === 'null') return null;
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },
  setUser: (user: User): void => {
    if (user && typeof user === 'object') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },
  removeUser: (): void => localStorage.removeItem(USER_KEY),

  clear: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Ignore
    }
  },
};
