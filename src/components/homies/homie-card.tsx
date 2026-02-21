"use client";

import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FollowButton } from "./follow-button";
import { getInitials } from "@/lib/utils";
import { ChefHat, Users, Star } from "lucide-react";

interface HomieCardProps {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  isHost: boolean;
  rating?: number;
  eventsCount?: number;
  followersCount: number;
  mutualHomiesCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
}

export function HomieCard({
  id,
  name,
  avatar,
  bio,
  isHost,
  rating,
  eventsCount,
  followersCount,
  mutualHomiesCount,
  isFollowing,
  isFollowedBy,
  onFollow,
  onUnfollow,
}: HomieCardProps) {
  const initials = getInitials(name);

  const isMutual = isFollowing && isFollowedBy;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Link href={`/profile/${id}`}>
            <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
              {avatar ? (
                <AvatarImage src={avatar} alt={name} />
              ) : null}
              <AvatarFallback className={isHost ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-700"}>
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={isHost ? `/hosts/${id}` : `/profile/${id}`}
                className="font-semibold hover:text-amber-600 transition-colors truncate"
              >
                {name}
              </Link>
              {isHost && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                  <ChefHat className="h-3 w-3 mr-1" />
                  Host
                </Badge>
              )}
              {isMutual && (
                <Badge variant="outline" className="border-green-200 text-green-700 text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Homie
                </Badge>
              )}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>{followersCount} obserwujących</span>
              {isHost && rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {rating}
                </span>
              )}
              {isHost && eventsCount && (
                <span>{eventsCount} wydarzeń</span>
              )}
              {mutualHomiesCount > 0 && (
                <span>{mutualHomiesCount} wspólnych</span>
              )}
            </div>

            {bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{bio}</p>
            )}
          </div>

          <div className="flex-shrink-0">
            <FollowButton
              userId={id}
              userName={name}
              isFollowing={isFollowing}
              isFollowedBy={isFollowedBy}
              onFollow={onFollow}
              onUnfollow={onUnfollow}
              size="sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
