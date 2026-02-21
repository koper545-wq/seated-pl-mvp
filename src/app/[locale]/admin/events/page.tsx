"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  mockEvents,
  hostEvents,
  hostEventStatusLabels,
  HostEventStatus,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Combine events for admin view
const allEvents = [
  ...hostEvents,
  ...mockEvents.map((e) => ({
    ...e,
    status: "published" as HostEventStatus,
    bookingsCount: e.capacity - e.spotsLeft,
    pendingBookings: 0,
    confirmedGuests: e.capacity - e.spotsLeft,
    revenue: (e.capacity - e.spotsLeft) * e.price * 100,
    createdAt: new Date("2025-01-01"),
  })),
].filter((event, index, self) =>
  index === self.findIndex((e) => e.id === event.id)
);

export default function AdminEventsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | HostEventStatus>("all");

  const filteredEvents = allEvents.filter((event) => {
    const matchesSearch =
      search === "" ||
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = activeTab === "all" || event.status === activeTab;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: allEvents.length,
    pending_review: allEvents.filter((e) => e.status === "pending_review").length,
    published: allEvents.filter((e) => e.status === "published").length,
    draft: allEvents.filter((e) => e.status === "draft").length,
    completed: allEvents.filter((e) => e.status === "completed").length,
    cancelled: allEvents.filter((e) => e.status === "cancelled").length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Wydarzenia</h1>
        <p className="text-stone-500 mt-1">
          Zarządzaj wydarzeniami na platformie
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-700">
                {statusCounts.pending_review}
              </p>
              <p className="text-sm text-yellow-600">Do akceptacji</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">
                {statusCounts.published}
              </p>
              <p className="text-sm text-green-600">Opublikowane</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-stone-50 border-stone-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-700">
                {statusCounts.draft}
              </p>
              <p className="text-sm text-stone-600">Szkice</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">
                {statusCounts.completed}
              </p>
              <p className="text-sm text-blue-600">Zakończone</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-700">
                {statusCounts.cancelled}
              </p>
              <p className="text-sm text-red-600">Anulowane</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Szukaj po tytule lub lokalizacji..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="all">
            Wszystkie ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="pending_review">
            Do akceptacji ({statusCounts.pending_review})
          </TabsTrigger>
          <TabsTrigger value="published">
            Opublikowane ({statusCounts.published})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Szkice ({statusCounts.draft})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Zakończone ({statusCounts.completed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredEvents.length === 0 ? (
            <Card className="p-8 text-center">
              <span className="text-4xl mb-2 block">🔍</span>
              <p className="text-stone-500">Brak wydarzeń spełniających kryteria</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Event Image */}
                      <div
                        className={`w-full md:w-48 h-32 md:h-auto bg-gradient-to-br ${event.imageGradient} flex items-center justify-center text-4xl shrink-0`}
                      >
                        🍴
                      </div>

                      {/* Event Info */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg text-stone-900">
                              {event.title}
                            </h3>
                            <p className="text-sm text-stone-500">
                              {event.type} · {event.location}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              hostEventStatusLabels[event.status].color
                            }`}
                          >
                            {hostEventStatusLabels[event.status].label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-stone-400 uppercase tracking-wide">
                              Data
                            </p>
                            <p className="text-sm text-stone-700">
                              {event.dateFormatted}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-400 uppercase tracking-wide">
                              Cena
                            </p>
                            <p className="text-sm text-stone-700">
                              {event.price} zł
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-400 uppercase tracking-wide">
                              Miejsca
                            </p>
                            <p className="text-sm text-stone-700">
                              {event.capacity - event.spotsLeft}/{event.capacity}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-400 uppercase tracking-wide">
                              Przychód
                            </p>
                            <p className="text-sm text-stone-700">
                              {((event.revenue || 0) / 100).toLocaleString()} zł
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Link href={`/admin/events/${event.id}`}>
                            <Button variant="outline" size="sm">
                              Szczegóły
                            </Button>
                          </Link>
                          <Link href={`/events/${event.id}`} target="_blank">
                            <Button variant="ghost" size="sm">
                              Podgląd →
                            </Button>
                          </Link>
                          {event.status === "pending_review" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                ✓ Akceptuj
                              </Button>
                              <Button size="sm" variant="destructive">
                                ✕ Odrzuć
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
