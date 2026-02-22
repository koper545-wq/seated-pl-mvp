import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api/auth";
import { serverError, badRequest } from "@/lib/api/errors";
import { notifyHostApplicationApproved } from "@/lib/email";

// GET /api/admin/hosts/[id] — get host profile details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin();
    if (result.error) return result.error;

    const { id } = await params;

    const host = await db.hostProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            createdAt: true,
            guestProfile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        events: {
          select: {
            id: true,
            title: true,
            status: true,
            date: true,
            price: true,
            capacity: true,
            spotsLeft: true,
            locationPublic: true,
            _count: { select: { bookings: true } },
          },
          orderBy: { date: "desc" },
          take: 20,
        },
      },
    });

    if (!host) {
      return NextResponse.json(
        { error: "Host nie znaleziony" },
        { status: 404 }
      );
    }

    // Calculate stats
    const eventsCount = await db.event.count({
      where: { hostId: id },
    });
    const publishedEvents = await db.event.count({
      where: { hostId: id, status: "PUBLISHED" },
    });
    const totalBookings = await db.booking.count({
      where: { event: { hostId: id } },
    });
    const revenueResult = await db.transaction.aggregate({
      where: {
        booking: { event: { hostId: id } },
        status: "COMPLETED",
      },
      _sum: { amount: true },
    });

    return NextResponse.json({
      host: {
        ...host,
        eventsCount,
        publishedEvents,
        totalBookings,
        totalRevenue: revenueResult._sum.amount || 0,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/hosts/[id] error:", error);
    return serverError();
  }
}

// PATCH /api/admin/hosts/[id] — update host profile fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin();
    if (result.error) return result.error;

    const { id } = await params;
    const body = await request.json();
    const { verified, businessName, description, phoneNumber, city, cuisineSpecialties, resendApprovalEmail } = body;

    // Handle resending approval email
    if (resendApprovalEmail) {
      const hostProfile = await db.hostProfile.findUnique({
        where: { id },
        include: { user: { select: { email: true } } },
      });
      if (!hostProfile) return badRequest("Host not found");

      await notifyHostApplicationApproved({
        hostEmail: hostProfile.user.email,
        hostName: hostProfile.businessName,
        dashboardLink: `${process.env.NEXTAUTH_URL || "https://seated-pl-mvp.vercel.app"}/dashboard/host`,
      });

      return NextResponse.json({ message: "Approval email resent" });
    }

    const data: Record<string, unknown> = {};

    if (typeof verified === "boolean") data.verified = verified;
    if (businessName !== undefined) data.businessName = businessName;
    if (description !== undefined) data.description = description;
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
    if (city !== undefined) data.city = city;
    if (cuisineSpecialties !== undefined) data.cuisineSpecialties = cuisineSpecialties;

    if (Object.keys(data).length === 0) {
      return badRequest("No fields to update");
    }

    const host = await db.hostProfile.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, email: true } },
      },
    });

    // Send approval email when host is verified (fire-and-forget)
    if (typeof verified === "boolean" && verified && host.user.email) {
      notifyHostApplicationApproved({
        hostEmail: host.user.email,
        hostName: host.businessName,
        dashboardLink: `${process.env.NEXTAUTH_URL || "https://seated-pl-mvp.vercel.app"}/dashboard/host`,
      }).catch(console.error);
    }

    return NextResponse.json({ host });
  } catch (error) {
    console.error("PATCH /api/admin/hosts/[id] error:", error);
    return serverError();
  }
}

// DELETE /api/admin/hosts/[id] — delete host profile (demote to guest)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin();
    if (result.error) return result.error;

    const { id } = await params;

    const hostProfile = await db.hostProfile.findUnique({
      where: { id },
      select: { id: true, userId: true, businessName: true },
    });

    if (!hostProfile) {
      return NextResponse.json({ error: "Host not found" }, { status: 404 });
    }

    // Delete host profile — cascade deletes events
    await db.hostProfile.delete({ where: { id } });

    // Change user type to GUEST
    await db.user.update({
      where: { id: hostProfile.userId },
      data: { userType: "GUEST" },
    });

    // Create guest profile if it doesn't exist
    const existingGuest = await db.guestProfile.findUnique({
      where: { userId: hostProfile.userId },
    });

    if (!existingGuest) {
      await db.guestProfile.create({
        data: {
          userId: hostProfile.userId,
          firstName: hostProfile.businessName,
        },
      });
    }

    return NextResponse.json({
      message: `Profil hosta "${hostProfile.businessName}" został usunięty. Użytkownik zmieniony na gościa.`,
    });
  } catch (error) {
    console.error("DELETE /api/admin/hosts/[id] error:", error);
    return serverError();
  }
}
