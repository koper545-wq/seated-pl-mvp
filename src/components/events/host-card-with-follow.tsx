"use client";

import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeDisplay } from "@/components/badges";
import { FollowButton } from "@/components/homies";
import { ReportDialog } from "@/components/reports";
import { HostVerificationBadge } from "@/components/hosts";
import { isFollowing, getFollowers, getHostProfile, HostVerificationStatus } from "@/lib/mock-data";
import { getInitials } from "@/lib/utils";
import { Star, Users, Flag } from "lucide-react";

interface HostCardWithFollowProps {
  host: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    reviewCount: number;
    eventsHosted: number;
    verified: boolean;
    verificationStatus?: HostVerificationStatus;
    badges?: string[];
  };
}

export function HostCardWithFollow({ host }: HostCardWithFollowProps) {
  const currentUserId = "user-current";
  const hostIsFollowing = isFollowing(currentUserId, host.id);
  const hostFollowsBack = isFollowing(host.id, currentUserId);
  const followersCount = getFollowers(host.id).length;

  // Get host profile for detailed verification info
  const hostProfile = getHostProfile(host.id);
  const verificationStatus = host.verificationStatus || hostProfile?.verification.status || (host.verified ? "verified" : "pending");

  const initials = getInitials(host.name);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-amber-100 text-amber-700 text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-lg">{host.name}</h3>
              {(verificationStatus === "verified" || verificationStatus === "premium") && (
                <HostVerificationBadge
                  status={verificationStatus}
                  verification={hostProfile?.verification}
                  size="sm"
                  showLabel={false}
                  showDetails={true}
                />
              )}
              {hostIsFollowing && hostFollowsBack && (
                <Badge variant="outline" className="border-green-200 text-green-700 text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Homie
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{host.rating}</span>
                <span>({host.reviewCount} opinii)</span>
              </div>
              <span>•</span>
              <span>{host.eventsHosted} wydarzeń</span>
              <span>•</span>
              <span>{followersCount} obserwujących</span>
            </div>

            {/* Host badges */}
            {host.badges && host.badges.length > 0 && (
              <div className="mb-3">
                <BadgeDisplay badgeIds={host.badges} size="sm" maxDisplay={5} />
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/profile/${host.id}`}>Zobacz profil</Link>
              </Button>
              <FollowButton
                userId={host.id}
                userName={host.name}
                isFollowing={hostIsFollowing}
                isFollowedBy={hostFollowsBack}
                size="sm"
              />
              <ReportDialog
                reportType="host"
                reportedEntityId={host.id}
                reportedEntityName={host.name}
                reporterRole="guest"
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-red-600"
                  >
                    <Flag className="h-4 w-4 mr-1" />
                    Zgłoś
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
