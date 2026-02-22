import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function getAdminStats() {
  const [
    totalUsers,
    totalHosts,
    totalEvents,
    activeEvents,
    newUsersThisMonth,
    totalRevenueResult,
    monthlyRevenueResult,
  ] = await Promise.all([
    db.user.count(),
    db.hostProfile.count(),
    db.event.count(),
    db.event.count({ where: { status: "PUBLISHED", date: { gte: new Date() } } }),
    db.user.count({
      where: {
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    db.transaction.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
    db.transaction.aggregate({
      where: {
        status: "COMPLETED",
        processedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalUsers,
    totalHosts,
    totalEvents,
    activeEventsThisMonth: activeEvents,
    newUsersThisMonth,
    totalRevenue: totalRevenueResult._sum.amount || 0,
    monthlyRevenue: monthlyRevenueResult._sum.amount || 0,
  };
}

async function getPendingEvents() {
  return db.event.findMany({
    where: { status: "PENDING_REVIEW" },
    include: {
      host: { select: { businessName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

async function getRecentUsers() {
  return db.user.findMany({
    include: {
      guestProfile: { select: { firstName: true, lastName: true } },
      hostProfile: { select: { businessName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

export default async function AdminDashboardPage() {
  const [stats, pendingEvents, recentUsers] = await Promise.all([
    getAdminStats(),
    getPendingEvents(),
    getRecentUsers(),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-500 mt-1">Przegląd platformy Seated</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Użytkownicy</p>
                <p className="text-3xl font-bold text-stone-900">
                  {stats.totalUsers.toLocaleString()}
                </p>
              </div>
              <span className="text-4xl">👥</span>
            </div>
            <p className="text-xs text-green-600 mt-2">
              +{stats.newUsersThisMonth} w tym miesiącu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Hosty</p>
                <p className="text-3xl font-bold text-stone-900">{stats.totalHosts}</p>
              </div>
              <span className="text-4xl">👨‍🍳</span>
            </div>
            <p className="text-xs text-amber-600 mt-2">
              {stats.activeEventsThisMonth} aktywnych wydarzeń
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Wydarzenia</p>
                <p className="text-3xl font-bold text-stone-900">{stats.totalEvents}</p>
              </div>
              <span className="text-4xl">🎉</span>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              {stats.activeEventsThisMonth} aktywnych
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Przychód</p>
                <p className="text-3xl font-bold text-stone-900">
                  {(stats.totalRevenue / 100).toLocaleString()} zł
                </p>
              </div>
              <span className="text-4xl">💰</span>
            </div>
            <p className="text-xs text-green-600 mt-2">
              +{(stats.monthlyRevenue / 100).toLocaleString()} zł w tym miesiącu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Pending Event Reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🎪</span> Wydarzenia do akceptacji
              {pendingEvents.length > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingEvents.length}
                </span>
              )}
            </CardTitle>
            <Link href="/admin/events">
              <Button variant="ghost" size="sm">
                Zobacz wszystkie →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingEvents.length === 0 ? (
              <p className="text-stone-500 text-sm py-4 text-center">
                Brak wydarzeń do akceptacji 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {pendingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.id}`}
                    className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-lg">
                        🍴
                      </div>
                      <div>
                        <p className="font-medium text-stone-900 text-sm">
                          {event.title}
                        </p>
                        <p className="text-xs text-stone-500">
                          {format(event.date, "d MMM · HH:mm", { locale: pl })}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                      Do akceptacji
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hosts overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>👨‍🍳</span> Hosty na platformie
            </CardTitle>
            <Link href="/admin/hosts">
              <Button variant="ghost" size="sm">
                Zobacz wszystkie →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div>
                  <p className="text-sm text-amber-600">Aktywnych hostów</p>
                  <p className="text-2xl font-bold text-amber-700">{stats.totalHosts}</p>
                </div>
                <span className="text-3xl">👨‍🍳</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-green-600">Aktywnych wydarzeń</p>
                  <p className="text-2xl font-bold text-green-700">
                    {stats.activeEventsThisMonth}
                  </p>
                </div>
                <span className="text-3xl">🎫</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🆕</span> Nowi użytkownicy
            </CardTitle>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">
                Zobacz wszystkich →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => {
                const name = user.guestProfile
                  ? `${user.guestProfile.firstName} ${user.guestProfile.lastName}`
                  : user.hostProfile?.businessName || user.email;
                const role = user.userType.toLowerCase();

                return (
                  <Link
                    key={user.id}
                    href={`/admin/users/${user.id}`}
                    className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-lg">
                        {role === "host" ? "👨‍🍳" : role === "admin" ? "👑" : "👤"}
                      </div>
                      <div>
                        <p className="font-medium text-stone-900">{name}</p>
                        <p className="text-xs text-stone-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          role === "host"
                            ? "bg-amber-100 text-amber-700"
                            : role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {role === "host" ? "Host" : role === "admin" ? "Admin" : "Gość"}
                      </span>
                      <p className="text-xs text-stone-400 mt-1">
                        {format(user.createdAt, "d MMM yyyy", { locale: pl })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>📈</span> Podsumowanie miesiąca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-green-600">Przychód z prowizji</p>
                  <p className="text-2xl font-bold text-green-700">
                    {(stats.monthlyRevenue / 100).toLocaleString()} zł
                  </p>
                </div>
                <span className="text-3xl">💵</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-600">Aktywne wydarzenia</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {stats.activeEventsThisMonth}
                  </p>
                </div>
                <span className="text-3xl">🎫</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-purple-600">Nowi użytkownicy</p>
                  <p className="text-2xl font-bold text-purple-700">
                    +{stats.newUsersThisMonth}
                  </p>
                </div>
                <span className="text-3xl">📈</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
