import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api/auth";
import { serverError, badRequest } from "@/lib/api/errors";

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

// PATCH /api/admin/users/[id] — update user status/role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin();
    if (result.error) return result.error;

    const { id } = await params;
    const body = await request.json();
    const { status, userType } = body;

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
