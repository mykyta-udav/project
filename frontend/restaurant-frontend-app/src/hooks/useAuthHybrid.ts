import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { loginUser, registerUser, logout, clearError } from '@/store/slices/authSlice';
import { UserRole } from '@/types/auth';
import type { LoginCredentials, RegisterCredentials } from '@/types/auth';
import type { RootState } from '@/store';

/**
 * Hybrid auth hook that uses Redux but provides the same interface as AuthContext
 * Use this to gradually migrate from AuthContext to Redux
 */
export const useAuthHybrid = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state: RootState) => state.auth);

  const login = async (credentials: LoginCredentials) => {
    dispatch(clearError());
    await dispatch(loginUser(credentials)).unwrap();
  };

  const register = async (credentials: RegisterCredentials) => {
    dispatch(clearError());
    await dispatch(registerUser(credentials)).unwrap();
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const hasRole = (role: UserRole): boolean => {
    return authState.user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return authState.user?.role ? roles.includes(authState.user.role) : false;
  };

  const isCustomer = (): boolean => hasRole(UserRole.CUSTOMER);
  const isWaiter = (): boolean => hasRole(UserRole.WAITER);
  const isVisitor = (): boolean => hasRole(UserRole.VISITOR);

  const refreshAuth = async (): Promise<void> => {
    // Implementation for refreshing auth state - can be enhanced later
    console.log('Auth refresh called (to be implemented)');
  };

  return {
    ...authState,
    login,
    register,
    logout: logoutUser,
    hasRole,
    hasAnyRole,
    isCustomer,
    isWaiter,
    isVisitor,
    refreshAuth,
  };
}; 