import axios from 'axios';
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/types/auth';
import { UserRole } from '@/types/auth';
import type { Dish } from '@/types/dish';
import type { Location, LocationSelectOption } from '@/types/location';
import type { FeedbackResponse, FeedbackType } from '@/types/feedback';
import type { BookingTable, BookingSearchParams, ReservationRequest, ReservationResponse } from '@/types/booking';
import { localReservationStorage } from '@/utils/localReservationStorage';
import { extractUserFromToken } from '@/utils/jwtUtils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
      
      // Check for specific status codes
      if (apiError.status === 409) {
        throw new Error('A user with this email address already exists.');
      } else if (apiError.status === 400) {
        // Use the backend error message for 400 errors
        const message = apiError.message || 'Invalid registration data';
        if (message.toLowerCase().includes('already exists') || message.toLowerCase().includes('email already exists')) {
          throw new Error('A user with this email address already exists.');
        } else if (message.toLowerCase().includes('password') && message.toLowerCase().includes('complexity')) {
          throw new Error('Password does not meet complexity requirements. Please ensure it contains uppercase, lowercase, numbers, and special characters.');
        } else {
          throw new Error(message);
        }
      }
      throw new Error(apiError.message || 'Registration failed');
    }
  },

  signIn: async (data: SignInRequest): Promise<SignInResponse> => {
    try {
      const response = await api.post<SignInResponse>('/auth/sign-in', data);
      return response.data;
    } catch (error: unknown) {
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

      // Extract user data from JWT token
      const userInfo = extractUserFromToken(response.accessToken, credentials.email);
      
      const user: User = {
        username: userInfo?.username || response.username,
        email: credentials.email,
        firstName: userInfo?.firstName,
        lastName: userInfo?.lastName,
        role: mapBackendRole(userInfo?.role || response.role),
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

      // Extract user data from JWT token
      const userInfo = extractUserFromToken(loginResponse.accessToken, credentials.email);

      const user: User = {
        username: userInfo?.username || credentials.username,
        email: credentials.email,
        firstName: userInfo?.firstName || firstName,
        lastName: userInfo?.lastName || lastName,
        role: mapBackendRole(userInfo?.role || loginResponse.role),
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
      const response = await api.get<any[]>('/dishes/popular');
      // Transform API response to match frontend types
      return response.data.map(dish => ({
        name: dish.name,
        price: String(dish.price), // Convert number to string
        weight: dish.weight,
        imageUrl: dish.imageUrl,
      }));
    } catch (error: unknown) {
      console.error('Failed to fetch popular dishes:', error);
      throw error;
    }
  },

  getSpecialityDishes: async (locationId: string): Promise<Dish[]> => {
    try {
      const response = await api.get<any[]>(`/locations/${locationId}/speciality-dishes`);
      // Transform API response to match frontend types
      return response.data.map(dish => ({
        name: dish.name,
        price: String(dish.price), // Convert number to string
        weight: dish.weight,
        imageUrl: dish.imageUrl,
      }));
    } catch (error: unknown) {
      console.error('Failed to fetch speciality dishes:', error);
      throw error;
    }
  },
};

export const locationsAPI = {
  getLocations: async (): Promise<Location[]> => {
    try {
      const response = await api.get<any[]>('/locations');
      // Transform API response to match frontend types
      return response.data.map(location => ({
        id: location.locationId, // Map locationId to id
        address: location.address,
        description: location.description,
        totalCapacity: String(location.totalCapacity), // Ensure string
        averageOccupancy: String(location.averageOccupancy), // Ensure string
        imageUrl: location.imageUrl,
        rating: String(location.rating), // Ensure string
      }));
    } catch (error: unknown) {
      console.error('Failed to fetch locations:', error);
      throw error;
    }
  },

  getLocationSelectOptions: async (): Promise<LocationSelectOption[]> => {
    try {
      const response = await api.get<any[]>('/locations/select-options');
      // Transform API response to match frontend types
      return response.data.map(location => ({
        id: location.locationId || location.id, // Handle both field names
        address: location.address,
      }));
    } catch (error: unknown) {
      console.error('Failed to fetch location select options:', error);
      throw error;
    }
  },

  getLocationById: async (id: string): Promise<Location> => {
    try {
      const response = await api.get<any>(`/locations/${id}`);
      // Transform API response to match frontend types
      return {
        id: response.data.locationId || response.data.id, // Handle both field names
        address: response.data.address,
        description: response.data.description,
        totalCapacity: String(response.data.totalCapacity),
        averageOccupancy: String(response.data.averageOccupancy),
        imageUrl: response.data.imageUrl,
        rating: String(response.data.rating),
      };
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
    size: number = 20,
    sort?: string[]
  ): Promise<FeedbackResponse> => {
    try {
      const params: any = {
        type,
        page,
        size
      };
      
      // Add sort parameter as a single string if provided
      if (sort && sort.length > 0) {
        params.sort = sort[0]; // Send as single string instead of array
      }
      
      const response = await api.get<FeedbackResponse>(`/locations/${locationId}/feedbacks`, {
        params
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch feedbacks:', error);
      throw error;
    }
  },
};

export const bookingAPI = {
  getAvailableTables: async (params: BookingSearchParams): Promise<BookingTable[]> => {
    try {
      const response = await api.get<BookingTable[]>('/bookings/tables', {
        params: {
          locationId: params.locationId,
          date: params.date,
          time: params.time,
          guests: params.guests,
        },
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch available tables:', error);
      throw error;
    }
  },

  createReservation: async (reservation: ReservationRequest, context?: { locationAddress?: string }): Promise<ReservationResponse> => {
    try {
      // try to create reservation on server
      const response = await api.post<ReservationResponse>('/bookings/reservations', reservation);
      return response.data;
    } catch (error: unknown) {
      console.error('Server reservation failed, saving locally:', error);
      
      // Fallback: Save to local storage
      const locationAddress = context?.locationAddress || 'Green & Tasty Restaurant';
      
      const localReservation = localReservationStorage.saveReservation(reservation, {
        locationAddress
      });
      
      return localReservation;
    }
  },

  getUserReservations: async (): Promise<ReservationResponse[]> => {
    try {
      // Get server reservations
      const response = await api.get<ReservationResponse[]>('/reservations');
      const serverReservations = response.data;
      
      // Get local reservations
      const localReservations = localReservationStorage.getAllReservations();
      
      // Combine and return (local reservations first for visibility)
      const allReservations = [...localReservations, ...serverReservations];
      
      // Remove duplicates if any (based on ID)
      const uniqueReservations = allReservations.filter((reservation, index, self) => 
        index === self.findIndex(r => r.id === reservation.id)
      );
      
      return uniqueReservations;
    } catch (error: unknown) {
      console.error('Failed to fetch server reservations, using local only:', error);
      
      // Fallback: Return only local reservations
      return localReservationStorage.getAllReservations();
    }
  },

  cancelReservation: async (reservationId: string): Promise<void> => {
    // Check if it's a local reservation
    if (reservationId.startsWith('local_')) {
      const success = localReservationStorage.cancelReservation(reservationId);
      if (!success) {
        throw new Error('Failed to cancel local reservation');
      }
      return;
    }

    // Handle server reservation
    try {
      await api.delete(`/reservations/${reservationId}`);
    } catch (error: unknown) {
      console.error('Failed to cancel server reservation:', error);
      throw error;
    }
  },

  updateReservation: async (reservationId: string, reservation: ReservationRequest): Promise<ReservationResponse> => {
    // Check if it's a local reservation
    if (reservationId.startsWith('local_')) {
      const updated = localReservationStorage.updateReservation(reservationId, reservation);
      if (!updated) {
        throw new Error('Failed to update local reservation');
      }
      return updated;
    }

    // Handle server reservation
    try {
      const response = await api.put<ReservationResponse>(`/reservations/${reservationId}`, reservation);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to update server reservation:', error);
      throw error;
    }
  },
};

export default api;
