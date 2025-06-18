import axios from 'axios';
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/types/auth';
import { UserRole } from '@/types/auth';
import type { Dish } from '@/types/dish';
import type { Location } from '@/types/location';
import type { FeedbackResponse, FeedbackType } from '@/types/feedback';

const API_BASE_URL = 'https://f2qn18zbzh.execute-api.ap-south-1.amazonaws.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      const status = error.response.status;
      const message = error.response.data?.message || `HTTP ${status}`;

      throw {
        message,
        status,
      } as ApiError;
    } else if (error.request) {
      // network error
      throw {
        message: 'Network error. Please check if the server is running.',
        status: 0,
      } as ApiError;
    } else {
      throw {
        message: error.message || 'An error occurred',
        status: 0,
      } as ApiError;
    }
  }
);

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpResponse {
  message: string;
}

export interface SignInResponse {
  accessToken: string;
  username: string;
  role: string;
}

export type ApiError = {
  message: string;
  status?: number;
};

// Map backend role to our UserRole enum
const mapBackendRole = (backendRole: string): UserRole => {
  switch (backendRole.toLowerCase()) {
    case 'waiter':
    case 'staff':
      return UserRole.WAITER;
    case 'client':
    case 'customer':
      return UserRole.CUSTOMER;
    default:
      // Default to CUSTOMER if role is unrecognized
      console.warn(`Unknown role from backend: ${backendRole}, defaulting to CUSTOMER`);
      return UserRole.CUSTOMER;
  }
};

export const authAPI = {
  signUp: async (data: SignUpRequest): Promise<SignUpResponse> => {
    try {
      const response = await api.post<SignUpResponse>('/auth/sign-up', data);
      return response.data;
    } catch (error: unknown) {
      // Handle specific signup errors
      const apiError = error as ApiError;
      if (apiError.status === 409) {
        throw new Error('A user with this email address already exists.');
      }
      throw error;
    }
  },

  signIn: async (data: SignInRequest): Promise<SignInResponse> => {
    try {
      const response = await api.post<SignInResponse>('/auth/sign-in', data);
      return response.data;
    } catch (error: unknown) {
      // Handle specific signin errors
      const apiError = error as ApiError;
      if (apiError.status === 401 || apiError.status === 403) {
        throw new Error('Invalid email or password');
      }
      throw error;
    }
  },

  signOut: async (): Promise<void> => {
    const token = tokenManager.getToken();
    if (token) {
      try {
        await api.post<void>('/auth/sign-out');
      } catch (error) {
        console.warn('Backend logout failed:', error);
      }
    }
  },
};

export const realAuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await authAPI.signIn(credentials);

      const user: User = {
        username: response.username,
        email: credentials.email,
        role: mapBackendRole(response.role),
      };

      return {
        user,
        token: response.accessToken,
      };
    } catch (error: unknown) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const [firstName, ...lastNameParts] = credentials.username.split(' ');
      const lastName = lastNameParts.join(' ') || '';

      const signUpData: SignUpRequest = {
        firstName,
        lastName,
        email: credentials.email,
        password: credentials.password,
      };

      // Step 1: Register the user
      await authAPI.signUp(signUpData);

      // Step 2: Automatically log in after successful registration
      const loginResponse = await authAPI.signIn({
        email: credentials.email,
        password: credentials.password,
      });

      const user: User = {
        username: credentials.username,
        email: credentials.email,
        role: mapBackendRole(loginResponse.role),
      };

      return {
        user,
        token: loginResponse.accessToken,
      };
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    const token = tokenManager.getToken();
    if (token) {
      try {
        await authAPI.signOut();
      } catch (error) {
        console.warn('Backend logout failed:', error);
      }
    }
  },
};

// Token management utilities
export const tokenManager = {
  setToken: (token: string) => {
    localStorage.setItem('authToken', token);
  },

  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  removeToken: () => {
    localStorage.removeItem('authToken');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
};

export const dishesAPI = {
  getPopularDishes: async (): Promise<Dish[]> => {
    try {
      const response = await api.get<Dish[]>('/dishes/popular');
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch popular dishes:', error);
      throw error;
    }
  },

  getSpecialityDishes: async (locationId: string): Promise<Dish[]> => {
    try {
      const response = await api.get<Dish[]>(`/locations/${locationId}/speciality-dishes`);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch speciality dishes:', error);
      throw error;
    }
  },
};

export const locationsAPI = {
  getLocations: async (): Promise<Location[]> => {
    try {
      const response = await api.get<Location[]>('/locations');
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch locations:', error);
      throw error;
    }
  },

  getLocationById: async (id: string): Promise<Location> => {
    try {
      const response = await api.get<Location>(`/locations/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error(`Failed to fetch location ${id}:`, error);
      throw error;
    }
  },
};

export const feedbackAPI = {
  getFeedbacks: async (
    locationId: string, 
    type: FeedbackType, 
    page: number = 0, 
    size: number = 20
  ): Promise<FeedbackResponse> => {
    try {
      const response = await api.get<FeedbackResponse>(`/locations/${locationId}/feedbacks`, {
        params: {
          type,
          page,
          size
        }
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch feedbacks:', error);
      throw error;
    }
  },
};

export default api;
