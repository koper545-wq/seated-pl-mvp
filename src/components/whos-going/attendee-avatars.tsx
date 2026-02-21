"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EventAttendee } from "@/lib/mock-data";

interface AttendeeAvatarsProps {
  attendees: EventAttendee[];
  maxDisplay?: number;
  size?: "sm" | "default" | "lg";
}

export function AttendeeAvatars({
  attendees,
  maxDisplay = 5,
  size = "default",
}: AttendeeAvatarsProps) {
  const displayAttendees = attendees.slice(0, maxDisplay);
  const remaining = attendees.length - maxDisplay;

  const sizeClasses = {
    sm: "h-6 w-6 text-xs -ml-2 first:ml-0",
    default: "h-8 w-8 text-sm -ml-3 first:ml-0",
    lg: "h-10 w-10 text-base -ml-3 first:ml-0",
  };

  return (
    <TooltipProvider>
      <div className="flex items-center">
        {displayAttendees.map((attendee) => {
          const initials = attendee.userName
            .split(" ")
            .map((n) => n[0])
            .join("");

          return (
            <Tooltip key={attendee.id}>
              <TooltipTrigger asChild>
                <Avatar
                  className={`${sizeClasses[size]} border-2 border-white ring-2 ${
                    attendee.isHomie
                      ? "ring-amber-400"
                      : attendee.isMutualHomie
                      ? "ring-green-400"
                      : "ring-stone-200"
                  }`}
                >
                  {attendee.userAvatar && (
                    <AvatarImage src={attendee.userAvatar} alt={attendee.userName} />
                  )}
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
              </TooltipTrigger>
              <TooltipContent>
                <p>{attendee.userName}</p>
                {attendee.isHomie && (
                  <p className="text-xs text-amber-600">Twój homie</p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {remaining > 0 && (
          <Avatar
            className={`${sizeClasses[size]} border-2 border-white ring-2 ring-stone-200`}
          >
            <AvatarFallback className="bg-stone-200 text-stone-600">
              +{remaining}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </TooltipProvider>
  );
}
