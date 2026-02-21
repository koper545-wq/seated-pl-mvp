"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const BOOKINGS_STORAGE_KEY = "seated-bookings";

export type BookingStatus =
  | "pending_payment"    // Created, waiting for payment
  | "pending_approval"   // Paid, waiting for host approval
  | "approved"           // Host approved
  | "declined"           // Host declined
  | "cancelled"          // Guest cancelled
  | "completed";         // Event happened

export interface Booking {
  id: string;
  eventId: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  ticketCount: number;
  totalPrice: number; // in grosze (cents)
  platformFee: number; // in grosze
  voucherCode?: string;
  voucherDiscount?: number; // in grosze
  dietaryRestrictions: string[];
  otherDietary?: string;
  specialRequests?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  approvedAt?: string;
  declinedAt?: string;
  declineReason?: string;
}

export interface CreateBookingData {
  eventId: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  ticketCount: number;
  totalPrice: number;
  platformFee: number;
  voucherCode?: string;
  voucherDiscount?: number;
  dietaryRestrictions: string[];
  otherDietary?: string;
  specialRequests?: string;
}

interface BookingsContextType {
  bookings: Booking[];
  isLoaded: boolean;

  // Guest actions
  createBooking: (data: CreateBookingData) => Booking;
  payBooking: (bookingId: string) => Promise<boolean>;
  cancelBooking: (bookingId: string) => void;
  getBookingById: (bookingId: string) => Booking | null;
  getBookingsByGuestId: (guestId: string) => Booking[];
  getBookingsByEventId: (eventId: string) => Booking[];

  // Host actions
  approveBooking: (bookingId: string) => void;
  declineBooking: (bookingId: string, reason?: string) => void;

  // Stats
  getPendingBookingsForHost: (hostId: string, eventIds: string[]) => Booking[];
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export function BookingsProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load bookings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setBookings(parsed);
      }
    } catch (error) {
      console.error("Failed to load bookings from localStorage:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save bookings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
      } catch (error) {
        console.error("Failed to save bookings to localStorage:", error);
      }
    }
  }, [bookings, isLoaded]);

  const createBooking = useCallback((data: CreateBookingData): Booking => {
    const now = new Date().toISOString();
    const newBooking: Booking = {
      id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      status: "pending_payment",
      createdAt: now,
      updatedAt: now,
    };

    setBookings((prev) => [...prev, newBooking]);

    // Dual-write: also save to API (fire-and-forget)
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: data.eventId,
        ticketCount: data.ticketCount,
        dietaryInfo: data.dietaryRestrictions.join(", ") + (data.otherDietary ? ` (${data.otherDietary})` : ""),
        specialRequests: data.specialRequests || null,
      }),
    }).catch(() => {
      // API save failed silently — localStorage is primary
    });

    return newBooking;
  }, []);

  const payBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const now = new Date().toISOString();
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: "pending_approval" as BookingStatus, paidAt: now, updatedAt: now }
          : b
      )
    );

    return true;
  }, []);

  const cancelBooking = useCallback((bookingId: string) => {
    const now = new Date().toISOString();
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: "cancelled" as BookingStatus, updatedAt: now }
          : b
      )
    );
  }, []);

  const getBookingById = useCallback(
    (bookingId: string): Booking | null => {
      return bookings.find((b) => b.id === bookingId) || null;
    },
    [bookings]
  );

  const getBookingsByGuestId = useCallback(
    (guestId: string): Booking[] => {
      return bookings.filter((b) => b.guestId === guestId);
    },
    [bookings]
  );

  const getBookingsByEventId = useCallback(
    (eventId: string): Booking[] => {
      return bookings.filter((b) => b.eventId === eventId);
    },
    [bookings]
  );

  const approveBooking = useCallback((bookingId: string) => {
    const now = new Date().toISOString();
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: "approved" as BookingStatus, approvedAt: now, updatedAt: now }
          : b
      )
    );

    // Dual-write to API
    fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    }).catch(() => {});
  }, []);

  const declineBooking = useCallback((bookingId: string, reason?: string) => {
    const now = new Date().toISOString();
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: "declined" as BookingStatus,
              declinedAt: now,
              declineReason: reason,
              updatedAt: now,
            }
          : b
      )
    );

    // Dual-write to API
    fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "decline", reason }),
    }).catch(() => {});
  }, []);

  const getPendingBookingsForHost = useCallback(
    (hostId: string, eventIds: string[]): Booking[] => {
      return bookings.filter(
        (b) =>
          eventIds.includes(b.eventId) &&
          b.status === "pending_approval"
      );
    },
    [bookings]
  );

  return (
    <BookingsContext.Provider
      value={{
        bookings,
        isLoaded,
        createBooking,
        payBooking,
        cancelBooking,
        getBookingById,
        getBookingsByGuestId,
        getBookingsByEventId,
        approveBooking,
        declineBooking,
        getPendingBookingsForHost,
      }}
    >
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings(): BookingsContextType {
  const context = useContext(BookingsContext);
  if (context === undefined) {
    throw new Error("useBookings must be used within a BookingsProvider");
  }
  return context;
}
