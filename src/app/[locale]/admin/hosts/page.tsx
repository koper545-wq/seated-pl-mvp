"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, CheckCircle, Clock } from "lucide-react";

interface AdminHost {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  city: string;
  neighborhood: string;
  verified: boolean;
  cuisineSpecialties: string[];
  responseRate: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  user: { id: string; email: string; status: string; createdAt: string };
  eventsCount: number;
  publishedEvents: number;
}

export default function AdminHostsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [hosts, setHosts] = useState<AdminHost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchHosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (activeTab === "verified") params.set("verified", "true");
      if (activeTab === "unverified") params.set("verified", "false");
      const res = await fetch(`/api/admin/hosts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setHosts(data.hosts);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch hosts:", error);
    } finally {
      setLoading(false);
    }
  }, [search, activeTab]);

  useEffect(() => {
    const timer = setTimeout(fetchHosts, 300);
    return () => clearTimeout(timer);
  }, [fetchHosts]);

  const handleVerifyToggle = async (hostId: string, verified: boolean) => {
    try {
      const res = await fetch(`/api/admin/hosts/${hostId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified }),
      });
      if (res.ok) {
        fetchHosts();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const verifiedCount = hosts.filter((h) => h.verified).length;
  const unverifiedCount = hosts.filter((h) => !h.verified).length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Hosty</h1>
            <p className="text-stone-500 mt-1">Zarządzaj hostami na platformie</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-stone-900">{total}</p>
            <p className="text-sm text-stone-500">Wszyscy hosty</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{verifiedCount}</p>
            <p className="text-sm text-green-600">Zweryfikowani</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{unverifiedCount}</p>
            <p className="text-sm text-yellow-600">Niezweryfikowani</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Szukaj po nazwie, mieście lub email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Wszyscy ({total})</TabsTrigger>
          <TabsTrigger value="verified">Zweryfikowani ({verifiedCount})</TabsTrigger>
          <TabsTrigger value="unverified">Niezweryfikowani ({unverifiedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <Card className="p-8 text-center">
              <p className="text-stone-500">Ładowanie...</p>
            </Card>
          ) : hosts.length === 0 ? (
            <Card className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto text-stone-300 mb-4" />
              <p className="text-stone-500">Brak hostów spełniających kryteria</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {hosts.map((host) => (
                <Card key={host.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
                              👨‍🍳
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg text-stone-900">{host.businessName}</h3>
                                {host.verified ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Clock className="h-5 w-5 text-yellow-600" />
                                )}
                              </div>
                              <p className="text-sm text-stone-500">{host.user.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-stone-400 uppercase">Lokalizacja</p>
                            <p className="text-sm text-stone-700">{host.neighborhood}, {host.city}</p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-400 uppercase">Wydarzenia</p>
                            <p className="text-sm text-stone-700">{host.eventsCount} ({host.publishedEvents} aktywnych)</p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-400 uppercase">Ocena</p>
                            <p className="text-sm text-stone-700">⭐ {host.rating} ({host.reviewCount} opinii)</p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-400 uppercase">Response rate</p>
                            <p className="text-sm text-stone-700">{host.responseRate}%</p>
                          </div>
                        </div>

                        {host.cuisineSpecialties.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {host.cuisineSpecialties.map((cuisine) => (
                              <span key={cuisine} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">
                                {cuisine}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="w-full md:w-56 bg-stone-50 p-6 flex flex-col justify-between">
                        <div>
                          <p className="text-xs text-stone-400 uppercase mb-1">Status</p>
                          <div className="flex items-center gap-2">
                            {host.verified ? (
                              <>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-green-600">Zweryfikowany</span>
                              </>
                            ) : (
                              <>
                                <Clock className="h-5 w-5 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-600">Oczekuje</span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 mt-2">
                            Od {format(new Date(host.createdAt), "d MMM yyyy", { locale: pl })}
                          </p>
                        </div>

                        <div className="mt-4 space-y-2">
                          {host.verified ? (
                            <Button
                              className="w-full"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleVerifyToggle(host.id, false)}
                            >
                              Cofnij weryfikację
                            </Button>
                          ) : (
                            <Button
                              className="w-full bg-green-600 hover:bg-green-700"
                              size="sm"
                              onClick={() => handleVerifyToggle(host.id, true)}
                            >
                              ✓ Zweryfikuj
                            </Button>
                          )}
                          <Link href={`/admin/hosts/${host.id}`}>
                            <Button className="w-full" variant="outline" size="sm">
                              Szczegóły hosta
                            </Button>
                          </Link>
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
