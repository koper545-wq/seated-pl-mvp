"use client";

import { use, useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const statusLabels: Record<string, { label: string; color: string }> = {
  PUBLISHED: { label: "Opublikowane", color: "bg-green-100 text-green-700" },
  PENDING_REVIEW: { label: "Do akceptacji", color: "bg-yellow-100 text-yellow-700" },
  DRAFT: { label: "Szkic", color: "bg-stone-100 text-stone-700" },
  COMPLETED: { label: "Zakończone", color: "bg-blue-100 text-blue-700" },
  CANCELLED: { label: "Anulowane", color: "bg-red-100 text-red-700" },
};

const bookingStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Oczekuje", color: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Potwierdzona", color: "bg-green-100 text-green-700" },
  DECLINED: { label: "Odrzucona", color: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Anulowana", color: "bg-stone-100 text-stone-700" },
  COMPLETED: { label: "Zakończona", color: "bg-blue-100 text-blue-700" },
  NO_SHOW: { label: "Nieobecny", color: "bg-red-100 text-red-700" },
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  SUPPER_CLUB: "Supper Club",
  CHEFS_TABLE: "Chef's Table",
  POPUP: "Pop-up",
  COOKING_CLASS: "Warsztaty",
  TASTING: "Degustacje",
  OTHER: "Inne",
};

interface EventDetail {
  id: string;
  title: string;
  description: string;
  eventType: string;
  status: string;
  date: string;
  startTime: string;
  duration: number;
  locationPublic: string;
  locationFull: string;
  price: number;
  capacity: number;
  spotsLeft: number;
  menuDescription: string | null;
  dietaryOptions: string[];
  revenue: number;
  platformFeeTotal: number;
  host: { businessName: string; verified: boolean; user: { id: string; email: string } };
  bookings: {
    id: string;
    status: string;
    ticketCount: number;
    totalPrice: number;
    guest: { id: string; email: string; guestProfile: { firstName: string; lastName: string } | null };
  }[];
  _count: { bookings: number; reviews: number };
}

