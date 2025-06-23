import type { User } from '@/types/auth';
import { UserRole } from '@/types/auth';

const USER_KEY = 'restaurant_user';
const TOKEN_KEY = 'restaurant_token';

export const storageUtils = {
  setUser: (user: User): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  },

  getUser: (): User | null => {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  },

  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  },

  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  },

  setUserRole: (role: UserRole): void => {
    const user = storageUtils.getUser();
    if (user) {
      storageUtils.setUser({ ...user, role });
    }
  },

  getUserRole: (): UserRole | null => {
    const user = storageUtils.getUser();
    return user?.role || null;
  },

  clearAuth: (): void => {
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  },
};
