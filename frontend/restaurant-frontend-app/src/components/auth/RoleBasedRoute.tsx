import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
  showUnauthorized?: boolean;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/unauthorized',
  showUnauthorized = false,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center px-4'>
        <div className='w-full max-w-sm text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-green-600'></div>
          <p className='text-sm text-gray-600 sm:text-base'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    if (showUnauthorized) {
      return (
        <div className='flex min-h-screen items-center justify-center px-4'>
          <div className='w-full max-w-md text-center'>
            <div className='rounded-lg border border-red-200 bg-red-50 p-6 sm:p-8'>
              <h2 className='mb-4 text-xl font-bold text-red-600 sm:text-2xl'>Access Denied</h2>
              <p className='mb-2 text-sm text-gray-600 sm:text-base'>
                You don't have permission to access this page.
              </p>
              <p className='rounded bg-gray-100 px-3 py-2 text-xs text-gray-500 sm:text-sm'>
                Your role: {user?.role || 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles={[UserRole.CUSTOMER]}>{children}</RoleBasedRoute>
);

export const WaiterRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles={[UserRole.WAITER]}>{children}</RoleBasedRoute>
);

// Note: VisitorRoute is kept for potential future use with temporary user contexts
// Visitors are unauthorized users and should not have authenticated access to protected routes
export const VisitorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles={[UserRole.VISITOR]}>{children}</RoleBasedRoute>
);

export const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles={[UserRole.WAITER, UserRole.CUSTOMER]}>{children}</RoleBasedRoute>
);
