/**
 * MVP LITE Configuration
 *
 * Defines which routes and navigation items are available in MVP mode.
 * MVP mode strips down the platform to core booking functionality only.
 */

// Routes allowed in MVP LITE mode
export const MVP_ALLOWED_ROUTES = [
  // Public pages
  "/",
  "/events",
  "/events/[id]",
  "/login",
  "/register",
  "/how-it-works",

  // Guest dashboard (minimal)
  "/dashboard",
  "/dashboard/bookings",
  "/dashboard/settings",

  // Host dashboard (full panel)
  "/dashboard/host",
  "/dashboard/host/events",
  "/dashboard/host/events/new",
  "/dashboard/host/events/[id]",
  "/dashboard/host/events/[id]/edit",
  "/dashboard/host/events/[id]/guests",
  "/dashboard/host/events/[id]/feedback",
  "/dashboard/host/bookings",
  "/dashboard/host/calendar",
  "/dashboard/host/profile",
  "/dashboard/host/settings",
] as const;

// Navigation items hidden in MVP mode
export const MVP_HIDDEN_NAV_ITEMS = [
  "homies",
  "wishlist",
  "giftCards",
  "rewards",
  "social",
  "messages",
  "becomeHost",
] as const;

// Routes completely hidden in MVP mode (redirect to home or dashboard)
export const MVP_HIDDEN_ROUTES = [
  "/dashboard/homies",
  "/dashboard/wishlist",
  "/dashboard/social",
  "/dashboard/messages",
  "/gift-cards",
  "/rewards",
  "/become-host",
  "/admin",
] as const;

// Check if a route is allowed in MVP mode
export function isRouteAllowedInMVP(pathname: string): boolean {
  // Remove locale prefix if present (e.g., /pl/events -> /events)
  const pathWithoutLocale = pathname.replace(/^\/(pl|en)/, "") || "/";

  // Check exact matches first
  if (MVP_ALLOWED_ROUTES.includes(pathWithoutLocale as typeof MVP_ALLOWED_ROUTES[number])) {
    return true;
  }

  // Check pattern matches (for dynamic routes like /events/[id])
  const patterns = [
    /^\/events\/[^\/]+$/, // /events/[id]
    /^\/events\/[^\/]+\/book$/, // /events/[id]/book
    /^\/dashboard\/host\/events\/[^\/]+$/, // /dashboard/host/events/[id]
    /^\/dashboard\/host\/events\/[^\/]+\/edit$/, // /dashboard/host/events/[id]/edit
    /^\/dashboard\/host\/events\/[^\/]+\/guests$/, // /dashboard/host/events/[id]/guests
    /^\/dashboard\/host\/events\/[^\/]+\/feedback$/, // /dashboard/host/events/[id]/feedback
  ];

  return patterns.some((pattern) => pattern.test(pathWithoutLocale));
}

// Check if a navigation item should be hidden in MVP mode
export function isNavItemHiddenInMVP(itemKey: string): boolean {
  return MVP_HIDDEN_NAV_ITEMS.includes(itemKey as typeof MVP_HIDDEN_NAV_ITEMS[number]);
}

// Get redirect path for hidden routes
export function getMVPRedirectPath(pathname: string): string {
  const pathWithoutLocale = pathname.replace(/^\/(pl|en)/, "") || "/";

  // Dashboard routes redirect to dashboard
  if (pathWithoutLocale.startsWith("/dashboard")) {
    return "/dashboard";
  }

  // Other routes redirect to home
  return "/";
}
