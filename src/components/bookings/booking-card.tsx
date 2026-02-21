"use client";

import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MockBooking, bookingStatusLabels } from "@/lib/mock-data";
import {
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  X,
  MessageCircle,
  Star,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

interface BookingCardProps {
  booking: MockBooking;
  onCancel?: (bookingId: string) => void;
  showActions?: boolean;
}

export function BookingCard({
  booking,
  onCancel,
  showActions = true,
}: BookingCardProps) {
  const statusInfo = bookingStatusLabels[booking.status];
  const isPast = booking.event.date < new Date();
  const canCancel =
    !isPast &&
    (booking.status === "pending" || booking.status === "approved");

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        isPast && "opacity-75"
      )}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Event image/gradient */}
        <div
          className={cn(
            "w-full sm:w-32 h-24 sm:h-auto bg-gradient-to-br flex-shrink-0",
            booking.event.imageGradient
          )}
        />

        <CardContent className="flex-1 p-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex-1">
              {/* Status badge */}
              <Badge className={cn("mb-2", statusInfo.color)} variant="secondary">
                {statusInfo.label}
              </Badge>

              {/* Event title */}
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                {booking.event.title}
              </h3>

              {/* Event details */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{booking.event.dateFormatted}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{booking.event.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {booking.ticketCount}{" "}
                    {booking.ticketCount === 1 ? "osoba" : "osoby"}
                  </span>
                </div>
              </div>

              {/* Price */}
              <p className="mt-2 font-semibold">
                {formatPrice(booking.totalPrice)}
              </p>

              {/* Cancel reason */}
              {booking.status === "cancelled" && booking.cancelReason && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Powód anulowania: {booking.cancelReason}
                </p>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex sm:flex-col gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/events/${booking.eventId}`}>
                    <span className="hidden sm:inline">Zobacz</span>
                    <ChevronRight className="h-4 w-4 sm:ml-1" />
                  </Link>
                </Button>

                {booking.status === "approved" && !isPast && (
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Kontakt</span>
                  </Button>
                )}

                {canCancel && onCancel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onCancel(booking.id)}
                  >
                    <X className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Anuluj</span>
                  </Button>
                )}

                {/* Feedback button for past events */}
                {isPast && booking.status === "approved" && (
                  <Button
                    asChild
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <Link href={`/dashboard/bookings/${booking.id}/feedback`}>
                      <Star className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Oceń</span>
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
