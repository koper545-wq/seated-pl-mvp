import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api/auth";
import { notFound, forbidden, badRequest, serverError } from "@/lib/api/errors";
import { BookingStatus } from "@prisma/client";
import { notifyGuestBookingApproved, notifyGuestBookingDeclined, notifyHostBookingCancelled } from "@/lib/email/send";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

// GET /api/bookings/[id] — booking details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await requireAuth();
    if (result.error) return result.error;

    const booking = await db.booking.findUnique({
      where: { id },
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
        transactions: true,
      },
    });

    if (!booking) return notFound("Rezerwacja nie znaleziona");

    // Check access: guest or host of the event
    const isGuest = booking.guestId === result.user.id;
    const isHost = booking.event.host.userId === result.user.id;
    if (!isGuest && !isHost) return forbidden();

    return NextResponse.json(booking);
  } catch (error) {
    console.error("GET /api/bookings/[id] error:", error);
    return serverError();
  }
}

// PATCH /api/bookings/[id] — update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await requireAuth();
    if (result.error) return result.error;

    const booking = await db.booking.findUnique({
      where: { id },
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
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!booking) return notFound("Rezerwacja nie znaleziona");

    const isGuest = booking.guestId === result.user.id;
    const isHost = booking.event.host.userId === result.user.id;
    if (!isGuest && !isHost) return forbidden();

    const body = await request.json();
    const { action, reason } = body;

    switch (action) {
      case "approve": {
        if (!isHost) return forbidden("Tylko host może zatwierdzić rezerwację");
        if (booking.status !== "PENDING") return badRequest("Rezerwacja nie jest w statusie oczekującym");

        const updated = await db.booking.update({
          where: { id },
          data: {
            status: BookingStatus.APPROVED,
            approvedAt: new Date(),
          },
          include: { event: { include: { host: true } }, guest: true },
        });

        // Notify guest about approval
        const guestName = [
          booking.guest?.guestProfile?.firstName,
          booking.guest?.guestProfile?.lastName,
        ].filter(Boolean).join(" ") || booking.guest?.email || "Gość";

        notifyGuestBookingApproved({
          guestEmail: booking.guest?.email || "",
          guestName,
          eventTitle: booking.event.title,
          eventDate: format(booking.event.date, "d MMMM yyyy", { locale: pl }),
          eventTime: booking.event.startTime,
          eventDuration: booking.event.duration,
          hostName: booking.event.host.businessName,
          fullAddress: booking.event.locationFull,
          neighborhood: booking.event.locationPublic,
          ticketCount: booking.ticketCount,
          totalPrice: booking.totalPrice / 100,
          menuDescription: booking.event.menuDescription || "",
          dietaryOptions: booking.event.dietaryOptions,
          whatToBring: booking.event.whatToBring || undefined,
        }).catch(console.error);

        return NextResponse.json(updated);
      }

      case "decline": {
        if (!isHost) return forbidden("Tylko host może odrzucić rezerwację");
        if (booking.status !== "PENDING") return badRequest("Rezerwacja nie jest w statusie oczekującym");

        const updated = await db.booking.update({
          where: { id },
          data: {
            status: BookingStatus.DECLINED,
            cancelledAt: new Date(),
            cancelReason: reason || "Odrzucone przez hosta",
          },
        });

        // Restore spots
        await db.event.update({
          where: { id: booking.eventId },
          data: { spotsLeft: { increment: booking.ticketCount } },
        });

        // Notify guest about decline
        const declineGuestName = [
          booking.guest?.guestProfile?.firstName,
          booking.guest?.guestProfile?.lastName,
        ].filter(Boolean).join(" ") || booking.guest?.email || "Gość";

        notifyGuestBookingDeclined({
          guestEmail: booking.guest?.email || "",
          guestName: declineGuestName,
          eventTitle: booking.event.title,
          eventDate: format(booking.event.date, "d MMMM yyyy", { locale: pl }),
          hostName: booking.event.host.businessName,
          reason: reason || undefined,
        }).catch(console.error);

        return NextResponse.json(updated);
      }

      case "cancel": {
        // Both guest and host can cancel
        if (!["PENDING", "APPROVED"].includes(booking.status)) {
          return badRequest("Nie można anulować rezerwacji w tym statusie");
        }

        const updated = await db.booking.update({
          where: { id },
          data: {
            status: BookingStatus.CANCELLED,
            cancelledAt: new Date(),
            cancelReason: reason || (isHost ? "Anulowane przez hosta" : "Anulowane przez gościa"),
          },
        });

        // Restore spots
        await db.event.update({
          where: { id: booking.eventId },
          data: { spotsLeft: { increment: booking.ticketCount } },
        });

        // Notify host when guest cancels
        if (isGuest) {
          const cancelGuestName = [
            booking.guest?.guestProfile?.firstName,
            booking.guest?.guestProfile?.lastName,
          ].filter(Boolean).join(" ") || booking.guest?.email || "Gość";

          const hostEmail = booking.event.host.user?.email;
          if (hostEmail) {
            notifyHostBookingCancelled({
              hostEmail,
              hostName: booking.event.host.businessName,
              guestName: cancelGuestName,
              eventTitle: booking.event.title,
              eventDate: format(booking.event.date, "d MMMM yyyy", { locale: pl }),
              ticketCount: booking.ticketCount,
              reason: reason || undefined,
            }).catch(console.error);
          }
        }

        return NextResponse.json(updated);
      }

      case "complete": {
        if (!isHost) return forbidden("Tylko host może oznaczyć jako zakończone");
        if (booking.status !== "APPROVED") return badRequest("Rezerwacja musi być zatwierdzona");

        const updated = await db.booking.update({
          where: { id },
          data: { status: BookingStatus.COMPLETED },
        });

        return NextResponse.json(updated);
      }

      default:
        return badRequest("Nieznana akcja. Użyj: approve, decline, cancel, complete");
    }
  } catch (error) {
    console.error("PATCH /api/bookings/[id] error:", error);
    return serverError();
  }
}
