import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser, requireHost } from "@/lib/api/auth";
import { notFound, forbidden, serverError, badRequest } from "@/lib/api/errors";
import { EventStatus } from "@prisma/client";

// GET /api/events/[id] — event details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await db.event.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        host: {
          include: {
            user: {
              select: { id: true, email: true },
            },
          },
        },
        reviews: {
          include: {
            author: {
              select: {
                id: true,
                guestProfile: {
                  select: { firstName: true, lastName: true, avatarUrl: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: {
          select: {
            reviews: true,
            bookings: {
              where: {
                status: { in: ["APPROVED", "COMPLETED"] },
              },
            },
          },
        },
      },
    });

    if (!event) return notFound("Event nie znaleziony");

    // If event is not published, only the host can see it
    if (event.status !== EventStatus.PUBLISHED && event.status !== EventStatus.COMPLETED) {
      const user = await getAuthUser();
      if (!user || event.host.userId !== user.id) {
        return notFound("Event nie znaleziony");
      }
    }

    // Increment view count
    await db.event.update({
      where: { id: event.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("GET /api/events/[id] error:", error);
    return serverError();
  }
}

// PATCH /api/events/[id] — update event (owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await requireHost();
    if (result.error) return result.error;

    const event = await db.event.findUnique({
      where: { id },
      select: { hostId: true },
    });

    if (!event) return notFound("Event nie znaleziony");
    if (event.hostId !== result.hostProfileId) return forbidden("Nie jesteś właścicielem tego eventu");

    const body = await request.json();

    // Don't allow changing certain fields after publishing
    const { hostId, id: _id, slug, createdAt, ...updateData } = body;

    // Handle date conversion
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const updated = await db.event.update({
      where: { id },
      data: updateData,
      include: { host: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/events/[id] error:", error);
    return serverError();
  }
}

// DELETE /api/events/[id] — cancel/delete event (owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await requireHost();
    if (result.error) return result.error;

    const event = await db.event.findUnique({
      where: { id },
      select: { hostId: true, status: true },
    });

    if (!event) return notFound("Event nie znaleziony");
    if (event.hostId !== result.hostProfileId) return forbidden("Nie jesteś właścicielem tego eventu");

    if (event.status === EventStatus.DRAFT) {
      // Delete draft events completely
      await db.event.delete({ where: { id } });
      return NextResponse.json({ message: "Event usunięty" });
    }

    if (event.status === EventStatus.PUBLISHED) {
      // Cancel published events (don't delete)
      await db.event.update({
        where: { id },
        data: { status: EventStatus.CANCELLED },
      });

      // Cancel all pending/approved bookings
      await db.booking.updateMany({
        where: {
          eventId: id,
          status: { in: ["PENDING", "APPROVED"] },
        },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelReason: "Event anulowany przez hosta",
        },
      });

      return NextResponse.json({ message: "Event anulowany" });
    }

    return badRequest("Nie można usunąć eventu w tym statusie");
  } catch (error) {
    console.error("DELETE /api/events/[id] error:", error);
    return serverError();
  }
}
