import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth, setLoading } from '@/store/slices/authSlice';

/**
 * Bridge hook that syncs AuthContext state with Redux
 * Use this during migration period
 */
export const useAuthBridge = () => {
  const authContext = useAuth();
  const dispatch = useAppDispatch();
  const reduxAuth = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Sync AuthContext state to Redux when AuthContext changes
    if (authContext.isAuthenticated && authContext.user && authContext.token) {
      dispatch(initializeAuth({
        user: authContext.user,
        token: authContext.token,
      }));
    }
    
    dispatch(setLoading(authContext.isLoading));
  }, [authContext.isAuthenticated, authContext.user, authContext.token, authContext.isLoading, dispatch]);

  return {
    // Return both contexts for gradual migration
    authContext,
    reduxAuth,
  };
};