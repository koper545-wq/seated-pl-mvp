import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";
import { UserType } from "@prisma/client";
import { notifyEmailVerification } from "@/lib/email/send";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email, password, userType, firstName, lastName,
      businessName, phoneNumber, city, cuisineSpecialties, description,
      ageVerified, hostSubtype,
      // Extended host onboarding fields
      experienceLevel, experienceDetails, eventTypes,
      address, nip, website, contactPerson,
    } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email i hasło są wymagane" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Hasło musi mieć minimum 8 znaków" },
        { status: 400 }
      );
    }

    if (!ageVerified) {
      return NextResponse.json(
        { error: "Musisz potwierdzić, że masz 18 lat" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Użytkownik z tym emailem już istnieje" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        userType: userType === "HOST" ? UserType.HOST : UserType.GUEST,
        ageVerified: true,
      },
    });

    // Create profile based on user type
    if (userType === "HOST") {
      await db.hostProfile.create({
        data: {
          userId: user.id,
          businessName: businessName || email.split("@")[0],
          phoneNumber: phoneNumber || null,
          city: city || "Wroclaw",
          cuisineSpecialties: Array.isArray(cuisineSpecialties) ? cuisineSpecialties : [],
          description: description || null,
          hostSubtype: hostSubtype || null,
          experienceLevel: experienceLevel || null,
          experienceDetails: experienceDetails || null,
          eventTypes: Array.isArray(eventTypes) ? eventTypes : [],
          address: address || null,
          nip: nip || null,
          website: website || null,
          contactPerson: contactPerson || null,
          onboardingCompleted: true,
        },
      });
    } else {
      await db.guestProfile.create({
        data: {
          userId: user.id,
          firstName: firstName || null,
          lastName: lastName || null,
        },
      });
    }

    // Generate verification token
    const token = crypto.randomUUID();
    await db.verificationToken.create({
      data: {
        token,
        email: user.email,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email
    const baseUrl = process.env.NEXTAUTH_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

    await notifyEmailVerification({
      email: user.email,
      verifyUrl,
    });

    return NextResponse.json(
      { message: "Konto zostało utworzone. Sprawdź email, aby zweryfikować konto.", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas rejestracji" },
      { status: 500 }
    );
  }
}
