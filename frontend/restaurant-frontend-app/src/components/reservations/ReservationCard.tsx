import React, { useState } from 'react';
import locationIcon from '../../assets/icons/location.png';
import calendarGreenIcon from '../../assets/icons/calendar-green.png';
import clockGreenIcon from '../../assets/icons/clock-green.png';
import peopleGreenIcon from '../../assets/icons/people-green.png';
import type { ReservationResponse } from '@/types/booking';
import { bookingAPI } from '@/services/api';
import { 
  getTimeRestrictionInfo, 
  formatDeadlineMessage, 
  getStatusBadgeConfig, 
  formatDisplayDate 
} from '@/utils/reservationUtils';
import ConfirmationDialog from './ConfirmationDialog';
import ReservationEditModal from './ReservationEditModal';

interface ReservationCardProps {
  reservation: ReservationResponse;
  onUpdate?: () => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, onUpdate }) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const restrictionInfo = getTimeRestrictionInfo(reservation);
  const statusConfig = getStatusBadgeConfig(reservation.status);

  const getStatusBadge = () => {
    return (
      <span className={`inline-flex items-center justify-center w-[79px] h-4 rounded-lg text-xs font-medium ${statusConfig.className}`}>
        {statusConfig.text}
      </span>
    );
  };

  const handleCancelClick = () => {
    if (!restrictionInfo.canCancel) {
      return;
    }
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      await bookingAPI.cancelReservation(reservation.id);
      onUpdate?.();
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      // Keep dialog open to show error state
    } finally {
      setIsCancelling(false);
    }
  };

  const handleEditClick = () => {
    if (!restrictionInfo.canModify) {
      return;
    }
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    onUpdate?.();
    setShowEditModal(false);
  };

  return (
    <>
      <div className="w-[432px] h-[256px] bg-white border border-[#DADADA] rounded-lg p-6">
        <div className="flex flex-col h-full">
          {/* Header with location and status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img src={locationIcon} alt="Location" className="w-4 h-4" />
              <span className="text-sm font-bold text-[#232323]">
                {reservation.locationAddress}
              </span>
            </div>
            {getStatusBadge()}
          </div>

          {/* Reservation details */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center gap-2">
              <img src={calendarGreenIcon} alt="Date" className="w-4 h-4" />
              <span className="text-sm font-bold text-[#232323]">
                {formatDisplayDate(reservation.date)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <img src={clockGreenIcon} alt="Time" className="w-4 h-4" />
              <span className="text-sm font-bold text-[#232323]">
                {reservation.timeSlot}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <img src={peopleGreenIcon} alt="Guests" className="w-4 h-4" />
              <span className="text-sm font-bold text-[#232323]">
                {reservation.guestsNumber} Guests
              </span>
            </div>
          </div>

          {/* Time restriction info */}
          {reservation.status.toLowerCase() === 'reserved' && (
            <div className="mb-4">
              <p className="text-xs text-gray-500">
                {formatDeadlineMessage(restrictionInfo)}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 mt-auto">
            <button
              onClick={handleCancelClick}
              disabled={!restrictionInfo.canCancel}
              className="text-sm font-bold text-[#232323] border-b border-[#232323] hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-400 disabled:text-gray-400"
              title={!restrictionInfo.canCancel ? restrictionInfo.reasonForRestriction : 'Cancel reservation'}
            >
              Cancel
            </button>
            
            <button
              onClick={handleEditClick}
              disabled={!restrictionInfo.canModify}
              className="text-sm font-bold text-[#00AD0C] hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400"
              title={!restrictionInfo.canModify ? restrictionInfo.reasonForRestriction : 'Edit reservation'}
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancel Reservation"
        message={`Are you sure you want to cancel your reservation at ${reservation.locationAddress} on ${formatDisplayDate(reservation.date)} at ${reservation.timeSlot}?`}
        confirmText="Yes, Cancel"
        cancelText="Keep Reservation"
        confirmVariant="destructive"
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
      />

      {/* Edit Modal */}
      <ReservationEditModal
        isOpen={showEditModal}
        onOpenChange={setShowEditModal}
        reservation={reservation}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default ReservationCard; 