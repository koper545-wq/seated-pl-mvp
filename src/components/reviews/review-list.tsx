"use client";

import { useState } from "react";
import { ReviewCard } from "./review-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MockReview } from "@/lib/mock-data";
import { Star, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewListProps {
  reviews: MockReview[];
  showEventTitle?: boolean;
  showRatingSummary?: boolean;
  className?: string;
}

export function ReviewList({
  reviews,
  showEventTitle = false,
  showRatingSummary = true,
  className,
}: ReviewListProps) {
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "highest" | "lowest">("recent");
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Calculate rating summary
  const ratingSummary = reviews.reduce(
    (acc, review) => {
      acc.total += review.overallRating;
      acc.count++;
      acc.distribution[review.overallRating - 1]++;
      return acc;
    },
    { total: 0, count: 0, distribution: [0, 0, 0, 0, 0] }
  );

  const averageRating =
    ratingSummary.count > 0
      ? Math.round((ratingSummary.total / ratingSummary.count) * 10) / 10
      : 0;

  // Filter and sort reviews
  let displayReviews = [...reviews];

  if (filterRating !== null) {
    displayReviews = displayReviews.filter(
      (r) => r.overallRating === filterRating
    );
  }

  switch (sortBy) {
    case "recent":
      displayReviews.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      break;
    case "helpful":
      displayReviews.sort((a, b) => b.helpfulCount - a.helpfulCount);
      break;
    case "highest":
      displayReviews.sort((a, b) => b.overallRating - a.overallRating);
      break;
    case "lowest":
      displayReviews.sort((a, b) => a.overallRating - b.overallRating);
      break;
  }

  if (reviews.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Brak opinii</h3>
        <p className="text-muted-foreground">
          Ten host jeszcze nie ma żadnych opinii.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Rating Summary */}
      {showRatingSummary && (
        <div className="bg-muted/30 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Average rating */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <span className="text-4xl font-bold">{averageRating}</span>
                <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                Na podstawie {ratingSummary.count}{" "}
                {ratingSummary.count === 1
                  ? "opinii"
                  : ratingSummary.count < 5
                  ? "opinii"
                  : "opinii"}
              </p>
            </div>

            {/* Rating distribution */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingSummary.distribution[rating - 1];
                const percentage =
                  ratingSummary.count > 0
                    ? (count / ratingSummary.count) * 100
                    : 0;

                return (
                  <button
                    key={rating}
                    onClick={() =>
                      setFilterRating(filterRating === rating ? null : rating)
                    }
                    className={cn(
                      "flex items-center gap-2 w-full group",
                      filterRating === rating && "opacity-100",
                      filterRating !== null &&
                        filterRating !== rating &&
                        "opacity-50"
                    )}
                  >
                    <span className="text-sm font-medium w-3">{rating}</span>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all group-hover:bg-amber-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {filterRating !== null && (
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterRating(null)}
                className="text-amber-600"
              >
                Pokaż wszystkie opinie
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Sort and filter controls */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {displayReviews.length}{" "}
          {displayReviews.length === 1
            ? "opinia"
            : displayReviews.length < 5
            ? "opinie"
            : "opinii"}
          {filterRating !== null && ` z oceną ${filterRating}`}
        </p>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select
            value={sortBy}
            onValueChange={(value) =>
              setSortBy(value as "recent" | "helpful" | "highest" | "lowest")
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Najnowsze</SelectItem>
              <SelectItem value="helpful">Najbardziej pomocne</SelectItem>
              <SelectItem value="highest">Najwyższa ocena</SelectItem>
              <SelectItem value="lowest">Najniższa ocena</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {displayReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            showEventTitle={showEventTitle}
          />
        ))}
      </div>

      {displayReviews.length === 0 && filterRating !== null && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Brak opinii z oceną {filterRating} gwiazdek
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilterRating(null)}
            className="mt-2 text-amber-600"
          >
            Pokaż wszystkie opinie
          </Button>
        </div>
      )}
    </div>
  );
}
