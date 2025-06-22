import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types/auth';

interface ReservationAuthGuardProps {
  children: React.ReactNode;
}

export const ReservationAuthGuard: React.FC<ReservationAuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication state is being determined
  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='flex flex-col items-center space-y-4'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-[#00AD0C] border-t-transparent'></div>
          <p className='text-sm text-gray-600'>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show reservation-specific login prompt
  if (!isAuthenticated) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4'>
        <div className='w-full max-w-md rounded-lg bg-white p-8 shadow-lg'>
          <div className='text-center'>
            {/* Icon */}
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E9FFEA]'>
              <svg
                className='h-8 w-8 text-[#00AD0C]'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                />
              </svg>
            </div>

            {/* Heading */}
            <h2 className='mb-2 text-2xl font-semibold text-gray-900'>
              Sign In Required
            </h2>
            
            {/* Description */}
            <p className='mb-6 text-gray-600'>
              To make a reservation, please sign in to your account or create a new one.
            </p>

            {/* Action Buttons */}
            <div className='space-y-3'>
              <Link 
                to='/login' 
                state={{ from: location }}
                className='block'
              >
                <Button 
                  variant='primary' 
                  size='large' 
                  className='w-full bg-[#00AD0C] text-white hover:bg-[#009A0B]'
                >
                  Sign In
                </Button>
              </Link>
              
              <Link 
                to='/register' 
                state={{ from: location }}
                className='block'
              >
                <Button 
                  variant='secondary' 
                  size='large' 
                  className='w-full border-[#00AD0C] text-[#00AD0C] hover:bg-[#E9FFEA]'
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has appropriate role for reservations
  if (user && user.role === UserRole.WAITER) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4'>
        <div className='w-full max-w-md rounded-lg bg-white p-8 shadow-lg'>
          <div className='text-center'>
            {/* Warning Icon */}
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100'>
              <svg
                className='h-8 w-8 text-yellow-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>

            <h2 className='mb-2 text-2xl font-semibold text-gray-900'>
              Access Restricted
            </h2>
            
            <p className='mb-6 text-gray-600'>
              Staff members cannot make customer reservations through this interface. 
              Please use the staff dashboard for reservation management.
            </p>

            <Link to='/'>
              <Button 
                variant='primary' 
                size='large' 
                className='bg-[#00AD0C] text-white hover:bg-[#009A0B]'
              >
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated and has appropriate role, render children
  return <>{children}</>;
};

export default ReservationAuthGuard; 