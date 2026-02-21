// API endpoint to process and send reminders
// This should be called by a cron job (e.g., every 30 minutes)
//
// In production, set up a cron job or use Vercel Cron:
// vercel.json: { "crons": [{ "path": "/api/reminders/process", "schedule": "*/30 * * * *" }] }

import { NextRequest, NextResponse } from "next/server";
import { processReminders, getPendingReminders } from "@/lib/reminders";

// Simple auth token for cron jobs (in production use proper auth)
const CRON_SECRET = process.env.CRON_SECRET || "dev-secret";

export async function GET(request: NextRequest) {
  // Verify the request is authorized (for cron jobs)
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  // Allow access with either auth header or query token (for testing)
  const isAuthorized =
    authHeader === `Bearer ${CRON_SECRET}` ||
    token === CRON_SECRET ||
    process.env.NODE_ENV === "development";

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Preview mode - just show what would be sent
    if (searchParams.get("preview") === "true") {
      const pending = getPendingReminders();
      return NextResponse.json({
        preview: true,
        pendingReminders: pending.map((r) => ({
          id: r.id,
          type: r.reminderType,
          guestEmail: r.guestEmail,
          eventTitle: r.eventTitle,
          scheduledFor: r.scheduledFor.toISOString(),
        })),
      });
    }

    // Process reminders
    const result = await processReminders();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing reminders:", error);
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}

// POST method for manual trigger
export async function POST(request: NextRequest) {
  return GET(request);
}
