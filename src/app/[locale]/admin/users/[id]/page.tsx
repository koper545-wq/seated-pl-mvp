"use client";

import { use, useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface UserDetail {
  id: string;
  email: string;
  userType: string;
  status: string;
  emailVerified: string | null;
  createdAt: string;
  guestProfile: { firstName: string; lastName: string; xp: number } | null;
  hostProfile: {
    id: string;
    businessName: string;
    verified: boolean;
    city: string;
    events: { id: string; title: string; status: string; date: string; price: number }[];
  } | null;
  bookings: {
    id: string;
    status: string;
    ticketCount: number;
    totalPrice: number;
    createdAt: string;
    event: { id: string; title: string; date: string; price: number; locationPublic: string };
  }[];
}

const roleLabels: Record<string, { label: string; color: string }> = {
  GUEST: { label: "Gość", color: "bg-stone-100 text-stone-700" },
  HOST: { label: "Host", color: "bg-amber-100 text-amber-700" },
  ADMIN: { label: "Admin", color: "bg-purple-100 text-purple-700" },
};

const bookingStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Oczekuje", color: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Potwierdzona", color: "bg-green-100 text-green-700" },
  DECLINED: { label: "Odrzucona", color: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Anulowana", color: "bg-stone-100 text-stone-700" },
  COMPLETED: { label: "Zakończona", color: "bg-blue-100 text-blue-700" },
  NO_SHOW: { label: "Nieobecny", color: "bg-red-100 text-red-700" },
};

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser((prev) => prev ? { ...prev, status: data.user.status } : prev);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userType: newRole }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser((prev) => prev ? { ...prev, userType: data.user.userType } : prev);
      }
    } catch (error) {
      console.error(error);
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

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card className="p-8 text-center">
          <span className="text-6xl mb-4 block">🔍</span>
          <h1 className="text-xl font-bold text-stone-900 mb-2">Nie znaleziono użytkownika</h1>
          <Link href="/admin/users">
            <Button>Wróć do listy</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const name = user.guestProfile
    ? `${user.guestProfile.firstName} ${user.guestProfile.lastName}`
    : user.hostProfile?.businessName || user.email;
  const rl = roleLabels[user.userType] || roleLabels.GUEST;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">← Wróć</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{name}</h1>
            <p className="text-stone-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${rl.color}`}>{rl.label}</span>
          {user.status !== "ACTIVE" && (
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-700">{user.status}</span>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>👤</span> Profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-stone-400 uppercase">Email</p>
                  <p className="text-stone-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase">Weryfikacja email</p>
                  <p className="text-stone-900">{user.emailVerified ? "✓ Zweryfikowany" : "○ Nie"}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase">Dołączył</p>
                  <p className="text-stone-900">{format(new Date(user.createdAt), "d MMM yyyy", { locale: pl })}</p>
                </div>
                {user.hostProfile && (
                  <div>
                    <p className="text-xs text-stone-400 uppercase">Miasto</p>
                    <p className="text-stone-900">{user.hostProfile.city}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>📊</span> Aktywność
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-stone-50 rounded-lg">
                  <p className="text-xs text-stone-400 uppercase mb-1">Dołączył</p>
                  <p className="font-medium text-stone-900">
                    {format(new Date(user.createdAt), "d MMM yyyy", { locale: pl })}
                  </p>
                </div>
                {user.userType === "HOST" && user.hostProfile && (
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-600 uppercase mb-1">Wydarzenia</p>
                    <p className="font-bold text-amber-700 text-xl">{user.hostProfile.events.length}</p>
                  </div>
                )}
                {user.userType === "GUEST" && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 uppercase mb-1">Rezerwacje</p>
                    <p className="font-bold text-blue-700 text-xl">{user.bookings.length}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bookings */}
          {user.bookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>🎫</span> Historia rezerwacji
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.bookings.map((booking) => {
                    const bs = bookingStatusLabels[booking.status] || bookingStatusLabels.PENDING;
                    return (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                        <div>
                          <p className="font-medium text-stone-900">{booking.event.title}</p>
                          <p className="text-xs text-stone-500">
                            {format(new Date(booking.event.date), "d MMM yyyy", { locale: pl })} · {booking.event.locationPublic}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{(booking.totalPrice / 100).toLocaleString()} zł</p>
                            <p className="text-xs text-stone-500">{booking.ticketCount} bilet{booking.ticketCount > 1 ? "y" : ""}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${bs.color}`}>{bs.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">👥 Rola</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                defaultValue={user.userType}
                onValueChange={handleRoleChange}
                disabled={user.userType === "ADMIN" || isProcessing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GUEST">Gość</SelectItem>
                  <SelectItem value="HOST">Host</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚡ Akcje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.status === "ACTIVE" ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full" variant="destructive" disabled={isProcessing || user.userType === "ADMIN"}>
                      🚫 Zablokuj
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Zablokować użytkownika?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {name} nie będzie mógł się zalogować.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anuluj</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleStatusChange("SUSPENDED")} className="bg-red-600 hover:bg-red-700">
                        Tak, zablokuj
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange("ACTIVE")} disabled={isProcessing}>
                  ✓ Odblokuj
                </Button>
              )}

              <a href={`mailto:${user.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline mt-4">
                ✉️ Wyślij email
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
