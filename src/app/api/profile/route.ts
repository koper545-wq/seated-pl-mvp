import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api/auth";
import { serverError } from "@/lib/api/errors";

// GET /api/profile — get current user's profile
export async function GET() {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;

    const user = await db.user.findUnique({
      where: { id: result.user.id },
      include: {
        guestProfile: true,
        hostProfile: true,
        _count: {
          select: {
            bookings: true,
            reviews: { where: { isHostReview: false } },
          },
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return serverError();
  }
}

// PATCH /api/profile — update profile
export async function PATCH(request: NextRequest) {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;

    const body = await request.json();
    const { firstName, lastName, bio, avatarUrl, dietaryRestrictions, allergies, language } = body;

    // Update user language if provided
    if (language) {
      await db.user.update({
        where: { id: result.user.id },
        data: { language },
      });
    }

    // Update guest profile
    const guestProfile = await db.guestProfile.findUnique({
      where: { userId: result.user.id },
    });

    if (guestProfile) {
      await db.guestProfile.update({
        where: { userId: result.user.id },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(bio !== undefined && { bio }),
          ...(avatarUrl !== undefined && { avatarUrl }),
          ...(dietaryRestrictions !== undefined && { dietaryRestrictions }),
          ...(allergies !== undefined && { allergies }),
        },
      });
    }

    // Update host profile if applicable
    const { businessName, description, phoneNumber, city, neighborhood, cuisineSpecialties, becomeHost } = body;
    const hostProfile = await db.hostProfile.findUnique({
      where: { userId: result.user.id },
    });

    if (hostProfile) {
      await db.hostProfile.update({
        where: { userId: result.user.id },
        data: {
          ...(businessName !== undefined && { businessName }),
          ...(description !== undefined && { description }),
          ...(phoneNumber !== undefined && { phoneNumber }),
          ...(city !== undefined && { city }),
          ...(neighborhood !== undefined && { neighborhood }),
          ...(cuisineSpecialties !== undefined && { cuisineSpecialties }),
          ...(avatarUrl !== undefined && { avatarUrl }),
        },
      });
    } else if (becomeHost && businessName) {
      // Create new host profile for existing guest user
      await db.$transaction(async (tx) => {
        await tx.hostProfile.create({
          data: {
            userId: result.user.id,
            businessName,
            description: description || null,
            phoneNumber: phoneNumber || null,
            city: city || "Wrocław",
            neighborhood: neighborhood || null,
            cuisineSpecialties: cuisineSpecialties || [],
            avatarUrl: avatarUrl || null,
          },
        });

        await tx.user.update({
          where: { id: result.user.id },
          data: { userType: "HOST" },
        });
      });
    }

    // Return updated profile
    const updatedUser = await db.user.findUnique({
      where: { id: result.user.id },
      include: { guestProfile: true, hostProfile: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PATCH /api/profile error:", error);
    return serverError();
  }
}
