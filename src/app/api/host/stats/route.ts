import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireHost } from "@/lib/api/auth";
import { serverError } from "@/lib/api/errors";

// GET /api/host/stats — dashboard statistics for host
export async function GET() {
  try {
    const result = await requireHost();
    if (result.error) return result.error;

    const now = new Date();

    // Upcoming events count
    const upcomingEvents = await db.event.count({
      where: {
        hostId: result.hostProfileId,
        status: "PUBLISHED",
        date: { gte: now },
      },
    });

    // Pending bookings count (awaiting approval)
    const pendingBookings = await db.booking.count({
      where: {
        event: { hostId: result.hostProfileId },
        status: "PENDING",
      },
    });

    // Total revenue (from approved/completed bookings)
    const revenueBookings = await db.booking.findMany({
      where: {
        event: { hostId: result.hostProfileId },
        status: { in: ["APPROVED", "COMPLETED"] },
      },
      select: {
        totalPrice: true,
        platformFee: true,
      },
    });

    const totalRevenue = revenueBookings.reduce(
      (sum, b) => sum + (b.totalPrice - b.platformFee),
      0
    ); // in grosze

    // Total events count
    const totalEvents = await db.event.count({
      where: { hostId: result.hostProfileId },
    });

    // Average rating
    const reviews = await db.review.aggregate({
      where: {
        event: { hostId: result.hostProfileId },
        isHostReview: false,
      },
      _avg: { overallRating: true },
      _count: true,
    });

    return NextResponse.json({
      upcomingEvents,
      pendingBookings,
      totalRevenue, // in grosze
      totalEvents,
      averageRating: reviews._avg.overallRating || 0,
      reviewCount: reviews._count,
    });
  } catch (error) {
    console.error("GET /api/host/stats error:", error);
    return serverError();
  }
}
