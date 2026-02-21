// Shared API response types
// These match the Prisma models returned by our API routes

export interface ApiUser {
  id: string;
  email: string;
  userType: "GUEST" | "HOST" | "ADMIN";
  status: string;
  language: string;
  createdAt: string;
  guestProfile?: ApiGuestProfile | null;
  hostProfile?: ApiHostProfile | null;
}

export interface ApiGuestProfile {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  dietaryRestrictions: string[];
  allergies: string[];
  xp: number;
}

export interface ApiHostProfile {
  id: string;
  userId: string;
  businessName: string;
  description: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  phoneNumber: string | null;
  city: string;
  neighborhood: string | null;
  cuisineSpecialties: string[];
  verified: boolean;
  responseRate: number | null;
  responseTime: number | null;
  onboardingPaid: boolean;
  user?: { id: string; email: string };
}

export interface ApiEvent {
  id: string;
  hostId: string;
  title: string;
  slug: string;
  description: string;
  eventType: string;
  cuisineTags: string[];
  images: string[];
  date: string;
  startTime: string;
  duration: number;
  locationPublic: string;
  locationFull: string;
  price: number; // in grosze
  capacity: number;
  spotsLeft: number;
  menuDescription: string | null;
  dietaryOptions: string[];
  byob: boolean;
  ageRequired: boolean;
  dressCode: string | null;
  whatToBring: string | null;
  bookingMode: "INSTANT" | "MANUAL";
  cancellationPolicy: string | null;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  featured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  host: ApiHostProfile;
  reviews?: ApiReview[];
  _count?: {
    reviews: number;
    bookings: number;
  };
  // Computed fields from host/events endpoint
  revenue?: number;
  totalGuests?: number;
}

export interface ApiBooking {
  id: string;
  eventId: string;
  guestId: string;
  ticketCount: number;
  totalPrice: number; // in grosze
  platformFee: number; // in grosze
  status: "PENDING" | "APPROVED" | "DECLINED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  dietaryInfo: string | null;
  specialRequests: string | null;
  emergencyContact: string | null;
  approvedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  event?: ApiEvent;
  guest?: {
    id: string;
    email: string;
    guestProfile?: ApiGuestProfile | null;
  };
  transactions?: ApiTransaction[];
  conversation?: ApiConversation[];
}

export interface ApiTransaction {
  type: string;
  amount: number;
  status: string;
  processedAt: string | null;
}

export interface ApiReview {
  id: string;
  eventId: string;
  authorId: string;
  subjectId: string;
  overallRating: number;
  foodRating: number | null;
  communicationRating: number | null;
  valueRating: number | null;
  ambianceRating: number | null;
  text: string | null;
  photos: string[];
  isHostReview: boolean;
  verifiedAttendee: boolean;
  helpfulCount: number;
  response: string | null;
  respondedAt: string | null;
  createdAt: string;
  author?: {
    id: string;
    guestProfile?: {
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    } | null;
  };
}

export interface ApiConversation {
  id: string;
  hostId: string;
  guestId: string;
  bookingId: string | null;
  messages: ApiMessage[];
}

export interface ApiMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    guestProfile?: { firstName: string | null } | null;
    hostProfile?: { businessName: string | null } | null;
  };
}

// API response wrappers
export interface EventsResponse {
  events: ApiEvent[];
  total: number;
}

export interface BookingsResponse {
  bookings: ApiBooking[];
  total: number;
}

export interface GuestsResponse {
  bookings: ApiBooking[];
  eventTitle: string;
}

export interface ReviewsResponse {
  reviews: ApiReview[];
  averages: {
    overallRating: number | null;
    foodRating: number | null;
    communicationRating: number | null;
    valueRating: number | null;
    ambianceRating: number | null;
  };
  total: number;
}

export interface HostStats {
  upcomingEvents: number;
  pendingBookings: number;
  totalRevenue: number; // in grosze
  totalEvents: number;
  averageRating: number;
  reviewCount: number;
}
