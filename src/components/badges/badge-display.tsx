"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MockBadge, badges, getHostBadges } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface BadgeDisplayProps {
  badgeIds: string[];
  size?: "sm" | "md" | "lg";
  maxDisplay?: number;
  showTooltip?: boolean;
  className?: string;
}

export function BadgeDisplay({
  badgeIds,
  size = "md",
  maxDisplay = 5,
  showTooltip = true,
  className,
}: BadgeDisplayProps) {
  const hostBadges = getHostBadges(badgeIds);
  const displayBadges = hostBadges.slice(0, maxDisplay);
  const remainingCount = hostBadges.length - maxDisplay;

  const sizeClasses = {
    sm: "w-6 h-6 text-sm",
    md: "w-8 h-8 text-base",
    lg: "w-10 h-10 text-lg",
  };

  if (hostBadges.length === 0) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("flex items-center gap-1", className)}>
        {displayBadges.map((badge) => (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "rounded-full flex items-center justify-center cursor-default",
                  sizeClasses[size],
                  badge.color
                )}
              >
                <span>{badge.icon}</span>
              </div>
            </TooltipTrigger>
            {showTooltip && (
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p className="font-semibold">{badge.namePl}</p>
                <p className="text-xs text-muted-foreground">
                  {badge.descriptionPl}
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        ))}
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "rounded-full flex items-center justify-center bg-muted text-muted-foreground font-medium cursor-default",
                  sizeClasses[size]
                )}
              >
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">i {remainingCount} więcej</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

// Full badge list component for profile pages
interface BadgeListProps {
  badgeIds: string[];
  className?: string;
}

export function BadgeList({ badgeIds, className }: BadgeListProps) {
  const hostBadges = getHostBadges(badgeIds);

  if (hostBadges.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="font-semibold text-lg">Odznaki</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {hostBadges.map((badge) => (
          <div
            key={badge.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg",
              badge.color.replace("text-", "").split(" ")[0] // Use only bg color
            )}
          >
            <span className="text-2xl">{badge.icon}</span>
            <div>
              <p className="font-medium text-sm">{badge.namePl}</p>
              <p className="text-xs opacity-75">{badge.descriptionPl}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
