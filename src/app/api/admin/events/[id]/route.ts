import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api/auth";
import { serverError, badRequest } from "@/lib/api/errors";

// GET /api/admin/events/[id] — event detail with bookings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin();
    if (result.error) return result.error;

    const { id } = await params;

    const event = await db.event.findUnique({
      where: { id },
      include: {
        host: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
        bookings: {
          include: {
            guest: {
              select: { id: true, email: true, guestProfile: { select: { firstName: true, lastName: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        reviews: {
          include: {
            author: {
              select: { id: true, email: true, guestProfile: { select: { firstName: true, lastName: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Calculate revenue
    const revenue = await db.booking.aggregate({
      where: {
        eventId: event.id,
        status: { in: ["APPROVED", "COMPLETED"] },
      },
      _sum: { totalPrice: true, platformFee: true },
    });

    return NextResponse.json({
      event: {
        ...event,
        revenue: revenue._sum.totalPrice || 0,
        platformFeeTotal: revenue._sum.platformFee || 0,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/events/[id] error:", error);
    return serverError();
  }
}

// PATCH /api/admin/events/[id] — approve/reject/cancel event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin();
    if (result.error) return result.error;

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return badRequest("Status is required");
    }

    const validStatuses = ["PUBLISHED", "DRAFT", "CANCELLED", "PENDING_REVIEW"];
    if (!validStatuses.includes(status)) {
      return badRequest(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const event = await db.event.update({
      where: { id },
      data: { status },
      include: {
        host: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error("PATCH /api/admin/events/[id] error:", error);
    return serverError();
  }
}
