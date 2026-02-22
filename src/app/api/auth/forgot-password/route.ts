import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { notifyPasswordReset } from "@/lib/email/send";

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

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json(
      { message: "Jeśli konto istnieje, link do resetowania hasła został wysłany." },
      { status: 200 }
    );

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return successResponse;
    }

    // Delete any existing reset tokens for this email
    await db.passwordResetToken.deleteMany({
      where: { email },
    });

    // Generate new reset token
    const token = crypto.randomUUID();
    await db.passwordResetToken.create({
      data: {
        token,
        email: user.email,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Send reset email
    const baseUrl = process.env.NEXTAUTH_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await notifyPasswordReset({
      email: user.email,
      resetUrl,
    });

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd. Spróbuj ponownie później." },
      { status: 500 }
    );
  }
}
