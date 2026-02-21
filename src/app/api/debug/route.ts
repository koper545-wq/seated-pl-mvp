import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const checks: Record<string, unknown> = {};

  // Check env vars (just existence, not values)
  checks.envVars = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    DIRECT_URL: !!process.env.DIRECT_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
  };

  // Check DB connection
  try {
    const userCount = await db.user.count();
    checks.database = { connected: true, userCount };
  } catch (error) {
    checks.database = {
      connected: false,
      error: (error as Error).message,
    };
  }

  return NextResponse.json(checks);
}
