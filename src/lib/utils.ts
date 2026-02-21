import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price from grosze (cents) to PLN string
 * @param priceInGrosze - Price in grosze (1 PLN = 100 groszy)
 * @returns Formatted price string like "150 PLN"
 */
export function formatPrice(priceInGrosze: number): string {
  return `${(priceInGrosze / 100).toFixed(0)} PLN`;
}

/**
 * Get initials from a full name
 * @param name - Full name (e.g., "Jan Kowalski")
 * @returns Initials (e.g., "JK")
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
