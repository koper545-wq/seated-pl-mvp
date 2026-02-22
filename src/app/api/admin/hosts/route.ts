import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api/auth";
import { serverError } from "@/lib/api/errors";

// GET /api/admin/hosts — list host profiles
export async function GET(request: NextRequest) {
  try {
    const result = await requireAdmin();
    if (result.error) return result.error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const verified = searchParams.get("verified");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {};

    if (verified === "true") {
      where.verified = true;
    } else if (verified === "false") {
      where.verified = false;
    }

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [hosts, total] = await Promise.all([
      db.hostProfile.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, status: true, createdAt: true },
          },
          events: {
            select: { id: true, status: true, price: true },
          },
          _count: {
            select: { events: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.hostProfile.count({ where }),
    ]);

    const mapped = hosts.map((host) => ({
      id: host.id,
      userId: host.userId,
      businessName: host.businessName,
      description: host.description,
      city: host.city,
      neighborhood: host.neighborhood || "",
      verified: host.verified,
      cuisineSpecialties: host.cuisineSpecialties,
      responseRate: host.responseRate || 0,
      responseTime: host.responseTime,
      rating: 0, // TODO: compute from reviews
      reviewCount: 0, // TODO: compute from reviews
      createdAt: host.createdAt,
      user: host.user,
      eventsCount: host._count.events,
      publishedEvents: host.events.filter((e) => e.status === "PUBLISHED").length,
    }));

    return NextResponse.json({ hosts: mapped, total });
  } catch (error) {
    console.error("GET /api/admin/hosts error:", error);
    return serverError();
  }
}
