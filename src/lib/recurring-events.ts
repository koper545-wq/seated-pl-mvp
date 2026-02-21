import { addWeeks, addMonths, isBefore, isEqual, format } from "date-fns";
import { pl } from "date-fns/locale";

export type RecurrencePattern = "weekly" | "biweekly" | "monthly";
export type EndCondition = "occurrences" | "date";

export interface RecurrenceConfig {
  startDate: Date;
  pattern: RecurrencePattern;
  endCondition: EndCondition;
  endDate?: Date;
  occurrences?: number;
}

/**
 * Generate a list of recurring dates based on the configuration
 * @param config - Recurrence configuration
 * @returns Array of Date objects for each event occurrence
 */
export function generateRecurringDates(config: RecurrenceConfig): Date[] {
  const dates: Date[] = [];
  let current = new Date(config.startDate);
  const maxEvents = 52; // Max 1 year of weekly events

  while (dates.length < maxEvents) {
    dates.push(new Date(current));

    // Check end condition: by number of occurrences
    if (config.endCondition === "occurrences") {
      if (dates.length >= (config.occurrences || 1)) break;
    }

    // Check end condition: by end date
    if (config.endCondition === "date" && config.endDate) {
      // Calculate next date to check if we should stop
      const next = getNextDate(current, config.pattern);
      if (!isBefore(next, config.endDate) && !isEqual(next, config.endDate)) {
        break;
      }
    }

    // Calculate next date
    current = getNextDate(current, config.pattern);
  }

  return dates;
}

/**
 * Get the next date based on the recurrence pattern
 */
function getNextDate(date: Date, pattern: RecurrencePattern): Date {
  switch (pattern) {
    case "weekly":
      return addWeeks(date, 1);
    case "biweekly":
      return addWeeks(date, 2);
    case "monthly":
      return addMonths(date, 1);
  }
}

/**
 * Format dates for preview display
 */
export function formatRecurringPreview(dates: Date[]): string[] {
  return dates.map((d) => format(d, "EEEE, d MMMM yyyy", { locale: pl }));
}

/**
 * Get pattern label in Polish
 */
export function getPatternLabel(pattern: RecurrencePattern): string {
  switch (pattern) {
    case "weekly":
      return "Co tydzień";
    case "biweekly":
      return "Co 2 tygodnie";
    case "monthly":
      return "Co miesiąc";
  }
}
