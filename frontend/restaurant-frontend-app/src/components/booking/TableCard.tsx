import clockGreenIcon from '../../assets/icons/clock-green.png';
import type { BookingTable } from '@/types/booking';
import TableSlotsModal from './TableSlotsModal';
import ReservationModal from './ReservationModal';
import { useState } from 'react';

interface TableCardProps {
  table: BookingTable;
  selectedDate: Date;
  initialGuestCount?: number;
}

const TableCard = ({ table, selectedDate, initialGuestCount = 2 }: TableCardProps) => {
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
      <div className="h-[300px] w-[664px] overflow-hidden rounded-lg border border-[#DADADA] bg-white shadow-sm">
        <div className="flex h-full">
          {/* Left side - Location image */}
          <div className="w-[200px]">
            <img
              src="src/assets/mock-images/Picture.png"
              alt={`${table.locationAddress} restaurant`}
              className="h-[300px] w-[200px] object-cover"
            />
          </div>

          {/* Right side - Table information */}
          <div className="flex w-[464px] flex-col p-6">
            {/* Header with location and table number */}
            <div className="mb-3 flex items-center justify-between">
              <p className="text-base font-medium text-[#232323]">{table.locationAddress}</p>
              <span className="rounded-md px-3 py-1 text-base font-medium text-[#232323]">
                Table {table.tableNumber}
              </span>
            </div>

            {/* Table capacity */}
            <p className="mb-4 text-base font-medium text-[#232323]">
              Table seating capacity: {table.capacity} people
            </p>

            {/* Available slots info */}
            <p className="mb-4 text-base font-medium text-black">
              {table.availableSlots.length} slots available for {formatDate(selectedDate)}:
            </p>

            {/* Time slots in 2 columns with fixed dimensions */}
            <div className="grid grid-cols-2 gap-2">
              {slotsToShow.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleSlotClick(slot)}
                  className="flex h-10 w-[200px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#00AD0C] bg-white px-3 py-2 transition-colors hover:bg-[#E9FFEA]"
                >
                  <img src={clockGreenIcon} alt="Clock" className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-sm font-medium text-[#232323]">{slot}</span>
                </button>
              ))}

              {/* Show All button - always visible */}
              <TableSlotsModal 
                table={table} 
                selectedDate={selectedDate} 
                onSlotSelect={handleSlotClick}
                initialGuestCount={initialGuestCount}
              >
                <button className="flex h-10 w-[100px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#00AD0C] bg-white px-3 py-2 transition-colors hover:bg-[#E9FFEA]">
                  <span className="text-sm font-medium text-[#232323]">
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
      />
    </>
  );
};

export default TableCard;
