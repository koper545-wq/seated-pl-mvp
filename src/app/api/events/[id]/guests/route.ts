import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireHost } from "@/lib/api/auth";
import { notFound, forbidden, serverError } from "@/lib/api/errors";

// GET /api/events/[id]/guests — list guests for an event (host only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await requireHost();
    if (result.error) return result.error;

    const event = await db.event.findUnique({
      where: { id },
      select: { hostId: true, title: true },
    });

    if (!event) return notFound("Event nie znaleziony");
    if (event.hostId !== result.hostProfileId) return forbidden();

    const bookings = await db.booking.findMany({
      where: { eventId: id },
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
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 10,
              include: {
                sender: {
                  select: {
                    id: true,
                    guestProfile: { select: { firstName: true } },
                    hostProfile: { select: { businessName: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings, eventTitle: event.title });
  } catch (error) {
    console.error("GET /api/events/[id]/guests error:", error);
    return serverError();
  }
}
