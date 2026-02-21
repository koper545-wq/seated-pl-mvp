import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  addToWaitlist,
  getWaitlistEntryByEmail,
  getEventById,
} from "@/lib/mock-data";
import { notifyWaitlistJoined } from "@/lib/email/send";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, email, name, phone, ticketsWanted } = body;

    // Validate required fields
    if (!eventId || !email) {
      return NextResponse.json(
        { error: "Brakuje wymaganych pól" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Nieprawidłowy adres email" },
        { status: 400 }
      );
    }

    // Validate tickets
    const tickets = parseInt(ticketsWanted) || 1;
    if (tickets < 1 || tickets > 4) {
      return NextResponse.json(
        { error: "Liczba miejsc musi być od 1 do 4" },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = getEventById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: "Wydarzenie nie istnieje" },
        { status: 404 }
      );
    }

    // Check if already on waitlist
    const existingEntry = getWaitlistEntryByEmail(eventId, email);
    if (existingEntry) {
      return NextResponse.json(
        { error: "Jesteś już na liście oczekujących na to wydarzenie" },
        { status: 409 }
      );
    }

    // Add to waitlist
    const entry = addToWaitlist({
      eventId,
      email,
      name: name || undefined,
      phone: phone || undefined,
      ticketsWanted: tickets,
    });

    // Send confirmation email
    await notifyWaitlistJoined({
      guestEmail: email,
      guestName: name || undefined,
      eventTitle: event.title,
      eventDate: format(event.date, "d MMMM yyyy", { locale: pl }),
      eventTime: event.startTime,
      hostName: event.host.name,
      position: entry.position,
      ticketsWanted: tickets,
    });

    return NextResponse.json({
      success: true,
      entryId: entry.id,
      position: entry.position,
    });
  } catch (error) {
    console.error("Waitlist join error:", error);

    // Handle "Already on waitlist" error
    if (error instanceof Error && error.message === "Already on waitlist") {
      return NextResponse.json(
        { error: "Jesteś już na liście oczekujących na to wydarzenie" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Wystąpił błąd. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
