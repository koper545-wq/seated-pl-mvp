"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AttendeeAvatars } from "./attendee-avatars";
import {
  getEventAttendees,
  getEventAttendeeStats,
  EventAttendee,
} from "@/lib/mock-data";
import { Users, ChevronDown, ChevronUp, Heart } from "lucide-react";

interface WhosGoingSectionProps {
  eventId: string;
  currentUserId?: string;
  compact?: boolean;
}

export function WhosGoingSection({
  eventId,
  currentUserId = "user-current",
  compact = false,
}: WhosGoingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const attendees = getEventAttendees(eventId, currentUserId);
  const stats = getEventAttendeeStats(eventId, currentUserId);

  const confirmedAttendees = attendees.filter((a) => a.status === "confirmed");
  const interestedAttendees = attendees.filter(
    (a) => a.status === "interested" || a.status === "wishlist"
  );
  const homiesGoing = attendees.filter(
    (a) => a.isHomie && a.status === "confirmed"
  );

  if (attendees.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <AttendeeAvatars attendees={confirmedAttendees} maxDisplay={3} size="sm" />
        {stats.homiesGoing > 0 && (
          <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
            <Heart className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
            {stats.homiesGoing} homie{stats.homiesGoing > 1 ? "s" : ""}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-stone-500" />
            Kto idzie?
          </CardTitle>
          <div className="flex items-center gap-2">
            {stats.confirmed > 0 && (
              <Badge variant="secondary">{stats.confirmed} potwierdzon{stats.confirmed === 1 ? "y" : "ych"}</Badge>
            )}
            {stats.interested > 0 && (
              <Badge variant="outline">{stats.interested} zainteresowanych</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Homies going highlight */}
        {homiesGoing.length > 0 && (
          <div className="bg-amber-50 rounded-lg p-3 mb-4 flex items-center gap-3">
            <Heart className="h-5 w-5 text-amber-500 fill-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                {homiesGoing.length} twoich homies idzie!
              </p>
              <div className="flex items-center gap-1 mt-1">
                {homiesGoing.slice(0, 3).map((h) => (
                  <span key={h.id} className="text-xs text-amber-700">
                    {h.userName}
                    {homiesGoing.indexOf(h) < Math.min(homiesGoing.length - 1, 2)
                      ? ", "
                      : ""}
                  </span>
                ))}
                {homiesGoing.length > 3 && (
                  <span className="text-xs text-amber-600">
                    i {homiesGoing.length - 3} więcej
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Avatar stack */}
        <div className="flex items-center justify-between mb-4">
          <AttendeeAvatars attendees={confirmedAttendees} maxDisplay={6} />
          {attendees.length > 6 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Zwiń
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Zobacz wszystkich
                </>
              )}
            </Button>
          )}
        </div>

        {/* Expanded list */}
        {isExpanded && (
          <div className="space-y-2 border-t pt-4">
            {confirmedAttendees.map((attendee) => {
              const initials = attendee.userName
                .split(" ")
                .map((n) => n[0])
                .join("");

              return (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback
                        className={`${
                          attendee.isHomie
                            ? "bg-amber-100 text-amber-700"
                            : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        {attendee.userName}
                      </p>
                      {attendee.userLevel && (
                        <p className="text-xs text-stone-500">
                          Poziom {attendee.userLevel}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {attendee.isMutualHomie && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        Homies
                      </Badge>
                    )}
                    {attendee.isHomie && !attendee.isMutualHomie && (
                      <Badge variant="outline" className="border-amber-200 text-amber-700">
                        Obserwujesz
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}

            {interestedAttendees.length > 0 && (
              <>
                <div className="text-xs text-stone-500 font-medium pt-2 border-t">
                  Zainteresowani ({interestedAttendees.length})
                </div>
                {interestedAttendees.slice(0, 3).map((attendee) => {
                  const initials = attendee.userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("");

                  return (
                    <div
                      key={attendee.id}
                      className="flex items-center gap-3 py-2 opacity-75"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-stone-100 text-stone-600">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm text-stone-600">
                        {attendee.userName}
                      </p>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
