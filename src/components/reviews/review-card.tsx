"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MockReview } from "@/lib/mock-data";
import {
  Star,
  ThumbsUp,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: MockReview;
  showEventTitle?: boolean;
}

export function ReviewCard({ review, showEventTitle = false }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [helpful, setHelpful] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-gray-200"
            )}
          />
        ))}
      </div>
    );
  };

  const isLongText = review.text.length > 200;
  const displayText = expanded ? review.text : review.text.slice(0, 200);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-amber-100 text-amber-700">
                {review.authorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{review.authorName}</span>
                {review.verifiedAttendee && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                    Zweryfikowany
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(review.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {renderStars(review.overallRating)}
          </div>
        </div>

        {/* Event title if shown */}
        {showEventTitle && (
          <p className="text-sm text-muted-foreground mb-3">
            Wydarzenie:{" "}
            <span className="font-medium text-foreground">
              {review.eventTitle}
            </span>
          </p>
        )}

        {/* Review text */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {displayText}
          {isLongText && !expanded && "..."}
        </p>

        {isLongText && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-amber-600 hover:text-amber-700 p-0 h-auto mb-4"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Zwiń
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Czytaj więcej
              </>
            )}
          </Button>
        )}

        {/* Detailed ratings */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Jedzenie</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-sm">{review.foodRating}</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Komunikacja</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-sm">
                {review.communicationRating}
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Wartość</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-sm">{review.valueRating}</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Atmosfera</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-sm">
                {review.ambianceRating}
              </span>
            </div>
          </div>
        </div>

        {/* Host response */}
        {review.response && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-amber-600" />
              <span className="font-semibold text-sm">Odpowiedź hosta</span>
              {review.respondedAt && (
                <span className="text-xs text-muted-foreground">
                  · {formatDate(review.respondedAt)}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{review.response}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-muted-foreground hover:text-foreground",
              helpful && "text-amber-600"
            )}
            onClick={() => setHelpful(!helpful)}
          >
            <ThumbsUp
              className={cn("h-4 w-4 mr-1", helpful && "fill-current")}
            />
            Pomocna ({helpful ? review.helpfulCount + 1 : review.helpfulCount})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
