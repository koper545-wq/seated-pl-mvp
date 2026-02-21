import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireHost } from "@/lib/api/auth";
import { badRequest, serverError } from "@/lib/api/errors";
import { EventStatus, EventType, BookingMode } from "@prisma/client";

// GET /api/events — list published events with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const city = searchParams.get("city");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {
      status: EventStatus.PUBLISHED,
      date: { gte: new Date() }, // only future events
    };

    if (type && type !== "all") {
      where.eventType = type as EventType;
    }

    if (dateFrom) {
      where.date = { ...(where.date as object), gte: new Date(dateFrom) };
    }
    if (dateTo) {
      where.date = { ...(where.date as object), lte: new Date(dateTo) };
    }

    if (city) {
      where.locationPublic = { contains: city, mode: "insensitive" };
    }

    if (minPrice) {
      where.price = { ...(where.price as object || {}), gte: parseInt(minPrice) };
    }
    if (maxPrice) {
      where.price = { ...(where.price as object || {}), lte: parseInt(maxPrice) };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { cuisineTags: { hasSome: [search] } },
      ];
    }

    if (featured === "true") {
      where.featured = true;
    }

    const [events, total] = await Promise.all([
      db.event.findMany({
        where,
        include: {
          host: {
            include: {
              user: {
                select: { id: true, email: true },
              },
            },
          },
          _count: {
            select: { reviews: true, bookings: true },
          },
        },
        orderBy: { date: "asc" },
        take: limit,
        skip: offset,
      }),
      db.event.count({ where }),
    ]);

    return NextResponse.json({ events, total });
  } catch (error) {
    console.error("GET /api/events error:", error);
    return serverError();
  }
}

// POST /api/events — create event (host only)
export async function POST(request: NextRequest) {
  try {
    const result = await requireHost();
    if (result.error) return result.error;

    const body = await request.json();
    const {
      title, description, eventType, cuisineTags, images,
      date, startTime, duration, locationPublic, locationFull,
      price, capacity, menuDescription, dietaryOptions,
      byob, ageRequired, dressCode, whatToBring,
      bookingMode, cancellationPolicy, status,
    } = body;

    if (!title || !description || !date || !startTime || !price || !capacity) {
      return badRequest("Wymagane pola: title, description, date, startTime, price, capacity");
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[ąà]/g, "a").replace(/[ćč]/g, "c").replace(/[ęè]/g, "e")
      .replace(/[łl]/g, "l").replace(/[ńñ]/g, "n").replace(/[óò]/g, "o")
      .replace(/[śš]/g, "s").replace(/[źżž]/g, "z")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Date.now().toString(36);

    const event = await db.event.create({
      data: {
        hostId: result.hostProfileId,
        title,
        slug,
        description,
        eventType: (eventType as EventType) || EventType.OTHER,
        cuisineTags: cuisineTags || [],
        images: images || [],
        date: new Date(date),
        startTime,
        duration: duration || 180,
        locationPublic: locationPublic || "",
        locationFull: locationFull || "",
        price: Math.round(price), // expects grosze
        capacity,
        spotsLeft: capacity,
        menuDescription: menuDescription || null,
        dietaryOptions: dietaryOptions || [],
        byob: byob || false,
        ageRequired: ageRequired ?? true,
        dressCode: dressCode || null,
        whatToBring: whatToBring || null,
        bookingMode: (bookingMode as BookingMode) || BookingMode.MANUAL,
        cancellationPolicy: cancellationPolicy || null,
        status: status === "PUBLISHED" ? EventStatus.PUBLISHED : EventStatus.DRAFT,
      },
      include: {
        host: true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return serverError();
  }
}
