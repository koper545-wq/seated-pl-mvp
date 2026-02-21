"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  mockHostVerificationProfiles,
  HostVerificationStatus,
  getVerificationBadgeInfo,
  MockHostProfile,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HostVerificationBadge } from "@/components/hosts";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Star,
  ArrowLeft,
  Search,
  Shield,
  User,
  MapPin,
  UtensilsCrossed,
  FileCheck,
} from "lucide-react";

export default function HostVerificationPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | HostVerificationStatus>("pending");
  const [selectedHost, setSelectedHost] = useState<MockHostProfile | null>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verificationData, setVerificationData] = useState({
    identityVerified: false,
    locationVerified: false,
    foodSafetyVerified: false,
    backgroundCheckPassed: false,
    notes: "",
  });

  const filteredHosts = mockHostVerificationProfiles.filter((host) => {
    const matchesSearch =
      search === "" ||
      host.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      activeTab === "all" || host.verification.status === activeTab;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: mockHostVerificationProfiles.length,
    pending: mockHostVerificationProfiles.filter((h) => h.verification.status === "pending").length,
    verified: mockHostVerificationProfiles.filter((h) => h.verification.status === "verified").length,
    premium: mockHostVerificationProfiles.filter((h) => h.verification.status === "premium").length,
    rejected: mockHostVerificationProfiles.filter((h) => h.verification.status === "rejected").length,
    suspended: mockHostVerificationProfiles.filter((h) => h.verification.status === "suspended").length,
  };

  const openVerifyDialog = (host: MockHostProfile) => {
    setSelectedHost(host);
    setVerificationData({
      identityVerified: host.verification.identityVerified,
      locationVerified: host.verification.locationVerified,
      foodSafetyVerified: host.verification.foodSafetyVerified,
      backgroundCheckPassed: host.verification.backgroundCheckPassed,
      notes: host.verification.notes || "",
    });
    setVerifyDialogOpen(true);
  };

  const handleVerify = (status: HostVerificationStatus) => {
    // In a real app, this would update the database
    console.log("Verifying host:", selectedHost?.id, "with status:", status, "data:", verificationData);
    setVerifyDialogOpen(false);
    setSelectedHost(null);
  };

  const getStatusIcon = (status: HostVerificationStatus) => {
    switch (status) {
      case "premium":
        return <Star className="h-5 w-5 text-amber-500 fill-current" />;
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "suspended":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/hosts" className="inline-flex items-center text-sm text-stone-500 hover:text-stone-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Powrót do aplikacji
        </Link>
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Weryfikacja Hostów</h1>
            <p className="text-stone-500 mt-1">
              Zarządzaj weryfikacją aktywnych hostów na platformie
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Oczekuje</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {statusCounts.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Zweryfikowani</p>
                <p className="text-2xl font-bold text-green-700">
                  {statusCounts.verified}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Premium</p>
                <p className="text-2xl font-bold text-amber-700">
                  {statusCounts.premium}
                </p>
              </div>
              <Star className="h-8 w-8 text-amber-400 fill-current" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Odrzuceni</p>
                <p className="text-2xl font-bold text-red-700">
                  {statusCounts.rejected}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-stone-50 border-stone-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">Zawieszeni</p>
                <p className="text-2xl font-bold text-stone-700">
                  {statusCounts.suspended}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-stone-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Szukaj hosta po nazwie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Oczekuje ({statusCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="verified">
            Zweryfikowani ({statusCounts.verified})
          </TabsTrigger>
          <TabsTrigger value="premium">
            Premium ({statusCounts.premium})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Odrzuceni ({statusCounts.rejected})
          </TabsTrigger>
          <TabsTrigger value="all">
            Wszyscy ({statusCounts.all})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredHosts.length === 0 ? (
            <Card className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto text-stone-300 mb-4" />
              <p className="text-stone-500">Brak hostów spełniających kryteria</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredHosts.map((host) => {
                const info = getVerificationBadgeInfo(host.verification.status);
                return (
                  <Card key={host.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Left side - Host info */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
                                {host.avatar ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={host.avatar}
                                    alt={host.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="h-6 w-6 text-amber-600" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-lg text-stone-900">
                                    {host.name}
                                  </h3>
                                  <HostVerificationBadge
                                    status={host.verification.status}
                                    verification={host.verification}
                                    size="sm"
                                    showLabel={false}
                                    showDetails={false}
                                  />
                                </div>
                                <p className="text-sm text-stone-500">{host.type === "individual" ? "Osoba prywatna" : "Restauracja"}</p>
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-amber-400 fill-current" />
                              <span className="text-sm">
                                <strong>{host.rating}</strong> ({host.reviewCount} opinii)
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UtensilsCrossed className="h-4 w-4 text-stone-400" />
                              <span className="text-sm">{host.eventsHosted} wydarzeń</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-stone-400" />
                              <span className="text-sm">
                                Od {format(host.joinedAt, "MMM yyyy", { locale: pl })}
                              </span>
                            </div>
                          </div>

                          {/* Verification checklist */}
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="flex items-center gap-2">
                              {host.verification.identityVerified ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-600" />
                              )}
                              <span className="text-sm">Tożsamość</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {host.verification.locationVerified ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-600" />
                              )}
                              <span className="text-sm">Lokalizacja</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {host.verification.foodSafetyVerified ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-600" />
                              )}
                              <span className="text-sm">Bezpieczeństwo żywności</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {host.verification.backgroundCheckPassed ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-600" />
                              )}
                              <span className="text-sm">Weryfikacja osoby</span>
                            </div>
                          </div>

                          {host.verification.notes && (
                            <div className="p-3 bg-stone-50 rounded-lg">
                              <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">
                                Notatki
                              </p>
                              <p className="text-sm text-stone-600">{host.verification.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Right side - Actions */}
                        <div className="w-full md:w-56 bg-stone-50 p-6 flex flex-col justify-between">
                          <div>
                            <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">
                              Status
                            </p>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(host.verification.status)}
                              <span className={`text-sm font-medium ${info.color.split(" ")[0]}`}>
                                {info.label}
                              </span>
                            </div>

                            {host.verification.verifiedAt && (
                              <div className="mt-3">
                                <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">
                                  Zweryfikowano
                                </p>
                                <p className="text-sm text-stone-700">
                                  {format(host.verification.verifiedAt, "d MMM yyyy", { locale: pl })}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 space-y-2">
                            <Button
                              className="w-full"
                              onClick={() => openVerifyDialog(host)}
                            >
                              Weryfikuj
                            </Button>
                            <Button className="w-full" variant="outline" asChild>
                              <Link href={`/profile/${host.userId}`}>
                                Zobacz profil
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Verification Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Weryfikacja hosta: {selectedHost?.name}
            </DialogTitle>
            <DialogDescription>
              Zaznacz elementy, które zostały zweryfikowane
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="identity"
                  checked={verificationData.identityVerified}
                  onCheckedChange={(checked) =>
                    setVerificationData((prev) => ({
                      ...prev,
                      identityVerified: !!checked,
                    }))
                  }
                />
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-stone-400" />
                  <Label htmlFor="identity">Tożsamość zweryfikowana</Label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="location"
                  checked={verificationData.locationVerified}
                  onCheckedChange={(checked) =>
                    setVerificationData((prev) => ({
                      ...prev,
                      locationVerified: !!checked,
                    }))
                  }
                />
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-stone-400" />
                  <Label htmlFor="location">Lokalizacja zweryfikowana</Label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="foodSafety"
                  checked={verificationData.foodSafetyVerified}
                  onCheckedChange={(checked) =>
                    setVerificationData((prev) => ({
                      ...prev,
                      foodSafetyVerified: !!checked,
                    }))
                  }
                />
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-stone-400" />
                  <Label htmlFor="foodSafety">Bezpieczeństwo żywności</Label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="background"
                  checked={verificationData.backgroundCheckPassed}
                  onCheckedChange={(checked) =>
                    setVerificationData((prev) => ({
                      ...prev,
                      backgroundCheckPassed: !!checked,
                    }))
                  }
                />
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-stone-400" />
                  <Label htmlFor="background">Weryfikacja osoby</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notatki (opcjonalnie)</Label>
              <Textarea
                id="notes"
                placeholder="Dodaj notatki dotyczące weryfikacji..."
                value={verificationData.notes}
                onChange={(e) =>
                  setVerificationData((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={() => handleVerify("rejected")}
              className="w-full sm:w-auto"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Odrzuć
            </Button>
            <Button
              variant="outline"
              onClick={() => handleVerify("suspended")}
              className="w-full sm:w-auto"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Zawieś
            </Button>
            <Button
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              onClick={() => handleVerify("verified")}
              disabled={
                !verificationData.identityVerified ||
                !verificationData.locationVerified ||
                !verificationData.foodSafetyVerified ||
                !verificationData.backgroundCheckPassed
              }
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Zweryfikuj
            </Button>
            <Button
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700"
              onClick={() => handleVerify("premium")}
              disabled={
                !verificationData.identityVerified ||
                !verificationData.locationVerified ||
                !verificationData.foodSafetyVerified ||
                !verificationData.backgroundCheckPassed
              }
            >
              <Star className="h-4 w-4 mr-2" />
              Premium
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
