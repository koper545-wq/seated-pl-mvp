"use client";

import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  adminStats,
  hostApplications,
  hostEvents,
  adminUsers,
  hostApplicationStatusLabels,
  mockReports,
  reportCategoryLabels,
  reportStatusLabels,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const pendingApplications = hostApplications.filter(
    (app) => app.status === "pending"
  );
  const pendingEvents = hostEvents.filter(
    (event) => event.status === "pending_review"
  );
  const recentUsers = adminUsers
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  const pendingReports = mockReports.filter(
    (report) => report.status === "pending" || report.status === "under_review"
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-500 mt-1">
          Przegląd platformy Seated
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Użytkownicy</p>
                <p className="text-3xl font-bold text-stone-900">
                  {adminStats.totalUsers.toLocaleString()}
                </p>
              </div>
              <span className="text-4xl">👥</span>
            </div>
            <p className="text-xs text-green-600 mt-2">
              +{adminStats.newUsersThisMonth} w tym miesiącu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Hosty</p>
                <p className="text-3xl font-bold text-stone-900">
                  {adminStats.totalHosts}
                </p>
              </div>
              <span className="text-4xl">👨‍🍳</span>
            </div>
            <p className="text-xs text-amber-600 mt-2">
              {adminStats.pendingHostApplications} oczekujących aplikacji
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Wydarzenia</p>
                <p className="text-3xl font-bold text-stone-900">
                  {adminStats.totalEvents}
                </p>
              </div>
              <span className="text-4xl">🎉</span>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              {adminStats.activeEventsThisMonth} aktywnych w tym miesiącu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Przychód</p>
                <p className="text-3xl font-bold text-stone-900">
                  {(adminStats.totalRevenue / 100).toLocaleString()} zł
                </p>
              </div>
              <span className="text-4xl">💰</span>
            </div>
            <p className="text-xs text-green-600 mt-2">
              +{(adminStats.monthlyRevenue / 100).toLocaleString()} zł w tym
              miesiącu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reports Alert */}
      {pendingReports.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="font-medium text-red-800">
                {pendingReports.length} zgłoszeń wymaga uwagi
              </p>
              <p className="text-sm text-red-700">
                Przejrzyj zgłoszenia od użytkowników
              </p>
            </div>
          </div>
          <Link href="/admin/reports">
            <Button className="bg-red-600 hover:bg-red-700">
              Przejdź do zgłoszeń
            </Button>
          </Link>
        </div>
      )}

      {/* Action Items */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Pending Host Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>📋</span> Aplikacje hostów
              {pendingApplications.length > 0 && (
                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingApplications.length}
                </span>
              )}
            </CardTitle>
            <Link href="/admin/hosts">
              <Button variant="ghost" size="sm">
                Zobacz wszystkie →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingApplications.length === 0 ? (
              <p className="text-stone-500 text-sm py-4 text-center">
                Brak oczekujących aplikacji 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {pendingApplications.slice(0, 3).map((app) => (
                  <Link
                    key={app.id}
                    href={`/admin/hosts/${app.id}`}
                    className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-lg">
                        👤
                      </div>
                      <div>
                        <p className="font-medium text-stone-900">
                          {app.firstName} {app.lastName}
                        </p>
                        <p className="text-xs text-stone-500">
                          {app.cuisineTypes.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          hostApplicationStatusLabels[app.status].color
                        }`}
                      >
                        {hostApplicationStatusLabels[app.status].label}
                      </span>
                      <p className="text-xs text-stone-400 mt-1">
                        {format(app.submittedAt, "d MMM", { locale: pl })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                {pendingEvents.slice(0, 3).map((event) => (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.id}`}
                    className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${event.imageGradient} flex items-center justify-center text-lg`}
                      >
                        🍴
                      </div>
                      <div>
                        <p className="font-medium text-stone-900 text-sm">
                          {event.title}
                        </p>
                        <p className="text-xs text-stone-500">
                          {event.dateFormatted}
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
              {recentUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-lg">
                      {user.avatar || "👤"}
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-stone-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        user.role === "host"
                          ? "bg-amber-100 text-amber-700"
                          : user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {user.role === "host"
                        ? "Host"
                        : user.role === "admin"
                        ? "Admin"
                        : "Gość"}
                    </span>
                    <p className="text-xs text-stone-400 mt-1">
                      {format(user.createdAt, "d MMM yyyy", { locale: pl })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>📈</span> Podsumowanie miesiąca
            </CardTitle>
            <Link href="/admin/analytics">
              <Button variant="ghost" size="sm">
                Szczegóły →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-green-600">Przychód z prowizji</p>
                  <p className="text-2xl font-bold text-green-700">
                    {(adminStats.monthlyRevenue / 100).toLocaleString()} zł
                  </p>
                </div>
                <span className="text-3xl">💵</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-600">Zrealizowane wydarzenia</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {adminStats.activeEventsThisMonth}
                  </p>
                </div>
                <span className="text-3xl">🎫</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-purple-600">Nowi użytkownicy</p>
                  <p className="text-2xl font-bold text-purple-700">
                    +{adminStats.newUsersThisMonth}
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
