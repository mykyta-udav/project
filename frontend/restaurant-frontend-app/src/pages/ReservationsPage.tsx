import React, { useState, useEffect } from 'react';
import ReservationCard from '@/components/reservations/ReservationCard';
import ReservationsBanner from '@/components/reservations/ReservationsBanner';
import { useAuth } from '@/contexts/AuthContext';
import type { ReservationResponse } from '@/types/booking';
import { bookingAPI } from '@/services/api';
import { Link } from 'react-router-dom';

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useAuth();

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      // both local and server reservations automatically
      const data = await bookingAPI.getUserReservations();
      setReservations(data);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
      setError('Failed to load reservations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchReservations();
    } else if (!isLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-gray-500'>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center px-6'>
        <div className='max-w-md text-center'>
          <h1 className='mb-4 text-2xl font-bold text-[#232323]'>Sign In Required</h1>
          <p className='mb-6 text-gray-600'>Please sign in to view your reservations.</p>
          <a
            href='/login'
            className='inline-flex items-center justify-center rounded-lg bg-[#00AD0C] px-6 py-3 text-white transition-colors hover:bg-[#009A0B]'
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-gray-500'>Loading your reservations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center px-6'>
        <div className='max-w-md text-center'>
          <h1 className='mb-4 text-2xl font-bold text-red-600'>Error</h1>
          <p className='mb-6 text-gray-600'>{error}</p>
          <button
            onClick={fetchReservations}
            className='inline-flex items-center justify-center rounded-lg bg-[#00AD0C] px-6 py-3 text-white transition-colors hover:bg-[#009A0B]'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <ReservationsBanner />

      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-6 lg:py-8'>
        {/* Reservations Grid */}
        {reservations.length === 0 ? (
          <div className='py-8 text-center sm:py-12'>
            <div className='mx-auto max-w-md px-4'>
              <h2 className='mb-4 text-lg font-semibold text-[#232323] sm:text-xl'>No Reservations Found</h2>
              <p className='mb-6 text-sm text-gray-600 sm:text-base'>
                You haven't made any reservations yet. Book a table to get started.
              </p>
              <Link
                to='/booking'
                className='inline-flex items-center justify-center rounded-lg bg-[#00AD0C] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#009A0B] sm:text-base'
              >
                Book a Table
              </Link>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8'>
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onUpdate={fetchReservations}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsPage;
