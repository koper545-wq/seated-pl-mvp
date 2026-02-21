"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { BookingCard } from "@/components/bookings/booking-card";
import { getBookingsByGuestId, MockBooking } from "@/lib/mock-data";
import { Calendar, CalendarCheck, CalendarX, History, Search, Loader2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

// Map API booking to MockBooking shape for BookingCard compatibility
function mapApiBookingToMock(b: Record<string, unknown>): MockBooking {
  const event = b.event as Record<string, unknown>;
  const host = (event?.host || {}) as Record<string, unknown>;
  const eventDate = new Date(event.date as string);

  return {
    id: b.id as string,
    eventId: (event.id as string) || "",
    guestId: b.guestId as string,
    guestName: "",
    guestEmail: "",
    status: (b.status as string).toLowerCase() as MockBooking["status"],
    ticketCount: b.ticketCount as number,
    totalPrice: (b.totalPrice as number) / 100, // grosze → PLN
    platformFee: (b.platformFee as number) / 100,
    createdAt: new Date(b.createdAt as string),
    cancelReason: (b.cancelReason as string) || undefined,
    cancelledAt: b.cancelledAt ? new Date(b.cancelledAt as string) : undefined,
    event: {
      title: event.title as string,
      date: eventDate,
      dateFormatted: format(eventDate, "d MMMM yyyy", { locale: pl }),
      location: (event.locationPublic as string) || "",
      imageGradient: "from-amber-400 to-orange-500",
      hostName: (host.businessName as string) || "",
      hostId: (host.id as string) || "",
    },
  };
}

export default function GuestBookingsPage() {
  const { isMockUser, isLoading: userLoading } = useCurrentUser();
  const [bookings, setBookings] = useState<MockBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Load bookings from API or mock data
  useEffect(() => {
    if (userLoading) return;

    if (isMockUser) {
      setBookings(getBookingsByGuestId("user-current"));
      setIsLoadingBookings(false);
    } else {
      fetch("/api/bookings")
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.bookings) {
            setBookings(data.bookings.map(mapApiBookingToMock));
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingBookings(false));
    }
  }, [isMockUser, userLoading]);

  if (userLoading || isLoadingBookings) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-2" />
          <p className="text-stone-500">Ładowanie rezerwacji...</p>
        </div>
      </div>
    );
  }

  // Separate bookings by status
  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) =>
      b.event.date >= now &&
      (b.status === "pending" || b.status === "approved")
  );
  const pastBookings = bookings.filter(
    (b) => b.event.date < now || b.status === "completed"
  );
  const cancelledBookings = bookings.filter(
    (b) => b.status === "cancelled" || b.status === "declined"
  );

  const handleCancel = (bookingId: string) => {
    setCancellingId(bookingId);
  };

  const confirmCancel = () => {
    if (cancellingId) {
      // Call API for real users
      if (!isMockUser) {
        fetch(`/api/bookings/${cancellingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cancel" }),
        }).catch(console.error);
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancellingId
            ? {
                ...b,
                status: "cancelled" as const,
                cancelledAt: new Date(),
                cancelReason: "Anulowane przez gościa",
              }
            : b
        )
      );
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Moje rezerwacje</h1>
          <p className="text-muted-foreground">
            Zarządzaj swoimi rezerwacjami i przeglądaj historię
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Nadchodzące</span>
              {upcomingBookings.length > 0 && (
                <span className="bg-amber-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {upcomingBookings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Historia</span>
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center gap-2">
              <CalendarX className="h-4 w-4" />
              <span className="hidden sm:inline">Anulowane</span>
            </TabsTrigger>
          </TabsList>

          {/* Upcoming bookings */}
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancel}
                />
              ))
            ) : (
              <EmptyState
                icon={Calendar}
                title="Brak nadchodzących rezerwacji"
                description="Przeglądaj wydarzenia i zarezerwuj miejsce na swoje pierwsze kulinarne doświadczenie!"
                actionLabel="Przeglądaj wydarzenia"
                actionHref="/events"
                actionIcon={Search}
              />
            )}
          </TabsContent>

          {/* Past bookings */}
          <TabsContent value="past" className="space-y-4">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  showActions={false}
                />
              ))
            ) : (
              <EmptyState
                icon={History}
                title="Brak historii"
                description="Tu pojawią się wydarzenia, w których już uczestniczyłeś."
              />
            )}
          </TabsContent>

          {/* Cancelled bookings */}
          <TabsContent value="cancelled" className="space-y-4">
            {cancelledBookings.length > 0 ? (
              cancelledBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  showActions={false}
                />
              ))
            ) : (
              <EmptyState
                icon={CalendarX}
                title="Brak anulowanych"
                description="Nie masz żadnych anulowanych rezerwacji."
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel confirmation dialog */}
      <AlertDialog
        open={cancellingId !== null}
        onOpenChange={(open) => !open && setCancellingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anulować rezerwację?</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz anulować tę rezerwację? Tej akcji nie można
              cofnąć. Jeśli rezerwacja była już potwierdzona, skontaktuj się z
              hostem w sprawie zwrotu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Nie, zachowaj</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              Tak, anuluj
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
