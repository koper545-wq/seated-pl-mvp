import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api/auth";
import { serverError } from "@/lib/api/errors";
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

// PATCH /api/admin/hosts/[id] — toggle verified status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin();
    if (result.error) return result.error;

    const { id } = await params;
    const body = await request.json();
    const { verified } = body;

    if (typeof verified !== "boolean") {
      return NextResponse.json(
        { error: "verified must be a boolean" },
        { status: 400 }
      );
    }

    const host = await db.hostProfile.update({
      where: { id },
      data: { verified },
      include: {
        user: { select: { id: true, email: true } },
      },
    });

    // Send approval email when host is verified (fire-and-forget)
    if (verified && host.user.email) {
      notifyHostApplicationApproved({
        hostEmail: host.user.email,
        hostName: host.businessName,
        dashboardLink: `${process.env.NEXTAUTH_URL || "https://seated-pl-mvp.vercel.app"}/host/dashboard`,
      }).catch(console.error);
    }

    return NextResponse.json({ host });
  } catch (error) {
    console.error("PATCH /api/admin/hosts/[id] error:", error);
    return serverError();
  }
}
