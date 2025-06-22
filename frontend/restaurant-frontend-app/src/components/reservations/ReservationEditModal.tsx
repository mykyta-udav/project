import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import peopleIcon from '../../assets/icons/people.png';
import clockGreenIcon from '../../assets/icons/clock-green.png';
import type { ReservationResponse, ReservationRequest, BookingTable } from '@/types/booking';
import { bookingAPI } from '@/services/api';
import { getTimeRestrictionInfo, formatDeadlineMessage } from '@/utils/reservationUtils';

interface ReservationEditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: ReservationResponse;
  onSuccess: () => void;
}

const ReservationEditModal: React.FC<ReservationEditModalProps> = ({
  isOpen,
  onOpenChange,
  reservation,
  onSuccess,
}) => {
  const [guestCount, setGuestCount] = useState(parseInt(reservation.guestsNumber));
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<BookingTable | null>(null);
  const [loadingTables, setLoadingTables] = useState(false);

  const restrictionInfo = getTimeRestrictionInfo(reservation);

  // Parse existing time slot
  useEffect(() => {
    if (reservation.timeSlot) {
      const [from, to] = reservation.timeSlot.split(' - ').map(s => s.trim());
      setTimeFrom(from);
      setTimeTo(to);
    }
  }, [reservation.timeSlot]);

  // Load available tables for the same date and location
  useEffect(() => {
    const loadAvailableTables = async () => {
      setLoadingTables(true);
      try {
        // Extract locationId from reservation (we'll need to parse this or get it from API)
        // For now, we'll create a mock table based on the reservation data
        const mockTable: BookingTable = {
          tableNumber: '1', // We don't have this info in reservation
          capacity: '8', // Default capacity
          availableSlots: [
            '11:00 a.m. - 12:30 p.m.',
            '12:15 p.m. - 1:45 p.m.',
            '1:30 p.m. - 3:00 p.m.',
            '6:00 p.m. - 7:30 p.m.',
            '7:15 p.m. - 8:45 p.m.',
            '8:30 p.m. - 10:00 p.m.'
          ],
          locationId: 'location-1',
          locationAddress: reservation.locationAddress
        };
        
        setSelectedTable(mockTable);
      } catch (error) {
        console.error('Failed to load available tables:', error);
        setError('Failed to load available time slots');
      } finally {
        setLoadingTables(false);
      }
    };

    if (isOpen) {
      loadAvailableTables();
    }
  }, [isOpen, reservation]);

  const getAvailableTimesFromSlots = () => {
    if (!selectedTable) return [];
    
    const times = new Set<string>();
    selectedTable.availableSlots.forEach(slot => {
      const [from, to] = slot.split(' - ').map(s => s.trim());
      times.add(from);
      times.add(to);
    });
    
    return Array.from(times).sort();
  };

  const availableTimes = getAvailableTimesFromSlots();

  const formatDateForModal = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleUpdateReservation = async () => {
    if (!restrictionInfo.canModify) {
      setError(restrictionInfo.reasonForRestriction || 'Cannot modify this reservation');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const updateRequest: ReservationRequest = {
        locationId: selectedTable?.locationId || 'location-1',
        tableNumber: selectedTable?.tableNumber || '1',
        date: reservation.date,
        guestsNumber: guestCount.toString(),
        timeFrom,
        timeTo,
      };

      await bookingAPI.updateReservation(reservation.id, updateRequest);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update reservation:', error);
      setError('Failed to update reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxCapacity = selectedTable ? parseInt(selectedTable.capacity) : 8;

  if (!restrictionInfo.canModify) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-none p-0 w-[400px] rounded-2xl">
          <div className="flex flex-col p-6 gap-4">
            <h2 className="text-xl font-semibold text-[#232323] text-center">
              Cannot Edit Reservation
            </h2>
            <p className="text-sm text-gray-600 text-center">
              {restrictionInfo.reasonForRestriction}
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-[#00AD0C] hover:bg-[#009A0B] text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none p-0 h-[620px] w-[496px] rounded-3xl">
        <div className="flex h-full w-full flex-col p-6 gap-6">
          {/* Header */}
          <div className="flex flex-col gap-4 text-start">
            <h2 className="font-medium text-[#232323] text-2xl">
              Edit Reservation
            </h2>
            <p className="text-base text-[#232323]">
              Editing reservation at {reservation.locationAddress} for {formatDateForModal(reservation.date)}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                ⏰ {formatDeadlineMessage(restrictionInfo)}
              </p>
            </div>
          </div>

          {/* Current Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-[#232323] mb-2">Current Reservation</h3>
            <p className="text-xs text-gray-600">
              {reservation.timeSlot} • {reservation.guestsNumber} guests
            </p>
          </div>

          {/* Guests Section */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-medium text-[#232323]">Guests</h3>
              <p className="text-sm text-gray-600">Please specify the number of guests.</p>
              <p className="text-sm text-[#232323]">Table seating capacity: {maxCapacity} people</p>
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
                  <span className="flex h-6 w-6 items-center justify-center text-xl font-medium">-</span>
                </button>
                <span className="min-w-[20px] text-center font-medium text-black">
                  {guestCount}
                </span>
                <button
                  onClick={() => setGuestCount(Math.min(maxCapacity, guestCount + 1))}
                  className="flex h-8 w-10 items-center justify-center rounded-lg border border-[#00AD0C] bg-white text-[#00AD0C] hover:bg-[#E9FFEA]"
                >
                  <span className="flex h-6 w-6 items-center justify-center text-xl font-medium">+</span>
                </button>
              </div>
            </div>
          </div>

          {/* Time Section */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-medium text-[#232323]">Time</h3>
              <p className="text-sm text-gray-600">Choose your preferred time from available slots</p>
            </div>

            {loadingTables ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Loading available time slots...</p>
              </div>
            ) : (
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
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-auto">
            <Button
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleUpdateReservation}
              disabled={isSubmitting || !timeFrom || !timeTo}
              className="flex-1 bg-[#00AD0C] text-white hover:bg-[#009A0B]"
            >
              {isSubmitting ? 'Updating...' : 'Update Reservation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationEditModal; 