import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { UserType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, userType, firstName, lastName, businessName, ageVerified } = body;

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

    return NextResponse.json(
      { message: "Konto zostało utworzone", userId: user.id },
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
