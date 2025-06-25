import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState, LoginCredentials, RegisterCredentials, User } from '@/types/auth';
import { realAuthService } from '@/services/api';
import { storageUtils } from '@/utils/storage';
import type { PayloadAction } from '@reduxjs/toolkit';

// function to format error messages consistently
const formatErrorMessage = (error: unknown, defaultMessage: string): string => {
  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  
  // specific error messages from backend
  if (errorMessage.includes('already exists') || errorMessage.includes('email address already exists')) {
    return 'An account with this email address already exists. Please try with a different email.';
  } else if (errorMessage.includes('Invalid email or password')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  } else if (errorMessage.includes('complexity requirements') || errorMessage.includes('password') && errorMessage.includes('complexity')) {
    return 'Password does not meet requirements. Please ensure it contains uppercase, lowercase, numbers, and special characters.';
  } else if (errorMessage.includes('Network') || errorMessage.includes('network')) {
    return 'Unable to connect to server. Please check your internet connection and try again.';
  } else if (errorMessage.includes('server error') || errorMessage.includes('Internal server error')) {
    return 'Server error occurred. Please try again later.';
  } else {
    return errorMessage || `${defaultMessage}. Please try again.`;
  }
};

// async thunks for API calls
export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      console.log('Redux: Starting registration process...');
      const response = await realAuthService.register(credentials);
      // store in localStorage
      storageUtils.setToken(response.token);
      storageUtils.setUser(response.user);
      
      console.log('Registration successful');
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      const customErrorMessage = formatErrorMessage(error, 'Registration failed');
      return rejectWithValue(customErrorMessage);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      console.log('Redux: Starting login process...');
      const response = await realAuthService.login(credentials);
      
      storageUtils.setToken(response.token);
      storageUtils.setUser(response.user);
      
      console.log('Login successful');
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      const customErrorMessage = formatErrorMessage(error, 'Login failed');
      return rejectWithValue(customErrorMessage);
    }
  }
);

export const initializeAuthFromStorage = createAsyncThunk(
  'auth/initializeFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const token = storageUtils.getToken();
      const user = storageUtils.getUser();
      
      if (token && user) {
        return { user, token };
      }
      
      return rejectWithValue('No stored auth data');
    } catch (error) {
      return rejectWithValue('Failed to initialize from storage');
    }
  }
);

interface AuthSliceState extends AuthState {
  error: string | null;
}

const initialState: AuthSliceState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      console.log('Redux: Logging out...');
      try {
        realAuthService.logout();
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
      
      storageUtils.clearAuth();
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    initializeAuth: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(registerUser.pending, (state) => {
        console.log('Registration pending...');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        console.log('Registration fulfilled', action.payload);
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        console.log('Registration rejected', action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        console.log('Login pending...');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('Login fulfilled', action.payload);
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log('Login rejected', action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(initializeAuthFromStorage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuthFromStorage.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(initializeAuthFromStorage.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout, clearError, initializeAuth, setLoading } = authSlice.actions;
export default authSlice.reducer;