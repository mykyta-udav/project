import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { BookingTable, ReservationResponse } from '@/types/booking';

interface ReservationConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  table: BookingTable;
  selectedDate: Date;
  guestCount: number;
  timeFrom: string;
  timeTo: string;
  reservation?: ReservationResponse;
}

const ReservationConfirmationModal: React.FC<ReservationConfirmationModalProps> = ({
  isOpen,
  onOpenChange,
  table,
  selectedDate,
  guestCount,
  timeFrom,
  timeTo,
  reservation,
}) => {
  const navigate = useNavigate();

  const formatDateForConfirmation = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCancelReservation = async () => {
    onOpenChange(false);
    // Navigate to reservations page for cancellation
    navigate('/reservations', {
      state: {
        action: 'cancel',
        reservationId: reservation?.id
      }
    });
  };

  const handleEditReservation = () => {
    onOpenChange(false);
    // Navigate to reservations page for editing
    navigate('/reservations', {
      state: {
        action: 'edit',
        editReservation: reservation
      }
    });
  };

  // Use reservation data if available, fallback to props
  const reservationId = reservation?.id;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-none p-0 w-[500px] h-[376px] rounded-3xl"
      >
        <div className="flex h-full w-full flex-col p-6 gap-10">
          {/* Header */}
          <div className="flex flex-col gap-10 text-start">
            <h2 className="text-2xl font-medium text-[#232323]">
              Reservation Confirmed!
            </h2>
            
            {/* Reservation Details */}
            <div className="flex flex-col gap-3 text-sm text-[#232323]">
              <p>
                Your table reservation at <span className="font-medium">Green & Tasty</span> for{' '}
                <span className="font-medium">{guestCount} people</span> on{' '}
                <span className="font-medium">{formatDateForConfirmation(selectedDate)}</span>, from{' '}
                <span className="font-medium">{timeFrom}</span> to{' '}
                <span className="font-medium">{timeTo}</span> at{' '}
                <span className="font-medium">Table {table.tableNumber}</span> has been successfully made.
              </p>
              
              {reservationId && (
                <p className="text-xs text-gray-500">
                  Reservation ID: <span className="font-medium">{reservationId}</span>
                </p>
              )}
              
              <p>
                We look forward to welcoming you at{' '}
                <span className="font-medium">{table.locationAddress}</span>.
              </p>
              
              <p>
                If you need to modify or cancel your reservation, you can do so up to 30 min. before the reservation time.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-4">
            <Button
              variant="secondary"
              onClick={handleCancelReservation}
              className="w-[216px] h-10 border-2 border-[#00AD0C] bg-white text-[#00AD0C] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel Reservation
            </Button>
            
            <Button
              onClick={handleEditReservation}
              className="w-[216px] h-10 bg-[#00AD0C] text-white hover:bg-[#009A0B] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit Reservation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationConfirmationModal; 