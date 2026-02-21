"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { ChefHat, UserPlus, Users, X } from "lucide-react";

interface SuggestedHomie {
  id: string;
  name: string;
  type: "user" | "host";
  reason: string;
  mutualCount: number;
}

interface SuggestedHomiesProps {
  suggestions: SuggestedHomie[];
  onFollow?: (userId: string) => void;
  onDismiss?: (userId: string) => void;
}

export function SuggestedHomies({
  suggestions: initialSuggestions,
  onFollow,
  onDismiss,
}: SuggestedHomiesProps) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

  const handleFollow = (id: string) => {
    setFollowedIds((prev) => new Set([...prev, id]));
    onFollow?.(id);
  };

  const handleDismiss = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    onDismiss?.(id);
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-amber-600" />
          Sugerowani do obserwowania
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion) => {
          const isFollowed = followedIds.has(suggestion.id);
          const initials = getInitials(suggestion.name);

          return (
            <div
              key={suggestion.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Link href={`/profile/${suggestion.id}`}>
                <Avatar className="h-12 w-12">
                  <AvatarFallback
                    className={
                      suggestion.type === "host"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-stone-100 text-stone-700"
                    }
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/profile/${suggestion.id}`}
                    className="font-medium text-sm hover:text-amber-600 transition-colors truncate"
                  >
                    {suggestion.name}
                  </Link>
                  {suggestion.type === "host" && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0">
                      <ChefHat className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {suggestion.reason}
                </p>
                {suggestion.mutualCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {suggestion.mutualCount} wspólnych znajomych
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1">
                {isFollowed ? (
                  <Badge variant="outline" className="border-green-200 text-green-700">
                    Obserwujesz
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-amber-600 border-amber-200 hover:bg-amber-50"
                    onClick={() => handleFollow(suggestion.id)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => handleDismiss(suggestion.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
