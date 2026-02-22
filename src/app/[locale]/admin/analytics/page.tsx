import { format, subDays } from "date-fns";
import { pl } from "date-fns/locale";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  ChefHat,
  Ticket,
} from "lucide-react";

async function getAnalyticsData() {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sevenDaysAgo = subDays(now, 7);

  // Basic stats
  const [
    totalRevenue30,
    totalRevenue7,
    totalBookings30,
    totalBookings7,
    newUsers30,
    newUsers7,
    totalEvents,
    activeEvents,
    totalHosts,
    verifiedHosts,
  ] = await Promise.all([
    db.transaction.aggregate({
      where: { status: "COMPLETED", processedAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: { status: "COMPLETED", processedAt: { gte: sevenDaysAgo } },
      _sum: { amount: true },
    }),
    db.booking.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.booking.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.event.count(),
    db.event.count({ where: { status: "PUBLISHED", date: { gte: now } } }),
    db.hostProfile.count(),
    db.hostProfile.count({ where: { verified: true } }),
  ]);

  // Top hosts by number of events
  const topHostsData = await db.hostProfile.findMany({
    select: {
      id: true,
      businessName: true,
      events: {
        select: {
          id: true,
          bookings: {
            select: {
              transactions: {
                select: { amount: true, status: true },
              },
            },
          },
        },
      },
      _count: { select: { events: true } },
    },
    take: 10,
    orderBy: { events: { _count: "desc" } },
  });

  const topHosts = topHostsData.map((host) => {
    const revenue = host.events.reduce((sum, event) => {
      return (
        sum +
        event.bookings.reduce((bSum, booking) => {
          const completedTx = booking.transactions.find(
            (t) => t.status === "COMPLETED"
          );
          return bSum + (completedTx?.amount || 0);
        }, 0)
      );
    }, 0);
    const totalBookings = host.events.reduce(
      (sum, event) => sum + event.bookings.length,
      0
    );

    return {
      id: host.id,
      name: host.businessName,
      eventsHosted: host._count.events,
      totalBookings,
      revenue,
    };
  });

  // Sort by revenue
  topHosts.sort((a, b) => b.revenue - a.revenue);

  // Top events by bookings
  const topEvents = await db.event.findMany({
    select: {
      id: true,
      title: true,
      capacity: true,
      spotsLeft: true,
      host: { select: { businessName: true } },
      _count: { select: { bookings: true } },
      bookings: {
        select: {
          transactions: {
            select: { amount: true, status: true },
          },
        },
      },
    },
    orderBy: { bookings: { _count: "desc" } },
    take: 5,
  });

  const topEventsFormatted = topEvents.map((event) => {
    const revenue = event.bookings.reduce((sum, b) => {
      const completedTx = b.transactions.find(
        (t) => t.status === "COMPLETED"
      );
      return sum + (completedTx?.amount || 0);
    }, 0);
    return {
      id: event.id,
      title: event.title,
      hostName: event.host.businessName,
      bookingsCount: event._count.bookings,
      spotsLeft: event.spotsLeft,
      revenue,
    };
  });

  // Daily stats for chart (last 14 days)
  const dailyBookings = await db.booking.groupBy({
    by: ["createdAt"],
    where: { createdAt: { gte: subDays(now, 14) } },
    _count: true,
  });

  // Aggregate bookings by day
  const dailyMap = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const day = format(subDays(now, i), "yyyy-MM-dd");
    dailyMap.set(day, 0);
  }
  for (const row of dailyBookings) {
    const day = format(new Date(row.createdAt), "yyyy-MM-dd");
    dailyMap.set(day, (dailyMap.get(day) || 0) + row._count);
  }

  const dailyStats = Array.from(dailyMap.entries()).map(([date, bookings]) => ({
    date,
    bookings,
  }));

  // Event type stats
  const eventsByType = await db.event.groupBy({
    by: ["eventType"],
    _count: true,
  });

  return {
    revenue30: totalRevenue30._sum.amount || 0,
    revenue7: totalRevenue7._sum.amount || 0,
    bookings30: totalBookings30,
    bookings7: totalBookings7,
    newUsers30,
    newUsers7,
    totalEvents,
    activeEvents,
    totalHosts,
    verifiedHosts,
    topHosts: topHosts.slice(0, 5),
    topEvents: topEventsFormatted,
    dailyStats,
    eventsByType,
  };
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  const maxBookings = Math.max(...data.dailyStats.map((d) => d.bookings), 1);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Analityka</h1>
        <p className="text-stone-500 mt-1">
          Statystyki platformy z prawdziwych danych
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-stone-900">
              {(data.revenue30 / 100).toLocaleString("pl-PL")} zl
            </p>
            <p className="text-xs text-stone-500">Przychod (30 dni)</p>
            <p className="text-xs text-green-600 mt-1">
              {(data.revenue7 / 100).toLocaleString("pl-PL")} zl ostatnie 7 dni
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Ticket className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-stone-900">
              {data.bookings30}
            </p>
            <p className="text-xs text-stone-500">Rezerwacje (30 dni)</p>
            <p className="text-xs text-blue-600 mt-1">
              {data.bookings7} ostatnie 7 dni
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-stone-900">
              +{data.newUsers30}
            </p>
            <p className="text-xs text-stone-500">Nowi uzytkownicy (30 dni)</p>
            <p className="text-xs text-purple-600 mt-1">
              +{data.newUsers7} ostatnie 7 dni
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-stone-900">
              {data.activeEvents}
            </p>
            <p className="text-xs text-stone-500">Aktywne wydarzenia</p>
            <p className="text-xs text-amber-600 mt-1">
              {data.totalEvents} lacznie
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Chart - Simple Bar Chart (last 14 days) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-blue-600" />
            Rezerwacje dziennie (ostatnie 14 dni)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end gap-1">
            {data.dailyStats.map((day) => {
              const height =
                maxBookings > 0 ? (day.bookings / maxBookings) * 100 : 0;
              const date = new Date(day.date);
              const isWeekend =
                date.getDay() === 0 || date.getDay() === 6;
              return (
                <div key={day.date} className="flex-1 group relative">
                  <div
                    className={`w-full rounded-t transition-all hover:opacity-80 ${
                      isWeekend ? "bg-amber-400" : "bg-blue-500"
                    }`}
                    style={{
                      height: `${Math.max(height, 2)}%`,
                    }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-stone-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {format(date, "d MMM", { locale: pl })}:{" "}
                      {day.bookings} rez.
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-stone-500">
            <span>
              {data.dailyStats.length > 0
                ? format(new Date(data.dailyStats[0].date), "d MMM", {
                    locale: pl,
                  })
                : ""}
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-500 rounded"></span> Dni
                robocze
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-amber-400 rounded"></span>{" "}
                Weekend
              </span>
            </div>
            <span>
              {data.dailyStats.length > 0
                ? format(
                    new Date(
                      data.dailyStats[data.dailyStats.length - 1].date
                    ),
                    "d MMM",
                    { locale: pl }
                  )
                : ""}
            </span>
          </div>
          {data.bookings30 === 0 && (
            <p className="text-center text-stone-400 mt-4 text-sm">
              Brak rezerwacji w ostatnich 14 dniach
            </p>
          )}
        </CardContent>
      </Card>

      {/* Platform Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-amber-600" />
            Hosty na platformie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-stone-50 rounded-lg">
              <p className="text-3xl font-bold text-stone-900">
                {data.totalHosts}
              </p>
              <p className="text-sm text-stone-500">Wszystkich hostow</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {data.verifiedHosts}
              </p>
              <p className="text-sm text-stone-500">Zweryfikowanych</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-3xl font-bold text-amber-600">
                {data.totalEvents}
              </p>
              <p className="text-sm text-stone-500">Wydarzen lacznie</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">
                {data.activeEvents}
              </p>
              <p className="text-sm text-stone-500">Aktywnych wydarzen</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Types */}
      {data.eventsByType.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Wydarzenia wg typu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.eventsByType.map((type) => {
                const total = data.totalEvents || 1;
                const percentage = ((type._count / total) * 100).toFixed(1);
                return (
                  <div
                    key={type.eventType}
                    className="flex items-center gap-4"
                  >
                    <span className="text-sm font-medium text-stone-900 w-40 truncate">
                      {type.eventType}
                    </span>
                    <div className="flex-1 h-4 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-stone-500 w-20 text-right">
                      {type._count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Hosts & Events */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Hosts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-amber-600" />
              Top Hosty
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topHosts.length === 0 ? (
              <p className="text-stone-500 text-center py-4">
                Brak hostow z danymi
              </p>
            ) : (
              <div className="space-y-4">
                {data.topHosts.map((host, index) => (
                  <div
                    key={host.id}
                    className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0
                          ? "bg-amber-500"
                          : index === 1
                          ? "bg-stone-400"
                          : index === 2
                          ? "bg-amber-700"
                          : "bg-stone-300"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900 truncate">
                        {host.name}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span>{host.eventsHosted} wydarzen</span>
                        <span>{host.totalBookings} rezerwacji</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        {(host.revenue / 100).toLocaleString("pl-PL")} zl
                      </p>
                      <span className="text-xs text-stone-500">
                        {host.totalBookings} rez.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Top Wydarzenia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topEvents.length === 0 ? (
              <p className="text-stone-500 text-center py-4">
                Brak wydarzen z danymi
              </p>
            ) : (
              <div className="space-y-4">
                {data.topEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0
                          ? "bg-blue-500"
                          : index === 1
                          ? "bg-blue-400"
                          : index === 2
                          ? "bg-blue-300"
                          : "bg-stone-300"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900 text-sm truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-stone-500">
                        {event.hostName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600 text-sm">
                        {(event.revenue / 100).toLocaleString("pl-PL")} zl
                      </p>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs text-stone-500">
                          {event.bookingsCount} rez.
                        </span>
                        {event.spotsLeft === 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                            SOLD OUT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Kluczowe wskazniki
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-stone-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {data.bookings30 > 0
                  ? ((data.revenue30 / data.bookings30) / 100).toFixed(0)
                  : 0}{" "}
                zl
              </p>
              <p className="text-sm text-stone-500">Sr. wartosc rezerwacji</p>
            </div>
            <div className="text-center p-4 bg-stone-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">
                {(data.bookings30 / 30).toFixed(1)}
              </p>
              <p className="text-sm text-stone-500">Sr. rezerwacji / dzien</p>
            </div>
            <div className="text-center p-4 bg-stone-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">
                {(data.newUsers30 / 30).toFixed(1)}
              </p>
              <p className="text-sm text-stone-500">
                Sr. nowych userow / dzien
              </p>
            </div>
            <div className="text-center p-4 bg-stone-50 rounded-lg">
              <p className="text-3xl font-bold text-amber-600">
                {data.totalHosts > 0
                  ? (data.totalEvents / data.totalHosts).toFixed(1)
                  : 0}
              </p>
              <p className="text-sm text-stone-500">
                Sr. wydarzen / host
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
