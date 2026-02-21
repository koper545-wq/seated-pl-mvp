import { api } from "./client";
import type { ApiEvent, EventsResponse } from "./types";

export interface EventFilters {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export async function fetchEvents(filters: EventFilters = {}): Promise<EventsResponse> {
  return api.get<EventsResponse>("/events", {
    params: {
      type: filters.type,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      city: filters.city,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      search: filters.search,
      featured: filters.featured,
      limit: filters.limit,
      offset: filters.offset,
    },
  });
}

export async function fetchEvent(idOrSlug: string): Promise<ApiEvent> {
  return api.get<ApiEvent>(`/events/${idOrSlug}`);
}

export async function createEvent(data: Partial<ApiEvent>): Promise<ApiEvent> {
  return api.post<ApiEvent>("/events", data);
}

export async function updateEvent(id: string, data: Partial<ApiEvent>): Promise<ApiEvent> {
  return api.patch<ApiEvent>(`/events/${id}`, data);
}

export async function deleteEvent(id: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/events/${id}`);
}

export async function fetchHostEvents(status?: string): Promise<ApiEvent[]> {
  return api.get<ApiEvent[]>("/host/events", {
    params: { status },
  });
}

export async function fetchEventGuests(eventId: string) {
  return api.get<{ bookings: unknown[]; eventTitle: string }>(`/events/${eventId}/guests`);
}
