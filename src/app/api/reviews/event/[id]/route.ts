import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notFound, serverError } from "@/lib/api/errors";

// GET /api/reviews/event/[id] — get reviews for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await db.event.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!event) return notFound("Event nie znaleziony");

    const reviews = await db.review.findMany({
      where: {
        eventId: id,
        isHostReview: false,
      },
      include: {
        author: {
          select: {
            id: true,
            guestProfile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate averages
    const avgRatings = await db.review.aggregate({
      where: { eventId: id, isHostReview: false },
      _avg: {
        overallRating: true,
        foodRating: true,
        communicationRating: true,
        valueRating: true,
        ambianceRating: true,
      },
      _count: true,
    });

    return NextResponse.json({
      reviews,
      averages: avgRatings._avg,
      total: avgRatings._count,
    });
  } catch (error) {
    console.error("GET /api/reviews/event/[id] error:", error);
    return serverError();
  }
}
