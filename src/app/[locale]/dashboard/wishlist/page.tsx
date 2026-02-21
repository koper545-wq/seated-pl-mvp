"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SaveEventButton } from "@/components/events";
import { getWishlistWithEvents, eventTypes } from "@/lib/mock-data";
import {
  Heart,
  Calendar,
  MapPin,
  Clock,
  Bell,
  Search,
  Filter,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

export default function WishlistPage() {
  const currentUserId = "user-current";
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"saved" | "date" | "price">("saved");

  // Get wishlist items
  const wishlistItems = getWishlistWithEvents(currentUserId);

  // Filter and sort
  let filteredItems = wishlistItems;

  if (searchQuery) {
    filteredItems = filteredItems.filter((item) =>
      item.event.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (typeFilter !== "all") {
    filteredItems = filteredItems.filter(
      (item) => item.event.typeSlug === typeFilter
    );
  }

  // Sort
  filteredItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return a.event.date.getTime() - b.event.date.getTime();
      case "price":
        return a.event.price - b.event.price;
      case "saved":
      default:
        return b.savedAt.getTime() - a.savedAt.getTime();
    }
  });

  const soldOutCount = wishlistItems.filter(
    (item) => item.event.spotsLeft === 0
  ).length;
  const upcomingCount = wishlistItems.filter(
    (item) => item.event.date > new Date() && item.event.spotsLeft > 0
  ).length;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
            <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
            Moja Lista Życzeń
          </h1>
          <p className="text-muted-foreground">
            Wydarzenia, które chcesz odwiedzić
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-rose-500">
                {wishlistItems.length}
              </p>
              <p className="text-sm text-muted-foreground">Zapisanych</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{upcomingCount}</p>
              <p className="text-sm text-muted-foreground">Dostępnych</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{soldOutCount}</p>
              <p className="text-sm text-muted-foreground">Wyprzedanych</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj wydarzeń..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Typ wydarzenia" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sortuj" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="saved">Ostatnio zapisane</SelectItem>
              <SelectItem value="date">Data wydarzenia</SelectItem>
              <SelectItem value="price">Cena</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Wishlist items */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || typeFilter !== "all"
                  ? "Nie znaleziono wydarzeń"
                  : "Twoja lista jest pusta"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || typeFilter !== "all"
                  ? "Spróbuj zmienić filtry"
                  : "Zapisuj wydarzenia, które Cię interesują"}
              </p>
              {!searchQuery && typeFilter === "all" && (
                <Button asChild className="bg-amber-600 hover:bg-amber-700">
                  <Link href="/events">Przeglądaj wydarzenia</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const isSoldOut = item.event.spotsLeft === 0;
              const isPast = item.event.date < new Date();

              return (
                <Card
                  key={item.id}
                  className={`overflow-hidden ${isPast ? "opacity-60" : ""}`}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Image/gradient */}
                      <Link
                        href={`/events/${item.eventId}`}
                        className={`w-full sm:w-48 h-32 sm:h-auto bg-gradient-to-br ${item.event.imageGradient} flex-shrink-0`}
                      />

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Badges */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {item.event.type}
                              </Badge>
                              {isSoldOut && (
                                <Badge variant="destructive" className="text-xs">
                                  Wyprzedane
                                </Badge>
                              )}
                              {isPast && (
                                <Badge variant="outline" className="text-xs">
                                  Zakończone
                                </Badge>
                              )}
                              {item.notifyOnSpotAvailable && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-amber-300 text-amber-700"
                                >
                                  <Bell className="h-3 w-3 mr-1" />
                                  Powiadomienia
                                </Badge>
                              )}
                            </div>

                            {/* Title */}
                            <Link
                              href={`/events/${item.eventId}`}
                              className="font-semibold text-lg hover:text-amber-600 transition-colors line-clamp-1"
                            >
                              {item.event.title}
                            </Link>

                            {/* Info */}
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {item.event.dateFormatted}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {item.event.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {Math.floor(item.event.duration / 60)}h
                              </div>
                            </div>

                            {/* Notes */}
                            {item.notes && (
                              <p className="text-sm text-muted-foreground mt-2 italic">
                                &quot;{item.notes}&quot;
                              </p>
                            )}

                            {/* Saved date */}
                            <p className="text-xs text-muted-foreground mt-2">
                              Zapisano{" "}
                              {formatDistanceToNow(item.savedAt, {
                                addSuffix: true,
                                locale: pl,
                              })}
                            </p>
                          </div>

                          {/* Price and actions */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-xl font-bold">
                              {item.event.price} <span className="text-sm font-normal">PLN</span>
                            </p>
                            {!isSoldOut && !isPast && (
                              <p className="text-xs text-green-600">
                                {item.event.spotsLeft} miejsc
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-3">
                              {!isPast && (
                                <Button
                                  size="sm"
                                  className="bg-amber-600 hover:bg-amber-700"
                                  asChild
                                  disabled={isSoldOut}
                                >
                                  <Link href={`/events/${item.eventId}/book`}>
                                    {isSoldOut ? "Wyprzedane" : "Rezerwuj"}
                                  </Link>
                                </Button>
                              )}
                              <SaveEventButton
                                eventId={item.eventId}
                                eventTitle={item.event.title}
                                isSaved={true}
                                isSoldOut={isSoldOut}
                                notifyOnAvailable={item.notifyOnSpotAvailable}
                                size="sm"
                                showLabel={false}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
