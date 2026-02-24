import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api/auth";
import { badRequest, forbidden, serverError } from "@/lib/api/errors";

// GET /api/reviews — get current user's reviews
export async function GET() {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;

    const reviews = await db.review.findMany({
      where: { authorId: result.user.id, isHostReview: false },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            host: { select: { businessName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return serverError();
  }
}

// POST /api/reviews — create a review
export async function POST(request: NextRequest) {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;

    const body = await request.json();
    const {
      eventId, overallRating, foodRating, communicationRating,
      valueRating, ambianceRating, text, photos,
    } = body;

    if (!eventId || !overallRating) {
      return badRequest("eventId i overallRating są wymagane");
    }

    if (overallRating < 1 || overallRating > 5) {
      return badRequest("Ocena musi być od 1 do 5");
    }

    // Check that user has a completed booking for this event
    const booking = await db.booking.findFirst({
      where: {
        eventId,
        guestId: result.user.id,
        status: { in: ["COMPLETED", "APPROVED"] },
      },
    });

    if (!booking) {
      return forbidden("Możesz oceniać tylko eventy, w których uczestniczyłeś");
    }

    // Check if user already reviewed this event
    const existingReview = await db.review.findFirst({
      where: {
        eventId,
        authorId: result.user.id,
        isHostReview: false,
      },
    });

    if (existingReview) {
      return badRequest("Już dodałeś opinię o tym evencie");
    }

    // Get the host's user ID for the subject
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: { host: { select: { userId: true } } },
    });

    if (!event) return badRequest("Event nie znaleziony");

    const review = await db.review.create({
      data: {
        eventId,
        authorId: result.user.id,
        subjectId: event.host.userId,
        overallRating,
        foodRating: foodRating || null,
        communicationRating: communicationRating || null,
        valueRating: valueRating || null,
        ambianceRating: ambianceRating || null,
        text: text || null,
        photos: photos || [],
        verifiedAttendee: true,
      },
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
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return serverError();
  }
}
