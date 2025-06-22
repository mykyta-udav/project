import type { ReservationResponse, TimeRestrictionInfo, ReservationStatus } from '@/types/booking';

/**
 * Parse time string in format "12:15 p.m." to 24-hour format
 */
export const parseTimeString = (timeStr: string): { hours: number; minutes: number } => {
  try {
    const cleanTime = timeStr.trim();
    const [time, period] = cleanTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (period && period.toLowerCase().includes('p') && hours !== 12) {
      hour24 += 12;
    } else if (period && period.toLowerCase().includes('a') && hours === 12) {
      hour24 = 0;
    }
    
    return { hours: hour24, minutes };
  } catch (error) {
    console.error('Error parsing time string:', timeStr, error);
    return { hours: 12, minutes: 0 };
  }
};

/**
 * Create a Date object from reservation date and time
 */
export const createReservationDateTime = (dateString: string, timeSlot: string): Date => {
  const [startTime] = timeSlot.split(' - ');
  const { hours, minutes } = parseTimeString(startTime.trim());
  
  const date = new Date(dateString);
  date.setHours(hours, minutes, 0, 0);
  
  return date;
};

/**
 * Calculate time restriction information for a reservation
 */
export const getTimeRestrictionInfo = (reservation: ReservationResponse): TimeRestrictionInfo => {
  const now = new Date();
  const reservationDateTime = createReservationDateTime(reservation.date, reservation.timeSlot);
  
  const timeDiff = reservationDateTime.getTime() - now.getTime();
  const minutesUntilReservation = Math.floor(timeDiff / (1000 * 60));
  
  // Calculate deadline (30 minutes before reservation)
  const deadline = new Date(reservationDateTime.getTime() - (30 * 60 * 1000));
  const deadlineTime = deadline.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  const status = reservation.status.toLowerCase() as Lowercase<ReservationStatus>;
  const canModifyByStatus = status === 'reserved';
  const canModifyByTime = minutesUntilReservation > 30;
  
  const canModify = canModifyByStatus && canModifyByTime;
  const canCancel = canModify; // Same rules for cancel and modify
  
  let reasonForRestriction: string | undefined;
  if (!canModifyByStatus) {
    if (status === 'finished') {
      reasonForRestriction = 'This reservation has already been completed';
    } else if (status === 'cancelled') {
      reasonForRestriction = 'This reservation has been cancelled';
    }
  } else if (!canModifyByTime) {
    if (minutesUntilReservation <= 0) {
      reasonForRestriction = 'The reservation time has passed';
    } else {
      reasonForRestriction = 'Modifications are only allowed up to 30 minutes before the reservation time';
    }
  }
  
  return {
    canModify,
    canCancel,
    minutesUntilReservation,
    deadlineTime,
    reasonForRestriction
  };
};

/**
 * Format deadline message for display
 */
export const formatDeadlineMessage = (restrictionInfo: TimeRestrictionInfo): string => {
  if (!restrictionInfo.canModify) {
    return restrictionInfo.reasonForRestriction || 'Cannot modify this reservation';
  }
  
  if (restrictionInfo.minutesUntilReservation <= 60) {
    return `Can cancel/edit until ${restrictionInfo.deadlineTime}`;
  }
  
  return `Can cancel/edit until ${restrictionInfo.deadlineTime}`;
};

/**
 * Get status badge configuration
 */
export const getStatusBadgeConfig = (status: string) => {
  const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() as ReservationStatus;
  
  const statusConfig = {
    Reserved: {
      text: 'Reserved',
      className: 'bg-[#FFF2D4] text-[#232323]'
    },
    Finished: {
      text: 'Finished',
      className: 'bg-[#E9FFEA] text-[#232323]'
    },
    Cancelled: {
      text: 'Cancelled',
      className: 'bg-[#FCE9ED] text-[#232323]'
    }
  };

  return statusConfig[normalizedStatus] || statusConfig.Reserved;
};

/**
 * Format date for display
 */
export const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Validate if modification is allowed
 */
export const validateModificationAllowed = (reservation: ReservationResponse): { isAllowed: boolean; reason?: string } => {
  const restrictionInfo = getTimeRestrictionInfo(reservation);
  
  return {
    isAllowed: restrictionInfo.canModify,
    reason: restrictionInfo.reasonForRestriction
  };
}; 