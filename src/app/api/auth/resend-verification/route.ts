import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { notifyEmailVerification } from "@/lib/email/send";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email jest wymagany" },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json(
        { message: "Jeśli konto istnieje, link weryfikacyjny został wysłany." },
        { status: 200 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email jest już zweryfikowany. Możesz się zalogować." },
        { status: 200 }
      );
    }

    // Delete any existing tokens for this email
    await db.verificationToken.deleteMany({
      where: { email },
    });

    // Generate new verification token
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
      { message: "Link weryfikacyjny został wysłany na Twój adres email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd. Spróbuj ponownie później." },
      { status: 500 }
    );
  }
}
