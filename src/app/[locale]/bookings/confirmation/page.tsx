"use client";

import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEventById } from "@/lib/mock-data";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Home,
  CalendarPlus,
} from "lucide-react";
import { Suspense } from "react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const tickets = searchParams.get("tickets") || "1";

  const event = eventId ? getEventById(eventId) : null;

  if (!event) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Nie znaleziono szczegółów rezerwacji.
            </p>
            <Button asChild className="mt-4">
              <Link href="/events">Przeglądaj wydarzenia</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto">
          {/* Success header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Rezerwacja wysłana!</h1>
            <p className="text-muted-foreground">
              Twoja prośba o rezerwację została wysłana do hosta.
            </p>
          </div>

          {/* Booking details */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">{event.title}</h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-amber-600" />
                  <span>{event.dateFormatted}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>Czas trwania: {Math.floor(event.duration / 60)}h</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-amber-600" />
                  <span>{event.location}</span>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Liczba miejsc:</span>
                  <span className="font-medium">{tickets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Host:</span>
                  <span className="font-medium">{event.host.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's next */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Co dalej?</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Oczekiwanie na akceptację</p>
                    <p className="text-sm text-muted-foreground">
                      Host otrzymał Twoją prośbę i wkrótce ją rozpatrzy.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Potwierdzenie emailem
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Po akceptacji otrzymasz email z pełnym adresem i
                      szczegółami płatności.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Ciesz się wydarzeniem!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Przyjdź na czas i przeżyj niezapomniane kulinarne
                      doświadczenie.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 mb-6">
            <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Wysłaliśmy potwierdzenie na Twój adres email. Sprawdź również
              folder spam.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1 bg-amber-600 hover:bg-amber-700">
              <Link href="/dashboard/bookings">
                <CalendarPlus className="h-4 w-4 mr-2" />
                Moje rezerwacje
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Strona główna
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted/30 flex items-center justify-center">
          <div className="animate-spin text-4xl">⏳</div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
