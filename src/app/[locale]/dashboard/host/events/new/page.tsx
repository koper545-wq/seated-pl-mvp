"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link, useRouter as useIntlRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  CheckCircle,
  Upload,
  X,
  Plus,
  Info,
  Eye,
  Save,
  Send,
  Copy,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  generateRecurringDates,
  type RecurrencePattern,
  type EndCondition,
} from "@/lib/recurring-events";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { eventLanguages } from "@/lib/mock-data";
import { useMockUser } from "@/components/dev/account-switcher";
import { useEvents } from "@/contexts/events-context";

const eventTypes = [
  { value: "supper-club", label: "Supper Club", icon: "🍽️" },
  { value: "chefs-table", label: "Chef's Table", icon: "👑" },
  { value: "warsztaty", label: "Warsztaty", icon: "👨‍🍳" },
  { value: "degustacje", label: "Degustacje", icon: "🍷" },
  { value: "popup", label: "Pop-up", icon: "🎪" },
  { value: "active-food", label: "Active + Food", icon: "🏃" },
  { value: "farm", label: "Farm Experience", icon: "🌾" },
];

const cuisineTags = [
  "Włoska", "Francuska", "Polska", "Azjatycka", "Japońska",
  "Meksykańska", "Śródziemnomorska", "Wegańska", "Wegetariańska",
  "Fusion", "Desery", "Wino", "Piwo rzemieślnicze",
];

const dietaryOptionsAvailable = [
  "Opcja wegetariańska",
  "Opcja wegańska",
  "Bezglutenowe na życzenie",
  "Bez laktozy na życzenie",
  "Opcja bez orzechów",
  "Halal",
  "Koszerne",
];

const timeSlots = [
  "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00",
];

const durationOptions = [
  { value: 90, label: "1.5 godziny" },
  { value: 120, label: "2 godziny" },
  { value: 150, label: "2.5 godziny" },
  { value: 180, label: "3 godziny" },
  { value: 210, label: "3.5 godziny" },
  { value: 240, label: "4 godziny" },
  { value: 300, label: "5 godzin" },
];

