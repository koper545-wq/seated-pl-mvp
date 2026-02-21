"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CheckCircle, Shield, Star, Clock, XCircle, AlertTriangle } from "lucide-react";
import { HostVerificationStatus, getVerificationBadgeInfo, HostVerification } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface HostVerificationBadgeProps {
  status: HostVerificationStatus;
  verification?: HostVerification;
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
  showDetails?: boolean;
  className?: string;
}

export function HostVerificationBadge({
  status,
  verification,
  size = "default",
  showLabel = true,
  showDetails = false,
  className,
}: HostVerificationBadgeProps) {
  const info = getVerificationBadgeInfo(status);

  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const badgeSizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    default: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const getIcon = () => {
    switch (status) {
      case "premium":
        return <Star className={cn(sizeClasses[size], "fill-current")} />;
      case "verified":
        return <CheckCircle className={sizeClasses[size]} />;
      case "pending":
        return <Clock className={sizeClasses[size]} />;
      case "rejected":
        return <XCircle className={sizeClasses[size]} />;
      case "suspended":
        return <AlertTriangle className={sizeClasses[size]} />;
    }
  };

  // Simple badge without details
  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                "gap-1 cursor-help transition-all",
                info.color,
                badgeSizeClasses[size],
                className
              )}
            >
              {getIcon()}
              {showLabel && <span>{info.label}</span>}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="font-medium">{info.label}</p>
            <p className="text-xs text-muted-foreground">{info.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed hover card with verification info
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "gap-1 cursor-help transition-all hover:shadow-md",
            info.color,
            badgeSizeClasses[size],
            className
          )}
        >
          {getIcon()}
          {showLabel && <span>{info.label}</span>}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="top">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-full", info.color)}>
              {getIcon()}
            </div>
            <div>
              <h4 className="font-semibold">{info.label}</h4>
              <p className="text-xs text-muted-foreground">
                {info.description}
              </p>
            </div>
          </div>

          {/* Verification details */}
          {verification && (status === "verified" || status === "premium") && (
            <div className="space-y-2 pt-2 border-t">
              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Weryfikacja obejmuje
              </h5>
              <div className="grid grid-cols-2 gap-2">
                <VerificationItem
                  label="Tożsamość"
                  verified={verification.identityVerified}
                />
                <VerificationItem
                  label="Lokalizacja"
                  verified={verification.locationVerified}
                />
                <VerificationItem
                  label="Bezpieczeństwo żywności"
                  verified={verification.foodSafetyVerified}
                />
                <VerificationItem
                  label="Weryfikacja osoby"
                  verified={verification.backgroundCheckPassed}
                />
              </div>
              {verification.verifiedAt && (
                <p className="text-xs text-muted-foreground pt-1">
                  Zweryfikowano: {new Date(verification.verifiedAt).toLocaleDateString("pl-PL")}
                </p>
              )}
            </div>
          )}

          {/* Pending info */}
          {status === "pending" && verification && (
            <div className="space-y-2 pt-2 border-t">
              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Status weryfikacji
              </h5>
              <div className="grid grid-cols-2 gap-2">
                <VerificationItem
                  label="Tożsamość"
                  verified={verification.identityVerified}
                />
                <VerificationItem
                  label="Lokalizacja"
                  verified={verification.locationVerified}
                />
                <VerificationItem
                  label="Bezpieczeństwo"
                  verified={verification.foodSafetyVerified}
                />
                <VerificationItem
                  label="Weryfikacja"
                  verified={verification.backgroundCheckPassed}
                />
              </div>
              {verification.notes && (
                <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                  {verification.notes}
                </p>
              )}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function VerificationItem({
  label,
  verified,
}: {
  label: string;
  verified: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {verified ? (
        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <Clock className="h-3.5 w-3.5 text-yellow-600" />
      )}
      <span className={cn("text-xs", verified ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </div>
  );
}

// Compact inline version for cards
export function VerifiedBadgeInline({
  verified,
  premium = false,
  className,
}: {
  verified: boolean;
  premium?: boolean;
  className?: string;
}) {
  if (!verified && !premium) return null;

  if (premium) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-amber-500",
                className
              )}
            >
              <Star className="h-4 w-4 fill-current" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Premium Host</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-green-600",
              className
            )}
          >
            <CheckCircle className="h-4 w-4" />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Zweryfikowany host</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Shield badge for trust indicators
export function TrustShieldBadge({
  className,
}: {
  className?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium",
              className
            )}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Zaufany host</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-medium">Zaufany host Seated</p>
          <p className="text-xs text-muted-foreground">
            Ten host przeszedł pełną weryfikację, ma świetne opinie i regularnie organizuje wydarzenia.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
