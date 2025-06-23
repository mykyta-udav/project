import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

interface ReservationAuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ReservationAuthGuard: React.FC<ReservationAuthGuardProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication state is being determined
  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='flex flex-col items-center space-y-4'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-[#00AD0C] border-t-transparent'></div>
          <p className='text-sm text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login with return path
  if (!isAuthenticated) {
    const currentPath = location.pathname + location.search;
    const loginUrl = `${redirectTo}?from=${encodeURIComponent(currentPath)}`;
    
    return (
      <Navigate 
        to={loginUrl}
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check if user has appropriate role for reservations (redirect staff to home)
  if (user && user.role === UserRole.WAITER) {
    return <Navigate to='/' replace />;
  }

  // If user is authenticated and has appropriate role, render children
  return <>{children}</>;
};

export default ReservationAuthGuard; 