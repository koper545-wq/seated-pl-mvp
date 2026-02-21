// Data Access Layer for Bookings
// Server-side only — queries Prisma directly
import { db } from "@/lib/db";
import { BookingStatus } from "@prisma/client";
import { PLATFORM_COMMISSION_RATE } from "@/lib/constants";

export interface CreateBookingInput {
  eventId: string;
  guestUserId: string;
  ticketCount: number;
  dietaryInfo?: string;
  specialRequests?: string;
}

export interface BookingResult {
  id: string;
  eventId: string;
  guestId: string;
  ticketCount: number;
  totalPrice: number;    // grosze
  platformFee: number;   // grosze
  status: BookingStatus;
  createdAt: Date;
}

/** Create a new booking */
export async function createBookingInDb(input: CreateBookingInput): Promise<BookingResult> {
  const event = await db.event.findUnique({
    where: { id: input.eventId },
    select: { id: true, price: true, spotsLeft: true, capacity: true, status: true },
  });

  if (!event) throw new Error("Event not found");
  if (event.status !== "PUBLISHED") throw new Error("Event is not available for booking");
  if (event.spotsLeft < input.ticketCount) throw new Error("Not enough spots available");

  // Check for duplicate
  const existing = await db.booking.findFirst({
    where: {
      eventId: input.eventId,
      guestId: input.guestUserId,
      status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
    },
  });

  if (existing) throw new Error("You already have a booking for this event");

  // Calculate prices
  const totalPrice = event.price * input.ticketCount;
  const platformFee = Math.round(totalPrice * PLATFORM_COMMISSION_RATE);

  // Create booking and update spots in a transaction
  const booking = await db.$transaction(async (tx) => {
    const newBooking = await tx.booking.create({
      data: {
        eventId: input.eventId,
        guestId: input.guestUserId,
        ticketCount: input.ticketCount,
        totalPrice,
        platformFee,
        status: BookingStatus.PENDING,
        dietaryInfo: input.dietaryInfo || null,
        specialRequests: input.specialRequests || null,
      },
    });

    await tx.event.update({
      where: { id: input.eventId },
      data: { spotsLeft: { decrement: input.ticketCount } },
    });

    return newBooking;
  });

  return {
    id: booking.id,
    eventId: booking.eventId,
    guestId: booking.guestId,
    ticketCount: booking.ticketCount,
    totalPrice: booking.totalPrice,
    platformFee: booking.platformFee,
    status: booking.status,
    createdAt: booking.createdAt,
  };
}

/** Get bookings for a guest */
export async function getGuestBookings(guestUserId: string) {
  return db.booking.findMany({
    where: { guestId: guestUserId },
    include: {
      event: {
        include: {
          host: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Get bookings for a specific event (host view) */
export async function getEventBookings(eventId: string) {
  return db.booking.findMany({
    where: { eventId },
    include: {
      guest: {
        select: {
          id: true,
          email: true,
          guestProfile: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
              dietaryRestrictions: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Update booking status */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  reason?: string
) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, eventId: true, ticketCount: true, status: true },
  });

  if (!booking) throw new Error("Booking not found");

  const updateData: Record<string, unknown> = {
    status,
  };

  if (status === BookingStatus.APPROVED) {
    updateData.approvedAt = new Date();
  }
  if (status === BookingStatus.CANCELLED) {
    updateData.cancelledAt = new Date();
    updateData.cancelReason = reason || null;
  }

  const updated = await db.$transaction(async (tx) => {
    const result = await tx.booking.update({
      where: { id: bookingId },
      data: updateData,
    });

    // Restore spots if cancelling/declining
    if (
      (status === BookingStatus.CANCELLED || status === BookingStatus.DECLINED) &&
      booking.status !== BookingStatus.CANCELLED &&
      booking.status !== BookingStatus.DECLINED
    ) {
      await tx.event.update({
        where: { id: booking.eventId },
        data: { spotsLeft: { increment: booking.ticketCount } },
      });
    }

    return result;
  });

  return updated;
}
