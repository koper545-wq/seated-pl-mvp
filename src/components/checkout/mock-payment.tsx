"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useBookings, type Booking } from "@/contexts/bookings-context";
import {
  CreditCard,
  Lock,
  CheckCircle,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  User,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MockPaymentProps {
  booking: Booking;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  hostName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MockPayment({
  booking,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  hostName,
  onSuccess,
  onCancel,
}: MockPaymentProps) {
  const router = useRouter();
  const { payBooking, cancelBooking } = useBookings();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock card state (just for visual)
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const formatPrice = (priceInGrosze: number) => {
    return (priceInGrosze / 100).toFixed(2).replace(".", ",") + " PLN";
  };

  const totalAmount = booking.totalPrice + booking.platformFee - (booking.voucherDiscount || 0);

  const handlePay = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const success = await payBooking(booking.id);

      if (success) {
        setIsSuccess(true);
        // Wait a moment to show success state
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (onSuccess) {
          onSuccess();
        } else {
          // Redirect to confirmation
          router.push(`/bookings/confirmation?eventId=${booking.eventId}&tickets=${booking.ticketCount}&bookingId=${booking.id}`);
        }
      } else {
        setError("Płatność nie powiodła się. Spróbuj ponownie.");
      }
    } catch (err) {
      setError("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    cancelBooking(booking.id);
    if (onCancel) {
      onCancel();
    } else {
      router.push(`/events/${booking.eventId}`);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Płatność udana!</h2>
          <p className="text-muted-foreground">
            Przekierowujemy Cię do potwierdzenia...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Podsumowanie zamówienia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">{eventTitle}</h3>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{eventDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{eventTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{eventLocation}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Host: {hostName}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{booking.ticketCount} x bilet</span>
              <span>{formatPrice(booking.totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Opłata serwisowa</span>
              <span>{formatPrice(booking.platformFee)}</span>
            </div>
            {booking.voucherDiscount && booking.voucherDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Rabat ({booking.voucherCode})</span>
                <span>-{formatPrice(booking.voucherDiscount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Do zapłaty</span>
              <span className="text-amber-600">{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Dane płatności
          </CardTitle>
          <CardDescription>
            To jest tryb testowy - nie wprowadzaj prawdziwych danych karty
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Demo notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>Tryb demo:</strong> Kliknij &quot;Zapłać&quot; aby zasymulować płatność.
              Żadne pieniądze nie zostaną pobrane.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="card">Numer karty</Label>
            <Input
              id="card"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Data ważności</Label>
              <Input
                id="expiry"
                placeholder="MM/RR"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Anuluj
            </Button>
            <Button
              className={cn(
                "flex-1",
                isProcessing
                  ? "bg-amber-400"
                  : "bg-amber-600 hover:bg-amber-700"
              )}
              onClick={handlePay}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Przetwarzanie...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Zapłać {formatPrice(totalAmount)}
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
            <Lock className="h-3 w-3" />
            <span>Bezpieczna płatność testowa</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
