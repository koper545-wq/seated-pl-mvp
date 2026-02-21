import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api/auth";
import { badRequest, serverError } from "@/lib/api/errors";
import { notifyGuestBookingRequested, notifyHostNewBooking } from "@/lib/email/send";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

// GET /api/bookings — list bookings for current user
export async function GET(request: NextRequest) {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role"); // "guest" or "host"
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    if (role === "host") {
      // Show bookings for events I host
      const hostProfile = await db.hostProfile.findUnique({
        where: { userId: result.user.id },
        select: { id: true },
      });
      if (!hostProfile) {
        return NextResponse.json({ bookings: [], total: 0 });
      }
      where.event = { hostId: hostProfile.id };
    } else {
      // Default: show my bookings as guest
      where.guestId = result.user.id;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const bookings = await db.booking.findMany({
      where,
      include: {
        event: {
          include: {
            host: {
              include: {
                user: { select: { id: true, email: true } },
              },
            },
          },
        },
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
                allergies: true,
              },
            },
          },
        },
        transactions: {
          select: {
            type: true,
            amount: true,
            status: true,
            processedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings, total: bookings.length });
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    return serverError();
  }
}

// POST /api/bookings — create a booking
export async function POST(request: NextRequest) {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;

    const body = await request.json();
    const { eventId, ticketCount, dietaryInfo, specialRequests } = body;

    if (!eventId) return badRequest("eventId jest wymagane");

    const tickets = ticketCount || 1;

    // Fetch event
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: { host: true },
    });

    if (!event) return badRequest("Event nie znaleziony");
    if (event.status !== "PUBLISHED") return badRequest("Event nie jest dostępny do rezerwacji");
    if (event.spotsLeft < tickets) return badRequest(`Dostępnych miejsc: ${event.spotsLeft}`);

    // Check if user already has a booking for this event
    const existingBooking = await db.booking.findUnique({
      where: {
        eventId_guestId: {
          eventId,
          guestId: result.user.id,
        },
      },
    });

    if (existingBooking && existingBooking.status !== "CANCELLED") {
      return badRequest("Masz już rezerwację na ten event");
    }

    // Calculate prices
    const totalPrice = event.price * tickets;
    const platformFeeRate = 0.15; // 15%
    const platformFee = Math.round(totalPrice * platformFeeRate);

    // Determine initial status based on booking mode
    const initialStatus = event.bookingMode === "INSTANT" ? "APPROVED" : "PENDING";

    // Create booking (or update cancelled one)
    let booking;
    if (existingBooking && existingBooking.status === "CANCELLED") {
      booking = await db.booking.update({
        where: { id: existingBooking.id },
        data: {
          ticketCount: tickets,
          totalPrice,
          platformFee,
          status: initialStatus,
          dietaryInfo: dietaryInfo || null,
          specialRequests: specialRequests || null,
          cancelledAt: null,
          cancelReason: null,
          approvedAt: initialStatus === "APPROVED" ? new Date() : null,
        },
        include: {
          event: { include: { host: true } },
          guest: {
            select: {
              id: true,
              email: true,
              guestProfile: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      });
    } else {
      booking = await db.booking.create({
        data: {
          eventId,
          guestId: result.user.id,
          ticketCount: tickets,
          totalPrice,
          platformFee,
          status: initialStatus,
          dietaryInfo: dietaryInfo || null,
          specialRequests: specialRequests || null,
          approvedAt: initialStatus === "APPROVED" ? new Date() : null,
        },
        include: {
          event: { include: { host: true } },
          guest: {
            select: {
              id: true,
              email: true,
              guestProfile: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      });
    }

    // Update spots left
    await db.event.update({
      where: { id: eventId },
      data: { spotsLeft: { decrement: tickets } },
    });

    // Send email notifications (fire-and-forget)
    const guestName = [
      booking.guest?.guestProfile?.firstName,
      booking.guest?.guestProfile?.lastName,
    ].filter(Boolean).join(" ") || booking.guest?.email || "Gość";
    const eventDate = format(event.date, "d MMMM yyyy", { locale: pl });
    const hostName = event.host.businessName;
    const hostEmail = (await db.user.findUnique({
      where: { id: event.host.userId },
      select: { email: true },
    }))?.email;

    // Notify guest
    notifyGuestBookingRequested({
      guestEmail: booking.guest?.email || "",
      guestName,
      eventTitle: event.title,
      eventDate,
      eventTime: event.startTime,
      hostName,
      ticketCount: tickets,
      totalPrice: totalPrice / 100, // grosze → PLN
    }).catch(console.error);

    // Notify host
    if (hostEmail) {
      notifyHostNewBooking({
        hostEmail,
        hostName,
        guestName,
        guestEmail: booking.guest?.email || "",
        eventTitle: event.title,
        eventDate,
        ticketCount: tickets,
        totalPrice: totalPrice / 100,
        dietaryInfo: dietaryInfo || undefined,
        specialRequests: specialRequests || undefined,
        dashboardLink: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/host`,
      }).catch(console.error);
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("POST /api/bookings error:", error);
    return serverError();
  }
}
