"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import {
  Calendar,
  MapPin,
  Users,
  Lock,
  Globe,
  UserCheck,
  ArrowRight,
  Check,
  Star,
  X,
  MessageCircle,
} from "lucide-react";
import { VoteButtons } from "./vote-buttons";
import { InviteCollaborator } from "./invite-collaborator";
import {
  SharedWishlist,
  WishlistVote,
  getEventById,
  getWishlistVotes,
  mockHomies,
} from "@/lib/mock-data";

interface WishlistDetailProps {
  wishlist: SharedWishlist;
  currentUserId?: string;
}

export function WishlistDetail({
  wishlist,
  currentUserId = "user-current",
}: WishlistDetailProps) {
  const events = wishlist.eventIds
    .map((id) => getEventById(id))
    .filter(Boolean);
  const votes = getWishlistVotes(wishlist.id);

  // Group votes by event
  const votesByEvent = wishlist.eventIds.reduce(
    (acc, eventId) => {
      acc[eventId] = votes.filter((v) => v.eventId === eventId);
      return acc;
    },
    {} as Record<string, WishlistVote[]>
  );

  const visibilityIcon = {
    private: <Lock className="h-4 w-4" />,
    collaborators: <UserCheck className="h-4 w-4" />,
    public: <Globe className="h-4 w-4" />,
  };

  const visibilityLabel = {
    private: "Prywatna",
    collaborators: "Współpracownicy",
    public: "Publiczna",
  };

  // Get collaborator details
  const collaborators = wishlist.collaboratorIds
    .map((id) => mockHomies.find((h) => h.id === id))
    .filter(Boolean);

  const getVoteSummary = (eventId: string) => {
    const eventVotes = votesByEvent[eventId] || [];
    const going = eventVotes.filter((v) => v.vote === "going").length;
    const interested = eventVotes.filter((v) => v.vote === "interested").length;
    const skip = eventVotes.filter((v) => v.vote === "skip").length;
    return { going, interested, skip, total: eventVotes.length };
  };

  const getUserVote = (eventId: string): "going" | "interested" | "skip" | null => {
    const userVote = votes.find(
      (v) => v.eventId === eventId && v.userId === currentUserId
    );
    return userVote?.vote || null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{wishlist.name}</CardTitle>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="text-sm">
                  Utworzona przez <strong>{wishlist.ownerName}</strong>
                </span>
                <Badge variant="outline" className="gap-1">
                  {visibilityIcon[wishlist.visibility]}
                  {visibilityLabel[wishlist.visibility]}
                </Badge>
              </div>
            </div>
            <InviteCollaborator
              wishlistId={wishlist.id}
              existingCollaboratorIds={wishlist.collaboratorIds}
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Collaborators */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600" />
              Współpracownicy ({collaborators.length + 1})
            </h4>
            <div className="flex flex-wrap gap-2">
              {/* Owner */}
              <Badge variant="secondary" className="gap-2 py-1.5 px-3">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                    {wishlist.ownerName[0]}
                  </AvatarFallback>
                </Avatar>
                {wishlist.ownerName}
                <span className="text-xs text-muted-foreground">(autor)</span>
              </Badge>
              {/* Collaborators */}
              {collaborators.map((collab) => (
                <Badge key={collab!.id} variant="outline" className="gap-2 py-1.5 px-3">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={collab!.avatar} />
                    <AvatarFallback className="text-xs">
                      {collab!.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {collab!.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events with voting */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Wydarzenia ({events.length})
          </h3>
          <Button variant="outline" size="sm" asChild>
            <Link href="/events">
              Dodaj wydarzenie
            </Link>
          </Button>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Ta lista jest pusta. Dodaj wydarzenia, które chcesz rozważyć!
              </p>
              <Button asChild className="bg-amber-600 hover:bg-amber-700">
                <Link href="/events">Przeglądaj wydarzenia</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => {
            const summary = getVoteSummary(event!.id);
            const userVote = getUserVote(event!.id);

            return (
              <Card key={event!.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Event image */}
                  <div
                    className={`w-full md:w-48 h-32 md:h-auto bg-gradient-to-br ${event!.imageGradient} flex-shrink-0`}
                  />

                  {/* Event details */}
                  <div className="flex-1 p-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <Link
                          href={`/events/${event!.id}`}
                          className="text-lg font-semibold hover:text-amber-600 transition-colors"
                        >
                          {event!.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {event!.dateFormatted}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event!.location}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{event!.type}</Badge>
                          <span className="text-lg font-bold text-amber-600">
                            {event!.price} PLN
                          </span>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/events/${event!.id}`}>
                          Zobacz <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>

                    <Separator className="my-4" />

                    {/* Voting section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <VoteButtons
                        eventId={event!.id}
                        wishlistId={wishlist.id}
                        currentVote={userVote}
                      />

                      {/* Vote summary */}
                      <div className="flex items-center gap-4 text-sm">
                        {summary.going > 0 && (
                          <span className="flex items-center gap-1 text-green-600">
                            <Check className="h-4 w-4" />
                            {summary.going} idzie
                          </span>
                        )}
                        {summary.interested > 0 && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Star className="h-4 w-4" />
                            {summary.interested} zainteresowanych
                          </span>
                        )}
                        {summary.skip > 0 && (
                          <span className="flex items-center gap-1 text-stone-500">
                            <X className="h-4 w-4" />
                            {summary.skip} pomija
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Discussion prompt */}
      <Card className="bg-muted/30">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-amber-600" />
              <div>
                <h4 className="font-medium">Omówcie wybór razem</h4>
                <p className="text-sm text-muted-foreground">
                  Rozpocznij rozmowę z współpracownikami o wydarzeniach
                </p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/homies/chat">
                Otwórz chat
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
