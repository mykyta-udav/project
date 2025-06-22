import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import clockGreenIcon from '../../assets/icons/clock-green.png';
import type { BookingTable } from '@/types/booking';

interface TableSlotsModalProps {
  table: BookingTable;
  selectedDate: Date;
  onSlotSelect: (slot: string) => void;
  initialGuestCount: number;
  children: React.ReactNode;
}

const TableSlotsModal: React.FC<TableSlotsModalProps> = ({
  table,
  selectedDate,
  onSlotSelect,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSlotClick = (slot: string) => {
    setIsOpen(false); // Close this modal first
    setTimeout(() => {
      onSlotSelect(slot); // Then trigger the reservation modal
    }, 100); // Small delay to ensure smooth transition
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-none p-0 h-[360px] w-[464px] rounded-3xl">
        <div className="flex h-full w-full flex-col p-6 gap-6">
          {/* Header */}
          <div className="flex flex-col gap-4 text-center">
            <h2 className="font-medium text-[#232323] text-2xl">
              All Available Time Slots
            </h2>
            <p className="text-base text-[#232323]">
              {table.locationAddress}, Table {table.tableNumber}, for {formatDate(selectedDate)}
            </p>
          </div>

          {/* Time slots grid */}
          <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[200px]">
            {table.availableSlots.map((slot, index) => (
              <button
                key={index}
                onClick={() => handleSlotClick(slot)}
                className="flex h-10 w-[200px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#00AD0C] bg-white px-3 py-2 transition-colors hover:bg-[#E9FFEA]"
              >
                <img src={clockGreenIcon} alt="Clock" className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-sm font-medium text-[#232323]">{slot}</span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TableSlotsModal;
