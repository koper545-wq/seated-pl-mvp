import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export interface AuthUser {
  id: string;
  email: string;
  userType: string;
}

/**
 * Get authenticated user from session.
 * Returns null if not authenticated.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email!,
    userType: session.user.userType as string,
  };
}

/**
 * Require authentication. Returns user or 401 response.
 * Verifies user exists in DB (handles stale JWT after re-seed).
 */
export async function requireAuth(): Promise<
  { user: AuthUser; error?: never } | { user?: never; error: NextResponse }
> {
  const sessionUser = await getAuthUser();
  if (!sessionUser) {
    return {
      error: NextResponse.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      ),
    };
  }

  // Verify user actually exists in DB (JWT may hold stale ID after re-seed)
  const dbUser = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, email: true, userType: true },
  });

  if (!dbUser) {
    return {
      error: NextResponse.json(
        { error: "Sesja wygasła. Wyloguj się i zaloguj ponownie." },
        { status: 401 }
      ),
    };
  }

  return { user: { id: dbUser.id, email: dbUser.email, userType: dbUser.userType } };
}

/**
 * Require host role. Returns user or error response.
 */
export async function requireHost(): Promise<
  { user: AuthUser; hostProfileId: string; error?: never } | { user?: never; hostProfileId?: never; error: NextResponse }
> {
  const result = await requireAuth();
  if (result.error) return result;

  const hostProfile = await db.hostProfile.findUnique({
    where: { userId: result.user.id },
    select: { id: true },
  });

  if (!hostProfile) {
    return {
      error: NextResponse.json(
        { error: "Wymagany profil hosta" },
        { status: 403 }
      ),
    };
  }

  return { user: result.user, hostProfileId: hostProfile.id };
}

/**
 * Require admin role. Returns user or error response.
 */
export async function requireAdmin(): Promise<
  { user: AuthUser; error?: never } | { user?: never; error: NextResponse }
> {
  const result = await requireAuth();
  if (result.error) return result;

  if (result.user.userType !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Wymagane uprawnienia administratora" },
        { status: 403 }
      ),
    };
  }

  return { user: result.user };
}
