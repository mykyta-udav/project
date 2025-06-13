import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      // Ensure headers object exists before setting Authorization
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      throw {
        message: error.response.data?.message || `HTTP ${error.response.status}`,
        status: error.response.status,
      } as ApiError;
    } else if (error.request) {
      // Network error
      throw {
        message: 'Network error. Please check if the server is running.',
        status: 0,
      } as ApiError;
    } else {
      // Something else happened
      throw {
        message: error.message || 'An error occurred',
        status: 0,
      } as ApiError;
    }
  }
);

// Types for API requests and responses
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

// Authentication API functions
export const authAPI = {
  signUp: async (data: SignUpRequest): Promise<SignUpResponse> => {
    const response = await api.post<SignUpResponse>('/auth/sign-up', data);
    return response.data;
  },

  signIn: async (data: SignInRequest): Promise<SignInResponse> => {
    const response = await api.post<SignInResponse>('/auth/sign-in', data);
    return response.data;
  },

  signOut: async (): Promise<void> => {
    const token = tokenManager.getToken();
    if (token) {
      try {
        await api.post<void>('/auth/sign-out');
      } catch (error) {
        // Even if backend logout fails, we'll clear local storage
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

// Export the configured axios instance for other API calls
export default api;



// import axios from 'axios';
// import { mockAuthAPI } from './mockApi';

// const API_BASE_URL = 'http://localhost:8080/api/v1';

// // Environment configuration
// const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || !import.meta.env.PROD;

// // Create axios instance with default config
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // Request interceptor to add auth token to requests
// api.interceptors.request.use(
//   (config) => {
//     const token = tokenManager.getToken();
//     if (token) {
//       // Ensure headers object exists before setting Authorization
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for better error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response) {
//       // Server responded with error status
//       throw {
//         message: error.response.data?.message || `HTTP ${error.response.status}`,
//         status: error.response.status,
//       } as ApiError;
//     } else if (error.request) {
//       // Network error
//       throw {
//         message: 'Network error. Please check if the server is running.',
//         status: 0,
//       } as ApiError;
//     } else {
//       // Something else happened
//       throw {
//         message: error.message || 'An error occurred',
//         status: 0,
//       } as ApiError;
//     }
//   }
// );

// // Types for API requests and responses
// export interface SignUpRequest {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
// }

// export interface SignInRequest {
//   email: string;
//   password: string;
// }

// export interface SignUpResponse {
//   message: string;
// }

// export interface SignInResponse {
//   accessToken: string;
//   username: string;
//   role: string;
// }

// export type ApiError = {
//   message: string;
//   status?: number;
// };

// // Real API functions
// const realAuthAPI = {
//   signUp: async (data: SignUpRequest): Promise<SignUpResponse> => {
//     const response = await api.post<SignUpResponse>('/auth/sign-up', data);
//     return response.data;
//   },

//   signIn: async (data: SignInRequest): Promise<SignInResponse> => {
//     const response = await api.post<SignInResponse>('/auth/sign-in', data);
//     return response.data;
//   },

//   signOut: async (): Promise<void> => {
//     const token = tokenManager.getToken();
//     if (token) {
//       try {
//         await api.post<void>('/auth/sign-out');
//       } catch (error) {
//         // Even if backend logout fails, we'll clear local storage
//         console.warn('Backend logout failed:', error);
//       }
//     }
//   },
// };

// // Export the appropriate API based on environment
// export const authAPI = USE_MOCK_API ? mockAuthAPI : realAuthAPI;

// // Token management utilities
// export const tokenManager = {
//   setToken: (token: string) => {
//     localStorage.setItem('authToken', token);
//   },

//   getToken: (): string | null => {
//     return localStorage.getItem('authToken');
//   },

//   removeToken: () => {
//     localStorage.removeItem('authToken');
//   },

//   isAuthenticated: (): boolean => {
//     return !!localStorage.getItem('authToken');
//   },
// };

// // Export the configured axios instance for other API calls
// export default api;