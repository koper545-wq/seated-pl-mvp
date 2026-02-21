// Data Access Layer for Events
// Server-side only — queries Prisma directly and returns frontend-compatible types
import { db } from "@/lib/db";
import { EventStatus, EventType } from "@prisma/client";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

// Frontend-compatible event type (matches MockEvent structure)
export interface FrontendEvent {
  id: string;
  title: string;
  slug: string;
  type: string;          // human-readable label like "Supper Club"
  typeSlug: string;       // slug like "supper-club"
  date: Date;
  dateFormatted: string;  // "Sob, 21 Lut · 19:00"
  startTime: string;
  duration: number;
  location: string;       // public location (city/neighborhood)
  locationSlug: string;
  fullAddress: string;
  price: number;          // in PLN (not grosze!)
  capacity: number;
  spotsLeft: number;
  imageGradient: string;
  description: string;
  menuDescription: string;
  dietaryOptions: string[];
  whatToBring: string;
  languages?: string[];
  host: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    eventsHosted: number;
    verified: boolean;
  };
  // DB-only fields
  eventType: EventType;
  status: EventStatus;
  cuisineTags: string[];
  images: string[];
  byob: boolean;
  bookingMode: string;
}

// Frontend-compatible host event type (matches HostEvent structure)
export interface FrontendHostEvent {
  id: string;
  title: string;
  slug: string;
  type: string;
  typeSlug: string;
  date: Date;
  dateFormatted: string;
  startTime: string;
  duration: number;
  location: string;
  locationSlug?: string;
  fullAddress: string;
  price: number;          // in PLN
  capacity: number;
  spotsLeft: number;
  bookingsCount: number;
  pendingBookings: number;
  confirmedGuests: number;
  revenue: number;        // in PLN
  imageGradient: string;
  status: string;         // lowercase: "published", "draft", etc.
  description: string;
  menuDescription: string;
  dietaryOptions: string[];
  createdAt: Date;
}

// Event type label mapping
const EVENT_TYPE_LABELS: Record<string, string> = {
  SUPPER_CLUB: "Supper Club",
  CHEFS_TABLE: "Chef's Table",
  POPUP: "Pop-up",
  COOKING_CLASS: "Warsztaty",
  WINE_TASTING: "Degustacje",
  ACTIVE_FOOD: "Active + Food",
  FARM_EXPERIENCE: "Farm Experience",
  RESTAURANT_COLLAB: "Kolaboracja restauracyjna",
  OTHER: "Inne",
};

// Event type slug mapping
const EVENT_TYPE_SLUGS: Record<string, string> = {
  SUPPER_CLUB: "supper-club",
  CHEFS_TABLE: "chefs-table",
  POPUP: "popup",
  COOKING_CLASS: "warsztaty",
  WINE_TASTING: "degustacje",
  ACTIVE_FOOD: "active-food",
  FARM_EXPERIENCE: "farm",
  RESTAURANT_COLLAB: "restaurant-collab",
  OTHER: "other",
};

// Image gradients for events without photos
const GRADIENTS = [
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-purple-500",
  "from-blue-400 to-indigo-500",
  "from-yellow-400 to-amber-500",
  "from-red-400 to-rose-500",
  "from-cyan-400 to-blue-500",
];

function getGradient(id: string): string {
  // Deterministic gradient based on ID hash
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function formatEventDate(date: Date, startTime: string): string {
  try {
    return format(date, "EEE, d MMM", { locale: pl }) + " · " + startTime;
  } catch {
    return startTime;
  }
}

function statusToLowercase(status: EventStatus): string {
  const map: Record<string, string> = {
    DRAFT: "draft",
    PENDING_REVIEW: "pending_review",
    PUBLISHED: "published",
    CANCELLED: "cancelled",
    COMPLETED: "completed",
  };
  return map[status] || status.toLowerCase();
}

// ============================================
// PUBLIC QUERIES
// ============================================

/** Get all published future events */
export async function getPublishedEvents(filters?: {
  type?: string;
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}): Promise<FrontendEvent[]> {
  const where: Record<string, unknown> = {
    status: EventStatus.PUBLISHED,
    date: { gte: new Date() },
  };

  if (filters?.type && filters.type !== "all") {
    // Convert slug to enum: "supper-club" → "SUPPER_CLUB"
    const enumKey = Object.entries(EVENT_TYPE_SLUGS).find(
      ([, slug]) => slug === filters.type
    )?.[0];
    if (enumKey) {
      where.eventType = enumKey as EventType;
    }
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters?.city && filters.city !== "all") {
    where.locationPublic = { contains: filters.city, mode: "insensitive" };
  }

  if (filters?.minPrice) {
    where.price = { ...(where.price as object || {}), gte: filters.minPrice * 100 };
  }
  if (filters?.maxPrice) {
    where.price = { ...(where.price as object || {}), lte: filters.maxPrice * 100 };
  }

  const events = await db.event.findMany({
    where,
    include: {
      host: {
        include: {
          user: { select: { id: true, email: true } },
        },
      },
      _count: { select: { reviews: true, bookings: true } },
      reviews: { select: { overallRating: true } },
    },
    orderBy: { date: "asc" },
    take: filters?.limit || 50,
  });

  return events.map((event) => mapToFrontendEvent(event));
}

/** Get a single event by ID (for event detail page) */
export async function getEventDetail(eventId: string): Promise<FrontendEvent | null> {
  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      host: {
        include: {
          user: { select: { id: true, email: true } },
        },
      },
      _count: { select: { reviews: true, bookings: true } },
      reviews: { select: { overallRating: true } },
    },
  });

  if (!event) return null;
  return mapToFrontendEvent(event);
}

