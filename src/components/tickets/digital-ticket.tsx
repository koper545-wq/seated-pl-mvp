"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  QrCode,
  Download,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Ticket,
  Smartphone,
  CheckCircle,
  Copy,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketData {
  id: string;
  bookingId: string;
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  eventTime: string;
  location: string;
  hostName: string;
  guestName: string;
  guestEmail: string;
  seats: number;
  ticketCode: string;
  qrData: string;
  status: "valid" | "used" | "expired" | "cancelled";
  issuedAt: Date;
}

interface DigitalTicketProps {
  ticket: TicketData;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

// QR Code component using a simple SVG-based QR code
export function TicketQRCode({
  data,
  size = 200,
  className,
}: {
  data: string;
  size?: number;
  className?: string;
}) {
  // In production, you'd use a proper QR code library like 'qrcode.react'
  // For now, we'll create a placeholder that looks like a QR code
  const generateQRPattern = (data: string) => {
    // Create a deterministic pattern based on the data
    const hash = data.split("").reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
    }, 0);

    const gridSize = 21;
    const pattern: boolean[][] = [];

    for (let y = 0; y < gridSize; y++) {
      pattern[y] = [];
      for (let x = 0; x < gridSize; x++) {
        // Create finder patterns (corners)
        const isFinderPattern =
          (x < 7 && y < 7) || // top-left
          (x >= gridSize - 7 && y < 7) || // top-right
          (x < 7 && y >= gridSize - 7); // bottom-left

        if (isFinderPattern) {
          const fx = x < 7 ? x : (x >= gridSize - 7 ? x - (gridSize - 7) : x);
          const fy = y < 7 ? y : (y >= gridSize - 7 ? y - (gridSize - 7) : y);

          // Border
          if (fx === 0 || fx === 6 || fy === 0 || fy === 6) {
            pattern[y][x] = true;
          }
          // Inner square
          else if (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4) {
            pattern[y][x] = true;
          } else {
            pattern[y][x] = false;
          }
        } else {
          // Random-ish data pattern based on hash and position
          pattern[y][x] = ((hash + x * 37 + y * 41) % 3) === 0;
        }
      }
    }

