import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=missing_token", request.url));
    }

    // Find verification token
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
    }

    // Check if expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await db.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      return NextResponse.redirect(new URL("/login?error=expired_token", request.url));
    }

    // Set emailVerified on User
    await db.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: new Date() },
    });

    // Delete used token
    await db.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    // Redirect to login with email pre-filled for convenience
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("verified", "true");
    loginUrl.searchParams.set("email", verificationToken.email);
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(new URL("/login?error=verification_failed", request.url));
  }
}
