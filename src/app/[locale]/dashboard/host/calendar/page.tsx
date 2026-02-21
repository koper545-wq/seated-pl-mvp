"use client";

import { useState, useMemo, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Loader2,
} from "lucide-react";
import { type HostEvent } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useEvents } from "@/contexts/events-context";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
] as const;

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Get day of week for first day (0 = Sunday, we want Monday = 0)
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek < 0) startDayOfWeek = 6;

  const days: (number | null)[] = [];

  // Add empty days for the start of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return days;
}

function EventCard({ event }: { event: HostEvent }) {
  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    pending_review: "bg-yellow-100 text-yellow-700",
    published: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const statusLabels: Record<string, string> = {
    draft: "Szkic",
    pending_review: "Oczekuje",
    published: "Aktywne",
    completed: "Zakończone",
    cancelled: "Anulowane",
  };

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={cn("text-xs", statusColors[event.status])}>
                {statusLabels[event.status]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {event.startTime}
              </span>
            </div>
            <h3 className="font-semibold truncate mb-2">{event.title}</h3>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {event.confirmedGuests} / {event.capacity}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.location}
              </span>
            </div>
          </div>
          <Link href={`/dashboard/host/events/${event.id}/guests`}>
            <Button variant="outline" size="sm">
              Szczegóły
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Map API event to HostEvent shape for calendar
function mapApiEventForCalendar(e: Record<string, unknown>): HostEvent {
  const eventDate = new Date(e.date as string);
  const statusMap: Record<string, string> = {
    PUBLISHED: "published", DRAFT: "draft", PENDING_REVIEW: "pending_review",
    COMPLETED: "completed", CANCELLED: "cancelled",
  };
  return {
    id: e.id as string,
    title: e.title as string,
    slug: (e.slug as string) || "",
    type: (e.eventType as string) || "",
    typeSlug: "",
    date: eventDate,
    dateFormatted: format(eventDate, "d MMMM yyyy", { locale: pl }),
    startTime: (e.startTime as string) || "",
    duration: (e.duration as number) || 0,
    location: (e.locationPublic as string) || "",
    fullAddress: (e.locationFull as string) || "",
    price: ((e.price as number) || 0) / 100,
    capacity: (e.capacity as number) || 0,
    spotsLeft: (e.spotsLeft as number) || 0,
    bookingsCount: 0,
    pendingBookings: (e.pendingBookings as number) || 0,
    confirmedGuests: (e.totalGuests as number) || 0,
    revenue: ((e.revenue as number) || 0) / 100,
    imageGradient: "from-amber-400 to-orange-500",
    status: (statusMap[(e.status as string)] || "draft") as HostEvent["status"],
    description: (e.description as string) || "",
    menuDescription: (e.menuDescription as string) || "",
    dietaryOptions: (e.dietaryOptions as string[]) || [],
    createdAt: new Date((e.createdAt as string) || Date.now()),
  };
}

export default function HostCalendarPage() {
  const t = useTranslations("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "list">("month");
  const { user, isLoading, effectiveRole, isMockUser } = useCurrentUser();
  const { getHostEvents, isLoaded: eventsLoaded } = useEvents();
  const router = useRouter();
  const [apiEvents, setApiEvents] = useState<HostEvent[] | null>(null);
  const [apiEventsLoading, setApiEventsLoading] = useState(false);

  const hostId = isMockUser && user && 'id' in user ? user.id : "host-1";
  const mockHostEvents = isMockUser ? getHostEvents(hostId) : [];

  // Fetch events from API for real users
  useEffect(() => {
    if (isMockUser || isLoading || effectiveRole === "guest") return;
    setApiEventsLoading(true);
    fetch("/api/host/events")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.events) setApiEvents(data.events.map(mapApiEventForCalendar));
        else setApiEvents([]);
      })
      .catch(() => setApiEvents([]))
      .finally(() => setApiEventsLoading(false));
  }, [isMockUser, isLoading, effectiveRole]);

  const hostEvents = isMockUser ? mockHostEvents : (apiEvents || []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // ALL HOOKS MUST BE BEFORE CONDITIONAL RETURNS
  const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);

  // Get events for current month
  const eventsThisMonth = useMemo(() => {
    return hostEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });
  }, [hostEvents, month, year]);

  // Group events by day
  const eventsByDay = useMemo(() => {
    const map = new Map<number, HostEvent[]>();
    eventsThisMonth.forEach((event) => {
      const day = new Date(event.date).getDate();
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(event);
    });
    return map;
  }, [eventsThisMonth]);

  // Redirect to guest dashboard if in guest mode
  useEffect(() => {
    if (!isLoading && effectiveRole === "guest") {
      router.push("/dashboard");
    }
  }, [isLoading, effectiveRole, router]);

  // CONDITIONAL RETURNS MUST BE AFTER ALL HOOKS
  const isDataLoading = isMockUser ? (isLoading || !eventsLoaded) : (isLoading || apiEventsLoading);
  if (isDataLoading) {
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

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  // All upcoming events sorted by date
  const upcomingEvents = hostEvents
    .filter((e) => new Date(e.date) >= today && e.status !== "cancelled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/host">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{t("title")}</h1>
                <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
              </div>
            </div>
            <Button asChild className="bg-amber-600 hover:bg-amber-700">
              <Link href="/dashboard/host/events/new">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t("createEvent")}</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* View toggle & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[180px] text-center">
              <h2 className="text-lg font-semibold">
                {t(`months.${MONTHS[month]}`)} {year}
              </h2>
            </div>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              {t("today")}
            </Button>
          </div>

          <Tabs value={view} onValueChange={(v) => setView(v as "month" | "list")}>
            <TabsList>
              <TabsTrigger value="month">{t("month")}</TabsTrigger>
              <TabsTrigger value="list">{t("list")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {view === "month" ? (
          /* Calendar Grid */
          <Card>
            <CardContent className="p-4">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground py-2"
                  >
                    {t(`weekdays.${day}`)}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((day, index) => {
                  const dayEvents = day ? eventsByDay.get(day) || [] : [];
                  const isToday = isCurrentMonth && day === today.getDate();

                  return (
                    <div
                      key={index}
                      className={cn(
                        "min-h-[80px] md:min-h-[100px] p-1 border rounded-lg",
                        day ? "bg-background" : "bg-muted/30",
                        isToday && "border-amber-600 border-2"
                      )}
                    >
                      {day && (
                        <>
                          <span
                            className={cn(
                              "inline-flex items-center justify-center w-6 h-6 text-sm rounded-full",
                              isToday && "bg-amber-600 text-white font-bold"
                            )}
                          >
                            {day}
                          </span>
                          <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <Link
                                key={event.id}
                                href={`/dashboard/host/events/${event.id}/guests`}
                                className={cn(
                                  "block text-xs p-1 rounded truncate",
                                  event.status === "published"
                                    ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                    : event.status === "draft"
                                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                )}
                              >
                                {event.startTime} {event.title}
                              </Link>
                            ))}
                            {dayEvents.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{dayEvents.length - 2} więcej
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* List View */
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("upcomingEvents")}</h3>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => {
                const eventDate = new Date(event.date);
                const dateStr = eventDate.toLocaleDateString("pl-PL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                });

                return (
                  <div key={event.id}>
                    <p className="text-sm text-muted-foreground mb-2 capitalize">
                      {dateStr}
                    </p>
                    <EventCard event={event} />
                  </div>
                );
              })
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t("noEventsThisMonth")}</p>
                  <Button asChild className="mt-4 bg-amber-600 hover:bg-amber-700">
                    <Link href="/dashboard/host/events/new">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("createEvent")}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
