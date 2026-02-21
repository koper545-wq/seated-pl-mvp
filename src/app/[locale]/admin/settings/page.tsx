"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Percent,
  Banknote,
  Calculator,
  Check,
  Loader2,
  Users,
  Plus,
  Trash2,
  Calendar,
  Hash,
  Clock,
} from "lucide-react";
import {
  getPlatformSettings,
  updatePlatformSettings,
  calculateCommission,
  getHostCommissionOverrides,
  addHostCommissionOverride,
  deleteHostCommissionOverride,
  mockHostVerificationProfiles,
  type PlatformSettings,
  type HostCommissionOverride,
  type CommissionOverrideType,
} from "@/lib/mock-data";

export default function AdminSettingsPage() {
  const t = useTranslations("admin.settings");

  const [settings, setSettings] = useState<PlatformSettings>(getPlatformSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Preview calculation
  const [previewPrice, setPreviewPrice] = useState(20000); // 200 PLN
  const [previewFee, setPreviewFee] = useState(0);

  // Host commission overrides
  const [overrides, setOverrides] = useState<HostCommissionOverride[]>(getHostCommissionOverrides());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newOverride, setNewOverride] = useState({
    hostId: "",
    commissionRate: 10,
    type: "permanent" as CommissionOverrideType,
    validFrom: "",
    validUntil: "",
    eventsLimit: 10,
    reason: "",
  });

  useEffect(() => {
    // Calculate preview fee based on current form values
    const tempSettings = getPlatformSettings();
    const originalSettings = { ...tempSettings };

    // Temporarily update settings for preview calculation
    updatePlatformSettings(settings);
    const fee = calculateCommission(previewPrice);
    setPreviewFee(fee);

    // Restore original settings
    updatePlatformSettings(originalSettings);
  }, [settings, previewPrice]);

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Update settings
    updatePlatformSettings(settings);

    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const formatPrice = (grosz: number) => {
    return (grosz / 100).toFixed(2) + " PLN";
  };

  const handleAddOverride = () => {
    const override = addHostCommissionOverride({
      hostId: newOverride.hostId,
      commissionRate: newOverride.commissionRate,
      type: newOverride.type,
      validFrom: newOverride.type === "time_limited" ? new Date(newOverride.validFrom) : undefined,
      validUntil: newOverride.type === "time_limited" ? new Date(newOverride.validUntil) : undefined,
      eventsLimit: newOverride.type === "event_limited" ? newOverride.eventsLimit : undefined,
      eventsUsed: 0,
      reason: newOverride.reason,
      createdBy: "admin-1",
      isActive: true,
    });
    setOverrides([...overrides, override]);
    setShowAddDialog(false);
    setNewOverride({
      hostId: "",
      commissionRate: 10,
      type: "permanent",
      validFrom: "",
      validUntil: "",
      eventsLimit: 10,
      reason: "",
    });
  };

  const handleDeleteOverride = (id: string) => {
    deleteHostCommissionOverride(id);
    setOverrides(overrides.filter((o) => o.id !== id));
  };

  const getHostName = (hostId: string) => {
    const host = mockHostVerificationProfiles.find((h) => h.id === hostId);
    return host?.name || hostId;
  };

  const getOverrideTypeLabel = (type: CommissionOverrideType) => {
    switch (type) {
      case "permanent":
        return "Na stałe";
      case "time_limited":
        return "Czasowe";
      case "event_limited":
        return "Na liczbę wydarzeń";
    }
  };

  const getOverrideTypeIcon = (type: CommissionOverrideType) => {
    switch (type) {
      case "permanent":
        return <Clock className="h-4 w-4" />;
      case "time_limited":
        return <Calendar className="h-4 w-4" />;
      case "event_limited":
        return <Hash className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          Konfiguruj ustawienia platformy
        </p>
      </div>

      {/* Commission Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t("commission")}
          </CardTitle>
          <CardDescription>
            Ustaw prowizję pobieraną od każdej rezerwacji
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Commission Type */}
          <div className="space-y-3">
            <Label>{t("commissionType")}</Label>
            <RadioGroup
              value={settings.commissionType}
              onValueChange={(value: "percentage" | "fixed") =>
                setSettings({ ...settings, commissionType: value })
              }
              className="grid grid-cols-2 gap-4"
            >
              <Label
                htmlFor="percentage"
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  settings.commissionType === "percentage"
                    ? "border-amber-600 bg-amber-50"
                    : "hover:bg-muted"
                }`}
              >
                <RadioGroupItem value="percentage" id="percentage" />
                <Percent className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium">{t("percentage")}</p>
                  <p className="text-sm text-muted-foreground">
                    Procent od ceny wydarzenia
                  </p>
                </div>
              </Label>
              <Label
                htmlFor="fixed"
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  settings.commissionType === "fixed"
                    ? "border-amber-600 bg-amber-50"
                    : "hover:bg-muted"
                }`}
              >
                <RadioGroupItem value="fixed" id="fixed" />
                <Banknote className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium">{t("fixed")}</p>
                  <p className="text-sm text-muted-foreground">
                    Stała kwota za rezerwację
                  </p>
                </div>
              </Label>
            </RadioGroup>
          </div>

          {/* Commission Value */}
          <div className="space-y-2">
            <Label htmlFor="commissionValue">{t("commissionValue")}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="commissionValue"
                type="number"
                min="0"
                max={settings.commissionType === "percentage" ? 50 : 500}
                step={settings.commissionType === "percentage" ? 0.5 : 1}
                value={settings.commissionValue}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    commissionValue: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-32"
              />
              <span className="text-muted-foreground">
                {settings.commissionType === "percentage" ? "%" : "PLN"}
              </span>
            </div>
          </div>

          <Separator />

          {/* Min/Max Commission */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minCommission">{t("minCommission")}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="minCommission"
                  type="number"
                  min="0"
                  step="1"
                  value={(settings.minCommission || 0) / 100}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      minCommission: (parseFloat(e.target.value) || 0) * 100,
                    })
                  }
                  className="w-24"
                />
                <span className="text-muted-foreground">PLN</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimalna prowizja (opcjonalne)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxCommission">{t("maxCommission")}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="maxCommission"
                  type="number"
                  min="0"
                  step="1"
                  value={(settings.maxCommission || 0) / 100}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxCommission: (parseFloat(e.target.value) || 0) * 100,
                    })
                  }
                  className="w-24"
                />
                <span className="text-muted-foreground">PLN</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Maksymalna prowizja (opcjonalne)
              </p>
            </div>
          </div>

          <Separator />

          {/* Live Preview */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <Label>{t("preview")}</Label>
            </div>

            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <Label htmlFor="previewPrice" className="text-xs text-muted-foreground">
                  Cena wydarzenia
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="previewPrice"
                    type="number"
                    min="0"
                    step="10"
                    value={previewPrice / 100}
                    onChange={(e) =>
                      setPreviewPrice((parseFloat(e.target.value) || 0) * 100)
                    }
                    className="w-24"
                  />
                  <span className="text-muted-foreground text-sm">PLN</span>
                </div>
              </div>

              <div className="text-2xl text-muted-foreground">→</div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Prowizja</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatPrice(previewFee)}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {settings.commissionType === "percentage"
                ? `${settings.commissionValue}% z ${formatPrice(previewPrice)} = ${formatPrice(previewFee)}`
                : `Stała opłata: ${formatPrice(settings.commissionValue * 100)}`}
              {settings.minCommission && previewFee === settings.minCommission && (
                <span className="text-amber-600"> (minimalna prowizja)</span>
              )}
              {settings.maxCommission && previewFee === settings.maxCommission && (
                <span className="text-amber-600"> (maksymalna prowizja)</span>
              )}
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("saving")}
                </>
              ) : saved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {t("saved")}
                </>
              ) : (
                t("save")
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Settings Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ostatnia aktualizacja:</span>
            <span>
              {settings.updatedAt.toLocaleDateString("pl-PL", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Host Commission Overrides */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Indywidualne prowizje hostów
              </CardTitle>
              <CardDescription>
                Ustaw niestandardową prowizję dla wybranych hostów
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Dodaj indywidualną prowizję</DialogTitle>
                  <DialogDescription>
                    Ustaw niestandardową stawkę prowizji dla wybranego hosta
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Host Selection */}
                  <div className="space-y-2">
                    <Label>Host</Label>
                    <Select
                      value={newOverride.hostId}
                      onValueChange={(value) =>
                        setNewOverride({ ...newOverride, hostId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz hosta" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockHostVerificationProfiles.map((host) => (
                          <SelectItem key={host.id} value={host.id}>
                            {host.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Commission Rate */}
                  <div className="space-y-2">
                    <Label>Stawka prowizji (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="30"
                        step="0.5"
                        value={newOverride.commissionRate}
                        onChange={(e) =>
                          setNewOverride({
                            ...newOverride,
                            commissionRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-24"
                      />
                      <span className="text-muted-foreground">%</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        (domyślnie: {settings.commissionValue}%)
                      </span>
                    </div>
                  </div>

                  {/* Override Type */}
                  <div className="space-y-2">
                    <Label>Typ</Label>
                    <Select
                      value={newOverride.type}
                      onValueChange={(value: CommissionOverrideType) =>
                        setNewOverride({ ...newOverride, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="permanent">Na stałe</SelectItem>
                        <SelectItem value="time_limited">Na określony czas</SelectItem>
                        <SelectItem value="event_limited">Na liczbę wydarzeń</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time Limited Fields */}
                  {newOverride.type === "time_limited" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Od</Label>
                        <Input
                          type="date"
                          value={newOverride.validFrom}
                          onChange={(e) =>
                            setNewOverride({ ...newOverride, validFrom: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Do</Label>
                        <Input
                          type="date"
                          value={newOverride.validUntil}
                          onChange={(e) =>
                            setNewOverride({ ...newOverride, validUntil: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* Event Limited Fields */}
                  {newOverride.type === "event_limited" && (
                    <div className="space-y-2">
                      <Label>Liczba wydarzeń</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={newOverride.eventsLimit}
                        onChange={(e) =>
                          setNewOverride({
                            ...newOverride,
                            eventsLimit: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-24"
                      />
                      <p className="text-xs text-muted-foreground">
                        Po tej liczbie wydarzeń prowizja wróci do domyślnej
                      </p>
                    </div>
                  )}

                  {/* Reason */}
                  <div className="space-y-2">
                    <Label>Powód (opcjonalnie)</Label>
                    <Textarea
                      placeholder="Np. Premium partner, promocja dla nowych hostów..."
                      value={newOverride.reason}
                      onChange={(e) =>
                        setNewOverride({ ...newOverride, reason: e.target.value })
                      }
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Anuluj
                  </Button>
                  <Button
                    onClick={handleAddOverride}
                    disabled={!newOverride.hostId}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Dodaj
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {overrides.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Brak indywidualnych stawek prowizji</p>
              <p className="text-sm">Wszyscy hosty używają domyślnej stawki {settings.commissionValue}%</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overrides.map((override) => (
                <div
                  key={override.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Percent className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getHostName(override.hostId)}</span>
                        <Badge variant="outline" className="text-xs">
                          {getOverrideTypeIcon(override.type)}
                          <span className="ml-1">{getOverrideTypeLabel(override.type)}</span>
                        </Badge>
                        {!override.isActive && (
                          <Badge variant="destructive" className="text-xs">
                            Nieaktywne
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-amber-600 font-semibold">{override.commissionRate}%</span>
                        <span>•</span>
                        {override.type === "time_limited" && override.validFrom && override.validUntil && (
                          <span>
                            {new Date(override.validFrom).toLocaleDateString("pl-PL")} -{" "}
                            {new Date(override.validUntil).toLocaleDateString("pl-PL")}
                          </span>
                        )}
                        {override.type === "event_limited" && (
                          <span>
                            {override.eventsUsed || 0} / {override.eventsLimit} wydarzeń
                          </span>
                        )}
                        {override.type === "permanent" && <span>Bez limitu</span>}
                        {override.reason && (
                          <>
                            <span>•</span>
                            <span className="italic">{override.reason}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteOverride(override.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
