import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api/auth";
import { serverError } from "@/lib/api/errors";

// GET /api/admin/stats — platform statistics
export async function GET() {
  try {
    const result = await requireAdmin();
    if (result.error) return result.error;

    const [
      totalUsers,
      totalHosts,
      totalEvents,
      activeEvents,
      totalBookings,
      completedTransactions,
      recentUsers,
    ] = await Promise.all([
      db.user.count(),
      db.hostProfile.count(),
      db.event.count(),
      db.event.count({ where: { status: "PUBLISHED", date: { gte: new Date() } } }),
      db.booking.count(),
      db.transaction.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    const totalRevenue = completedTransactions._sum.amount || 0;

    // Monthly revenue (this month's transactions)
    const monthlyTransactions = await db.transaction.aggregate({
      where: {
        status: "COMPLETED",
        processedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { amount: true },
    });

    const monthlyRevenue = monthlyTransactions._sum.amount || 0;

    return NextResponse.json({
      totalUsers,
      totalHosts,
      totalEvents,
      activeEventsThisMonth: activeEvents,
      totalBookings,
      totalRevenue,
      monthlyRevenue,
      newUsersThisMonth: recentUsers,
      pendingHostApplications: 0, // No application model in MVP
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return serverError();
  }
}
