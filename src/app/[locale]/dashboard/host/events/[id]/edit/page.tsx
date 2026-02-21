"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle,
  Upload,
  X,
  Save,
  Trash2,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { mockEvents } from "@/lib/mock-data";

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

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState<number>(180);
  const [neighborhood, setNeighborhood] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [capacity, setCapacity] = useState(8);
  const [price, setPrice] = useState(150);
  const [menuDescription, setMenuDescription] = useState("");
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [whatToBring, setWhatToBring] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  // Load event data
  useEffect(() => {
    const event = mockEvents.find((e) => e.id === eventId);
    if (event) {
      setTitle(event.title);
      setEventType(event.typeSlug);
      setSelectedTags(["Włoska"]); // mock
      setDescription(event.description);
      setEventDate(event.date);
      setStartTime(event.startTime);
      setDuration(event.duration);
      setNeighborhood(event.locationSlug);
      setFullAddress(event.fullAddress);
      setCapacity(event.capacity);
      setPrice(event.price);
      setMenuDescription(event.menuDescription);
      setSelectedDietary(event.dietaryOptions);
      setWhatToBring(event.whatToBring);
      setPhotos(["photo-1", "photo-2"]); // mock
    }
    setIsLoading(false);
  }, [eventId]);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [title, eventType, selectedTags, description, eventDate, startTime, duration, neighborhood, capacity, price, menuDescription, selectedDietary, whatToBring, photos]);

  // Fee calculation
  const platformFee = Math.round(price * 0.1);
  const hostEarnings = price - platformFee;

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

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setHasChanges(false);
    router.push(`/dashboard/host?edited=${eventId}`);
  };

  const handleDelete = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push("/dashboard/host?deleted=true");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/dashboard/host"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Wróć do panelu
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Edytuj wydarzenie</h1>
                <p className="text-muted-foreground">
                  Zaktualizuj szczegóły swojego wydarzenia
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/events/${eventId}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Podgląd
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Unsaved changes warning */}
          {hasChanges && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span className="text-sm text-amber-800">
                Masz niezapisane zmiany
              </span>
            </div>
          )}

          {/* Form sections */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Podstawowe informacje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Nazwa wydarzenia</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Typ wydarzenia</Label>
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
                  <Label>Tagi kuchni</Label>
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
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Opis wydarzenia</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Date & Location */}
            <Card>
              <CardHeader>
                <CardTitle>Data i lokalizacja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data wydarzenia</Label>
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
                    <Label>Godzina rozpoczęcia</Label>
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
                  <Label>Czas trwania</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="address">Adres (widoczny po rezerwacji)</Label>
                  <Input
                    id="address"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dzielnica (widoczna publicznie)</Label>
                  <Select value={neighborhood} onValueChange={setNeighborhood}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stare-miasto">Stare Miasto</SelectItem>
                      <SelectItem value="nadodrze">Nadodrze</SelectItem>
                      <SelectItem value="srodmiescie">Śródmieście</SelectItem>
                      <SelectItem value="krzyki">Krzyki</SelectItem>
                      <SelectItem value="fabryczna">Fabryczna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Capacity & Price */}
            <Card>
              <CardHeader>
                <CardTitle>Pojemność i cena</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Maksymalna liczba gości</Label>
                    <div className="flex items-center gap-2">
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Cena za osobę</Label>
                    <div className="flex items-center gap-2">
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
                </div>

                {/* Price breakdown */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cena dla gościa:</span>
                    <span>{price} PLN</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Opłata platformy (10%):</span>
                    <span>-{platformFee} PLN</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Twój zarobek:</span>
                    <span className="text-green-600">{hostEarnings} PLN/os</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Menu & Dietary */}
            <Card>
              <CardHeader>
                <CardTitle>Menu i dieta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="menu">Opis menu</Label>
                  <Textarea
                    id="menu"
                    value={menuDescription}
                    onChange={(e) => setMenuDescription(e.target.value)}
                    rows={4}
                  />
                </div>

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

                <div className="space-y-2">
                  <Label htmlFor="bring">Co zabrać ze sobą?</Label>
                  <Input
                    id="bring"
                    value={whatToBring}
                    onChange={(e) => setWhatToBring(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardHeader>
                <CardTitle>Zdjęcia wydarzenia</CardTitle>
                <CardDescription>Min. 1 zdjęcie, max. 5</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
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
                      <Upload className="h-6 w-6 text-muted-foreground/50 mb-1" />
                      <span className="text-xs text-muted-foreground">Dodaj</span>
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 pb-8">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Usuń wydarzenie
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Ta akcja jest nieodwracalna. Wydarzenie zostanie trwale usunięte
                      wraz ze wszystkimi rezerwacjami.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Usuń wydarzenie
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="flex gap-2">
                <Link href="/dashboard/host">
                  <Button variant="outline">Anuluj</Button>
                </Link>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Zapisz zmiany
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
