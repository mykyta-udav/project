import type { ReservationResponse, ReservationRequest } from '@/types/booking';

const RESERVATIONS_STORAGE_KEY = 'restaurant_user_reservations';

export interface LocalReservationData {
  id: string;
  status: string;
  locationAddress: string;
  date: string;
  timeSlot: string;
  preOrder: string;
  guestsNumber: string;
  feedbackId: string;
  createdAt: string;
  userId?: string; // Optional user ID for multi-user support
}

/**
 * Local Storage Reservation Management
 * Temporary solution for storing reservations locally until server integration
 */
export const localReservationStorage = {
  /**
   * Save a new reservation to local storage
   */
  saveReservation: (reservationRequest: ReservationRequest, additionalData?: { locationAddress: string }): ReservationResponse => {
    const reservations = localReservationStorage.getAllReservations();
    
    // Generate a unique ID
    const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the reservation response format
    const newReservation: ReservationResponse = {
      id,
      status: 'Reserved',
      locationAddress: additionalData?.locationAddress || 'Green & Tasty Restaurant',
      date: reservationRequest.date,
      timeSlot: `${reservationRequest.timeFrom} - ${reservationRequest.timeTo}`,
      preOrder: '',
      guestsNumber: reservationRequest.guestsNumber,
      feedbackId: ''
    };

    // Add to existing reservations
    reservations.push(newReservation);
    
    // Save to localStorage
    try {
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations));
      console.log('Reservation saved to local storage:', newReservation);
    } catch (error) {
      console.error('Failed to save reservation to local storage:', error);
    }

    return newReservation;
  },

  /**
   * Get all reservations from local storage
   */
  getAllReservations: (): ReservationResponse[] => {
    try {
      const stored = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
      if (!stored) return [];
      
      const reservations = JSON.parse(stored) as ReservationResponse[];
      return Array.isArray(reservations) ? reservations : [];
    } catch (error) {
      console.error('Failed to load reservations from local storage:', error);
      return [];
    }
  },

  /**
   * Update an existing reservation
   */
  updateReservation: (id: string, updates: Partial<ReservationRequest>): ReservationResponse | null => {
    const reservations = localReservationStorage.getAllReservations();
    const index = reservations.findIndex(r => r.id === id);
    
    if (index === -1) return null;

    // Update the reservation
    const existing = reservations[index];
    const updated: ReservationResponse = {
      ...existing,
      date: updates.date || existing.date,
      timeSlot: updates.timeFrom && updates.timeTo 
        ? `${updates.timeFrom} - ${updates.timeTo}` 
        : existing.timeSlot,
      guestsNumber: updates.guestsNumber || existing.guestsNumber,
    };

    reservations[index] = updated;

    try {
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations));
      console.log('Reservation updated in local storage:', updated);
      return updated;
    } catch (error) {
      console.error('Failed to update reservation in local storage:', error);
      return null;
    }
  },

  /**
   * Cancel (delete) a reservation
   */
  cancelReservation: (id: string): boolean => {
    const reservations = localReservationStorage.getAllReservations();
    const index = reservations.findIndex(r => r.id === id);
    
    if (index === -1) return false;

    // Mark as cancelled instead of deleting (to maintain history)
    reservations[index].status = 'Cancelled';

    try {
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations));
      console.log('Reservation cancelled in local storage:', reservations[index]);
      return true;
    } catch (error) {
      console.error('Failed to cancel reservation in local storage:', error);
      return false;
    }
  },

  /**
   * Get a specific reservation by ID
   */
  getReservationById: (id: string): ReservationResponse | null => {
    const reservations = localReservationStorage.getAllReservations();
    return reservations.find(r => r.id === id) || null;
  },

  /**
   * Clear all local reservations (for testing/reset)
   */
  clearAllReservations: (): void => {
    try {
      localStorage.removeItem(RESERVATIONS_STORAGE_KEY);
      console.log('All local reservations cleared');
    } catch (error) {
      console.error('Failed to clear local reservations:', error);
    }
  },

  /**
   * Check if a reservation exists locally
   */
  hasLocalReservations: (): boolean => {
    const reservations = localReservationStorage.getAllReservations();
    return reservations.length > 0;
  },

  /**
   * Get only locally created reservations (those with local_ prefix)
   */
  getLocalReservations: (): ReservationResponse[] => {
    const allReservations = localReservationStorage.getAllReservations();
    return allReservations.filter(r => r.id.startsWith('local_'));
  }
}; 