"use client";

import { Badge } from "@/components/ui/badge";
import { SocialSentiment, getSentimentLabel } from "@/lib/mock-data";

interface SentimentBadgeProps {
  sentiment: SocialSentiment;
  size?: "sm" | "default";
}

export function SentimentBadge({ sentiment, size = "default" }: SentimentBadgeProps) {
  const label = getSentimentLabel(sentiment);

  return (
    <Badge
      variant="outline"
      className={`${label.color} border-0 ${size === "sm" ? "text-xs px-2 py-0.5" : "px-3 py-1"}`}
    >
      <span className="mr-1">{label.emoji}</span>
      {label.pl}
    </Badge>
  );
}
