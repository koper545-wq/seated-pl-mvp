"use client";

import { Zap, ZapOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMVPMode } from "@/contexts/mvp-mode-context";
import { cn } from "@/lib/utils";

export function MVPModeSwitcher() {
  const { mvpMode, toggleMVPMode, isLoaded } = useMVPMode();

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-20 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMVPMode}
              className={cn(
                "gap-2 transition-all",
                mvpMode
                  ? "bg-amber-50 border-amber-400 hover:bg-amber-100 text-amber-700"
                  : "bg-stone-50 border-stone-300 hover:bg-stone-100 text-stone-600"
              )}
            >
              {mvpMode ? (
                <>
                  <Zap className="h-4 w-4 fill-amber-500" />
                  <span className="text-xs font-medium">MVP</span>
                </>
              ) : (
                <>
                  <ZapOff className="h-4 w-4" />
                  <span className="text-xs">Full</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" align="start">
            <p className="text-sm">
              {mvpMode
                ? "Wersja MVP LITE - tylko rezerwacje"
                : "Pełna wersja platformy"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Kliknij aby przełączyć
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
