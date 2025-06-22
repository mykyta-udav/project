export interface BookingTable {
  locationId: string;
  locationAddress: string;
  tableNumber: string;
  capacity: string;
  availableSlots: string[];
}

export interface BookingSearchParams {
  locationId: string;
  date: string;
  time: string;
  guests: string;
}

export interface ReservationRequest {
  locationId: string;
  tableNumber: string;
  date: string;
  guestsNumber: string;
  timeFrom: string;
  timeTo: string;
}

export interface ReservationResponse {
  id: string;
  status: string;
  locationAddress: string;
  date: string;
  timeSlot: string;
  preOrder: string;
  guestsNumber: string;
  feedbackId: string;
}

export interface ReservationModificationData {
  id: string;
  locationId: string;
  tableNumber: string;
  date: string;
  guestsNumber: string;
  timeFrom: string;
  timeTo: string;
  status: string;
  locationAddress: string;
}

export interface TimeRestrictionInfo {
  canModify: boolean;
  canCancel: boolean;
  minutesUntilReservation: number;
  deadlineTime: string;
  reasonForRestriction?: string;
}

export type ReservationStatus = 'Reserved' | 'Finished' | 'Cancelled';

export interface ReservationActionResult {
  success: boolean;
  message: string;
  error?: string;
} 