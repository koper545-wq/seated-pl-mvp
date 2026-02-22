import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api/auth";
import { serverError } from "@/lib/api/errors";

// GET /api/host/onboarding — get current onboarding state
export async function GET() {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;

    const hostProfile = await db.hostProfile.findUnique({
      where: { userId: result.user.id },
      select: {
        id: true,
        hostSubtype: true,
        onboardingCompleted: true,
        businessName: true,
        description: true,
        phoneNumber: true,
        city: true,
        cuisineSpecialties: true,
        nip: true,
        website: true,
        address: true,
        contactPerson: true,
        experienceLevel: true,
        experienceDetails: true,
        eventTypes: true,
      },
    });

    if (!hostProfile) {
      return NextResponse.json(
        { error: "Profil hosta nie istnieje" },
        { status: 404 }
      );
    }

    return NextResponse.json({ hostProfile });
  } catch (error) {
    console.error("GET /api/host/onboarding error:", error);
    return serverError();
  }
}

// POST /api/host/onboarding — save onboarding data
export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;

    const hostProfile = await db.hostProfile.findUnique({
      where: { userId: result.user.id },
      select: { id: true, hostSubtype: true },
    });

    if (!hostProfile) {
      return NextResponse.json(
        { error: "Profil hosta nie istnieje" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      // Business fields
      nip,
      website,
      contactPerson, // { name, email, phone, position }
      // Individual fields
      experienceLevel, // "yes" | "no" | "professional"
      experienceDetails,
      // Common fields
      address, // { street, apartment, postalCode, city }
      eventTypes, // string[]
      description,
    } = body;

    const data: Record<string, unknown> = {
      onboardingCompleted: true,
    };

    // Business-specific
    if (nip !== undefined) data.nip = nip || null;
    if (website !== undefined) data.website = website || null;
    if (contactPerson !== undefined) data.contactPerson = contactPerson;

    // Individual-specific
    if (experienceLevel !== undefined) data.experienceLevel = experienceLevel;
    if (experienceDetails !== undefined) data.experienceDetails = experienceDetails || null;

    // Common
    if (address !== undefined) data.address = address;
    if (eventTypes !== undefined && Array.isArray(eventTypes)) data.eventTypes = eventTypes;
    if (description !== undefined) data.description = description || null;

    const updated = await db.hostProfile.update({
      where: { userId: result.user.id },
      data,
    });

    return NextResponse.json({
      message: "Onboarding zakończony pomyślnie",
      hostProfile: updated,
    });
  } catch (error) {
    console.error("POST /api/host/onboarding error:", error);
    return serverError();
  }
}
