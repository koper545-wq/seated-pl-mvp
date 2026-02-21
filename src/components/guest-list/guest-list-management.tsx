"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  QrCode,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Mail,
  Phone,
  MessageCircle,
  AlertCircle,
  Utensils,
  Camera,
  Scan,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

interface GuestData {
  id: string;
  bookingId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  seats: number;
  status: "confirmed" | "checked_in" | "no_show" | "cancelled";
  checkedInAt?: Date;
  dietaryRequirements?: string[];
  specialRequests?: string;
  ticketCode: string;
}

interface GuestListItemProps {
  guest: GuestData;
  onCheckIn?: (guestId: string) => void;
  onNoShow?: (guestId: string) => void;
  onContact?: (guestId: string, method: "email" | "phone" | "message") => void;
  showActions?: boolean;
  className?: string;
}

interface GuestListProps {
  guests: GuestData[];
  eventTitle: string;
  eventDate: Date;
  onCheckIn?: (guestId: string) => void;
  onNoShow?: (guestId: string) => void;
  className?: string;
}

// Check-in button component
export function CheckInButton({
  guest,
  onCheckIn,
  onNoShow,
  size = "default",
}: {
  guest: GuestData;
  onCheckIn?: (guestId: string) => void;
  onNoShow?: (guestId: string) => void;
  size?: "sm" | "default";
}) {
  const [checking, setChecking] = useState(false);

  const handleCheckIn = async () => {
    setChecking(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onCheckIn?.(guest.id);
    setChecking(false);
  };

  if (guest.status === "checked_in") {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
        <CheckCircle className="h-3 w-3" />
        Zarejestrowany
      </Badge>
    );
  }

  if (guest.status === "no_show") {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Nieobecny
      </Badge>
    );
  }

  if (guest.status === "cancelled") {
    return (
      <Badge variant="outline" className="text-muted-foreground gap-1">
        Anulowany
      </Badge>
    );
  }

  return (
    <div className="flex gap-1">
      <Button
        size={size}
        onClick={handleCheckIn}
        disabled={checking}
        className="bg-green-600 hover:bg-green-700 gap-1"
      >
        <UserCheck className="h-4 w-4" />
        {checking ? "..." : "Check-in"}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={size === "sm" ? "sm" : "icon"}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onNoShow?.(guest.id)}>
            <UserX className="h-4 w-4 mr-2" />
            Oznacz jako nieobecny
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Guest list stats
export function GuestListStats({
  guests,
  compact = false,
  className,
}: {
  guests: GuestData[];
  compact?: boolean;
  className?: string;
}) {
  const totalSeats = guests.reduce((acc, g) => acc + g.seats, 0);
  const checkedIn = guests.filter((g) => g.status === "checked_in");
  const checkedInSeats = checkedIn.reduce((acc, g) => acc + g.seats, 0);
  const confirmed = guests.filter((g) => g.status === "confirmed");
  const noShows = guests.filter((g) => g.status === "no_show");
  const cancelled = guests.filter((g) => g.status === "cancelled");

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4 text-sm", className)}>
        <div className="flex items-center gap-1">
          <UserCheck className="h-4 w-4 text-green-600" />
          <span>{checkedInSeats}/{totalSeats}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-yellow-600" />
          <span>{confirmed.length} oczekuje</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      <div className="p-4 bg-green-50 rounded-xl text-center">
        <UserCheck className="h-6 w-6 text-green-600 mx-auto mb-1" />
        <p className="text-2xl font-bold text-green-700">{checkedInSeats}</p>
        <p className="text-xs text-green-600">Zarejestrowani</p>
      </div>
      <div className="p-4 bg-yellow-50 rounded-xl text-center">
        <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
        <p className="text-2xl font-bold text-yellow-700">
          {confirmed.reduce((acc, g) => acc + g.seats, 0)}
        </p>
        <p className="text-xs text-yellow-600">Oczekuje</p>
      </div>
      <div className="p-4 bg-red-50 rounded-xl text-center">
        <UserX className="h-6 w-6 text-red-600 mx-auto mb-1" />
        <p className="text-2xl font-bold text-red-700">{noShows.length}</p>
        <p className="text-xs text-red-600">Nieobecni</p>
      </div>
      <div className="p-4 bg-stone-50 rounded-xl text-center">
        <Users className="h-6 w-6 text-stone-600 mx-auto mb-1" />
        <p className="text-2xl font-bold text-stone-700">{totalSeats}</p>
        <p className="text-xs text-stone-600">Łącznie miejsc</p>
      </div>
    </div>
  );
}

