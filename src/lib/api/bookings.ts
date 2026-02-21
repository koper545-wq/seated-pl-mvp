import { api } from "./client";
import type { ApiBooking, BookingsResponse } from "./types";

export async function fetchBookings(role?: "guest" | "host", status?: string): Promise<BookingsResponse> {
  return api.get<BookingsResponse>("/bookings", {
    params: { role, status },
  });
}

export async function fetchBooking(id: string): Promise<ApiBooking> {
  return api.get<ApiBooking>(`/bookings/${id}`);
}

export async function createBooking(data: {
  eventId: string;
  ticketCount?: number;
  dietaryInfo?: string;
  specialRequests?: string;
}): Promise<ApiBooking> {
  return api.post<ApiBooking>("/bookings", data);
}

export async function updateBookingStatus(
  id: string,
  action: "approve" | "decline" | "cancel" | "complete",
  reason?: string
): Promise<ApiBooking> {
  return api.patch<ApiBooking>(`/bookings/${id}`, { action, reason });
}
