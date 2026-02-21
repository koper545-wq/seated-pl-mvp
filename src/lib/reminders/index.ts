// Automatic reminder system for Seated platform
// This module handles scheduling and sending reminders for upcoming events

import { mockBookings, MockBooking, mockEvents } from "@/lib/mock-data";
import * as emailTemplates from "@/lib/email/templates";

export interface ScheduledReminder {
  id: string;
  bookingId: string;
  eventId: string;
  guestEmail: string;
  guestName: string;
  eventTitle: string;
  eventDate: Date;
  eventTime: string;
  fullAddress: string;
  hostName: string;
  hostPhone?: string;
  reminderType: "24h" | "3h";
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
}

/**
 * Calculate reminder times for a booking
 */
export function calculateReminderTimes(eventDate: Date): {
  reminder24h: Date;
  reminder3h: Date;
} {
  const reminder24h = new Date(eventDate);
  reminder24h.setHours(reminder24h.getHours() - 24);

  const reminder3h = new Date(eventDate);
  reminder3h.setHours(reminder3h.getHours() - 3);

  return { reminder24h, reminder3h };
}

/**
 * Check if a reminder should be sent now
 */
export function shouldSendReminder(scheduledFor: Date, now: Date = new Date()): boolean {
  // Send if scheduled time has passed but not more than 1 hour ago
  const diff = now.getTime() - scheduledFor.getTime();
  return diff >= 0 && diff <= 60 * 60 * 1000; // Within 1 hour window
}

/**
 * Get all pending reminders that need to be sent
 */
export function getPendingReminders(now: Date = new Date()): ScheduledReminder[] {
  const pendingReminders: ScheduledReminder[] = [];

  // Get all approved bookings for future events
  const approvedBookings = mockBookings.filter(
    (booking) =>
      booking.status === "approved" &&
      booking.event.date > now
  );

  for (const booking of approvedBookings) {
    const event = mockEvents.find((e) => e.id === booking.eventId);
    if (!event) continue;

    const { reminder24h, reminder3h } = calculateReminderTimes(booking.event.date);

    // Check 24h reminder
    if (shouldSendReminder(reminder24h, now)) {
      pendingReminders.push({
        id: `${booking.id}-24h`,
        bookingId: booking.id,
        eventId: booking.eventId,
        guestEmail: booking.guestEmail,
        guestName: booking.guestName,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.startTime,
        fullAddress: event.fullAddress,
        hostName: event.host.name,
        reminderType: "24h",
        scheduledFor: reminder24h,
        sent: false,
      });
    }

    // Check 3h reminder
    if (shouldSendReminder(reminder3h, now)) {
      pendingReminders.push({
        id: `${booking.id}-3h`,
        bookingId: booking.id,
        eventId: booking.eventId,
        guestEmail: booking.guestEmail,
        guestName: booking.guestName,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.startTime,
        fullAddress: event.fullAddress,
        hostName: event.host.name,
        reminderType: "3h",
        scheduledFor: reminder3h,
        sent: false,
      });
    }
  }

  return pendingReminders;
}

/**
 * Generate reminder email content
 */
export function generateReminderEmail(reminder: ScheduledReminder) {
  const hoursUntilEvent = reminder.reminderType === "24h" ? 24 : 3;

  return emailTemplates.eventReminder({
    guestName: reminder.guestName,
    eventTitle: reminder.eventTitle,
    eventDate: formatEventDate(reminder.eventDate),
    eventTime: reminder.eventTime,
    fullAddress: reminder.fullAddress,
    hostName: reminder.hostName,
    hostPhone: reminder.hostPhone,
    hoursUntilEvent,
  });
}

/**
 * Format event date for display in Polish
 */
function formatEventDate(date: Date): string {
  const days = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
  const months = [
    "Stycznia", "Lutego", "Marca", "Kwietnia", "Maja", "Czerwca",
    "Lipca", "Sierpnia", "Września", "Października", "Listopada", "Grudnia"
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} ${month} ${year}`;
}

/**
 * Process all pending reminders
 * In production, this would be called by a cron job or scheduled task
 */
export async function processReminders(): Promise<{
  processed: number;
  sent: number;
  errors: string[];
}> {
  const pendingReminders = getPendingReminders();
  let sent = 0;
  const errors: string[] = [];

  for (const reminder of pendingReminders) {
    try {
      const email = generateReminderEmail(reminder);

      // In production, actually send the email
      // await sendEmail({ to: reminder.guestEmail, template: email });

      // For now, just log it
      console.log(`[REMINDER] Would send ${reminder.reminderType} reminder to ${reminder.guestEmail} for event ${reminder.eventTitle}`);
      console.log(`[REMINDER] Subject: ${email.subject}`);

      sent++;
    } catch (error) {
      errors.push(`Failed to send reminder ${reminder.id}: ${error}`);
    }
  }

  return {
    processed: pendingReminders.length,
    sent,
    errors,
  };
}

/**
 * Get upcoming reminders for display (not yet sent)
 */
export function getUpcomingReminders(
  bookings: MockBooking[],
  now: Date = new Date()
): {
  booking: MockBooking;
  reminder24h: { scheduled: Date; isPast: boolean };
  reminder3h: { scheduled: Date; isPast: boolean };
}[] {
  return bookings
    .filter((b) => b.status === "approved" && b.event.date > now)
    .map((booking) => {
      const { reminder24h, reminder3h } = calculateReminderTimes(booking.event.date);
      return {
        booking,
        reminder24h: {
          scheduled: reminder24h,
          isPast: reminder24h < now,
        },
        reminder3h: {
          scheduled: reminder3h,
          isPast: reminder3h < now,
        },
      };
    });
}
