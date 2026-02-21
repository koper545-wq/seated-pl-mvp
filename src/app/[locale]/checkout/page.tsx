"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useBookings, type Booking } from "@/contexts/bookings-context";
import { MockPayment } from "@/components/checkout/mock-payment";
import { getEventById } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const { getBookingById, isLoaded } = useBookings();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [event, setEvent] = useState<ReturnType<typeof getEventById> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!bookingId) {
      setError("Brak ID rezerwacji");
      return;
    }

    const foundBooking = getBookingById(bookingId);
    if (!foundBooking) {
      setError("Nie znaleziono rezerwacji");
      return;
    }

    if (foundBooking.status !== "pending_payment") {
      setError("Ta rezerwacja została już opłacona lub anulowana");
      return;
    }

    setBooking(foundBooking);

    // Get event details
    const eventData = getEventById(foundBooking.eventId);
    if (!eventData) {
      setError("Nie znaleziono wydarzenia");
      return;
    }

    setEvent(eventData);
  }, [bookingId, getBookingById, isLoaded]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-2" />
          <p className="text-stone-500">Ładowanie...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 py-12">
        <div className="max-w-lg mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Wystąpił problem</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link href="/events">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Wróć do wydarzeń
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No booking yet (still loading)
  if (!booking || !event) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-2" />
          <p className="text-stone-500">Przygotowywanie płatności...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-lg mx-auto px-4">
        {/* Back button */}
        <Link
          href={`/events/${event.id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Anuluj i wróć do wydarzenia
        </Link>

        {/* Page title */}
        <h1 className="text-2xl font-bold text-stone-900 mb-6">
          Dokończ płatność
        </h1>

        {/* Mock Payment Component */}
        <MockPayment
          booking={booking}
          eventTitle={event.title}
          eventDate={event.dateFormatted}
          eventTime={event.startTime}
          eventLocation={event.location}
          hostName={event.host.name}
        />
      </div>
    </div>
  );
}
