"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  getHostMessageTemplates,
  getHostCommunicationSettings,
  updateHostCommunicationSettings,
  reminderTimingLabels,
  followUpTimingLabels,
  messageTemplateTypeLabels,
  templateVariables,
  defaultMessageTemplates,
  MessageTemplate,
  CommunicationSettings,
  ReminderTiming,
  FollowUpTiming,
  MessageTemplateType,
} from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Check,
  Clock,
  Edit,
  Gift,
  Info,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Save,
  Settings,
  Sparkles,
  Star,
  Trash2,
  Zap,
} from "lucide-react";

export default function CommunicationSettingsPage() {
  const t = useTranslations("communication");
  const hostId = "host-anna"; // Would come from auth

  const [templates, setTemplates] = useState<MessageTemplate[]>(
    getHostMessageTemplates(hostId)
  );
  const [settings, setSettings] = useState<CommunicationSettings>(
    getHostCommunicationSettings(hostId)
  );
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<MessageTemplate>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSettingChange = <K extends keyof CommunicationSettings>(
    key: K,
    value: CommunicationSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleReminderTimingToggle = (timing: ReminderTiming, checked: boolean) => {
    const newTimings = checked
      ? [...settings.reminderTimings, timing]
      : settings.reminderTimings.filter((t) => t !== timing);
    handleSettingChange("reminderTimings", newTimings);
  };

  const handleFollowUpToggle = (index: number, enabled: boolean) => {
    const newSequence = [...settings.followUpSequence];
    newSequence[index] = { ...newSequence[index], enabled };
    handleSettingChange("followUpSequence", newSequence);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateHostCommunicationSettings(hostId, settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate({ ...template });
    setSelectedTemplate(template);
    setIsTemplateDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    // In real app, would save to backend
    setIsTemplateDialogOpen(false);
    setSelectedTemplate(null);
  };

  const getTemplatesByType = (type: MessageTemplateType) => {
    return templates.filter((t) => t.type === type);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/dashboard/host"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Wróć do panelu
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-amber-600" />
                Automatyzacja komunikacji
              </h1>
              <p className="text-muted-foreground mt-1">
                Zarządzaj szablonami wiadomości i automatycznymi powiadomieniami
              </p>
            </div>
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isSaving ? (
                <>Zapisywanie...</>
              ) : saveSuccess ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Zapisano!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Zapisz ustawienia
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="reminders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Przypomnienia</span>
            </TabsTrigger>
            <TabsTrigger value="followups" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Follow-up</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Szablony</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Ustawienia</span>
            </TabsTrigger>
          </TabsList>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-amber-600" />
                      Automatyczne przypomnienia
                    </CardTitle>
                    <CardDescription>
                      Wysyłaj przypomnienia do gości przed wydarzeniem
                    </CardDescription>
                  </div>
                  <Switch
                    checked={settings.enableReminders}
                    onCheckedChange={(checked) =>
                      handleSettingChange("enableReminders", checked)
                    }
                  />
                </div>
              </CardHeader>
              {settings.enableReminders && (
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Wybierz, kiedy goście otrzymają przypomnienie o wydarzeniu:
                  </p>

                  <div className="grid gap-3">
                    {(Object.keys(reminderTimingLabels) as ReminderTiming[]).map(
                      (timing) => (
                        <div
                          key={timing}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={timing}
                              checked={settings.reminderTimings.includes(timing)}
                              onCheckedChange={(checked) =>
                                handleReminderTimingToggle(timing, !!checked)
                              }
                            />
                            <div>
                              <Label htmlFor={timing} className="font-medium">
                                {reminderTimingLabels[timing].label}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {reminderTimingLabels[timing].description}
                              </p>
                            </div>
                          </div>
                          {settings.reminderTimings.includes(timing) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const template = templates.find(
                                  (t) =>
                                    t.type ===
                                    (timing === "7_days"
                                      ? "reminder_week"
                                      : timing === "24_hours" || timing === "48_hours"
                                      ? "reminder_day"
                                      : "reminder_hours")
                                );
                                if (template) handleEditTemplate(template);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edytuj szablon
                            </Button>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-blue-600 shrink-0" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium">Wskazówka</p>
                        <p>
                          Badania pokazują, że dwa przypomnienia (24h i 2h przed)
                          znacząco zwiększają frekwencję na wydarzeniach.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          {/* Follow-ups Tab */}
          <TabsContent value="followups" className="space-y-6">
            {/* Post-event thanks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-600" />
                      Sekwencja follow-up
                    </CardTitle>
                    <CardDescription>
                      Automatyczne wiadomości po wydarzeniu
                    </CardDescription>
                  </div>
                  <Switch
                    checked={settings.enableFollowUps}
                    onCheckedChange={(checked) =>
                      handleSettingChange("enableFollowUps", checked)
                    }
                  />
                </div>
              </CardHeader>
              {settings.enableFollowUps && (
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {settings.followUpSequence.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`followup-${index}`}
                            checked={item.enabled}
                            onCheckedChange={(checked) =>
                              handleFollowUpToggle(index, !!checked)
                            }
                          />
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {messageTemplateTypeLabels[item.templateType].icon}
                            </span>
                            <div>
                              <Label
                                htmlFor={`followup-${index}`}
                                className="font-medium"
                              >
                                {messageTemplateTypeLabels[item.templateType].label}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {followUpTimingLabels[item.timing].label}
                              </p>
                            </div>
                          </div>
                        </div>
                        {item.enabled && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const template = templates.find(
                                (t) => t.type === item.templateType
                              );
                              if (template) handleEditTemplate(template);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edytuj
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Timeline visualization */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-3">
                      Oś czasu automatycznych wiadomości:
                    </p>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-amber-200" />
                      {settings.followUpSequence
                        .filter((item) => item.enabled)
                        .map((item, index) => (
                          <div key={index} className="relative pl-10 pb-4 last:pb-0">
                            <div className="absolute left-2.5 w-3 h-3 rounded-full bg-amber-500" />
                            <div className="text-sm">
                              <span className="font-medium">
                                {followUpTimingLabels[item.timing].label}
                              </span>
                              <span className="text-muted-foreground ml-2">
                                → {messageTemplateTypeLabels[item.templateType].label}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Review requests */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-600" />
                      Prośby o opinie
                    </CardTitle>
                    <CardDescription>
                      Automatycznie proś gości o pozostawienie opinii
                    </CardDescription>
                  </div>
                  <Switch
                    checked={settings.enableReviewRequests}
                    onCheckedChange={(checked) =>
                      handleSettingChange("enableReviewRequests", checked)
                    }
                  />
                </div>
              </CardHeader>
              {settings.enableReviewRequests && (
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Label>Wyślij prośbę o opinię:</Label>
                    <Select
                      value={settings.reviewRequestDelay}
                      onValueChange={(value) =>
                        handleSettingChange(
                          "reviewRequestDelay",
                          value as FollowUpTiming
                        )
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(followUpTimingLabels) as FollowUpTiming[]).map(
                          (timing) => (
                            <SelectItem key={timing} value={timing}>
                              {followUpTimingLabels[timing].label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Rebooking offers */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-amber-600" />
                      Oferty powrotu
                    </CardTitle>
                    <CardDescription>
                      Zachęć gości do ponownych rezerwacji zniżką
                    </CardDescription>
                  </div>
                  <Switch
                    checked={settings.enableRebookingOffers}
                    onCheckedChange={(checked) =>
                      handleSettingChange("enableRebookingOffers", checked)
                    }
                  />
                </div>
              </CardHeader>
              {settings.enableRebookingOffers && (
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2 block">
                      Wysokość zniżki: {settings.rebookingDiscountPercent}%
                    </Label>
                    <Slider
                      value={[settings.rebookingDiscountPercent]}
                      onValueChange={([value]) =>
                        handleSettingChange("rebookingDiscountPercent", value)
                      }
                      min={5}
                      max={30}
                      step={5}
                      className="w-full max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Rekomendowane: 10-20%
                    </p>
                  </div>

                  <div>
                    <Label className="mb-2 block">
                      Ważność oferty: {settings.rebookingOfferValidDays} dni
                    </Label>
                    <Slider
                      value={[settings.rebookingOfferValidDays]}
                      onValueChange={([value]) =>
                        handleSettingChange("rebookingOfferValidDays", value)
                      }
                      min={7}
                      max={60}
                      step={7}
                      className="w-full max-w-xs"
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Szablony wiadomości</h2>
                <p className="text-sm text-muted-foreground">
                  Personalizuj treść automatycznych wiadomości
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingTemplate({
                    type: "custom",
                    name: "",
                    subject: "",
                    body: "",
                    isDefault: false,
                    isActive: true,
                  });
                  setSelectedTemplate(null);
                  setIsTemplateDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nowy szablon
              </Button>
            </div>

            <div className="grid gap-4">
              {(
                Object.keys(messageTemplateTypeLabels) as MessageTemplateType[]
              ).map((type) => {
                const typeTemplates = getTemplatesByType(type);
                if (typeTemplates.length === 0) return null;

                return (
                  <Card key={type}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span>{messageTemplateTypeLabels[type].icon}</span>
                        {messageTemplateTypeLabels[type].label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {typeTemplates.map((template) => (
                          <div
                            key={template.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {template.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {template.subject}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {template.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  Domyślny
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTemplate(template)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Variables reference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-600" />
                  Dostępne zmienne
                </CardTitle>
                <CardDescription>
                  Użyj tych zmiennych w szablonach - zostaną automatycznie
                  wypełnione
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(templateVariables).map(([category, vars]) => (
                    <div key={category}>
                      <h4 className="font-medium text-sm mb-2 capitalize">
                        {category === "guest"
                          ? "Gość"
                          : category === "event"
                          ? "Wydarzenie"
                          : category === "booking"
                          ? "Rezerwacja"
                          : category === "host"
                          ? "Host"
                          : "Specjalne"}
                      </h4>
                      <div className="space-y-1">
                        {vars.map((v) => (
                          <TooltipProvider key={v.key}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <code className="text-xs bg-muted px-2 py-1 rounded block cursor-help">
                                  {v.key}
                                </code>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {v.label}: <em>{v.example}</em>
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-amber-600" />
                  Kanały komunikacji
                </CardTitle>
                <CardDescription>
                  Wybierz jak chcesz komunikować się z gośćmi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="font-medium">Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Szczegółowe wiadomości z pełną treścią
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.preferredChannels.includes("email")}
                    onCheckedChange={(checked) => {
                      const channels = checked
                        ? [...settings.preferredChannels, "email"]
                        : settings.preferredChannels.filter((c) => c !== "email");
                      handleSettingChange("preferredChannels", channels as ("email" | "sms")[]);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="font-medium">SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Krótkie przypomnienia (98% otwarć!)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Wkrótce
                    </Badge>
                    <Switch disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personalizacja</CardTitle>
                <CardDescription>
                  Dodatkowe elementy w wiadomościach
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dołączaj swoje zdjęcie</Label>
                    <p className="text-sm text-muted-foreground">
                      Twoje zdjęcie profilowe w nagłówku wiadomości
                    </p>
                  </div>
                  <Switch
                    checked={settings.includeHostPhoto}
                    onCheckedChange={(checked) =>
                      handleSettingChange("includeHostPhoto", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pole na osobistą wiadomość</Label>
                    <p className="text-sm text-muted-foreground">
                      Możliwość dodania własnej notatki przy każdej rezerwacji
                    </p>
                  </div>
                  <Switch
                    checked={settings.includePersonalMessage}
                    onCheckedChange={(checked) =>
                      handleSettingChange("includePersonalMessage", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Edit Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? "Edytuj szablon" : "Nowy szablon"}
            </DialogTitle>
            <DialogDescription>
              Użyj zmiennych typu {"{{guest_name}}"} - zostaną automatycznie
              wypełnione
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Nazwa szablonu</Label>
              <Input
                id="template-name"
                value={editingTemplate.name || ""}
                onChange={(e) =>
                  setEditingTemplate((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="np. Moje potwierdzenie rezerwacji"
              />
            </div>

            <div>
              <Label htmlFor="template-subject">Temat wiadomości</Label>
              <Input
                id="template-subject"
                value={editingTemplate.subject || ""}
                onChange={(e) =>
                  setEditingTemplate((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
                placeholder="np. ✅ Rezerwacja potwierdzona - {{event_title}}"
              />
            </div>

            <div>
              <Label htmlFor="template-body">Treść wiadomości</Label>
              <Textarea
                id="template-body"
                value={editingTemplate.body || ""}
                onChange={(e) =>
                  setEditingTemplate((prev) => ({ ...prev, body: e.target.value }))
                }
                placeholder="Treść wiadomości..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            {/* Quick variable insert */}
            <div>
              <Label className="text-xs text-muted-foreground">
                Szybkie wstawianie zmiennych:
              </Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {[
                  "{{guest_name}}",
                  "{{event_title}}",
                  "{{event_date}}",
                  "{{event_time}}",
                  "{{event_address}}",
                  "{{host_name}}",
                ].map((variable) => (
                  <Button
                    key={variable}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() =>
                      setEditingTemplate((prev) => ({
                        ...prev,
                        body: (prev.body || "") + variable,
                      }))
                    }
                  >
                    {variable}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTemplateDialogOpen(false)}
            >
              Anuluj
            </Button>
            <Button onClick={handleSaveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              Zapisz szablon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
