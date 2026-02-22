import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api/auth";
import { serverError } from "@/lib/api/errors";

// GET /api/admin/users — list users with search/filter
export async function GET(request: NextRequest) {
  try {
    const result = await requireAdmin();
    if (result.error) return result.error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {};

    if (role && role !== "all") {
      where.userType = role.toUpperCase();
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { guestProfile: { firstName: { contains: search, mode: "insensitive" } } },
        { guestProfile: { lastName: { contains: search, mode: "insensitive" } } },
        { hostProfile: { businessName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          guestProfile: true,
          hostProfile: true,
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.user.count({ where }),
    ]);

    const mapped = users.map((user) => ({
      id: user.id,
      email: user.email,
      userType: user.userType,
      status: user.status,
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt,
      firstName: user.guestProfile?.firstName || user.hostProfile?.businessName?.split(" ")[0] || "-",
      lastName: user.guestProfile?.lastName || "",
      city: user.hostProfile?.city || "-",
      bookingsCount: user._count.bookings,
      reviewsCount: user._count.reviews,
      hostProfile: user.hostProfile
        ? {
            id: user.hostProfile.id,
            businessName: user.hostProfile.businessName,
            verified: user.hostProfile.verified,
            city: user.hostProfile.city,
          }
        : null,
      guestProfile: user.guestProfile
        ? {
            id: user.guestProfile.id,
            firstName: user.guestProfile.firstName,
            lastName: user.guestProfile.lastName,
            xp: user.guestProfile.xp,
          }
        : null,
    }));

    return NextResponse.json({ users: mapped, total });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return serverError();
  }
}
