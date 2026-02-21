"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, UtensilsCrossed, Sparkles, MessageCircle, Wallet, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingCategory {
  name: string;
  nameEn: string;
  value: number;
  icon?: React.ReactNode;
}

interface RatingBreakdownData {
  overall: number;
  totalReviews: number;
  categories: RatingCategory[];
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface RatingBreakdownProps {
  data: RatingBreakdownData;
  showDistribution?: boolean;
  showCategories?: boolean;
  compact?: boolean;
  className?: string;
}

// Rating stars component
export function RatingStars({
  rating,
  max = 5,
  size = "default",
  showValue = false,
  className,
}: {
  rating: number;
  max?: number;
  size?: "sm" | "default" | "lg";
  showValue?: boolean;
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(max)].map((_, i) => {
        const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100;

        return (
          <div key={i} className="relative">
            <Star className={cn(sizeClasses[size], "text-stone-200")} />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star
                className={cn(sizeClasses[size], "text-amber-400 fill-amber-400")}
              />
            </div>
          </div>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

// Rating bar for distribution
export function RatingBar({
  stars,
  count,
  total,
  className,
}: {
  stars: number;
  count: number;
  total: number;
  className?: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm w-4 text-muted-foreground">{stars}</span>
      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
      <div className="flex-1">
        <Progress value={percentage} className="h-2" />
      </div>
      <span className="text-sm w-8 text-right text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

// Individual category rating
export function CategoryRating({
  name,
  value,
  icon,
  showBar = true,
  className,
}: {
  name: string;
  value: number;
  icon?: React.ReactNode;
  showBar?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="text-sm font-medium">{name}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold">{value.toFixed(1)}</span>
          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
        </div>
      </div>
      {showBar && (
        <Progress value={(value / 5) * 100} className="h-1.5" />
      )}
    </div>
  );
}

// Main rating breakdown component
export function RatingBreakdown({
  data,
  showDistribution = true,
  showCategories = true,
  compact = false,
  className,
}: RatingBreakdownProps) {
  const totalDistribution = Object.values(data.distribution).reduce((a, b) => a + b, 0);

  const getCategoryIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("jedzenie") || lowerName.includes("food")) {
      return <UtensilsCrossed className="h-4 w-4" />;
    }
    if (lowerName.includes("atmosfera") || lowerName.includes("atmosphere")) {
      return <Sparkles className="h-4 w-4" />;
    }
    if (lowerName.includes("komunikacja") || lowerName.includes("communication")) {
      return <MessageCircle className="h-4 w-4" />;
    }
    if (lowerName.includes("wartość") || lowerName.includes("value") || lowerName.includes("cena")) {
      return <Wallet className="h-4 w-4" />;
    }
    return <ThumbsUp className="h-4 w-4" />;
  };

  if (compact) {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Overall rating */}
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold">{data.overall.toFixed(1)}</div>
          <div>
            <RatingStars rating={data.overall} />
            <p className="text-sm text-muted-foreground mt-0.5">
              {data.totalReviews} opinii
            </p>
          </div>
        </div>

        {/* Categories in a row */}
        {showCategories && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {data.categories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1 text-sm">
                {getCategoryIcon(cat.name)}
                <span className="text-muted-foreground">{cat.name}:</span>
                <span className="font-medium">{cat.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
          Oceny i opinie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall rating */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-stone-900">
              {data.overall.toFixed(1)}
            </div>
            <RatingStars rating={data.overall} size="lg" className="justify-center mt-1" />
            <p className="text-sm text-muted-foreground mt-1">
              {data.totalReviews} opinii
            </p>
          </div>

          {/* Distribution */}
          {showDistribution && (
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((stars) => (
                <RatingBar
                  key={stars}
                  stars={stars}
                  count={data.distribution[stars as keyof typeof data.distribution]}
                  total={totalDistribution}
                />
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        {showCategories && data.categories.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Szczegółowe oceny
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.categories.map((category) => (
                <CategoryRating
                  key={category.name}
                  name={category.name}
                  value={category.value}
                  icon={category.icon || getCategoryIcon(category.name)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Demo data for testing
export const demoRatingBreakdown: RatingBreakdownData = {
  overall: 4.8,
  totalReviews: 47,
  categories: [
    { name: "Jedzenie", nameEn: "Food", value: 4.9 },
    { name: "Atmosfera", nameEn: "Atmosphere", value: 4.7 },
    { name: "Komunikacja", nameEn: "Communication", value: 4.9 },
    { name: "Stosunek ceny do jakości", nameEn: "Value for money", value: 4.6 },
  ],
  distribution: {
    5: 35,
    4: 8,
    3: 3,
    2: 1,
    1: 0,
  },
};
