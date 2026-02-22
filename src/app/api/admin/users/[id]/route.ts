import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api/auth";
import { serverError, badRequest } from "@/lib/api/errors";
import { sendEmail } from "@/lib/email/send";
import { emailVerification } from "@/lib/email/templates";

// GET /api/admin/users/[id] — user detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin();
    if (result.error) return result.error;

    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      include: {
        guestProfile: true,
        hostProfile: {
          include: {
            events: {
              select: { id: true, title: true, status: true, date: true, price: true },
              orderBy: { date: "desc" },
            },
          },
        },
        bookings: {
          include: {
            event: {
              select: { id: true, title: true, date: true, price: true, locationPublic: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        reviews: {
          select: { id: true, overallRating: true, text: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET /api/admin/users/[id] error:", error);
    return serverError();
  }
}

// PATCH /api/admin/users/[id] — update user status/role/emailVerified
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin();
    if (result.error) return result.error;

    const { id } = await params;
    const body = await request.json();
    const { status, userType, emailVerified, sendVerificationEmail } = body;

    // Handle sending verification email
    if (sendVerificationEmail) {
      const targetUser = await db.user.findUnique({ where: { id } });
      if (!targetUser) return badRequest("User not found");

      // Delete existing tokens
      await db.verificationToken.deleteMany({ where: { email: targetUser.email } });

      // Create new token
      const token = crypto.randomUUID();
      await db.verificationToken.create({
        data: {
          token,
          email: targetUser.email,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      const baseUrl = process.env.NEXTAUTH_URL || "https://seated-pl-mvp.vercel.app";
      const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

      await sendEmail({
        to: targetUser.email,
        template: emailVerification({ verifyUrl }),
      });

      return NextResponse.json({ message: "Verification email sent" });
    }

    const data: Record<string, unknown> = {};

    if (status) {
      if (!["ACTIVE", "SUSPENDED", "BANNED"].includes(status)) {
        return badRequest("Invalid status");
      }
      data.status = status;
    }

    if (userType) {
      if (!["GUEST", "HOST", "ADMIN"].includes(userType)) {
        return badRequest("Invalid userType");
      }
      data.userType = userType;
    }

    if (typeof emailVerified === "boolean") {
      data.emailVerified = emailVerified ? new Date() : null;
    }

    if (Object.keys(data).length === 0) {
      return badRequest("No fields to update");
    }

    const user = await db.user.update({
      where: { id },
      data,
      include: {
        guestProfile: true,
        hostProfile: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return serverError();
  }
}

// DELETE /api/admin/users/[id] — delete user account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin();
    if (result.error) return result.error;

    const { id } = await params;

    // Don't allow deleting own account
    if (id === result.user.id) {
      return badRequest("Nie można usunąć własnego konta");
    }

    // Check user exists
    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, userType: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't allow deleting other admins
    if (user.userType === "ADMIN") {
      return badRequest("Nie można usunąć konta administratora");
    }

    // Delete user — cascade will handle relations (guestProfile, hostProfile, bookings, reviews, etc.)
    await db.user.delete({ where: { id } });

    return NextResponse.json({ message: "Konto zostało usunięte", deletedEmail: user.email });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return serverError();
  }
}
