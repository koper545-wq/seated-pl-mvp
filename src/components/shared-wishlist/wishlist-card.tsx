"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Calendar, MapPin, Users, Lock, Globe, UserCheck } from "lucide-react";
import { SharedWishlist, getEventById } from "@/lib/mock-data";

interface WishlistCardProps {
  wishlist: SharedWishlist;
  showActions?: boolean;
}

export function WishlistCard({ wishlist, showActions = true }: WishlistCardProps) {
  const events = wishlist.eventIds
    .map((id) => getEventById(id))
    .filter(Boolean)
    .slice(0, 3);

  const visibilityIcon = {
    private: <Lock className="h-3 w-3" />,
    collaborators: <UserCheck className="h-3 w-3" />,
    public: <Globe className="h-3 w-3" />,
  };

  const visibilityLabel = {
    private: "Prywatna",
    collaborators: "Współpracownicy",
    public: "Publiczna",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{wishlist.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Autor: {wishlist.ownerName}</span>
              <Badge variant="outline" className="text-xs gap-1">
                {visibilityIcon[wishlist.visibility]}
                {visibilityLabel[wishlist.visibility]}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {wishlist.collaboratorIds.length + 1}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Events preview */}
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event!.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${event!.imageGradient} flex-shrink-0`}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{event!.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{event!.dateFormatted}</span>
                  <MapPin className="h-3 w-3 ml-1" />
                  <span className="truncate">{event!.location}</span>
                </div>
              </div>
            </div>
          ))}
          {wishlist.eventIds.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">
              +{wishlist.eventIds.length - 3} więcej wydarzeń
            </p>
          )}
          {wishlist.eventIds.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Brak wydarzeń na liście
            </p>
          )}
        </div>

        {/* Collaborator avatars */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {wishlist.collaboratorIds.slice(0, 5).map((_, index) => (
              <Avatar key={index} className="h-7 w-7 border-2 border-background">
                <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                  {String.fromCharCode(65 + index)}
                </AvatarFallback>
              </Avatar>
            ))}
            {wishlist.collaboratorIds.length > 5 && (
              <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  +{wishlist.collaboratorIds.length - 5}
                </span>
              </div>
            )}
          </div>

          {showActions && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/homies/wishlists/${wishlist.id}`}>
                Zobacz listę
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
