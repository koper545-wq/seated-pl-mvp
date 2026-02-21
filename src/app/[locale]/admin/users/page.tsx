"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { adminUsers, userRoleLabels, UserRole } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | UserRole>("all");

  const filteredUsers = adminUsers.filter((user) => {
    const matchesSearch =
      search === "" ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = activeTab === "all" || user.role === activeTab;

    return matchesSearch && matchesRole;
  });

  const roleCounts = {
    all: adminUsers.length,
    guest: adminUsers.filter((u) => u.role === "guest").length,
    host: adminUsers.filter((u) => u.role === "host").length,
    admin: adminUsers.filter((u) => u.role === "admin").length,
  };

  const activeUsers = adminUsers.filter((u) => u.isActive).length;
  const verifiedUsers = adminUsers.filter((u) => u.isVerified).length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Użytkownicy</h1>
        <p className="text-stone-500 mt-1">
          Zarządzaj użytkownikami platformy
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-900">
                {roleCounts.all}
              </p>
              <p className="text-sm text-stone-500">Wszyscy</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-stone-50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-700">
                {roleCounts.guest}
              </p>
              <p className="text-sm text-stone-500">Goście</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-700">
                {roleCounts.host}
              </p>
              <p className="text-sm text-amber-600">Hosty</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">
                {verifiedUsers}
              </p>
              <p className="text-sm text-green-600">Zweryfikowani</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">{activeUsers}</p>
              <p className="text-sm text-blue-600">Aktywni</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Szukaj po nazwisku lub email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Wszyscy ({roleCounts.all})</TabsTrigger>
          <TabsTrigger value="guest">Goście ({roleCounts.guest})</TabsTrigger>
          <TabsTrigger value="host">Hosty ({roleCounts.host})</TabsTrigger>
          <TabsTrigger value="admin">Admini ({roleCounts.admin})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredUsers.length === 0 ? (
            <Card className="p-8 text-center">
              <span className="text-4xl mb-2 block">🔍</span>
              <p className="text-stone-500">
                Brak użytkowników spełniających kryteria
              </p>
            </Card>
          ) : (
            <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Użytkownik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Rola
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Statystyki
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Dołączył
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                              user.role === "host"
                                ? "bg-amber-100"
                                : user.role === "admin"
                                ? "bg-purple-100"
                                : "bg-stone-100"
                            }`}
                          >
                            {user.avatar ||
                              (user.role === "host"
                                ? "👨‍🍳"
                                : user.role === "admin"
                                ? "👑"
                                : "👤")}
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-stone-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            userRoleLabels[user.role].color
                          }`}
                        >
                          {userRoleLabels[user.role].label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {user.isVerified ? (
                            <span className="text-xs text-green-600">
                              ✓ Zweryfikowany
                            </span>
                          ) : (
                            <span className="text-xs text-yellow-600">
                              ○ Niezweryfikowany
                            </span>
                          )}
                          {user.isActive ? (
                            <span className="text-xs text-blue-600">
                              ● Aktywny
                            </span>
                          ) : (
                            <span className="text-xs text-red-600">
                              ○ Zablokowany
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-stone-600">
                          {user.role === "host" && user.eventsHosted && (
                            <p>🎉 {user.eventsHosted} wydarzeń</p>
                          )}
                          {user.role === "host" && user.totalRevenue && (
                            <p className="text-green-600">
                              💰 {(user.totalRevenue / 100).toLocaleString()} zł
                            </p>
                          )}
                          {user.role === "guest" && user.eventsAttended && (
                            <p>🎫 {user.eventsAttended} wydarzeń</p>
                          )}
                          {user.role === "guest" && !user.eventsAttended && (
                            <p className="text-stone-400">Brak aktywności</p>
                          )}
                          {user.role === "admin" && (
                            <p className="text-purple-600">Administrator</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-stone-900">
                            {format(user.createdAt, "d MMM yyyy", { locale: pl })}
                          </p>
                          {user.lastLoginAt && (
                            <p className="text-xs text-stone-500">
                              Ostatnio:{" "}
                              {format(user.lastLoginAt, "d MMM", { locale: pl })}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/users/${user.id}`}>
                          <Button variant="ghost" size="sm">
                            Szczegóły →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
