import { NextRequest, NextResponse } from "next/server";
import { markWaitlistConverted, getWaitlistEntry } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryId, bookingId } = body;

    // Validate required fields
    if (!entryId || !bookingId) {
      return NextResponse.json(
        { error: "Brakuje wymaganych pól" },
        { status: 400 }
      );
    }

    // Get entry and verify it's in notified status
    const entry = getWaitlistEntry(entryId);
    if (!entry) {
      return NextResponse.json(
        { error: "Nie znaleziono wpisu na liście oczekujących" },
        { status: 404 }
      );
    }

    if (entry.status !== "notified") {
      return NextResponse.json(
        { error: "Ten wpis nie może być skonwertowany" },
        { status: 400 }
      );
    }

    // Mark as converted
    const updated = markWaitlistConverted(entryId, bookingId);
    if (!updated) {
      return NextResponse.json(
        { error: "Nie udało się zaktualizować wpisu" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Wpis został skonwertowany na rezerwację",
    });
  } catch (error) {
    console.error("Waitlist convert error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
