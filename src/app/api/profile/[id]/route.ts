import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notFound, serverError } from "@/lib/api/errors";

// GET /api/profile/[id] — public profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        userType: true,
        createdAt: true,
        guestProfile: {
          select: {
            firstName: true,
            lastName: true,
            bio: true,
            avatarUrl: true,
            xp: true,
          },
        },
        hostProfile: {
          select: {
            businessName: true,
            description: true,
            avatarUrl: true,
            coverUrl: true,
            city: true,
            neighborhood: true,
            cuisineSpecialties: true,
            verified: true,
            responseRate: true,
            responseTime: true,
          },
        },
        _count: {
          select: {
            bookings: { where: { status: "COMPLETED" } },
            reviews: { where: { isHostReview: false } },
          },
        },
      },
    });

    if (!user) return notFound("Użytkownik nie znaleziony");

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/profile/[id] error:", error);
    return serverError();
  }
}
