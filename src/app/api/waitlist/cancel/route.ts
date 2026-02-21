import { NextRequest, NextResponse } from "next/server";
import {
  getWaitlistEntry,
  removeFromWaitlist,
} from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryId, email } = body;

    // Validate required fields
    if (!entryId || !email) {
      return NextResponse.json(
        { error: "Brakuje wymaganych pól" },
        { status: 400 }
      );
    }

    // Get entry and verify email matches
    const entry = getWaitlistEntry(entryId);
    if (!entry) {
      return NextResponse.json(
        { error: "Nie znaleziono wpisu na liście oczekujących" },
        { status: 404 }
      );
    }

    // Verify email matches
    if (entry.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "Nieprawidłowy email" },
        { status: 403 }
      );
    }

    // Remove from waitlist
    const removed = removeFromWaitlist(entryId);
    if (!removed) {
      return NextResponse.json(
        { error: "Nie udało się usunąć z listy oczekujących" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Usunięto z listy oczekujących",
    });
  } catch (error) {
    console.error("Waitlist cancel error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
