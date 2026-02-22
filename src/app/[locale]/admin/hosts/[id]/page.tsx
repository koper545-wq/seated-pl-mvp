"use client";

import { use, useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { CheckCircle, Clock, ArrowLeft } from "lucide-react";

interface HostDetail {
  id: string;
  userId: string;
  businessName: string;
  description: string | null;
  city: string;
  neighborhood: string | null;
  phoneNumber: string | null;
  verified: boolean;
  cuisineSpecialties: string[];
  responseRate: number;
  responseTime: number;
  avatarUrl: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    status: string;
    createdAt: string;
    guestProfile: { firstName: string; lastName: string } | null;
  };
  events: {
    id: string;
    title: string;
    status: string;
    date: string;
    price: number;
    capacity: number;
    spotsLeft: number;
    locationPublic: string;
    _count: { bookings: number };
  }[];
  eventsCount: number;
  publishedEvents: number;
  totalBookings: number;
  totalRevenue: number;
}

const statusColors: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT: "bg-stone-100 text-stone-700",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-blue-100 text-blue-700",
};

const statusLabels: Record<string, string> = {
  PUBLISHED: "Opublikowane",
  DRAFT: "Szkic",
  PENDING_REVIEW: "Do akceptacji",
  CANCELLED: "Anulowane",
  COMPLETED: "Zakończone",
};

function formatPrice(grosze: number): string {
  return `${(grosze / 100).toFixed(2)} zł`;
}

export default function HostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [host, setHost] = useState<HostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHost = async () => {
    try {
      const res = await fetch(`/api/admin/hosts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setHost(data.host);
      } else {
        setError("Nie znaleziono hosta");
      }
    } catch {
      setError("Błąd ładowania danych");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHost();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVerifyToggle = async (verified: boolean) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/hosts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified }),
      });
      if (res.ok) {
        await fetchHost();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-stone-500">Ładowanie...</p>
        </Card>
      </div>
    );
  }

  if (error || !host) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card className="p-8 text-center">
          <span className="text-6xl mb-4 block">🔍</span>
          <h1 className="text-xl font-bold text-stone-900 mb-2">
            Nie znaleziono hosta
          </h1>
          <p className="text-stone-500 mb-6">
            {error || "Host o podanym ID nie istnieje"}
          </p>
          <Link href="/admin/hosts">
            <Button>Wróć do listy</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const hostName = host.user.guestProfile
    ? `${host.user.guestProfile.firstName} ${host.user.guestProfile.lastName}`
    : host.businessName;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/hosts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Wróć
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-stone-900">
                {host.businessName}
              </h1>
              {host.verified ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Clock className="h-6 w-6 text-yellow-600" />
              )}
            </div>
            <p className="text-stone-500">{host.user.email}</p>
          </div>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            host.verified
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {host.verified ? "✅ Zweryfikowany" : "⏳ Oczekuje na weryfikację"}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Host Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>👤</span> Informacje o hoście
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wide">
                    Nazwa biznesowa
                  </p>
                  <p className="text-stone-900 font-medium">
                    {host.businessName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wide">
                    Imię i nazwisko
                  </p>
                  <p className="text-stone-900">{hostName}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-stone-900">{host.user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wide">
                    Telefon
                  </p>
                  <p className="text-stone-900">
                    {host.phoneNumber || "Nie podano"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>📍</span> Lokalizacja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wide">
                    Miasto
                  </p>
                  <p className="text-stone-900">{host.city}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wide">
                    Dzielnica
                  </p>
                  <p className="text-stone-900">
                    {host.neighborhood || "Nie podano"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cuisine & Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>👨‍🍳</span> Kuchnia i opis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {host.cuisineSpecialties.length > 0 && (
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">
                    Specjalizacje kulinarne
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {host.cuisineSpecialties.map((cuisine) => (
                      <span
                        key={cuisine}
                        className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">
                  Opis
                </p>
                <p className="text-stone-700 whitespace-pre-wrap">
                  {host.description || "Brak opisu"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>🎉</span> Wydarzenia ({host.eventsCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {host.events.length === 0 ? (
                <p className="text-stone-500 text-center py-4">
                  Brak wydarzeń
                </p>
              ) : (
                <div className="space-y-3">
                  {host.events.map((event) => (
                    <Link
                      key={event.id}
                      href={`/admin/events/${event.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors">
                        <div>
                          <p className="font-medium text-stone-900">
                            {event.title}
                          </p>
                          <p className="text-sm text-stone-500">
                            {format(new Date(event.date), "d MMM yyyy, HH:mm", {
                              locale: pl,
                            })}{" "}
                            · {event.locationPublic}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-stone-600">
                            {event._count.bookings} rezerwacji
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              statusColors[event.status] || "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {statusLabels[event.status] || event.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
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
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">
                  Wszystkie wydarzenia
                </p>
                <p className="text-2xl font-bold text-stone-900">
                  {host.eventsCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">
                  Aktywne wydarzenia
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {host.publishedEvents}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">
                  Łączne rezerwacje
                </p>
                <p className="text-2xl font-bold text-stone-900">
                  {host.totalBookings}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">
                  Łączny przychód
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatPrice(host.totalRevenue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">
                  Data rejestracji
                </p>
                <p className="text-stone-900">
                  {format(new Date(host.createdAt), "d MMMM yyyy", {
                    locale: pl,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚡ Akcje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {host.verified ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-full"
                      variant="destructive"
                      disabled={isProcessing}
                    >
                      ❌ Cofnij weryfikację
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cofnąć weryfikację?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {host.businessName} straci status zweryfikowanego hosta.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anuluj</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleVerifyToggle(false)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Tak, cofnij
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isProcessing}
                    >
                      ✅ Zweryfikuj hosta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Zweryfikować hosta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {host.businessName} otrzyma status zweryfikowanego hosta
                        i będzie mógł tworzyć wydarzenia. Zostanie wysłany email
                        z potwierdzeniem.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anuluj</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleVerifyToggle(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Tak, zweryfikuj
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <Link href={`/admin/users/${host.userId}`}>
                <Button className="w-full" variant="outline">
                  👤 Profil użytkownika
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📞 Kontakt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href={`mailto:${host.user.email}`}
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                ✉️ {host.user.email}
              </a>
              {host.phoneNumber && (
                <a
                  href={`tel:${host.phoneNumber}`}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  📱 {host.phoneNumber}
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