/** Get a single event by slug */
export async function getEventBySlug(slug: string): Promise<FrontendEvent | null> {
  const event = await db.event.findUnique({
    where: { slug },
    include: {
      host: {
        include: {
          user: { select: { id: true, email: true } },
        },
      },
      _count: { select: { reviews: true, bookings: true } },
      reviews: { select: { overallRating: true } },
    },
  });

  if (!event) return null;
  return mapToFrontendEvent(event);
}

// ============================================
// HOST QUERIES
// ============================================

/** Get all events for a specific host (by hostProfile ID or user ID) */
export async function getHostEventsFromDb(hostUserId: string): Promise<FrontendHostEvent[]> {
  // First find the host profile
  const hostProfile = await db.hostProfile.findUnique({
    where: { userId: hostUserId },
  });

  if (!hostProfile) return [];

  const events = await db.event.findMany({
    where: { hostId: hostProfile.id },
    include: {
      bookings: {
        select: {
          id: true,
          status: true,
          totalPrice: true,
          platformFee: true,
          ticketCount: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });

  return events.map((event) => {
    const approvedBookings = event.bookings.filter((b) =>
      ["APPROVED", "COMPLETED"].includes(b.status)
    );
    const pendingBookings = event.bookings.filter((b) => b.status === "PENDING");
    const revenue = approvedBookings.reduce(
      (sum, b) => sum + (b.totalPrice - b.platformFee),
      0
    );
    const confirmedGuests = approvedBookings.reduce(
      (sum, b) => sum + b.ticketCount,
      0
    );

    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      type: EVENT_TYPE_LABELS[event.eventType] || event.eventType,
      typeSlug: EVENT_TYPE_SLUGS[event.eventType] || event.eventType.toLowerCase(),
      date: event.date,
      dateFormatted: formatEventDate(event.date, event.startTime),
      startTime: event.startTime,
      duration: event.duration,
      location: event.locationPublic,
      fullAddress: event.locationFull,
      price: event.price / 100, // grosze → PLN
      capacity: event.capacity,
      spotsLeft: event.spotsLeft,
      bookingsCount: event.bookings.length,
      pendingBookings: pendingBookings.length,
      confirmedGuests,
      revenue: revenue / 100, // grosze → PLN
      imageGradient: getGradient(event.id),
      status: statusToLowercase(event.status),
      description: event.description,
      menuDescription: event.menuDescription || "",
      dietaryOptions: event.dietaryOptions,
      createdAt: event.createdAt,
    };
  });
}

// ============================================
// MAPPER
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToFrontendEvent(event: any): FrontendEvent {
  const avgRating =
    event.reviews && event.reviews.length > 0
      ? event.reviews.reduce((sum: number, r: { overallRating: number }) => sum + r.overallRating, 0) / event.reviews.length
      : 0;

  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    type: EVENT_TYPE_LABELS[event.eventType] || event.eventType,
    typeSlug: EVENT_TYPE_SLUGS[event.eventType] || event.eventType.toLowerCase(),
    date: event.date,
    dateFormatted: formatEventDate(event.date, event.startTime),
    startTime: event.startTime,
    duration: event.duration,
    location: event.locationPublic,
    locationSlug: event.locationPublic.toLowerCase().replace(/\s+/g, "-"),
    fullAddress: event.locationFull,
    price: event.price / 100, // grosze → PLN
    capacity: event.capacity,
    spotsLeft: event.spotsLeft,
    imageGradient: event.images?.[0] ? "" : getGradient(event.id),
    description: event.description,
    menuDescription: event.menuDescription || "",
    dietaryOptions: event.dietaryOptions || [],
    whatToBring: event.whatToBring || "Dobry humor i apetyt!",
    host: {
      id: event.host?.user?.id || event.hostId,
      name: event.host?.businessName || "Host",
      avatar: event.host?.avatarUrl || "",
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: event._count?.reviews || 0,
      eventsHosted: event._count?.bookings || 0,
      verified: event.host?.verified || false,
    },
    // DB fields passthrough
    eventType: event.eventType,
    status: event.status,
    cuisineTags: event.cuisineTags || [],
    images: event.images || [],
    byob: event.byob || false,
    bookingMode: event.bookingMode || "MANUAL",
  };
}
