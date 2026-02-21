"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, CheckCircle, Users, Loader2, Clock, Mail } from "lucide-react";

interface WaitlistDialogProps {
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  eventPrice?: number;
  maxTickets?: number;
  trigger?: React.ReactNode;
}

export function WaitlistDialog({
  eventId,
  eventTitle,
  eventDate,
  eventPrice,
  maxTickets = 4,
  trigger,
}: WaitlistDialogProps) {
  const t = useTranslations("waitlist");
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ticketsWanted, setTicketsWanted] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          email: email.trim(),
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          ticketsWanted: parseInt(ticketsWanted),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Wystąpił błąd. Spróbuj ponownie.");
        setIsLoading(false);
        return;
      }

      setPosition(data.position);
      setIsSuccess(true);
    } catch {
      setError("Wystąpił błąd połączenia. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset state after animation
    setTimeout(() => {
      setEmail("");
      setName("");
      setPhone("");
      setTicketsWanted("1");
      setIsSuccess(false);
      setPosition(null);
      setError(null);
    }, 300);
  };

  // Ticket options based on maxTickets
  const ticketOptions = Array.from({ length: Math.min(maxTickets, 4) }, (_, i) => i + 1);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="link" className="text-amber-600 p-0 h-auto">
            {t("joinWaitlist")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-600" />
                {t("title")}
              </DialogTitle>
              <DialogDescription>
                {t("description")}
              </DialogDescription>
            </DialogHeader>

            {/* Event info */}
            <div className="bg-muted/50 rounded-lg p-3 mt-2">
              <p className="font-medium text-sm">{eventTitle}</p>
              {eventDate && (
                <p className="text-xs text-muted-foreground mt-1">{eventDate}</p>
              )}
              {eventPrice && (
                <p className="text-xs text-muted-foreground">
                  {eventPrice} zł/os
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Email - required */}
              <div className="space-y-2">
                <Label htmlFor="waitlist-email">{t("email")} *</Label>
                <Input
                  id="waitlist-email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Name - optional */}
              <div className="space-y-2">
                <Label htmlFor="waitlist-name">
                  Imię <span className="text-muted-foreground text-xs">(opcjonalne)</span>
                </Label>
                <Input
                  id="waitlist-name"
                  type="text"
                  placeholder="Jan Kowalski"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Phone - optional */}
              <div className="space-y-2">
                <Label htmlFor="waitlist-phone">
                  Telefon <span className="text-muted-foreground text-xs">(opcjonalne)</span>
                </Label>
                <Input
                  id="waitlist-phone"
                  type="tel"
                  placeholder="+48 600 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Tickets wanted */}
              <div className="space-y-2">
                <Label htmlFor="waitlist-tickets">Liczba miejsc</Label>
                <Select
                  value={ticketsWanted}
                  onValueChange={setTicketsWanted}
                  disabled={isLoading}
                >
                  <SelectTrigger id="waitlist-tickets">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ticketOptions.map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "miejsce" : num < 5 ? "miejsca" : "miejsc"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Error message */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Info about notification */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-50 p-3 rounded-lg">
                <Clock className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Gdy zwolni się miejsce, wyślemy email z linkiem do rezerwacji.
                  Będziesz mieć <strong>12 godzin</strong> na dokonanie rezerwacji.
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("joining")}
                    </>
                  ) : (
                    t("join")
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">{t("success")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("successDescription")}
              </p>

              {position && (
                <div className="bg-amber-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-amber-700 mb-1">Twoja pozycja na liście</p>
                  <p className="text-4xl font-bold text-amber-600">#{position}</p>
                  <p className="text-xs text-amber-600 mt-2">
                    Szukasz {ticketsWanted} {parseInt(ticketsWanted) === 1 ? "miejsca" : "miejsc"}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                <Mail className="h-4 w-4" />
                <span>Powiadomienie wyślemy na: <strong>{email}</strong></span>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Powiadomimy Cię emailem, gdy zwolni się miejsce
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-amber-600" />
                  Będziesz mieć 12 godzin na rezerwację
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-blue-600" />
                  Jeśli nie skorzystasz, miejsce trafi do kolejnej osoby
                </p>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              {t("close")}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
