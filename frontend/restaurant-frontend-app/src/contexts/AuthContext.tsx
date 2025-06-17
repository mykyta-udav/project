import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { UserRole } from '@/types/auth';
import { authService } from '@/services/mockApi';
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

  // Check for existing authentication on app startup
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = storageUtils.getToken();
        const user = storageUtils.getUser();
        
        if (token && user) {
          setAuthState({
            isAuthenticated: true,
            user,
            token,
            isLoading: false,
          });
        } else {
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
      const { user, token } = await authService.login(credentials);
      
      storageUtils.setToken(token);
      storageUtils.setUser(user);
      
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      const { user, token } = await authService.register(credentials);
      
      storageUtils.setToken(token);
      storageUtils.setUser(user);
      
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    storageUtils.clearAuth();
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
  };

  // Role-based access control helpers
  const hasRole = (role: UserRole): boolean => {
    return authState.user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return authState.user?.role ? roles.includes(authState.user.role) : false;
  };

  const isCustomer = (): boolean => hasRole(UserRole.CUSTOMER);
  const isWaiter = (): boolean => hasRole(UserRole.WAITER);
  
  // Note: isVisitor is maintained for completeness but visitors are unauthorized users
  // This function will typically return false since visitors don't authenticate
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
      isVisitor
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