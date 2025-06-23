import clockGreenIcon from '../../assets/icons/clock-green.png';
import type { BookingTable } from '@/types/booking';
import TableSlotsModal from './TableSlotsModal';
import ReservationModal from './ReservationModal';
import { useState } from 'react';

interface TableCardProps {
  table: BookingTable;
  selectedDate: Date;
  initialGuestCount?: number;
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

const TableCard = ({ 
  table, 
  selectedDate, 
  initialGuestCount = 2, 
  onBookingMade, 
  onBookingChanged 
}: TableCardProps) => {
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  
  const maxSlotsToShow = 5;
  const slotsToShow = table.availableSlots.slice(0, maxSlotsToShow);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSlotClick = (slot: string) => {
    setSelectedSlot(slot);
    setReservationModalOpen(true);
  };

  return (
    <>
      <div className="w-full max-w-[664px] overflow-hidden rounded-lg border border-[#DADADA] bg-white shadow-sm lg:h-[300px] lg:w-[664px]">
        <div className="flex h-full flex-col lg:flex-row">
          {/* Left side - Location image */}
          <div className="h-48 w-full sm:h-56 lg:h-[300px] lg:w-[200px]">
            <img
              src="src/assets/mock-images/Picture.png"
              alt={`${table.locationAddress} restaurant`}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Right side - Table information */}
          <div className="flex w-full flex-col p-4 sm:p-5 lg:w-[464px] lg:p-6">
            {/* Header with location and table number */}
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:mb-3">
              <p className="text-sm font-medium text-[#232323] sm:text-base">{table.locationAddress}</p>
              <span className="rounded-md px-3 py-1 text-sm font-medium text-[#232323] sm:text-base">
                Table {table.tableNumber}
              </span>
            </div>

            {/* Table capacity */}
            <p className="mb-3 text-sm font-medium text-[#232323] sm:text-base lg:mb-4">
              Table seating capacity: {table.capacity} people
            </p>

            {/* Available slots info */}
            <p className="mb-3 text-sm font-medium text-black sm:text-base lg:mb-4">
              {table.availableSlots.length} slots available for {formatDate(selectedDate)}:
            </p>

            {/* Time slots - responsive grid */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-2">
              {slotsToShow.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleSlotClick(slot)}
                  className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#00AD0C] bg-white px-3 py-2 transition-colors hover:bg-[#E9FFEA] sm:w-full lg:w-[200px]"
                >
                  <img src={clockGreenIcon} alt="Clock" className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-xs font-medium text-[#232323] sm:text-sm">{slot}</span>
                </button>
              ))}

              {/* Show All button - responsive */}
              <TableSlotsModal 
                table={table} 
                selectedDate={selectedDate} 
                onSlotSelect={handleSlotClick}
                initialGuestCount={initialGuestCount}
              >
                <button className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#00AD0C] bg-white px-3 py-2 transition-colors hover:bg-[#E9FFEA] sm:w-full lg:w-[100px]">
                  <span className="text-xs font-medium text-[#232323] sm:text-sm">
                    <span className="text-[#00AD0C]">+</span> Show all
                  </span>
                </button>
              </TableSlotsModal>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={reservationModalOpen}
        onOpenChange={setReservationModalOpen}
        table={table}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        initialGuestCount={initialGuestCount}
        onBookingMade={onBookingMade}
        onBookingChanged={onBookingChanged}
      />
    </>
  );
};

export default TableCard;
