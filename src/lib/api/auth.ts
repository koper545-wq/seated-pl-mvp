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
 */
export async function requireAuth(): Promise<
  { user: AuthUser; error?: never } | { user?: never; error: NextResponse }
> {
  const user = await getAuthUser();
  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      ),
    };
  }
  return { user };
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
