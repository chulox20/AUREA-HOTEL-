import { createContext, useContext, useState, useCallback } from 'react';
import { calculateBookingTotal, getTodayISO, getTomorrowISO } from '../lib/utils';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [bookingData, setBookingData] = useState({
    // Search parameters
    checkIn: getTodayISO(),
    checkOut: getTomorrowISO(),
    adults: 2,
    children: 0,

    // Selected room
    roomType: null,
    room: null,

    // Guest info
    guest: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      specialRequests: '',
    },

    // Booking step
    currentStep: 1,

    // Calculated pricing
    pricing: null,

    // Result
    reservation: null,
  });

  const setSearchParams = useCallback((params) => {
    setBookingData((prev) => ({
      ...prev,
      ...params,
    }));
  }, []);

  const selectRoom = useCallback((roomType, room = null) => {
    setBookingData((prev) => {
      const nights = Math.max(1,
        Math.ceil(
          (new Date(prev.checkOut) - new Date(prev.checkIn)) / (1000 * 60 * 60 * 24)
        )
      );
      const pricing = calculateBookingTotal(roomType.base_price, nights);

      return {
        ...prev,
        roomType,
        room,
        pricing,
        currentStep: 1,
      };
    });
  }, []);

  const setGuestInfo = useCallback((guest) => {
    setBookingData((prev) => ({
      ...prev,
      guest: { ...prev.guest, ...guest },
    }));
  }, []);

  const setStep = useCallback((step) => {
    setBookingData((prev) => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  const setReservation = useCallback((reservation) => {
    setBookingData((prev) => ({
      ...prev,
      reservation,
    }));
  }, []);

  const recalculatePricing = useCallback(() => {
    setBookingData((prev) => {
      if (!prev.roomType) return prev;
      const nights = Math.max(1,
        Math.ceil(
          (new Date(prev.checkOut) - new Date(prev.checkIn)) / (1000 * 60 * 60 * 24)
        )
      );
      return {
        ...prev,
        pricing: calculateBookingTotal(prev.roomType.base_price, nights),
      };
    });
  }, []);

  const resetBooking = useCallback(() => {
    setBookingData({
      checkIn: getTodayISO(),
      checkOut: getTomorrowISO(),
      adults: 2,
      children: 0,
      roomType: null,
      room: null,
      guest: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        specialRequests: '',
      },
      currentStep: 1,
      pricing: null,
      reservation: null,
    });
  }, []);

  const value = {
    ...bookingData,
    setSearchParams,
    selectRoom,
    setGuestInfo,
    setStep,
    setReservation,
    recalculatePricing,
    resetBooking,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

export default BookingContext;
