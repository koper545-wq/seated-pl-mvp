"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminUser {
  id: string;
  email: string;
  userType: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  firstName: string;
  lastName: string;
  bookingsCount: number;
  hostProfile: { id: string; businessName: string; verified: boolean } | null;
}

const roleLabels: Record<string, { label: string; color: string }> = {
  GUEST: { label: "Gość", color: "bg-stone-100 text-stone-700" },
  HOST: { label: "Host", color: "bg-amber-100 text-amber-700" },
  ADMIN: { label: "Admin", color: "bg-purple-100 text-purple-700" },
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (activeTab !== "all") params.set("role", activeTab);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [search, activeTab]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const roleCounts = {
    GUEST: users.filter((u) => u.userType === "GUEST").length,
    HOST: users.filter((u) => u.userType === "HOST").length,
    ADMIN: users.filter((u) => u.userType === "ADMIN").length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Użytkownicy</h1>
        <p className="text-stone-500 mt-1">Zarządzaj użytkownikami platformy</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-stone-900">{total}</p>
            <p className="text-sm text-stone-500">Wszyscy</p>
          </CardContent>
        </Card>
        <Card className="bg-stone-50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-stone-700">{roleCounts.GUEST}</p>
            <p className="text-sm text-stone-500">Goście</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-700">{roleCounts.HOST}</p>
            <p className="text-sm text-amber-600">Hosty</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-700">{roleCounts.ADMIN}</p>
            <p className="text-sm text-purple-600">Admini</p>
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Wszyscy ({total})</TabsTrigger>
          <TabsTrigger value="guest">Goście</TabsTrigger>
          <TabsTrigger value="host">Hosty</TabsTrigger>
          <TabsTrigger value="admin">Admini</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <Card className="p-8 text-center">
              <p className="text-stone-500">Ładowanie...</p>
            </Card>
          ) : users.length === 0 ? (
            <Card className="p-8 text-center">
              <span className="text-4xl mb-2 block">🔍</span>
              <p className="text-stone-500">Brak użytkowników spełniających kryteria</p>
            </Card>
          ) : (
            <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Użytkownik</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Rola</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Statystyki</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Dołączył</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {users.map((user) => {
                    const rl = roleLabels[user.userType] || roleLabels.GUEST;
                    return (
                      <tr key={user.id} className="hover:bg-stone-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                              user.userType === "HOST" ? "bg-amber-100" : user.userType === "ADMIN" ? "bg-purple-100" : "bg-stone-100"
                            }`}>
                              {user.userType === "HOST" ? "👨‍🍳" : user.userType === "ADMIN" ? "👑" : "👤"}
                            </div>
                            <div>
                              <p className="font-medium text-stone-900">{user.firstName} {user.lastName}</p>
                              <p className="text-xs text-stone-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${rl.color}`}>{rl.label}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {user.emailVerified ? (
                              <span className="text-xs text-green-600">✓ Zweryfikowany</span>
                            ) : (
                              <span className="text-xs text-yellow-600">○ Niezweryfikowany</span>
                            )}
                            <span className={`text-xs ${user.status === "ACTIVE" ? "text-blue-600" : "text-red-600"}`}>
                              {user.status === "ACTIVE" ? "● Aktywny" : `○ ${user.status}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-stone-600">
                          {user.userType === "HOST" && user.hostProfile && (
                            <p>{user.hostProfile.verified ? "✅" : "⏳"} {user.hostProfile.businessName}</p>
                          )}
                          {user.userType === "GUEST" && <p>🎫 {user.bookingsCount} rezerwacji</p>}
                          {user.userType === "ADMIN" && <p className="text-purple-600">Administrator</p>}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-stone-900">
                            {format(new Date(user.createdAt), "d MMM yyyy", { locale: pl })}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="ghost" size="sm">Szczegóły →</Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
