import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { UserRole } from '@/types/auth';
import { realAuthService } from '@/services/api';
import { storageUtils } from '@/utils/storage';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isCustomer: () => boolean;
  isWaiter: () => boolean;
  isVisitor: () => boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
  });

  // validate token format and structure
  const isValidToken = (token: string): boolean => {
    try {
      // basic token validation - in production, you might decode JWT and check expiration
      return !!(token && token.length > 10 && token.includes('.'));
    } catch {
      return false;
    }
  };

  // check for existing authentication on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = storageUtils.getToken();
        const user = storageUtils.getUser();
        
        if (token && user && isValidToken(token)) {
          // validate token is still valid (in production, this would be a server call)
          try {
            setAuthState({
              isAuthenticated: true,
              user,
              token,
              isLoading: false,
            });
            console.log('Authentication restored from storage');
          } catch (error) {
            console.error('Token validation failed:', error);
            storageUtils.clearAuth();
            setAuthState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          if (token || user) {
            console.log('Clearing incomplete auth data');
            storageUtils.clearAuth();
          }
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        storageUtils.clearAuth();
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const { user, token } = await realAuthService.login(credentials);
      
      if (!isValidToken(token)) {
        throw new Error('Invalid token received from server');
      }
      
      storageUtils.setToken(token);
      storageUtils.setUser(user);
      
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
      });
      
      console.log('Login successful, user authenticated');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      const { user, token } = await realAuthService.register(credentials);
      
      if (!isValidToken(token)) {
        throw new Error('Invalid token received from server');
      }
      
      storageUtils.setToken(token);
      storageUtils.setUser(user);
      
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
      });
      
      console.log('Registration successful, user authenticated');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await realAuthService.logout();
      storageUtils.clearAuth();
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // still clear local state even if server logout fails
      storageUtils.clearAuth();
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      const token = storageUtils.getToken();
      const user = storageUtils.getUser();
      
      if (!token || !user || !isValidToken(token)) {
        await logout();
        return;
      }
      
      // in production, validate the token with the server here
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
      });
    } catch (error) {
      console.error('Auth refresh failed:', error);
      await logout();
    }
  };

  // role-based access control helpers
  const hasRole = (role: UserRole): boolean => {
    return authState.user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return authState.user?.role ? roles.includes(authState.user.role) : false;
  };

  const isCustomer = (): boolean => hasRole(UserRole.CUSTOMER);
  const isWaiter = (): boolean => hasRole(UserRole.WAITER);
  
  // Note: visitors are unauthorized users
  const isVisitor = (): boolean => hasRole(UserRole.VISITOR);

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      login, 
      register,
      logout, 
      hasRole, 
      hasAnyRole,
      isCustomer,
      isWaiter,
      isVisitor,
      refreshAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 