export default function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchEvent = () => {
    fetch(`/api/admin/events/${id}`)
      .then((res) => res.json())
      .then((data) => setEvent(data.event))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchEvent();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-stone-500">Ładowanie...</p>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="p-8 text-center">
          <span className="text-6xl mb-4 block">🔍</span>
          <h1 className="text-xl font-bold text-stone-900 mb-2">Nie znaleziono wydarzenia</h1>
          <Link href="/admin/events">
            <Button>Wróć do listy</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const sl = statusLabels[event.status] || statusLabels.DRAFT;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/events">
            <Button variant="ghost" size="sm">← Wróć</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{event.title}</h1>
            <p className="text-stone-500">ID: {event.id}</p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${sl.color}`}>{sl.label}</span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Event Details */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-xs text-stone-400 uppercase">Typ</p>
                  <p className="text-stone-900 font-medium">{EVENT_TYPE_LABELS[event.eventType] || event.eventType}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase">Data i godzina</p>
                  <p className="text-stone-900">{format(new Date(event.date), "d MMM yyyy · HH:mm", { locale: pl })}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase">Czas trwania</p>
                  <p className="text-stone-900">{event.duration} min</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase">Cena</p>
                  <p className="text-stone-900 font-medium">{event.price / 100} zł</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-stone-400 uppercase mb-1">Lokalizacja</p>
                <p className="text-stone-900">{event.locationPublic}</p>
                <p className="text-sm text-stone-500">{event.locationFull}</p>
              </div>

              <div className="mb-6">
                <p className="text-xs text-stone-400 uppercase mb-1">Opis</p>
                <p className="text-stone-700">{event.description}</p>
              </div>

              {event.menuDescription && (
                <div className="mb-6">
                  <p className="text-xs text-stone-400 uppercase mb-1">Menu</p>
                  <p className="text-stone-700 whitespace-pre-line">{event.menuDescription}</p>
                </div>
              )}

              {event.dietaryOptions.length > 0 && (
                <div>
                  <p className="text-xs text-stone-400 uppercase mb-2">Opcje dietetyczne</p>
                  <div className="flex flex-wrap gap-2">
                    {event.dietaryOptions.map((option) => (
                      <span key={option} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">{option}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Host */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>👨‍🍳</span> Host
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-2xl">👤</div>
                <div>
                  <p className="font-semibold text-stone-900">{event.host.businessName}</p>
                  <p className="text-sm text-stone-500">{event.host.user.email}</p>
                  {event.host.verified && (
                    <span className="text-xs text-green-600">✓ Zweryfikowany</span>
                  )}
                </div>
                <Link href={`/admin/users/${event.host.user.id}`} className="ml-auto">
                  <Button variant="outline" size="sm">Profil hosta</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>🎫</span> Rezerwacje ({event.bookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {event.bookings.length === 0 ? (
                <p className="text-stone-500 text-center py-4">Brak rezerwacji</p>
              ) : (
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">Wszystkie</TabsTrigger>
                    <TabsTrigger value="APPROVED">Potwierdzone</TabsTrigger>
                    <TabsTrigger value="PENDING">Oczekujące</TabsTrigger>
                  </TabsList>
                  {["all", "APPROVED", "PENDING"].map((tab) => (
                    <TabsContent key={tab} value={tab}>
                      <div className="space-y-3">
                        {event.bookings
                          .filter((b) => tab === "all" || b.status === tab)
                          .map((booking) => {
                            const bs = bookingStatusLabels[booking.status] || bookingStatusLabels.PENDING;
                            const guestName = booking.guest.guestProfile
                              ? `${booking.guest.guestProfile.firstName} ${booking.guest.guestProfile.lastName}`
                              : booking.guest.email;
                            return (
                              <div key={booking.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-lg">👤</div>
                                  <div>
                                    <p className="font-medium text-stone-900">{guestName}</p>
                                    <p className="text-xs text-stone-500">{booking.guest.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-sm font-medium">{booking.ticketCount} bilet{booking.ticketCount > 1 ? "y" : ""}</p>
                                    <p className="text-xs text-stone-500">{(booking.totalPrice / 100).toLocaleString()} zł</p>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs ${bs.color}`}>{bs.label}</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Statystyki</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Miejsca</span>
                <span className="font-medium">{event.capacity - event.spotsLeft}/{event.capacity}</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${((event.capacity - event.spotsLeft) / event.capacity) * 100}%` }} />
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-stone-500">Rezerwacje</span>
                <span className="font-medium">{event.bookings.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Przychód</span>
                <span className="font-medium text-green-600">{(event.revenue / 100).toLocaleString()} zł</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Prowizja (15%)</span>
                <span className="font-medium text-amber-600">{(event.platformFeeTotal / 100).toLocaleString()} zł</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚡ Akcje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/events/${event.id}`} target="_blank">
                <Button className="w-full" variant="outline">👁️ Podgląd publiczny</Button>
              </Link>

              {event.status === "PENDING_REVIEW" && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full bg-green-600 hover:bg-green-700" disabled={isProcessing}>
                        ✅ Akceptuj
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Zaakceptować wydarzenie?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Wydarzenie zostanie opublikowane i będzie widoczne dla użytkowników.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleStatusChange("PUBLISHED")} className="bg-green-600 hover:bg-green-700">
                          Tak, akceptuj
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full" variant="destructive" disabled={isProcessing}>
                        ❌ Odrzuć
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Odrzucić wydarzenie?</AlertDialogTitle>
                        <AlertDialogDescription>Host zostanie powiadomiony o odrzuceniu.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleStatusChange("CANCELLED")} className="bg-red-600 hover:bg-red-700">
                          Tak, odrzuć
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              {event.status === "PUBLISHED" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full" variant="destructive" disabled={isProcessing}>
                      🚫 Anuluj wydarzenie
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Anulować wydarzenie?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Wszystkie rezerwacje zostaną anulowane, a goście powiadomieni.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Nie anuluj</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleStatusChange("CANCELLED")} className="bg-red-600 hover:bg-red-700">
                        Tak, anuluj
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
