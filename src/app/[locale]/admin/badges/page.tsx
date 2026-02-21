"use client";

import { useState } from "react";
import { badges, MockBadge, BadgeCategory, BadgeTier } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Users, ChefHat, Award, Copy } from "lucide-react";

// Badge trigger types for automation
type BadgeTriggerType =
  | "events_attended"
  | "events_hosted"
  | "reviews_written"
  | "reviews_received"
  | "rating_maintained"
  | "consecutive_events"
  | "event_types_tried"
  | "booking_speed"
  | "manual";

interface BadgeTrigger {
  type: BadgeTriggerType;
  value: number;
  duration?: number; // in days, for time-based triggers
}

interface ExtendedBadge extends MockBadge {
  trigger?: BadgeTrigger;
  isActive: boolean;
  usersAwarded: number;
}

// Color options for badges
const colorOptions = [
  { value: "bg-green-100 text-green-700", label: "Zielony", preview: "bg-green-100" },
  { value: "bg-blue-100 text-blue-700", label: "Niebieski", preview: "bg-blue-100" },
  { value: "bg-purple-100 text-purple-700", label: "Fioletowy", preview: "bg-purple-100" },
  { value: "bg-amber-100 text-amber-700", label: "Bursztynowy", preview: "bg-amber-100" },
  { value: "bg-orange-100 text-orange-700", label: "Pomarańczowy", preview: "bg-orange-100" },
  { value: "bg-pink-100 text-pink-700", label: "Różowy", preview: "bg-pink-100" },
  { value: "bg-red-100 text-red-700", label: "Czerwony", preview: "bg-red-100" },
  { value: "bg-yellow-100 text-yellow-700", label: "Żółty", preview: "bg-yellow-100" },
  { value: "bg-teal-100 text-teal-700", label: "Morski", preview: "bg-teal-100" },
  { value: "bg-indigo-100 text-indigo-700", label: "Indygo", preview: "bg-indigo-100" },
];

// Trigger type labels and descriptions
const triggerTypes: { value: BadgeTriggerType; label: string; description: string; category: "guest" | "host" | "both" }[] = [
  { value: "events_attended", label: "Uczestnictwo w wydarzeniach", description: "Przyznaj gdy użytkownik weźmie udział w X wydarzeniach", category: "guest" },
  { value: "events_hosted", label: "Organizacja wydarzeń", description: "Przyznaj gdy host zorganizuje X wydarzeń", category: "host" },
  { value: "reviews_written", label: "Napisane opinie", description: "Przyznaj gdy użytkownik napisze X opinii", category: "guest" },
  { value: "reviews_received", label: "Otrzymane opinie", description: "Przyznaj gdy host otrzyma X opinii", category: "host" },
  { value: "rating_maintained", label: "Utrzymana ocena", description: "Przyznaj gdy host utrzyma ocenę X przez Y wydarzeń", category: "host" },
  { value: "consecutive_events", label: "Wydarzenia pod rząd", description: "Przyznaj za X wydarzeń w ciągu Y dni", category: "both" },
  { value: "event_types_tried", label: "Różne typy wydarzeń", description: "Przyznaj za uczestnictwo w X różnych typach wydarzeń", category: "guest" },
  { value: "booking_speed", label: "Szybkość rezerwacji", description: "Przyznaj za rezerwację w ciągu X minut od publikacji", category: "guest" },
  { value: "manual", label: "Ręczne przyznanie", description: "Przyznawana ręcznie przez administratora", category: "both" },
];

// Popular emoji options
const emojiOptions = [
  "🏆", "⭐", "🌟", "💫", "✨", "🎯", "🎖️", "🏅", "🥇", "🥈", "🥉",
  "🍽️", "🍴", "🥄", "👨‍🍳", "👩‍🍳", "🍕", "🍝", "🍜", "🍣", "🥗", "🍰",
  "🔥", "💎", "👑", "🦋", "🐦", "🦅", "🌍", "🧭", "🚀", "💯", "❤️",
  "🎉", "🎊", "🎁", "🎈", "🌈", "☀️", "🌙", "⚡", "💪", "🤝", "👏",
];

