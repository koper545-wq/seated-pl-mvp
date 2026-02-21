"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { dietaryOptions, calculateCommission, getPlatformSettings, validateVoucher, type Voucher } from "@/lib/mock-data";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  Minus,
  Plus,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  Ticket,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookings } from "@/contexts/bookings-context";

interface BookingFormProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventPrice: number;
  spotsLeft: number;
  maxTickets?: number;
  hostName: string;
  // Waitlist booking props
  isWaitlistBooking?: boolean;
  waitlistEntryId?: string;
}

export interface BookingFormData {
  eventId: string;
  ticketCount: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  dietaryRestrictions: string[];
  otherDietary: string;
  specialRequests: string;
  agreeToTerms: boolean;
}

export function BookingForm({
  eventId,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventPrice,
  spotsLeft,
  maxTickets = 4,
  hostName,
  isWaitlistBooking = false,
  waitlistEntryId,
}: BookingFormProps) {
  const router = useRouter();
  const { createBooking } = useBookings();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [ticketCount, setTicketCount] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [otherDietary, setOtherDietary] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherError, setVoucherError] = useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  const maxAvailable = Math.min(spotsLeft, maxTickets);
  const totalPrice = eventPrice * ticketCount;
  const platformFee = calculateCommission(totalPrice * 100) / 100; // fee in PLN
  const totalBeforeDiscount = totalPrice + platformFee;
  const totalWithFee = totalBeforeDiscount - voucherDiscount / 100;
  const settings = getPlatformSettings();
  const feeLabel = settings.commissionType === "percentage"
    ? `Opłata serwisowa (${settings.commissionValue}%)`
    : "Opłata serwisowa";

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;

    setIsValidatingVoucher(true);
    setVoucherError("");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = validateVoucher(voucherCode, totalBeforeDiscount * 100);

    if (result.valid && result.voucher && result.discount) {
      setAppliedVoucher(result.voucher);
      setVoucherDiscount(result.discount);
      setVoucherError("");
    } else {
      setVoucherError(result.error || "Nieprawidłowy kod");
      setAppliedVoucher(null);
      setVoucherDiscount(0);
    }

    setIsValidatingVoucher(false);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherDiscount(0);
    setVoucherCode("");
    setVoucherError("");
  };

  const formatPrice = (priceInGrosze: number) => {
    return (priceInGrosze / 100).toFixed(2).replace(".", ",") + " PLN";
  };

  const isStep1Valid = ticketCount > 0 && ticketCount <= maxAvailable;
  const isStep2Valid =
    guestName.length >= 2 &&
    guestEmail.includes("@") &&
    guestPhone.length >= 9;
  const isStep3Valid = agreeToTerms;

  const handleDietaryChange = (value: string, checked: boolean) => {
    if (checked) {
      setDietaryRestrictions([...dietaryRestrictions, value]);
    } else {
      setDietaryRestrictions(dietaryRestrictions.filter((d) => d !== value));
    }
  };

  const handleSubmit = async () => {
    if (!isStep3Valid) return;

    setIsSubmitting(true);

    try {
      // Create booking with pending_payment status
      const booking = createBooking({
        eventId,
        guestId: "guest-current", // TODO: get from auth context
        guestName,
        guestEmail,
        guestPhone,
        ticketCount,
        totalPrice: totalPrice * 100, // in grosze
        platformFee: platformFee * 100, // in grosze
        voucherCode: appliedVoucher?.code,
        voucherDiscount: voucherDiscount,
        dietaryRestrictions,
        otherDietary,
        specialRequests,
      });

      // If this is a waitlist booking, mark it as converted
      if (isWaitlistBooking && waitlistEntryId) {
        try {
          await fetch("/api/waitlist/convert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              entryId: waitlistEntryId,
              bookingId: booking.id,
            }),
          });
        } catch (error) {
          console.error("Failed to convert waitlist entry:", error);
        }
      }

      // Redirect to checkout page with booking ID
      const params = new URLSearchParams({
        bookingId: booking.id,
      });
      if (isWaitlistBooking) {
        params.set("fromWaitlist", "true");
      }
      router.push(`/checkout?${params.toString()}`);
    } catch (error) {
      console.error("Failed to create booking:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors",
                step >= s
                  ? "bg-amber-600 text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step > s ? <CheckCircle className="h-5 w-5" /> : s}
            </div>
            {s < 3 && (
              <div
                className={cn(
                  "w-16 sm:w-24 h-1 mx-2",
                  step > s ? "bg-amber-600" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Ticket selection */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Wybierz liczbę miejsc</CardTitle>
            <CardDescription>
              Wydarzenie: {eventTitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Event info summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-amber-600" />
                <span>{eventDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>Godzina {eventTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-amber-600" />
                <span>{eventLocation}</span>
              </div>
            </div>

            {/* Ticket counter */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Liczba biletów</p>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(eventPrice * 100)} / osoba
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                  disabled={ticketCount <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-2xl font-bold w-8 text-center">
                  {ticketCount}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setTicketCount(Math.min(maxAvailable, ticketCount + 1))
                  }
                  disabled={ticketCount >= maxAvailable}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              <Users className="h-4 w-4 inline mr-1" />
              Dostępne miejsca: {spotsLeft} (max {maxTickets} na rezerwację)
            </p>

            <Separator />

            {/* Voucher code */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Kod rabatowy / karta podarunkowa
              </Label>
              {appliedVoucher ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-mono font-medium">{appliedVoucher.code}</span>
                    <span className="text-green-600 text-sm">
                      (-{formatPrice(voucherDiscount)})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveVoucher}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Wpisz kod"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyVoucher}
                    disabled={!voucherCode.trim() || isValidatingVoucher}
                  >
                    {isValidatingVoucher ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Zastosuj"
                    )}
                  </Button>
                </div>
              )}
              {voucherError && (
                <p className="text-sm text-red-600">{voucherError}</p>
              )}
            </div>

            <Separator />

            {/* Price summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {ticketCount} x {formatPrice(eventPrice * 100)}
                </span>
                <span>{formatPrice(totalPrice * 100)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{feeLabel}</span>
                <span>{formatPrice(platformFee * 100)}</span>
              </div>
              {appliedVoucher && voucherDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Rabat ({appliedVoucher.code})</span>
                  <span>-{formatPrice(voucherDiscount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Razem</span>
                <span>{formatPrice(totalWithFee * 100)}</span>
              </div>
            </div>

            <Button
              className="w-full bg-amber-600 hover:bg-amber-700"
              size="lg"
              onClick={() => setStep(2)}
              disabled={!isStep1Valid}
            >
              Kontynuuj
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Guest details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Twoje dane</CardTitle>
            <CardDescription>
              Podaj dane kontaktowe do rezerwacji
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Imię i nazwisko *</Label>
                <Input
                  id="name"
                  placeholder="Jan Kowalski"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Adres email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jan@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Numer telefonu *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+48 123 456 789"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Dietary restrictions */}
            <div className="space-y-3">
              <Label>Preferencje dietetyczne (opcjonalne)</Label>
              <div className="grid grid-cols-2 gap-2">
                {dietaryOptions.slice(0, -1).map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={dietaryRestrictions.includes(option.value)}
                      onCheckedChange={(checked) =>
                        handleDietaryChange(option.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={option.value}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              {dietaryRestrictions.includes("other") && (
                <Input
                  placeholder="Opisz swoje wymagania dietetyczne..."
                  value={otherDietary}
                  onChange={(e) => setOtherDietary(e.target.value)}
                />
              )}
            </div>

            <Separator />

            {/* Special requests */}
            <div className="space-y-2">
              <Label htmlFor="requests">Specjalne życzenia (opcjonalne)</Label>
              <Textarea
                id="requests"
                placeholder="Np. alergie, okazja specjalna, prośby..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Wstecz
              </Button>
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700"
                onClick={() => setStep(3)}
                disabled={!isStep2Valid}
              >
                Kontynuuj
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Podsumowanie rezerwacji</CardTitle>
            <CardDescription>
              Sprawdź dane przed wysłaniem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Booking summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-4">
              <h4 className="font-semibold">{eventTitle}</h4>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">Data:</span>
                <span>{eventDate}</span>
                <span className="text-muted-foreground">Godzina:</span>
                <span>{eventTime}</span>
                <span className="text-muted-foreground">Lokalizacja:</span>
                <span>{eventLocation}</span>
                <span className="text-muted-foreground">Host:</span>
                <span>{hostName}</span>
                <span className="text-muted-foreground">Liczba osób:</span>
                <span>{ticketCount}</span>
              </div>
            </div>

            {/* Guest info summary */}
            <div className="space-y-2">
              <h4 className="font-semibold">Dane kontaktowe</h4>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">Imię:</span>
                <span>{guestName}</span>
                <span className="text-muted-foreground">Email:</span>
                <span>{guestEmail}</span>
                <span className="text-muted-foreground">Telefon:</span>
                <span>{guestPhone}</span>
              </div>
              {dietaryRestrictions.length > 0 && (
                <div className="mt-2">
                  <span className="text-muted-foreground text-sm">Dieta: </span>
                  <span className="text-sm">
                    {dietaryRestrictions
                      .map(
                        (d) =>
                          dietaryOptions.find((o) => o.value === d)?.label || d
                      )
                      .join(", ")}
                  </span>
                </div>
              )}
              {specialRequests && (
                <div className="mt-2">
                  <span className="text-muted-foreground text-sm">Życzenia: </span>
                  <span className="text-sm">{specialRequests}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Price summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {ticketCount} x {formatPrice(eventPrice * 100)}
                </span>
                <span>{formatPrice(totalPrice * 100)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{feeLabel}</span>
                <span>{formatPrice(platformFee * 100)}</span>
              </div>
              {appliedVoucher && voucherDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Rabat ({appliedVoucher.code})</span>
                  <span>-{formatPrice(voucherDiscount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Do zapłaty</span>
                <span className="text-amber-600">
                  {formatPrice(totalWithFee * 100)}
                </span>
              </div>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Jak to działa?</p>
                <p>
                  Po złożeniu rezerwacji host otrzyma powiadomienie. Gdy ją
                  zaakceptuje, otrzymasz email z potwierdzeniem i pełnym adresem
                  wydarzenia. Płatność zostanie pobrana dopiero po akceptacji.
                </p>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm cursor-pointer">
                Akceptuję{" "}
                <a href="/terms" className="text-amber-600 underline">
                  regulamin
                </a>{" "}
                i{" "}
                <a href="/privacy" className="text-amber-600 underline">
                  politykę prywatności
                </a>
                . Rozumiem, że płatność zostanie pobrana po akceptacji rezerwacji
                przez hosta.
              </label>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Wstecz
              </Button>
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700"
                size="lg"
                onClick={handleSubmit}
                disabled={!isStep3Valid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Wysyłanie...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Zarezerwuj i zapłać
                  </>
                )}
              </Button>
            </div>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              <span>Bezpieczna płatność przez Stripe</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