// QR Scanner component (placeholder - would use camera in real app)
export function QRScanner({
  onScan,
  className,
}: {
  onScan?: (code: string) => void;
  className?: string;
}) {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");

  const handleManualSubmit = () => {
    if (manualCode) {
      onScan?.(manualCode);
      setManualCode("");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Scan className="h-4 w-4" />
          Skanuj bilet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Skanuj kod QR
          </DialogTitle>
          <DialogDescription>
            Zeskanuj kod QR z biletu gościa lub wpisz kod ręcznie
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Camera preview placeholder */}
          <div className="aspect-square bg-stone-900 rounded-xl flex items-center justify-center">
            {scanning ? (
              <div className="text-white text-center">
                <Camera className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                <p>Skanowanie...</p>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setScanning(true)}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                Włącz kamerę
              </Button>
            )}
          </div>

          {/* Manual code input */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">lub wpisz kod ręcznie</p>
            <div className="flex gap-2">
              <Input
                placeholder="SEAT-XXXX-XXXX"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                className="font-mono"
              />
              <Button onClick={handleManualSubmit} disabled={!manualCode}>
                Sprawdź
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Individual guest list item
export function GuestListItem({
  guest,
  onCheckIn,
  onNoShow,
  onContact,
  showActions = true,
  className,
}: GuestListItemProps) {
  const initials = getInitials(guest.name);

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-colors",
        guest.status === "checked_in" && "bg-green-50 border-green-200",
        guest.status === "no_show" && "bg-red-50 border-red-200",
        guest.status === "cancelled" && "bg-stone-50 border-stone-200 opacity-60",
        guest.status === "confirmed" && "bg-white hover:bg-stone-50",
        className
      )}
    >
      {/* Avatar */}
      <Avatar className="h-12 w-12">
        <AvatarFallback className="bg-amber-100 text-amber-700">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Guest info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium truncate">{guest.name}</h4>
          <Badge variant="secondary" className="text-xs">
            {guest.seats} {guest.seats === 1 ? "os." : "os."}
          </Badge>
          {guest.dietaryRequirements && guest.dietaryRequirements.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Utensils className="h-4 w-4 text-amber-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">Wymagania dietetyczne:</p>
                  <p>{guest.dietaryRequirements.join(", ")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {guest.specialRequests && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">Specjalne prośby:</p>
                  <p>{guest.specialRequests}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
          <span>{guest.email}</span>
          {guest.phone && <span>• {guest.phone}</span>}
        </div>
        {guest.checkedInAt && (
          <p className="text-xs text-green-600 mt-1">
            Zarejestrowany o {format(guest.checkedInAt, "HH:mm", { locale: pl })}
          </p>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2">
          <CheckInButton
            guest={guest}
            onCheckIn={onCheckIn}
            onNoShow={onNoShow}
            size="sm"
          />

          {guest.status === "confirmed" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onContact?.(guest.id, "email")}>
                  <Mail className="h-4 w-4 mr-2" />
                  Wyślij email
                </DropdownMenuItem>
                {guest.phone && (
                  <DropdownMenuItem onClick={() => onContact?.(guest.id, "phone")}>
                    <Phone className="h-4 w-4 mr-2" />
                    Zadzwoń
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onContact?.(guest.id, "message")}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Wyślij wiadomość
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onNoShow?.(guest.id)}
                  className="text-red-600"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Oznacz jako nieobecny
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
}

// Main guest list component
export function GuestList({
  guests,
  eventTitle,
  eventDate,
  onCheckIn,
  onNoShow,
  className,
}: GuestListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "confirmed" | "checked_in" | "no_show">("all");

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      search === "" ||
      guest.name.toLowerCase().includes(search.toLowerCase()) ||
      guest.email.toLowerCase().includes(search.toLowerCase()) ||
      guest.ticketCode.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" || guest.status === filter;

    return matchesSearch && matchesFilter;
  });

  const handleScan = (code: string) => {
    const guest = guests.find((g) => g.ticketCode === code);
    if (guest && guest.status === "confirmed") {
      onCheckIn?.(guest.id);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista gości
            </CardTitle>
            <CardDescription>
              {eventTitle} • {format(eventDate, "d MMMM yyyy", { locale: pl })}
            </CardDescription>
          </div>
          <QRScanner onScan={handleScan} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats */}
        <GuestListStats guests={guests} />

        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj po nazwisku, emailu lub kodzie biletu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "confirmed", "checked_in", "no_show"] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status === "all" && "Wszyscy"}
                {status === "confirmed" && "Oczekuje"}
                {status === "checked_in" && "Obecni"}
                {status === "no_show" && "Nieobecni"}
              </Button>
            ))}
          </div>
        </div>

        {/* Guest list */}
        <div className="space-y-2">
          {filteredGuests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Brak gości spełniających kryteria</p>
            </div>
          ) : (
            filteredGuests.map((guest) => (
              <GuestListItem
                key={guest.id}
                guest={guest}
                onCheckIn={onCheckIn}
                onNoShow={onNoShow}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Demo data
export const demoGuests: GuestData[] = [
  {
    id: "guest-1",
    bookingId: "booking-1",
    name: "Jan Kowalski",
    email: "jan.kowalski@example.com",
    phone: "+48 123 456 789",
    seats: 2,
    status: "checked_in",
    checkedInAt: new Date(),
    ticketCode: "SEAT-2F4K-9X7P",
  },
  {
    id: "guest-2",
    bookingId: "booking-2",
    name: "Anna Nowak",
    email: "anna.nowak@example.com",
    phone: "+48 987 654 321",
    seats: 4,
    status: "confirmed",
    dietaryRequirements: ["Wegetariańska", "Bez glutenu"],
    ticketCode: "SEAT-3G5L-8Y6Q",
  },
  {
    id: "guest-3",
    bookingId: "booking-3",
    name: "Piotr Wiśniewski",
    email: "piotr.w@example.com",
    seats: 1,
    status: "confirmed",
    specialRequests: "Urodziny - proszę o świeczkę w deserze",
    ticketCode: "SEAT-4H6M-7Z5R",
  },
  {
    id: "guest-4",
    bookingId: "booking-4",
    name: "Maria Zielińska",
    email: "maria.z@example.com",
    seats: 2,
    status: "no_show",
    ticketCode: "SEAT-5I7N-6A4S",
  },
  {
    id: "guest-5",
    bookingId: "booking-5",
    name: "Tomasz Lewandowski",
    email: "tomasz.l@example.com",
    phone: "+48 555 666 777",
    seats: 3,
    status: "confirmed",
    ticketCode: "SEAT-6J8O-5B3T",
  },
];
