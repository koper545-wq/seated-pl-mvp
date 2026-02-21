"use client";

import { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  getBookingsByHostId,
  MockBooking,
  bookingStatusLabels,
} from "@/lib/mock-data";
import {
  Calendar,
  Check,
  X,
  Clock,
  Users,
  Mail,
  Phone,
  UtensilsCrossed,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

// Map API booking to MockBooking shape for host bookings
function mapApiHostBookingToMock(b: Record<string, unknown>): MockBooking {
  const event = b.event as Record<string, unknown>;
  const host = (event?.host || {}) as Record<string, unknown>;
  const guest = b.guest as Record<string, unknown> | null;
  const guestProfile = (guest?.guestProfile || {}) as Record<string, unknown>;
  const eventDate = new Date(event.date as string);
  const guestName = [guestProfile.firstName, guestProfile.lastName].filter(Boolean).join(" ") || (guest?.email as string) || "Gość";

  return {
    id: b.id as string,
    eventId: (event.id as string) || "",
    guestId: b.guestId as string,
    guestName,
    guestEmail: (guest?.email as string) || "",
    status: (b.status as string).toLowerCase() as MockBooking["status"],
    ticketCount: b.ticketCount as number,
    totalPrice: (b.totalPrice as number) / 100,
    platformFee: (b.platformFee as number) / 100,
    createdAt: new Date(b.createdAt as string),
    dietaryInfo: (b.dietaryInfo as string) || undefined,
    specialRequests: (b.specialRequests as string) || undefined,
    cancelReason: (b.cancelReason as string) || undefined,
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

export default function HostBookingsPage() {
  const { user, isLoading, effectiveRole, isMockUser } = useCurrentUser();
  const router = useRouter();
  const hostId = isMockUser && user && 'id' in user ? user.id : "host-1";

  const [bookings, setBookings] = useState<MockBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [actionBooking, setActionBooking] = useState<{
    booking: MockBooking;
    action: "approve" | "decline";
  } | null>(null);

  // Redirect to guest dashboard if in guest mode
  useEffect(() => {
    if (!isLoading && effectiveRole === "guest") {
      router.push("/dashboard");
    }
  }, [isLoading, effectiveRole, router]);

  // Initialize bookings from mock or API
  useEffect(() => {
    if (isLoading) return;

    if (isMockUser) {
      setBookings(getBookingsByHostId(hostId));
      setIsLoadingBookings(false);
    } else {
      fetch("/api/bookings?role=host")
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.bookings) {
            setBookings(data.bookings.map(mapApiHostBookingToMock));
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingBookings(false));
    }
  }, [isLoading, isMockUser, hostId]);

  if (isLoading || isLoadingBookings) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-2" />
          <p className="text-stone-500">Ładowanie...</p>
        </div>
      </div>
    );
  }

  // If in guest mode, show nothing (redirect will happen)
  if (effectiveRole === "guest") {
    return null;
  }

  // Separate bookings
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "approved");
  const allBookings = bookings;

  // Stats
  const totalRevenue = confirmedBookings.reduce(
    (sum, b) => sum + b.totalPrice - b.platformFee,
    0
  );
  const totalGuests = confirmedBookings.reduce(
    (sum, b) => sum + b.ticketCount,
    0
  );

  const handleAction = (booking: MockBooking, action: "approve" | "decline") => {
    setActionBooking({ booking, action });
  };

  const confirmAction = () => {
    if (actionBooking) {
      const { booking, action } = actionBooking;

      // Call API for real users
      if (!isMockUser) {
        fetch(`/api/bookings/${booking.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }).catch(console.error);
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? {
                ...b,
                status: action === "approve" ? "approved" : ("declined" as const),
                approvedAt: action === "approve" ? new Date() : undefined,
              }
            : b
        )
      );
      setActionBooking(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Zarządzanie rezerwacjami</h1>
          <p className="text-muted-foreground">
            Akceptuj rezerwacje i komunikuj się z gośćmi
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-yellow-100">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingBookings.length}</p>
                  <p className="text-xs text-muted-foreground">Oczekujące</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{confirmedBookings.length}</p>
                  <p className="text-xs text-muted-foreground">Potwierdzone</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalGuests}</p>
                  <p className="text-xs text-muted-foreground">Gości łącznie</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-100">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatPrice(totalRevenue * 100)}</p>
                  <p className="text-xs text-muted-foreground">Przychód</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending bookings alert */}
        {pendingBookings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 mb-6">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">
                Masz {pendingBookings.length} oczekując
                {pendingBookings.length === 1 ? "ą" : "ych"} rezerwacj
                {pendingBookings.length === 1 ? "ę" : "i"}
              </p>
              <p className="text-sm text-yellow-700">
                Szybka odpowiedź zwiększa Twoją ocenę i zaufanie gości.
              </p>
            </div>
          </div>
        )}

        {/* Bookings tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Oczekujące
              {pendingBookings.length > 0 && (
                <Badge className="bg-yellow-500 text-white">
                  {pendingBookings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Potwierdzone
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Wszystkie
            </TabsTrigger>
          </TabsList>

          {/* Pending */}
          <TabsContent value="pending" className="space-y-4">
            {pendingBookings.length > 0 ? (
              pendingBookings.map((booking) => (
                <HostBookingCard
                  key={booking.id}
                  booking={booking}
                  onApprove={() => handleAction(booking, "approve")}
                  onDecline={() => handleAction(booking, "decline")}
                  showActions
                />
              ))
            ) : (
              <EmptyState
                icon={Calendar}
                title="Brak oczekujących rezerwacji"
                description="Wszystkie rezerwacje zostały rozpatrzone."
              />
            )}
          </TabsContent>

          {/* Confirmed */}
          <TabsContent value="confirmed" className="space-y-4">
            {confirmedBookings.length > 0 ? (
              confirmedBookings.map((booking) => (
                <HostBookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <EmptyState
                icon={Calendar}
                title="Brak potwierdzonych rezerwacji"
                description="Tu pojawią się zaakceptowane rezerwacje."
              />
            )}
          </TabsContent>

          {/* All */}
          <TabsContent value="all" className="space-y-4">
            {allBookings.length > 0 ? (
              allBookings.map((booking) => (
                <HostBookingCard
                  key={booking.id}
                  booking={booking}
                  onApprove={
                    booking.status === "pending"
                      ? () => handleAction(booking, "approve")
                      : undefined
                  }
                  onDecline={
                    booking.status === "pending"
                      ? () => handleAction(booking, "decline")
                      : undefined
                  }
                  showActions={booking.status === "pending"}
                />
              ))
            ) : (
              <EmptyState
                icon={Calendar}
                title="Brak rezerwacji"
                description="Tu pojawią się rezerwacje na Twoje wydarzenia."
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Action confirmation dialog */}
      <AlertDialog
        open={actionBooking !== null}
        onOpenChange={(open) => !open && setActionBooking(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionBooking?.action === "approve"
                ? "Zaakceptować rezerwację?"
                : "Odrzucić rezerwację?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionBooking?.action === "approve" ? (
                <>
                  Gość <strong>{actionBooking?.booking.guestName}</strong>{" "}
                  otrzyma email z potwierdzeniem i pełnym adresem wydarzenia.
                  Płatność zostanie pobrana.
                </>
              ) : (
                <>
                  Gość <strong>{actionBooking?.booking.guestName}</strong>{" "}
                  zostanie powiadomiony o odrzuceniu rezerwacji. Rozważ dodanie
                  krótkiego wyjaśnienia.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionBooking?.action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {actionBooking?.action === "approve" ? "Zaakceptuj" : "Odrzuć"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Host booking card component
interface HostBookingCardProps {
  booking: MockBooking;
  onApprove?: () => void;
  onDecline?: () => void;
  showActions?: boolean;
}

function HostBookingCard({
  booking,
  onApprove,
  onDecline,
  showActions = false,
}: HostBookingCardProps) {
  const statusInfo = bookingStatusLabels[booking.status];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          {/* Guest info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-amber-100 text-amber-700">
                {booking.guestName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{booking.guestName}</h3>
                <Badge className={cn(statusInfo.color)} variant="secondary">
                  {statusInfo.label}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {booking.guestEmail}
                </span>
                {booking.guestPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {booking.guestPhone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Booking details */}
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-8">
            <div className="text-sm">
              <p className="text-muted-foreground mb-1">Wydarzenie</p>
              <p className="font-medium">{booking.event.title}</p>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {booking.event.dateFormatted}
              </p>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground mb-1">Bilety</p>
              <p className="font-medium flex items-center gap-1">
                <Users className="h-4 w-4" />
                {booking.ticketCount}{" "}
                {booking.ticketCount === 1 ? "osoba" : "osoby"}
              </p>
              <p className="text-amber-600 font-semibold mt-1">
                {formatPrice((booking.totalPrice - booking.platformFee) * 100)}
              </p>
            </div>
          </div>
        </div>

        {/* Dietary info and special requests */}
        {(booking.dietaryInfo || booking.specialRequests) && (
          <div className="mt-4 pt-4 border-t space-y-2">
            {booking.dietaryInfo && (
              <div className="flex items-start gap-2 text-sm">
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-muted-foreground">Dieta: </span>
                  <span>{booking.dietaryInfo}</span>
                </div>
              </div>
            )}
            {booking.specialRequests && (
              <div className="flex items-start gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-muted-foreground">Życzenia: </span>
                  <span>{booking.specialRequests}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-4 pt-4 border-t flex gap-3">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={onApprove}
            >
              <Check className="h-4 w-4 mr-2" />
              Akceptuj
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              onClick={onDecline}
            >
              <X className="h-4 w-4 mr-2" />
              Odrzuć
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
