import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: LucideIcon;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionIcon: ActionIcon,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={`text-center ${compact ? "py-8" : "py-12"}`}>
      <div className={`rounded-full bg-muted flex items-center justify-center mx-auto ${compact ? "w-12 h-12 mb-3" : "w-16 h-16 mb-4"}`}>
        <Icon className={`text-muted-foreground ${compact ? "h-6 w-6" : "h-8 w-8"}`} />
      </div>
      <h3 className={`font-semibold ${compact ? "text-base mb-1" : "text-lg mb-2"}`}>{title}</h3>
      <p className={`text-muted-foreground ${compact ? "text-sm" : "mb-4 max-w-sm mx-auto"}`}>{description}</p>
      {actionLabel && actionHref && (
        <Button asChild className="bg-amber-600 hover:bg-amber-700 mt-4">
          <Link href={actionHref}>
            {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
            {actionLabel}
          </Link>
        </Button>
      )}
    </div>
  );
}
