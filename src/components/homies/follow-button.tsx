"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, UserMinus, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  userId: string;
  userName: string;
  isFollowing: boolean;
  isFollowedBy: boolean;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline";
  showMutualBadge?: boolean;
  className?: string;
}

export function FollowButton({
  userId,
  userName,
  isFollowing: initialIsFollowing,
  isFollowedBy,
  onFollow,
  onUnfollow,
  size = "default",
  variant = "default",
  showMutualBadge = true,
  className,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isMutual = isFollowing && isFollowedBy;

  const handleClick = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (isFollowing) {
      setIsFollowing(false);
      onUnfollow?.(userId);
    } else {
      setIsFollowing(true);
      onFollow?.(userId);
    }

    setIsLoading(false);
  };

  // Determine button appearance
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <span className="animate-spin mr-2">⏳</span>
          {isFollowing ? "..." : "..."}
        </>
      );
    }

    if (isFollowing) {
      if (isHovered) {
        return (
          <>
            <UserMinus className="h-4 w-4 mr-2" />
            Przestań obserwować
          </>
        );
      }
      if (isMutual && showMutualBadge) {
        return (
          <>
            <Users className="h-4 w-4 mr-2" />
            Homies
          </>
        );
      }
      return (
        <>
          <UserCheck className="h-4 w-4 mr-2" />
          Obserwujesz
        </>
      );
    }

    if (isFollowedBy) {
      return (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Obserwuj też
        </>
      );
    }

    return (
      <>
        <UserPlus className="h-4 w-4 mr-2" />
        Obserwuj
      </>
    );
  };

  const getButtonVariant = () => {
    if (isFollowing) {
      if (isHovered) {
        return "destructive" as const;
      }
      if (isMutual) {
        return "secondary" as const;
      }
      return "outline" as const;
    }
    return variant === "outline" ? ("outline" as const) : ("default" as const);
  };

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading}
      className={cn(
        "transition-all duration-200",
        isFollowing && !isHovered && "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
        isMutual && !isHovered && "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
        !isFollowing && variant === "default" && "bg-amber-600 hover:bg-amber-700",
        className
      )}
    >
      {getButtonContent()}
    </Button>
  );
}
