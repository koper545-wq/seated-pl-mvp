// Waitlist processing logic
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  getWaitlistByEventId,
  getWaitlistEntry,
  markWaitlistNotified,
  markWaitlistExpired,
  getExpiredWaitlistEntries,
  getEventById,
  WaitlistEntry,
} from "@/lib/mock-data";
import {
  notifyWaitlistSpotAvailable,
  notifyWaitlistExpired,
} from "@/lib/email/send";

/**
 * Generate a unique token for waitlist booking
 */
export function generateWaitlistToken(): string {
  return `wl_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Process waitlist when spots become available
 * Called when: host declines booking, guest cancels, booking expires
 */
export async function processWaitlistForEvent(
  eventId: string,
  freedSpots: number
): Promise<{ notified: WaitlistEntry[]; remaining: number }> {
  const event = getEventById(eventId);
  if (!event) {
    return { notified: [], remaining: freedSpots };
  }

  // Get waiting entries sorted by position
  const waitingEntries = getWaitlistByEventId(eventId)
    .filter((e) => e.status === "waiting")
    .sort((a, b) => a.position - b.position);

  let spotsToFill = freedSpots;
  const notifiedEntries: WaitlistEntry[] = [];

  for (const entry of waitingEntries) {
    if (spotsToFill <= 0) break;

    // Only notify if we have enough spots for their request
    if (entry.ticketsWanted <= spotsToFill) {
      // Generate token and mark as notified
      const token = generateWaitlistToken();
      const updatedEntry = markWaitlistNotified(entry.id, token);

      if (updatedEntry) {
        // Build booking URL with token
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://seated.pl";
        const bookingUrl = `${baseUrl}/events/${eventId}/book?waitlist=${entry.id}&token=${token}`;

        // Format expiry date
        const expiresAt = updatedEntry.expiresAt
          ? format(updatedEntry.expiresAt, "d MMMM yyyy 'o' HH:mm", { locale: pl })
          : "za 12 godzin";

        // Send email notification
        await notifyWaitlistSpotAvailable({
          guestEmail: entry.email,
          guestName: entry.name,
          eventTitle: event.title,
          eventDate: format(event.date, "d MMMM yyyy", { locale: pl }),
          eventTime: event.startTime,
          eventLocation: event.location,
          hostName: event.host.name,
          availableSpots: entry.ticketsWanted,
          price: event.price,
          bookingUrl,
          expiresAt,
        });

        notifiedEntries.push(updatedEntry);
        spotsToFill -= entry.ticketsWanted;
      }
    }
  }

  return { notified: notifiedEntries, remaining: spotsToFill };
}

/**
 * Process expired waitlist entries
 * Should be called periodically (e.g., by cron job)
 */
export async function processExpiredWaitlistEntries(): Promise<{
  expired: WaitlistEntry[];
  renotified: WaitlistEntry[];
}> {
  const expiredEntries = getExpiredWaitlistEntries();
  const renotifiedEntries: WaitlistEntry[] = [];

  for (const entry of expiredEntries) {
    const event = getEventById(entry.eventId);
    if (!event) continue;

    // Mark as expired
    markWaitlistExpired(entry.id);

    // Send expiry notification
    await notifyWaitlistExpired({
      guestEmail: entry.email,
      guestName: entry.name,
      eventTitle: event.title,
      eventDate: format(event.date, "d MMMM yyyy", { locale: pl }),
    });

    // Try to notify next person on the list
    const { notified } = await processWaitlistForEvent(
      entry.eventId,
      entry.ticketsWanted
    );
    renotifiedEntries.push(...notified);
  }

  return { expired: expiredEntries, renotified: renotifiedEntries };
}

/**
 * Get remaining time for a notified waitlist entry
 */
export function getWaitlistTimeRemaining(entryId: string): {
  hours: number;
  minutes: number;
  expired: boolean;
  formatted: string;
} | null {
  const entry = getWaitlistEntry(entryId);
  if (!entry || !entry.expiresAt) return null;

  const now = new Date();
  const diff = entry.expiresAt.getTime() - now.getTime();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, expired: true, formatted: "Wygasło" };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let formatted: string;
  if (hours > 0) {
    formatted = `${hours}h ${minutes}min`;
  } else {
    formatted = `${minutes} minut`;
  }

  return { hours, minutes, expired: false, formatted };
}
