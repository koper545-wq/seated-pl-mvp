"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SaveEventButtonProps {
  eventId: string;
  eventTitle: string;
  isSaved: boolean;
  isSoldOut?: boolean;
  notifyOnAvailable?: boolean;
  onSave?: (eventId: string) => void;
  onUnsave?: (eventId: string) => void;
  onToggleNotify?: (eventId: string, notify: boolean) => void;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
  showLabel?: boolean;
  className?: string;
}

export function SaveEventButton({
  eventId,
  eventTitle,
  isSaved: initialIsSaved,
  isSoldOut = false,
  notifyOnAvailable: initialNotify = false,
  onSave,
  onUnsave,
  onToggleNotify,
  size = "default",
  variant = "outline",
  showLabel = true,
  className,
}: SaveEventButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [notifyOnAvailable, setNotifyOnAvailable] = useState(initialNotify);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveToggle = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (isSaved) {
      setIsSaved(false);
      setNotifyOnAvailable(false);
      onUnsave?.(eventId);
    } else {
      setIsSaved(true);
      onSave?.(eventId);
    }

    setIsLoading(false);
  };

  const handleNotifyToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSaved) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const newValue = !notifyOnAvailable;
    setNotifyOnAvailable(newValue);
    onToggleNotify?.(eventId, newValue);

    setIsLoading(false);
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isSaved ? "default" : variant}
              size={size}
              onClick={handleSaveToggle}
              disabled={isLoading}
              className={cn(
                "transition-all",
                isSaved && "bg-rose-500 hover:bg-rose-600 text-white"
              )}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  showLabel && "mr-2",
                  isSaved && "fill-current"
                )}
              />
              {showLabel && (isSaved ? "Zapisane" : "Zapisz")}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isSaved ? "Usuń z listy życzeń" : "Dodaj do listy życzeń"}
          </TooltipContent>
        </Tooltip>

        {/* Notify button for sold out events */}
        {isSaved && isSoldOut && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={notifyOnAvailable ? "default" : "outline"}
                size="icon"
                onClick={handleNotifyToggle}
                disabled={isLoading}
                className={cn(
                  "h-9 w-9",
                  notifyOnAvailable && "bg-amber-500 hover:bg-amber-600 text-white"
                )}
              >
                {notifyOnAvailable ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {notifyOnAvailable
                ? "Powiadomienia włączone"
                : "Powiadom gdy zwolni się miejsce"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