    return pattern;
  };

  const pattern = generateQRPattern(data);
  const cellSize = size / pattern.length;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("bg-white rounded-lg", className)}
    >
      {/* White background */}
      <rect x="0" y="0" width={size} height={size} fill="white" />

      {/* QR pattern */}
      {pattern.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill="black"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export function TicketDownloadButton({
  ticket,
  variant = "default",
  size = "default",
}: {
  ticket: TicketData;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);

    // In a real app, this would call an API to generate a PDF
    // For now, simulate the download
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create a simple text-based ticket for demo
    const ticketContent = `
SEATED - Bilet Wstępu
=====================

Wydarzenie: ${ticket.eventTitle}
Data: ${format(ticket.eventDate, "d MMMM yyyy", { locale: pl })}
Godzina: ${ticket.eventTime}
Lokalizacja: ${ticket.location}

Gość: ${ticket.guestName}
Liczba miejsc: ${ticket.seats}
Kod biletu: ${ticket.ticketCode}

Host: ${ticket.hostName}

---------------------
Pokaż ten bilet lub kod QR przy wejściu.
ID: ${ticket.id}
    `.trim();

    const blob = new Blob([ticketContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bilet-${ticket.ticketCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloading(false);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={downloading || ticket.status === "cancelled"}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      {downloading ? "Pobieranie..." : "Pobierz bilet"}
    </Button>
  );
}

export function DigitalTicket({
  ticket,
  showActions = true,
  compact = false,
  className,
}: DigitalTicketProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copyTicketCode = async () => {
    await navigator.clipboard.writeText(ticket.ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (ticket.status) {
      case "valid":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ważny
          </Badge>
        );
      case "used":
        return (
          <Badge variant="secondary" className="bg-stone-100 text-stone-600">
            Wykorzystany
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
            Wygasł
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive">
            Anulowany
          </Badge>
        );
    }
  };

  if (compact) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                <Ticket className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium">{ticket.eventTitle}</h4>
                <p className="text-sm text-muted-foreground">
                  {format(ticket.eventDate, "d MMM yyyy", { locale: pl })} • {ticket.eventTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Dialog open={showQR} onOpenChange={setShowQR}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" disabled={ticket.status !== "valid"}>
                    <QrCode className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Kod QR biletu</DialogTitle>
                    <DialogDescription>
                      Pokaż ten kod przy wejściu na wydarzenie
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <TicketQRCode data={ticket.qrData} size={250} />
                    <div className="text-center">
                      <p className="text-lg font-mono font-bold">{ticket.ticketCode}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {ticket.seats} {ticket.seats === 1 ? "miejsce" : ticket.seats < 5 ? "miejsca" : "miejsc"}
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Ticket header with decorative edge */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            <span className="font-semibold text-lg">Bilet wstępu</span>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Decorative perforation */}
      <div className="h-4 bg-stone-50 relative">
        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex justify-between px-2">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-white rounded-full" />
          ))}
        </div>
      </div>

      <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Event details */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">
                {ticket.eventTitle}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Organizator: {ticket.hostName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Data</p>
                  <p className="font-medium">
                    {format(ticket.eventDate, "EEEE, d MMMM yyyy", { locale: pl })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Godzina</p>
                  <p className="font-medium">{ticket.eventTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Lokalizacja</p>
                  <p className="font-medium">{ticket.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Liczba miejsc</p>
                  <p className="font-medium">
                    {ticket.seats} {ticket.seats === 1 ? "osoba" : ticket.seats < 5 ? "osoby" : "osób"}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-stone-600" />
                </div>
                <div>
                  <p className="font-medium">{ticket.guestName}</p>
                  <p className="text-sm text-muted-foreground">{ticket.guestEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code section */}
          <div className="flex flex-col items-center justify-center p-4 bg-stone-50 rounded-xl">
            <TicketQRCode data={ticket.qrData} size={160} className="shadow-sm" />

            <div className="mt-4 text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={copyTicketCode}
                      className="font-mono text-lg font-bold text-stone-900 hover:text-amber-600 transition-colors flex items-center gap-2"
                    >
                      {ticket.ticketCode}
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-stone-400" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? "Skopiowano!" : "Kliknij, aby skopiować"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-xs text-muted-foreground mt-2">
                Pokaż kod QR przy wejściu
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && ticket.status === "valid" && (
          <div className="flex flex-wrap gap-3 pt-6 mt-6 border-t">
            <TicketDownloadButton ticket={ticket} />
            <Button variant="outline" className="gap-2">
              <Smartphone className="h-4 w-4" />
              Dodaj do portfela
            </Button>
            <Button variant="ghost" className="gap-2">
              <Share2 className="h-4 w-4" />
              Udostępnij
            </Button>
          </div>
        )}

        {/* Ticket info footer */}
        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
          <p>
            Bilet wystawiony: {format(ticket.issuedAt, "d MMM yyyy, HH:mm", { locale: pl })} •
            ID: {ticket.id}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Demo ticket for testing
export const demoTicket: TicketData = {
  id: "ticket-001",
  bookingId: "booking-001",
  eventId: "event-001",
  eventTitle: "Włoska Kolacja z Domową Pastą",
  eventDate: new Date("2025-02-20"),
  eventTime: "19:00",
  location: "Nadodrze, Wrocław",
  hostName: "Anna Kowalska",
  guestName: "Jan Nowak",
  guestEmail: "jan.nowak@example.com",
  seats: 2,
  ticketCode: "SEAT-2F4K-9X7P",
  qrData: "seated:ticket:001:event:001:booking:001",
  status: "valid",
  issuedAt: new Date("2025-02-10T14:30:00"),
};
