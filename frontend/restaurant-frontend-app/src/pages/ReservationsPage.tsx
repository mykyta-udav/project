import React, { useState, useEffect } from 'react';
import ReservationCard from '@/components/reservations/ReservationCard';
import ReservationsBanner from '@/components/reservations/ReservationsBanner';
import { useAuth } from '@/contexts/AuthContext';
import type { ReservationResponse } from '@/types/booking';
import { bookingAPI } from '@/services/api';

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useAuth();

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // The API now handles both local and server reservations automatically
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#232323] mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to view your reservations.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#00AD0C] text-white rounded-lg hover:bg-[#009A0B] transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading your reservations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchReservations}
            className="inline-flex items-center justify-center px-6 py-3 bg-[#00AD0C] text-white rounded-lg hover:bg-[#009A0B] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ReservationsBanner />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Reservations Grid */}
        {reservations.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-[#232323] mb-4">
                No Reservations Found
              </h2>
              <p className="text-gray-600 mb-6">
                You haven't made any reservations yet. Book a table to get started.
              </p>
              <a
                href="/book"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#00AD0C] text-white rounded-lg hover:bg-[#009A0B] transition-colors"
              >
                Book a Table
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-32">
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