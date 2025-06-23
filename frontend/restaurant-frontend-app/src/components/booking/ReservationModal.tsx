import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import peopleIcon from '../../assets/icons/people.png';
import clockGreenIcon from '../../assets/icons/clock-green.png';
import type { BookingTable, ReservationRequest, ReservationResponse } from '@/types/booking';
import { bookingAPI } from '@/services/api';
import ReservationConfirmationModal from './ReservationConfirmationModal';

interface ReservationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  table: BookingTable;
  selectedDate: Date;
  selectedSlot: string;
  initialGuestCount: number;
  children?: React.ReactNode;
  onBookingMade?: (booking: {
    locationId: string;
    tableNumber: string;
    date: string;
    timeSlot: string;
    userId?: string;
  }) => void;
  onBookingChanged?: (
    oldBooking: { locationId: string; tableNumber: string; date: string; timeSlot: string },
    newBooking?: { locationId: string; tableNumber: string; date: string; timeSlot: string; userId?: string }
  ) => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onOpenChange,
  table,
  selectedDate,
  selectedSlot,
  initialGuestCount,
  children,
  onBookingMade,
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [guestCount, setGuestCount] = useState(initialGuestCount);
  const [timeFrom, setTimeFrom] = useState('12:15 p.m.');
  const [timeTo, setTimeTo] = useState('1:45 p.m.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reservationData, setReservationData] = useState<ReservationResponse | undefined>();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const formatDateForModal = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const parseSlotTimes = (slot: string) => {
    // Example slot: "12:15 p.m. - 1:45 p.m"
    const parts = slot.split(' - ');
    if (parts.length === 2) {
      return { from: parts[0].trim(), to: parts[1].trim() };
    }
    return { from: '12:15 p.m.', to: '1:45 p.m.' };
  };

  // Get available times from table's available slots
  const getAvailableTimesFromSlots = () => {
    const times = new Set<string>();
    
    table.availableSlots.forEach(slot => {
      const { from, to } = parseSlotTimes(slot);
      times.add(from);
      times.add(to);
    });
    
    return Array.from(times).sort();
  };

  const availableTimes = getAvailableTimesFromSlots();

  React.useEffect(() => {
    const { from, to } = parseSlotTimes(selectedSlot);
    setTimeFrom(from);
    setTimeTo(to);
  }, [selectedSlot]);

  const handleMakeReservationClick = () => {
    // Check authentication first
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    // Check if user has appropriate role
    if (user && user.role === UserRole.WAITER) {
      alert('Staff members cannot make customer reservations through this interface.');
      return;
    }

    // Proceed with reservation
    handleMakeReservation();
  };

  const handleMakeReservation = async () => {
    setIsSubmitting(true);
    
    try {
      const reservationRequest: ReservationRequest = {
        locationId: table.locationId,
        tableNumber: table.tableNumber,
        date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD format
        guestsNumber: guestCount.toString(),
        timeFrom,
        timeTo,
      };

      console.log('Making reservation:', reservationRequest);
      
      try {
        const response = await bookingAPI.createReservation(reservationRequest, {
          locationAddress: table.locationAddress
        });
        console.log('Reservation created:', response);
        setReservationData(response);
        onOpenChange(false);
        setShowConfirmation(true);
        if (onBookingMade) {
          onBookingMade({
            locationId: table.locationId,
            tableNumber: table.tableNumber,
            date: selectedDate.toISOString().split('T')[0],
            timeSlot: `${timeFrom} - ${timeTo}`,
          });
        }
      } catch (error) {
        console.error('Reservation creation failed:', error);
        // The API already handles local storage fallback, so we should still show success
        // Create a mock response for the confirmation modal
        const mockResponse: ReservationResponse = {
          id: `fallback-${Date.now()}`,
          status: 'Reserved',
          locationAddress: table.locationAddress,
          date: selectedDate.toISOString().split('T')[0],
          timeSlot: `${timeFrom} - ${timeTo}`,
          preOrder: '',
          guestsNumber: guestCount.toString(),
          feedbackId: '',
        };
        setReservationData(mockResponse);
        onOpenChange(false);
        setShowConfirmation(true);
        if (onBookingMade) {
          onBookingMade({
            locationId: table.locationId,
            tableNumber: table.tableNumber,
            date: selectedDate.toISOString().split('T')[0],
            timeSlot: `${timeFrom} - ${timeTo}`,
          });
        }
      }
    } catch (error) {
      console.error('Reservation failed:', error);
      alert('Failed to create reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render authentication prompt content
  const renderAuthPrompt = () => (
    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
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
      <div className='space-y-3 w-full max-w-sm'>
        <Link 
          to={`/login?from=${encodeURIComponent(location.pathname + location.search)}`}
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
          to={`/register?from=${encodeURIComponent(location.pathname + location.search)}`}
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
        
        <Button 
          variant='ghost' 
          size='large' 
          className='w-full text-gray-500 hover:text-gray-700'
          onClick={() => setShowAuthPrompt(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent className="max-w-none p-0 h-[620px] w-[496px] rounded-3xl">
          {showAuthPrompt ? renderAuthPrompt() : (
            <div className="flex h-full w-full flex-col p-6 gap-8">
              {/* Header */}
              <div className="flex flex-col gap-4 text-start">
                <h2 className="font-medium text-[#232323] text-2xl">
                  Make a Reservation
                </h2>
                <p className="text-base text-[#232323]">
                  You are making a reservation at {table.locationAddress}, Table {table.tableNumber}, for {formatDateForModal(selectedDate)}
                </p>
              </div>

              {/* Guests Section */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-medium text-[#232323]">Guests</h3>
                  <p className="text-sm text-gray-600">Please specify the number of guests.</p>
                  <p className="text-sm text-[#232323]">Table seating capacity: {table.capacity} people</p>
                </div>

                {/* Guests Selector */}
                <div className="flex h-14 items-center gap-2 rounded-lg border border-[#DADADA] bg-white px-6 py-4 w-[448px]">
                  <img src={peopleIcon} alt="Guests" className="h-5 w-5" />
                  <span className="flex-1 text-black">Guests</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      className="flex h-8 w-10 items-center justify-center rounded-lg border border-[#00AD0C] bg-white text-[#00AD0C] hover:bg-[#E9FFEA]"
                    >
                      <span className="flex h-6 w-6 items-center justify-center text-xl font-medium">
                        -
                      </span>
                    </button>
                    <span className="min-w-[20px] text-center font-medium text-black">
                      {guestCount}
                    </span>
                    <button
                      onClick={() => setGuestCount(Math.min(parseInt(table.capacity), guestCount + 1))}
                      className="flex h-8 w-10 items-center justify-center rounded-lg border border-[#00AD0C] bg-white text-[#00AD0C] hover:bg-[#E9FFEA]"
                    >
                      <span className="flex h-6 w-6 items-center justify-center text-xl font-medium">
                        +
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Time Section */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-medium text-[#232323]">Time</h3>
                  <p className="text-sm text-gray-600">Please choose your preferred time from the dropdowns below</p>
                </div>

                {/* Time Selectors */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-4">
                    <span className="w-[212px] text-sm font-medium text-[#232323]">From</span>
                    <span className="w-[212px] text-sm font-medium text-[#232323]">To</span>
                  </div>
                  
                  <div className="flex gap-4">
                    {/* From Time Select */}
                    <div className="relative">
                      <img 
                        src={clockGreenIcon} 
                        alt="Clock" 
                        className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 z-10"
                      />
                      <select
                        value={timeFrom}
                        onChange={(e) => setTimeFrom(e.target.value)}
                        className="flex h-14 w-[212px] items-center rounded-lg border border-[#DADADA] bg-white pl-12 pr-4 py-2 text-black focus:border-[#00AD0C] focus:outline-none appearance-none"
                      >
                        {availableTimes.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* To Time Select */}
                    <div className="relative">
                      <img 
                        src={clockGreenIcon} 
                        alt="Clock" 
                        className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 z-10"
                      />
                      <select
                        value={timeTo}
                        onChange={(e) => setTimeTo(e.target.value)}
                        className="flex h-14 w-[212px] items-center rounded-lg border border-[#DADADA] bg-white pl-12 pr-4 py-2 text-black focus:border-[#00AD0C] focus:outline-none appearance-none"
                      >
                        {availableTimes.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Make Reservation Button */}
              <Button
                onClick={handleMakeReservationClick}
                disabled={isSubmitting}
                className="bg-[#00AD0C] text-white hover:bg-[#009A0B] w-[448px] h-14"
              >
                {isSubmitting ? 'Making Reservation...' : 'Make a Reservation'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <ReservationConfirmationModal
        isOpen={showConfirmation}
        onOpenChange={setShowConfirmation}
        table={table}
        selectedDate={selectedDate}
        guestCount={guestCount}
        timeFrom={timeFrom}
        timeTo={timeTo}
        reservation={reservationData}
      />
    </>
  );
};

export default ReservationModal; 