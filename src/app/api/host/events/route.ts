import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireHost } from "@/lib/api/auth";
import { serverError } from "@/lib/api/errors";

// GET /api/host/events — list all events for the authenticated host
export async function GET(request: NextRequest) {
  try {
    const result = await requireHost();
    if (result.error) return result.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {
      hostId: result.hostProfileId,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    const events = await db.event.findMany({
      where,
      include: {
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
        bookings: {
          select: {
            ticketCount: true,
            totalPrice: true,
            platformFee: true,
            status: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Compute stats for each event
    const eventsWithStats = events.map((event) => {
      const approvedBookings = event.bookings.filter(
        (b) => b.status === "APPROVED" || b.status === "COMPLETED"
      );
      const revenue = approvedBookings.reduce(
        (sum, b) => sum + (b.totalPrice - b.platformFee),
        0
      );
      const totalGuests = approvedBookings.reduce(
        (sum, b) => sum + b.ticketCount,
        0
      );
      const pendingBookings = event.bookings.filter(
        (b) => b.status === "PENDING"
      ).length;

      return {
        ...event,
        bookings: undefined, // don't expose raw booking data
        revenue,
        totalGuests,
        pendingBookings,
      };
    });

    return NextResponse.json({ events: eventsWithStats });
  } catch (error) {
    console.error("GET /api/host/events error:", error);
    return serverError();
  }
}
