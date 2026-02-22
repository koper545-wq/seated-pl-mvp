import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api/auth";
import { serverError } from "@/lib/api/errors";

// GET /api/admin/events — list all events (any status)
export async function GET(request: NextRequest) {
  try {
    const result = await requireAdmin();
    if (result.error) return result.error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {};

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { locationPublic: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [events, total] = await Promise.all([
      db.event.findMany({
        where,
        include: {
          host: {
            include: {
              user: { select: { id: true, email: true } },
            },
          },
          _count: {
            select: { bookings: true, reviews: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.event.count({ where }),
    ]);

    // Calculate revenue per event from bookings
    const eventsWithRevenue = await Promise.all(
      events.map(async (event) => {
        const revenue = await db.booking.aggregate({
          where: {
            eventId: event.id,
            status: { in: ["APPROVED", "COMPLETED"] },
          },
          _sum: { totalPrice: true },
        });

        return {
          ...event,
          revenue: revenue._sum.totalPrice || 0,
        };
      })
    );

    return NextResponse.json({ events: eventsWithRevenue, total });
  } catch (error) {
    console.error("GET /api/admin/events error:", error);
    return serverError();
  }
}