export default function CreateEventPage() {
  const router = useRouter();
  const intlRouter = useIntlRouter();
  const searchParams = useSearchParams();
  const duplicateFromId = searchParams.get("duplicate");
  const { user: mockUser, isLoading, effectiveRole } = useMockUser();
  const { addEvent, getEventById } = useEvents();

  // ALL HOOKS MUST BE BEFORE CONDITIONAL RETURNS
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basic info
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["pl"]);

  // Step 2: Date & location
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState<number>(180);
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);
  const [customAddress, setCustomAddress] = useState("");

  // Recurring events
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>("weekly");
  const [endCondition, setEndCondition] = useState<EndCondition>("occurrences");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>();
  const [recurrenceCount, setRecurrenceCount] = useState(4);

  // Step 3: Capacity & price
  const [capacity, setCapacity] = useState(8);
  const [price, setPrice] = useState(150);
  const [instantBooking, setInstantBooking] = useState(false);

  // Step 4: Menu & dietary
  const [menuDescription, setMenuDescription] = useState("");
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [whatToBring, setWhatToBring] = useState("");
  const [byob, setByob] = useState(false);

  // Step 5: Photos
  const [photos, setPhotos] = useState<string[]>([]);

  // Generated dates for recurring events
  const generatedDates = useMemo(() => {
    if (!isRecurring || !eventDate) return [eventDate].filter(Boolean) as Date[];
    return generateRecurringDates({
      startDate: eventDate,
      pattern: recurrencePattern,
      endCondition,
      endDate: recurrenceEndDate,
      occurrences: recurrenceCount,
    });
  }, [isRecurring, eventDate, recurrencePattern, endCondition, recurrenceEndDate, recurrenceCount]);

  // Redirect to guest dashboard if in guest mode
  useEffect(() => {
    if (!isLoading && effectiveRole === "guest") {
      intlRouter.push("/dashboard");
    }
  }, [isLoading, effectiveRole, intlRouter]);

  // Pre-fill form when duplicating an event
  useEffect(() => {
    if (duplicateFromId && getEventById) {
      const sourceEvent = getEventById(duplicateFromId);
      if (sourceEvent) {
        setTitle(sourceEvent.title);
        setEventType(sourceEvent.typeSlug);
        setDescription(sourceEvent.description);
        setStartTime(sourceEvent.startTime);
        setDuration(sourceEvent.duration);
        setCapacity(sourceEvent.capacity);
        setPrice(sourceEvent.price);
        setMenuDescription(sourceEvent.menuDescription);
        setSelectedDietary(sourceEvent.dietaryOptions);
        // Do NOT set: eventDate (user must select new date)
        // Do NOT set: photos (need to re-add)
      }
    }
  }, [duplicateFromId, getEventById]);

  // CONDITIONAL RETURNS MUST BE AFTER ALL HOOKS
  if (isLoading || effectiveRole === "guest") {
    return null;
  }

  const totalSteps = 5;

  // Platform fee calculation (15% default, may be different for host with override)
  const platformFee = Math.round(price * 0.15);
  const hostEarnings = price - platformFee;

  // Validation
  const isStep1Valid =
    title.length >= 5 &&
    eventType !== "" &&
    selectedTags.length > 0 &&
    description.length >= 50;

  const isStep2Valid =
    eventDate !== undefined &&
    startTime !== "" &&
    duration > 0 &&
    (useDefaultAddress || customAddress.length >= 10);

  const isStep3Valid = capacity >= 2 && capacity <= 50 && price >= 50;

  const isStep4Valid = menuDescription.length >= 20;

  const isStep5Valid = photos.length >= 1;

  const canProceed = () => {
    switch (step) {
      case 1: return isStep1Valid;
      case 2: return isStep2Valid;
      case 3: return isStep3Valid;
      case 4: return isStep4Valid;
      case 5: return isStep5Valid;
      default: return false;
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleDietaryToggle = (option: string) => {
    setSelectedDietary((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const simulatePhotoUpload = () => {
    if (photos.length < 5) {
      setPhotos([...photos, `photo-${photos.length + 1}`]);
    }
  };

  const handleSubmit = async (asDraft: boolean = false) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const hostId = mockUser?.id || "host-1";

    // For recurring events, use all generated dates; otherwise just the single date
    const datesToCreate = isRecurring ? generatedDates : [eventDate || new Date()];

    const eventAddress = useDefaultAddress ? "ul. Ruska 46/3, Wrocław" : customAddress;

    // Create an event for each date
    for (const date of datesToCreate) {
      const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();

      addEvent(hostId, {
        title,
        slug,
        type: eventTypes.find((t) => t.value === eventType)?.label || eventType,
        typeSlug: eventType,
        date,
        dateFormatted: format(date, "d MMM yyyy, HH:mm", { locale: pl }),
        startTime,
        duration,
        location: "Wrocław",
        locationSlug: "wroclaw",
        fullAddress: eventAddress,
        coordinates: { lat: 51.1079, lng: 17.0385 }, // Default Wrocław center
        price,
        capacity,
        spotsLeft: capacity,
        bookingsCount: 0,
        pendingBookings: 0,
        confirmedGuests: 0,
        revenue: 0,
        imageGradient: "from-amber-400 to-orange-500",
        status: asDraft ? "draft" : "pending_review",
        description,
        menuDescription,
        dietaryOptions: selectedDietary,
        createdAt: new Date(),
      });
    }

    // Show message if multiple events created
    if (datesToCreate.length > 1) {
      console.log(`Utworzono ${datesToCreate.length} wydarzeń!`);
    }

    router.push("/dashboard/host?created=true");
  };

  return (
    <div className="min-h-screen bg-muted/30 py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/dashboard/host"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Wróć do panelu
            </Link>
            <h1 className="text-2xl font-bold">
              {duplicateFromId ? "Duplikuj wydarzenie" : "Stwórz nowe wydarzenie"}
            </h1>
            <p className="text-muted-foreground">
              Wypełnij formularz krok po kroku
            </p>
          </div>

          {/* Duplicate info banner */}
          {duplicateFromId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Tworzysz kopię wydarzenia. Wybierz nową datę.
              </p>
            </div>
          )}

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      step > s
                        ? "bg-green-500 text-white"
                        : step === s
                        ? "bg-amber-600 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step > s ? <CheckCircle className="h-4 w-4" /> : s}
                  </div>
                  {s < 5 && (
                    <div
                      className={cn(
                        "w-10 sm:w-16 h-1 mx-1",
                        step > s ? "bg-green-500" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>Info</span>
              <span>Data</span>
              <span>Cena</span>
              <span>Menu</span>
              <span>Zdjęcia</span>
            </div>
          </div>

          {/* Step 1: Basic info */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Podstawowe informacje</CardTitle>
                <CardDescription>Nazwa i typ wydarzenia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Nazwa wydarzenia *</Label>
                  <Input
                    id="title"
                    placeholder="np. Włoska Kolacja - Toskańskie Smaki"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Przyciągający tytuł, który opisuje Twoje wydarzenie
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Typ wydarzenia *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {eventTypes.map((type) => (
                      <div
                        key={type.value}
                        className={cn(
                          "border rounded-lg p-3 cursor-pointer transition-all text-center",
                          eventType === type.value
                            ? "border-amber-600 bg-amber-50"
                            : "hover:border-amber-300"
                        )}
                        onClick={() => setEventType(type.value)}
                      >
                        <span className="text-2xl block mb-1">{type.icon}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tagi kuchni * (min. 1)</Label>
                  <div className="flex flex-wrap gap-2">
                    {cuisineTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer",
                          selectedTags.includes(tag)
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "hover:bg-amber-50"
                        )}
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                    {/* Custom tags added by user */}
                    {selectedTags
                      .filter((tag) => !cuisineTags.includes(tag))
                      .map((tag) => (
                        <Badge
                          key={tag}
                          variant="default"
                          className="bg-amber-600 hover:bg-amber-700 cursor-pointer"
                          onClick={() => handleTagToggle(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                  </div>
                  {/* Add custom tag input */}
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Dodaj własny tag..."
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customTag.trim()) {
                          e.preventDefault();
                          if (!selectedTags.includes(customTag.trim())) {
                            setSelectedTags([...selectedTags, customTag.trim()]);
                          }
                          setCustomTag("");
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
                          setSelectedTags([...selectedTags, customTag.trim()]);
                          setCustomTag("");
                        }
                      }}
                      disabled={!customTag.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Wybierz z listy lub dodaj własny tag
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Opis wydarzenia * (min. 50 znaków)</Label>
                  <Textarea
                    id="description"
                    placeholder="Opisz swoje wydarzenie - co goście mogą oczekiwać, jaka będzie atmosfera, co sprawia że jest wyjątkowe..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>To będzie widoczne na stronie wydarzenia</span>
                    <span className={description.length >= 50 ? "text-green-600" : ""}>
                      {description.length}/50
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    🌐 Języki wydarzenia *
                  </Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    W jakich językach będzie prowadzone wydarzenie?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {eventLanguages.map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => {
                          if (selectedLanguages.includes(lang.value)) {
                            // Don't allow removing the last language
                            if (selectedLanguages.length > 1) {
                              setSelectedLanguages(
                                selectedLanguages.filter((l) => l !== lang.value)
                              );
                            }
                          } else {
                            setSelectedLanguages([...selectedLanguages, lang.value]);
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition-all",
                          selectedLanguages.includes(lang.value)
                            ? "border-amber-600 bg-amber-50 text-amber-800"
                            : "border-muted hover:border-amber-300"
                        )}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                        {selectedLanguages.includes(lang.value) && (
                          <CheckCircle className="h-4 w-4 text-amber-600" />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Goście będą widzieć, w jakich językach możesz prowadzić wydarzenie
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Date & location */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Data i lokalizacja</CardTitle>
                <CardDescription>Kiedy i gdzie odbędzie się wydarzenie</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data wydarzenia *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !eventDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {eventDate
                            ? format(eventDate, "d MMM yyyy", { locale: pl })
                            : "Wybierz datę"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={eventDate}
                          onSelect={setEventDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Godzina rozpoczęcia *</Label>
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Czas trwania *</Label>
                  <Select
                    value={duration.toString()}
                    onValueChange={(v) => setDuration(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value.toString()}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Recurring events section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recurring"
                      checked={isRecurring}
                      onCheckedChange={(checked) => setIsRecurring(!!checked)}
                      disabled={!eventDate}
                    />
                    <label htmlFor="recurring" className="text-sm font-medium cursor-pointer">
                      Wydarzenie cykliczne
                    </label>
                  </div>

                  {isRecurring && eventDate && (
                    <div className="pl-6 space-y-4 border-l-2 border-amber-200 ml-2">
                      {/* Pattern selector */}
                      <div className="space-y-2">
                        <Label>Częstotliwość</Label>
                        <Select
                          value={recurrencePattern}
                          onValueChange={(v) => setRecurrencePattern(v as RecurrencePattern)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Co tydzień</SelectItem>
                            <SelectItem value="biweekly">Co 2 tygodnie</SelectItem>
                            <SelectItem value="monthly">Co miesiąc</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* End condition */}
                      <div className="space-y-2">
                        <Label>Zakończ serię</Label>
                        <RadioGroup
                          value={endCondition}
                          onValueChange={(v) => setEndCondition(v as EndCondition)}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="occurrences" id="end-occurrences" />
                            <label htmlFor="end-occurrences" className="text-sm cursor-pointer">
                              Po liczbie wydarzeń
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="date" id="end-date" />
                            <label htmlFor="end-date" className="text-sm cursor-pointer">
                              W dniu
                            </label>
                          </div>
                        </RadioGroup>
                      </div>

                      {endCondition === "occurrences" && (
                        <div className="space-y-2">
                          <Label>Liczba wydarzeń (2-52)</Label>
                          <Input
                            type="number"
                            min={2}
                            max={52}
                            value={recurrenceCount}
                            onChange={(e) =>
                              setRecurrenceCount(
                                Math.min(52, Math.max(2, Number(e.target.value)))
                              )
                            }
                            className="w-24"
                          />
                        </div>
                      )}

                      {endCondition === "date" && (
                        <div className="space-y-2">
                          <Label>Data zakończenia</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {recurrenceEndDate
                                  ? format(recurrenceEndDate, "d MMMM yyyy", { locale: pl })
                                  : "Wybierz datę"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={recurrenceEndDate}
                                onSelect={setRecurrenceEndDate}
                                disabled={(date) => date <= eventDate}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}

                      {/* Preview */}
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="font-medium text-sm mb-2 text-amber-800">
                          Podgląd terminów ({generatedDates.length}):
                        </p>
                        <div className="max-h-32 overflow-y-auto text-sm text-amber-700 space-y-1">
                          {generatedDates.slice(0, 10).map((date, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-amber-500">{i + 1}.</span>
                              {format(date, "EEEE, d MMMM yyyy", { locale: pl })}
                            </div>
                          ))}
                          {generatedDates.length > 10 && (
                            <div className="text-amber-600 italic">
                              ... i {generatedDates.length - 10} więcej
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="defaultAddress"
                      checked={useDefaultAddress}
                      onCheckedChange={(checked) =>
                        setUseDefaultAddress(checked as boolean)
                      }
                    />
                    <label htmlFor="defaultAddress" className="text-sm cursor-pointer">
                      Użyj mojego domyślnego adresu (ul. Ruska 46/3)
                    </label>
                  </div>

                  {!useDefaultAddress && (
                    <div className="space-y-2">
                      <Label htmlFor="address">Adres wydarzenia *</Label>
                      <Input
                        id="address"
                        placeholder="ul. Przykładowa 12, 50-000 Wrocław"
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Capacity & price */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Pojemność i cena</CardTitle>
                <CardDescription>Ile osób i za ile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Maksymalna liczba gości *</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="capacity"
                      type="number"
                      min={2}
                      max={50}
                      value={capacity}
                      onChange={(e) => setCapacity(parseInt(e.target.value) || 2)}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">osób</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rekomendujemy 6-12 osób dla optymalnej atmosfery
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="price">Cena za osobę *</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="price"
                      type="number"
                      min={50}
                      step={5}
                      value={price}
                      onChange={(e) => setPrice(parseInt(e.target.value) || 50)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">PLN</span>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cena dla gościa:</span>
                    <span>{price} PLN</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Opłata platformy (15%):</span>
                    <span>-{platformFee} PLN</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Twój zarobek:</span>
                    <span className="text-green-600">{hostEarnings} PLN/os</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Przy {capacity} gościach zarobisz:{" "}
                    <span className="font-semibold text-foreground">
                      {hostEarnings * capacity} PLN
                    </span>
                  </p>
                </div>

                <Separator />

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="instant"
                    checked={instantBooking}
                    onCheckedChange={(checked) =>
                      setInstantBooking(checked as boolean)
                    }
                  />
                  <div>
                    <label htmlFor="instant" className="text-sm font-medium cursor-pointer">
                      Natychmiastowa rezerwacja
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Goście będą mogli rezerwować bez Twojej akceptacji
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Menu & dietary */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Menu i dieta</CardTitle>
                <CardDescription>Co będziesz serwować</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="menu">Opis menu * (min. 20 znaków)</Label>
                  <Textarea
                    id="menu"
                    placeholder="Opisz dania które przygotujesz, np:&#10;• Antipasti misti&#10;• Pappardelle al ragù di cinghiale&#10;• Tiramisu"
                    value={menuDescription}
                    onChange={(e) => setMenuDescription(e.target.value)}
                    rows={5}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Możesz użyć punktów (•) do formatowania</span>
                    <span className={menuDescription.length >= 20 ? "text-green-600" : ""}>
                      {menuDescription.length}/20
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Dostępne opcje dietetyczne</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {dietaryOptionsAvailable.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={option}
                          checked={selectedDietary.includes(option)}
                          onCheckedChange={() => handleDietaryToggle(option)}
                        />
                        <label htmlFor={option} className="text-sm cursor-pointer">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="bring">Co zabrać ze sobą? (opcjonalne)</Label>
                  <Input
                    id="bring"
                    placeholder="np. Fartuch, dobry humor"
                    value={whatToBring}
                    onChange={(e) => setWhatToBring(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="byob"
                    checked={byob}
                    onCheckedChange={(checked) => setByob(checked as boolean)}
                  />
                  <label htmlFor="byob" className="text-sm cursor-pointer">
                    BYOB - goście mogą przynieść własne napoje
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Photos */}
          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Zdjęcia wydarzenia</CardTitle>
                <CardDescription>Dodaj min. 1 zdjęcie (max 5)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg border-2 border-green-500 bg-green-50 flex items-center justify-center relative"
                    >
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      {index === 0 && (
                        <Badge className="absolute top-2 left-2 text-xs">
                          Główne
                        </Badge>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setPhotos(photos.filter((_, i) => i !== index))
                        }
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 5 && (
                    <button
                      type="button"
                      onClick={simulatePhotoUpload}
                      className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center hover:border-amber-500 hover:bg-amber-50 transition-colors"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
                      <span className="text-sm text-muted-foreground">Dodaj zdjęcie</span>
                    </button>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Wskazówki</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Pierwsze zdjęcie będzie głównym zdjęciem wydarzenia</li>
                      <li>Pokaż jedzenie, przestrzeń i atmosferę</li>
                      <li>Jasne, dobrze oświetlone zdjęcia przyciągają więcej gości</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Wstecz
            </Button>

            <div className="flex gap-2">
              {step === totalSteps && (
                <Button
                  variant="outline"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Zapisz szkic
                </Button>
              )}

              {step < totalSteps ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Dalej
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={!canProceed() || isSubmitting}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Wysyłanie...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Opublikuj
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
