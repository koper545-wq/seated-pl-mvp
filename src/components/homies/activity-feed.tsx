"use client";

import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HomieActivity } from "@/lib/mock-data";
import { Calendar, Star, Award, ChefHat } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

interface ActivityFeedProps {
  activities: HomieActivity[];
  title?: string;
  emptyMessage?: string;
}

export function ActivityFeed({
  activities,
  title = "Aktywność Homies",
  emptyMessage = "Brak aktywności. Zaobserwuj więcej osób!",
}: ActivityFeedProps) {
  const getActivityIcon = (type: HomieActivity["type"]) => {
    switch (type) {
      case "attended_event":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "reviewed":
        return <Star className="h-4 w-4 text-amber-600" />;
      case "hosted_event":
        return <ChefHat className="h-4 w-4 text-rose-600" />;
      case "earned_badge":
        return <Award className="h-4 w-4 text-purple-600" />;
    }
  };

  const getActivityText = (activity: HomieActivity) => {
    switch (activity.type) {
      case "attended_event":
        return (
          <>
            uczestniczył(a) w{" "}
            <Link
              href={`/events/${activity.eventId}`}
              className="font-medium text-foreground hover:text-amber-600"
            >
              {activity.eventTitle}
            </Link>
          </>
        );
      case "reviewed":
        return (
          <>
            dodał(a) opinię o{" "}
            <Link
              href={`/events/${activity.eventId}`}
              className="font-medium text-foreground hover:text-amber-600"
            >
              {activity.eventTitle}
            </Link>
          </>
        );
      case "hosted_event":
        return (
          <>
            zorganizował(a){" "}
            <Link
              href={`/events/${activity.eventId}`}
              className="font-medium text-foreground hover:text-amber-600"
            >
              {activity.eventTitle}
            </Link>
          </>
        );
      case "earned_badge":
        return (
          <>
            zdobył(a) odznakę{" "}
            <Badge variant="secondary" className="ml-1">
              {activity.badgeName}
            </Badge>
          </>
        );
    }
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              {activity.userAvatar ? (
                <AvatarImage src={activity.userAvatar} alt={activity.userName} />
              ) : null}
              <AvatarFallback className="bg-amber-100 text-amber-700 text-sm">
                {activity.userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-semibold">{activity.userName}</span>{" "}
                <span className="text-muted-foreground">
                  {getActivityText(activity)}
                </span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                {getActivityIcon(activity.type)}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.createdAt, {
                    addSuffix: true,
                    locale: pl,
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
