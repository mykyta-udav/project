import { localReservationStorage } from './localReservationStorage';
import type { ReservationRequest } from '@/types/booking';

/**
 * Test utilities for local reservation storage
 * Use these functions in browser console to test the functionality
 */
export const testLocalReservations = {
  /**
   * Create a test reservation
   */
  createTestReservation: () => {
    const testReservation: ReservationRequest = {
      locationId: 'test-location-1',
      tableNumber: '5',
      date: '2024-12-30',
      guestsNumber: '4',
      timeFrom: '7:00 p.m.',
      timeTo: '8:30 p.m.'
    };

    const result = localReservationStorage.saveReservation(testReservation, {
      locationAddress: '123 Test Street, Test City'
    });

    console.log('Test reservation created:', result);
    return result;
  },

  /**
   * Create multiple test reservations
   */
  createMultipleTestReservations: () => {
    const reservations = [
      {
        locationId: 'loc-1',
        tableNumber: '3',
        date: '2024-12-28',
        guestsNumber: '2',
        timeFrom: '12:00 p.m.',
        timeTo: '1:30 p.m.'
      },
      {
        locationId: 'loc-2',
        tableNumber: '8',
        date: '2024-12-29',
        guestsNumber: '6',
        timeFrom: '6:30 p.m.',
        timeTo: '8:00 p.m.'
      }
    ];

    const results = reservations.map((res, index) => 
      localReservationStorage.saveReservation(res, {
        locationAddress: `Test Location ${index + 1}`
      })
    );

    console.log('Multiple test reservations created:', results);
    return results;
  },

  /**
   * View all stored reservations
   */
  viewAllReservations: () => {
    const reservations = localReservationStorage.getAllReservations();
    console.log('All stored reservations:', reservations);
    return reservations;
  },

  /**
   * Clear all test data
   */
  clearAllTestData: () => {
    localReservationStorage.clearAllReservations();
    console.log('All test reservations cleared');
  },

  /**
   * Test cancellation
   */
  testCancellation: (reservationId?: string) => {
    const reservations = localReservationStorage.getAllReservations();
    if (reservations.length === 0) {
      console.log('No reservations to cancel. Create some first.');
      return;
    }

    const idToCancel = reservationId || reservations[0].id;
    const success = localReservationStorage.cancelReservation(idToCancel);
    
    if (success) {
      console.log(`Reservation ${idToCancel} cancelled successfully`);
    } else {
      console.log(`Failed to cancel reservation ${idToCancel}`);
    }

    return success;
  },

  /**
   * Test update
   */
  testUpdate: (reservationId?: string) => {
    const reservations = localReservationStorage.getAllReservations();
    if (reservations.length === 0) {
      console.log('No reservations to update. Create some first.');
      return;
    }

    const idToUpdate = reservationId || reservations[0].id;
    const updates = {
      guestsNumber: '8',
      timeFrom: '8:00 p.m.',
      timeTo: '9:30 p.m.'
    };

    const result = localReservationStorage.updateReservation(idToUpdate, updates);
    
    if (result) {
      console.log(`Reservation ${idToUpdate} updated successfully:`, result);
    } else {
      console.log(`Failed to update reservation ${idToUpdate}`);
    }

    return result;
  }
};

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testLocalReservations = testLocalReservations;
  console.log('Local reservation test utilities loaded. Use window.testLocalReservations in console.');
} 