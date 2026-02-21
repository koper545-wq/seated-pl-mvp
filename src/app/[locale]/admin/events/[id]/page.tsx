"use client";

import { use, useState } from "react";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  getEventById,
  getHostEventById,
  getBookingsByEventId,
  hostEventStatusLabels,
  bookingStatusLabels,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Try to get from hostEvents first, then mockEvents
  const hostEvent = getHostEventById(id);
  const mockEvent = getEventById(id);
  const event = hostEvent || mockEvent;
  const bookings = getBookingsByEventId(id);

  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="p-8 text-center">
          <span className="text-6xl mb-4 block">🔍</span>
          <h1 className="text-xl font-bold text-stone-900 mb-2">
            Nie znaleziono wydarzenia
          </h1>
          <p className="text-stone-500 mb-6">
            Wydarzenie o podanym ID nie istnieje
          </p>
          <Link href="/admin/events">
            <Button>Wróć do listy</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const status = hostEvent?.status || "published";
  const revenue = hostEvent?.revenue || (event.capacity - event.spotsLeft) * event.price * 100;

  const handleApprove = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Wydarzenie zaakceptowane! (demo)");
    setIsProcessing(false);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Wydarzenie odrzucone! (demo)");
    setIsProcessing(false);
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Wydarzenie anulowane! (demo)");
    setIsProcessing(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/events">
            <Button variant="ghost" size="sm">
              ← Wróć
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{event.title}</h1>
            <p className="text-stone-500">ID: {event.id}</p>
          </div>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            hostEventStatusLabels[status].color
          }`}
        >
          {hostEventStatusLabels[status].label}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Event Preview Card */}
          <Card className="overflow-hidden">
            <div
              className={`h-48 bg-gradient-to-br ${event.imageGradient} flex items-center justify-center text-6xl`}
            >
              🍴
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wide">
                    Typ
                  </p>
                  <p className="text-stone-900 font-medium">{event.type}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wide">
                    Data i godzina
                  </p>
                  <p className="text-stone-900">{event.dateFormatted}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wide">
                    Czas trwania
                  </p>
                  <p className="text-stone-900">{event.duration} min</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wide">
                    Cena
                  </p>
                  <p className="text-stone-900 font-medium">{event.price} zł</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">
                  Lokalizacja
                </p>
                <p className="text-stone-900">{event.location}</p>
                <p className="text-sm text-stone-500">{event.fullAddress}</p>
              </div>

              <div className="mb-6">
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">
                  Opis
                </p>
                <p className="text-stone-700">{event.description}</p>
              </div>

              <div className="mb-6">
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">
                  Menu
                </p>
                <p className="text-stone-700">{event.menuDescription}</p>
              </div>

              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">
                  Opcje dietetyczne
                </p>
                <div className="flex flex-wrap gap-2">
                  {event.dietaryOptions.map((option) => (
                    <span
                      key={option}
                      className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Host Info */}
          {"host" in event && event.host && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>👨‍🍳</span> Host
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">
                      {event.host.name}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-stone-500">
                      <span>⭐ {event.host.rating}</span>
                      <span>({event.host.reviewCount} opinii)</span>
                      <span>🎉 {event.host.eventsHosted} wydarzeń</span>
                    </div>
                    {event.host.verified && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                        ✓ Zweryfikowany host
                      </span>
                    )}
                  </div>
                  <Link href={`/admin/users/${event.host.id}`} className="ml-auto">
                    <Button variant="outline" size="sm">
                      Profil hosta
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>🎫</span> Rezerwacje ({bookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-stone-500 text-center py-4">
                  Brak rezerwacji dla tego wydarzenia
                </p>
              ) : (
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">Wszystkie</TabsTrigger>
                    <TabsTrigger value="approved">Potwierdzone</TabsTrigger>
                    <TabsTrigger value="pending">Oczekujące</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    <div className="space-y-3">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-4 bg-stone-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-lg">
                              👤
                            </div>
                            <div>
                              <p className="font-medium text-stone-900">
                                {booking.guestName}
                              </p>
                              <p className="text-xs text-stone-500">
                                {booking.guestEmail}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-stone-900">
                                {booking.ticketCount} bilet
                                {booking.ticketCount > 1 ? "y" : ""}
                              </p>
                              <p className="text-xs text-stone-500">
                                {(booking.totalPrice / 100).toLocaleString()} zł
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                bookingStatusLabels[booking.status].color
                              }`}
                            >
                              {bookingStatusLabels[booking.status].label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="approved">
                    <div className="space-y-3">
                      {bookings
                        .filter((b) => b.status === "approved")
                        .map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between p-4 bg-stone-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-lg">
                                👤
                              </div>
                              <div>
                                <p className="font-medium text-stone-900">
                                  {booking.guestName}
                                </p>
                                <p className="text-xs text-stone-500">
                                  {booking.ticketCount} bilet
                                  {booking.ticketCount > 1 ? "y" : ""}
                                </p>
                              </div>
                            </div>
                            <span className="text-green-600 text-sm">
                              ✓ Potwierdzona
                            </span>
                          </div>
                        ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="pending">
                    <div className="space-y-3">
                      {bookings.filter((b) => b.status === "pending").length ===
                      0 ? (
                        <p className="text-stone-500 text-center py-4">
                          Brak oczekujących rezerwacji
                        </p>
                      ) : (
                        bookings
                          .filter((b) => b.status === "pending")
                          .map((booking) => (
                            <div
                              key={booking.id}
                              className="flex items-center justify-between p-4 bg-stone-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-lg">
                                  👤
                                </div>
                                <div>
                                  <p className="font-medium text-stone-900">
                                    {booking.guestName}
                                  </p>
                                  <p className="text-xs text-stone-500">
                                    {booking.ticketCount} bilet
                                    {booking.ticketCount > 1 ? "y" : ""}
                                  </p>
                                </div>
                              </div>
                              <span className="text-yellow-600 text-sm">
                                ⏳ Oczekuje
                              </span>
                            </div>
                          ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Statystyki</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Miejsca</span>
                <span className="font-medium">
                  {event.capacity - event.spotsLeft}/{event.capacity}
                </span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{
                    width: `${
                      ((event.capacity - event.spotsLeft) / event.capacity) * 100
                    }%`,
                  }}
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-stone-500">Rezerwacje</span>
                <span className="font-medium">{bookings.length}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-500">Przychód</span>
                <span className="font-medium text-green-600">
                  {(revenue / 100).toLocaleString()} zł
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-500">Prowizja (10%)</span>
                <span className="font-medium text-amber-600">
                  {(revenue / 1000).toLocaleString()} zł
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📝 Notatki admina</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Dodaj notatki dotyczące wydarzenia..."
                rows={4}
              />
              <Button className="w-full mt-3" variant="outline" size="sm">
                Zapisz notatkę
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚡ Akcje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/events/${event.id}`} target="_blank">
                <Button className="w-full" variant="outline">
                  👁️ Podgląd publiczny
                </Button>
              </Link>

              {status === "pending_review" && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isProcessing}
                      >
                        ✅ Akceptuj wydarzenie
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Zaakceptować wydarzenie?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Wydarzenie zostanie opublikowane i będzie widoczne dla
                          użytkowników.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleApprove}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Tak, akceptuj
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="w-full"
                        variant="destructive"
                        disabled={isProcessing}
                      >
                        ❌ Odrzuć wydarzenie
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Odrzucić wydarzenie?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Host zostanie powiadomiony o odrzuceniu. Upewnij się,
                          że dodałeś notatkę z powodem.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleReject}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Tak, odrzuć
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              {status === "published" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-full"
                      variant="destructive"
                      disabled={isProcessing}
                    >
                      🚫 Anuluj wydarzenie
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Anulować wydarzenie?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Wszystkie rezerwacje zostaną anulowane, a goście
                        powiadomieni. Środki zostaną zwrócone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Nie anuluj</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancel}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Tak, anuluj wydarzenie
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