export default function AdminBadgesPage() {
  const [allBadges, setAllBadges] = useState<ExtendedBadge[]>(
    badges.map((b) => ({
      ...b,
      isActive: true,
      usersAwarded: Math.floor(Math.random() * 100) + 5,
    }))
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<ExtendedBadge | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "guest" | "host">("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    namePl: "",
    description: "",
    descriptionPl: "",
    icon: "🏆",
    category: "guest" as "guest" | "host",
    color: "bg-amber-100 text-amber-700",
    triggerType: "manual" as BadgeTriggerType,
    triggerValue: 1,
    triggerDuration: 7,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      namePl: "",
      description: "",
      descriptionPl: "",
      icon: "🏆",
      category: "guest",
      color: "bg-amber-100 text-amber-700",
      triggerType: "manual",
      triggerValue: 1,
      triggerDuration: 7,
    });
    setEditingBadge(null);
  };

  const handleCreateBadge = () => {
    const newBadge: ExtendedBadge = {
      id: `badge-${Date.now()}`,
      name: formData.name,
      namePl: formData.namePl,
      description: formData.description,
      descriptionPl: formData.descriptionPl,
      icon: formData.icon,
      category: formData.category,
      badgeCategory: formData.category === "guest" ? "activity" : "host_activity",
      tier: "bronze",
      color: formData.color,
      requirement: formData.description,
      requirementPl: formData.descriptionPl,
      xpReward: 50,
      rarity: "common",
      trigger: formData.triggerType !== "manual" ? {
        type: formData.triggerType,
        value: formData.triggerValue,
        duration: formData.triggerDuration,
      } : undefined,
      isActive: true,
      usersAwarded: 0,
    };
    setAllBadges([...allBadges, newBadge]);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditBadge = () => {
    if (!editingBadge) return;
    setAllBadges(
      allBadges.map((b) =>
        b.id === editingBadge.id
          ? {
              ...b,
              name: formData.name,
              namePl: formData.namePl,
              description: formData.description,
              descriptionPl: formData.descriptionPl,
              icon: formData.icon,
              category: formData.category,
              color: formData.color,
              trigger: formData.triggerType !== "manual" ? {
                type: formData.triggerType,
                value: formData.triggerValue,
                duration: formData.triggerDuration,
              } : undefined,
            }
          : b
      )
    );
    setEditingBadge(null);
    resetForm();
  };

  const handleDeleteBadge = (id: string) => {
    if (confirm("Czy na pewno chcesz usunąć tę odznakę?")) {
      setAllBadges(allBadges.filter((b) => b.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setAllBadges(
      allBadges.map((b) =>
        b.id === id ? { ...b, isActive: !b.isActive } : b
      )
    );
  };

  const openEditDialog = (badge: ExtendedBadge) => {
    setFormData({
      name: badge.name,
      namePl: badge.namePl,
      description: badge.description,
      descriptionPl: badge.descriptionPl,
      icon: badge.icon,
      category: badge.category,
      color: badge.color,
      triggerType: badge.trigger?.type || "manual",
      triggerValue: badge.trigger?.value || 1,
      triggerDuration: badge.trigger?.duration || 7,
    });
    setEditingBadge(badge);
  };

  const duplicateBadge = (badge: ExtendedBadge) => {
    const newBadge: ExtendedBadge = {
      ...badge,
      id: `badge-${Date.now()}`,
      name: `${badge.name} (kopia)`,
      namePl: `${badge.namePl} (kopia)`,
      usersAwarded: 0,
    };
    setAllBadges([...allBadges, newBadge]);
  };

  const filteredBadges = allBadges.filter((b) => {
    if (activeTab === "all") return true;
    return b.category === activeTab;
  });

  const guestBadgesCount = allBadges.filter((b) => b.category === "guest").length;
  const hostBadgesCount = allBadges.filter((b) => b.category === "host").length;
  const totalAwarded = allBadges.reduce((sum, b) => sum + b.usersAwarded, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Zarządzanie odznaki</h1>
          <p className="text-stone-500">Twórz i zarządzaj odznakgami dla gości i hostów</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="h-4 w-4 mr-2" />
              Nowa odznaka
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Utwórz nową odznakę</DialogTitle>
              <DialogDescription>
                Zdefiniuj wygląd i warunki przyznawania odznaki
              </DialogDescription>
            </DialogHeader>
            <BadgeForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreateBadge}
              submitLabel="Utwórz odznakę"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-100">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allBadges.length}</p>
                <p className="text-sm text-stone-500">Wszystkie odznaki</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{guestBadgesCount}</p>
                <p className="text-sm text-stone-500">Odznaki dla gości</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100">
                <ChefHat className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{hostBadgesCount}</p>
                <p className="text-sm text-stone-500">Odznaki dla hostów</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAwarded}</p>
                <p className="text-sm text-stone-500">Przyznanych łącznie</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista odznak</CardTitle>
          <CardDescription>
            Wszystkie dostępne odznaki w systemie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Wszystkie ({allBadges.length})</TabsTrigger>
              <TabsTrigger value="guest">Goście ({guestBadgesCount})</TabsTrigger>
              <TabsTrigger value="host">Hosty ({hostBadgesCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Ikona</TableHead>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Opis</TableHead>
                    <TableHead>Kategoria</TableHead>
                    <TableHead>Warunek</TableHead>
                    <TableHead className="text-center">Przyznano</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBadges.map((badge) => (
                    <TableRow key={badge.id} className={!badge.isActive ? "opacity-50" : ""}>
                      <TableCell>
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-xl ${badge.color}`}>
                          {badge.icon}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{badge.namePl}</p>
                          <p className="text-xs text-stone-400">{badge.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-stone-600 max-w-xs truncate">
                          {badge.descriptionPl}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          badge.category === "guest"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}>
                          {badge.category === "guest" ? "Gość" : "Host"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-stone-600">
                          {badge.trigger
                            ? triggerTypes.find((t) => t.value === badge.trigger?.type)?.label || "Niestandardowy"
                            : "Ręczne"}
                        </p>
                        {badge.trigger && (
                          <p className="text-xs text-stone-400">
                            Wartość: {badge.trigger.value}
                            {badge.trigger.duration && ` / ${badge.trigger.duration} dni`}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{badge.usersAwarded}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => handleToggleActive(badge.id)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            badge.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          {badge.isActive ? "Aktywna" : "Nieaktywna"}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateBadge(badge)}
                            title="Duplikuj"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(badge)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edytuj odznakę</DialogTitle>
                                <DialogDescription>
                                  Zmień ustawienia odznaki
                                </DialogDescription>
                              </DialogHeader>
                              <BadgeForm
                                formData={formData}
                                setFormData={setFormData}
                                onSubmit={handleEditBadge}
                                submitLabel="Zapisz zmiany"
                              />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteBadge(badge.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Badge Form Component
function BadgeForm({
  formData,
  setFormData,
  onSubmit,
  submitLabel,
}: {
  formData: {
    name: string;
    namePl: string;
    description: string;
    descriptionPl: string;
    icon: string;
    category: "guest" | "host";
    color: string;
    triggerType: BadgeTriggerType;
    triggerValue: number;
    triggerDuration: number;
  };
  setFormData: React.Dispatch<React.SetStateAction<typeof formData>>;
  onSubmit: () => void;
  submitLabel: string;
}) {
  const selectedTrigger = triggerTypes.find((t) => t.value === formData.triggerType);
  const needsDuration = ["rating_maintained", "consecutive_events", "booking_speed"].includes(formData.triggerType);

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="p-4 bg-stone-50 rounded-lg">
        <p className="text-sm text-stone-500 mb-2">Podgląd</p>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-2xl ${formData.color}`}>
            {formData.icon}
          </span>
          <div>
            <p className="font-medium">{formData.namePl || "Nazwa odznaki"}</p>
            <p className="text-sm text-stone-500">{formData.descriptionPl || "Opis odznaki"}</p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="namePl">Nazwa (PL) *</Label>
          <Input
            id="namePl"
            value={formData.namePl}
            onChange={(e) => setFormData({ ...formData, namePl: e.target.value })}
            placeholder="np. Mistrz Smaków"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nazwa (EN) *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Taste Master"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="descriptionPl">Opis (PL) *</Label>
          <Textarea
            id="descriptionPl"
            value={formData.descriptionPl}
            onChange={(e) => setFormData({ ...formData, descriptionPl: e.target.value })}
            placeholder="np. Weź udział w 50 wydarzeniach"
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Opis (EN) *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. Attend 50 events"
            rows={2}
          />
        </div>
      </div>

      {/* Icon & Color */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ikona (emoji) *</Label>
          <div className="flex flex-wrap gap-2 p-3 border rounded-lg max-h-32 overflow-y-auto">
            {emojiOptions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setFormData({ ...formData, icon: emoji })}
                className={`w-9 h-9 rounded-lg text-xl hover:bg-stone-100 transition-colors ${
                  formData.icon === emoji ? "bg-amber-100 ring-2 ring-amber-400" : ""
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Kolor *</Label>
          <div className="flex flex-wrap gap-2 p-3 border rounded-lg">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: color.value })}
                className={`w-9 h-9 rounded-lg ${color.preview} ${
                  formData.color === color.value ? "ring-2 ring-stone-400" : ""
                }`}
                title={color.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Kategoria *</Label>
        <Select
          value={formData.category}
          onValueChange={(v) => setFormData({ ...formData, category: v as "guest" | "host" })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="guest">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Gość</span>
              </div>
            </SelectItem>
            <SelectItem value="host">
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                <span>Host</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trigger Configuration */}
      <div className="space-y-4 p-4 bg-stone-50 rounded-lg">
        <h4 className="font-medium">Warunki przyznania</h4>

        <div className="space-y-2">
          <Label>Typ warunku</Label>
          <Select
            value={formData.triggerType}
            onValueChange={(v) => setFormData({ ...formData, triggerType: v as BadgeTriggerType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {triggerTypes
                .filter((t) => t.category === "both" || t.category === formData.category)
                .map((trigger) => (
                  <SelectItem key={trigger.value} value={trigger.value}>
                    {trigger.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {selectedTrigger && (
            <p className="text-xs text-stone-500">{selectedTrigger.description}</p>
          )}
        </div>

        {formData.triggerType !== "manual" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="triggerValue">
                {formData.triggerType === "rating_maintained" ? "Minimalna ocena" : "Wymagana wartość"}
              </Label>
              <Input
                id="triggerValue"
                type="number"
                min={formData.triggerType === "rating_maintained" ? 1 : 1}
                max={formData.triggerType === "rating_maintained" ? 5 : 1000}
                step={formData.triggerType === "rating_maintained" ? 0.1 : 1}
                value={formData.triggerValue}
                onChange={(e) => setFormData({ ...formData, triggerValue: parseFloat(e.target.value) })}
              />
            </div>
            {needsDuration && (
              <div className="space-y-2">
                <Label htmlFor="triggerDuration">
                  {formData.triggerType === "booking_speed" ? "Czas (minuty)" : "Okres (dni)"}
                </Label>
                <Input
                  id="triggerDuration"
                  type="number"
                  min={1}
                  max={365}
                  value={formData.triggerDuration}
                  onChange={(e) => setFormData({ ...formData, triggerDuration: parseInt(e.target.value) })}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button onClick={onSubmit} className="bg-amber-600 hover:bg-amber-700">
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );
}
